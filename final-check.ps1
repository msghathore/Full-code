Write-Host "`n=== FINAL SYSTEM CHECK ===" -ForegroundColor Cyan

Write-Host "`n[*] Checking Claude CLI Sessions:" -ForegroundColor Yellow
$claudeProcesses = Get-Process -Name "claude" -ErrorAction SilentlyContinue
if ($claudeProcesses) {
    $totalMem = 0
    foreach ($proc in $claudeProcesses) {
        $memMB = [math]::Round($proc.WS/1MB,2)
        $totalMem += $memMB
        Write-Host "  PID $($proc.Id): $memMB MB" -ForegroundColor Gray
    }
    Write-Host "  Total: $($claudeProcesses.Count) sessions using $([math]::Round($totalMem,0)) MB" -ForegroundColor Green
} else {
    Write-Host "  No Claude sessions found" -ForegroundColor Yellow
}

Write-Host "`n[*] Checking OneDrive:" -ForegroundColor Yellow
$onedrive = Get-Process -Name "OneDrive" -ErrorAction SilentlyContinue
if ($onedrive) {
    Write-Host "  [WARN] OneDrive is still running!" -ForegroundColor Red
} else {
    Write-Host "  [OK] OneDrive is not running (removed successfully)" -ForegroundColor Green
}

Write-Host "`n[*] Checking Node.js processes:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Found $($nodeProcesses.Count) node process(es)" -ForegroundColor Yellow
} else {
    Write-Host "  [OK] No node processes running" -ForegroundColor Green
}

Write-Host "`n[*] Overall Memory Usage:" -ForegroundColor Yellow
$os = Get-CimInstance Win32_OperatingSystem
$totalMemGB = [math]::Round($os.TotalVisibleMemorySize/1MB,2)
$freeMemGB = [math]::Round($os.FreePhysicalMemory/1MB,2)
$usedMemGB = [math]::Round($totalMemGB - $freeMemGB,2)
$usagePercent = [math]::Round(($usedMemGB/$totalMemGB)*100,2)

Write-Host "  Total: $totalMemGB GB" -ForegroundColor Cyan
Write-Host "  Used: $usedMemGB GB ($usagePercent%)" -ForegroundColor $(if ($usagePercent -lt 80) { "Green" } else { "Yellow" })
Write-Host "  Free: $freeMemGB GB" -ForegroundColor Green

Write-Host "`n=== CHECK COMPLETE ===" -ForegroundColor Green
