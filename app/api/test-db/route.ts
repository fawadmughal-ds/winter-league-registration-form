import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registrations'
      );
    `;
    
    if (!tableCheck[0]?.exists) {
      return NextResponse.json({
        error: 'Table does not exist',
        fix: 'Run scripts/init-db.sql in your Neon SQL Editor',
      }, { status: 500 });
    }
    
    // Check columns
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'registrations'
      ORDER BY ordinal_position;
    `;
    
    // Check sequence
    const sequenceCheck = await sql`
      SELECT EXISTS (
        SELECT FROM pg_sequences 
        WHERE sequencename = 'registration_number_seq'
      );
    `;
    
    return NextResponse.json({
      success: true,
      tableExists: tableCheck[0]?.exists,
      sequenceExists: sequenceCheck[0]?.exists,
      columns: columns.map((c: any) => ({ name: c.column_name, type: c.data_type })),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database check failed',
      message: error.message,
      code: error.code,
    }, { status: 500 });
  }
}

