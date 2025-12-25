Write-Host "`n=== REMOVING ONEDRIVE PERMANENTLY ===" -ForegroundColor Cyan

# Step 1: Kill OneDrive process
Write-Host "`n[*] Stopping OneDrive process..." -ForegroundColor Yellow
$onedrive = Get-Process -Name "OneDrive" -ErrorAction SilentlyContinue
if ($onedrive) {
    Stop-Process -Name "OneDrive" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  [OK] OneDrive process stopped" -ForegroundColor Green
} else {
    Write-Host "  [INFO] OneDrive process not running" -ForegroundColor Cyan
}

# Step 2: Uninstall OneDrive
Write-Host "`n[*] Uninstalling OneDrive..." -ForegroundColor Yellow

# Find OneDrive uninstaller
$oneDriveSetup = "${env:LOCALAPPDATA}\Microsoft\OneDrive\OneDriveSetup.exe"
$systemOneDriveSetup = "${env:SYSTEMROOT}\System32\OneDriveSetup.exe"
$syswow64OneDriveSetup = "${env:SYSTEMROOT}\SysWOW64\OneDriveSetup.exe"

$uninstallerPath = $null
if (Test-Path $oneDriveSetup) {
    $uninstallerPath = $oneDriveSetup
} elseif (Test-Path $systemOneDriveSetup) {
    $uninstallerPath = $systemOneDriveSetup
} elseif (Test-Path $syswow64OneDriveSetup) {
    $uninstallerPath = $syswow64OneDriveSetup
}

if ($uninstallerPath) {
    Write-Host "  Found uninstaller at: $uninstallerPath" -ForegroundColor Gray
    Start-Process -FilePath $uninstallerPath -ArgumentList "/uninstall" -Wait -NoNewWindow
    Write-Host "  [OK] OneDrive uninstalled" -ForegroundColor Green
} else {
    Write-Host "  [WARN] OneDrive uninstaller not found - may already be uninstalled" -ForegroundColor Yellow
}

# Step 3: Remove OneDrive from startup
Write-Host "`n[*] Removing OneDrive from startup..." -ForegroundColor Yellow

$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$runOneDrive = Get-ItemProperty -Path $runKey -Name "OneDrive" -ErrorAction SilentlyContinue
if ($runOneDrive) {
    Remove-ItemProperty -Path $runKey -Name "OneDrive" -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] Removed from startup registry" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Not found in startup registry" -ForegroundColor Cyan
}

# Step 4: Remove leftover folders (optional)
Write-Host "`n[*] Cleaning up leftover files..." -ForegroundColor Yellow

$foldersToRemove = @(
    "${env:LOCALAPPDATA}\Microsoft\OneDrive",
    "${env:PROGRAMDATA}\Microsoft OneDrive",
    "${env:USERPROFILE}\OneDrive"
)

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        # Only remove if empty or just cache files
        $items = Get-ChildItem -Path $folder -ErrorAction SilentlyContinue
        if (-not $items -or $items.Count -eq 0) {
            Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  [OK] Removed empty folder: $folder" -ForegroundColor Green
        } else {
            Write-Host "  [SKIP] Folder contains files, keeping: $folder" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== ONEDRIVE REMOVAL COMPLETE ===" -ForegroundColor Green
Write-Host "[INFO] OneDrive has been permanently removed from your system" -ForegroundColor Cyan
Write-Host "[INFO] Your OneDrive folder and files are still on your Desktop if needed" -ForegroundColor Cyan
