# Sync News Data from Server to Assets (for Production Deployment)
# Run this script whenever you add/update news via the admin panel

Write-Host "Syncing news data for production..." -ForegroundColor Cyan

# Create directories if they don't exist
New-Item -ItemType Directory -Path "assets/data" -Force | Out-Null
New-Item -ItemType Directory -Path "assets/uploads/news" -Force | Out-Null

# Copy news.json
Copy-Item "server/data/news.json" -Destination "assets/data/news.json" -Force
Write-Host "✓ Copied news.json" -ForegroundColor Green

# Copy uploaded images
$imagesCopied = 0
Get-ChildItem "server/uploads/news" -File -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName -Destination "assets/uploads/news/" -Force
    $imagesCopied++
}
Write-Host "✓ Copied $imagesCopied images" -ForegroundColor Green

# Update image paths in assets/data/news.json to use relative paths
$newsJson = Get-Content "assets/data/news.json" -Raw | ConvertFrom-Json

foreach ($article in $newsJson) {
    # Update main image path
    if ($article.image) {
        $article.image = $article.image -replace "^/uploads/news/", "assets/uploads/news/"
    }
    
    # Update additional images paths
    if ($article.images -and $article.images.Count -gt 0) {
        for ($i = 0; $i -lt $article.images.Count; $i++) {
            $article.images[$i] = $article.images[$i] -replace "^/uploads/news/", "assets/uploads/news/"
        }
    }
}

# Save updated JSON
$newsJson | ConvertTo-Json -Depth 10 | Set-Content "assets/data/news.json" -Encoding UTF8

Write-Host "✓ Updated image paths to production format" -ForegroundColor Green
Write-Host "`nNews data synced successfully!" -ForegroundColor Green
Write-Host "You can now commit and push these files to GitHub." -ForegroundColor Yellow
