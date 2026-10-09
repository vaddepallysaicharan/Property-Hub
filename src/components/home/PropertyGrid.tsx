'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { Property } from '@/types/property';
import { Building2, Sparkles, Filter, Search, RotateCcw } from 'lucide-react';

interface PropertyGridProps {
  initialProperties: Property[];
  isFromDatabase?: boolean;
}

export default function PropertyGrid({
  initialProperties,
}: PropertyGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [listingType, setListingType] = useState<'All' | 'For Rent' | 'For Sale'>('All');
  const [propertyType, setPropertyType] = useState<'All' | 'Apartment' | 'House' | 'Villa'>('All');
  const [priceRange, setPriceRange] = useState<string>('All');

  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      // 1. Search query (matches location address, city, or title)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesLocation =
          property.location.address.toLowerCase().includes(query) ||
          property.location.city.toLowerCase().includes(query);
        const matchesTitle = property.title.toLowerCase().includes(query);
        if (!matchesLocation && !matchesTitle) return false;
      }

      // 2. Listing type filter
      if (listingType !== 'All' && property.listingType !== listingType) {
        return false;
      }

      // 3. Property type filter
      if (propertyType !== 'All' && property.propertyType !== propertyType) {
        return false;
      }

      // 4. Price range filter
      if (priceRange !== 'All') {
        if (priceRange === 'rent-under-50k') {
          if (property.listingType !== 'For Rent' || property.price > 50000) return false;
        } else if (priceRange === 'rent-above-50k') {
          if (property.listingType !== 'For Rent' || property.price <= 50000) return false;
        } else if (priceRange === 'sale-under-2cr') {
          if (property.listingType !== 'For Sale' || property.price > 20000000) return false;
        } else if (priceRange === 'sale-above-2cr') {
          if (property.listingType !== 'For Sale' || property.price <= 20000000) return false;
        }
      }

      return true;
    });
  }, [initialProperties, searchTerm, listingType, propertyType, priceRange]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    listingType !== 'All' ||
    propertyType !== 'All' ||
    priceRange !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setListingType('All');
    setPropertyType('All');
    setPriceRange('All');
  };

  return (
    <section id="explore" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            <Sparkles className="w-4 h-4" />
            Curated Listings
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Hyderabad Properties
          </h2>
          <p className="mt-2 text-slate-600 max-w-xl text-sm sm:text-base">
            Verified properties in Hitec City, Gachibowli, Banjara Hills & more. Filter by location, price, and type.
          </p>
        </div>

        {/* Quick stats badge */}
        <div className="text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 self-start md:self-end">
          Showing <span className="font-bold text-slate-800">{filteredProperties.length}</span> of{' '}
          <span className="font-bold text-slate-800">{initialProperties.length}</span> listings
        </div>
      </div>

      {/* Interactive Search & Filter Controls */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Location Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by location (e.g. Madhapur)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
            />
          </div>

          {/* Listing Type Toggle */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl">
            {(['All', 'For Rent', 'For Sale'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setListingType(type)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  listingType === type
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Property Type Dropdown */}
          <div className="relative">
            <select
              value={propertyType}
              onChange={(e) =>
                setPropertyType(e.target.value as 'All' | 'Apartment' | 'House' | 'Villa')
              }
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All">All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All">All Price Ranges</option>
              <option value="rent-under-50k">Rent: Under ₹50,000 / mo</option>
              <option value="rent-above-50k">Rent: ₹50,000+ / mo</option>
              <option value="sale-under-2cr">Sale: Under ₹2.00 Cr</option>
              <option value="sale-above-2cr">Sale: ₹2.00 Cr and above</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Active filters applied
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Grid of Property Cards */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No properties found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search or filters to discover more properties.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Bottom CTA for Owners */}
      <div className="mt-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium mb-4">
            For Property Owners
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Have a property in Hyderabad to rent or sell?
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            List your apartment, villa, or independent house with photos in under 3 minutes. Reach thousands of verified seekers directly without paying broker commissions.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/owner/properties/new"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95 inline-flex items-center justify-center"
            >
              List Your Property Now
            </Link>
            <span className="text-xs text-slate-400">Zero upfront fees for property owners</span>
          </div>
        </div>
      </div>
    </section>
  );
}
