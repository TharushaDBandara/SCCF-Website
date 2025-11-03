# 🧹 Cleanup Script - Remove Temporary Folders

Write-Host "🧹 SCCF News - Cleanup Temporary Folders" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$tempFolders = @(
    "E:\Projects\Websits\sccf-news",
    "E:\Projects\Websits\sccf-sanity-studio"
)

foreach ($folder in $tempFolders) {
    if (Test-Path $folder) {
        Write-Host "🗑️  Removing: $folder" -ForegroundColor Yellow
        Remove-Item -Path $folder -Recurse -Force
        Write-Host "✓ Removed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✓ $folder - already removed or doesn't exist" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your integrated news platform is at:" -ForegroundColor Cyan
Write-Host "📁 E:\Projects\Websits\sccf\news-platform\" -ForegroundColor White
Write-Host ""
Write-Host "To start working:" -ForegroundColor Cyan
Write-Host "1. cd E:\Projects\Websits\sccf\news-platform" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White
Write-Host "3. npm run dev" -ForegroundColor White
Write-Host ""
