# n8n Workflow Templates for Personalized AI News System

## Quick Setup Guide

### Workflow 1: Multi-Source Scraper

**Name**: `[Keshav] AI News Multi-Source Scraper`
**Schedule**: Every 6 hours

#### Nodes:

1. **Schedule Trigger**
   - Mode: Every 6 hours
   - Starts at: 6am

2. **HTTP Request - Get Sources**
   - Method: GET
   - URL: `https://your-dashboard.vercel.app/api/sources`
   - Returns: Your Google Sheets sources

3. **Split In Batches**
   - Batch Size: 1 (process one source at a time)

4. **Switch (by source type)**
   - Mode: Rules
   - Rules:
     - Output 1: `{{ $json.type === 'youtube' }}`
     - Output 2: `{{ $json.type === 'x' }}`
     - Output 3: `{{ $json.type === 'web' }}`
     - Output 4: `{{ $json.type === 'rss' }}`

#### Output 1: YouTube Sources

5a. **RSS Feed Read**
   - Feed URL: `https://www.youtube.com/feeds/videos.xml?channel_id={{ $json.url.split('/').pop() }}`

6a. **Function - Format YouTube**
```javascript
const items = [];

for (const item of $input.all()) {
  items.push({
    json: {
      content_id: item.json.id || item.json.guid,
      title: item.json.title,
      link: item.json.link,
      published_date: item.json.pubDate || item.json.isoDate,
      author: item.json.creator || 'Unknown',
      description: item.json.contentSnippet || item.json.description,
      thumbnail: item.json['media:thumbnail']?.url || '',
      source_name: $('HTTP Request - Get Sources').item.json.sourceName,
      source_type: 'youtube',
      status: 'pending',
      scraped_at: new Date().toISOString(),
    }
  });
}

return items;
```

#### Output 2: X/Twitter Sources

5b. **HTTP Request - Apify Actor** (or Twitter API)
   - Method: POST
   - URL: `https://api.apify.com/v2/acts/YOUR_ACTOR/runs?token=YOUR_TOKEN`
   - Body:
     ```json
     {
       "searchTerms": ["{{ $json.url }}"],
       "maxTweets": 20
     }
     ```

6b. **Wait** (for Apify to finish)
   - Amount: 30 seconds

7b. **HTTP Request - Get Results**
   - Method: GET
   - URL: From previous step's run URL

8b. **Function - Format Twitter**
```javascript
const items = [];

for (const tweet of $json.data.items) {
  items.push({
    json: {
      content_id: tweet.id,
      title: tweet.text.substring(0, 100),
      link: tweet.url,
      published_date: tweet.created_at,
      author: tweet.author.username,
      description: tweet.text,
      thumbnail: tweet.media?.[0]?.url || '',
      source_name: $('HTTP Request - Get Sources').item.json.sourceName,
      source_type: 'x',
      status: 'pending',
      scraped_at: new Date().toISOString(),
    }
  });
}

return items;
```

#### Output 3: Web Sources

5c. **HTTP Request - Fetch Page**
   - Method: GET
   - URL: `{{ $json.url }}`

6c. **HTML Extract**
   - Extraction Mode: HTML Selector
   - Selectors:
     - Articles: `article, .post, .entry`
     - Title: `h1, h2, .title`
     - Link: `a`
     - Date: `.date, time`

7c. **Function - Format Web**
```javascript
const items = [];

for (const article of $input.all()) {
  items.push({
    json: {
      content_id: article.json.link?.split('/').pop() || Date.now(),
      title: article.json.title,
      link: article.json.link,
      published_date: article.json.date || new Date().toISOString(),
      author: article.json.author || 'Unknown',
      description: article.json.description || '',
      thumbnail: article.json.image || '',
      source_name: $('HTTP Request - Get Sources').item.json.sourceName,
      source_type: 'web',
      status: 'pending',
      scraped_at: new Date().toISOString(),
    }
  });
}

return items;
```

#### Output 4: RSS Sources

5d. **RSS Feed Read**
   - Feed URL: `{{ $json.url }}`

6d. **Function - Format RSS**
```javascript
const items = [];

for (const item of $input.all()) {
  items.push({
    json: {
      content_id: item.json.guid || item.json.link,
      title: item.json.title,
      link: item.json.link,
      published_date: item.json.pubDate || item.json.isoDate,
      author: item.json.creator || 'Unknown',
      description: item.json.contentSnippet || item.json.description,
      thumbnail: item.json.enclosure?.url || '',
      source_name: $('HTTP Request - Get Sources').item.json.sourceName,
      source_type: 'rss',
      status: 'pending',
      scraped_at: new Date().toISOString(),
    }
  });
}

return items;
```

#### All Outputs Merge Here:

9. **Merge (All branches)**

10. **Airtable - Insert Records**
    - Table: Content
    - Columns: Map all fields from above
    - Options: Skip if exists (based on content_id)

---

## Workflow 2: AI Categorizer for Patrick

**Name**: `[Keshav] AI Categorizer - Patrick`
**Trigger**: Webhook

#### Webhook Setup:
- Method: POST
- Path: `/webhook/categorize-content`
- Response Mode: Wait for completion

#### Nodes:

1. **Webhook**
   - Receives trigger from dashboard

2. **Airtable - Get Records**
   - Table: Content
   - Filter: `{status} = 'pending'`
   - Limit: 20 (process in batches)

3. **Loop Over Items**

4. **OpenAI Chat Model**
   - Model: gpt-4o
   - System Message:
     ```
     You are an AI content curator for Patrick, a business owner who:
     - Runs a business in real estate, healthcare, SaaS, or agency
     - Is skeptical of AI hype but wants practical applications
     - Needs clear ROI and real-world use cases
     - Has limited time - needs concise, actionable insights

     Categorize content into:
     - USE_CASES: How businesses use AI practically (highest priority)
     - TOOLS: New AI tools Patrick can use
     - INDUSTRY: AI adoption in Patrick's industries
     - STRATEGY: How to implement AI in business
     - BREAKING: Major news (only if relevant to business)

     Return JSON with:
     {
       "category": "string",
       "relevance_score": number (1-10),
       "patrick_angle": "string (how this helps Patrick)",
       "key_points": ["string", "string", "string"],
       "script_hook": "string (attention-grabbing hook)"
     }
     ```
   - User Message:
     ```
     Title: {{ $json.title }}
     Description: {{ $json.description }}
     Source: {{ $json.source_name }}
     ```

5. **Function - Parse AI Response**
```javascript
const aiResponse = $json.choices[0].message.content;
const parsed = JSON.parse(aiResponse);

return {
  json: {
    id: $('Airtable - Get Records').item.json.id,
    category: parsed.category,
    relevance_score: parsed.relevance_score,
    patrick_angle: parsed.patrick_angle,
    key_points: JSON.stringify(parsed.key_points),
    script_hook: parsed.script_hook,
    status: 'categorized',
    categorized_at: new Date().toISOString(),
  }
};
```

6. **Airtable - Update Record**
   - Table: Content
   - Record ID: `{{ $json.id }}`
   - Fields: All from previous node

7. **Webhook Response**
   - Status: 200
   - Body:
     ```json
     {
       "success": true,
       "processed": {{ $json.id.length }},
       "message": "Content categorized for Patrick"
     }
     ```

---

## Workflow 3: Script Generator for Patrick

**Name**: `[Keshav] Script Generator - Short Form`
**Trigger**: Webhook

#### Webhook Setup:
- Method: POST
- Path: `/webhook/generate-script`
- Body expects:
  ```json
  {
    "type": "youtube_short",
    "limit": 10
  }
  ```

#### Nodes:

1. **Webhook**

2. **HTTP Request - Get Content**
   - Method: POST
   - URL: `https://your-dashboard.vercel.app/api/generate-script`
   - Body:
     ```json
     {
       "type": "{{ $json.type }}",
       "limit": "{{ $json.limit }}"
     }
     ```

3. **Function - Format for Prompt**
```javascript
const items = $json.items;

let contentList = '';
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  contentList += `
${i + 1}. ${item.title}
   Category: ${item.category}
   Patrick's Angle: ${item.patrick_angle}
   Hook: ${item.script_hook}
   Link: ${item.link}
---
`;
}

return {
  json: {
    contentList,
    scriptType: $json.script_type,
    count: items.length,
  }
};
```

4. **Switch - Script Type**
   - Output 1: `{{ $json.scriptType === 'youtube_short' }}`
   - Output 2: `{{ $json.scriptType === 'twitter_thread' }}`
   - Output 3: `{{ $json.scriptType === 'linkedin_post' }}`
   - Output 4: `{{ $json.scriptType === 'newsletter' }}`

#### Output 1: YouTube Short Script

5a. **OpenAI Chat Model**
   - Model: gpt-4o
   - System:
     ```
     Create a 60-second YouTube Short script for Patrick.

     Patrick is a business owner (real estate/healthcare/SaaS/agency) who is skeptical of AI.
     He wants practical, actionable insights with clear ROI.

     Format:
     [HOOK] (5 seconds - grab attention with surprising stat or question)
     [PROBLEM] (10 seconds - Patrick's specific pain point)
     [SOLUTION] (35 seconds - how AI helps, with specific example)
     [CTA] (10 seconds - ONE action Patrick should take)

     Tone: Direct, no hype, practical, conversational
     Length: 150-180 words (60 seconds spoken)
     NO emojis, NO hashtags in script
     ```
   - User:
     ```
     Content:
     {{ $json.contentList }}

     Focus on the highest relevance items.
     Include source links in [brackets] for reference.
     ```

#### Output 2: Twitter Thread

5b. **OpenAI Chat Model**
   - Model: gpt-4o
   - System:
     ```
     Create a Twitter thread for Patrick about AI in business.

     Patrick: business owner, skeptical of AI, wants practical ROI.

     Thread structure:
     1. Hook tweet (stand-alone, controversial or surprising)
     2-5. Key insights (one per tweet, each actionable)
     6. Real example or case study
     7. CTA + relevant link

     Rules:
     - Each tweet: 200-280 characters
     - Tone: Direct, skeptical-friendly
     - NO buzzwords (paradigm shift, revolutionary, game-changer)
     - YES specific numbers, real examples, clear actions
     - Number tweets: 1/7, 2/7, etc.
     ```
   - User: Same as above

#### Output 3: LinkedIn Post

5c. **OpenAI Chat Model**
   - System:
     ```
     Create a LinkedIn post for Patrick.

     Format:
     - Hook paragraph (2-3 lines)
     - Line break
     - 3-5 key points (each on new line with →)
     - Line break
     - Real example or case study
     - Line break
     - Soft CTA question

     Tone: Professional but direct
     Length: 150-200 words
     NO hashtags in body (add 3-5 at end)
     ```

#### Output 4: Newsletter

5d. **OpenAI Chat Model**
   - System:
     ```
     Create newsletter section "AI This Week for Business Owners"

     Format:
     Subject Line: [Compelling subject]

     Hi [Name],

     [Personal intro - 2 sentences]

     🎯 This Week's Top 3:

     1. [Title]
        → What it is: [1 sentence]
        → Why it matters: [1 sentence for Patrick]
        → Your move: [1 action step]
        [Link]

     2. [...]

     3. [...]

     💡 Quick Win of the Week:
     [One simple AI action Patrick can take this week]

     See you next week,
     [Signature]

     P.S. [Relevant question or insight]
     ```

#### All Outputs Merge Here:

6. **Merge**

7. **Google Docs - Create Document**
   - Title: `{{ $json.scriptType }}_{{ $now.format('YYYY-MM-DD') }}`
   - Content: `{{ $json.choices[0].message.content }}`

8. **Google Drive - Share**
   - File ID: `{{ $json.documentId }}`
   - Permission:
     - Role: writer
     - Type: anyone

9. **Airtable - Create Script Record**
   - Table: Scripts
   - Fields:
     ```json
     {
       "script_date": "{{ $now }}",
       "script_title": "{{ Extract title from content }}",
       "script_type": "{{ $json.scriptType }}",
       "content": "{{ $json.content }}",
       "google_doc_url": "{{ $json.webViewLink }}",
       "word_count": "{{ Word count }}",
       "items_used": "{{ Content IDs used }}",
       "patrick_focus": "{{ Main takeaway }}",
       "status": "draft",
       "created_at": "{{ $now }}"
     }
     ```

10. **Airtable - Mark Content As Used**
    - Table: Content
    - Update multiple records
    - Set:
      - used_in_script = true
      - script_date = today
      - status = 'used_in_script'

11. **Webhook Response**
    - Status: 200
    - Body:
      ```json
      {
        "success": true,
        "google_doc_url": "{{ $json.webViewLink }}",
        "script_type": "{{ $json.scriptType }}",
        "items_used": {{ $json.itemCount }}
      }
      ```

---

## Testing Workflows

### Test Scraper:
```bash
# Manually trigger in n8n
# Check Airtable → Content table
# Verify status = 'pending'
```

### Test Categorizer:
```bash
curl -X POST https://keshavs.app.n8n.cloud/webhook/categorize-content
```

### Test Script Generator:
```bash
curl -X POST https://keshavs.app.n8n.cloud/webhook/generate-script \
  -H "Content-Type: application/json" \
  -d '{"type": "youtube_short", "limit": 10}'
```

---

## Next Steps

1. Import these workflows to n8n
2. Add credentials:
   - Airtable
   - OpenAI
   - Google Docs & Drive
   - Twitter/Apify (optional)
3. Update webhook URLs in dashboard
4. Test each workflow individually
5. Run end-to-end test

---

## Pro Tips

- Start with YouTube sources only (easiest)
- Process 20 items at a time for categorization
- Test prompts in ChatGPT first before adding to n8n
- Monitor OpenAI usage (can get expensive!)
- Use caching for repeated content

---

## Workflow IDs (Update These)

```env
N8N_SCRAPER_WEBHOOK=https://keshavs.app.n8n.cloud/webhook/ai-news-scraper
N8N_CATEGORIZE_WEBHOOK=https://keshavs.app.n8n.cloud/webhook/categorize-content
N8N_SCRIPT_WEBHOOK=https://keshavs.app.n8n.cloud/webhook/generate-script
```
