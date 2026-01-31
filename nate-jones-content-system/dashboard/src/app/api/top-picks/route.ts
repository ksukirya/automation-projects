import { NextResponse } from 'next/server';
import { getTopPicksForPatrick } from '@/lib/airtable-v2';

/**
 * GET /api/top-picks
 * Returns top 15 content items for Patrick (relevance >= 8, not used)
 */
export async function GET() {
  try {
    const topPicks = await getTopPicksForPatrick();

    return NextResponse.json({
      success: true,
      count: topPicks.length,
      data: topPicks.map(item => ({
        id: item.id,
        title: item.title,
        link: item.link,
        source_name: item.source_name,
        source_type: item.source_type,
        category: item.category,
        relevance_score: item.relevance_score,
        patrick_angle: item.patrick_angle,
        key_points: item.key_points,
        script_hook: item.script_hook,
        published_date: item.published_date,
        scraped_at: item.scraped_at,
      }))
    });
  } catch (error) {
    console.error('Error fetching top picks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top picks' },
      { status: 500 }
    );
  }
}
