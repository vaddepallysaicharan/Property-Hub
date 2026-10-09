import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getPropertyById } from '@/lib/properties';
import EditPropertyForm from '@/components/owner/EditPropertyForm';

interface EditPropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: EditPropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) {
    return {
      title: 'Property Not Found | PropertyHub',
    };
  }
  return {
    title: `Edit ${property.title} | PropertyHub`,
    description: `Update property details for ${property.title} on PropertyHub.`,
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs space-y-5 max-w-md w-full">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Property Not Found
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                The property you are trying to edit could not be found or may have been removed.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/owner"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <EditPropertyForm property={property} />
      </main>

      <Footer />
    </div>
  );
}
