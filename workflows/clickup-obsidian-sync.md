# ClickUp-Obsidian Bidirectional Sync with Slack Summary

A daily automation that synchronizes project statuses between ClickUp and Obsidian, sending a summary to Slack.

## Overview

This workflow runs daily at 9 AM and:
1. Fetches all tasks from your ClickUp team workspace
2. Reads project files from your Obsidian vault
3. Compares statuses and identifies differences
4. Posts a formatted summary to Slack
5. Updates Obsidian files with the latest ClickUp statuses

## Prerequisites

### ClickUp API Token
1. Go to ClickUp Settings > Apps
2. Click "Generate API Token"
3. Copy the token (starts with `pk_`)

### Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app or use an existing one
3. Add the `chat:write` OAuth scope
4. Install the app to your workspace
5. Copy the Bot User OAuth Token

### Obsidian Vault Structure
Your Obsidian project files should have frontmatter with a `clickup_id` field:

```markdown
---
title: Project Name
status: in-progress
priority: high
clickup_id: abc123xyz
---

# Project Name
...
```

## Setup Instructions

### 1. Import the Workflow
Import `clickup-obsidian-sync.json` into n8n.

### 2. Configure ClickUp Credentials
1. In n8n, go to Credentials > Add Credential
2. Select "Header Auth"
3. Set:
   - Header Name: `Authorization`
   - Header Value: `pk_YOUR_CLICKUP_TOKEN`
4. Save and assign to the "Get All Team Tasks" node

### 3. Configure Slack Credentials
1. In n8n, go to Credentials > Add Credential
2. Select "Slack API"
3. Enter your Bot User OAuth Token
4. Save and assign to both Slack nodes

### 4. Update Configuration
In the "Set Configuration" node, update:
- `team_id`: Your ClickUp team ID (found in ClickUp URL)
- `obsidian_path`: Path to your Obsidian projects folder
- `slack_channel`: Your Slack channel name (without #)

### 5. Update Target Folders
In the "Filter by Target Folders" code node, update the `targetFolders` array to match your ClickUp folder structure.

## Status Mapping

ClickUp statuses are mapped to Obsidian statuses:

| ClickUp Status | Obsidian Status |
|----------------|-----------------|
| signed & accepted | signed |
| onboarding form completed | onboarding |
| system access received | setup |
| initial setup phase | setup |
| in progress | in-progress |
| change request | change-request |
| waiting on client | on-hold |
| go-live phase | go-live |
| optimization phase | optimization |
| completed & maintaining | completed |

## Slack Summary Format

The daily summary includes:
- Total project count and sync status
- Status breakdown with emoji indicators
- Projects grouped by client/folder
- Tasks needing attention (waiting on client or change requests)
- Count of Obsidian files that were updated
- Count of ClickUp tasks not yet tracked in Obsidian

## Error Handling

- If the ClickUp API fails, an error notification is sent to Slack
- Files with no status changes are skipped
- The workflow continues even if individual file writes fail

## Troubleshooting

### ClickUp API Returns No Tasks
- Verify your team ID is correct
- Check that your API token has access to the team
- Ensure the target folders exist in ClickUp

### Obsidian Files Not Updating
- Verify the obsidian_path is correct
- Check that n8n has write permissions to the vault folder
- Ensure files have valid frontmatter with `clickup_id`

### Slack Messages Not Sending
- Verify the channel name is correct (without #)
- Check that the Slack app is installed to the workspace
- Ensure the bot has permission to post to the channel

## Maintenance

### Adding New Clients
1. Add the folder name to `targetFolders` in the "Filter by Target Folders" node
2. Create corresponding Obsidian notes with `clickup_id` frontmatter

### Adding New Statuses
1. Add the mapping to `clickupToObsidian` in the "Bidirectional Sync Logic" node
2. Add emoji mapping in the "Build Slack Summary" node
