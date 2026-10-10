import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/home/HeroSection';
import PropertyGrid from '@/components/home/PropertyGrid';
import PropertyShowcaseSection from '@/components/home/PropertyShowcaseSection';
import OwnerCtaSection from '@/components/home/OwnerCtaSection';
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
      {/* Adaptive Navbar: transparent over cinematic hero, white on scroll */}
      <Navbar />

      <main className="flex-1">
        {/* Section 1: Cinematic Hero with Villa Photograph & Benefit Strip */}
        <HeroSection />

        {/* Section 2: Option B Transition into Clean Light Discovery Section */}
        <div className="relative bg-gradient-to-b from-slate-100/60 via-white to-white">
          <PropertyGrid
            initialProperties={properties}
            isFromDatabase={isFromDatabase}
          />
        </div>

        {/* Section 3: Cinematic Property Showcase Presentation */}
        <PropertyShowcaseSection />

        {/* Section 4: Property Owner CTA Section */}
        <OwnerCtaSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
