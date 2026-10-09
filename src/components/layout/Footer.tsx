import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Home className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Property<span className="text-blue-500">Hub</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Discover properties. Connect with owners. A modern real estate platform connecting genuine property owners with home seekers directly with verified photos and zero broker delays.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#explore" className="hover:text-white transition-colors">
                  Featured Properties
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
                <Link href="/#explore" className="hover:text-white transition-colors">
                  Hyderabad Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              For Owners
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/owner/properties/new" className="hover:text-white transition-colors">
                  Add New Property
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-white transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-white transition-colors">
                  Property Showcases
                </Link>
              </li>
              <li>
                <Link href="/#explore" className="hover:text-white transition-colors">
                  Direct Enquiries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PropertyHub. All rights reserved.</p>
          <p className="text-slate-400">
            Discover properties. Connect with owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
