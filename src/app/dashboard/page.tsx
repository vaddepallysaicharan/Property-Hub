import { Metadata } from 'next';
import { getProperties, getEnquiries } from '@/lib/properties';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'Owner Dashboard | PropertyHub',
  description: 'Manage your property listings, post new properties, and view seeker enquiries.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [properties, enquiries] = await Promise.all([
    getProperties(),
    getEnquiries(),
  ]);

  return <DashboardClient properties={properties} enquiries={enquiries} />;
}
