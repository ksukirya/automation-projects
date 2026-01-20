import { NextResponse } from 'next/server';
import { getStats } from '@/lib/airtable';

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats', details: errorMessage },
      { status: 500 }
    );
  }
}
