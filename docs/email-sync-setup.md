# Email Sync Project Monitor - Setup Guide

## Workflow Overview

**Workflow ID:** `FhP3FtBgtApRjbUY`
**Name:** `[Email Sync] Project Update Monitor`

This workflow monitors 3 Gmail accounts for project-related emails, uses AI to extract updates, posts to Slack, and updates Obsidian notes.

## Architecture

```
[Gmail Trigger x3] → [Merge + Enrich] → [Dedupe Check] → [AI Analysis (GPT-4o)]
                                                              ↓
                              [Route by Importance: urgent/update/fyi/skip]
                                    ↓                    ↓
                            [Slack Notify]    [Update Obsidian Note]
                                    ↓
                      [Log to Sheet + Update Project Activity]
```

## Setup Steps

### 1. Create Google Sheet

Create a new Google Sheet named **"Project Email Tracker"** with two sheets:

#### Sheet 1: "Projects" (Centralized Knowledge Base)

| Column | Description | Example |
|--------|-------------|---------|
| projectId | Unique ID | `proj-001` |
| projectName | Project name (must match AI matching) | `San Diego Cardiac` |
| status | Current status | `active` |
| slackChannel | Channel for notifications | `#sd-cardiac` |
| obsidianNotePath | Path in vault | `02-Projects/San Diego Cardiac.md` |
| clickupListId | ClickUp list ID (optional) | `12345678` |
| lastUpdated | Auto-updated timestamp | `2026-01-21T08:46:31Z` |
| lastActivity | Last activity summary | `Email: Project update from John` |
| notes | Additional notes | `Primary contact: Dr. Smith` |

**Initial Projects to Add:**
- San Diego Cardiac
- RPB Medical
- Kid & Grownup Dental
- Reprise Internal
- DCCS
- Impact3
- Galileon
- Aquagents
- Viking
- Traverse Legal

#### Sheet 2: "Email Log" (Deduplication & History)

| Column | Description |
|--------|-------------|
| messageId | Gmail message ID (for deduplication) |
| from | Sender email |
| subject | Email subject |
| project | Matched project name |
| importance | urgent/update/fyi/skip |
| processedAt | Processing timestamp |
| sourceAccount | Which inbox received it |
| summary | AI-generated summary |

### 2. Set Environment Variable

Add to n8n environment variables:

```
EMAIL_TRACKER_SHEET_ID=<your-google-sheet-id>
```

The Sheet ID is in the URL: `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`

### 3. Configure Gmail OAuth2 Credentials

Create **3 separate Gmail OAuth2 credentials** in n8n:

1. **Gmail - Syntrex** → ksukirya@syntrexai.com
2. **Gmail - Reprise** → keshav@reprisesai.com
3. **Gmail - SalesDone** → keshav@salesdoneai.com

For each:
1. Go to Google Cloud Console
2. Create OAuth2 credentials
3. Add scope: `https://www.googleapis.com/auth/gmail.readonly`
4. Configure consent screen
5. Add redirect URI from n8n

### 4. Configure Slack Credentials

Ensure Slack OAuth2 credentials have access to:
- `#alerts` channel (for urgent)
- `#projects` channel (default)
- Any project-specific channels defined in the Projects sheet

### 5. Configure OpenAI Credentials

Ensure OpenAI API credentials are configured with access to `gpt-4o` model.

### 6. Assign Credentials in Workflow

Open the workflow in n8n and assign credentials to each node:

| Node | Credential Type |
|------|-----------------|
| Gmail Trigger - Syntrex | Gmail OAuth2 (Syntrex) |
| Gmail Trigger - Reprise | Gmail OAuth2 (Reprise) |
| Gmail Trigger - SalesDone | Gmail OAuth2 (SalesDone) |
| Check If Processed | Google Sheets OAuth2 |
| Get Projects List | Google Sheets OAuth2 |
| Log to Email Sheet | Google Sheets OAuth2 |
| Update Project Last Activity | Google Sheets OAuth2 |
| Slack Alert - Urgent | Slack OAuth2 |
| Slack Notify - Update | Slack OAuth2 |
| Slack Notify - FYI | Slack OAuth2 |
| AI Analyze Email | OpenAI API |

### 7. Test the Workflow

1. Send a test email to one of the accounts mentioning a project name
2. In n8n, click "Test Workflow" to manually trigger
3. Verify:
   - Email is logged to Google Sheet
   - Slack receives notification in correct channel
   - Obsidian note is updated (if path configured)
   - No duplicates on re-run

### 8. Activate the Workflow

Once tested, activate the workflow. It will poll every 5 minutes.

## Slack Message Formats

### Urgent
```
:rotating_light: *URGENT: San Diego Cardiac*

*From:* john@example.com
*Subject:* Critical: Server Down
*Account:* keshav@reprisesai.com

System is experiencing downtime, immediate attention required.

_Contains urgent language and requests immediate action_
```

### Update
```
:email: *San Diego Cardiac* - New Update

*From:* john@example.com
*Subject:* Weekly Status Report

Project on track, milestone 3 completed ahead of schedule.
```

### FYI
```
:information_source: *San Diego Cardiac* - FYI

Newsletter received from vendor about upcoming maintenance window.
```

## Obsidian Note Format

Updates are appended under date headers:

```markdown
---
title: San Diego Cardiac
last_updated: 2026-01-21
tags:
  - project
---

# San Diego Cardiac

## Updates

### 2026-01-21
- Weekly status report received: Project on track, milestone 3 completed
- Vendor maintenance window scheduled for Feb 1-2

### 2026-01-20
- Initial kickoff meeting notes shared via email
```

## Troubleshooting

### Emails Not Processing
- Check Gmail credentials are valid and authorized
- Verify the filter query isn't too restrictive
- Check the Email Log sheet for the messageId

### Wrong Project Matching
- Ensure project names in the Projects sheet are specific enough
- The AI uses fuzzy matching; add aliases if needed

### Obsidian Not Updating
- Verify `obsidianNotePath` is set in the Projects sheet
- Path should be relative to vault root (e.g., `02-Projects/Project.md`)
- Ensure n8n has filesystem access to the vault directory

### Duplicate Slack Messages
- Check if the Email Log sheet is accessible
- Verify the messageId column exists and has data
