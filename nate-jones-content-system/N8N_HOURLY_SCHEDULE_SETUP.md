# Setting Up Hourly Auto-Refresh for Patrick's AI News System

## Overview

Your system has **two components** that need to refresh every hour:

1. ✅ **Dashboard** - Already configured to auto-refresh every hour
2. ⚠️ **n8n Scraper Workflow** - Needs to be set up in n8n

---

## 1. Dashboard Auto-Refresh (Already Working)

The dashboard automatically fetches new content every hour without you needing to do anything.

**How it works**:
- When you open the dashboard, it loads content immediately
- Every 60 minutes, it automatically fetches fresh data
- You'll see the "Last updated" timestamp update automatically
- The refresh happens in the background (no page reload needed)

**Manual Refresh**:
- Click the "Refresh Now" button anytime to get latest data immediately

---

## 2. n8n Scraper Workflow Setup (Action Required)

You need to create an n8n workflow that runs every hour to fetch new articles.

### Step-by-Step Instructions

#### 1. Login to n8n

Go to: https://keshavs.app.n8n.cloud

#### 2. Create New Workflow

1. Click **"New Workflow"** (top right)
2. Name it: `[Patrick] AI News Hourly Scraper`

#### 3. Add Schedule Trigger

**Node 1: Schedule Trigger**

1. Click **"+"** to add a node
2. Search for **"Schedule Trigger"**
3. Click to add it

**Configuration**:
```
Trigger Interval: Hour
Hours Between Triggers: 1
Trigger at Minute: 0
```

This will run at: 12:00 AM, 1:00 AM, 2:00 AM, etc. (every hour on the hour)

**Alternative Configuration** (if you want offset):
```
Trigger Interval: Hour
Hours Between Triggers: 1
Trigger at Minute: 15
```
This runs at: 12:15 AM, 1:15 AM, 2:15 AM, etc.

#### 4. Add HTTP Request Node

**Node 2: HTTP Request - Get Sources**

1. Click **"+"** after Schedule Trigger
2. Search for **"HTTP Request"**
3. Add it

**Configuration**:
```
Method: GET
URL: https://dashboard-psi-five-20.vercel.app/api/sources
```

This fetches your Google Sheets sources (YouTube channels, etc.)

#### 5. Add Split In Batches Node

**Node 3: Split In Batches**

1. Add **"Split In Batches"** node
2. Configuration:
   ```
   Batch Size: 1
   ```

This processes one source at a time to avoid rate limits.

#### 6. Add Switch Node (Route by Source Type)

**Node 4: Switch**

1. Add **"Switch"** node
2. Mode: **Rules**
3. Add 4 outputs:

**Output 1** (YouTube):
```
Condition: {{ $json.type === 'youtube' }}
```

**Output 2** (X/Twitter):
```
Condition: {{ $json.type === 'x' }}
```

**Output 3** (Web):
```
Condition: {{ $json.type === 'web' }}
```

**Output 4** (RSS):
```
Condition: {{ $json.type === 'rss' }}
```

#### 7. Add RSS Feed Reader (for YouTube)

**Node 5a: RSS Feed Read** (connected to Output 1)

1. Add **"RSS Feed Read"** node to Output 1
2. Configuration:
   ```
   URL: https://www.youtube.com/feeds/videos.xml?channel_id={{ $json.url.split('/').pop() }}
   ```

This converts YouTube channel URLs to RSS feeds automatically.

#### 8. Add Code Node to Format Data

**Node 6a: Code - Format YouTube**

1. Add **"Code"** node after RSS Feed Read
2. Language: **JavaScript**
3. Code:

```javascript
const items = [];

for (const item of $input.all()) {
  const publishedDate = item.json.pubDate || item.json.isoDate;

  // Only include articles from last 2 days
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const articleDate = new Date(publishedDate);

  if (articleDate >= twoDaysAgo) {
    items.push({
      json: {
        content_id: item.json.id || item.json.guid,
        title: item.json.title,
        link: item.json.link,
        published_date: publishedDate,
        author: item.json.creator || 'Unknown',
        description: item.json.contentSnippet || item.json.description || '',
        thumbnail: item.json['media:thumbnail']?.url || '',
        source_name: $('HTTP Request - Get Sources').item.json.source_name,
        source_type: 'youtube',
        status: 'pending',
        scraped_at: new Date().toISOString(),
      }
    });
  }
}

return items;
```

#### 9. Add Airtable Node to Save Content

**Node 7: Airtable - Insert**

1. Add **"Airtable"** node
2. Operation: **Append**
3. Configuration:
   ```
   Base: Keshav AI News Pipeline
   Table: Content
   ```

4. **Map Fields**:
   - Click "Add Field"
   - Map each field from the previous node:
     - content_id → {{ $json.content_id }}
     - title → {{ $json.title }}
     - link → {{ $json.link }}
     - published_date → {{ $json.published_date }}
     - author → {{ $json.author }}
     - description → {{ $json.description }}
     - thumbnail → {{ $json.thumbnail }}
     - source_name → {{ $json.source_name }}
     - source_type → {{ $json.source_type }}
     - status → {{ $json.status }}
     - scraped_at → {{ $json.scraped_at }}

5. **Important Settings**:
   - Enable **"Ignore if exists"** (prevents duplicates)
   - Use `content_id` as unique identifier

#### 10. Loop Back to Process Next Source

1. Connect the Airtable node back to the **Split In Batches** node
2. This creates a loop that processes all sources one by one

#### 11. Activate the Workflow

**IMPORTANT FINAL STEPS**:

1. Click **"Save"** (top right)
2. Toggle the workflow to **"Active"** (switch at top)
3. The workflow will now run automatically every hour

---

## Testing Your Setup

### Test Immediately (Don't Wait for Next Hour)

1. Click **"Execute Workflow"** button (play icon at bottom)
2. Watch the nodes light up as they execute
3. Check for errors (red nodes = error)
4. Verify data appears in Airtable → Content table

### Check Execution History

1. Click **"Executions"** tab (top of workflow)
2. See all past runs
3. Click any execution to see details
4. Look for:
   - ✅ Green = Success
   - ❌ Red = Failed
   - ⏸️ Gray = Waiting

---

## Expected Schedule

Once activated, your workflow will run:

```
Hour 00:00 → Scrape all sources
Hour 01:00 → Scrape all sources
Hour 02:00 → Scrape all sources
Hour 03:00 → Scrape all sources
...and so on, 24/7
```

**Dashboard updates**:
- Fetches new data every hour automatically
- Shows "Last updated" timestamp
- You can click "Refresh Now" anytime

---

## Monitoring Your System

### Daily Check (Recommended)

**Morning routine** (~5 minutes):
1. Open dashboard: https://dashboard-psi-five-20.vercel.app
2. Check "Last updated" time (should be recent)
3. Review articles - select ones for script
4. Click "Generate Script"
5. Review generated script in Google Doc
6. Done!

### Weekly Check

**n8n Health Check**:
1. Login to n8n: https://keshavs.app.n8n.cloud
2. Open your scraper workflow
3. Check **"Executions"** tab
4. Verify last 168 executions succeeded (24 hours × 7 days)
5. If you see failures, click to view error details

### Troubleshooting

**If no new articles appear**:
1. Check n8n executions for errors
2. Verify Google Sheet is public
3. Test sources endpoint: `curl https://dashboard-psi-five-20.vercel.app/api/sources`
4. Check Airtable for new records

**If workflow stops running**:
1. Go to n8n workflow
2. Check if toggle is still "Active" (green)
3. If inactive, toggle it back on
4. Check n8n account limits (free tier has execution limits)

---

## Advanced: Adjust Timing

### Run Every 2 Hours Instead

Schedule Trigger settings:
```
Trigger Interval: Hour
Hours Between Triggers: 2
```

### Run Every 30 Minutes

Schedule Trigger settings:
```
Trigger Interval: Minutes
Minutes Between Triggers: 30
```

### Run Only During Business Hours

1. Add **"IF"** node after Schedule Trigger
2. Condition:
   ```javascript
   {{ new Date().getHours() >= 9 && new Date().getHours() <= 17 }}
   ```
3. This only processes between 9 AM - 5 PM

### Run Only on Weekdays

1. Add **"IF"** node after Schedule Trigger
2. Condition:
   ```javascript
   {{ new Date().getDay() >= 1 && new Date().getDay() <= 5 }}
   ```
3. This skips Saturdays (0) and Sundays (6)

---

## Cost Considerations

### n8n Cloud Limits

Check your n8n plan:
- **Free tier**: Limited executions per month
- **Starter**: ~$20/month, more executions
- **Pro**: Unlimited executions

**Hourly schedule = 720 executions/month** (24 hours × 30 days)

If you hit limits:
- Reduce to every 2-3 hours
- Or upgrade your n8n plan

### API Rate Limits

**YouTube RSS**:
- No strict limits for RSS feeds
- Google may throttle if excessive

**Recommendation**:
- Start with hourly
- If you get rate limit errors, switch to every 2 hours

---

## Verification Checklist

Before considering your system "live":

- [ ] Dashboard opens at https://dashboard-psi-five-20.vercel.app
- [ ] Dashboard shows "Auto-refreshes every hour" message
- [ ] n8n workflow is created
- [ ] Schedule Trigger is set to every hour
- [ ] Workflow is toggled to "Active"
- [ ] Test execution runs successfully
- [ ] New articles appear in Airtable
- [ ] Articles from last 2 days only
- [ ] Dashboard shows the new articles
- [ ] "Last updated" timestamp updates every hour

---

## Quick Reference

**Dashboard**: https://dashboard-psi-five-20.vercel.app
**n8n**: https://keshavs.app.n8n.cloud
**Airtable**: https://airtable.com (your Content table)
**Google Sheet**: https://docs.google.com/spreadsheets/d/1eXbZx46eOykP3h_8DElIqtm41oDobrBDxftRsnpIp5k/edit

**API Endpoints**:
- Sources: https://dashboard-psi-five-20.vercel.app/api/sources
- Top Picks: https://dashboard-psi-five-20.vercel.app/api/top-picks
- Test Airtable: https://dashboard-psi-five-20.vercel.app/api/test-airtable

---

## Support Files

- Full workflow template: `N8N_WORKFLOW_TEMPLATE.md`
- System setup guide: `PERSONALIZED_SYSTEM_SETUP.md`
- Google Docs sharing: `GOOGLE_DOCS_PUBLIC_SETUP.md`

Your system is ready to run 24/7! 🚀
