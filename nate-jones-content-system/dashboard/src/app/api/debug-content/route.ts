import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID || ''
    );

    // Get all content records
    const records = await base('Content')
      .select({
        sort: [{ field: 'scraped_at', direction: 'desc' }],
        maxRecords: 50,
      })
      .all();

    const contentList = records.map(record => ({
      id: record.id,
      title: record.fields.title,
      source: record.fields.source_name || record.fields.source,
      scraped_at: record.fields.scraped_at,
      published_date: record.fields.published_date,
      status: record.fields.status,
      relevance_score: record.fields.relevance_score,
    }));

    // Group by date
    const byDate: Record<string, number> = {};
    records.forEach(record => {
      const date = record.fields.scraped_at?.toString().split('T')[0] || 'unknown';
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      total_records: records.length,
      latest_scraped: records[0]?.fields.scraped_at || 'No records',
      by_date: byDate,
      content: contentList,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
