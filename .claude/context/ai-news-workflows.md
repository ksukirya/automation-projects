# AI News Workflow Reference

## Workflow IDs (Remember These!)

| Workflow | ID | Description |
|----------|-----|-------------|
| Content Scraper | `54RVos8ZQI2MEPRP` | Scrapes RSS every 4hrs → Google Sheets |
| News Generator | `3UbVjG0j3D5pl8ga` | Daily Slack digest + Email newsletter |
| Syntrex AI News (old) | `Ydroxhf32ljXPhXQ` | Old Discord workflow (broken credentials) |

## Content Scraper Details
- **Schedule**: Every 4 hours
- **RSS Sources**: Multiple AI news feeds
- **Output**: Google Sheets (previously Airtable)
- **Manual Webhook**: `/webhook/ai-newsletter-scraper`

## News Generator Details
- **Schedule Trigger**: Daily Slack digest
- **Email Trigger**: Newsletter approval responses (prone to spam errors)
- **Slack Node**: "Send Daily Digest" posts to Slack channel
- **Data Source**: Airtable `Content` table (needs update to Google Sheets)

## Google Sheets (NEW - Content Scraper)
- **Document ID**: `1eXbZx46eOykP3h_8DElIqtm41oDobrBDxftRsnpIp5k`
- **Sheet Name**: Sheet1
- **URL**: https://docs.google.com/spreadsheets/d/1eXbZx46eOykP3h_8DElIqtm41oDobrBDxftRsnpIp5k/edit
- **Columns**: content_id, title, link, description, source, source_type, status, ai_summary, relevance_score, scraped_at

## Airtable Base (Legacy - News Generator still uses this)
- **Base ID**: `appUOTPDuKcpA5XTF`
- **Table**: `Content`
- **Key Fields**: title, ai_summary, relevance_score, quadrant, urgency
