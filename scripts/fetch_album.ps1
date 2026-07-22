<#
Usage:
  powershell -File scripts\fetch_album.ps1 -Url 'https://photos.app.goo.gl/...' -RepeatSeconds 0

If -RepeatSeconds is provided (>0) the script will loop and re-fetch every N seconds.
Schedule this script with Windows Task Scheduler to run periodically.
#>

param(
  [string]$Url = 'https://photos.app.goo.gl/WdeoaKBJWkk8Tu4u8',
  [int]$RepeatSeconds = 0
)

function Fetch-Album {
  try {
    Invoke-WebRequest -Uri $Url -UseBasicParsing -OutFile 'album_page.html' -Headers @{ 'User-Agent' = 'fetch-album-powershell/1.0' }
    $len = (Get-Item 'album_page.html').Length
    Write-Host "Saved album_page.html ($len bytes)"
  } catch {
    Write-Warning "Failed to fetch album: $_"
  }
}

if ($RepeatSeconds -gt 0) {
  while ($true) {
    Fetch-Album
    Start-Sleep -Seconds $RepeatSeconds
  }
} else {
  Fetch-Album
}
