import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PropertyLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-36 bg-slate-200 rounded-md mb-6" />

        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>
            <div className="h-8 sm:h-10 w-80 sm:w-96 bg-slate-200 rounded-xl" />
            <div className="h-4 w-60 bg-slate-200 rounded-md" />
          </div>
          <div className="h-10 w-44 bg-slate-200 rounded-xl" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery skeleton */}
            <div className="aspect-[16/10] w-full bg-slate-200 rounded-2xl" />
            <div className="flex gap-3">
              <div className="aspect-[16/10] w-24 bg-slate-200 rounded-xl" />
              <div className="aspect-[16/10] w-24 bg-slate-200 rounded-xl" />
              <div className="aspect-[16/10] w-24 bg-slate-200 rounded-xl" />
            </div>

            {/* Specs skeleton */}
            <div className="h-24 bg-slate-200 rounded-2xl" />
            {/* Description skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-200 rounded-md" />
              <div className="h-4 w-5/6 bg-slate-200 rounded-md" />
              <div className="h-4 w-4/6 bg-slate-200 rounded-md" />
            </div>
          </div>

          {/* Sidebar card skeleton */}
          <div>
            <div className="h-96 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
