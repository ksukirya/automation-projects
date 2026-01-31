import Airtable from 'airtable';

// Lazy initialization
function getBase() {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not configured');
  }
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is not configured');
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );
}

function getContentTable() {
  return getBase()('Content');
}

function getScriptsTable() {
  return getBase()('Scripts');
}

function getSourcesTable() {
  return getBase()('Sources');
}

// Updated interfaces for Patrick's system
export interface ContentItem {
  id: string;
  content_id: string;
  title: string;
  link: string;
  published_date: string;
  author: string;
  description: string;
  thumbnail: string;
  source_name: string;
  source_type: 'youtube' | 'x' | 'web' | 'rss';
  status: 'pending' | 'categorized' | 'used_in_script' | 'archived';
  category: 'USE_CASES' | 'TOOLS' | 'INDUSTRY' | 'STRATEGY' | 'BREAKING' | null;
  relevance_score: number | null;
  patrick_angle: string | null;
  key_points: string | null;
  script_hook: string | null;
  used_in_script: boolean;
  script_date: string | null;
  scraped_at: string;
  categorized_at: string | null;
}

export interface Script {
  id: string;
  script_id: number;
  script_date: string;
  script_title: string;
  script_type: 'youtube_short' | 'twitter_thread' | 'linkedin_post' | 'newsletter';
  content: string;
  google_doc_url: string;
  word_count: number;
  items_used: string;
  patrick_focus: string;
  call_to_action: string;
  status: 'draft' | 'approved' | 'posted' | 'archived';
  platform_url: string | null;
  performance_score: number | null;
  notes: string | null;
  created_at: string;
  posted_at: string | null;
}

export interface Source {
  id: string;
  source_name: string;
  url: string;
  type: 'youtube' | 'x' | 'web' | 'rss';
  active: boolean;
  tags: string[];
  last_scraped: string | null;
  items_scraped: number | null;
  avg_relevance: number | null;
}

// Content operations
export async function getContent(filter?: string): Promise<ContentItem[]> {
  const records = await getContentTable()
    .select({
      filterByFormula: filter || '',
      sort: [{ field: 'scraped_at', direction: 'desc' }],
      maxRecords: 500,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<ContentItem, 'id'>),
  }));
}

// Get top picks for Patrick (relevance >= 8, not used, published today or yesterday)
export async function getTopPicksForPatrick(): Promise<ContentItem[]> {
  const records = await getContentTable()
    .select({
      filterByFormula: 'AND({status} = "categorized", {used_in_script} = FALSE(), {relevance_score} >= 8, IS_AFTER({published_date}, DATEADD(TODAY(), -2, "days")))',
      sort: [
        { field: 'relevance_score', direction: 'desc' },
        { field: 'published_date', direction: 'desc' }
      ],
      maxRecords: 15,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<ContentItem, 'id'>),
  }));
}

// Get content by category
export async function getContentByCategory(category: ContentItem['category']): Promise<ContentItem[]> {
  const records = await getContentTable()
    .select({
      filterByFormula: `{category} = "${category}"`,
      sort: [{ field: 'relevance_score', direction: 'desc' }],
      maxRecords: 50,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<ContentItem, 'id'>),
  }));
}

// Get content ready for script (top 10 highest relevance, not used, published today or yesterday)
export async function getContentForScript(limit: number = 10): Promise<ContentItem[]> {
  const records = await getContentTable()
    .select({
      filterByFormula: 'AND({status} = "categorized", {used_in_script} = FALSE(), {relevance_score} >= 7, IS_AFTER({published_date}, DATEADD(TODAY(), -2, "days")))',
      sort: [
        { field: 'relevance_score', direction: 'desc' },
        { field: 'published_date', direction: 'desc' }
      ],
      maxRecords: limit,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<ContentItem, 'id'>),
  }));
}

// Scripts operations
export async function getScripts(): Promise<Script[]> {
  const records = await getScriptsTable()
    .select({
      sort: [{ field: 'created_at', direction: 'desc' }],
      maxRecords: 50,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<Script, 'id'>),
  }));
}

export async function getScriptsByType(type: Script['script_type']): Promise<Script[]> {
  const records = await getScriptsTable()
    .select({
      filterByFormula: `{script_type} = "${type}"`,
      sort: [{ field: 'created_at', direction: 'desc' }],
      maxRecords: 20,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<Script, 'id'>),
  }));
}

// Update operations
export async function updateContentStatus(
  id: string,
  status: ContentItem['status']
): Promise<void> {
  await getContentTable().update(id, { status });
}

export async function updateScriptStatus(
  id: string,
  status: Script['status']
): Promise<void> {
  await getScriptsTable().update(id, { status });
}

export async function markContentAsUsed(
  contentIds: string[],
  scriptDate: string
): Promise<void> {
  const updates = contentIds.map(id => ({
    id,
    fields: {
      used_in_script: true,
      script_date: scriptDate,
      status: 'used_in_script',
    }
  }));

  // Airtable batch update (max 10 at a time)
  for (let i = 0; i < updates.length; i += 10) {
    const batch = updates.slice(i, i + 10);
    await getContentTable().update(batch);
  }
}

// Delete operations
export async function deleteScript(id: string): Promise<void> {
  await getScriptsTable().destroy(id);
}

export async function deleteContent(id: string): Promise<void> {
  await getContentTable().destroy(id);
}

// Statistics for Patrick's dashboard
export async function getPatrickStats() {
  const content = await getContent();

  const stats = {
    total: content.length,
    pending: content.filter((c) => c.status === 'pending').length,
    categorized: content.filter((c) => c.status === 'categorized').length,
    topPicks: content.filter((c) => (c.relevance_score || 0) >= 8 && !c.used_in_script).length,
    byCategory: {
      USE_CASES: content.filter((c) => c.category === 'USE_CASES').length,
      TOOLS: content.filter((c) => c.category === 'TOOLS').length,
      INDUSTRY: content.filter((c) => c.category === 'INDUSTRY').length,
      STRATEGY: content.filter((c) => c.category === 'STRATEGY').length,
      BREAKING: content.filter((c) => c.category === 'BREAKING').length,
    },
    avgRelevance: content.length > 0
      ? content.reduce((sum, c) => sum + (c.relevance_score || 0), 0) / content.length
      : 0,
    readyForScript: content.filter(
      (c) => c.status === 'categorized' && !c.used_in_script && (c.relevance_score || 0) >= 7
    ).length,
    bySourceType: {
      youtube: content.filter((c) => c.source_type === 'youtube').length,
      x: content.filter((c) => c.source_type === 'x').length,
      web: content.filter((c) => c.source_type === 'web').length,
      rss: content.filter((c) => c.source_type === 'rss').length,
    },
  };

  return stats;
}

// Sources operations
export async function getSources(): Promise<Source[]> {
  const records = await getSourcesTable()
    .select({
      sort: [{ field: 'avg_relevance', direction: 'desc' }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<Source, 'id'>),
  }));
}

export async function updateSourceStats(
  sourceName: string,
  itemsScraped: number,
  avgRelevance: number
): Promise<void> {
  const sources = await getSources();
  const source = sources.find(s => s.source_name === sourceName);

  if (source) {
    await getSourcesTable().update(source.id, {
      last_scraped: new Date().toISOString(),
      items_scraped: (source.items_scraped || 0) + itemsScraped,
      avg_relevance: avgRelevance,
    });
  }
}
