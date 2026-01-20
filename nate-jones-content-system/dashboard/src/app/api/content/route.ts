import { NextRequest, NextResponse } from 'next/server';
import { getContent, updateContentStatus } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quadrant = searchParams.get('quadrant');
    const status = searchParams.get('status');

    let filter = '';
    const conditions: string[] = [];

    if (quadrant) {
      conditions.push(`{quadrant} = '${quadrant}'`);
    }
    if (status) {
      conditions.push(`{status} = '${status}'`);
    }

    if (conditions.length > 0) {
      filter = conditions.length === 1 ? conditions[0] : `AND(${conditions.join(', ')})`;
    }

    const content = await getContent(filter);
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing id or status' },
        { status: 400 }
      );
    }

    await updateContentStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
}
