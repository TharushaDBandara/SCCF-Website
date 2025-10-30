# PowerShell script to sync project images from server to assets directory
# This ensures all project images are available for the static website

Write-Host "Syncing project images from server to assets directory..." -ForegroundColor Green

$serverPath = "e:\Projects\Websits\sccf\server\uploads\projects"
$assetsPath = "e:\Projects\Websits\sccf\assets\uploads\projects"

# Get all project directories from server
$projectDirs = Get-ChildItem -Path $serverPath -Directory

foreach ($dir in $projectDirs) {
    $sourcePath = Join-Path $serverPath $dir.Name
    $destPath = Join-Path $assetsPath $dir.Name
    
    Write-Host "Syncing: $($dir.Name)" -ForegroundColor Yellow
    
    # Use robocopy to sync the directory
    robocopy $sourcePath $destPath /E /XO /R:1 /W:1 | Out-Null
    
    if ($LASTEXITCODE -le 1) {
        Write-Host "  ✓ Success" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error (Exit code: $LASTEXITCODE)" -ForegroundColor Red
    }
}

Write-Host "Image sync completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Usage: Run this script whenever you add new project images to the server directory." -ForegroundColor Cyan