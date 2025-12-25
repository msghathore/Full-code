Write-Host "`n=== AGGRESSIVE CLEANUP ===" -ForegroundColor Cyan

# Kill all node processes
Write-Host "`n[*] Stopping ALL Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $count = $nodeProcesses.Count
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] Stopped $count node process(es)" -ForegroundColor Green
} else {
    Write-Host "  [INFO] No node processes found" -ForegroundColor Cyan
}

# Get Claude processes and keep only 3 newest
Write-Host "`n[*] Managing Claude CLI sessions..." -ForegroundColor Yellow
$claudeProcesses = Get-Process -Name "claude" -ErrorAction SilentlyContinue | Sort-Object StartTime -Descending

if ($claudeProcesses -and $claudeProcesses.Count -gt 3) {
    Write-Host "  Found $($claudeProcesses.Count) sessions, keeping 3 newest..." -ForegroundColor Yellow

    $toKeep = $claudeProcesses | Select-Object -First 3
    $toClose = $claudeProcesses | Select-Object -Skip 3

    Write-Host "  Keeping PIDs: $($toKeep.Id -join ', ')" -ForegroundColor Green

    foreach ($proc in $toClose) {
        Write-Host "  Closing PID $($proc.Id)..." -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }

    Write-Host "  [OK] Closed $($toClose.Count) old sessions" -ForegroundColor Green
} elseif ($claudeProcesses) {
    Write-Host "  [INFO] Only $($claudeProcesses.Count) sessions, keeping all" -ForegroundColor Cyan
} else {
    Write-Host "  [INFO] No Claude sessions found" -ForegroundColor Cyan
}

# Force garbage collection
Write-Host "`n[*] Running memory cleanup..." -ForegroundColor Yellow
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
Write-Host "  [OK] Memory cleanup complete" -ForegroundColor Green

Write-Host "`n=== CLEANUP COMPLETE ===" -ForegroundColor Green
