# n8n Error Handling & Monitoring Setup

## Overview

This guide adds **automatic error notifications** and **error tracking** to your n8n workflows.

When any workflow fails, you'll get:
1. 🔔 **Slack notification** - Instant alert in your monitoring channel
2. 📊 **Google Sheets log** - Automatic error tracking for pattern analysis
3. 📧 **Email alert** (optional) - Backup notification

---

## Setup Checklist

Before you start:
- [ ] Slack workspace access
- [ ] Slack incoming webhook URL
- [ ] Google Sheets with error log template
- [ ] n8n workflow to protect with error handling

---

## Part 1: Slack Setup (5 minutes)

### Step 1: Create Slack Channel

1. Open Slack
2. Click **"+"** next to "Channels"
3. Name it: **`#n8n-alerts`** or **`#workflow-monitoring`**
4. Click "Create"

### Step 2: Create Incoming Webhook

1. Go to: https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name: `n8n Error Monitor`
5. Select your workspace
6. Click **"Create App"**

7. Click **"Incoming Webhooks"** (left sidebar)
8. Toggle **"Activate Incoming Webhooks"** to ON
9. Click **"Add New Webhook to Workspace"**
10. Select your **#n8n-alerts** channel
11. Click **"Allow"**

12. **Copy the Webhook URL** - looks like:
    ```
    https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
    ```

13. Save this URL - you'll need it for n8n

---

## Part 2: Google Sheets Setup (5 minutes)

### Step 1: Create Error Log Sheet

1. Go to: https://sheets.google.com
2. Create new sheet
3. Name it: **"n8n Error Log"**

### Step 2: Add Headers (Row 1)

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Workflow Name | Workflow ID | Node Name | Error Message | Error Type | Execution ID | Resolved |

### Step 3: Share the Sheet

**For n8n to access**:
1. Click **"Share"** (top right)
2. Click **"Anyone with the link"**
3. Set to **"Editor"** (so n8n can write)
4. Click **"Copy link"**
5. Save the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

### Step 4: Optional - Add Auto-Formatting

**Conditional formatting for easy scanning**:
1. Select column H (Resolved)
2. Format → Conditional formatting
3. Format cells if... text contains "No"
4. Background color: Light red
5. Done

---

## Part 3: n8n Error Workflow Setup (10 minutes)

### Step 1: Open Your Workflow

1. Go to n8n: https://keshavs.app.n8n.cloud
2. Open your **AI News Scraper** workflow (or any workflow)

### Step 2: Add Error Trigger Node

1. Click **"+"** anywhere on canvas
2. Search for **"Error Trigger"**
3. Add it

**Configuration**:
```
Node Name: Error Trigger
(No other settings needed)
```

This node activates **only when** any other node in the workflow fails.

---

### Step 3: Add Set Node (Format Error Data)

1. Add **"Set"** node after Error Trigger
2. Configuration:

**Node Name**: `Format Error Data`

**Mode**: Manual Mapping

**Fields to Set**:

| Field Name | Value |
|------------|-------|
| timestamp | `{{ $now.format('YYYY-MM-DD HH:mm:ss') }}` |
| workflowName | `{{ $workflow.name }}` |
| workflowId | `{{ $workflow.id }}` |
| nodeName | `{{ $json["node"]["name"] }}` |
| errorMessage | `{{ $json["error"]["message"] }}` |
| errorType | `{{ $json["error"]["name"] }}` |
| executionId | `{{ $execution.id }}` |
| executionUrl | `https://keshavs.app.n8n.cloud/workflow/{{ $workflow.id }}/executions/{{ $execution.id }}` |

---

### Step 4: Add Slack Node

1. Add **"Slack"** node after Set node
2. Click **"Create New Credential"**
3. Choose **"Webhook URL"**
4. Paste your Slack Webhook URL
5. Click **"Save"**

**Configuration**:

```
Credential to connect with: [Your webhook credential]
Message: [Use template below]
```

**Slack Message Template**:
```
🚨 *n8n Workflow Error*

*Workflow:* {{ $json.workflowName }}
*Node Failed:* {{ $json.nodeName }}
*Time:* {{ $json.timestamp }}

*Error:*
```{{ $json.errorMessage }}```

*Type:* {{ $json.errorType }}

<{{ $json.executionUrl }}|View Execution>
```

**Advanced Options** (click to expand):
- **Username**: `n8n Error Monitor`
- **Icon Emoji**: `:warning:` or `:rotating_light:`

---

### Step 5: Add Google Sheets Node

1. Add **"Google Sheets"** node after Slack
2. Click **"Create New Credential"**

**Google Sheets OAuth2 Setup**:
1. Choose **"OAuth2"**
2. Click **"Connect my account"**
3. Sign in with Google
4. Allow n8n access
5. Click **"Save"**

**Configuration**:

```
Credential to connect with: [Your Google credential]
Resource: Spreadsheet
Operation: Append

Spreadsheet: [Select your "n8n Error Log" sheet]
Range: Sheet1!A:H
```

**Columns to Send**:

Click **"Add Column"** for each:

| Column | Value |
|--------|-------|
| A | `{{ $json.timestamp }}` |
| B | `{{ $json.workflowName }}` |
| C | `{{ $json.workflowId }}` |
| D | `{{ $json.nodeName }}` |
| E | `{{ $json.errorMessage }}` |
| F | `{{ $json.errorType }}` |
| G | `{{ $json.executionId }}` |
| H | `No` |

**Options** (click to expand):
- ✅ **Raw Data**: OFF
- ✅ **Data Mode**: Automap Input Data

---

### Step 6: Save and Activate

1. Click **"Save"** (top right)
2. Workflow should already be **Active** (since error trigger is always passive)

**Visual Flow**:
```
Error Trigger
    ↓
Format Error Data (Set)
    ↓
    ├── Slack Notification
    └── Google Sheets Log
```

---

## Part 4: Testing Your Error Handler (5 minutes)

### Test 1: Force an Error

1. In your main workflow, add a temporary **"Stop and Error"** node
2. Configuration:
   ```
   Error Message: Test error - please ignore
   ```
3. Execute the workflow
4. Check:
   - ✅ Slack message appears in #n8n-alerts
   - ✅ New row added to Google Sheet
5. Remove the "Stop and Error" node

### Test 2: Break a Node Temporarily

1. Edit an HTTP Request node
2. Change URL to invalid: `https://invalid-url-that-does-not-exist.com`
3. Execute workflow
4. Verify Slack + Google Sheets logging
5. Fix the URL back

---

## Part 5: Advanced Error Handling

### Add Email Notification (Optional)

After the Slack node, add:

**Email (Send Email) Node**:
```
To: your-email@example.com
Subject: n8n Error: {{ $json.workflowName }}
Text:
Workflow: {{ $json.workflowName }}
Node: {{ $json.nodeName }}
Error: {{ $json.errorMessage }}

View: {{ $json.executionUrl }}
```

---

### Add Error Severity Levels

Update the **Set** node to include severity:

**Add Field**:
```javascript
severity: {{
  $json.errorType === 'TypeError' ? 'LOW' :
  $json.errorType === 'NetworkError' ? 'MEDIUM' :
  $json.errorType === 'AuthenticationError' ? 'HIGH' :
  'MEDIUM'
}}
```

**Update Slack message**:
```
🚨 *{{ $json.severity }} Priority Error*
```

**Update Google Sheets** - add column I for "Severity"

---

### Filter Errors by Type

Add **IF** node before Slack to skip certain errors:

```
Condition: {{ $json.errorType !== 'RateLimitError' }}
```

Only sends alerts for non-rate-limit errors.

---

## Part 6: Error Pattern Analysis

### Weekly Review (Recommended)

**Every Monday morning**:

1. Open Google Sheet: [Your n8n Error Log]
2. Look for patterns:
   - Same node failing repeatedly → Fix the node
   - Same error type → Systematic issue
   - Errors at specific time → External service downtime

3. Mark resolved errors:
   - Change column H to "Yes" for fixed issues

### Create Pivot Table

1. Select all data (A:H)
2. Insert → Pivot table
3. Rows: Node Name
4. Values: Count of Error Message
5. See which nodes fail most often

### Set Up Alerts

**Google Sheets → Tools → Notification rules**:
- Notify me when: **Any changes are made**
- Email: **Right away**

You'll get an email every time an error is logged.

---

## Part 7: Apply to Multiple Workflows

### Copy Error Handling to Other Workflows

1. In your error workflow, **select all error handling nodes**:
   - Error Trigger
   - Format Error Data
   - Slack
   - Google Sheets

2. Press `Ctrl + C` (or `Cmd + C`)
3. Open another workflow
4. Press `Ctrl + V` to paste
5. Nodes appear - they're ready to use!

**Important**:
- Error Trigger works independently
- Same Slack channel gets all errors
- Same Google Sheet logs all workflows
- You can see which workflow failed by the "Workflow Name" column

---

## Part 8: Monitoring Dashboard

### Slack Commands

**In #n8n-alerts channel**, pin a message with:

```
🔍 n8n Monitoring Quick Links

📊 Error Log: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID
🔧 n8n Dashboard: https://keshavs.app.n8n.cloud
📈 Executions: https://keshavs.app.n8n.cloud/executions

🚨 Common Fixes:
• Rate limits: Reduce frequency
• Auth errors: Reconnect credentials
• Network errors: Check external service status
```

---

## Error Template Examples

### Error Trigger Output Format

When a workflow fails, Error Trigger provides:

```json
{
  "execution": {
    "id": "12345",
    "mode": "trigger",
    "startedAt": "2026-02-01T10:30:00.000Z"
  },
  "workflow": {
    "id": "abc123",
    "name": "AI News Scraper"
  },
  "node": {
    "name": "HTTP Request",
    "type": "n8n-nodes-base.httpRequest"
  },
  "error": {
    "message": "Request failed with status code 404",
    "name": "NodeApiError",
    "description": "Not Found"
  }
}
```

---

## Slack Message Examples

### Success Example

```
🚨 MEDIUM Priority Error

Workflow: AI News Scraper
Node Failed: HTTP Request - Get Sources
Time: 2026-02-01 10:30:45

Error:
Request failed with status code 404

Type: NodeApiError

View Execution
```

### With Severity

```
🔴 HIGH Priority Error

Workflow: Script Generator
Node Failed: Airtable - Update
Time: 2026-02-01 11:15:30

Error:
Authentication failed: Invalid API key

Type: AuthenticationError

View Execution
⚠️ Action Required: Reconnect Airtable credentials
```

---

## Google Sheets Log Example

| Timestamp | Workflow Name | Workflow ID | Node Name | Error Message | Error Type | Execution ID | Resolved |
|-----------|---------------|-------------|-----------|---------------|------------|--------------|----------|
| 2026-02-01 10:30:45 | AI News Scraper | abc123 | HTTP Request | Request failed 404 | NodeApiError | exec_001 | No |
| 2026-02-01 11:15:30 | Script Generator | def456 | Airtable - Update | Invalid API key | AuthenticationError | exec_002 | No |
| 2026-01-31 15:20:10 | AI News Scraper | abc123 | RSS Feed Read | Timeout after 30s | TimeoutError | exec_003 | Yes |

---

## Best Practices

### 1. Workflow Naming

Name workflows clearly so errors are identifiable:
- ✅ `[Patrick] AI News Scraper - Hourly`
- ✅ `[Patrick] Script Generator`
- ❌ `Untitled Workflow`
- ❌ `Test 123`

### 2. Node Naming

Name important nodes so you know what failed:
- ✅ `HTTP Request - Get Sources from Google Sheets`
- ✅ `Airtable - Insert New Content`
- ❌ `HTTP Request`
- ❌ `Airtable`

### 3. Error Prevention

Add these nodes **before** likely failure points:

**Before HTTP Request**:
```javascript
// IF node - check URL is valid
{{ $json.url && $json.url.startsWith('http') }}
```

**Before Airtable**:
```javascript
// IF node - check required fields exist
{{ $json.title && $json.link && $json.content_id }}
```

### 4. Retry Logic

For network errors, add **"Split In Batches"** with retry:

```
Batch Size: 1
Options → Retry On Fail: Yes
Retry Times: 3
Retry Wait: 5000ms
```

---

## Troubleshooting

### Slack Messages Not Sending

**Check**:
1. Webhook URL is correct
2. Channel exists and webhook has access
3. Slack workspace hasn't revoked the webhook

**Test webhook manually**:
```bash
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test from n8n"}'
```

### Google Sheets Not Logging

**Check**:
1. Sheet ID is correct
2. Sheet range is `Sheet1!A:H` (or your sheet name)
3. Google OAuth credentials are valid
4. Sheet is shared with "Anyone with link can edit"

**Re-authenticate**:
1. Go to Credentials in n8n
2. Find Google Sheets credential
3. Click "Reconnect"

### Error Trigger Not Firing

**Check**:
1. Workflow is Active
2. Error Trigger is connected to other nodes
3. An actual error occurred (not just a workflow stop)

**Force an error** to test:
- Add "Stop and Error" node temporarily
- Execute workflow
- Should trigger error flow

---

## Costs & Limits

### Slack
- **Free tier**: Unlimited webhooks
- **No cost** for error notifications

### Google Sheets
- **Free tier**: 300 requests/minute
- **No cost** for error logging (well within limits)

### n8n
- **Error Trigger**: No execution cost
- **Error handling nodes**: Count toward your execution limit
- **Estimate**: ~3 nodes per error = minimal cost

---

## Maintenance

### Monthly Tasks

**Review Error Patterns**:
1. Open Google Sheet
2. Create pivot table by Node Name
3. Identify top 3 failing nodes
4. Fix or improve those nodes

**Clean Up Old Errors**:
1. Filter errors older than 30 days
2. Archive to separate sheet or delete
3. Keeps main log fast and relevant

**Update Slack Webhook** (if needed):
1. Check webhook still works
2. Rotate webhook for security (annually)

---

## Quick Reference

**Slack Webhook**: Store in n8n credentials
**Google Sheet ID**: From URL after `/d/`
**Error Trigger**: Automatically catches all workflow errors
**Set Node**: Formats data before sending

**Node Order**:
```
Error Trigger → Set (format) → Slack → Google Sheets
```

**Test Command**:
Add temporary "Stop and Error" node to any workflow to test error flow.

---

## Next Steps

1. [ ] Set up Slack channel and webhook
2. [ ] Create Google Sheets error log
3. [ ] Add error handling to AI News Scraper workflow
4. [ ] Test with forced error
5. [ ] Copy error handling to other workflows
6. [ ] Schedule weekly error review

Your workflows are now **production-ready** with full error monitoring! 🎉
