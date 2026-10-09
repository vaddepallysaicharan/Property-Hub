'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, ShieldCheck, Phone, X, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { Property } from '@/types/property';
import { addSentEnquiryId, getUserStoredDetails } from '@/lib/userEnquiries';

interface PropertyEnquiryCardProps {
  property: Property;
  formattedPrice: string;
}

export default function PropertyEnquiryCard({
  property,
  formattedPrice,
}: PropertyEnquiryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Form field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Hi, I am interested in "${property.title}". Please let me know when I can schedule a visit.`
  );

  useEffect(() => {
    const stored = getUserStoredDetails();
    if (stored.name) setName(stored.name);
    if (stored.email) setEmail(stored.email);
    if (stored.phone) setPhone(stored.phone);
  }, []);

  // Field validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    } = {};

    // 1. Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // 3. Indian Phone validation
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    // 4. Message validation
    if (!message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = () => {
    setIsSuccess(false);
    setGeneralError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleResetAndClose = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
    setName('');
    setEmail('');
    setPhone('');
    setMessage(
      `Hi, I am interested in "${property.title}". Please let me know when I can schedule a visit.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setGeneralError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Success: Save sent enquiry to user's client storage
      if (data.enquiry?.id) {
        addSentEnquiryId(data.enquiry.id, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        });
      }

      setIsSuccess(true);
    } catch {
      setGeneralError('Network error or server unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm sticky top-24 space-y-6">
        {/* Price display */}
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Listed Price
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
            {property.pricePeriod === 'month' && (
              <span className="text-sm font-medium text-slate-500">/ month</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {property.listingType === 'For Rent'
              ? 'Security deposit & lease terms negotiable'
              : 'Inclusive of base parking & society share'}
          </p>
        </div>

        {/* Owner Card */}
        <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
            {property.owner.name.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 truncate">
                {property.owner.name}
              </span>
              {property.owner.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500">Direct Property Owner</p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified Title & Zero Brokerage</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Direct contact with property owner</span>
          </div>
        </div>

        {/* CTA section */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-900">Interested in this property?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Send an enquiry to schedule a visit or ask questions.
            </p>
          </div>

          <button
            type="button"
            id="send-enquiry-button"
            onClick={handleOpenModal}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>Send Enquiry</span>
          </button>
        </div>
      </div>

      {/* Real Enquiry Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Close modal"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              /* Success State */
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900">
                    Enquiry Sent Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you! The property owner will be able to contact you regarding this property.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">{property.title}</div>
                  <div className="text-slate-500">{property.location.address}, {property.location.city}</div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <div>
                {/* Header with Property Info */}
                <div className="mb-5 pb-4 border-b border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Send Property Enquiry
                  </span>
                  <div className="mt-1">
                    <span className="text-xs text-slate-400 block font-medium">Interested in:</span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{property.location.address}, {property.location.city}</span>
                    </div>
                  </div>
                </div>

                {/* General Error Banner */}
                {generalError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{generalError}</span>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  {/* Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                          : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="rahul@example.com"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="9876543210"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                      }}
                      placeholder="Share details about your move-in timeline or schedule a visit..."
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.message
                          ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                          : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
