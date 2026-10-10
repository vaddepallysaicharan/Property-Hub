'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Camera,
  Filter,
  MessageSquareHeart,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (term: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();

    // Call callback or dispatch custom window event for discovery grid
    if (onSearch) {
      onSearch(query);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('propertyhub:search', { detail: query })
      );
    }

    // Smoothly scroll down to discovery section
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[82vh] sm:min-h-[88vh] flex flex-col justify-between pt-24 sm:pt-28 pb-8 sm:pb-12 overflow-x-hidden">
      {/* Background Villa Photograph */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-villa.jpg"
          alt="Modern luxury villa with infinity pool at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-[center_35%] md:object-center"
        />

        {/* Cinematic Multi-Layer Gradient Overlays */}
        {/* Left-side dark gradient to ensure high readability of copy while keeping villa visible on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30 md:to-transparent" />

        {/* Top subtle vignette for transparent navbar */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent" />

        {/* Bottom subtle transition into light section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-6 sm:py-10">
        <div className="max-w-2xl space-y-5 sm:space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/30 backdrop-blur-md text-blue-200 text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>WELCOME TO PROPERTYHUB</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Find a Place <br className="hidden sm:inline" />
            <span className="text-white">You&apos;ll Love to Call Home.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 leading-relaxed font-normal max-w-xl">
            Discover beautiful homes, explore properties for sale and rent, and connect directly with property owners.
          </p>

          {/* Primary & Secondary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 sm:pt-2">
            <a
              href="#explore"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Explore Properties</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/owner/properties/new"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/25 transition-all active:scale-[0.98] w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 text-blue-300" />
              <span>List Your Property</span>
            </Link>
          </div>

          {/* Prominent Horizontal Search Bar */}
          <div className="pt-2 sm:pt-3 max-w-xl">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl shadow-2xl border border-white/30 flex items-center gap-1.5 sm:gap-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 flex-1 pl-2.5 sm:pl-3 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search location, area, or title..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-slate-300 mt-2 px-1">
              <span className="text-slate-400">Popular:</span>
              {(['Madhapur', 'Gachibowli', 'Kondapur', 'Banjara Hills'] as const).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => {
                    setSearchTerm(area);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('propertyhub:search', { detail: area })
                      );
                      const el = document.getElementById('explore');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-white underline underline-offset-2 transition-colors"
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Benefits Strip (Section 4) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/10">
          {/* Benefit 1 */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10 flex items-start gap-3.5 hover:bg-slate-900/75 transition-colors">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Owner Photo Listings</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                High-resolution property photos directly from owners.
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3.5 hover:bg-slate-900/75 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Direct & Transparent</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Filter easily by price, location, and property type.
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3.5 hover:bg-slate-900/75 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Instant Enquiries</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Send property enquiries in seconds without unnecessary delays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
