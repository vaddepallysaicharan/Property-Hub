'use client';

import { useState, useMemo, useEffect } from 'react';
import { Property } from '@/types/property';
import PropertyCard from '@/components/home/PropertyCard';
import {
  Search,
  Filter,
  RotateCcw,
  Building2,
  MapPin,
  Compass,
  Map as MapIcon,
  List as ListIcon,
  Loader2,
} from 'lucide-react';

// Client-side loader for Leaflet interactive map
import type PropertyMapType from './PropertyMap';

interface PropertyExplorerProps {
  initialProperties: Property[];
}

export default function PropertyExplorer({ initialProperties }: PropertyExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [listingType, setListingType] = useState<'All' | 'For Rent' | 'For Sale'>('All');
  const [propertyType, setPropertyType] = useState<'All' | 'Apartment' | 'House' | 'Villa'>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // Currently highlighted/selected property on card or marker click
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Mobile view mode: 'list' or 'map'
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Dynamic client-side loaded Map component (prevents SSR window access)
  const [PropertyMapComponent, setPropertyMapComponent] = useState<typeof PropertyMapType | null>(null);

  useEffect(() => {
    let isMounted = true;
    import('./PropertyMap')
      .then((mod) => {
        if (isMounted) {
          setPropertyMapComponent(() => mod.default);
        }
      })
      .catch((err) => {
        console.error('Failed to load PropertyMap:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort properties collection (synchronizes cards and map markers)
  const filteredProperties = useMemo(() => {
    let result = initialProperties.filter((property) => {
      // 1. Search term (matches location address, city, or title)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesLocation =
          property.location.address.toLowerCase().includes(query) ||
          property.location.city.toLowerCase().includes(query) ||
          (property.location.raw && property.location.raw.toLowerCase().includes(query));
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

    // 5. Sorting
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [initialProperties, searchTerm, listingType, propertyType, priceRange, sortBy]);

  // Keep selected property valid or deselect if filtered out
  const activeSelected = useMemo(() => {
    if (!selectedProperty) return null;
    return filteredProperties.find((p) => p.id === selectedProperty.id) || null;
  }, [filteredProperties, selectedProperty]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    listingType !== 'All' ||
    propertyType !== 'All' ||
    priceRange !== 'All' ||
    sortBy !== 'default';

  const resetFilters = () => {
    setSearchTerm('');
    setListingType('All');
    setPropertyType('All');
    setPriceRange('All');
    setSortBy('default');
    setSelectedProperty(null);
  };

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Map & Property Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Properties
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Discover the perfect property in prime locations across Hyderabad.
          </p>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden items-center p-1 bg-slate-100 rounded-xl self-start border border-slate-200/80">
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileView === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>Listings ({filteredProperties.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileView === 'map'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Compact Search & Filter Row */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* 1. Location / Keyword Search */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search location, name, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* 2. Listing Type Toggle */}
          <div className="flex items-center p-0.5 bg-white border border-slate-200 rounded-xl">
            {(['All', 'For Sale', 'For Rent'] as const).map((type) => (
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
                {type === 'All' ? 'All' : type}
              </button>
            ))}
          </div>

          {/* 3. Property Type Dropdown */}
          <div className="relative">
            <select
              value={propertyType}
              onChange={(e) =>
                setPropertyType(e.target.value as 'All' | 'Apartment' | 'House' | 'Villa')
              }
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
            </select>
          </div>

          {/* 4. Price Range Dropdown */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All">All Price Ranges</option>
              <option value="rent-under-50k">Rent: Under ₹50,000/mo</option>
              <option value="rent-above-50k">Rent: ₹50,000+/mo</option>
              <option value="sale-under-2cr">Sale: Under ₹2.00 Cr</option>
              <option value="sale-above-2cr">Sale: ₹2.00 Cr and above</option>
            </select>
          </div>

          {/* 5. Sort By Price Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'price-asc' | 'price-desc')}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="default">Sort: Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear & Reset Controls */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters applied</span>
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Split: Left (approx 52%) & Right (approx 48%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: ~52% (lg:col-span-7) */}
        <div
          className={`space-y-4 lg:col-span-7 ${
            mobileView === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Results Summary Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              Showing <span className="text-blue-600 font-bold">{filteredProperties.length}</span> of{' '}
              <span className="font-bold text-slate-900">{initialProperties.length}</span> properties in Hyderabad
            </span>

            {activeSelected && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Selected: {activeSelected.title.slice(0, 24)}...</span>
              </span>
            )}
          </div>

          {/* Scrollable 2-Column Property Card Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[calc(100vh-250px)] lg:overflow-y-auto lg:pr-1.5 scrollbar-thin">
              {filteredProperties.map((property) => (
                <div key={property.id} className="h-full">
                  <PropertyCard
                    property={property}
                    isSelected={activeSelected?.id === property.id}
                    onSelect={(p) => {
                      setSelectedProperty(p);
                      // In mobile list mode, switch or highlight
                    }}
                    compact
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-800">No properties found</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No properties matched your current filters. Try resetting filters or searching for another neighborhood like Madhapur or Gachibowli.
                </p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: ~48% (lg:col-span-5) */}
        <div
          className={`lg:col-span-5 lg:sticky lg:top-24 ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="h-[520px] lg:h-[calc(100vh-210px)] w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-md relative">
            {PropertyMapComponent ? (
              <PropertyMapComponent
                properties={filteredProperties}
                selectedProperty={activeSelected}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            ) : (
              <div className="w-full h-full min-h-[400px] bg-slate-100/80 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                <span className="text-xs font-semibold">Loading Hyderabad Map...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
