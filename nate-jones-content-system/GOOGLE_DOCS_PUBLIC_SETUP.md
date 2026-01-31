# Making Google Docs Publicly Editable in n8n

## Overview

This guide shows you how to configure the n8n Script Generator workflow to create Google Docs that are **publicly editable by anyone with the link** - no sign-in required.

---

## Why Make Docs Public?

✅ **Easy Editing**: You can edit from any device without signing in
✅ **Quick Access**: Just click the link from the dashboard
✅ **No Permissions**: No need to manage individual access
✅ **Collaboration**: Share with team members instantly

---

## Step-by-Step Setup in n8n

### 1. Add Google Drive Node (After Creating Document)

After your "Google Docs - Create Document" node, add a **Google Drive** node:

1. Click **+** to add new node
2. Search for "Google Drive"
3. Select **Google Drive** node

### 2. Configure the Google Drive Node

**Node Settings**:
- **Operation**: `Share` → `Create a Permission`
- **Resource**: `File`
- **File ID**: `{{ $('Google Docs - Create Document').json.documentId }}`

**Permission Settings**:
- **Type**: `anyone`
- **Role**: `writer`

**Visual Guide**:
```
┌─────────────────────────────────┐
│ Google Drive                    │
├─────────────────────────────────┤
│ Operation: Create a Permission  │
│                                 │
│ File ID:                        │
│ {{ $('Google Docs').json.       │
│    documentId }}                │
│                                 │
│ Type: anyone                    │
│ Role: writer                    │
└─────────────────────────────────┘
```

### 3. Alternative: Use Google Drive API Node

If the standard node doesn't work, use the **HTTP Request** node:

```javascript
// Node: HTTP Request
// Method: POST
// URL: https://www.googleapis.com/drive/v3/files/{{ $json.documentId }}/permissions

// Authentication: OAuth2 (Google)

// Body (JSON):
{
  "type": "anyone",
  "role": "writer"
}

// Headers:
{
  "Content-Type": "application/json"
}
```

---

## Complete Workflow Sequence

Here's the correct order of nodes in your Script Generator workflow:

```
1. Webhook Trigger
   ↓
2. Get Content from Dashboard
   ↓
3. Format Content for AI
   ↓
4. OpenAI - Generate Script
   ↓
5. Google Docs - Create Document
   ↓
6. Google Drive - Share Document ← THIS IS THE KEY STEP
   ↓
7. Airtable - Save Script Record
   ↓
8. Airtable - Mark Content as Used
   ↓
9. Webhook Response
```

---

## Testing the Setup

### Test the Sharing

1. Run your workflow manually in n8n
2. Check the execution log for the Google Drive node
3. Look for the response - you should see:
   ```json
   {
     "kind": "drive#permission",
     "id": "anyoneWithLink",
     "type": "anyone",
     "role": "writer"
   }
   ```

### Verify Public Access

1. Get the Google Doc URL from Airtable
2. Open the URL in an **incognito/private window** (so you're not signed in)
3. You should be able to:
   - ✅ View the document
   - ✅ Edit the document
   - ✅ Make changes
   - ❌ You should NOT be prompted to sign in

---

## Common Issues & Fixes

### Issue 1: "Permission Denied"

**Cause**: Google Drive API not enabled
**Fix**:
1. Go to Google Cloud Console
2. Enable Google Drive API
3. Reconnect credentials in n8n

### Issue 2: "Sign In Required"

**Cause**: Permission wasn't set to "anyone"
**Fix**:
- Double-check the Type field is `anyone` (not `user` or `domain`)
- Verify Role is `writer` (not `reader` or `commenter`)

### Issue 3: Documents Not Appearing in Dashboard

**Cause**: Airtable record not created or missing google_doc_url
**Fix**:
- Check the "Airtable - Create Script Record" node
- Ensure `google_doc_url` field is set to: `{{ $('Google Docs - Create Document').json.webViewLink }}`

### Issue 4: Link Shows "View Only"

**Cause**: Role set to `reader` instead of `writer`
**Fix**:
- Change Role to `writer` in the Google Drive node
- Delete old permission and re-run workflow

---

## Security Considerations

### ⚠️ Important Notes

**Public = Anyone Can Edit**:
- Anyone with the link can make changes
- Changes are permanent
- No audit trail of who edited what

**Best Practices**:
1. ✅ Use for draft scripts only
2. ✅ Copy final versions to a private doc
3. ✅ Consider using "commenter" role if you don't need full editing
4. ✅ Periodically review and clean up old docs

**Alternative: Restricted Sharing**

If you want editing but not fully public:

```javascript
// Share with specific domain only
{
  "type": "domain",
  "role": "writer",
  "domain": "yourdomain.com"
}

// Share with specific users
{
  "type": "user",
  "role": "writer",
  "emailAddress": "user@example.com"
}
```

---

## Advanced: Batch Permission Updates

If you already have documents and want to make them public:

### Option 1: Manual in Google Drive

1. Open the document
2. Click "Share" (top right)
3. Click "Change to anyone with the link"
4. Set to "Editor"
5. Click "Done"

### Option 2: Automated with n8n

Create a separate workflow:

```
1. Airtable - Get All Scripts
   ↓
2. Loop Through Each Script
   ↓
3. Extract Document ID from URL
   ↓
4. Google Drive - Update Permission
   (Type: anyone, Role: writer)
   ↓
5. Update Airtable with new sharing status
```

**Code to Extract Doc ID**:
```javascript
// From URL: https://docs.google.com/document/d/DOC_ID/edit
const url = $json.google_doc_url;
const docId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];

return {
  json: {
    documentId: docId,
    originalUrl: url
  }
};
```

---

## Verification Checklist

Before going live, verify:

- [ ] Google Drive API enabled in Cloud Console
- [ ] n8n Google credentials have Drive permissions
- [ ] Permission node Type = `anyone`
- [ ] Permission node Role = `writer`
- [ ] Document URL saved to Airtable
- [ ] Dashboard displays "Open Doc" link
- [ ] Link works in incognito mode
- [ ] Document is editable without sign-in

---

## Example n8n Node Configuration (JSON)

```json
{
  "parameters": {
    "resource": "file",
    "operation": "share",
    "fileId": "={{ $('Google Docs - Create Document').json.documentId }}",
    "permissionsUi": {
      "permissionsValues": [
        {
          "type": "anyone",
          "role": "writer"
        }
      ]
    }
  },
  "name": "Google Drive - Make Public",
  "type": "n8n-nodes-base.googleDrive",
  "position": [1200, 300]
}
```

---

## Dashboard Integration

The dashboard automatically:
1. Fetches scripts from Airtable
2. Shows latest 5 scripts
3. Displays "Open Doc" button with the public URL
4. Clicking opens in new tab (ready to edit)

**No additional configuration needed** - once the workflow is set up, the dashboard will display all public documents automatically.

---

## Questions?

Common questions:

**Q: Will this work with Google Workspace accounts?**
A: Yes, but your workspace admin may restrict external sharing. Check your workspace settings.

**Q: Can I make it view-only for some users?**
A: Yes, create two permissions: one `writer` for you, one `reader` for anyone else.

**Q: How do I revoke public access later?**
A: Open the doc → Share → Change from "Anyone with link" to "Restricted"

**Q: Does this cost money?**
A: No, Google Drive API is free for reasonable usage (<1000 requests/day)

---

## Related Documentation

- `N8N_WORKFLOW_TEMPLATE.md` - Full workflow setup
- `PERSONALIZED_SYSTEM_SETUP.md` - Complete system guide
- `README.md` - Project overview
