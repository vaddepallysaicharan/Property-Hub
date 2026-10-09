import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { getPropertyById } from '@/lib/properties';
import PropertyVideoGenerator from '@/components/owner/PropertyVideoGenerator';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return {
      title: 'Property Not Found | PropertyHub',
    };
  }

  return {
    title: `Create Showcase Video - ${property.title} | PropertyHub`,
    description: `Generate a cinematic showcase video for ${property.title} on PropertyHub.`,
  };
}

export default async function PropertyVideoPage({ params }: VideoPageProps) {
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
                The property you are trying to generate a showcase for could not be found.
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
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs font-medium text-slate-600 hidden sm:inline">
            Property Showcase
          </span>
        </div>

        {/* Header Banner */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full mb-3 shadow-2xs">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Property Showcase</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Property Showcase
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Create a cinematic showcase video from your property photos.
          </p>
        </div>

        {/* Generator Component */}
        <PropertyVideoGenerator property={property} />
      </main>

      <Footer />
    </div>
  );
}
