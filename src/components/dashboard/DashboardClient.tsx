'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property, Enquiry } from '@/types/property';
import { addPropertyAction, deletePropertyAction } from '@/app/actions/propertyActions';
import {
  Building2,
  PlusCircle,
  Home,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface DashboardClientProps {
  properties: Property[];
  enquiries: Enquiry[];
}

export default function DashboardClient({ properties, enquiries }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'enquiries' | 'add'>('listings');
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Statistics
  const totalListings = properties.length;
  const forRentCount = properties.filter((p) => p.listingType === 'For Rent').length;
  const forSaleCount = properties.filter((p) => p.listingType === 'For Sale').length;
  const totalEnquiries = enquiries.length;

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

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    startTransition(async () => {
      const res = await addPropertyAction(formData);
      if (res.success) {
        setFormSuccess(true);
        formElement.reset();
        setTimeout(() => {
          setActiveTab('listings');
          setFormSuccess(false);
        }, 1200);
      } else {
        setFormError(res.error || 'Failed to add property.');
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    startTransition(async () => {
      await deletePropertyAction(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                <Home className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">
                Property<span className="text-blue-600">Hub</span> Owner Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New Property</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Listed
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalListings}</div>
            <p className="text-[11px] text-slate-400 mt-1">Active property listings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                For Rent
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{forRentCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Rental homes / apartments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                For Sale
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{forSaleCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Properties available for sale</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Enquiries
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalEnquiries}</div>
            <p className="text-[11px] text-slate-400 mt-1">Seeker leads & messages</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'listings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Listed Properties ({totalListings})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'enquiries'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Seeker Enquiries ({totalEnquiries})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            + Post New Property
          </button>
        </div>

        {/* Tab Content: LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No properties listed yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Start by adding your first property listing.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                  Post Property Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative aspect-[16/9] w-full bg-slate-100">
                        <Image
                          src={prop.imageUrl}
                          alt={prop.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${
                              prop.listingType === 'For Rent' ? 'bg-blue-600' : 'bg-emerald-600'
                            }`}
                          >
                            {prop.listingType}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900/80 text-white">
                            {prop.propertyType}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="text-xl font-bold text-slate-900 mb-1">
                          {formatPrice(prop.price, prop.listingType)}
                          {prop.pricePeriod === 'month' && (
                            <span className="text-xs text-slate-500 font-normal"> / mo</span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-2">
                          {prop.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{prop.location.address}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 py-2 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prop.bedrooms} BHK</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prop.bathrooms} Bath</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prop.sqft} sqft</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/#explore`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View on site</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(prop.id, prop.title)}
                        disabled={deletingId === prop.id}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        {deletingId === prop.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {enquiries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No enquiries received yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  When seekers send enquiries from property listings, they will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{enq.name}</span>
                        <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                          for {enq.property_title || 'Listing'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(enq.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 mb-3">
                      &quot;{enq.message}&quot;
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${enq.email}`} className="text-blue-600 hover:underline">
                          {enq.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${enq.phone}`} className="text-slate-700 hover:underline">
                          {enq.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: ADD PROPERTY FORM */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Post a Property Listing</h3>
              <p className="text-xs text-slate-500 mt-1">
                Add an apartment, villa, or house listing with photos and pricing.
              </p>
            </div>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Property saved successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleAddProperty} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Spacious 3BHK Lakeview High-Rise"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Location & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location in Hyderabad *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. Madhapur, Hyderabad"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="1"
                    placeholder="e.g. 50000 (rent) or 15000000 (sale)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Listing Type & Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Listing Type *</label>
                  <select
                    name="listing_type"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="For Rent">For Rent</option>
                    <option value="For Sale">For Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Type *</label>
                  <select
                    name="property_type"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
              </div>

              {/* Specs: Bedrooms, Bathrooms, Area */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    defaultValue={3}
                    min={1}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    defaultValue={2}
                    min={1}
                    step={0.5}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    name="area"
                    defaultValue={1600}
                    min={100}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Photo URL (Unsplash or direct image URL)
                </label>
                <input
                  type="url"
                  name="photoUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe your property, amenities, nearby metro/landmarks..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Property</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
