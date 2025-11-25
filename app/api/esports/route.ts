import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET - Get esports settings
export async function GET(request: NextRequest) {
  try {
    let result = await sql`SELECT * FROM esports_settings WHERE id = '1'`;
    let settings = result[0] || null;

    // If no settings exist, create default
    if (!settings) {
      await sql`
        INSERT INTO esports_settings (id, is_open, announcement)
        VALUES ('1', true, 'Esports matches will be held in OC on scheduled dates.')
      `;
      result = await sql`SELECT * FROM esports_settings WHERE id = '1'`;
      settings = result[0] || null;
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Get esports settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch esports settings', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update esports settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { isOpen, openDate, closeDate, announcement } = body;

    await sql`
      UPDATE esports_settings
      SET 
        is_open = ${isOpen ?? true},
        open_date = ${openDate || null},
        close_date = ${closeDate || null},
        announcement = ${announcement || null},
        updated_at = NOW()
      WHERE id = '1'
    `;

    const result = await sql`SELECT * FROM esports_settings WHERE id = '1'`;
    const updated = result[0] || null;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update esports settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update esports settings', details: error.message },
      { status: 500 }
    );
  }
}

