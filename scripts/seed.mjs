import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error('Error: TURSO_DATABASE_URL is not set.');
  process.exit(1);
}

const db = createClient({
  url,
  authToken: authToken || undefined,
});

const CREATE_PROPERTIES = `
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

const CREATE_ENQUIRIES = `
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

const initialProperties = [
  {
    id: 'hyd-prop-01',
    title: 'Luxury 3BHK Lakeview High-Rise',
    description: 'Scenic Durgam Cheruvu lake-facing 3BHK in Hitec City / Madhapur with Italian marble flooring, modern modular kitchen, and luxury clubhouse access.',
    price: 65000,
    location: 'Madhapur, Hyderabad',
    property_type: 'Apartment',
    listing_type: 'For Rent',
    bedrooms: 3,
    bathrooms: 3,
    area: 2150,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    ]),
    video_url: null,
  },
  {
    id: 'hyd-prop-02',
    title: 'Contemporary 4BHK Gated Villa',
    description: 'Independent luxury triplex villa in Gachibowli financial district corridor with landscaped private garden, home theatre room, and 2-car covered parking.',
    price: 38500000,
    location: 'Gachibowli, Hyderabad',
    property_type: 'Villa',
    listing_type: 'For Sale',
    bedrooms: 4,
    bathrooms: 4.5,
    area: 4200,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    ]),
    video_url: null,
  },
  {
    id: 'hyd-prop-03',
    title: 'Modern 2BHK Botanical Garden View Flat',
    description: 'Sunlit east-facing flat near Botanical Garden Kondapur, fully furnished with ACs, 100% DG power backup, piped gas, and dedicated stilt parking.',
    price: 38000,
    location: 'Kondapur, Hyderabad',
    property_type: 'Apartment',
    listing_type: 'For Rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1280,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    ]),
    video_url: null,
  },
  {
    id: 'hyd-prop-04',
    title: 'Prestige Independent Duplex House',
    description: 'Prestigious independent residence in Banjara Hills Road No. 12 featuring teak wood interiors, expansive terrace garden, and servant quarters.',
    price: 65000000,
    location: 'Banjara Hills, Hyderabad',
    property_type: 'House',
    listing_type: 'For Sale',
    bedrooms: 5,
    bathrooms: 5,
    area: 4800,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ]),
    video_url: null,
  },
  {
    id: 'hyd-prop-05',
    title: 'Vastu-Compliant 3BHK Family Flat',
    description: 'Well-ventilated 3BHK close to Kukatpally Metro station and Nexus Mall, complete with children play area, gym, and 24/7 manned security.',
    price: 11500000,
    location: 'Kukatpally, Hyderabad',
    property_type: 'Apartment',
    listing_type: 'For Sale',
    bedrooms: 3,
    bathrooms: 3,
    area: 1750,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ]),
    video_url: null,
  },
  {
    id: 'hyd-prop-06',
    title: 'Serene 3BHK Garden Townhouse',
    description: 'Quiet residential duplex house in Miyapur with private courtyard, solar rooftop water heating, and wide tree-lined avenue frontage.',
    price: 32000,
    location: 'Miyapur, Hyderabad',
    property_type: 'House',
    listing_type: 'For Rent',
    bedrooms: 3,
    bathrooms: 3,
    area: 1900,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    ]),
    video_url: null,
  },
];

async function main() {
  console.log('Connecting to Turso...');
  await db.execute(CREATE_PROPERTIES);
  console.log('✓ "properties" table verified/created.');
  await db.execute(CREATE_ENQUIRIES);
  console.log('✓ "enquiries" table verified/created.');

  for (const item of initialProperties) {
    await db.execute({
      sql: `
        INSERT INTO properties (
          id, title, description, price, location, property_type,
          listing_type, bedrooms, bathrooms, area, photos, video_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          photos = excluded.photos,
          title = excluded.title,
          description = excluded.description,
          price = excluded.price,
          location = excluded.location,
          property_type = excluded.property_type,
          listing_type = excluded.listing_type,
          bedrooms = excluded.bedrooms,
          bathrooms = excluded.bathrooms,
          area = excluded.area
      `,
      args: [
        item.id,
        item.title,
        item.description,
        item.price,
        item.location,
        item.property_type,
        item.listing_type,
        item.bedrooms,
        item.bathrooms,
        item.area,
        item.photos,
        item.video_url,
      ],
    });
  }

  const countRes = await db.execute('SELECT COUNT(*) as count FROM properties');
  const totalCount = countRes.rows[0].count;

  console.log(`✓ Seed & photos updated. Total properties in database: ${totalCount}`);
}

main().catch((err) => {
  console.error('Migration/Seed Error:', err);
  process.exit(1);
});
