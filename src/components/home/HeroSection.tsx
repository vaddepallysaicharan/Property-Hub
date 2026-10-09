import { Search, MapPin, Building2, CircleDollarSign, ShieldCheck, Camera, MessageSquareHeart } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-100">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-100/40 via-indigo-50/30 to-purple-100/20 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Marketplace badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            DIRECT PROPERTY MARKETPLACE
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Discover a place <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              you&apos;ll love to call home.
            </span>
          </h1>

          {/* Subtitle explaining the portal purpose */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            Discover properties across prime locations, explore high-resolution photos, view detailed specifications, and connect directly with verified property owners.
          </p>
        </div>

        {/* Search & Filter Quick Bar */}
        <div className="mt-10 max-w-4xl mx-auto">
          <a
            href="#explore"
            className="block bg-white p-3 sm:p-4 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 hover:border-blue-400 transition-colors cursor-pointer"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Location input placeholder */}
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-left overflow-hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-sm font-medium text-slate-800 truncate">Madhapur, Gachibowli, Kondapur...</p>
                </div>
              </div>

              {/* Property Type placeholder */}
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="text-left overflow-hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Property Type</p>
                  <p className="text-sm font-medium text-slate-800 truncate">Apartments, Villas, Houses</p>
                </div>
              </div>

              {/* Price Range & Action button */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <CircleDollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-left overflow-hidden">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Budget Range</p>
                    <p className="text-sm font-medium text-slate-800 truncate">₹30,000 - ₹2.5 Cr</p>
                  </div>
                </div>

                <div className="h-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0">
                  <Search className="w-4 h-4" />
                  <span className="hidden md:inline text-sm">Explore</span>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Feature Highlights / Value Proposition */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 border-t border-slate-200/60">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Owner Photo Listings</p>
              <p className="text-xs text-slate-500">High-resolution verified photos directly from real owners</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-lg bg-indigo-100/60 text-indigo-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Direct & Transparent</p>
              <p className="text-xs text-slate-500">Filter easily by price, location, and verified status</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Instant Enquiries</p>
              <p className="text-xs text-slate-500">Send property enquiries in seconds without middleman delays</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
