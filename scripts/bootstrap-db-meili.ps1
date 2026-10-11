Param(
    [switch]$SkipInfraStartup
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $repoRoot 'apps/api'

function Test-CommandExists {
    Param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-Step {
    Param(
        [string]$Name,
        [scriptblock]$Action
    )
    Write-Host "`n==> $Name" -ForegroundColor Cyan
    & $Action
    if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
        throw "Step failed with exit code ${LASTEXITCODE}: $Name"
    }
}

Invoke-Step 'Load environment variables' {
    $envFile = Join-Path $repoRoot '.env'
    $fallback = Join-Path $repoRoot '.env.example'
    $source = if (Test-Path $envFile) { $envFile } elseif (Test-Path $fallback) { $fallback } else { $null }
    if (-not $source) {
        throw 'Missing .env and .env.example at repository root.'
    }

    Get-Content $source | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) { return }
        $pair = $line -split '=', 2
        if ($pair.Count -eq 2) {
            [Environment]::SetEnvironmentVariable($pair[0].Trim(), $pair[1].Trim(), 'Process')
        }
    }
}

if (-not $SkipInfraStartup) {
    Invoke-Step 'Start docker infra (postgres/meili/redis)' {
        if (-not (Test-CommandExists 'docker')) {
            throw 'Docker command not found. Install Docker Desktop or rerun with -SkipInfraStartup.'
        }
        Set-Location $repoRoot
        docker compose -f infra/docker-compose.yml up -d
    }
}

Invoke-Step 'Generate Prisma client' {
    Set-Location $apiDir
    npx prisma generate
}

Invoke-Step 'Apply migrations' {
    Set-Location $apiDir
    npx prisma migrate deploy
}

Invoke-Step 'Seed database' {
    Set-Location $apiDir
    npm run prisma:seed
}

Invoke-Step 'Sync tools to Meili index' {
    $adminKey = $env:ADMIN_SECRET
    if (-not $adminKey) {
        throw 'ADMIN_SECRET is missing in environment.'
    }

    $api = if ($env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL } else { 'http://localhost:3001/api/v1' }
    $url = "$api/admin/search/sync"
    try {
        Invoke-WebRequest -UseBasicParsing -Method Post -Uri $url -Headers @{ 'x-admin-key' = $adminKey } | Out-Null
        Write-Host "Synced Meili index via $url" -ForegroundColor Green
    } catch {
        Write-Warning "API is not running. Start API server then call POST $url with x-admin-key to sync later."
    }
}

Write-Host "`nBootstrap finished." -ForegroundColor Green
