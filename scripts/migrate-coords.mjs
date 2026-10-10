import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.log('TURSO_DATABASE_URL not set in environment, skipping migration script.');
  process.exit(0);
}

const db = createClient({
  url,
  authToken: authToken || undefined,
});

async function main() {
  console.log('Ensuring latitude and longitude columns in properties table...');
  try {
    await db.execute('ALTER TABLE properties ADD COLUMN latitude REAL;');
    console.log('Added latitude column.');
  } catch (err) {
    console.log('latitude column already exists or:', err.message);
  }

  try {
    await db.execute('ALTER TABLE properties ADD COLUMN longitude REAL;');
    console.log('Added longitude column.');
  } catch (err) {
    console.log('longitude column already exists or:', err.message);
  }

  console.log('Coordinates migration complete.');
}

main().catch(console.error);
