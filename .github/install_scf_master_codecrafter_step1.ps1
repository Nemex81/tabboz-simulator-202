$now = Get-Date -Format yyyyMMddTHHmmss
$backup = Join-Path '.github/backups' ("scf-master-codecrafter-" + $now)
New-Item -ItemType Directory -Path $backup -Force | Out-Null
Write-Output ("BACKUP_DIR:" + $backup)
if (Test-Path '.github') {
  Get-ChildItem -Path .github -Force | ForEach-Object {
    if ($_.FullName -ne (Resolve-Path $backup).Path) {
      Try { Copy-Item -Path $_.FullName -Destination $backup -Recurse -Force -ErrorAction Stop } Catch { Copy-Item -Path $_.FullName -Destination $backup -Recurse -Force -ErrorAction SilentlyContinue }
    }
  }
  Write-Output 'BACKUP_DONE'
} else { Write-Output 'NO_GITHUB_DIR' }
