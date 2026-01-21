# Meeting Notes Processing Workflow

## Overview
This n8n workflow automatically processes meeting notes submitted via webhook, extracts action items using pattern matching, formats a Slack notification, and sends it to a designated Slack channel.

## Workflow ID
`6xh8XNxALZjdzLZd`

## Workflow Details

### Nodes Created
1. **Webhook** - Receives POST requests with meeting data
2. **Extract Action Items** - JavaScript code node that parses meeting notes for action items
3. **Format Slack Message** - JavaScript code node that formats the Slack message
4. **Send to Slack** - Posts the formatted message to Slack
5. **Respond to Webhook** - Returns a JSON response to the webhook caller

### Workflow Flow
```
Webhook → Extract Action Items → Format Slack Message → Send to Slack → Respond to Webhook
```

## Configuration

### Webhook Endpoint
- **Method**: POST
- **Path**: `/meeting-notes`
- **URL**: `https://keshavs.app.n8n.cloud/webhook/meeting-notes`

### Slack Configuration
- **Channel**: #meetings
- **Note**: You need to configure Slack credentials in n8n before activating this workflow
  1. Go to n8n > Credentials
  2. Add "Slack OAuth2 API" credentials
  3. Connect the "Send to Slack" node to your credentials

## Input Format

### Expected JSON Structure
```json
{
  "title": "Weekly Standup",
  "date": "2026-01-20",
  "attendees": ["John", "Sarah", "Mike"],
  "notes": "Discussed project timeline. TODO: John will update the roadmap by Friday. Sarah needs to review the budget. Action: Mike to schedule client call."
}
```

### Field Descriptions
- **title** (string): Meeting title
- **date** (string): Meeting date in YYYY-MM-DD format
- **attendees** (array): List of attendee names
- **notes** (string): Full meeting notes text

## Action Item Detection

The workflow detects action items using multiple patterns:
- `TODO: <action>`
- `Action: <action>`
- `@name will <action>`
- `- [ ] <action>` (checkbox syntax)
- Phrases with "will", "need to", "needs to", "should", "must"
- Questions starting with "can you", "could you"

## Output

### Slack Message Format
```
📋 *Meeting Notes: Weekly Standup*
📅 2026-01-20
👥 John, Sarah, Mike

*Action Items:*
• John will update the roadmap by Friday
• Sarah needs to review the budget
• Mike to schedule client call
```

### Webhook Response
```json
{
  "success": true,
  "meeting": {
    "title": "Weekly Standup",
    "date": "2026-01-20",
    "attendees": ["John", "Sarah", "Mike"],
    "actionItemsCount": 3
  },
  "actionItems": [
    "John will update the roadmap by Friday",
    "Sarah needs to review the budget",
    "Mike to schedule client call"
  ],
  "message": "Meeting notes processed and sent to Slack"
}
```

## Testing Instructions

### Step 1: Configure Slack Credentials
1. Open the workflow in n8n: `https://keshavs.app.n8n.cloud/workflow/6xh8XNxALZjdzLZd`
2. Click on the "Send to Slack" node
3. Click "Credentials" and add your Slack OAuth2 credentials
4. Save the workflow

### Step 2: Activate the Workflow
1. Click the toggle switch at the top to activate the workflow
2. The webhook will become active and ready to receive requests

### Step 3: Test with cURL
```bash
curl -X POST https://keshavs.app.n8n.cloud/webhook/meeting-notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "date": "2026-01-20",
    "attendees": ["Alice", "Bob"],
    "notes": "Project discussion. TODO: Alice will create design mockups. Action: Bob to set up staging environment. Charlie needs to review the PR by tomorrow."
  }'
```

### Step 4: Test with JavaScript
```javascript
const response = await fetch('https://keshavs.app.n8n.cloud/webhook/meeting-notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: "Test Meeting",
    date: "2026-01-20",
    attendees: ["Alice", "Bob"],
    notes: "Project discussion. TODO: Alice will create design mockups. Action: Bob to set up staging environment. Charlie needs to review the PR by tomorrow."
  })
});

const data = await response.json();
console.log(data);
```

### Step 5: Test with Python
```python
import requests

payload = {
    "title": "Test Meeting",
    "date": "2026-01-20",
    "attendees": ["Alice", "Bob"],
    "notes": "Project discussion. TODO: Alice will create design mockups. Action: Bob to set up staging environment. Charlie needs to review the PR by tomorrow."
}

response = requests.post(
    'https://keshavs.app.n8n.cloud/webhook/meeting-notes',
    json=payload
)

print(response.json())
```

### Step 6: Verify Results
1. Check your Slack #meetings channel for the formatted message
2. Verify the webhook response contains the extracted action items
3. Check the n8n execution log for any errors

## Troubleshooting

### Common Issues

#### Slack Message Not Appearing
- Verify Slack credentials are properly configured
- Ensure the #meetings channel exists in your Slack workspace
- Check that the Slack app has permission to post to the channel
- Review the execution log in n8n for Slack API errors

#### Action Items Not Detected
- Ensure meeting notes contain recognizable patterns (TODO:, Action:, etc.)
- Check that action items are properly formatted with clear action verbs
- Review the "Extract Action Items" node execution to see what was parsed

#### Webhook Not Responding
- Verify the workflow is activated (toggle switch is ON)
- Check the webhook URL is correct
- Ensure the request body is valid JSON
- Review n8n execution logs for errors

### Validation Warnings
The workflow has some validation warnings that are expected and do not affect functionality:
- Expression format warnings in the Code nodes are false positives (curly braces in JavaScript code)
- Error handling warnings are suggestions for production hardening

## Next Steps

### Production Enhancements
1. Add error handling nodes for better resilience
2. Store meeting notes in a database for historical tracking
3. Add email notifications for action items
4. Integrate with calendar apps to auto-schedule follow-ups
5. Add authentication to the webhook endpoint

### Integration Ideas
- Connect to Google Calendar to auto-extract meeting notes
- Integrate with Zoom/Teams to process meeting transcripts
- Add task creation in project management tools (ClickUp, Asana, etc.)
- Send individual action item notifications to assignees

## Version History
- **v1.0** (2026-01-20): Initial workflow creation with webhook, action item extraction, Slack notification, and response
