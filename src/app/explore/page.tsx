import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyExplorer from '@/components/explore/PropertyExplorer';
import { getProperties } from '@/lib/properties';
import { mockProperties } from '@/data/mockProperties';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Properties in Hyderabad | PropertyHub',
  description:
    'Discover verified properties in prime locations across Hyderabad with our interactive map and neighborhood explorer.',
};

export default async function ExplorePage() {
  let properties = [];

  try {
    const dbProperties = await getProperties();
    if (dbProperties && dbProperties.length > 0) {
      properties = dbProperties;
    } else {
      properties = mockProperties;
    }
  } catch (error) {
    console.error('Server error fetching properties for explore page:', error);
    properties = mockProperties;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 bg-slate-50/40">
        <PropertyExplorer initialProperties={properties} />
      </main>
      <Footer />
    </div>
  );
}
