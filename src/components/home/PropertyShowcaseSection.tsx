import Image from 'next/image';
import Link from 'next/link';
import { Play, Sparkles, Video, Layers, Wand2 } from 'lucide-react';

export default function PropertyShowcaseSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-blue-50/30 to-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Cinematic Property Presentation Preview */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
              {/* Showcase Image Preview */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
                <Image
                  src="/images/showcase-preview.jpg"
                  alt="Cinematic property showcase preview"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Animated Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-md text-blue-600 flex items-center justify-center shadow-xl shadow-black/30 group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-blue-600 ml-1" />
                  </div>
                </div>

                {/* Floating Showcase Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 shadow-md">
                    <Video className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cinematic Showcase</span>
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-sm sm:text-base font-bold drop-shadow-md">
                    Contemporary Luxury Residence
                  </p>
                  <p className="text-xs text-slate-300 drop-shadow-sm">
                    Automated slideshow with cinematic pan and property specs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Value Proposition */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PropertyHub Showcase</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              More Than a Listing. <br />
              <span className="text-blue-600">A Showcase.</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Turn your property photos into a cinematic presentation that helps bring every listing to life.
            </p>

            {/* Supporting Points */}
            <ul className="space-y-3.5 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <span>Smooth visual transitions between high-resolution photos.</span>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Elegant property information overlays and custom typography.</span>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <span>An engaging presentation of property photos ready for sharing.</span>
              </li>
            </ul>

            <div className="pt-3">
              <Link
                href="/owner"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Video className="w-4 h-4" />
                <span>Create Your Showcase</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
