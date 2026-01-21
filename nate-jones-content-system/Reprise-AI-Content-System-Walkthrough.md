# Reprise AI Content System - Walkthrough for Nick

## Overview

"Hey Nick, let me walk you through the content automation system I built. It's designed to automatically collect AI news content, analyze it, and generate video scripts."

---

## The Three-Stage Pipeline

### Stage 1: Content Scraping
"The system automatically scrapes content from two sources:
- **Nate B Jones' YouTube channel** - pulls his latest AI videos
- **AI News sources** - aggregates relevant industry news

This runs on a schedule and dumps everything into an Airtable database. Each piece of content gets stored with its title, description, thumbnail, and source."

### Stage 2: AI Categorization
"Once content is scraped, an AI workflow analyzes each item and:
- Assigns a **quadrant category**:
  - 🔴 **BREAKING** - Time-sensitive AI announcements
  - 🔵 **STRATEGY** - Practical AI implementation insights
  - 🟢 **MARKET** - Industry trends and analysis
  - 🟣 **CAREER** - Professional development in AI
- Gives it a **relevance score** (1-10)
- Generates an **AI summary** and **key takeaways**
- Sets **urgency level** (HIGH/MEDIUM/LOW)

This helps prioritize what content is worth turning into scripts."

### Stage 3: Script Generation
"When you're ready to create a video, the system:
1. Pulls the highest-relevance categorized content
2. Sends it to AI to generate a complete video script
3. Creates a Google Doc with the script
4. Logs it in Airtable with word count and content used"

---

## The Dashboard

**URL: https://dashboard-psi-five-20.vercel.app**

"The dashboard is the control center. Here's what you can do:"

### Home Page
- **Stats cards** showing total content, categorized items, high-relevance count, and scripts generated
- **Quick Actions** - Two buttons to manually trigger:
  - "Run Categorization" - processes any uncategorized content
  - "Generate Script" - creates a new video script
- **Latest Scraped Content** - the 10 most recent items
- **Content by Category** - expandable sections showing content grouped by quadrant
- **Recent Scripts** - your latest generated scripts with links to Google Docs

### Scripts Page (/scripts)
- View all generated scripts
- See status (Draft → Approved → Recorded → Uploaded)
- Open the Google Doc directly
- Delete scripts you don't need

---

## Behind the Scenes (n8n Workflows)

"Everything runs on n8n (our automation platform at keshavs.app.n8n.cloud). There are three main workflows:"

1. **Content Scraper** - Scheduled to pull new content daily
2. **AI Categorization** - Analyzes and categorizes content using Claude/GPT
3. **Script Generator** - Creates video scripts from top content

---

## Typical Usage Flow

```
1. Content gets scraped automatically (or trigger manually)
         ↓
2. Run categorization to analyze new content
         ↓
3. Review content in dashboard by category
         ↓
4. Click "Generate Script" when ready
         ↓
5. Open Google Doc, review/edit the script
         ↓
6. Record your video
         ↓
7. Update script status in dashboard
```

---

## Key URLs

| What | URL |
|------|-----|
| Dashboard | https://dashboard-psi-five-20.vercel.app |
| n8n Workflows | https://keshavs.app.n8n.cloud |
| Airtable Data | (in Airtable base) |

---

## Questions You Might Ask

**"How often does it scrape?"**
→ Configured in n8n, can be daily or whatever schedule you want.

**"Can I add more sources?"**
→ Yes, just need to add them to the scraper workflow.

**"What if I don't like a script?"**
→ Delete it and generate a new one, or edit the Google Doc directly.

**"Is there a cost?"**
→ Vercel hosting is free, n8n Cloud has a plan, and AI API calls have per-token costs.
