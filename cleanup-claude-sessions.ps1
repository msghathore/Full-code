Write-Host "`n=== CLOSING OLD CLAUDE CLI SESSIONS ===" -ForegroundColor Cyan

# Get all Claude processes sorted by start time (newest first)
$claudeProcesses = Get-Process -Name "claude" -ErrorAction SilentlyContinue | Sort-Object StartTime -Descending

if (-not $claudeProcesses) {
    Write-Host "No Claude CLI sessions found" -ForegroundColor Yellow
    exit
}

Write-Host "`nFound $($claudeProcesses.Count) Claude CLI sessions:" -ForegroundColor Yellow

# Display all processes
$i = 1
foreach ($proc in $claudeProcesses) {
    $memMB = [math]::Round($proc.WS/1MB,2)
    $age = (Get-Date) - $proc.StartTime
    Write-Host "  $i. PID $($proc.Id): $memMB MB RAM, Age: $([math]::Round($age.TotalMinutes,0)) minutes"
    $i++
}

# Keep the 3 newest, kill the rest
if ($claudeProcesses.Count -gt 3) {
    Write-Host "`nKeeping 3 newest sessions, closing $($claudeProcesses.Count - 3) old session(s)..." -ForegroundColor Yellow

    $toClose = $claudeProcesses | Select-Object -Skip 3
    $freedMem = 0

    foreach ($proc in $toClose) {
        $memMB = [math]::Round($proc.WS/1MB,2)
        $freedMem += $memMB
        Write-Host "  Closing PID $($proc.Id) ($memMB MB)..." -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }

    Write-Host "`n[OK] Closed $($toClose.Count) old sessions, freed ~$([math]::Round($freedMem,0)) MB" -ForegroundColor Green
} else {
    Write-Host "`n[INFO] Only $($claudeProcesses.Count) sessions running, keeping all" -ForegroundColor Cyan
}

Write-Host "`n=== CLEANUP COMPLETE ===" -ForegroundColor Green
