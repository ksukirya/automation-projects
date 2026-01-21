import { NextRequest, NextResponse } from 'next/server';

// Workflow IDs for reference
const workflowIds: Record<string, string> = {
  scraper: '54RVos8ZQI2MEPRP',      // AI Newsletter - Content Scraper
  youtube: 'AGVGfqPEhBO9Zs4l',       // YouTube Channels - Content Scraper
  categorize: 'xsu7Wa8gzTrkbtdM',
  script: 'XRtGZR0MolxzBQw9',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow, selectedContentIds } = body;

    // All workflows use webhooks
    const webhookUrls: Record<string, string> = {
      scraper: process.env.N8N_SCRAPER_WEBHOOK || '',
      youtube: process.env.N8N_YOUTUBE_WEBHOOK || '',
      categorize: process.env.N8N_CATEGORIZE_WEBHOOK || '',
      script: process.env.N8N_SCRIPT_WEBHOOK || '',
    };

    const webhookUrl = webhookUrls[workflow];

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Invalid workflow' },
        { status: 400 }
      );
    }

    // Build the payload - include selected content IDs for script generation
    const payload: Record<string, unknown> = {
      triggered_from: 'dashboard',
      timestamp: new Date().toISOString(),
    };

    // If specific content IDs were selected for script generation, include them
    if (workflow === 'script' && selectedContentIds && selectedContentIds.length > 0) {
      payload.selectedContentIds = selectedContentIds;
      payload.useSelectedOnly = true;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    const result = await response.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: `${workflow} workflow triggered`,
      result,
    });
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger workflow' },
      { status: 500 }
    );
  }
}
