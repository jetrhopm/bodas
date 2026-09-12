param(
  [Parameter(Mandatory=$true)][string]$DatabaseUrl,
  [string]$OutputDirectory = '.\backups'
)
$ErrorActionPreference = 'Stop'
$uri = [Uri]$DatabaseUrl
$database = $uri.AbsolutePath.TrimStart('/')
if (!$database) { throw 'La URL debe incluir la base de datos.' }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path $OutputDirectory "bodas-$stamp.sql"
$env:MYSQL_PWD = [Uri]::UnescapeDataString($uri.Password)
try {
  & mysqldump --single-transaction --routines --events --host $uri.Host --port $uri.Port --user ([Uri]::UnescapeDataString($uri.UserInfo).Split(':')[0]) $database | Out-File -FilePath $destination -Encoding utf8
  if ($LASTEXITCODE -ne 0) { throw "mysqldump devolvió código $LASTEXITCODE" }
  Write-Host "Respaldo creado: $destination"
} finally { Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue }
