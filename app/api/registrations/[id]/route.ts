import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET - Get single registration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`SELECT * FROM registrations WHERE id = ${params.id}`;
    const registration = result[0] || null;

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error: any) {
    console.error('Get registration error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update registration status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { status, discount } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending_cash', 'pending_online', 'paid', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Validate discount if provided
    let discountValue = 0;
    if (discount !== undefined && discount !== null) {
      discountValue = Number(discount);
      if (isNaN(discountValue) || discountValue < 0) {
        return NextResponse.json(
          { error: 'Invalid discount value. Must be a non-negative number.' },
          { status: 400 }
        );
      }
    }

    await sql`
      UPDATE registrations
      SET status = ${status}, 
          discount = ${discountValue},
          updated_at = NOW()
      WHERE id = ${params.id}
    `;

    const result = await sql`SELECT * FROM registrations WHERE id = ${params.id}`;
    const updated = result[0] || null;

    if (!updated) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update registration error:', error);
    return NextResponse.json(
      { error: 'Failed to update registration', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await sql`DELETE FROM registrations WHERE id = ${params.id}`;

    return NextResponse.json({ success: true, message: 'Registration deleted' });
  } catch (error: any) {
    console.error('Delete registration error:', error);
    return NextResponse.json(
      { error: 'Failed to delete registration', details: error.message },
      { status: 500 }
    );
  }
}

