import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function OwnerDashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
            <div className="h-8 w-60 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-xl" />
        </div>

        {/* 3 Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="h-9 w-12 bg-slate-200 rounded-md" />
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="h-9 w-12 bg-slate-200 rounded-md" />
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="h-9 w-12 bg-slate-200 rounded-md" />
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* Section title skeleton */}
        <div className="h-6 w-36 bg-slate-200 rounded-md mb-6" />

        {/* Property cards skeleton */}
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
          <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
          <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
