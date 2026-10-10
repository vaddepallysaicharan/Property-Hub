import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyVideoPlayer from '@/components/property/PropertyVideoPlayer';
import PropertyEnquiryCard from '@/components/property/PropertyEnquiryCard';
import { getPropertyById } from '@/lib/properties';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building,
  Sparkles,
} from 'lucide-react';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
      return {
        title: 'Property Not Found | PropertyHub',
        description: 'The requested property could not be found.',
      };
    }

    const shortDesc = property.description
      ? property.description.length > 155
        ? `${property.description.slice(0, 155)}...`
        : property.description
      : `Explore ${property.title} in ${property.location.address}, Hyderabad on PropertyHub.`;

    return {
      title: `${property.title} | PropertyHub`,
      description: shortDesc,
      openGraph: {
        title: `${property.title} | PropertyHub`,
        description: shortDesc,
        images: property.imageUrl ? [property.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error instanceof Error ? error.message : error);
    return {
      title: 'Property Details | PropertyHub',
    };
  }
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;

  let property = null;
  try {
    property = await getPropertyById(id);
  } catch (error) {
    console.error('Failed to load property details:', error instanceof Error ? error.message : error);
    notFound();
  }

  if (!property) {
    notFound();
  }

  const formatIndianPrice = (price: number, listingType: string) => {
    if (listingType === 'For Sale') {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
      }
      if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
      }
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formattedPrice = formatIndianPrice(property.price, property.listingType);
  const formattedArea = new Intl.NumberFormat('en-IN').format(property.sqft);
  const allPhotos = property.photos && property.photos.length > 0 ? property.photos : [property.imageUrl];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/#explore"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to listings</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.listingType === 'For Rent'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {property.listingType}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {property.propertyType}
            </span>
          </div>
        </div>

        {/* Title and Address Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 mb-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Hyderabad Listing
                </span>
                {property.isFeatured && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {property.location.address}, {property.location.city}, {property.location.state}
                </span>
              </div>
            </div>

            {/* Mobile / Header Price Badge */}
            <div className="lg:text-right shrink-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Price
              </span>
              <div className="flex items-baseline gap-1 lg:justify-end">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {formattedPrice}
                </span>
                {property.pricePeriod === 'month' && (
                  <span className="text-sm font-medium text-slate-500">/ mo</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Gallery, Specs, Description, Video */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Photo Gallery */}
            <PropertyGallery photos={allPhotos} title={property.title} />

            {/* Key Specs Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Property Overview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Bedrooms</span>
                    <span className="text-sm font-bold text-slate-900">{property.bedrooms} BHK</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Bathrooms</span>
                    <span className="text-sm font-bold text-slate-900">{property.bathrooms} Baths</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Super Area</span>
                    <span className="text-sm font-bold text-slate-900">{formattedArea} sq.ft</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Type</span>
                    <span className="text-sm font-bold text-slate-900">{property.propertyType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                About this Property
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {property.description}
              </p>

              {/* Tags / Highlights */}
              {property.tags && property.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                    Highlights & Amenities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-50 border border-slate-200/80 text-slate-700 rounded-lg text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Video Walkthrough Section */}
            <PropertyVideoPlayer
              videoUrl={property.video_url}
              propertyTitle={property.title}
              posterImage={allPhotos[0] || property.imageUrl}
            />
          </div>

          {/* Right Column: Owner / Enquiry Sticky Card */}
          <div className="lg:col-span-1">
            <PropertyEnquiryCard
              property={property}
              formattedPrice={formattedPrice}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
