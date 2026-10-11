# scripts/regression-check.ps1
# Windows one-click regression check:
# 1) optional infra startup
# 2) build api + web
# 3) start api + web
# 4) check key APIs and page reachability
# 5) stop services and print summary

param(
    [switch]$SkipInfraStartup,
    [switch]$SkipBuild,
    [switch]$KeepRunning,
    [int]$StartupTimeoutSec = 120
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    Write-Host "[STEP] $Name"
    $global:LASTEXITCODE = 0
    & $Action

    if (-not $?) {
        throw "Step failed: $Name"
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Step failed with exit code ${LASTEXITCODE}: $Name"
    }

    Write-Host "[OK]   $Name"
}

function Wait-HttpReady {
    param(
        [string]$Url,
        [int]$TimeoutSec = 60,
        [System.Diagnostics.Process]$Process
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if ($Process -and $Process.HasExited) {
            return $false
        }

        try {
            $resp = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -UseBasicParsing
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }

    return $false
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url
    )

    try {
        $resp = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -UseBasicParsing
        return [PSCustomObject]@{
            Name = $Name
            Url = $Url
            Status = $resp.StatusCode
            Pass = ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400)
            Error = ""
        }
    } catch {
        $statusCode = "ERR"
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }

        return [PSCustomObject]@{
            Name = $Name
            Url = $Url
            Status = $statusCode
            Pass = $false
            Error = $_.Exception.Message
        }
    }
}

function Assert-DatabaseEnv {
    $env:NODE_ENV = 'production'

    if ($env:DATABASE_URL) {
        return
    }

    $rootEnvFile = Join-Path $repoRoot '.env'
    $fallbackEnvExample = Join-Path $repoRoot '.env.example'

    if (-not (Test-Path $rootEnvFile) -and (Test-Path $fallbackEnvExample)) {
        Write-Host '[WARN] .env not found, loading environment from .env.example for this run'

        $lines = Get-Content $fallbackEnvExample
        foreach ($line in $lines) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            if ($line.TrimStart().StartsWith('#')) { continue }
            if ($line -notmatch '=') { continue }

            $pair = $line.Split('=', 2)
            $key = $pair[0].Trim()
            $value = $pair[1]
            if (-not [string]::IsNullOrWhiteSpace($key) -and -not (Test-Path "Env:$key")) {
                Set-Item -Path "Env:$key" -Value $value
            }
        }
    }

    if ($env:DATABASE_URL) {
        return
    }

    if (-not (Test-Path $rootEnvFile)) {
        throw "Missing .env at repo root and DATABASE_URL is unavailable. Copy .env.example to .env and set DATABASE_URL before running regression checks."
    }

    $hasDatabaseUrl = Select-String -Path $rootEnvFile -Pattern '^\s*DATABASE_URL\s*=' -Quiet
    if (-not $hasDatabaseUrl) {
        throw "DATABASE_URL is not configured in .env. Please set it before running regression checks."
    }
}

function Assert-DatabaseReachable {
    param(
        [switch]$SkipIfMissing
    )

    $canConnect = $false
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect('localhost', 5432, $null, $null)
        $canConnect = $iar.AsyncWaitHandle.WaitOne(1500)
        if ($canConnect -and $client.Connected) {
            $client.EndConnect($iar) | Out-Null
            $client.Close()
            return
        }
        $client.Close()
    } catch {
    }

    if ($SkipIfMissing) {
        throw 'Database is not reachable on localhost:5432. Start PostgreSQL first, or run the script without -SkipInfraStartup.'
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

$apiProc = $null
$webProc = $null
$runId = Get-Date -Format "yyyyMMdd-HHmmss"
$apiOutLog = Join-Path $repoRoot "tmp-regression-$runId-api.out.log"
$apiErrLog = Join-Path $repoRoot "tmp-regression-$runId-api.err.log"
$webOutLog = Join-Path $repoRoot "tmp-regression-$runId-web.out.log"
$webErrLog = Join-Path $repoRoot "tmp-regression-$runId-web.err.log"

try {
    Invoke-Step -Name "Validate environment variables" -Action {
        Assert-DatabaseEnv
    }

    if (-not $SkipInfraStartup) {
        if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
            throw 'Docker command not found. Install Docker Desktop, or run with -SkipInfraStartup and ensure PostgreSQL is already running.'
        }

        Invoke-Step -Name "Start infra services" -Action {
            npm run start:infra
        }
    } else {
        Write-Host "[INFO] Skip infra startup"
        Invoke-Step -Name "Validate database reachability" -Action {
            Assert-DatabaseReachable -SkipIfMissing
        }
    }

    if (-not $SkipBuild) {
        Invoke-Step -Name "Build API" -Action {
            npm run build:api
        }

        Invoke-Step -Name "Build Web" -Action {
            npm run build:web
        }
    } else {
        Write-Host "[INFO] Skip build"
    }

    Invoke-Step -Name "Start API service" -Action {
        $apiProc = Start-Process -FilePath "cmd.exe" -ArgumentList @(
            "/c",
            "npm run start -w apps/api"
        ) -WorkingDirectory $repoRoot -RedirectStandardOutput $apiOutLog -RedirectStandardError $apiErrLog -PassThru
    }

    Invoke-Step -Name "Start Web service" -Action {
        $webProc = Start-Process -FilePath "cmd.exe" -ArgumentList @(
            "/c",
            "npm run start -w apps/web"
        ) -WorkingDirectory $repoRoot -RedirectStandardOutput $webOutLog -RedirectStandardError $webErrLog -PassThru
    }

    Write-Host "[INFO] Waiting for API ready..."
    if (-not (Wait-HttpReady -Url "http://localhost:3001/api/v1/health" -TimeoutSec $StartupTimeoutSec -Process $apiProc)) {
        Write-Host "[ERROR] API startup failed or timed out"
        if (Test-Path $apiOutLog) {
            Write-Host "---- API stdout (tail) ----"
            Get-Content $apiOutLog -Tail 40
        }
        if (Test-Path $apiErrLog) {
            Write-Host "---- API stderr (tail) ----"
            Get-Content $apiErrLog -Tail 40
        }
        throw "API did not become ready within timeout"
    }

    Write-Host "[INFO] Waiting for Web ready..."
    if (-not (Wait-HttpReady -Url "http://localhost:3000/" -TimeoutSec $StartupTimeoutSec -Process $webProc)) {
        Write-Host "[ERROR] Web startup failed or timed out"
        if (Test-Path $webOutLog) {
            Write-Host "---- Web stdout (tail) ----"
            Get-Content $webOutLog -Tail 40
        }
        if (Test-Path $webErrLog) {
            Write-Host "---- Web stderr (tail) ----"
            Get-Content $webErrLog -Tail 40
        }
        throw "Web did not become ready within timeout"
    }

    $checks = @(
        @{ Name = "API Health"; Url = "http://localhost:3001/api/v1/health" },
        @{ Name = "API Tools"; Url = "http://localhost:3001/api/v1/tools?limit=1" },
        @{ Name = "API Categories"; Url = "http://localhost:3001/api/v1/categories" },
        @{ Name = "API Case Daily"; Url = "http://localhost:3001/api/v1/cases/daily" },
        @{ Name = "API Search"; Url = "http://localhost:3001/api/v1/search?q=chatgpt&limit=5" },
        @{ Name = "API Claw Featured"; Url = "http://localhost:3001/api/v1/claw/featured?limit=3" },
        @{ Name = "Web Home"; Url = "http://localhost:3000/" },
        @{ Name = "Web Tools"; Url = "http://localhost:3000/tools" },
        @{ Name = "Web Cases"; Url = "http://localhost:3000/cases" },
        @{ Name = "Web Claw"; Url = "http://localhost:3000/claw" },
        @{ Name = "Web Search"; Url = "http://localhost:3000/search?q=chatgpt" },
        @{ Name = "Web Admin"; Url = "http://localhost:3000/admin" }
    )

    Write-Host "[STEP] Run endpoint checks"
    $results = @()
    foreach ($c in $checks) {
        $r = Test-Endpoint -Name $c.Name -Url $c.Url
        $results += $r

        if ($r.Pass) {
            Write-Host "[PASS] $($r.Name) [$($r.Status)]"
        } else {
            Write-Host "[FAIL] $($r.Name) [$($r.Status)] $($r.Error)"
        }
    }

    $failed = @($results | Where-Object { -not $_.Pass })
    $passed = @($results | Where-Object { $_.Pass })

    Write-Host ""
    Write-Host "================ Regression Summary ================"
    Write-Host "Passed: $($passed.Count)"
    Write-Host "Failed: $($failed.Count)"
    Write-Host "===================================================="

    if ($failed.Count -gt 0) {
        Write-Host ""
        Write-Host "Failed checks:"
        $failed | Format-Table Name, Status, Url -AutoSize
        exit 1
    }

    Write-Host "[OK] Regression check passed"
    exit 0
}
finally {
    if (-not $KeepRunning) {
        if ($apiProc -and -not $apiProc.HasExited) {
            Stop-Process -Id $apiProc.Id -Force
            Write-Host "[INFO] API process stopped"
        }

        if ($webProc -and -not $webProc.HasExited) {
            Stop-Process -Id $webProc.Id -Force
            Write-Host "[INFO] Web process stopped"
        }
    } else {
        Write-Host "[INFO] KeepRunning enabled, services are left running"
    }

    Pop-Location
}
