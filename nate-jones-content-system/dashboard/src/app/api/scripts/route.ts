import { NextRequest, NextResponse } from 'next/server';
import { getScripts, updateScriptStatus, deleteScript } from '@/lib/airtable';

export async function GET() {
  try {
    const scripts = await getScripts();
    return NextResponse.json({ success: true, data: scripts });
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scripts' },
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

    await updateScriptStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating script:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update script' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing script id' },
        { status: 400 }
      );
    }

    await deleteScript(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting script:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete script' },
      { status: 500 }
    );
  }
}
