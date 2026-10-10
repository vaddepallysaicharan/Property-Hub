'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types/property';
import {
  Film,
  Play,
  RotateCcw,
  Download,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Layers,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  UploadCloud,
  Loader2,
  Eye,
} from 'lucide-react';

interface PropertyVideoGeneratorProps {
  property: Property;
}

export default function PropertyVideoGenerator({ property }: PropertyVideoGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);
  const [savedVideoUrl, setSavedVideoUrl] = useState<string | null>(property.video_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Clean valid photos list with imageUrl fallback
  const validPhotos = useMemo(() => {
    const list = Array.isArray(property.photos) ? property.photos.filter(Boolean) : [];
    if (list.length === 0 && property.imageUrl) {
      return [property.imageUrl];
    }
    return list;
  }, [property.photos, property.imageUrl]);

  const detectSupportedMimeType = (): string => {
    if (typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined') {
      const candidates = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];
      for (const mime of candidates) {
        if (MediaRecorder.isTypeSupported(mime)) {
          return mime;
        }
      }
    }
    return 'video/webm';
  };

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [generatedVideoUrl]);

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

  const formattedPrice = formatPrice(property.price, property.listingType);
  const formattedArea = new Intl.NumberFormat('en-IN').format(property.sqft);

  // Preload an image safely with anonymous CORS and fallback
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Cannot load image in non-browser environment'));
        return;
      }
      const img = new window.Image();
      const isExternal = url.startsWith('http://') || url.startsWith('https://');
      if (isExternal) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (isExternal && img.crossOrigin) {
          // Retry without crossOrigin if CORS was blocked
          const fallbackImg = new window.Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          fallbackImg.src = url;
        } else {
          reject(new Error(`Failed to load image: ${url}`));
        }
      };
      img.src = url;
    });
  };

  const generateVideo = useCallback(async () => {
    if (validPhotos.length === 0) {
      setError('No property photos available to generate video.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setError('Video recording is not supported in this browser. Please try Chrome, Edge, or Firefox.');
      return;
    }

    // Revoke previous URL if any
    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
      setGeneratedVideoUrl(null);
    }
    setGeneratedVideoBlob(null);
    setSaveSuccess(null);
    setSaveError(null);
    setError(null);
    setIsGenerating(true);
    setProgress(5);
    setStatusText('Preparing property photos...');

    try {
      // 1. Preload all valid images
      const loadedImages: HTMLImageElement[] = [];
      for (let i = 0; i < validPhotos.length; i++) {
        try {
          const img = await loadImage(validPhotos[i]);
          loadedImages.push(img);
        } catch (e) {
          console.warn(`Could not load image ${validPhotos[i]}:`, e);
        }
      }

      if (loadedImages.length === 0) {
        throw new Error('We could not load the photos for video generation. Please try using uploaded property photos.');
      }

      setProgress(20);
      setStatusText('Setting up showcase presentation...');

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Video rendering is not available in your browser.');
      }

      // Check captureStream support
      if (!canvas.captureStream) {
        throw new Error('Video capture is not supported in this browser.');
      }

      const stream = canvas.captureStream(30); // 30 FPS
      const chunks: Blob[] = [];
      const chosenMime = detectSupportedMimeType();

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime } : undefined);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      const recorderStopped = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: chosenMime || 'video/webm' });
          resolve(blob);
        };
      });

      recorder.start(100);

      // Animation parameters
      // 3.5s per photo slide + 3.0s for outro call-to-action
      const slideDurationMs = 3500;
      const outroDurationMs = 3000;
      const transitionDurationMs = 700;
      const totalDurationMs = loadedImages.length * slideDurationMs + outroDurationMs;
      const fps = 30;
      const frameInterval = 1000 / fps;

      let currentTimeMs = 0;

      const renderCoverImage = (img: HTMLImageElement, zoom = 1.0) => {
        const cw = canvas.width;
        const ch = canvas.height;
        const scale = Math.max(cw / img.width, ch / img.height) * zoom;
        const sw = cw / scale;
        const sh = ch / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      };

      const drawOverlayGradient = () => {
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.45, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
        gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.45)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.92)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      const drawTopBadge = () => {
        // Brand watermark / badge
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(40, 36, 175, 42, 12);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('PropertyHub', 56, 63);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('• EXCLUSIVE', 172, 63);
        ctx.restore();
      };

      const drawSlideText = (slideIdx: number) => {
        ctx.save();

        if (slideIdx === 0) {
          // Slide 1: Main Title + Location + Price Pill
          // Price pill
          ctx.fillStyle = property.listingType === 'For Rent' ? '#2563eb' : '#059669';
          ctx.beginPath();
          ctx.roundRect(40, canvas.height - 180, 220, 38, 10);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 17px sans-serif';
          ctx.fillText(
            `${property.listingType.toUpperCase()}  •  ${formattedPrice}${property.pricePeriod === 'month' ? '/mo' : ''}`,
            54,
            canvas.height - 155
          );

          // Property title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText(property.title, 40, canvas.height - 95);

          // Location
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '20px sans-serif';
          ctx.fillText(`📍 ${property.location.address}, ${property.location.city}`, 40, canvas.height - 55);
        } else {
          // Intermediate slide: Title & Key specs
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 30px sans-serif';
          ctx.fillText(property.title, 40, canvas.height - 110);

          // Specs badges bar
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.roundRect(40, canvas.height - 85, 620, 42, 10);
          ctx.fill();

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 17px sans-serif';
          const specsText = `${property.bedrooms} Bedrooms   •   ${property.bathrooms} Bathrooms   •   ${formattedArea} sq.ft   •   ${property.propertyType}`;
          ctx.fillText(specsText, 56, canvas.height - 58);
        }

        ctx.restore();
      };

      const drawOutroSlide = () => {
        // Outro cinematic card
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ambient radial light
        const radial = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          100,
          canvas.width / 2,
          canvas.height / 2,
          600
        );
        radial.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
        radial.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Central Card
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 380, canvas.height / 2 - 200, 760, 400, 24);
        ctx.fill();
        ctx.stroke();

        // Texts
        ctx.textAlign = 'center';

        // Tag
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('PROPERTY SHOWCASE', canvas.width / 2, canvas.height / 2 - 130);

        // Main CTA
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText('Interested in this property?', canvas.width / 2, canvas.height / 2 - 70);

        // Price & specs
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(
          `${formattedPrice}  •  ${property.propertyType}  •  ${property.location.address}`,
          canvas.width / 2,
          canvas.height / 2 - 10
        );

        // Contact button lookalike
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 190, canvas.height / 2 + 50, 380, 56, 16);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Contact Owner on PropertyHub', canvas.width / 2, canvas.height / 2 + 86);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText('Send enquiry and schedule an in-person viewing', canvas.width / 2, canvas.height / 2 + 150);

        ctx.restore();
      };

      // Frame-by-frame animation loop
      await new Promise<void>((resolveLoop) => {
        const intervalId = setInterval(() => {
          currentTimeMs += frameInterval;

          // Progress calculation
          const pct = Math.min(95, Math.floor(20 + (currentTimeMs / totalDurationMs) * 75));
          setProgress(pct);

          const isOutro = currentTimeMs >= loadedImages.length * slideDurationMs;

          if (isOutro) {
            setStatusText('Rendering cinematic outro card...');
            drawOutroSlide();
          } else {
            const currentSlideIndex = Math.floor(currentTimeMs / slideDurationMs);
            const timeInCurrentSlide = currentTimeMs % slideDurationMs;
            const slideProgress = timeInCurrentSlide / slideDurationMs;

            setStatusText(
              `Rendering photo ${currentSlideIndex + 1} of ${loadedImages.length} with Ken Burns zoom...`
            );

            // Ken Burns subtle zoom from 1.0 to 1.06
            const zoom = 1.0 + 0.06 * slideProgress;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentImg = loadedImages[currentSlideIndex];
            ctx.globalAlpha = 1.0;
            renderCoverImage(currentImg, zoom);

            // Cross-fade with next image if near transition
            const timeRemainingInSlide = slideDurationMs - timeInCurrentSlide;
            if (timeRemainingInSlide <= transitionDurationMs) {
              const transitionProgress = 1.0 - timeRemainingInSlide / transitionDurationMs;
              ctx.globalAlpha = transitionProgress;

              if (currentSlideIndex + 1 < loadedImages.length) {
                const nextImg = loadedImages[currentSlideIndex + 1];
                renderCoverImage(nextImg, 1.0);
              } else {
                drawOutroSlide();
              }
              ctx.globalAlpha = 1.0;
            }

            drawOverlayGradient();
            drawTopBadge();
            drawSlideText(currentSlideIndex);
          }

          if (currentTimeMs >= totalDurationMs) {
            clearInterval(intervalId);
            resolveLoop();
          }
        }, frameInterval);
      });

      setProgress(98);
      setStatusText('Finalizing showcase video...');

      // Stop recorder and wait for blob
      recorder.stop();
      const videoBlob = await recorderStopped;

      const videoUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoBlob(videoBlob);
      setGeneratedVideoUrl(videoUrl);
      setProgress(100);
      setIsGenerating(false);
      setStatusText('Your showcase video is ready!');
    } catch (err) {
      console.error('Video generation error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate video.';
      setError(msg);
      setIsGenerating(false);
      setProgress(0);
    }
  }, [validPhotos, property, generatedVideoUrl, formattedPrice, formattedArea]);

  const handleSaveToProperty = async () => {
    if (!generatedVideoBlob || isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const formData = new FormData();
      const mimeType = generatedVideoBlob.type || 'video/webm';
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const filename = `showcase-${property.id}.${ext}`;
      formData.append('video', generatedVideoBlob, filename);

      const res = await fetch(`/api/properties/${property.id}/video`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save showcase video to property.');
      }

      setSavedVideoUrl(data.video_url);
      setSaveSuccess('Showcase video saved to property successfully! It is now live on your listing.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving the video.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

      {/* Property Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  property.listingType === 'For Rent'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                }`}
              >
                {property.listingType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {property.propertyType}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {property.id}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {property.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              📍 {property.location.address}, {property.location.city}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-2xl font-extrabold text-slate-900">
              {formattedPrice}
              {property.pricePeriod === 'month' && (
                <span className="text-xs text-slate-500 font-normal"> / mo</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {property.bedrooms} Beds • {property.bathrooms} Baths • {formattedArea} sq.ft
            </p>
          </div>
        </div>

        {/* Photos Preview Strip */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Source Photos ({validPhotos.length})
              </h3>
            </div>
            <Link
              href={`/owner/properties/${property.id}/edit`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Photos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {validPhotos.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">No photos available</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload property photos before creating a showcase video.
                </p>
              </div>
              <Link
                href={`/owner/properties/${property.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <span>Add Photos</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {validPhotos.map((photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs group"
                >
                  <Image
                    src={photo}
                    alt={`${property.title} photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/70 text-white text-[10px] font-bold">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Video Generation Failed</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Save Error Banner */}
      {saveError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to Save Video to Property</p>
            <p className="text-xs text-red-600 mt-0.5">{saveError}</p>
          </div>
        </div>
      )}

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Video Saved to Property</p>
              <p className="text-xs text-emerald-700 mt-0.5">{saveSuccess}</p>
            </div>
          </div>
          <Link
            href={`/properties/${property.id}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0 mt-0.5"
          >
            View on Property Page &rarr;
          </Link>
        </div>
      )}

      {/* Generation & Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-4 h-4 text-blue-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Property Showcase Studio
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Turn your property photos into a cinematic showcase video. Bring your property to life with a beautiful visual presentation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>~{Math.max(1, validPhotos.length * 3.5 + 3).toFixed(0)}s run time</span>
            <span className="text-slate-300">•</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>HD Quality @ 30 FPS</span>
          </div>
        </div>

        {/* Progress Bar when Generating */}
        {isGenerating && (
          <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>{statusText}</span>
              </span>
              <span className="font-mono font-bold text-blue-600">{progress}%</span>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Generating smooth cinematic motion and property highlights...
            </p>
          </div>
        )}

        {/* Newly Generated Video Player Preview when Ready */}
        {generatedVideoUrl && !isGenerating && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Showcase video generation completed!</span>
            </div>

            <div className="relative aspect-[16/9] w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Actions: Save to Property, Download & Regenerate */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSaving || isGenerating}
                onClick={handleSaveToProperty}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Property...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Saved to Property</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Save to Property</span>
                  </>
                )}
              </button>

              <a
                href={generatedVideoUrl}
                download={`property-showcase-${property.id}.webm`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Video</span>
              </a>

              <button
                type="button"
                disabled={isSaving}
                onClick={generateVideo}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate Video</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing Saved Video Preview (when not currently generating a new one) */}
        {!generatedVideoUrl && !isGenerating && savedVideoUrl && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Saved Showcase Video is Active on this Property</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">
                Saved & Live on Public Listing
              </span>
            </div>

            <div className="relative aspect-[16/9] w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
              <video
                src={savedVideoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Actions for Saved Video */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={generateVideo}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Regenerate Video</span>
              </button>

              <a
                href={savedVideoUrl}
                download={`property-showcase-${property.id}.webm`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </a>

              <Link
                href={`/properties/${property.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View on Listing</span>
              </Link>
            </div>
          </div>
        )}

        {/* Initial Trigger Button (when no video generated and none currently saved) */}
        {!generatedVideoUrl && !isGenerating && !savedVideoUrl && (
          <div className="text-center py-6">
            <button
              type="button"
              disabled={validPhotos.length === 0}
              onClick={generateVideo}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Create Property Showcase</span>
            </button>
            {validPhotos.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">
                Requires at least 1 property photo.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href={`/properties/${property.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl transition-all shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Property Details</span>
        </Link>

        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl transition-all shadow-2xs hover:shadow-xs"
        >
          <span>Back to Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
