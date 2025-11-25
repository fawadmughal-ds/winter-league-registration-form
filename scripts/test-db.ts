import { sql } from '../lib/db';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Check if registrations table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registrations'
      );
    `;
    console.log('Registrations table exists:', tableCheck[0]?.exists);
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'registrations'
      ORDER BY ordinal_position;
    `;
    console.log('\nTable columns:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if sequence exists
    const sequenceCheck = await sql`
      SELECT EXISTS (
        SELECT FROM pg_sequences 
        WHERE sequencename = 'registration_number_seq'
      );
    `;
    console.log('\nSequence exists:', sequenceCheck[0]?.exists);
    
    // Test insert
    console.log('\nTesting insert...');
    const testResult = await sql`
      INSERT INTO registrations (
        id, email, name, roll_number, contact_number, alternative_contact_number,
        gender, selected_games, total_amount, payment_method, slip_id, transaction_id,
        screenshot_url, status, created_at, updated_at
      ) VALUES (
        'test-' || gen_random_uuid()::text, 'test@test.com', 'Test User', 'TEST001', 
        '03001234567', null, 'boys', '["Football"]', 2200.00, 'online', 
        'WLG25-TEST-1234', null, null, 'pending_online', NOW(), NOW()
      )
      RETURNING registration_number, id;
    `;
    console.log('Test insert successful:', testResult[0]);
    
    // Clean up test data
    await sql`DELETE FROM registrations WHERE email = 'test@test.com'`;
    console.log('Test data cleaned up');
    
    console.log('\n✅ Database structure is correct!');
  } catch (error: any) {
    console.error('❌ Database test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
    console.error('Hint:', error.hint);
    process.exit(1);
  }
}

testDatabase();

