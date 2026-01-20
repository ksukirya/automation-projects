import { NextRequest, NextResponse } from 'next/server';

// Workflow IDs for n8n API execution
const workflowIds: Record<string, string> = {
  scraper: 'AGVGfqPEhBO9Zs4l',
  categorize: 'xsu7Wa8gzTrkbtdM',
  script: 'XRtGZR0MolxzBQw9',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow } = body;

    // For scraper: n8n Cloud doesn't support API execution or auto-registered webhooks
    // The scraper runs automatically every 6 hours, or can be manually triggered in n8n UI
    if (workflow === 'scraper') {
      return NextResponse.json({
        success: true,
        message: 'Scraper runs automatically every 6 hours. To run manually, open the workflow in n8n.',
        manualTriggerUrl: `https://keshavs.app.n8n.cloud/workflow/${workflowIds.scraper}`,
        note: 'Click "Test workflow" button in n8n to run manually',
      });
    }

    // For other workflows, use webhooks
    const webhookUrls: Record<string, string> = {
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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggered_from: 'dashboard', timestamp: new Date().toISOString() }),
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
