import { createClient } from '@libsql/client';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: dbUrl,
  authToken: authToken || undefined,
});

async function runTests() {
  console.log(`Starting Property Enquiry System API Tests against ${baseUrl}...\n`);
  let passed = 0;
  let failed = 0;

  // Test 1: Valid Enquiry
  try {
    const res = await fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'hyd-prop-01',
        name: 'Aarav Mehta',
        email: 'aarav.mehta@example.com',
        phone: '9876543210',
        message: 'Interested in visiting this lakeview property this Saturday.',
      }),
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.enquiry?.id) {
      console.log('✓ Test 1 Passed: Valid enquiry created successfully with ID:', data.enquiry.id);
      passed++;

      // Verify in Turso
      const dbCheck = await db.execute({
        sql: 'SELECT * FROM enquiries WHERE id = ?',
        args: [data.enquiry.id],
      });
      if (dbCheck.rows.length === 1 && dbCheck.rows[0].email === 'aarav.mehta@example.com') {
        console.log('  ✓ Turso DB Check: Enquiry verified in database table.');
      } else {
        console.error('  ✗ Turso DB Check Failed: Enquiry not found in DB.');
        failed++;
      }
    } else {
      console.error('✗ Test 1 Failed: Expected 201 with enquiry ID. Got:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('✗ Test 1 Error:', err.message);
    failed++;
  }

  // Test 2: Missing Name
  try {
    const res = await fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'hyd-prop-01',
        name: '',
        email: 'test@example.com',
        phone: '9876543210',
        message: 'Valid message content exceeding ten characters.',
      }),
    });
    const data = await res.json();
    if (res.status === 400 && !data.success && data.errors?.name) {
      console.log('✓ Test 2 Passed: Missing name rejected with 400 validation error.');
      passed++;
    } else {
      console.error('✗ Test 2 Failed: Expected 400 for missing name. Got:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('✗ Test 2 Error:', err.message);
    failed++;
  }

  // Test 3: Invalid Email
  try {
    const res = await fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'hyd-prop-01',
        name: 'Pooja Reddy',
        email: 'invalid-email-format',
        phone: '9876543210',
        message: 'Valid message content exceeding ten characters.',
      }),
    });
    const data = await res.json();
    if (res.status === 400 && !data.success && data.errors?.email) {
      console.log('✓ Test 3 Passed: Invalid email rejected with 400 validation error.');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: Expected 400 for invalid email. Got:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('✗ Test 3 Error:', err.message);
    failed++;
  }

  // Test 4: Missing Message / Short Message
  try {
    const res = await fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'hyd-prop-01',
        name: 'Pooja Reddy',
        email: 'pooja@example.com',
        phone: '9876543210',
        message: 'Short',
      }),
    });
    const data = await res.json();
    if (res.status === 400 && !data.success && data.errors?.message) {
      console.log('✓ Test 4 Passed: Short message rejected with 400 validation error.');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Expected 400 for short message. Got:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('✗ Test 4 Error:', err.message);
    failed++;
  }

  // Test 5: Non-existent Property ID
  try {
    const res = await fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'non-existent-property-xyz',
        name: 'Rohan Sharma',
        email: 'rohan@example.com',
        phone: '9876543210',
        message: 'Interested in this property if available.',
      }),
    });
    const data = await res.json();
    if (res.status === 404 && !data.success) {
      console.log('✓ Test 5 Passed: Non-existent property ID rejected with 404 status.');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: Expected 404 for non-existent property. Got:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('✗ Test 5 Error:', err.message);
    failed++;
  }

  console.log(`\nTests Summary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
