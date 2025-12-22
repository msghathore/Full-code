# Disable OneDrive and Dell TechHub from startup

Write-Host "Disabling OneDrive and Dell bloatware..." -ForegroundColor Yellow

# Stop OneDrive
try {
    Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue
    Write-Host "✓ OneDrive stopped" -ForegroundColor Green
} catch {
    Write-Host "OneDrive not running" -ForegroundColor Gray
}

# Stop Dell TechHub processes
$dellProcesses = @('Dell.TechHub.Instrumentation.UserProcess', 'Dell.TechHub.Instrumentation.SubAgent')
foreach ($proc in $dellProcesses) {
    try {
        Stop-Process -Name $proc -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Stopped $proc" -ForegroundColor Green
    } catch {
        Write-Host "$proc not running" -ForegroundColor Gray
    }
}

# Disable from startup - User registry
$userRun = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$itemsToRemove = @('OneDrive', 'DellTechHub')
foreach ($item in $itemsToRemove) {
    try {
        Remove-ItemProperty -Path $userRun -Name $item -ErrorAction SilentlyContinue
        Write-Host "✓ Removed $item from user startup" -ForegroundColor Green
    } catch {
        Write-Host "$item not in user startup" -ForegroundColor Gray
    }
}

# Disable Dell TechHub scheduled tasks
Get-ScheduledTask | Where-Object { $_.TaskName -match 'TechHub' } | ForEach-Object {
    Disable-ScheduledTask -TaskName $_.TaskName -ErrorAction SilentlyContinue
    Write-Host "✓ Disabled scheduled task: $($_.TaskName)" -ForegroundColor Green
}

Write-Host "`n✓ Done! OneDrive and Dell bloatware disabled from startup." -ForegroundColor Cyan
Write-Host "They won't start automatically after next reboot." -ForegroundColor Cyan
