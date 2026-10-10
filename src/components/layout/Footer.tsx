import Link from 'next/link';
import { Home, Compass, PlusCircle, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Home className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Property<span className="text-blue-500">Hub</span>
              </span>
            </div>
            <p className="text-slate-300 font-medium text-sm">
              Discover properties. Connect with owners.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              A modern real estate marketplace for genuine properties in prime Hyderabad locations. Browse high-resolution photos, explore interactive maps, and submit instant enquiries directly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Explore Properties</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/explore" className="text-slate-300 hover:text-white transition-colors">
                  All Properties (Map & List)
                </Link>
              </li>
              <li>
                <Link href="/#explore" className="hover:text-white transition-colors">
                  Homes for Rent
                </Link>
              </li>
              <li>
                <Link href="/#explore" className="hover:text-white transition-colors">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Interactive Hyderabad Map
                </Link>
              </li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>For Owners</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/owner/properties/new" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                  <PlusCircle className="w-3 h-3 text-blue-400" />
                  <span>List Your Property</span>
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-white transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-3 h-3 text-slate-400" />
                  <span>Owner Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-white transition-colors">
                  Create Property Showcase
                </Link>
              </li>
              <li>
                <Link href="/owner#enquiries" className="hover:text-white transition-colors">
                  Enquiry Inbox
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PropertyHub. All rights reserved.</p>
          <p className="text-slate-400">
            Discover properties. Connect with owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
