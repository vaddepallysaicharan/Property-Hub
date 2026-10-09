import { getDb } from './db';
import { Enquiry } from '@/types/property';

export interface CreateEnquiryInput {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export async function checkPropertyExists(propertyId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id FROM properties WHERE id = ? LIMIT 1',
    args: [propertyId],
  });
  return result.rows.length > 0;
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<string> {
  const db = getDb();
  const id = `enq-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  await db.execute({
    sql: `
      INSERT INTO enquiries (id, property_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.propertyId,
      input.name.trim(),
      input.email.trim().toLowerCase(),
      input.phone.trim(),
      input.message.trim(),
    ],
  });

  return id;
}

export async function getEnquiriesByPropertyId(propertyId: string): Promise<Enquiry[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT e.*, p.title as property_title
      FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
      WHERE e.property_id = ?
      ORDER BY e.created_at DESC
    `,
    args: [propertyId],
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    property_id: String(row.property_id),
    property_title: String(row.property_title || 'Unknown Property'),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
    message: String(row.message),
    created_at: String(row.created_at || ''),
  }));
}

export async function getAllEnrichedEnquiries(filterPropertyId?: string): Promise<import('@/types/property').EnrichedEnquiry[]> {
  const db = getDb();
  let query = `
    SELECT 
      e.id,
      e.property_id,
      e.name,
      e.email,
      e.phone,
      e.message,
      e.created_at,
      p.title AS property_title,
      p.price AS property_price,
      p.listing_type AS property_listing_type,
      p.property_type AS property_type,
      p.location AS property_location,
      p.photos AS property_photos
    FROM enquiries e
    LEFT JOIN properties p ON e.property_id = p.id
  `;
  const args: string[] = [];

  if (filterPropertyId) {
    query += ' WHERE e.property_id = ?';
    args.push(filterPropertyId);
  }

  query += ' ORDER BY e.created_at DESC';

  const result = await db.execute({ sql: query, args });
  const defaultImage =
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';

  return result.rows.map((row) => {
    let photos: string[] = [];
    try {
      if (typeof row.property_photos === 'string') {
        photos = JSON.parse(row.property_photos);
      } else if (Array.isArray(row.property_photos)) {
        photos = row.property_photos as string[];
      }
    } catch {
      photos = [];
    }

    return {
      id: String(row.id),
      property_id: String(row.property_id),
      property_title: String(row.property_title || 'Property Listing'),
      property_price: Number(row.property_price) || 0,
      property_listing_type: String(row.property_listing_type || 'For Rent'),
      property_type: String(row.property_type || 'Apartment'),
      property_location: String(row.property_location || 'Hyderabad'),
      property_image: photos[0] || defaultImage,
      name: String(row.name),
      email: String(row.email),
      phone: String(row.phone),
      message: String(row.message),
      created_at: String(row.created_at || ''),
    };
  });
}
