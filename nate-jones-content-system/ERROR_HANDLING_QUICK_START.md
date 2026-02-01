# Error Handling - Quick Start (10 minutes)

## TL;DR

Add automatic error notifications to your n8n workflows:
1. **Slack** → Get instant alerts
2. **Google Sheets** → Track error patterns
3. **Copy-paste** error nodes to all workflows

---

## Quick Setup

### 1. Create Slack Webhook (2 min)

```bash
1. Go to: https://api.slack.com/apps
2. Create New App → From scratch
3. Name: "n8n Error Monitor"
4. Add Features → Incoming Webhooks → ON
5. Add New Webhook → Select #n8n-alerts channel
6. Copy webhook URL
```

**Save this URL**: `https://hooks.slack.com/services/...`

---

### 2. Create Error Log Sheet (2 min)

```bash
1. Go to: https://sheets.google.com
2. Create new sheet: "n8n Error Log"
3. Add headers in row 1:
   A: Timestamp
   B: Workflow Name
   C: Workflow ID
   D: Node Name
   E: Error Message
   F: Error Type
   G: Execution ID
   H: Resolved

4. Share → Anyone with link can EDIT
5. Copy Sheet ID from URL
```

**Save this ID**: From `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`

---

### 3. Import Error Handler to n8n (1 min)

**Option A: Import Template**

1. Download: `n8n-error-handler-template.json`
2. In n8n: Workflows → Import from File
3. Select the JSON file
4. Click "Import"

**Option B: Build Manually**

See: `N8N_ERROR_HANDLING_SETUP.md` for step-by-step

---

### 4. Configure Credentials (3 min)

**Slack**:
1. Click "Slack Notification" node
2. Create new credential
3. Choose "Webhook URL"
4. Paste your webhook URL
5. Save

**Google Sheets**:
1. Click "Google Sheets Log" node
2. Create new credential
3. Choose "OAuth2"
4. Sign in with Google
5. Allow access
6. In node settings, select your sheet
7. Save

---

### 5. Test It (2 min)

1. Add "Stop and Error" node to your workflow
2. Set error message: "Test error"
3. Execute workflow
4. Check:
   - ✅ Slack message in #n8n-alerts
   - ✅ New row in Google Sheet
5. Delete "Stop and Error" node

**Done!** Now any workflow error triggers automatic notifications.

---

## Copy to Other Workflows

1. Select all error nodes (Error Trigger → Set → Slack → Sheets)
2. Ctrl+C (copy)
3. Open another workflow
4. Ctrl+V (paste)
5. Done - that workflow is now protected!

---

## What You Get

### Slack Alert Example

```
🚨 n8n Workflow Error

Workflow: AI News Scraper
Node Failed: HTTP Request - Get Sources
Time: 2026-02-01 10:30:45

Error:
Request failed with status code 404

Type: NodeApiError

View Execution (click to debug)
```

### Google Sheets Log

| Timestamp | Workflow | Node | Error | Resolved |
|-----------|----------|------|-------|----------|
| 2026-02-01 10:30 | AI News Scraper | HTTP Request | 404 error | No |

---

## Monitoring Workflow

**Every Monday**:
1. Check Google Sheet
2. Look for repeated errors
3. Fix the failing nodes
4. Mark as "Yes" in Resolved column

**Get Better Over Time**:
- Week 1: Maybe 10 errors
- Week 2: Fix patterns, down to 5 errors
- Week 3: Stable system, 1-2 errors
- Week 4: Rock solid! ✅

---

## Files

- **Full Guide**: `N8N_ERROR_HANDLING_SETUP.md` (detailed)
- **Template**: `n8n-error-handler-template.json` (import to n8n)
- **This File**: Quick reference

---

## Pro Tips

✅ **Name your nodes clearly**
- Bad: "HTTP Request"
- Good: "HTTP Request - Get YouTube Feed"

✅ **Name your workflows clearly**
- Bad: "New Workflow"
- Good: "[Patrick] AI News Scraper - Hourly"

✅ **Add retry logic**
- Before critical nodes, add retry on fail
- Network errors often resolve on retry

✅ **Weekly review**
- 5 minutes every Monday
- Fix pattern errors
- Your system gets more stable each week

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 404 Not Found | URL wrong or changed | Check URL still valid |
| Authentication Failed | API key expired | Reconnect credentials |
| Timeout | External service slow | Increase timeout or retry |
| Rate Limit | Too many requests | Reduce frequency |
| Network Error | Internet/service down | Add retry logic |

---

## Support

**Slack not working?**
- Test webhook with curl:
  ```bash
  curl -X POST YOUR_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d '{"text": "Test"}'
  ```

**Google Sheets not logging?**
- Check sheet is shared publicly
- Reconnect Google OAuth

**Error Trigger not firing?**
- Make sure workflow is Active
- Test with "Stop and Error" node

---

## Next Steps

1. [ ] Set up Slack webhook
2. [ ] Create Google Sheet
3. [ ] Import error template to n8n
4. [ ] Configure both credentials
5. [ ] Test with forced error
6. [ ] Copy to all workflows

**Total time**: ~10 minutes
**Result**: Production-ready error monitoring! 🎉
