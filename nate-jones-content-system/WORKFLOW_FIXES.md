# Workflow Fixes for Nate Jones Content System

## Issues Fixed

1. ✅ Limited to top 10 BREAKING news items (not all 1000)
2. ✅ Links are now included in the API response
3. ✅ New API endpoint: `/api/breaking-news`
4. 🔧 Need to update n8n workflows (instructions below)

---

## 1. Fix Script Generator Workflow (`XRtGZR0MolxzBQw9`)

### Current Issue
- Fetches ALL content (1000 records)
- Doesn't filter for BREAKING news only
- May not include links in the script

### Fix Steps

#### Option A: Use New API Endpoint (Recommended)
1. Open workflow in n8n cloud
2. Find the node that fetches content from Airtable
3. Replace with **HTTP Request** node:
   ```
   Method: GET
   URL: https://dashboard-psi-five-20.vercel.app/api/breaking-news
   ```
4. This returns top 10 BREAKING news items with links included

#### Option B: Update Airtable Filter
1. Find the **Airtable** node that gets content
2. Update the filter formula to:
   ```
   AND(
     {quadrant} = "BREAKING",
     {status} = "categorized",
     {used_in_script} = FALSE(),
     {relevance_score} >= 6
   )
   ```
3. Set **Limit**: `10`
4. Set **Sort**:
   - Field: `relevance_score`, Direction: `desc`
   - Field: `published_date`, Direction: `desc`

### Make Google Doc Publicly Editable

After the node that creates the Google Doc, add:

1. **Google Drive** node
2. Operation: **Share** → **Add Permission**
3. Settings:
   - **File ID**: `{{ $json.documentId }}` (from previous node)
   - **Role**: `writer`
   - **Type**: `anyone`

### Include Links in the Script

In the **GPT-4** node that generates the script, update the prompt to include:

```
For each news item, include:
- Title
- Link: {{ $json.link }}
- Key takeaways
- Talking points
```

---

## 2. Fix Content Scraper (`AGVGfqPEhBO9Zs4l`)

### Verify These Settings

1. **RSS Feed Parser** nodes:
   - YouTube Feed: `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`
   - Substack Feed: `https://natebjonescontent.substack.com/feed`

2. **Airtable Insert** node:
   - Make sure these fields are mapped:
     - `content_id`
     - `title`
     - **`link`** ← CRITICAL (must be included)
     - `published_date`
     - `author`
     - `description`
     - `thumbnail`
     - `source`
     - `source_type`
     - `status` → `pending_categorization`
     - `scraped_at` → `{{ $now }}`

3. **Test the scraper**:
   - Run manually and verify records appear in Airtable
   - Check that the `link` field is populated

---

## 3. Fix AI Categorization (`xsu7Wa8gzTrkbtdM`)

### Verify Filter

The workflow should only process items with:
```
{status} = "pending_categorization"
```

### Batch Size
- Limit: `20` records per run (not 1000)
- This prevents API timeouts

---

## 4. Dashboard API Update

New endpoint available: **`/api/breaking-news`**

### Response Format
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "rec123",
      "content_id": "vid_123",
      "title": "Breaking: New AI Model Released",
      "link": "https://youtube.com/watch?v=...",
      "published_date": "2026-01-27",
      "relevance_score": 9,
      "urgency": "HIGH",
      "key_takeaways": "...",
      "talking_points": "...",
      "ai_summary": "..."
    }
  ]
}
```

---

## 5. Testing Checklist

- [ ] Scraper runs and populates Airtable with links
- [ ] Categorization workflow processes pending items
- [ ] Script generator fetches only top 10 BREAKING news
- [ ] Generated Google Doc includes source links
- [ ] Google Doc is publicly editable (anyone with link)
- [ ] Dashboard shows correct stats
- [ ] New `/api/breaking-news` endpoint returns 10 items

---

## 6. Quick Test Commands

### Test the new API endpoint
```bash
curl https://dashboard-psi-five-20.vercel.app/api/breaking-news
```

### Expected: Returns 10 BREAKING news items with links

---

## Need Help?

If you need me to:
1. Export your n8n workflows and show you exact changes
2. Create a video walkthrough
3. Debug specific errors

Just let me know!
