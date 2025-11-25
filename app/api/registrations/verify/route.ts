import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Verify registration by registration number or slip ID (Admin only - for QR code scanning)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin authentication required' },
        { status: 401 }
      );
    }

    // Verify session in database
    const sessionResult = await sql`
      SELECT * FROM admin_sessions 
      WHERE session_token = ${sessionToken} AND expires_at > NOW()
    `;
    
    if (!sessionResult || sessionResult.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired session' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const regNum = searchParams.get('regNum');
    const slipId = searchParams.get('slipId');

    if (!regNum && !slipId) {
      return NextResponse.json(
        { error: 'Registration number or slip ID is required' },
        { status: 400 }
      );
    }

    let result;
    if (regNum) {
      result = await sql`
        SELECT * FROM registrations 
        WHERE registration_number = ${Number(regNum)}
        LIMIT 1
      `;
    } else if (slipId) {
      result = await sql`
        SELECT * FROM registrations 
        WHERE slip_id = ${slipId}
        LIMIT 1
      `;
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const registration = result[0];

    // Parse selected_games if it's a string
    const parsedRegistration = {
      ...registration,
      selected_games: typeof registration.selected_games === 'string'
        ? JSON.parse(registration.selected_games)
        : registration.selected_games,
    };

    return NextResponse.json({
      success: true,
      data: parsedRegistration,
    });
  } catch (error: any) {
    console.error('Verify registration error:', error);
    return NextResponse.json(
      { error: 'Failed to verify registration', details: error.message },
      { status: 500 }
    );
  }
}

