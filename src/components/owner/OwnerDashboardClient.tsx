'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property, EnrichedEnquiry } from '@/types/property';
import { getSentEnquiryIds, getUserEmail } from '@/lib/userEnquiries';
import {
  Building2,
  PlusCircle,
  Trash2,
  Edit3,
  ExternalLink,
  Video,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  Home,
  DollarSign,
  Key,
  Camera,
  Mail,
  Phone,
  Calendar,
  Send,
  Inbox,
  MessageSquare,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface OwnerDashboardClientProps {
  initialProperties: Property[];
  initialEnquiries?: EnrichedEnquiry[];
}

export default function OwnerDashboardClient({
  initialProperties,
  initialEnquiries = [],
}: OwnerDashboardClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [enquiries, setEnquiries] = useState<EnrichedEnquiry[]>(initialEnquiries);
  const [sentEnquiryIds, setSentEnquiryIds] = useState<string[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Portal view tabs: 'all' overview, 'properties', or 'enquiries'
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'properties' | 'enquiries'>('all');

  // Enquiries sub-tabs: EXACTLY 'sent' ("Enquiries") and 'inbox' ("Enquiry Inbox")
  const [enquirySubTab, setEnquirySubTab] = useState<'sent' | 'inbox'>('sent');

  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Read client-stored sent enquiry IDs and email
    const storedIds = getSentEnquiryIds();
    const storedEmail = getUserEmail();
    setSentEnquiryIds(storedIds);
    setCurrentUserEmail(storedEmail);

    // If URL hash contains #enquiries, activate the Enquiries tab
    if (typeof window !== 'undefined' && window.location.hash === '#enquiries') {
      setActiveMainTab('enquiries');
    }

    // Refresh enquiries if initialEnquiries was empty
    if (!initialEnquiries || initialEnquiries.length === 0) {
      fetch('/api/enquiries')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.enquiries)) {
            setEnquiries(data.enquiries);
          }
        })
        .catch((err) => console.warn('Could not fetch latest enquiries:', err));
    }
  }, [initialEnquiries]);

  // Tab 1 "Enquiries": Enquiries sent by the current user
  const sentEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (sentEnquiryIds.includes(e.id)) return true;
      if (currentUserEmail && e.email.toLowerCase() === currentUserEmail.toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [enquiries, sentEnquiryIds, currentUserEmail]);

  // Tab 2 "Enquiry Inbox": Enquiries sent by other users about the user's properties
  const inboxEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (sentEnquiryIds.includes(e.id)) return false;
      if (currentUserEmail && e.email.toLowerCase() === currentUserEmail.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [enquiries, sentEnquiryIds, currentUserEmail]);

  // Format date cleanly (e.g. "7 Oct 2026")
  const formatEnquiryDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Dynamic statistics calculated from actual Turso data
  const totalProperties = properties.length;
  const forSaleCount = properties.filter((p) => p.listingType === 'For Sale').length;
  const forRentCount = properties.filter((p) => p.listingType === 'For Rent').length;

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'For Sale') {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
      }
      if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
      }
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/properties/${propertyToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to delete property. Please try again.');
        setIsDeleting(false);
        return;
      }

      // Success: Remove property from state immediately without full page reload
      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
      setSuccessMessage(`"${propertyToDelete.title}" has been deleted successfully.`);
      setPropertyToDelete(null);

      // Clear success banner after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch {
      setErrorMessage('Network error occurred while deleting property.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              PropertyHub
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Host & Owner Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Owner Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your property listings, update information, and track availability.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/owner/properties/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 text-xs font-semibold">
        <Link
          href="/owner"
          className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 transition-colors"
        >
          Dashboard
        </Link>
        <a
          href="#my-properties"
          className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          My Properties ({totalProperties})
        </a>
        <a
          href="#enquiries"
          className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Enquiries ({enquiries.length})
        </a>
      </div>

      {/* Notifications / Banners */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Properties */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Properties
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {totalProperties}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Active property listings
          </p>
        </div>

        {/* For Sale */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              For Sale
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {forSaleCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Home className="w-3 h-3 text-emerald-500" />
            Properties for sale
          </p>
        </div>

        {/* For Rent */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              For Rent
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {forRentCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Key className="w-3 h-3 text-indigo-500" />
            Rental homes & apartments
          </p>
        </div>

        {/* Enquiries Total */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {enquiries.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Inbox className="w-3 h-3 text-violet-500" />
            {inboxEnquiries.length} received &bull; {sentEnquiries.length} sent
          </p>
        </div>
      </div>

      {/* My Properties List */}
      <section id="my-properties" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              My Properties
            </h2>
            <p className="text-xs text-slate-500">
              Review, edit, view, or manage your active real estate listings.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {properties.length} listings
          </span>
        </div>

        {/* Empty State */}
        {properties.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900">No Properties Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start by adding your first property listing.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/owner/properties/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Property</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Property Main Info with Image */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 overflow-hidden">
                  {/* Property Image */}
                  <div className="relative aspect-[16/10] sm:aspect-square w-full sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={prop.imageUrl}
                      alt={prop.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 112px"
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 flex sm:hidden gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                          prop.listingType === 'For Rent' ? 'bg-blue-600' : 'bg-emerald-600'
                        }`}
                      >
                        {prop.listingType}
                      </span>
                    </div>
                    {prop.photos && prop.photos.length > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 shadow-2xs">
                        <Camera className="w-2.5 h-2.5" />
                        <span>{prop.photos.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Details Column */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          prop.listingType === 'For Rent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {prop.listingType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {prop.propertyType}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-slate-900 ml-auto sm:ml-0">
                        {formatPrice(prop.price, prop.listingType)}
                        {prop.pricePeriod === 'month' && (
                          <span className="text-xs text-slate-500 font-normal"> / mo</span>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {prop.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {prop.location.address}, {prop.location.city}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        {prop.bedrooms} BHK
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-400" />
                        {prop.bathrooms} Bath
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        {prop.sqft} sq.ft
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  {/* View Button */}
                  <Link
                    href={`/properties/${prop.id}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200/80 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  {/* Edit Button */}
                  <Link
                    href={`/owner/properties/${prop.id}/edit`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-xl border border-slate-200/80 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  {/* Create Video Button */}
                  <Link
                    href={`/owner/properties/${prop.id}/video`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-semibold rounded-xl border border-indigo-200/80 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="whitespace-nowrap">Create Showcase</span>
                  </Link>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setPropertyToDelete(prop)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200/60 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Enquiries Section */}
      <section id="enquiries" className="space-y-6 pt-6 border-t border-slate-200/80">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Enquiries
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your outgoing property inquiries and communications from interested seekers.
          </p>
        </div>

        {/* Tab Controls: Side-by-side on desktop, responsive on mobile */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-full sm:w-fit border border-slate-200/60">
          <button
            type="button"
            onClick={() => setEnquirySubTab('sent')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              enquirySubTab === 'sent'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Enquiries</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                enquirySubTab === 'sent'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {sentEnquiries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setEnquirySubTab('inbox')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              enquirySubTab === 'inbox'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Enquiry Inbox</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                enquirySubTab === 'inbox'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {inboxEnquiries.length}
            </span>
          </button>
        </div>

        {/* TAB 1: "Enquiries" */}
        {enquirySubTab === 'sent' && (
          <div>
            {sentEnquiries.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Send className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-slate-900">No Enquiries Yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Properties you&apos;re interested in will appear here after you contact an owner.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/#explore"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Properties</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sentEnquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
                      {/* Property Image Thumbnail */}
                      <div className="relative aspect-[16/10] sm:aspect-square w-full sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {enquiry.property_photo ? (
                          <Image
                            src={enquiry.property_photo}
                            alt={enquiry.property_title || 'Property'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 112px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Building2 className="w-8 h-8" />
                          </div>
                        )}
                        {enquiry.property_listing_type && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-900 shadow-xs">
                            {enquiry.property_listing_type}
                          </span>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {enquiry.property_title || 'Property'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                            {enquiry.property_location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{enquiry.property_location}</span>
                              </span>
                            )}
                            {enquiry.property_price && (
                              <span className="font-semibold text-blue-600">
                                {formatPrice(
                                  enquiry.property_price,
                                  enquiry.property_listing_type || 'For Sale'
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sent Message Bubble */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                            Your message:
                          </span>
                          <p className="italic leading-relaxed">
                            &ldquo;{enquiry.message}&rdquo;
                          </p>
                        </div>

                        {/* Date sent & Direct Property Owner indicator */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Enquiry sent: {formatEnquiryDate(enquiry.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Direct Property Owner
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex sm:flex-col items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Link
                        href={`/properties/${enquiry.property_id}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200/80 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Property</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: "Enquiry Inbox" */}
        {enquirySubTab === 'inbox' && (
          <div>
            {inboxEnquiries.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Inbox className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-slate-900">
                    Your Enquiry Inbox is Empty
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    When someone contacts you about one of your properties, their enquiry will appear here.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/owner/properties/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Property</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {inboxEnquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-5"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                      {/* Sender Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                        {enquiry.name ? enquiry.name.charAt(0).toUpperCase() : 'U'}
                      </div>

                      {/* Enquiry Body */}
                      <div className="space-y-3 flex-1 min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {enquiry.name}
                            </h3>
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Received: {formatEnquiryDate(enquiry.created_at)}
                            </span>
                          </div>

                          {/* Property Reference with Mini Thumbnail */}
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                            <span className="text-slate-400 font-medium">Interested in:</span>
                            {enquiry.property_photo && (
                              <div className="relative w-5 h-5 rounded-md overflow-hidden bg-slate-100 shrink-0">
                                <Image
                                  src={enquiry.property_photo}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="font-semibold text-slate-800 truncate">
                              {enquiry.property_title || 'Your Property'}
                            </span>
                          </div>
                        </div>

                        {/* Sender Contact details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                          <a
                            href={`mailto:${enquiry.email}`}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span>{enquiry.email}</span>
                          </a>
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-800 font-medium hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{enquiry.phone}</span>
                          </a>
                        </div>

                        {/* Sender Message */}
                        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700">
                          <p className="leading-relaxed whitespace-pre-wrap">
                            &ldquo;{enquiry.message}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex sm:flex-col items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Link
                        href={`/properties/${enquiry.property_id}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200/80 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Property</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            if (!isDeleting) setPropertyToDelete(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete this property?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This action cannot be undone. Are you sure you want to delete{' '}
                  <span className="font-semibold text-slate-800">
                    &quot;{propertyToDelete.title}&quot;
                  </span>{' '}
                  from your listings?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1 mb-5">
              <div>
                <span className="text-slate-400">Location:</span> {propertyToDelete.location.address},{' '}
                {propertyToDelete.location.city}
              </div>
              <div>
                <span className="text-slate-400">Price:</span>{' '}
                {formatPrice(propertyToDelete.price, propertyToDelete.listingType)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Property</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
