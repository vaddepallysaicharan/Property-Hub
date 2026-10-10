import Link from 'next/link';
import { PlusCircle, Building2, ShieldCheck, Sparkles } from 'lucide-react';

export default function OwnerCtaSection() {
  return (
    <section className="py-14 sm:py-18 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 md:p-14 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For Property Owners</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Have a Property to List?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Share your property details and photos, and connect with people searching for their next home.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                href="/owner/properties/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Your Property</span>
              </Link>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Direct owner contact
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Free photo uploads
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
