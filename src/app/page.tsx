import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import PropertyGrid from '@/components/home/PropertyGrid';
import Footer from '@/components/layout/Footer';
import { getProperties } from '@/lib/properties';
import { mockProperties } from '@/data/mockProperties';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let properties = [];
  let isFromDatabase = false;

  try {
    const dbProperties = await getProperties();
    if (dbProperties && dbProperties.length > 0) {
      properties = dbProperties;
      isFromDatabase = true;
    } else {
      // Fallback to mockProperties if database table has no records
      properties = mockProperties;
    }
  } catch (error) {
    console.error('Server error fetching properties from Turso:', error);
    properties = mockProperties;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PropertyGrid initialProperties={properties} isFromDatabase={isFromDatabase} />
      </main>
      <Footer />
    </div>
  );
}
