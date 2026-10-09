import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OwnerDashboardClient from '@/components/owner/OwnerDashboardClient';
import { getProperties } from '@/lib/properties';
import { getAllEnrichedEnquiries } from '@/lib/enquiries';

export const metadata: Metadata = {
  title: 'Owner Dashboard | PropertyHub',
  description: 'Manage your property listings, review statistics, and update availability.',
};

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const [properties, enquiries] = await Promise.all([
    getProperties(),
    getAllEnrichedEnquiries(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <OwnerDashboardClient 
          initialProperties={properties} 
          initialEnquiries={enquiries}
        />
      </main>

      <Footer />
    </div>
  );
}
