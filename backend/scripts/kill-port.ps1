param(
  [int]$Port = 5000
)

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $listener) {
  Write-Host "Port $Port is free."
  exit 0
}

$owningPid = $listener.OwningProcess
if (-not $owningPid -or $owningPid -eq 0) {
  Write-Host "Port $Port is in use, but PID is not stoppable (PID=$owningPid)."
  exit 0
}

try {
  $proc = Get-Process -Id $owningPid -ErrorAction Stop
  Write-Host "Stopping PID $owningPid ($($proc.ProcessName)) listening on port $Port..."
  Stop-Process -Id $owningPid -Force -ErrorAction Stop
  Start-Sleep -Milliseconds 300
  Write-Host "Stopped PID $owningPid."
} catch {
  Write-Host "Failed to stop PID $owningPid on port ${Port}: $($_.Exception.Message)"
  exit 0
}
