import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET - Run migration to add created_date column
export async function GET(request: NextRequest) {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'scripts', 'add-created-date-column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results = [];

    for (const statement of statements) {
      try {
        // Skip the verification SELECT at the end - we'll do that separately
        if (statement.includes('SELECT') && statement.includes('COUNT(*)')) {
          continue;
        }
        
        await sql.unsafe(statement);
        results.push({ statement: statement.substring(0, 50) + '...', status: 'success' });
      } catch (error: any) {
        // Some statements might fail if they already exist (like IF NOT EXISTS)
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          results.push({ statement: statement.substring(0, 50) + '...', status: 'skipped', reason: error.message });
        } else {
          throw error;
        }
      }
    }

    // Verify the migration
    const verification = await sql`
      SELECT 
        COUNT(*) as total_rows,
        COUNT(created_date) as rows_with_date,
        MIN(created_date) as earliest_date,
        MAX(created_date) as latest_date
      FROM registrations
    `;

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results,
      verification: verification[0],
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

