'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import L from 'leaflet';
import { Property } from '@/types/property';
import { HYDERABAD_DEFAULT_CENTER, formatMarkerPrice } from '@/lib/coordinates';
import {
  MapPin,
  ExternalLink,
  X,
  Compass,
  Building2,
  Info,
} from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property | null) => void;
  className?: string;
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onSelectProperty,
  className = '',
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Filter properties with valid coordinates
  const validCoordinateProperties = properties.filter(
    (p) =>
      typeof p.latitude === 'number' &&
      typeof p.longitude === 'number' &&
      !isNaN(p.latitude) &&
      !isNaN(p.longitude)
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [HYDERABAD_DEFAULT_CENTER.latitude, HYDERABAD_DEFAULT_CENTER.longitude],
        zoom: HYDERABAD_DEFAULT_CENTER.zoom,
        zoomControl: false, // We'll add custom positioned zoom control
        attributionControl: false,
      });

      // Add OpenStreetMap standard tiles (direct HTTPS without domain sharding to avoid 301 redirects)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add Zoom Control top-left
      L.control
        .zoom({
          position: 'topleft',
        })
        .addTo(map);

      // Add Attribution bottom-right
      L.control
        .attribution({
          position: 'bottomright',
          prefix: false,
        })
        .addTo(map);

      // Create a layer group for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Handle container resize
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      // Force recalculation of container bounds after initial layout mount
      const invalidateTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      return () => {
        clearTimeout(invalidateTimer);
        resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
      setTimeout(() => {
        setMapError('Failed to load map. Please refresh the page.');
      }, 0);
    }
  }, []);

  // Update markers when properties or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();

    if (validCoordinateProperties.length === 0) return;

    validCoordinateProperties.forEach((prop) => {
      if (typeof prop.latitude !== 'number' || typeof prop.longitude !== 'number') return;

      const isSelected = selectedProperty?.id === prop.id;
      const priceLabel = formatMarkerPrice(prop.price);

      // Build custom HTML icon with price badge and downward pointer
      const customIcon = L.divIcon({
        className: 'custom-property-marker-wrapper',
        html: `
          <div class="relative flex flex-col items-center group cursor-pointer transition-transform ${
            isSelected ? 'scale-110 z-50' : 'z-20 hover:scale-105'
          }">
            <div class="px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-md whitespace-nowrap ${
              isSelected
                ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 shadow-blue-500/40'
                : 'bg-white text-slate-900 border border-slate-300 hover:border-blue-500 hover:text-blue-600'
            }">
              <span>${priceLabel}</span>
            </div>
            <div class="w-2.5 h-2.5 -mt-1 rotate-45 transition-colors ${
              isSelected ? 'bg-blue-600' : 'bg-white border-r border-b border-slate-300'
            }"></div>
          </div>
        `,
        iconSize: [60, 36],
        iconAnchor: [30, 36],
      });

      const marker = L.marker([prop.latitude, prop.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
        title: prop.title,
      });

      marker.on('click', () => {
        onSelectProperty(prop);
        map.flyTo([prop.latitude!, prop.longitude!], Math.max(map.getZoom(), 14), {
          duration: 0.6,
        });
      });

      markersLayer.addLayer(marker);
    });
  }, [validCoordinateProperties, selectedProperty, onSelectProperty]);

  // Center/Pan when selectedProperty changes externally (e.g. clicked in list)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProperty) return;

    if (
      typeof selectedProperty.latitude === 'number' &&
      typeof selectedProperty.longitude === 'number'
    ) {
      map.flyTo([selectedProperty.latitude, selectedProperty.longitude], Math.max(map.getZoom(), 14), {
        duration: 0.7,
      });
    }
  }, [selectedProperty]);

  // Reset to default Hyderabad view
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [HYDERABAD_DEFAULT_CENTER.latitude, HYDERABAD_DEFAULT_CENTER.longitude],
      HYDERABAD_DEFAULT_CENTER.zoom,
      { duration: 0.8 }
    );
  };

  const formatPriceFull = (price: number, listingType: string) => {
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

  return (
    <div className={`relative w-full h-full bg-slate-100 ${className}`}>
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" tabIndex={0} aria-label="Interactive Hyderabad Property Map" />

      {/* Top Controls Overlay */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleResetView}
          title="Reset to Hyderabad center"
          className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 text-xs font-semibold rounded-xl shadow-md border border-slate-200/80 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>Hyderabad Center</span>
        </button>

        <div className="px-2.5 py-1.5 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium rounded-xl shadow-md">
          {validCoordinateProperties.length} pins mapped
        </div>
      </div>

      {/* Map Error Banner */}
      {mapError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-4 bg-white/95 rounded-2xl shadow-xl border border-rose-200 text-center max-w-sm">
          <p className="text-xs text-rose-600 font-semibold">{mapError}</p>
        </div>
      )}

      {/* Selected Property Preview Card Overlay */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 p-3.5 shadow-2xl space-y-3 relative">
            {/* Close Preview Button */}
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => onSelectProperty(null)}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              {/* Photo Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                {selectedProperty.imageUrl ? (
                  <Image
                    src={selectedProperty.imageUrl}
                    alt={selectedProperty.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 text-white">
                  {selectedProperty.listingType}
                </span>
              </div>

              {/* Info Details */}
              <div className="flex-1 min-w-0 pr-6 space-y-1">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {selectedProperty.title}
                </div>

                <div className="text-xs font-extrabold text-blue-600">
                  {formatPriceFull(selectedProperty.price, selectedProperty.listingType)}
                  {selectedProperty.pricePeriod === 'month' && (
                    <span className="text-[10px] font-normal text-slate-500">/mo</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {selectedProperty.location.address}, {selectedProperty.location.city}
                  </span>
                </div>

                {selectedProperty.isApproximateLocation && (
                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Info className="w-2.5 h-2.5" />
                    <span>Neighborhood area pin</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedProperty.bedrooms} BHK &bull; {selectedProperty.sqft} sqft
              </span>

              <Link
                href={`/properties/${selectedProperty.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
