import Link from 'next/link';
import { Home, PlusCircle, Compass, Sparkles, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Property<span className="text-blue-600">Hub</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-none">Find & List Properties</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/#explore" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <Compass className="w-4 h-4 text-slate-400" />
            Explore
          </Link>
          <Link href="/#explore" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <Sparkles className="w-4 h-4 text-slate-400" />
            Featured
          </Link>
          <Link href="/owner" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            Dashboard
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/owner"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/owner/properties/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
