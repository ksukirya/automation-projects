import { google } from 'googleapis';

// Google Sheets configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

interface NewsSource {
  sourceName: string;
  url: string;
  type: 'youtube' | 'x' | 'web' | 'rss';
  active: boolean;
  tags: string[];
}

// Initialize Google Sheets API client
function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

// Alternative: Fetch from public sheet (CSV export)
async function fetchPublicSheet(sheetId: string): Promise<NewsSource[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

  const response = await fetch(url);
  const csvText = await response.text();

  const lines = csvText.split('\n');
  const headers = lines[0].split(',');

  const sources: NewsSource[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < 4) continue; // Skip incomplete rows

    sources.push({
      sourceName: values[0]?.trim() || '',
      url: values[1]?.trim() || '',
      type: (values[2]?.trim().toLowerCase() || 'web') as NewsSource['type'],
      active: values[3]?.trim().toUpperCase() === 'TRUE',
      tags: values[4]?.split(';').map(t => t.trim()) || [],
    });
  }

  return sources.filter(s => s.active && s.url);
}

// Fetch sources from Google Sheets
export async function getNewsSources(): Promise<NewsSource[]> {
  const sheetId = process.env.GOOGLE_SHEETS_SOURCES_ID;

  if (!sheetId) {
    throw new Error('GOOGLE_SHEETS_SOURCES_ID not configured');
  }

  try {
    // Try authenticated access first
    if (process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      const sheets = getGoogleSheetsClient();

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'AI News Sources!A2:E', // Skip header row
      });

      const rows = response.data.values || [];

      return rows
        .filter(row => row.length >= 4)
        .map(row => ({
          sourceName: row[0] || '',
          url: row[1] || '',
          type: (row[2]?.toLowerCase() || 'web') as NewsSource['type'],
          active: row[3]?.toUpperCase() === 'TRUE',
          tags: row[4]?.split(',').map((t: string) => t.trim()) || [],
        }))
        .filter(s => s.active && s.url);
    } else {
      // Fall back to public sheet access
      return await fetchPublicSheet(sheetId);
    }
  } catch (error) {
    console.error('Error fetching Google Sheets:', error);

    // Fallback: return default sources
    return [
      {
        sourceName: 'AI Explained',
        url: 'https://www.youtube.com/@aiexplained-official',
        type: 'youtube',
        active: true,
        tags: ['ai-news', 'technical'],
      },
      {
        sourceName: 'OpenAI Blog',
        url: 'https://openai.com/blog',
        type: 'web',
        active: true,
        tags: ['official', 'releases'],
      },
    ];
  }
}

// Get sources by type
export async function getSourcesByType(type: NewsSource['type']): Promise<NewsSource[]> {
  const sources = await getNewsSources();
  return sources.filter(s => s.type === type);
}

// Get sources by tag
export async function getSourcesByTag(tag: string): Promise<NewsSource[]> {
  const sources = await getNewsSources();
  return sources.filter(s => s.tags.includes(tag));
}
