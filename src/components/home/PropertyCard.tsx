import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Bed, Bath, Maximize2, CheckCircle2, Send, Heart, Play } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: (property: Property) => void;
  compact?: boolean;
}

export default function PropertyCard({
  property,
  isSelected = false,
  onSelect,
  compact = false,
}: PropertyCardProps) {
  const router = useRouter();

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

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking inside a link or button, let that action proceed
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    if (onSelect) {
      onSelect(property);
    } else {
      router.push(`/properties/${property.id}`);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col cursor-pointer ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-lg -translate-y-0.5 bg-blue-50/10'
          : 'border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1'
      } ${compact ? 'text-xs' : ''}`}
    >
      {/* Property Image Container */}
      <div
        onClick={() => {
          if (onSelect) {
            onSelect(property);
          } else {
            router.push(`/properties/${property.id}`);
          }
        }}
        className="block relative aspect-[16/10] w-full overflow-hidden bg-slate-100"
      >
        <Image
          src={property.imageUrl}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
              property.listingType === 'For Rent'
                ? 'bg-blue-600/90 text-white'
                : 'bg-emerald-600/90 text-white'
            }`}
          >
            {property.listingType}
          </span>
          {property.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
              Featured
            </span>
          )}
          {property.video_url && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-white backdrop-blur-md shadow-sm flex items-center gap-1 border border-white/20">
              <Play className="w-2.5 h-2.5 fill-white text-white" />
              <span>Video Showcase</span>
            </span>
          )}
        </div>

        {/* Favorite Button Placeholder */}
        <button
          type="button"
          aria-label="Save property"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500 backdrop-blur-md shadow-sm transition-colors z-10"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Property Type Badge bottom */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/75 text-white backdrop-blur-sm">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {formattedPrice}
            </span>
            {property.pricePeriod === 'month' && (
              <span className="text-sm font-medium text-slate-500">/ month</span>
            )}
          </div>

          {/* Title (Clickable Link) */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
            <Link href={`/properties/${property.id}`} className="hover:underline">
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {property.location.address}, {property.location.city}, {property.location.state}
            </span>
          </div>

          {/* Specs / Meta */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] sm:text-xs text-slate-600 mb-4">
            <div className="flex items-center gap-1 sm:gap-1.5 justify-center min-w-0">
              <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
              <span className="truncate">{property.bedrooms} BHK</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 justify-center border-x border-slate-200/60 px-1 min-w-0">
              <Bath className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
              <span className="truncate">{property.bathrooms} Bath</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 justify-center min-w-0">
              <Maximize2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{property.sqft} sqft</span>
            </div>
          </div>
        </div>

        {/* Owner & Enquiry CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {property.owner.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {property.owner.name}
                </span>
                {property.owner.isVerified && (
                  <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-400">Owner</p>
            </div>
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-semibold transition-all shrink-0 active:scale-95"
          >
            <Send className="w-3 h-3" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
