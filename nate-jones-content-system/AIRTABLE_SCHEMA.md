# Airtable Schema for Nate B Jones Content System

## Base Name: `Nate Jones Content Pipeline`

---

## Table 1: `Content`

Stores all scraped content from Nate B Jones sources.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `content_id` | Single line text | Unique ID from source (video ID, post ID) |
| `title` | Single line text | Content title |
| `link` | URL | Link to original content |
| `published_date` | Date | When content was published |
| `author` | Single line text | Author name |
| `description` | Long text | Content description/summary |
| `thumbnail` | URL | Thumbnail image URL |
| `source` | Single select | `YouTube - AI News & Strategy Daily`, `Substack Newsletter` |
| `source_type` | Single select | `youtube`, `substack` |
| `priority` | Number | Source priority (1 = highest) |
| `status` | Single select | `pending_categorization`, `categorized`, `low_relevance`, `used_in_script` |
| `quadrant` | Single select | `BREAKING`, `STRATEGY`, `MARKET`, `CAREER` |
| `relevance_score` | Number | 1-10 relevance score for Patrick |
| `urgency` | Single select | `HIGH`, `MEDIUM`, `LOW` |
| `key_takeaways` | Long text | JSON array of key points |
| `talking_points` | Long text | JSON array of talking points |
| `ai_summary` | Long text | AI-generated summary |
| `used_in_script` | Checkbox | Whether used in a script |
| `script_date` | Date | Date of script it was used in |
| `scraped_at` | Date | When content was scraped |
| `categorized_at` | Date | When content was categorized |

### Views

1. **All Content** - All records, sorted by scraped_at desc
2. **Pending Categorization** - Filter: status = "pending_categorization"
3. **High Relevance** - Filter: relevance_score >= 7, sorted by relevance_score desc
4. **By Quadrant - Breaking** - Filter: quadrant = "BREAKING"
5. **By Quadrant - Strategy** - Filter: quadrant = "STRATEGY"
6. **By Quadrant - Market** - Filter: quadrant = "MARKET"
7. **By Quadrant - Career** - Filter: quadrant = "CAREER"
8. **Ready for Script** - Filter: status = "categorized", used_in_script = false, relevance_score >= 6

---

## Table 2: `Scripts`

Stores generated scripts and their metadata.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `script_id` | Autonumber | Auto-generated ID |
| `script_date` | Date | Date script is for |
| `script_title` | Single line text | Script title |
| `google_doc_url` | URL | Link to Google Doc |
| `word_count` | Number | Total word count |
| `items_used` | Long text | JSON array of content_ids used |
| `status` | Single select | `draft`, `approved`, `recorded`, `uploaded` |
| `youtube_url` | URL | YouTube video URL (after upload) |
| `notes` | Long text | Any notes about the script |
| `created_at` | Date | When script was created |
| `approved_at` | Date | When script was approved |
| `recorded_at` | Date | When video was recorded |
| `uploaded_at` | Date | When video was uploaded |

### Views

1. **All Scripts** - All records, sorted by script_date desc
2. **Drafts** - Filter: status = "draft"
3. **Ready to Record** - Filter: status = "approved"
4. **Completed** - Filter: status = "uploaded"

---

## Table 3: `Analytics` (Optional)

Track performance metrics for uploaded videos.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `script_id` | Link to Scripts | Related script |
| `date` | Date | Date of metrics |
| `views` | Number | View count |
| `likes` | Number | Like count |
| `comments` | Number | Comment count |
| `watch_time_minutes` | Number | Total watch time |
| `ctr` | Number | Click-through rate % |

---

## Setup Instructions

1. Create a new Airtable base named "Nate Jones Content Pipeline"
2. Create the tables with the schema above
3. Create the views for each table
4. Get your Airtable API key from: https://airtable.com/create/tokens
5. Get your Base ID from the URL: `https://airtable.com/BASE_ID/...`
6. Update the n8n workflows with:
   - Airtable credentials
   - Base ID
   - Table names

---

## n8n Workflow IDs

| Workflow | ID | Description |
|----------|-----|-------------|
| Content Scraper | `AGVGfqPEhBO9Zs4l` | Scrapes Nate's content every 6 hours |
| AI Categorization | `xsu7Wa8gzTrkbtdM` | Categorizes content into quadrants |
| Script Generator | `XRtGZR0MolxzBQw9` | Generates daily scripts |
