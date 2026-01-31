# Deploy Instructions - Nate Jones Content System Fixes

## ✅ Code Changes Made (Not Yet Deployed)

### 1. Backend Updates

#### File: `dashboard/src/lib/airtable.ts`
- ✅ Added `getBreakingNewsForScript()` function
- Filters for BREAKING quadrant only
- Limits to 10 records
- Sorts by relevance + published date

#### File: `dashboard/src/app/api/breaking-news/route.ts` (NEW)
- ✅ Created new API endpoint
- Returns top 10 BREAKING news with links
- Format: JSON with success, count, and data fields

---

## 🚀 Deploy Steps

### Option 1: Automatic Deployment (Vercel + Git)

If your dashboard is connected to Vercel via Git:

```bash
cd nate-jones-content-system/dashboard
git add .
git commit -m "feat: add breaking news API endpoint and limit to top 10"
git push origin main
```

Vercel will automatically deploy the changes.

### Option 2: Manual Deployment (Vercel CLI)

```bash
cd nate-jones-content-system/dashboard
npm run build
vercel --prod
```

### Option 3: Local Testing First

```bash
cd nate-jones-content-system/dashboard
npm run dev
```

Then test: `http://localhost:3000/api/breaking-news`

---

## 🔧 n8n Workflow Updates (Do After Deploy)

### Script Generator Workflow (`XRtGZR0MolxzBQw9`)

#### Step 1: Update Content Fetch

Replace the Airtable content fetch node with:

**HTTP Request Node:**
```
Method: GET
URL: https://dashboard-psi-five-20.vercel.app/api/breaking-news
Authentication: None
```

This will automatically:
- ✅ Get only BREAKING news
- ✅ Limit to top 10 items
- ✅ Include links in response
- ✅ Sort by relevance

#### Step 2: Add Google Drive Permission

After the "Google Docs: Create" node, add:

**Google Drive Node:**
```
Resource: File
Operation: Share > Add Permission
File ID: {{ $json.documentId }}

Permission Settings:
- Role: writer
- Type: anyone
- Allow File Discovery: false
```

#### Step 3: Update Script Template

In the GPT node prompt, ensure links are included:

```markdown
For each news item:
**{title}**
🔗 Source: {link}

{summary}
---
```

---

## ✅ Testing Checklist

### After Deployment

1. Test API endpoint:
   ```bash
   curl https://dashboard-psi-five-20.vercel.app/api/breaking-news
   ```

   Expected response:
   ```json
   {
     "success": true,
     "count": 10,
     "data": [...]
   }
   ```

2. Verify data structure:
   - ✅ Each item has `link` field
   - ✅ All items are BREAKING quadrant
   - ✅ Sorted by relevance_score desc
   - ✅ Maximum 10 items returned

### After n8n Updates

1. Run Script Generator workflow manually
2. Check generated Google Doc:
   - ✅ Contains ~10 stories (not 1000)
   - ✅ Each story has a source link
   - ✅ Doc is publicly editable
3. Verify in Airtable:
   - ✅ `used_in_script` = true for used items
   - ✅ Script record created with correct data

---

## 🐛 Troubleshooting

### API Returns 404
- Dashboard not deployed yet
- Deploy to Vercel first

### API Returns 500 Error
- Check Airtable credentials in Vercel env vars:
  - `AIRTABLE_API_KEY`
  - `AIRTABLE_BASE_ID`

### n8n Workflow Fails
- Verify webhook URL is correct
- Check n8n execution logs
- Ensure Google OAuth is connected

### No Breaking News Returned
- Check Airtable data:
  - Are items marked as quadrant="BREAKING"?
  - Are items status="categorized"?
  - Are relevance_scores >= 6?
- Run categorization workflow first

---

## 📋 Quick Command Reference

```bash
# Navigate to dashboard
cd nate-jones-content-system/dashboard

# Install dependencies (if needed)
npm install

# Test locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Test API
curl https://dashboard-psi-five-20.vercel.app/api/breaking-news
```

---

## 🎯 Success Criteria

- [ ] Dashboard deployed with new API endpoint
- [ ] `/api/breaking-news` returns 10 items
- [ ] n8n Script Generator updated
- [ ] Google Docs are publicly editable
- [ ] Links included in generated scripts
- [ ] Content scraper populates `link` field

---

## Need Help?

Run the diagnostic script:
```bash
cd nate-jones-content-system
node fix-workflows.js
```

This will test the API and check your n8n configuration.
