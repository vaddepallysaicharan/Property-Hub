import { getDb } from './db';

export const CREATE_PROPERTIES_TABLE = `
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms REAL NOT NULL,
  area REAL NOT NULL,
  photos TEXT NOT NULL,
  video_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_ENQUIRIES_TABLE = `
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
);
`;

export async function ensurePropertiesColumns(): Promise<void> {
  try {
    const db = getDb();
    try {
      await db.execute('ALTER TABLE properties ADD COLUMN latitude REAL;');
    } catch {
      // Column may already exist
    }
    try {
      await db.execute('ALTER TABLE properties ADD COLUMN longitude REAL;');
    } catch {
      // Column may already exist
    }
  } catch (err) {
    console.warn('Could not run column migration:', err);
  }
}

export async function initDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDb();
    await db.execute(CREATE_PROPERTIES_TABLE);
    await db.execute(CREATE_ENQUIRIES_TABLE);
    await ensurePropertiesColumns();
    return { success: true, message: 'Database tables initialized successfully.' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown database error';
    console.error('Failed to initialize database tables:', msg);
    throw new Error(`Database initialization failed: ${msg}`);
  }
}
