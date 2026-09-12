param([string]$BaseUrl = 'http://localhost/bodas')
$ErrorActionPreference = 'Stop'
$health = "$BaseUrl/api/v1/health"
$ready = "$BaseUrl/api/v1/health/ready"
foreach ($endpoint in @($health,$ready)) {
  $response = Invoke-WebRequest -Uri $endpoint -UseBasicParsing
  if ($response.StatusCode -ne 200) { throw "Falló $endpoint" }
  Write-Host "OK $endpoint"
}
Write-Host 'Validación de proxy Apache/Next y disponibilidad de MySQL completada.'
