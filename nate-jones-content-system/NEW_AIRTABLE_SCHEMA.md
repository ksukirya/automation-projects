# Personalized AI News System - Airtable Schema

## Base Name: `Keshav AI News Pipeline`

---

## Table 1: `Content`

Stores all scraped content from various sources.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `content_id` | Single line text | Unique ID from source |
| `title` | Single line text | Content title |
| `link` | URL | Link to original content |
| `published_date` | Date | When published |
| `author` | Single line text | Author/creator name |
| `description` | Long text | Content description |
| `thumbnail` | URL | Thumbnail image |
| `source_name` | Single line text | Name from Google Sheet |
| `source_type` | Single select | `youtube`, `x`, `web`, `rss` |
| `status` | Single select | `pending`, `categorized`, `used_in_script`, `archived` |
| `category` | Single select | `USE_CASES`, `TOOLS`, `INDUSTRY`, `STRATEGY`, `BREAKING` |
| `relevance_score` | Number | 1-10 for Patrick's ICP |
| `patrick_angle` | Long text | How this relates to Patrick's needs |
| `key_points` | Long text | Bullet points of key information |
| `script_hook` | Long text | Potential hook for short-form content |
| `used_in_script` | Checkbox | Used in generated script |
| `script_date` | Date | Date used in script |
| `scraped_at` | Date | When scraped |
| `categorized_at` | Date | When AI categorized |

### Views:

1. **All Content** - All records by scraped_at desc
2. **Pending Review** - status = "pending"
3. **Top Picks** - relevance_score >= 8, not used
4. **By Category - Use Cases** - category = "USE_CASES"
5. **By Category - Tools** - category = "TOOLS"
6. **By Category - Industry** - category = "INDUSTRY"
7. **By Category - Strategy** - category = "STRATEGY"
8. **By Category - Breaking** - category = "BREAKING"
9. **Ready for Script** - categorized, not used, relevance >= 7

---

## Table 2: `Scripts`

Generated short-form scripts for Patrick.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `script_id` | Autonumber | Auto ID |
| `script_date` | Date | Date created |
| `script_title` | Single line text | Title/headline |
| `script_type` | Single select | `youtube_short`, `twitter_thread`, `linkedin_post`, `newsletter` |
| `content` | Long text | Full script content |
| `google_doc_url` | URL | Link to Google Doc |
| `word_count` | Number | Word count |
| `items_used` | Long text | JSON array of content_ids |
| `patrick_focus` | Single line text | Main takeaway for Patrick |
| `call_to_action` | Single line text | CTA for script |
| `status` | Single select | `draft`, `approved`, `posted`, `archived` |
| `platform_url` | URL | URL where posted (YouTube, X, etc.) |
| `performance_score` | Number | Engagement/performance score |
| `notes` | Long text | Notes |
| `created_at` | Date | Created timestamp |
| `posted_at` | Date | Posted timestamp |

### Views:

1. **All Scripts** - All by created_at desc
2. **Drafts** - status = "draft"
3. **Top Performers** - performance_score >= 8
4. **By Type - YouTube** - script_type = "youtube_short"
5. **By Type - Twitter** - script_type = "twitter_thread"
6. **Recent Posts** - posted last 30 days

---

## Table 3: `Sources` (Synced from Google Sheets)

Mirror of Google Sheets sources for reference.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `source_name` | Single line text | Source name |
| `url` | URL | Source URL |
| `type` | Single select | `youtube`, `x`, `web`, `rss` |
| `active` | Checkbox | Is active |
| `tags` | Multiple select | Tags from sheet |
| `last_scraped` | Date | Last successful scrape |
| `items_scraped` | Number | Total items scraped |
| `avg_relevance` | Number | Average relevance score |

### Views:

1. **Active Sources** - active = true
2. **By Type - YouTube** - type = "youtube"
3. **By Type - X** - type = "x"
4. **By Type - Web** - type = "web"
5. **Performance** - sorted by avg_relevance desc

---

## Patrick's Content Categories Explained

### 1. USE_CASES (Highest Priority)
**Goal**: Show Patrick how businesses are using AI practically
- Examples: "Law firm uses AI to draft contracts 50% faster"
- Focus: ROI, time savings, automation wins
- Script angle: "Here's how [industry] is using AI to [solve problem]"

### 2. TOOLS
**Goal**: Introduce new AI tools Patrick could use
- Examples: New AI meeting summarizer, AI email assistant
- Focus: Easy to implement, clear value prop
- Script angle: "This tool can save you [X hours/week] on [task]"

### 3. INDUSTRY
**Goal**: AI adoption in Patrick's target industries
- Real estate, healthcare, legal, SaaS
- Focus: Industry-specific applications
- Script angle: "AI is changing [industry] - here's what you need to know"

### 4. STRATEGY
**Goal**: How to integrate AI into business
- Examples: AI implementation roadmaps, team training
- Focus: Strategic guidance, overcoming skepticism
- Script angle: "Here's how to start with AI in your business"

### 5. BREAKING
**Goal**: Major announcements that matter to Patrick
- Only if relevant to business applications
- Examples: GPT-5 release, major funding rounds
- Script angle: "This changes everything for [Patrick's industry]"

---

## AI Categorization Prompt for Patrick

```
You are categorizing AI news for Patrick, a business owner who:
- Runs a business in real estate, healthcare, SaaS, or agency space
- Is skeptical of AI hype but wants practical applications
- Needs to see clear ROI and real-world use cases
- Has limited time - needs concise, actionable insights

For this content:
{title}
{description}

1. Category: Choose ONE (USE_CASES, TOOLS, INDUSTRY, STRATEGY, BREAKING)
2. Relevance Score (1-10): How useful is this for Patrick?
   - 9-10: Directly applicable to his business, clear ROI
   - 7-8: Relevant industry example or useful tool
   - 5-6: Interesting but not immediately actionable
   - 1-4: Too technical or not relevant to business owners

3. Patrick's Angle (1-2 sentences): How does this help Patrick's business?
4. Key Points (3-5 bullets): Main takeaways
5. Script Hook (1 sentence): Attention-grabbing opening for short-form content

Return as JSON.
```
