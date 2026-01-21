# Claude Code Hook - Notify when user input needed
# Sends Windows toast notification

Import-Module BurntToast -ErrorAction SilentlyContinue

New-BurntToastNotification -Text "Claude Code", "Action required - check your terminal!"

# Output empty JSON to not interfere with Claude
Write-Output '{}'
