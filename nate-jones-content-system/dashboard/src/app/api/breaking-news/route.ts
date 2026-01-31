import { NextResponse } from 'next/server';
import { getBreakingNewsForScript } from '@/lib/airtable';

export async function GET() {
  try {
    const breakingNews = await getBreakingNewsForScript();

    // Format the response with links included
    const formattedNews = breakingNews.map((item) => ({
      id: item.id,
      content_id: item.content_id,
      title: item.title,
      link: item.link, // ✓ Link included
      published_date: item.published_date,
      author: item.author,
      description: item.description,
      relevance_score: item.relevance_score,
      urgency: item.urgency,
      key_takeaways: item.key_takeaways,
      talking_points: item.talking_points,
      ai_summary: item.ai_summary,
    }));

    return NextResponse.json({
      success: true,
      count: formattedNews.length,
      data: formattedNews
    });
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch breaking news' },
      { status: 500 }
    );
  }
}
