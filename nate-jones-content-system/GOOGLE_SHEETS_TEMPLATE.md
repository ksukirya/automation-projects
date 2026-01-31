# Google Sheets Setup for AI News Sources

## Create Your Sources Sheet

### Sheet Name: `AI News Sources`

### Columns:

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| **Source Name** | **URL** | **Type** | **Active** | **Tags** |

### Example Data:

| Source Name | URL | Type | Active | Tags |
|------------|-----|------|--------|------|
| AI Explained | https://www.youtube.com/@aiexplained-official | youtube | TRUE | ai-news,technical |
| Matt Wolfe | https://www.youtube.com/@mreflow | youtube | TRUE | ai-tools,tutorials |
| OpenAI Blog | https://openai.com/blog | web | TRUE | official,releases |
| AI Twitter Feed | https://twitter.com/ai_news | x | TRUE | breaking,updates |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ | rss | TRUE | industry,business |
| Anthropic Blog | https://www.anthropic.com/news | web | TRUE | official,research |

### Column Definitions:

- **Source Name**: Display name for the source
- **URL**:
  - YouTube: Channel URL or RSS feed
  - X: Twitter profile URL or search URL
  - Web: Website URL
  - RSS: Direct RSS feed URL
- **Type**: One of: `youtube`, `x`, `web`, `rss`
- **Active**: `TRUE` or `FALSE` (whether to scrape this source)
- **Tags**: Comma-separated tags for filtering

### Setup Instructions:

1. Create a new Google Sheet
2. Name it: **AI News Sources**
3. Add the columns above
4. Fill in your sources
5. Share the sheet:
   - Click "Share" button
   - Change to "Anyone with the link can VIEW"
   - Copy the sheet ID from URL:
     - URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Save the SHEET_ID for n8n configuration

---

## Second Sheet: `Content Categories`

### Sheet Name: `Categories`

For Patrick (your ICP), categorize content into:

| Category | Description | Keywords |
|----------|-------------|----------|
| **USE_CASES** | Practical AI applications for business | automation, workflow, productivity, roi |
| **TOOLS** | New AI tools and platforms | saas, tool, platform, app |
| **INDUSTRY** | AI adoption in specific industries | healthcare, real-estate, legal, finance |
| **STRATEGY** | Business strategy and AI integration | strategy, implementation, planning |
| **BREAKING** | Major announcements and releases | release, announcement, launch, funding |

---

## Google Sheets API Setup

### Enable API Access:

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable **Google Sheets API**
4. Create credentials:
   - Type: **Service Account**
   - Download JSON key file
5. Share your Google Sheet with the service account email
   - Email looks like: `your-service@project-id.iam.gserviceaccount.com`
   - Give "Editor" access

### Store Credentials:

Save in `.env.local`:
```
GOOGLE_SHEETS_CLIENT_EMAIL=your-service@project-id.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----
GOOGLE_SHEETS_SOURCES_ID=YOUR_SHEET_ID_HERE
```

---

## Alternative: Public Sheet (Read-Only)

If you don't want to set up service account:

1. Make sheet publicly viewable
2. Use the sheet ID only
3. Access via public API (limited to reading)

URL format:
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0
```
