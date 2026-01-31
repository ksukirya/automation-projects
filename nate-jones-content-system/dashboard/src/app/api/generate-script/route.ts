import { NextRequest, NextResponse } from 'next/server';
import { getContentForScript } from '@/lib/airtable-v2';

/**
 * POST /api/generate-script
 * Returns content items for script generation
 *
 * Body params:
 * - type: 'youtube_short' | 'twitter_thread' | 'linkedin_post' | 'newsletter'
 * - limit: number (default 10)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'youtube_short', limit = 10 } = body;

    const content = await getContentForScript(limit);

    // Format content for script generation
    const formattedContent = content.map((item, index) => ({
      index: index + 1,
      title: item.title,
      link: item.link,
      source: item.source_name,
      category: item.category,
      relevance: item.relevance_score,
      patrick_angle: item.patrick_angle,
      key_points: item.key_points,
      script_hook: item.script_hook,
    }));

    return NextResponse.json({
      success: true,
      script_type: type,
      count: formattedContent.length,
      items: formattedContent,
      meta: {
        generated_at: new Date().toISOString(),
        for_icp: 'Patrick - Business owner skeptical of AI, wants practical applications',
        content_mix: content.reduce((acc, item) => {
          acc[item.category || 'uncategorized'] = (acc[item.category || 'uncategorized'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      }
    });
  } catch (error) {
    console.error('Error generating script data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-script
 * Quick access to get script-ready content (GET request)
 */
export async function GET() {
  try {
    const content = await getContentForScript(10);

    return NextResponse.json({
      success: true,
      count: content.length,
      data: content.map(item => ({
        id: item.id,
        title: item.title,
        link: item.link,
        patrick_angle: item.patrick_angle,
        script_hook: item.script_hook,
        category: item.category,
        relevance_score: item.relevance_score,
      }))
    });
  } catch (error) {
    console.error('Error fetching script content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch script content' },
      { status: 500 }
    );
  }
}
