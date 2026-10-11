# scripts/stop-local.ps1
# Stop local app services listening on ports 3000 (web) and 3001 (api)

$ErrorActionPreference = 'Stop'

$ports = @(3000, 3001)
$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $ports -contains $_.LocalPort }

if (-not $connections) {
    Write-Host '[INFO] No local services found on ports 3000/3001'
    exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($procId in $pids) {
    try {
        Stop-Process -Id $procId -Force
        Write-Host "[OK] Stopped process PID=$procId"
    } catch {
        Write-Host "[WARN] Failed to stop PID=${procId}: $($_.Exception.Message)"
    }
}

Write-Host '[OK] Local services shutdown completed'
