# Personalized AI News System for Patrick

## Overview

This system automatically:
1. ✅ Fetches news from YOUR Google Sheet sources (YouTube, X, Web, RSS)
2. ✅ Categorizes content using AI based on Patrick's needs
3. ✅ Generates short-form scripts tailored for business owners
4. ✅ Manages everything through a beautiful dashboard

---

## Who is Patrick? (Your ICP)

Patrick is a business owner who:
- Runs a business in **real estate, healthcare, SaaS, or agency** space
- Is **skeptical of AI hype** but wants practical applications
- Needs to see **clear ROI** and real-world use cases
- Has **limited time** - needs concise, actionable insights

---

## System Architecture

```
┌─────────────────────┐
│  Google Sheets      │ ← Your news sources (YouTube, X, Web, RSS)
│  (You manage)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  n8n Scraper        │ ← Fetches content from all sources
│  (Every 6 hours)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  AI Categorizer     │ ← GPT-4 categorizes for Patrick
│  (On demand)        │    - USE_CASES, TOOLS, INDUSTRY, etc.
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Airtable Database  │ ← Stores content + metadata
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Script Generator   │ ← Creates short-form content
│  (Manual trigger)   │    - YouTube Shorts
└──────────┬──────────┘    - Twitter threads
           │                - LinkedIn posts
           │                - Newsletter
           ▼
┌─────────────────────┐
│  Vercel Dashboard   │ ← You review & publish
└─────────────────────┘
```

---

## Step 1: Google Sheets Setup

### Create Your Sources Sheet

1. Go to: https://docs.google.com/spreadsheets/
2. Create new sheet named: **AI News Sources**
3. Add columns:

| Source Name | URL | Type | Active | Tags |
|------------|-----|------|--------|------|
| AI Explained | https://www.youtube.com/@aiexplained-official | youtube | TRUE | ai-news,technical |
| Matt Wolfe | https://www.youtube.com/@mreflow | youtube | TRUE | ai-tools,tutorials |
| OpenAI Blog | https://openai.com/blog | web | TRUE | official,releases |
| Anthropic | https://www.anthropic.com/news | web | TRUE | research |

4. Share sheet:
   - Click "Share" → "Anyone with the link can VIEW"
   - Copy the Sheet ID from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

5. Add to `.env.local`:
   ```
   GOOGLE_SHEETS_SOURCES_ID=YOUR_SHEET_ID
   ```

### Optional: Service Account (for private sheets)

If you want the sheet private:
1. Create Google Cloud project
2. Enable Sheets API
3. Create service account
4. Download JSON key
5. Share sheet with service account email
6. Add to `.env.local`:
   ```
   GOOGLE_SHEETS_CLIENT_EMAIL=your-service@project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
   ```

---

## Step 2: Airtable Setup

### Create New Base

1. Go to: https://airtable.com
2. Create base: **Keshav AI News Pipeline**
3. Create 3 tables: **Content**, **Scripts**, **Sources**

### Content Table Fields:

```
content_id (text)
title (text)
link (URL)
published_date (date)
author (text)
description (long text)
thumbnail (URL)
source_name (text)
source_type (single select: youtube, x, web, rss)
status (single select: pending, categorized, used_in_script, archived)
category (single select: USE_CASES, TOOLS, INDUSTRY, STRATEGY, BREAKING)
relevance_score (number)
patrick_angle (long text) ← How this helps Patrick
key_points (long text)
script_hook (long text) ← Hook for short-form content
used_in_script (checkbox)
script_date (date)
scraped_at (date)
categorized_at (date)
```

### Scripts Table Fields:

```
script_id (autonumber)
script_date (date)
script_title (text)
script_type (single select: youtube_short, twitter_thread, linkedin_post, newsletter)
content (long text)
google_doc_url (URL)
word_count (number)
items_used (long text)
patrick_focus (text) ← Main takeaway for Patrick
call_to_action (text)
status (single select: draft, approved, posted, archived)
platform_url (URL)
performance_score (number)
notes (long text)
created_at (date)
posted_at (date)
```

### Sources Table:

```
source_name (text)
url (URL)
type (single select: youtube, x, web, rss)
active (checkbox)
tags (multiple select)
last_scraped (date)
items_scraped (number)
avg_relevance (number)
```

4. Get credentials:
   - API Key: https://airtable.com/create/tokens
   - Base ID: From URL `https://airtable.com/BASE_ID/...`

5. Add to `.env.local`:
   ```
   AIRTABLE_API_KEY=patXXXXXXXXXX
   AIRTABLE_BASE_ID=appXXXXXXXXXX
   ```

---

## Step 3: n8n Workflows

### Workflow 1: Multi-Source Scraper

**Trigger**: Schedule (every 6 hours)

**Steps**:
1. HTTP Request → Get sources from Google Sheets
   - URL: `https://your-dashboard.vercel.app/api/sources`
2. Loop through each source
3. Based on type:
   - YouTube → RSS Feed Parser
   - X → Twitter API / Apify scraper
   - Web → HTTP Request + HTML parser
   - RSS → RSS Feed Parser
4. Insert to Airtable → Content table
   - Set status = "pending"

### Workflow 2: AI Categorizer (for Patrick)

**Trigger**: Webhook from dashboard

**Steps**:
1. Get pending content from Airtable
2. Loop through each item
3. OpenAI Chat → GPT-4o
   - Prompt:
     ```
     You are categorizing AI news for Patrick, a business owner who:
     - Runs a business in real estate, healthcare, SaaS, or agency
     - Is skeptical of AI but wants practical applications
     - Needs clear ROI and real-world use cases

     Content:
     {title}
     {description}

     Return JSON:
     {
       "category": "USE_CASES|TOOLS|INDUSTRY|STRATEGY|BREAKING",
       "relevance_score": 1-10,
       "patrick_angle": "How this helps Patrick's business",
       "key_points": ["point 1", "point 2", "point 3"],
       "script_hook": "Attention-grabbing opening"
     }
     ```
4. Update Airtable:
   - Set all AI fields
   - Set status = "categorized"

### Workflow 3: Script Generator

**Trigger**: Webhook from dashboard

**Inputs**:
- Script type (youtube_short, twitter_thread, etc.)
- Number of items (default 10)

**Steps**:
1. HTTP Request → Get script content
   - URL: `https://your-dashboard.vercel.app/api/generate-script`
2. OpenAI Chat → GPT-4o
   - Prompt based on script type:

**YouTube Short (60 seconds)**:
```
Create a 60-second YouTube Short script for Patrick.

Patrick is a business owner (real estate/healthcare/SaaS/agency) who is skeptical of AI.
He wants practical, actionable insights with clear ROI.

Content items:
{items}

Format:
[HOOK] (5 seconds - grab attention)
[PROBLEM] (10 seconds - Patrick's pain point)
[SOLUTION] (35 seconds - how AI helps, specific example)
[CTA] (10 seconds - one action Patrick should take)

Tone: Direct, no hype, practical
Length: ~150-180 words (60 seconds spoken)
```

**Twitter Thread**:
```
Create a Twitter thread for Patrick about AI in business.

Content: {items}

Thread structure:
1. Hook tweet (stand-alone, controversial or surprising)
2-5. Key insights (one per tweet, actionable)
6. Real example or case study
7. CTA + link

Tone: Direct, skeptical-friendly, no buzzwords
Each tweet: 200-280 characters
```

3. Google Docs → Create Document
   - Title: `{script_type}_{date}`
   - Content: Generated script
4. Google Drive → Share
   - Role: writer
   - Type: anyone
5. Airtable → Create Script record
6. Airtable → Mark content as used

---

## Step 4: Deploy Dashboard

```bash
cd nate-jones-content-system/dashboard
npm install
npm run dev  # Test locally first
```

### Test APIs:

```bash
# Get sources from Google Sheets
curl http://localhost:3000/api/sources

# Get top picks for Patrick
curl http://localhost:3000/api/top-picks

# Get script-ready content
curl http://localhost:3000/api/generate-script
```

### Deploy to Vercel:

```bash
vercel --prod
```

### Add Environment Variables in Vercel:
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
- GOOGLE_SHEETS_SOURCES_ID
- GOOGLE_SHEETS_CLIENT_EMAIL (optional)
- GOOGLE_SHEETS_PRIVATE_KEY (optional)
- N8N_API_KEY
- N8N_API_URL

---

## Step 5: Using the System

### Daily Workflow:

1. **Morning**: Check dashboard for new content
2. **Review**: Top picks (relevance >= 8)
3. **Generate**: Click "Generate Script"
4. **Edit**: Review Google Doc, make edits
5. **Post**: Publish to YouTube/X/LinkedIn
6. **Track**: Update performance score in Airtable

### Categories Explained (for Patrick):

- **USE_CASES**: How businesses use AI (highest priority)
  - "Law firm drafts contracts 50% faster with AI"
  - "Real estate agent uses AI to qualify leads"

- **TOOLS**: New AI tools Patrick can use
  - "This AI tool saves 10 hours/week on emails"
  - "New AI meeting summarizer (free)"

- **INDUSTRY**: AI in Patrick's industries
  - "Healthcare clinics adopting AI scheduling"
  - "SaaS companies using AI support"

- **STRATEGY**: How to implement AI
  - "5 steps to start with AI in your business"
  - "Overcoming team resistance to AI"

- **BREAKING**: Major news (only if relevant)
  - "GPT-5 released - what it means for business"
  - "New AI regulation affects your industry"

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sources` | GET | Get sources from Google Sheets |
| `/api/top-picks` | GET | Top 15 items for Patrick (relevance >= 8) |
| `/api/generate-script` | GET/POST | Get content for script generation |
| `/api/content` | GET | All content (with filters) |
| `/api/scripts` | GET | All scripts |
| `/api/stats` | GET | Dashboard statistics |

---

## Customization

### Add More Source Types:

Edit `googlesheets.ts` to support:
- Podcasts (RSS)
- LinkedIn posts
- Reddit threads
- Discord channels

### Modify Categories:

Update in `NEW_AIRTABLE_SCHEMA.md` based on Patrick's feedback.

### Change Script Formats:

Edit prompts in n8n Workflow 3 for different platforms or lengths.

---

## Troubleshooting

**Google Sheets not loading?**
- Check GOOGLE_SHEETS_SOURCES_ID is correct
- Verify sheet is publicly viewable
- Test: `https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv`

**Airtable errors?**
- Verify API key and Base ID
- Check table names match exactly
- Ensure all fields exist in Airtable

**No content being scraped?**
- Check n8n scraper is running
- Verify sources in Google Sheet have Active=TRUE
- Test individual source URLs manually

**AI categorization failing?**
- Check OpenAI API key in n8n
- Review n8n execution logs
- Verify prompt format

---

## Next Steps

1. [ ] Set up Google Sheet with sources
2. [ ] Create Airtable base with schema
3. [ ] Build n8n workflows
4. [ ] Deploy dashboard to Vercel
5. [ ] Test full pipeline
6. [ ] Generate first script for Patrick!

---

## Support

Full documentation:
- `GOOGLE_SHEETS_TEMPLATE.md` - Sheet setup
- `NEW_AIRTABLE_SCHEMA.md` - Database schema
- `README.md` - Project overview

Questions? Check the code or ask!
