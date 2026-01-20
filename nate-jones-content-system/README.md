# Nate B Jones Content System

A complete content automation system that scrapes news from Nate B Jones, categorizes it using AI into quadrants, and generates daily video scripts for Patrick (the ICP - average 9-5 professionals who want to stay informed about AI).

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Workflow 1    │────▶│   Workflow 2    │────▶│   Workflow 3    │
│ Content Scraper │     │AI Categorization│     │Script Generator │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                        ┌─────────────────┐
                        │    Airtable     │
                        │   (Database)    │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Next.js        │
                        │  Dashboard      │
                        └─────────────────┘
```

## Content Quadrants

Content is categorized into 4 quadrants based on Patrick's needs:

| Quadrant | Description | Examples |
|----------|-------------|----------|
| **BREAKING** | Time-sensitive AI news | Major releases, acquisitions, policy changes |
| **STRATEGY** | Business/implementation insights | How to use AI tools, best practices |
| **MARKET** | Industry trends & analysis | Market predictions, company moves |
| **CAREER** | Professional development | Skills to learn, job market changes |

## n8n Workflows

### Workflow 1: Content Scraper (`AGVGfqPEhBO9Zs4l`)
- **Schedule**: Every 6 hours
- **Sources**:
  - Nate B Jones YouTube RSS feed
  - Nate's Newsletter Substack RSS
- **Output**: Raw content items to Airtable

### Workflow 2: AI Categorization (`xsu7Wa8gzTrkbtdM`)
- **Trigger**: Webhook (from dashboard or scheduler)
- **AI Model**: GPT-4o-mini
- **Tasks**:
  - Assign quadrant (BREAKING/STRATEGY/MARKET/CAREER)
  - Score relevance (1-10) for Patrick
  - Determine urgency (HIGH/MEDIUM/LOW)
  - Extract key takeaways
  - Generate talking points

### Workflow 3: Script Generator (`XRtGZR0MolxzBQw9`)
- **Trigger**: Webhook (from dashboard)
- **AI Model**: GPT-4o
- **Output**: ~7 minute video script in Google Docs
- **Format**: Hook → Intro → Main stories → Call to action

## Dashboard Features

### Main Dashboard (`/`)
- Content statistics by status
- Quadrant distribution
- Quick action buttons to trigger workflows
- Recent categorized content

### Content Library (`/content`)
- Browse all scraped content
- Filter by quadrant and status
- View AI analysis details
- Relevance scores at a glance

### Scripts Page (`/scripts`)
- View all generated scripts
- Track script status: Draft → Approved → Recorded → Uploaded
- Quick links to Google Docs

## Setup Instructions

### 1. Airtable Setup

Create a new Airtable base with two tables:

**Content Table:**
- `content_id` (Single line text)
- `title` (Single line text)
- `link` (URL)
- `published_date` (Date)
- `author` (Single line text)
- `description` (Long text)
- `source` (Single line text)
- `source_type` (Single select: youtube_video, substack_article)
- `status` (Single select: pending_categorization, categorized, low_relevance, used_in_script)
- `quadrant` (Single select: BREAKING, STRATEGY, MARKET, CAREER)
- `relevance_score` (Number)
- `urgency` (Single select: HIGH, MEDIUM, LOW)
- `key_takeaways` (Long text)
- `talking_points` (Long text)
- `ai_summary` (Long text)
- `used_in_script` (Checkbox)
- `scraped_at` (Date)

**Scripts Table:**
- `script_id` (Auto number)
- `script_date` (Date)
- `script_title` (Single line text)
- `google_doc_url` (URL)
- `word_count` (Number)
- `items_used` (Long text)
- `status` (Single select: draft, approved, recorded, uploaded)
- `youtube_url` (URL)
- `notes` (Long text)

### 2. Environment Variables

Create `dashboard/.env.local`:

```env
# Airtable
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_CONTENT_TABLE=Content
AIRTABLE_SCRIPTS_TABLE=Scripts

# n8n Webhooks
N8N_SCRAPER_WEBHOOK=https://your-n8n-instance/webhook/nate-content-scraper
N8N_CATEGORIZE_WEBHOOK=https://your-n8n-instance/webhook/nate-categorize
N8N_SCRIPT_WEBHOOK=https://your-n8n-instance/webhook/nate-script-gen
```

### 3. n8n Configuration

For each workflow, configure:

1. **Airtable credentials**: Add your API key and base ID
2. **OpenAI credentials**: For GPT-4o/GPT-4o-mini
3. **Google Docs credentials**: For script generation (OAuth2)

Update webhook URLs in the workflows to match your n8n instance.

### 4. Run the Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Scrape Content**: Click "Run Scraper" to fetch latest content from Nate B Jones
2. **Categorize**: Click "Categorize Content" to run AI analysis on pending items
3. **Generate Script**: Click "Generate Script" to create today's video script
4. **Manage Scripts**: Track script status through the workflow (draft → approved → recorded → uploaded)

## Patrick ICP Profile

Patrick is the target audience for the generated scripts:
- 9-5 professional (not technical)
- Wants to stay informed about AI without deep diving
- Needs practical, actionable insights
- Appreciates clear explanations of complex topics
- Values knowing "what this means for me"

## Content Sources

- **YouTube**: [Nate B Jones](https://www.youtube.com/@NateBJones) - AI News & Strategy Daily (127K subscribers)
- **Substack**: [Nate's Newsletter](https://natesnewsletter.substack.com)
- **TikTok**: [@nate.b.jones](https://www.tiktok.com/@nate.b.jones) (458K followers)
- **Website**: [natebjones.com](https://natebjones.com)

## Project Structure

```
nate-jones-content-system/
├── dashboard/                # Next.js dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/          # API routes
│   │   │   ├── content/      # Content library page
│   │   │   ├── scripts/      # Scripts management page
│   │   │   └── page.tsx      # Main dashboard
│   │   └── lib/
│   │       └── airtable.ts   # Airtable client
│   └── .env.local            # Environment config
├── AIRTABLE_SCHEMA.md        # Database documentation
└── README.md                 # This file
```

## n8n Workflow IDs

| Workflow | ID |
|----------|-----|
| Content Scraper | `AGVGfqPEhBO9Zs4l` |
| AI Categorization | `xsu7Wa8gzTrkbtdM` |
| Script Generator | `XRtGZR0MolxzBQw9` |
