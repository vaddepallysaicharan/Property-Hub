import { Video, Film, Sparkles } from 'lucide-react';

interface PropertyVideoPlayerProps {
  videoUrl?: string | null;
  propertyTitle: string;
}

export default function PropertyVideoPlayer({
  videoUrl,
  propertyTitle,
}: PropertyVideoPlayerProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Property Showcase</h3>
            <p className="text-xs text-slate-500">Cinematic walkthrough tour for {propertyTitle}</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Cinematic Tour
        </span>
      </div>

      {videoUrl ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="relative aspect-video w-full rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]" />
          <div className="relative z-10 space-y-3 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center mx-auto border border-white/20 shadow-md">
              <Film className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Showcase coming soon
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                A video showcase of this property is being prepared. Connect directly with the owner to schedule a private viewing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
