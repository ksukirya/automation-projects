import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID || ''
    );

    // Test Content table
    let contentCount = 0;
    let contentSample: any = null;
    try {
      const contentRecords = await base('Content')
        .select({ maxRecords: 1 })
        .all();
      contentCount = contentRecords.length;
      if (contentRecords.length > 0) {
        contentSample = {
          id: contentRecords[0].id,
          fields: contentRecords[0].fields,
        };
      }
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: 'Content table not found or accessible',
        details: error.message,
      });
    }

    // Test Scripts table
    let scriptsCount = 0;
    let scriptsSample: any = null;
    let scriptsError: any = null;
    try {
      const scriptsRecords = await base('Scripts')
        .select({ maxRecords: 1 })
        .all();
      scriptsCount = scriptsRecords.length;
      if (scriptsRecords.length > 0) {
        scriptsSample = {
          id: scriptsRecords[0].id,
          fields: scriptsRecords[0].fields,
        };
      }
    } catch (error: any) {
      scriptsError = error.message;
    }

    return NextResponse.json({
      success: true,
      airtable: {
        baseId: process.env.AIRTABLE_BASE_ID,
        apiKeySet: !!process.env.AIRTABLE_API_KEY,
      },
      tables: {
        content: {
          exists: true,
          recordsFound: contentCount,
          sample: contentSample,
        },
        scripts: {
          exists: !scriptsError,
          error: scriptsError,
          recordsFound: scriptsCount,
          sample: scriptsSample,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to Airtable',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
