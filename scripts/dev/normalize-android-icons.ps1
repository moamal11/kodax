$ErrorActionPreference = 'Stop'
$taskWorkspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$taskResourceRoot = (Resolve-Path -LiteralPath (Join-Path $taskWorkspaceRoot 'android/app/src/main/res')).Path
if (-not $taskResourceRoot.StartsWith($taskWorkspaceRoot + '\')) { throw 'Resource directory outside workspace' }
$taskBackupRoot = Join-Path $taskWorkspaceRoot 'output/android-release/native-icon-backup'
$taskRemoved = @()
foreach ($taskDensity in (Get-ChildItem -LiteralPath $taskResourceRoot -Directory -Filter 'mipmap-*')) {
  foreach ($taskIcon in @('ic_launcher', 'ic_launcher_round', 'ic_launcher_foreground')) {
    $taskPng = Join-Path $taskDensity.FullName ($taskIcon + '.png')
    $taskWebp = Join-Path $taskDensity.FullName ($taskIcon + '.webp')
    if ((Test-Path -LiteralPath $taskPng -PathType Leaf) -and (Test-Path -LiteralPath $taskWebp -PathType Leaf)) {
      $taskAbsolutePng = (Resolve-Path -LiteralPath $taskPng).Path
      if (-not $taskAbsolutePng.StartsWith($taskResourceRoot + '\')) { throw 'Unexpected duplicate icon path' }
      $taskBackupDirectory = Join-Path $taskBackupRoot $taskDensity.Name
      New-Item -ItemType Directory -Path $taskBackupDirectory -Force | Out-Null
      Copy-Item -LiteralPath $taskAbsolutePng -Destination $taskBackupDirectory -Force
      $taskRemoved += @{ path = $taskAbsolutePng; sha256 = (Get-FileHash -LiteralPath $taskAbsolutePng -Algorithm SHA256).Hash }
      Remove-Item -LiteralPath $taskAbsolutePng
    }
  }
}
New-Item -ItemType Directory -Path (Join-Path $taskWorkspaceRoot 'output/android-release') -Force | Out-Null
@{ at = [DateTime]::UtcNow.ToString('o'); duplicates = $taskRemoved } | ConvertTo-Json -Depth 4 -Compress | Add-Content -LiteralPath (Join-Path $taskWorkspaceRoot 'output/android-release/icon-normalization.jsonl')
Write-Output ('Normalized generated launcher resources: ' + $taskRemoved.Count)
