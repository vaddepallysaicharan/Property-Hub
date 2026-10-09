import { getDb } from './db';
import { Property, DbProperty, PropertyFilters, PropertyType, ListingType, Enquiry } from '@/types/property';

export function mapDbPropertyToProperty(row: Record<string, unknown>): Property {
  let photos: string[] = [];
  try {
    photos =
      typeof row.photos === 'string'
        ? JSON.parse(row.photos)
        : Array.isArray(row.photos)
          ? (row.photos as string[])
          : [];
  } catch {
    photos = [];
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';
  const imageUrl = photos[0] || defaultImage;

  const locString = String(row.location || '');
  const locationParts = locString.split(',').map((s) => s.trim());
  const address = locationParts[0] || 'Hyderabad';
  const city = locationParts[1] || 'Hyderabad';

  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description || ''),
    price: Number(row.price),
    pricePeriod: row.listing_type === 'For Rent' ? 'month' : 'total',
    location: {
      address,
      city,
      state: 'Telangana',
      raw: locString,
    },
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    sqft: Number(row.area) || 0,
    propertyType: (row.property_type as PropertyType) || 'Apartment',
    listingType: (row.listing_type as ListingType) || 'For Rent',
    imageUrl,
    photos: photos.length > 0 ? photos : [imageUrl],
    video_url: (row.video_url as string) || null,
    isFeatured:
      (row.listing_type === 'For Rent' && Number(row.price) >= 50000) ||
      (row.listing_type === 'For Sale' && Number(row.price) >= 30000000),
    owner: {
      name: 'Verified Owner',
      isVerified: true,
    },
    tags: [String(row.property_type), String(row.listing_type), address],
  };
}

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  try {
    const db = getDb();
    let query = 'SELECT * FROM properties WHERE 1=1';
    const args: (string | number)[] = [];

    if (filters?.location && filters.location.trim()) {
      query += ' AND LOWER(location) LIKE ?';
      args.push(`%${filters.location.toLowerCase().trim()}%`);
    }

    if (filters?.listingType && filters.listingType !== 'All') {
      query += ' AND listing_type = ?';
      args.push(filters.listingType);
    }

    if (filters?.propertyType && filters.propertyType !== 'All') {
      query += ' AND property_type = ?';
      args.push(filters.propertyType);
    }

    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      query += ' AND price >= ?';
      args.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
      query += ' AND price <= ?';
      args.push(filters.maxPrice);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql: query, args });
    return result.rows.map(mapDbPropertyToProperty);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('[Turso Error] Failed to fetch properties:', message);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM properties WHERE id = ? LIMIT 1',
      args: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return mapDbPropertyToProperty(result.rows[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error(`[Turso Error] Failed to fetch property ${id}:`, message);
    return null;
  }
}

export async function createProperty(data: {
  id?: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  photos: string[];
  video_url?: string | null;
}): Promise<string> {
  const db = getDb();
  const id = data.id || `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const photosJson = JSON.stringify(data.photos || []);

  await db.execute({
    sql: `
      INSERT INTO properties (
        id, title, description, price, location, property_type,
        listing_type, bedrooms, bathrooms, area, photos, video_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      data.title,
      data.description || '',
      data.price,
      data.location,
      data.property_type,
      data.listing_type,
      data.bedrooms,
      data.bathrooms,
      data.area,
      photosJson,
      data.video_url || null,
    ],
  });

  return id;
}

export async function updateProperty(
  id: string,
  data: Partial<Omit<DbProperty, 'id' | 'created_at' | 'photos'>> & { photos?: string[] | string }
): Promise<boolean> {
  const db = getDb();
  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    args.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    args.push(data.description);
  }
  if (data.price !== undefined) {
    updates.push('price = ?');
    args.push(data.price);
  }
  if (data.location !== undefined) {
    updates.push('location = ?');
    args.push(data.location);
  }
  if (data.property_type !== undefined) {
    updates.push('property_type = ?');
    args.push(data.property_type);
  }
  if (data.listing_type !== undefined) {
    updates.push('listing_type = ?');
    args.push(data.listing_type);
  }
  if (data.bedrooms !== undefined) {
    updates.push('bedrooms = ?');
    args.push(data.bedrooms);
  }
  if (data.bathrooms !== undefined) {
    updates.push('bathrooms = ?');
    args.push(data.bathrooms);
  }
  if (data.area !== undefined) {
    updates.push('area = ?');
    args.push(data.area);
  }
  if (data.photos !== undefined) {
    updates.push('photos = ?');
    args.push(typeof data.photos === 'string' ? data.photos : JSON.stringify(data.photos));
  }
  if (data.video_url !== undefined) {
    updates.push('video_url = ?');
    args.push(data.video_url);
  }

  if (updates.length === 0) return true;

  args.push(id);
  const result = await db.execute({
    sql: `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  return result.rowsAffected > 0;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'DELETE FROM properties WHERE id = ?',
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function getEnquiries(propertyId?: string): Promise<Enquiry[]> {
  try {
    const db = getDb();
    let query = `
      SELECT e.*, p.title as property_title
      FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
    `;
    const args: string[] = [];

    if (propertyId) {
      query += ' WHERE e.property_id = ?';
      args.push(propertyId);
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await db.execute({ sql: query, args });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('[Turso Error] Failed to fetch enquiries:', message);
    return [];
  }
}

export async function createEnquiry(data: {
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<string> {
  const db = getDb();
  const id = `enq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  await db.execute({
    sql: `
      INSERT INTO enquiries (id, property_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [id, data.property_id, data.name, data.email, data.phone, data.message],
  });

  return id;
}

