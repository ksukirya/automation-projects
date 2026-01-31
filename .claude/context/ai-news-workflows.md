# AI News Workflow Reference

## Workflow IDs (Remember These!)

| Workflow | ID | Description |
|----------|-----|-------------|
| Content Scraper | `54RVos8ZQI2MEPRP` | Scrapes RSS every 4hrs → Airtable |
| News Generator | `3UbVjG0j3D5pl8ga` | Daily Slack digest + Email newsletter |
| Syntrex AI News (old) | `Ydroxhf32ljXPhXQ` | Old Discord workflow (broken credentials) |

## Content Scraper Details
- **Schedule**: Every 4 hours
- **RSS Sources**: Multiple AI news feeds
- **Output**: Airtable `Content` table
- **Manual Webhook**: `/webhook/ai-newsletter-scraper`

## News Generator Details  
- **Schedule Trigger**: Daily Slack digest
- **Email Trigger**: Newsletter approval responses (prone to spam errors)
- **Slack Node**: "Send Daily Digest" posts to Slack channel
- **Airtable**: Pulls from `Content` table with high relevance

## Airtable Base
- **Base ID**: `appUOTPDuKcpA5XTF`
- **Table**: `Content`
- **Key Fields**: title, ai_summary, relevance_score, quadrant, urgency
