$repo='https://github.com/Nemex81/scf-master-codecrafter'
$tmp=Join-Path $PWD '.github\_scf_master_codecrafter_repo'
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
git clone --depth 1 $repo $tmp
$src = Join-Path $tmp '.github'
$dst = Join-Path $PWD '.github'
if (Test-Path $src) {
  Get-ChildItem -Path $src -Recurse -Force | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length+1)
    $destPath = Join-Path $dst $rel
    $destDir = Split-Path $destPath
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item -Path $_.FullName -Destination $destPath -Force -ErrorAction SilentlyContinue
  }
  Write-Output 'COPY_DONE'
} else { Write-Output 'SRC_NOT_FOUND' }
Remove-Item $tmp -Recurse -Force
