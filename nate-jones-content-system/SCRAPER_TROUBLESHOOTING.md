# Troubleshooting: n8n Scraper Not Running

## Current Issue

Your Airtable only has **1 content record** from **January 22nd**. This means the scraper workflow is **not running** or **not working correctly**.

---

## Quick Diagnosis

### Step 1: Check if n8n Workflow Exists

1. Go to: https://keshavs.app.n8n.cloud
2. Login with your credentials
3. Look for a workflow named something like:
   - `AI News Scraper`
   - `Patrick AI News Scraper`
   - `Hourly Scraper`
   - Or any workflow with "scraper" or "news" in the name

**Result**:
- ✅ **Workflow exists** → Go to Step 2
- ❌ **No workflow exists** → You need to create it (see [Creating the Workflow](#creating-the-workflow))

---

### Step 2: Check if Workflow is Active

If workflow exists:

1. Open the workflow in n8n
2. Look at the **top right** - is there a toggle switch?
3. Check the color:
   - 🟢 **Green/Active** → Workflow is running (go to Step 3)
   - ⚪ **Gray/Inactive** → Workflow is OFF (toggle it ON)

**If workflow is inactive**:
1. Click the toggle to turn it ON (it will turn green)
2. Click **"Save"** button
3. Wait 1 hour for next execution
4. Check Airtable for new records

---

### Step 3: Check Execution History

If workflow is active but no new data:

1. In the workflow editor, click **"Executions"** tab (top)
2. Look at the list of past executions
3. Check:
   - Are there **recent executions** (within last hour)?
   - What is the **status** of executions?
     - ✅ Green = Success
     - ❌ Red = Failed
     - ⏸️ Gray = Waiting

**If NO recent executions**:
- Workflow schedule might be broken
- Go to [Fix Schedule Trigger](#fix-schedule-trigger)

**If executions are RED (failed)**:
- Click on a failed execution to see error details
- Common errors listed below in [Common Errors](#common-errors)

---

### Step 4: Check Google Sheet Sources

Test if your sources endpoint is working:

```bash
curl https://dashboard-psi-five-20.vercel.app/api/sources
```

**Expected result**:
```json
{
  "success": true,
  "count": 29,
  "data": [
    {
      "source_name": "Matt Wolfe",
      "url": "https://www.youtube.com/@mreflow",
      "type": "youtube",
      "active": true,
      "tags": ["ai-tools", "tutorials", "reviews"]
    },
    ...
  ]
}
```

**If you get an error**:
- Your Google Sheet isn't public
- Go to: https://docs.google.com/spreadsheets/d/1eXbZx46eOykP3h_8DElIqtm41oDobrBDxftRsnpIp5k/edit
- Click **"Share"** → **"Anyone with the link"** → **"Viewer"**
- Try the curl command again

---

## Creating the Workflow

If you don't have a scraper workflow yet, follow these steps:

### Option 1: Quick Test Workflow (5 minutes)

This creates a simple workflow that runs once to test everything:

1. **Login to n8n**: https://keshavs.app.n8n.cloud
2. **Create New Workflow**
3. **Add Manual Trigger** (for testing)
4. **Add HTTP Request Node**:
   ```
   Method: GET
   URL: https://dashboard-psi-five-20.vercel.app/api/sources
   ```

5. **Add Code Node** (to test YouTube RSS):
   ```javascript
   // Test with first YouTube source only
   const sources = $json.data.filter(s => s.type === 'youtube');
   const firstSource = sources[0];

   return [{
     json: {
       source_name: firstSource.source_name,
       channel_url: firstSource.url,
       rss_url: `https://www.youtube.com/feeds/videos.xml?channel_id=${firstSource.url.split('/').pop()}`
     }
   }];
   ```

6. **Add RSS Feed Read Node**:
   ```
   URL: {{ $json.rss_url }}
   ```

7. **Add Code Node** (format for Airtable):
   ```javascript
   const items = [];

   for (const item of $input.all()) {
     items.push({
       json: {
         content_id: `yt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
         title: item.json.title,
         link: item.json.link,
         published_date: item.json.pubDate || item.json.isoDate,
         author: item.json.creator || 'Unknown',
         description: item.json.contentSnippet || item.json.description || '',
         thumbnail: item.json['media:thumbnail']?.url || '',
         source_name: $('Code').first().json.source_name,
         source_type: 'youtube',
         status: 'pending',
         scraped_at: new Date().toISOString(),
       }
     });
   }

   return items;
   ```

8. **Add Airtable Node**:
   ```
   Operation: Append
   Base: Keshav AI News Pipeline
   Table: Content

   Map all fields from previous node
   ```

9. **Test**: Click "Execute Workflow"
10. **Check Airtable**: Should see new YouTube videos

**If test works**, continue to Option 2 to make it hourly.

---

### Option 2: Full Hourly Workflow (15 minutes)

Follow the complete guide in: `N8N_HOURLY_SCHEDULE_SETUP.md`

**Key steps**:
1. Replace "Manual Trigger" with "Schedule Trigger"
2. Set schedule to every hour
3. Add loop for all sources (not just first one)
4. Toggle workflow to Active

---

## Fix Schedule Trigger

If your workflow exists but isn't running on schedule:

1. **Open the workflow** in n8n
2. **Click on the first node** (should be "Schedule Trigger")
3. **Check settings**:
   ```
   Trigger Interval: Hour
   Hours Between Triggers: 1
   Trigger at Minute: 0 (or any number 0-59)
   ```

4. **Common mistakes**:
   - ❌ Trigger Interval set to "Minutes" with 60 minutes (use "Hour" instead)
   - ❌ Hours Between Triggers set to 24 (that's once per day, not hourly)
   - ❌ Using "Cron" mode with wrong expression

5. **Save and Activate**:
   - Click **"Save"**
   - Toggle to **Active**
   - Wait for top of next hour to test

---

## Common Errors

### Error: "Invalid URL"

**Cause**: YouTube channel URL format is wrong

**Fix**: Code node should extract channel ID:
```javascript
// Wrong:
rss_url: `https://www.youtube.com/feeds/videos.xml?channel_id=${$json.url}`

// Right:
rss_url: `https://www.youtube.com/feeds/videos.xml?channel_id=${$json.url.split('/').pop()}`
```

### Error: "Table 'Content' not found"

**Cause**: Airtable table name mismatch

**Fix**:
1. Check Airtable base - table must be named exactly: `Content` (capital C)
2. In n8n Airtable node, select table from dropdown (don't type it)

### Error: "Duplicate record"

**Cause**: Content ID already exists

**Fix**: Add unique timestamp to content_id:
```javascript
content_id: `yt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

### Error: "Rate limit exceeded"

**Cause**: Too many requests to YouTube/RSS

**Fix**:
1. Add "Wait" node between sources (1-2 seconds)
2. Reduce frequency to every 2-3 hours instead of hourly

### Error: "Workflow execution timeout"

**Cause**: Processing too many sources at once

**Fix**:
1. Use "Split In Batches" node with batch size = 1
2. Process sources one at a time

---

## Manual Test Commands

### Test 1: Check Airtable Content

```bash
curl https://dashboard-psi-five-20.vercel.app/api/debug-content
```

Shows:
- Total records in Airtable
- Latest scraped date
- Records per day
- List of all content

### Test 2: Check Sources

```bash
curl https://dashboard-psi-five-20.vercel.app/api/sources
```

Shows:
- All sources from Google Sheet
- Count of sources
- Source types

### Test 3: Check Top Picks

```bash
curl https://dashboard-psi-five-20.vercel.app/api/top-picks
```

Shows:
- Articles with relevance >= 8
- Only from last 2 days
- Should return content if scraper is working

---

## Expected Results After Fixing

Once working correctly:

**After 1 Hour**:
- Check n8n Executions → Should see 1 new execution (green)
- Check Airtable → Should see 20-50 new articles (depending on sources)
- Check Dashboard → Should see new articles with today's scraped date

**After 24 Hours**:
- Should have 24 executions in n8n
- Should have 480-1200 new articles in Airtable (20-50 per hour × 24)
- Dashboard shows fresh content from all YouTube channels

**After 1 Week**:
- Should have 168 executions (24 × 7)
- Airtable has lots of content (but old items auto-filtered out by date)
- Dashboard only shows last 2 days of content

---

## Emergency: Create Content Manually

If you need content NOW while fixing the scraper:

1. **Go to Airtable**: https://airtable.com
2. **Open**: Keshav AI News Pipeline → Content table
3. **Click**: "+ Add record" (blue button)
4. **Fill in minimum fields**:
   ```
   content_id: test_001
   title: Test Article Title
   link: https://example.com/article
   source_name: Manual Entry
   source_type: web
   status: pending
   scraped_at: 2026-02-01T12:00:00.000Z
   published_date: 2026-02-01
   ```
5. **Save**
6. **Check Dashboard** - should appear immediately

---

## Verification Checklist

Before considering the scraper "fixed":

- [ ] n8n workflow exists
- [ ] Workflow toggle is GREEN (Active)
- [ ] Schedule Trigger set to every 1 hour
- [ ] Google Sheet is public (sources API works)
- [ ] Airtable table named "Content" exists
- [ ] Workflow executes successfully (green in Executions tab)
- [ ] New records appear in Airtable after execution
- [ ] Dashboard shows new articles
- [ ] Articles have today's scraped_at date
- [ ] At least 10+ new articles per hour

---

## Get Help

**Check these in order**:

1. **n8n Execution Logs**:
   - Click on failed execution
   - Read error message
   - Check which node failed

2. **Airtable Activity Log**:
   - Go to your base
   - Check if any records were added recently

3. **Dashboard Debug Endpoint**:
   ```
   https://dashboard-psi-five-20.vercel.app/api/debug-content
   ```

4. **n8n Community Forum**:
   - https://community.n8n.io/
   - Search for similar issues
   - Post your workflow JSON if needed

---

## Next Steps

1. **Run diagnostics** (curl commands above)
2. **Check n8n workflow status**
3. **Fix any errors** using this guide
4. **Test manually** (Execute Workflow button)
5. **Activate and wait 1 hour**
6. **Verify** new content appears

---

## Quick Links

- **Dashboard**: https://dashboard-psi-five-20.vercel.app
- **n8n**: https://keshavs.app.n8n.cloud
- **Airtable**: https://airtable.com
- **Google Sheet**: https://docs.google.com/spreadsheets/d/1eXbZx46eOykP3h_8DElIqtm41oDobrBDxftRsnpIp5k/edit

**Debug Endpoints**:
- Content Debug: https://dashboard-psi-five-20.vercel.app/api/debug-content
- Sources: https://dashboard-psi-five-20.vercel.app/api/sources
- Airtable Test: https://dashboard-psi-five-20.vercel.app/api/test-airtable

Your scraper should be running 24/7 once set up! 🚀
