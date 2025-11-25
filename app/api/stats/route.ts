import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get total registrations
    const totalResult = await sql`SELECT COUNT(*) as count FROM registrations`;
    const total = Number(totalResult[0]?.count) || 0;

    // Get paid registrations
    const paidResult = await sql`SELECT COUNT(*) as count FROM registrations WHERE status = 'paid'`;
    const paid = Number(paidResult[0]?.count) || 0;

    // Get pending online
    const pendingOnlineResult = await sql`SELECT COUNT(*) as count FROM registrations WHERE status = 'pending_online'`;
    const pendingOnline = Number(pendingOnlineResult[0]?.count) || 0;

    // Get pending cash
    const pendingCashResult = await sql`SELECT COUNT(*) as count FROM registrations WHERE status = 'pending_cash'`;
    const pendingCash = Number(pendingCashResult[0]?.count) || 0;

    // Get rejected
    const rejectedResult = await sql`SELECT COUNT(*) as count FROM registrations WHERE status = 'rejected'`;
    const rejected = Number(rejectedResult[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        total,
        paid,
        pendingOnline,
        pendingCash,
        rejected,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}

