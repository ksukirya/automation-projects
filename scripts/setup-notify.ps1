# Setup Notify function in PowerShell profile

$profilePath = "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"

# Create directory if it doesn't exist
$profileDir = Split-Path $profilePath
if (!(Test-Path $profileDir)) {
    New-Item -Path $profileDir -ItemType Directory -Force
}

# Create profile if it doesn't exist
if (!(Test-Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force
}

# Function to add
$notifyFunction = @'

# Notify function for quick Windows notifications
function Notify {
    param(
        [string]$Title = "Reminder",
        [string]$Message = "Action required!"
    )
    Import-Module BurntToast -ErrorAction SilentlyContinue
    New-BurntToastNotification -Text $Title, $Message
}

# Quick alias
Set-Alias -Name alert -Value Notify

'@

# Check if function already exists in profile
$profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
if ($profileContent -notlike "*function Notify*") {
    Add-Content -Path $profilePath -Value $notifyFunction
    Write-Host "Notify function added to PowerShell profile!" -ForegroundColor Green
} else {
    Write-Host "Notify function already exists in profile." -ForegroundColor Yellow
}

Write-Host "`nProfile location: $profilePath" -ForegroundColor Cyan
Write-Host "`nUsage:" -ForegroundColor Cyan
Write-Host '  Notify -Title "DCCS" -Message "David is waiting"' -ForegroundColor White
Write-Host '  Notify "Quick reminder"' -ForegroundColor White
Write-Host '  alert "Task due!"' -ForegroundColor White
