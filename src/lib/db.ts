import { createClient, Client } from '@libsql/client';

let cachedClient: Client | null = null;

export function getDb(): Client {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('Database configuration error: TURSO_DATABASE_URL is not set.');
  }

  // Turso remote URLs (libsql:// or https://) require an auth token
  if (url.startsWith('libsql://') || url.startsWith('https://')) {
    if (!authToken) {
      throw new Error('Database configuration error: TURSO_AUTH_TOKEN is not set for remote Turso connection.');
    }
  }

  try {
    cachedClient = createClient({
      url,
      authToken: authToken || undefined,
    });
    return cachedClient;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to initialize Turso database client: ${message}`);
  }
}
