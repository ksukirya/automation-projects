import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID || ''
);

export const contentTable = base('Content');
export const scriptsTable = base('Scripts');

export interface ContentItem {
  id: string;
  content_id: string;
  title: string;
  link: string;
  published_date: string;
  author: string;
  description: string;
  thumbnail: string;
  source: string;
  source_type: string;
  priority: number;
  status: 'pending_categorization' | 'categorized' | 'low_relevance' | 'used_in_script';
  quadrant: 'BREAKING' | 'STRATEGY' | 'MARKET' | 'CAREER' | null;
  relevance_score: number | null;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  key_takeaways: string | null;
  talking_points: string | null;
  ai_summary: string | null;
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
  google_doc_url: string;
  word_count: number;
  items_used: string;
  status: 'draft' | 'approved' | 'recorded' | 'uploaded';
  youtube_url: string | null;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  recorded_at: string | null;
  uploaded_at: string | null;
}

export async function getContent(filter?: string): Promise<ContentItem[]> {
  const records = await contentTable
    .select({
      filterByFormula: filter || '',
      sort: [{ field: 'scraped_at', direction: 'desc' }],
      maxRecords: 100,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<ContentItem, 'id'>),
  }));
}

export async function getScripts(): Promise<Script[]> {
  const records = await scriptsTable
    .select({
      sort: [{ field: 'script_date', direction: 'desc' }],
      maxRecords: 50,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...(record.fields as Omit<Script, 'id'>),
  }));
}

export async function updateContentStatus(
  id: string,
  status: ContentItem['status']
): Promise<void> {
  await contentTable.update(id, { status });
}

export async function updateScriptStatus(
  id: string,
  status: Script['status']
): Promise<void> {
  await scriptsTable.update(id, { status });
}

export async function deleteScript(id: string): Promise<void> {
  await scriptsTable.destroy(id);
}

export async function getStats() {
  const content = await getContent();

  const stats = {
    total: content.length,
    pending: content.filter((c) => c.status === 'pending_categorization').length,
    categorized: content.filter((c) => c.status === 'categorized').length,
    highRelevance: content.filter((c) => (c.relevance_score || 0) >= 7).length,
    byQuadrant: {
      BREAKING: content.filter((c) => c.quadrant === 'BREAKING').length,
      STRATEGY: content.filter((c) => c.quadrant === 'STRATEGY').length,
      MARKET: content.filter((c) => c.quadrant === 'MARKET').length,
      CAREER: content.filter((c) => c.quadrant === 'CAREER').length,
    },
    readyForScript: content.filter(
      (c) => c.status === 'categorized' && !c.used_in_script && (c.relevance_score || 0) >= 6
    ).length,
  };

  return stats;
}
