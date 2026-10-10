'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  Compass,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine appearance based on route and scroll state
  const isTransparent = isHomePage && !isScrolled;

  // Header position: on home page, absolute when at top and fixed when scrolled.
  // On other pages: sticky so content is never covered.
  const positionClass = isHomePage
    ? isScrolled
      ? 'fixed top-0 left-0 right-0 animate-in fade-in'
      : 'absolute top-0 left-0 right-0'
    : 'sticky top-0';

  return (
    <header
      className={`${positionClass} z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-gradient-to-b from-black/75 via-black/35 to-transparent border-transparent text-white'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 ${
              isTransparent
                ? 'bg-blue-600/90 shadow-blue-500/30 backdrop-blur-md border border-white/20'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors ${
                isTransparent ? 'text-white' : 'text-slate-900'
              }`}
            >
              Property<span className="text-blue-500">Hub</span>
            </span>
            <p
              className={`text-[10px] tracking-wide uppercase font-semibold transition-colors ${
                isTransparent ? 'text-white/70' : 'text-slate-500'
              }`}
            >
              Real Estate Portal
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className={`hidden md:flex items-center gap-7 text-sm font-medium transition-colors ${
            isTransparent ? 'text-white/85' : 'text-slate-600'
          }`}
        >
          <Link
            href="/"
            className={`flex items-center gap-1.5 transition-colors ${
              isTransparent ? 'hover:text-white' : 'hover:text-blue-600'
            } ${pathname === '/' ? (isTransparent ? 'text-white font-semibold' : 'text-blue-600 font-semibold') : ''}`}
          >
            <Home className="w-4 h-4 opacity-75" />
            <span>Home</span>
          </Link>
          <Link
            href={isHomePage ? '#explore' : '/explore'}
            className={`flex items-center gap-1.5 transition-colors ${
              isTransparent ? 'hover:text-white' : 'hover:text-blue-600'
            } ${pathname === '/explore' ? (isTransparent ? 'text-white font-semibold' : 'text-blue-600 font-semibold') : ''}`}
          >
            <Compass className="w-4 h-4 opacity-75" />
            <span>Explore Properties</span>
          </Link>
          <Link
            href="/owner/properties/new"
            className={`flex items-center gap-1.5 transition-colors ${
              isTransparent ? 'hover:text-white' : 'hover:text-blue-600'
            } ${pathname.startsWith('/owner/properties/new') ? (isTransparent ? 'text-white font-semibold' : 'text-blue-600 font-semibold') : ''}`}
          >
            <PlusCircle className="w-4 h-4 opacity-75" />
            <span>List Your Property</span>
          </Link>
          <Link
            href="/owner"
            className={`flex items-center gap-1.5 transition-colors ${
              isTransparent ? 'hover:text-white' : 'hover:text-blue-600'
            } ${pathname === '/owner' ? (isTransparent ? 'text-white font-semibold' : 'text-blue-600 font-semibold') : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 opacity-75" />
            <span>Owner Dashboard</span>
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={isHomePage ? '#explore' : '/explore'}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
              isTransparent
                ? 'text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20'
                : 'text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Explore</span>
          </Link>
          <Link
            href="/owner/properties/new"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Your Property</span>
          </Link>
        </div>

        {/* Mobile Menu Hamburger Button */}
        <button
          type="button"
          aria-label="Toggle mobile menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-xl transition-colors ${
            isTransparent
              ? 'text-white hover:bg-white/10'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-xl border-b border-slate-800 text-white px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-3">
          <nav className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4 text-blue-400" />
              <span>Home</span>
            </Link>
            <Link
              href={isHomePage ? '#explore' : '/explore'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Explore Properties</span>
            </Link>
            <Link
              href="/owner/properties/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>List Your Property</span>
            </Link>
            <Link
              href="/owner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Owner Dashboard</span>
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/owner/properties/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Property</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
