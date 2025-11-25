import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const registrations = await sql`SELECT * FROM registrations ORDER BY created_at DESC`;

    // Convert to CSV format
    const headers = [
      'Registration Number',
      'ID',
      'Email',
      'Name',
      'Roll Number',
      'Contact Number',
      'Alternative Contact',
      'Gender',
      'Selected Games',
      'Total Amount',
      'Payment Method',
      'Slip ID',
      'Transaction ID',
      'Status',
      'Created At',
    ];

    const csvRows = [
      headers.join(','),
      ...registrations.map((reg: any) => {
        const selectedGames = Array.isArray(reg.selected_games) 
          ? reg.selected_games.join('; ')
          : typeof reg.selected_games === 'string'
            ? JSON.parse(reg.selected_games).join('; ')
            : '';
        
        return [
          reg.registration_number || '',
          reg.id,
          reg.email,
          `"${reg.name}"`,
          reg.roll_number,
          reg.contact_number,
          reg.alternative_contact_number || '',
          reg.gender || '',
          `"${selectedGames}"`,
          reg.total_amount || 0,
          reg.payment_method,
          reg.slip_id || '',
          reg.transaction_id || '',
          reg.status,
          reg.created_at,
        ].join(',');
      }),
    ];

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="registrations.csv"',
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error.message },
      { status: 500 }
    );
  }
}

