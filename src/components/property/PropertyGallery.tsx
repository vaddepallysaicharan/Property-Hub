'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  photos: string[];
  title: string;
}

export default function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const validPhotos =
    photos && photos.length > 0
      ? photos
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  const currentPhoto = validPhotos[selectedIndex] || validPhotos[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validPhotos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === validPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Primary Large Image */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm group">
        <Image
          src={currentPhoto}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-all duration-300 group-hover:scale-[1.01]"
        />

        {/* Photo Counter Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
          <Camera className="w-3.5 h-3.5" />
          <span>
            {selectedIndex + 1} / {validPhotos.length}
          </span>
        </div>

        {/* Carousel arrows if multiple photos */}
        {validPhotos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {validPhotos.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {validPhotos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-[16/10] w-20 sm:w-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedIndex === index
                  ? 'border-blue-600 ring-2 ring-blue-500/20 scale-102'
                  : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <Image
                src={photo}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
