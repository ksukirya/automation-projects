import { NextResponse } from 'next/server';
import { getNewsSources } from '@/lib/googlesheets';

/**
 * GET /api/sources
 * Returns news sources from Google Sheets
 */
export async function GET() {
  try {
    const sources = await getNewsSources();

    return NextResponse.json({
      success: true,
      count: sources.length,
      data: sources,
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sources from Google Sheets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
