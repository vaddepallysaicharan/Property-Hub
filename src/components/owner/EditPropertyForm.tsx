'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/property';
import {
  ArrowLeft,
  Building2,
  Sparkles,
  IndianRupee,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Home,
  Save,
  ImageIcon,
  UploadCloud,
  X,
  Plus,
  RotateCcw,
} from 'lucide-react';

interface FormValues {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  propertyType?: string;
  listingType?: string;
  price?: string;
  location?: string;
  bedrooms?: string;
  bathrooms?: string;
  area?: string;
}

interface SelectedNewPhotoItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface EditPropertyFormProps {
  property: Property;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial location calculation
  const initialLocation =
    property.location.raw ||
    (property.location.city && property.location.city !== property.location.address
      ? `${property.location.address}, ${property.location.city}`
      : property.location.address);

  const [values, setValues] = useState<FormValues>({
    title: property.title || '',
    description: property.description || '',
    propertyType: property.propertyType || 'Apartment',
    listingType: property.listingType || 'For Sale',
    price: property.price !== undefined ? String(property.price) : '',
    location: initialLocation || '',
    bedrooms: property.bedrooms !== undefined ? String(property.bedrooms) : '0',
    bathrooms: property.bathrooms !== undefined ? String(property.bathrooms) : '1',
    area: property.sqft !== undefined ? String(property.sqft) : '',
  });

  // Existing photos management
  const initialPhotos = Array.isArray(property.photos) ? property.photos : [];
  const [existingPhotos] = useState<string[]>(initialPhotos);
  const [photosToRemove, setPhotosToRemove] = useState<Set<string>>(new Set());

  // New photos management
  const [newSelectedPhotos, setNewSelectedPhotos] = useState<SelectedNewPhotoItem[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<'idle' | 'saving' | 'deleting' | 'uploading' | 'done'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newSelectedPhotos.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newSelectedPhotos]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Title
    if (!values.title.trim()) {
      newErrors.title = 'Property title is required.';
    } else if (values.title.trim().length < 5) {
      newErrors.title = 'Property title must be at least 5 characters.';
    }

    // 2. Description
    if (!values.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (values.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters.';
    }

    // 3. Property Type
    const validTypes = ['Apartment', 'House', 'Villa'];
    if (!values.propertyType || !validTypes.includes(values.propertyType)) {
      newErrors.propertyType = 'Please select a valid property type.';
    }

    // 4. Listing Type
    const validListingTypes = ['For Sale', 'For Rent'];
    if (!values.listingType || !validListingTypes.includes(values.listingType)) {
      newErrors.listingType = 'Please select a valid listing type.';
    }

    // 5. Price (>= 0)
    const numPrice = Number(values.price);
    if (values.price === '' || isNaN(numPrice)) {
      newErrors.price = 'Please enter a valid price.';
    } else if (numPrice < 0) {
      newErrors.price = 'Price cannot be negative.';
    }

    // 6. Location
    if (!values.location.trim()) {
      newErrors.location = 'Location is required.';
    }

    // 7. Bedrooms (>= 0)
    const numBedrooms = Number(values.bedrooms);
    if (values.bedrooms === '' || isNaN(numBedrooms) || numBedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative.';
    }

    // 8. Bathrooms (> 0)
    const numBathrooms = Number(values.bathrooms);
    if (values.bathrooms === '' || isNaN(numBathrooms) || numBathrooms <= 0) {
      newErrors.bathrooms = 'Please enter the number of bathrooms.';
    }

    // 9. Area (> 0)
    const numArea = Number(values.area);
    if (values.area === '' || isNaN(numArea) || numArea <= 0) {
      newErrors.area = 'Please enter the property area.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on edit
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleTogglePhotoRemoval = (photoUrl: string) => {
    setPhotosToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(photoUrl)) {
        next.delete(photoUrl);
      } else {
        next.add(photoUrl);
      }
      return next;
    });
  };

  const handleNewFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError(null);

    const newItems: SelectedNewPhotoItem[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        invalidFiles.push(`${file.name} (only JPEG, PNG, and WebP allowed)`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (exceeds 10 MB limit)`);
        return;
      }

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (invalidFiles.length > 0) {
      setPhotoError(`Some files were rejected: ${invalidFiles.join(', ')}`);
    }

    if (newItems.length > 0) {
      setNewSelectedPhotos((prev) => [...prev, ...newItems]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNewPhoto = (id: string) => {
    setNewSelectedPhotos((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStep('saving');
    setSubmitError(null);

    try {
      // 1. Update text fields in Turso
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        propertyType: values.propertyType,
        listingType: values.listingType,
        price: Number(values.price),
        location: values.location.trim(),
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),
        area: Number(values.area),
      };

      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const errorMsg =
          data?.error ||
          'Unable to update property. Please try again.';
        setSubmitError(errorMsg);
        setIsSubmitting(false);
        setSubmitStep('idle');
        return;
      }

      // 2. Delete marked photos if any
      if (photosToRemove.size > 0) {
        setSubmitStep('deleting');
        for (const photoUrl of Array.from(photosToRemove)) {
          await fetch(`/api/properties/${property.id}/photos`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoUrl }),
          });
        }
      }

      // 3. Upload newly added photos if any
      if (newSelectedPhotos.length > 0) {
        setSubmitStep('uploading');
        const formData = new FormData();
        newSelectedPhotos.forEach((item) => {
          formData.append('photos', item.file);
        });

        const uploadRes = await fetch(`/api/properties/${property.id}/photos`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok || !uploadData?.success) {
          console.warn('Property updated, but new photo upload had an issue:', uploadData?.error);
        }
      }

      // 4. Success state and redirect
      setSubmitStep('done');
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/owner');
      }, 1000);
    } catch (err) {
      console.error('Update failed:', err);
      setSubmitError('Unable to update property. Please try again.');
      setIsSubmitting(false);
      setSubmitStep('idle');
    }
  };

  return (
    <div>
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-medium text-slate-600 hidden sm:inline">
          Property ID: <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{property.id}</code>
        </span>
      </div>

      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-3 shadow-2xs">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Owner Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Property
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Update the details and photos of your property listing.
        </p>
      </div>

      {/* Global Alert Messages */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Update Failed</p>
            <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Property Updated Successfully!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Redirecting to Owner Dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1: Property Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Section 1: Property Information
              </h2>
              <p className="text-xs text-slate-500">
                Update general information and categorisation for this listing.
              </p>
            </div>
          </div>

          {/* Property Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Property Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={values.title}
              onChange={handleChange}
              placeholder="e.g. Luxury 3BHK Lakeview Apartment"
              disabled={isSubmitting || isSuccess}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-300 focus:ring-red-400/40 bg-red-50/20'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={values.description}
              onChange={handleChange}
              placeholder="Describe key features, premium amenities, scenic views, nearby transportation..."
              disabled={isSubmitting || isSuccess}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all resize-y ${
                errors.description
                  ? 'border-red-300 focus:ring-red-400/40 bg-red-50/20'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            <div className="flex justify-between items-center mt-1.5">
              {errors.description ? (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.description}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-600">Minimum 20 characters required.</p>
              )}
              <span className="text-xs text-slate-600">
                {values.description.trim().length} chars
              </span>
            </div>
          </div>

          {/* Property Type & Listing Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Property Type */}
            <div>
              <label
                htmlFor="propertyType"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Property Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="propertyType"
                  name="propertyType"
                  value={values.propertyType}
                  onChange={handleChange}
                  disabled={isSubmitting || isSuccess}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all appearance-none cursor-pointer ${
                    errors.propertyType
                      ? 'border-red-300 focus:ring-red-400/40'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.propertyType && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.propertyType}</span>
                </p>
              )}
            </div>

            {/* Listing Type */}
            <div>
              <label
                htmlFor="listingType"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Listing Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="listingType"
                  name="listingType"
                  value={values.listingType}
                  onChange={handleChange}
                  disabled={isSubmitting || isSuccess}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all appearance-none cursor-pointer ${
                    errors.listingType
                      ? 'border-red-300 focus:ring-red-400/40'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                >
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                </select>
                <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.listingType && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.listingType}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Property Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Section 2: Property Details
              </h2>
              <p className="text-xs text-slate-500">
                Update price, location, room specifications, and dimensions.
              </p>
            </div>
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={values.price}
                  onChange={handleChange}
                  placeholder="0"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.price
                      ? 'border-red-300 focus:ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.price ? (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.price}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-600 mt-1.5">
                  {values.listingType === 'For Rent' ? 'Monthly rent in ₹' : 'Total selling price in ₹'}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={values.location}
                  onChange={handleChange}
                  placeholder="e.g. Madhapur, Hyderabad"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.location
                      ? 'border-red-300 focus:ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Bedrooms */}
            <div>
              <label
                htmlFor="bedrooms"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
                  <BedDouble className="w-4 h-4" />
                </div>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={values.bedrooms}
                  onChange={handleChange}
                  placeholder="0"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.bedrooms
                      ? 'border-red-300 focus:ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.bedrooms && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.bedrooms}</span>
                </p>
              )}
            </div>

            {/* Bathrooms */}
            <div>
              <label
                htmlFor="bathrooms"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
                  <Bath className="w-4 h-4" />
                </div>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="1"
                  value={values.bathrooms}
                  onChange={handleChange}
                  placeholder="1"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.bathrooms
                      ? 'border-red-300 focus:ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.bathrooms && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.bathrooms}</span>
                </p>
              )}
            </div>

            {/* Area */}
            <div>
              <label
                htmlFor="area"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Area (sq.ft) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <input
                  id="area"
                  name="area"
                  type="number"
                  min="1"
                  value={values.area}
                  onChange={handleChange}
                  placeholder="1000"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.area
                      ? 'border-red-300 focus:ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.area && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.area}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Property Photos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 shadow-2xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Section 3: Property Photos
              </h2>
              <p className="text-xs text-slate-500">
                Manage existing listing photos and upload additional high-resolution images.
              </p>
            </div>
          </div>

          {/* Existing Photos Grid */}
          {existingPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Existing Photos ({existingPhotos.length - photosToRemove.size} active)
                </span>
                {photosToRemove.size > 0 && (
                  <span className="text-xs font-medium text-rose-600">
                    {photosToRemove.size} photo(s) marked for removal upon save
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existingPhotos.map((photoUrl, index) => {
                  const isMarked = photosToRemove.has(photoUrl);
                  return (
                    <div
                      key={`${photoUrl}-${index}`}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border transition-all ${
                        isMarked
                          ? 'border-rose-400 opacity-40 ring-2 ring-rose-300'
                          : 'border-slate-200 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <Image
                        src={photoUrl}
                        alt={`Existing photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />

                      {/* Removal indicator badge or button */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePhotoRemoval(photoUrl)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md transition-colors ${
                            isMarked
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {isMarked ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Undo</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </>
                          )}
                        </button>
                      </div>

                      {isMarked && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          To be removed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hidden native file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleNewFilesSelected(e.target.files)}
            disabled={isSubmitting || isSuccess}
          />

          {/* Add More Photos Upload Box */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Add More Photos
            </span>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/20 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-white text-blue-600 flex items-center justify-center mx-auto shadow-2xs border border-slate-200/80 group-hover:scale-105 transition-transform mb-2.5">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to add more photos
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                JPEG, PNG, or WebP (up to 10 MB each).
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/80 shadow-2xs transition-colors pointer-events-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Select Photos</span>
                </button>
              </div>
            </div>

            {photoError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{photoError}</span>
              </p>
            )}

            {/* New Selected Photos Preview */}
            {newSelectedPhotos.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    New Photos to Upload ({newSelectedPhotos.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      newSelectedPhotos.forEach((item) => URL.revokeObjectURL(item.previewUrl));
                      setNewSelectedPhotos([]);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Clear New
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {newSelectedPhotos.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative group aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs"
                    >
                      <Image
                        src={item.previewUrl}
                        alt={`New photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNewPhoto(item.id);
                          }}
                          className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/70 text-[10px] font-medium text-white truncate max-w-[85%]">
                        {item.file.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3.5">
          <Link
            href="/owner"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-95"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {submitStep === 'saving'
                    ? 'Saving Details...'
                    : submitStep === 'deleting'
                      ? 'Updating Photos...'
                      : submitStep === 'uploading'
                        ? `Uploading ${newSelectedPhotos.length} New Photo${newSelectedPhotos.length > 1 ? 's' : ''}...`
                        : 'Saving Changes...'}
                </span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
