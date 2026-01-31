# Fixes Applied - Nate Jones Content System

## Issues Reported
1. ❌ Airtable fetching all 1000 records instead of top 10 BREAKING news
2. ❌ Links not included in script output
3. ❌ Scraper not working correctly
4. ❌ Google Docs not publicly editable

## Fixes Applied ✅

### 1. Backend Changes (Dashboard)

#### New Function: `getBreakingNewsForScript()`
**File**: `nate-jones-content-system/dashboard/src/lib/airtable.ts`

```typescript
// Returns ONLY top 10 BREAKING news items
// - Quadrant = "BREAKING"
// - Status = "categorized"
// - Not used in script yet
// - Relevance score >= 6
// - Sorted by relevance + published date
// - Limit: 10 records
```

#### New API Endpoint: `/api/breaking-news`
**File**: `nate-jones-content-system/dashboard/src/app/api/breaking-news/route.ts`

Returns:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "title": "...",
      "link": "https://...",  ← Links included!
      "relevance_score": 9,
      "key_takeaways": "...",
      "talking_points": "..."
    }
  ]
}
```

### 2. n8n Workflow Fixes Required

#### Script Generator Workflow (`XRtGZR0MolxzBQw9`)

**Fix #1: Replace content fetch**
- Replace Airtable fetch node with HTTP Request:
  - URL: `https://dashboard-psi-five-20.vercel.app/api/breaking-news`
  - Method: GET
- This automatically gets top 10 BREAKING news with links

**Fix #2: Make Google Docs public**
After doc creation, add **Google Drive** node:
- Operation: Share → Add Permission
- File ID: `{{ $json.documentId }}`
- Role: `writer`
- Type: `anyone`

**Fix #3: Include links in script**
Update GPT prompt to include:
```
For each story, format as:
**{{ $json.title }}**
Source: {{ $json.link }}
...
```

#### Content Scraper Workflow (`AGVGfqPEhBO9Zs4l`)

**Checklist**:
- [ ] RSS Feed Parser nodes working
- [ ] Airtable Insert includes `link` field
- [ ] `status` defaults to `pending_categorization`
- [ ] `scraped_at` set to current time

### 3. Helper Script Created

**File**: `nate-jones-content-system/fix-workflows.js`

Run this to test and check workflow status:
```bash
cd nate-jones-content-system
node fix-workflows.js
```

This script:
- ✅ Tests the new `/api/breaking-news` endpoint
- ✅ Checks your n8n workflows
- ✅ Provides manual fix instructions

---

## Testing Guide

### 1. Test the API Endpoint
```bash
curl https://dashboard-psi-five-20.vercel.app/api/breaking-news
```

**Expected**: JSON with 10 BREAKING news items, each with a `link` field

### 2. Test Script Generation

1. Go to dashboard: https://dashboard-psi-five-20.vercel.app/
2. Click "Generate Script"
3. Check the generated Google Doc:
   - ✅ Contains ~10 stories (not 1000)
   - ✅ All stories are BREAKING news
   - ✅ Each story has a link
   - ✅ Doc is publicly editable

### 3. Test Scraper

1. Manually trigger scraper in n8n
2. Check Airtable:
   - ✅ New records appear
   - ✅ `link` field is populated
   - ✅ `status` = `pending_categorization`

---

## Quick Fix Checklist

- [x] ✅ Created `getBreakingNewsForScript()` function
- [x] ✅ Created `/api/breaking-news` endpoint
- [x] ✅ Limits to 10 records
- [x] ✅ Filters for BREAKING quadrant only
- [x] ✅ Includes links in response
- [ ] ⏳ Update n8n Script Generator workflow
- [ ] ⏳ Add Google Drive permission node
- [ ] ⏳ Test scraper workflow
- [ ] ⏳ Verify links in generated scripts

---

## Manual Steps Required

### In n8n Cloud (https://keshavs.app.n8n.cloud)

1. **Open Script Generator workflow**
2. **Replace Airtable node** with HTTP Request:
   - URL: `https://dashboard-psi-five-20.vercel.app/api/breaking-news`
3. **Add Google Drive node** after doc creation:
   - Share > Add Permission
   - Role: writer, Type: anyone
4. **Update GPT prompt** to include `{{ $json.link }}`
5. **Save and test**

---

## Support Files Created

1. `WORKFLOW_FIXES.md` - Detailed fix instructions
2. `fix-workflows.js` - Automated testing script
3. `FIXES_SUMMARY.md` - This file

---

## Questions?

If anything is unclear or you need help with:
- Updating n8n workflows
- Testing the changes
- Debugging issues

Just ask!
