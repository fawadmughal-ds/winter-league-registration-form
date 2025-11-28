import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to escape CSV values
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const gender = searchParams.get('gender');
    const game = searchParams.get('game');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query with all filters using parameterized SQL (same pattern as registrations route)
    let queryText = 'SELECT * FROM registrations';
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClauses.push(`status = $${params.length}`);
    }
    if (gender) {
      params.push(gender);
      whereClauses.push(`gender = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      whereClauses.push(`created_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      whereClauses.push(`created_date <= $${params.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }
    queryText += ' ORDER BY created_at DESC';

    let registrations = await sql(queryText, params) as any[];

    // Filter by game if specified (client-side filtering for JSON field)
    if (game) {
      registrations = registrations.filter((reg: any) => {
        let selectedGames: string[] = [];
        try {
          if (typeof reg.selected_games === 'string') {
            selectedGames = JSON.parse(reg.selected_games);
          } else if (Array.isArray(reg.selected_games)) {
            selectedGames = reg.selected_games;
          }
        } catch (e) {
          selectedGames = [];
        }
        return Array.isArray(selectedGames) && selectedGames.includes(game);
      });
    }

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
      'Team Members',
      'Original Amount',
      'Discount',
      'Final Amount',
      'Payment Method',
      'Slip ID',
      'Transaction ID',
      'Status',
      'Created At',
    ];

    const csvRows = [
      headers.map(escapeCsvValue).join(','),
      ...registrations.map((reg: any) => {
        // Parse selected games
        let selectedGames = '';
        try {
          if (Array.isArray(reg.selected_games)) {
            selectedGames = reg.selected_games.join('; ');
          } else if (typeof reg.selected_games === 'string') {
            const parsed = JSON.parse(reg.selected_games);
            selectedGames = Array.isArray(parsed) ? parsed.join('; ') : '';
          }
        } catch (e) {
          selectedGames = '';
        }

        // Parse team members
        let teamMembers = '';
        try {
          if (reg.team_members) {
            const parsed = typeof reg.team_members === 'string' 
              ? JSON.parse(reg.team_members) 
              : reg.team_members;
            if (typeof parsed === 'object' && parsed !== null) {
              const teamMembersArray: string[] = [];
              Object.keys(parsed).forEach((game) => {
                const members = parsed[game];
                if (Array.isArray(members)) {
                  members.forEach((member: any) => {
                    teamMembersArray.push(`${game}: ${member.name || ''} (${member.rollNumber || ''})`);
                  });
                }
              });
              teamMembers = teamMembersArray.join(' | ');
            }
          }
        } catch (e) {
          teamMembers = '';
        }

        const discount = Number(reg.discount) || 0;
        const originalAmount = Number(reg.total_amount) || 0;
        const finalAmount = originalAmount - discount;

        return [
          reg.registration_number || '',
          reg.id,
          reg.email || '',
          reg.name || '',
          reg.roll_number || '',
          reg.contact_number || '',
          reg.alternative_contact_number || '',
          reg.gender || '',
          selectedGames,
          teamMembers,
          originalAmount,
          discount,
          finalAmount,
          reg.payment_method || '',
          reg.slip_id || '',
          reg.transaction_id || '',
          reg.status || '',
          reg.created_at ? new Date(reg.created_at).toLocaleString() : '',
        ].map(escapeCsvValue).join(',');
      }),
    ];

    const csv = csvRows.join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `registrations_${timestamp}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
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

