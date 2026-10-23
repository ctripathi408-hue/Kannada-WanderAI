import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Wallet, 
  Printer, 
  Share2, 
  Bus, 
  Hotel, 
  Utensils, 
  Compass, 
  PhoneCall, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles, 
  MessageSquare, 
  ArrowRight, 
  Info,
  BookmarkPlus,
  BookmarkCheck,
  Navigation,
  Train,
  LayoutGrid,
  GitCommit,
  Map as MapIcon,
  Copy,
  Check,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedSection } from './AnimatedSection';
import { AnimatedCounter } from './AnimatedCounter';
import { RouteTimeline } from './RouteTimeline';
import { DayActivitiesTimeline } from './DayActivitiesTimeline';
import { InteractiveKarnatakaMap } from './InteractiveKarnatakaMap';
import { KARNATAKA_CITIES } from '../data/karnataka-data';
import { ItineraryPlan } from '../types/travel';
import { 
  saveSharedTrip, 
  copyToClipboardWithFallback, 
  getDeployedAppUrl 
} from '../lib/firebase';

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.3 19.8 8.1 19.11L7.81 18.94L4.69 19.76L5.52 16.71L5.33 16.4C4.55 15.14 4.14 13.56 4.14 11.92C4.14 7.38 7.84 3.67 12.05 3.67M9.27 7.42C9.09 7.42 8.8 7.49 8.56 7.75C8.32 8.01 7.64 8.65 7.64 9.95C7.64 11.25 8.59 12.51 8.72 12.68C8.85 12.86 10.57 15.52 13.23 16.66C13.86 16.94 14.35 17.1 14.74 17.22C15.38 17.43 15.96 17.4 16.42 17.33C16.93 17.25 17.98 16.69 18.2 16.07C18.42 15.45 18.42 14.92 18.35 14.81C18.28 14.7 18.1 14.64 17.83 14.51C17.56 14.38 16.24 13.73 15.99 13.64C15.75 13.55 15.57 13.5 15.39 13.77C15.21 14.04 14.69 14.65 14.53 14.83C14.37 15.01 14.21 15.03 13.94 14.9C13.67 14.77 12.8 14.49 11.77 13.57C10.97 12.85 10.42 11.97 10.26 11.7C10.1 11.43 10.24 11.28 10.38 11.15C10.5 11.03 10.65 10.84 10.79 10.68C10.93 10.52 10.97 10.4 11.06 10.22C11.15 10.04 11.11 9.89 11.04 9.75C10.97 9.61 10.42 8.27 10.2 7.72C9.97 7.2 9.75 7.27 9.58 7.27C9.42 7.26 9.27 7.42 9.27 7.42Z" />
  </svg>
);

interface ItineraryDisplayProps {
  plan: ItineraryPlan;
  onModifyPlan: () => void;
  onOpenAiGuide: (contextCity?: string) => void;
  onSavePlan?: (plan: ItineraryPlan) => void;
  isSaved?: boolean;
  isReadOnly?: boolean;
  onPlanYourOwnTrip?: () => void;
  generationProgress?: string | null;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  plan,
  onModifyPlan,
  onOpenAiGuide,
  onSavePlan,
  isSaved,
  isReadOnly = false,
  onPlanYourOwnTrip,
  generationProgress
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [expandedDays, setExpandedDays] = useState<number[]>([1, 2]); // First 2 days open by default
  const [showAllDays, setShowAllDays] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scheduleViewMode, setScheduleViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  // Sharing states
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const toggleDay = (dayNum: number) => {
    if (expandedDays.includes(dayNum)) {
      setExpandedDays(expandedDays.filter(d => d !== dayNum));
    } else {
      setExpandedDays([...expandedDays, dayNum]);
    }
  };

  const toggleExpandAll = () => {
    if (showAllDays) {
      setExpandedDays([1]);
      setShowAllDays(false);
    } else {
      setExpandedDays(plan.days.map(d => d.dayNumber));
      setShowAllDays(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3000);
  };

  // Ensure trip is saved to database and obtain the deployed share link
  const ensureSavedTripUrl = async (): Promise<string> => {
    if (shareUrl) return shareUrl;
    
    // Save to Firestore and server fallback
    const { shareUrl: generatedUrl } = await saveSharedTrip(plan);
    setShareUrl(generatedUrl);
    return generatedUrl;
  };

  const handleShare = async () => {
    setShareError(null);
    setIsSharing(true);

    try {
      const link = await ensureSavedTripUrl();

      // 1. Try Web Share API first
      let sharedViaWebShare = false;
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: `${plan.title} - Karnataka WanderAI`,
            text: `Check out this Karnataka travel itinerary: ${plan.title}`,
            url: link,
          });
          sharedViaWebShare = true;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            // User cancelled the native share sheet
            sharedViaWebShare = true;
          }
        }
      }

      // 2. If Web Share unavailable, fallback to copying link with temporary text input
      if (!sharedViaWebShare) {
        const copied = await copyToClipboardWithFallback(link);
        if (copied) {
          setCopiedLink(true);
          triggerToast('Link copied to clipboard!');
          setTimeout(() => setCopiedLink(false), 2500);
        }
        setShowShareModal(true);
      }
    } catch (err: any) {
      console.error('Error saving or sharing trip:', err);
      setShareError('Failed to save itinerary for sharing. Please check your connection and try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    setShareError(null);
    try {
      const link = await ensureSavedTripUrl();
      const copied = await copyToClipboardWithFallback(link);
      if (copied) {
        setCopiedLink(true);
        triggerToast('Link copied!');
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        setShareError('Could not copy link to clipboard automatically.');
      }
    } catch (err) {
      console.error('Error copying link:', err);
      setShareError('Failed to save itinerary. Please try again.');
    }
  };

  const handleWhatsAppShare = async () => {
    setShareError(null);
    try {
      const link = await ensureSavedTripUrl();
      const shareText = encodeURIComponent(
        `Check out this Karnataka travel itinerary: ${plan.title}\n\n${link}`
      );
      window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
    } catch (err) {
      console.error('Error sharing to WhatsApp:', err);
      setShareError('Failed to save itinerary for WhatsApp sharing. Please try again.');
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      
      {/* Read-Only Mode Banner */}
      {isReadOnly && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border-2 border-emerald-600/30 dark:border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Shared Itinerary
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Read-Only View</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                You are viewing a shared Karnataka itinerary. Ready to create your own journey?
              </p>
            </div>
          </div>
          {onPlanYourOwnTrip && (
            <button
              onClick={onPlanYourOwnTrip}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Plan your own trip</span>
            </button>
          )}
        </div>
      )}

      {/* Live Stream Progress Banner */}
      {(generationProgress || plan.generationProgress || plan.isGenerating) && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/15 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Streaming Days In Parallel
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
                {generationProgress || plan.generationProgress || 'Finding places... Planning day 1... Adding transit.'}
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
            ⚡ Flash Powered
          </div>
        </div>
      )}

      {/* Share Toast Feedback */}
      {shareToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Share Error Alert */}
      {shareError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{shareError}</span>
          </div>
          <button 
            onClick={() => setShareError(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Action Ribbon (No-print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          {isReadOnly ? (
            onPlanYourOwnTrip && (
              <button
                onClick={onPlanYourOwnTrip}
                className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Plan your own trip</span>
              </button>
            )
          ) : (
            <button
              onClick={onModifyPlan}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ← Edit Preferences
            </button>
          )}
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {plan.isAiGenerated ? '✨ Custom AI Itinerary' : '🏛️ Curated Karnataka Circuit'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {!isReadOnly && onSavePlan && (
            <button
              onClick={() => onSavePlan(plan)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-300" /> : <BookmarkPlus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
              <span>{isSaved ? 'Saved in Account' : 'Save to My Trips'}</span>
            </button>
          )}

          <button
            onClick={toggleExpandAll}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {showAllDays ? 'Collapse Days' : 'Expand All Days'}
          </button>

          {/* Primary Share Button */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Share this itinerary with a unique link"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            )}
            <span>{isSharing ? 'Saving...' : 'Share'}</span>
          </button>

          {/* WhatsApp Direct Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Share on WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp</span>
          </button>

          {/* Copy Link Direct Button */}
          <button
            onClick={handleCopyLink}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy unique itinerary link"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            )}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Share Your Itinerary
                </h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Anyone with this live deployed link can view your complete Karnataka itinerary:
            </p>

            {/* Link Box */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <input 
                type="text" 
                readOnly 
                value={shareUrl || getDeployedAppUrl()} 
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 px-2 py-1 outline-hidden select-all font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid Results Overview Section: Desktop Bento, Mobile Single Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bento Tile 1 (2 cols on desktop): Journey Title, Summary & Corridor */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.05,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="glass-card-dark rounded-3xl p-8 sm:p-10 lg:col-span-2 text-white relative overflow-hidden flex flex-col justify-between space-y-6 group"
        >
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{plan.durationDays} Days Bespoke Journey</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-heading leading-tight">
              {plan.title}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              {plan.summary}
            </p>
          </div>

          {/* Animated Route Corridor Timeline */}
          <div className="pt-4 border-t border-emerald-700/50 relative z-10">
            <RouteTimeline stops={plan.routeStops} />
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-400 via-emerald-500 to-transparent" />
        </motion.div>

        {/* Bento Tile 2 (1 col on desktop): Estimated Budget Intelligence */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.12,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="glass-card rounded-3xl p-7 lg:col-span-1 flex flex-col justify-between space-y-6 group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified Tariffs
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Estimated Budget</span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading block mt-1">
                <AnimatedCounter value={plan.estimatedBudgetInr.total} prefix="₹" />
              </span>
              <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium block mt-1">
                <AnimatedCounter value={plan.estimatedBudgetInr.perPerson} prefix="₹" suffix=" / person (2 Travelers)" />
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Includes verified state expressways, KSRTC volvos, accommodation tariffs, and 10% contingency reserve.
          </div>
        </motion.div>

        {/* Bento Tile 3 (1 col on desktop): Key Trip Logistics Matrix */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.18,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="glass-card rounded-3xl p-7 lg:col-span-1 flex flex-col justify-between space-y-5 group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {plan.durationDays} Days / {Math.max(1, plan.durationDays - 1)} Nights
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Trip Logistics Matrix
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Daily Stages</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={plan.days.length} suffix=" Active Days" />
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Intercity Transit</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400">KSRTC &amp; SWR Trains</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Curated Stays</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={plan.days.filter(d => d.recommendedStay).length} suffix=" Vetted Hotels" />
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 text-xs font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>ASI monument passes factored</span>
          </div>
        </motion.div>

        {/* Bento Tile 4 (2 cols on desktop): Detailed Tariff Breakdown Bento */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.24,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="glass-card rounded-3xl p-7 sm:p-8 lg:col-span-2 flex flex-col justify-between space-y-5 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Budget Breakdown Estimate (INR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Itemized calculations based on regional averages</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              All Tariffs Inclusive
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="glass-card-subtle p-3.5 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Accommodations</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-heading mt-0.5 block">
                <AnimatedCounter value={plan.estimatedBudgetInr.breakdown.stays} prefix="₹" />
              </span>
            </div>
            <div className="glass-card-subtle p-3.5 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Intercity Transit</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-heading mt-0.5 block">
                <AnimatedCounter value={plan.estimatedBudgetInr.breakdown.transit} prefix="₹" />
              </span>
            </div>
            <div className="glass-card-subtle p-3.5 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Dining &amp; Food</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-heading mt-0.5 block">
                <AnimatedCounter value={plan.estimatedBudgetInr.breakdown.food} prefix="₹" />
              </span>
            </div>
            <div className="glass-card-subtle p-3.5 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Activities &amp; Entry</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-heading mt-0.5 block">
                <AnimatedCounter value={plan.estimatedBudgetInr.breakdown.activities} prefix="₹" />
              </span>
            </div>
            <div className="glass-card-subtle p-3.5 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Contingency (10%)</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-heading mt-0.5 block">
                <AnimatedCounter value={plan.estimatedBudgetInr.breakdown.contingency} prefix="₹" />
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Google Maps Interactive Route & Corridor Section */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-7 border border-emerald-500/20 shadow-sm overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs">
              <MapIcon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <span>Google Maps Route &amp; Travel Corridor</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                  Live Map
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Numbered circuit pins, connecting route polylines, and attraction highlights across Karnataka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isMapExpanded ? 'Minimize Map' : 'Show Route Map'}</span>
            </button>
          </div>
        </div>

        {isMapExpanded && (
          <div className="space-y-4">
            <InteractiveKarnatakaMap
              currentPlan={plan}
              onSelectDestination={(destName) => onOpenAiGuide(destName)}
              height="480px"
              className="shadow-inner"
            />
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Route Waypoints:</span>
                {plan.routeStops.map((stop, idx) => (
                  <span
                    key={stop}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-medium"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{stop}</span>
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                Tip: Click any marker pin to view local attractions and Kannada heritage notes.
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Day by Day Itinerary */}
      <div className="space-y-6">
        <AnimatedSection duration={0.4} yOffset={18} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              Day-by-Day Schedule &amp; Transit Guide
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline animation &amp; transit corridors
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setScheduleViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                scheduleViewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Timeline View</span>
            </button>
            <button
              type="button"
              onClick={() => setScheduleViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                scheduleViewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bento Grid</span>
            </button>
          </div>
        </AnimatedSection>

        {plan.days.map((day, dIdx) => {
          const isOpen = expandedDays.includes(day.dayNumber);
          return (
            <motion.div
              key={day.dayNumber}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.42,
                delay: shouldReduceMotion ? 0 : Math.min(0.25, dIdx * 0.05),
                ease: [0.22, 1, 0.36, 1]
              }}
              className="glass-card rounded-3xl overflow-hidden print-break-inside-avoid group"
            >
              {/* Day Header Trigger */}
              <div
                onClick={() => toggleDay(day.dayNumber)}
                className="p-6 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100/40 dark:hover:bg-slate-850/60 transition-colors cursor-pointer flex items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white font-extrabold flex flex-col items-center justify-center shrink-0 shadow-xs font-heading">
                    <span className="text-[10px] uppercase font-medium opacity-80 leading-none">Day</span>
                    <span className="text-lg leading-tight font-bold">{day.dayNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800">
                        {day.cityOrHub}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 font-heading">
                      {day.theme}
                    </h3>
                    <div className="flex flex-wrap gap-2.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {day.highlights.map((h, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {day.isDayLoading || (!day.activities || day.activities.length === 0) ? (
                    <span className="no-print flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>Planning Day {day.dayNumber}...</span>
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAiGuide(day.cityOrHub);
                      }}
                      className="no-print hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Guide</span>
                    </button>
                  )}
                  <div className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Day Details (Expandable) */}
              {isOpen && (
                day.isDayLoading || (!day.activities || day.activities.length === 0) ? (
                  <div className="p-6 sm:p-8 space-y-5 animate-pulse">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>Planning Day {day.dayNumber} activities, stays &amp; transit...</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((slot) => (
                        <div key={slot} className="glass-card-subtle p-5 rounded-2xl space-y-3 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                          <div className="h-4 w-24 bg-emerald-200/60 dark:bg-emerald-900/60 rounded" />
                          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                          <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="glass-card-subtle p-4 rounded-2xl h-16 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40" />
                      <div className="glass-card-subtle p-4 rounded-2xl h-16 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40" />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Timeline View or Bento Grid View */}
                  {scheduleViewMode === 'timeline' ? (
                    <DayActivitiesTimeline
                      activities={day.activities}
                      transitToNext={day.transitToNext}
                      recommendedStay={day.recommendedStay}
                      dayNumber={day.dayNumber}
                      cityOrHub={day.cityOrHub}
                    />
                  ) : (
                    <>
                      {/* Activity Slots: Bento 3-column on desktop, single column on mobile */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-heading">
                          <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                          Day Activities &amp; Sightseeing (Bento Schedule)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {day.activities.map((activity, idx) => (
                            <div
                              key={idx}
                              className="glass-card-subtle p-5 rounded-2xl border-l-4 border-l-emerald-600 dark:border-l-emerald-500 space-y-3 flex flex-col justify-between"
                            >
                              <div className="space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800">
                                    {activity.timeSlot} ({activity.timeRange})
                                  </span>
                                  {activity.entryFeeInr !== undefined && (
                                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                      {activity.entryFeeInr === 0 ? 'Free' : `₹${activity.entryFeeInr}`}
                                    </span>
                                  )}
                                </div>

                                <h5 className="text-base font-bold text-slate-900 dark:text-white font-heading leading-snug">
                                  {activity.title}
                                </h5>

                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {activity.description}
                                </p>
                              </div>

                              {(activity.bestTimeToVisit || activity.mustTryFoodOrExperience) && (
                                <div className="pt-2 border-t border-slate-100/80 dark:border-slate-800 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                  {activity.bestTimeToVisit && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                      <Info className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                      <span>{activity.bestTimeToVisit}</span>
                                    </span>
                                  )}
                                  {activity.mustTryFoodOrExperience && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800/60 px-2 py-0.5 rounded-lg">
                                      <Utensils className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                                      <span className="truncate">{activity.mustTryFoodOrExperience}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Intercity Transit & Recommended Stay: Bento 2-column on desktop, single column on mobile */}
                      {(day.transitToNext || day.recommendedStay) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Intercity Transit Card */}
                          {day.transitToNext && (
                            <div className="glass-card-subtle p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs space-y-3 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200 text-sm font-heading">
                                    <Bus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                    <span>Intercity Transit: {day.transitToNext.modeLabel}</span>
                                  </div>
                                  <span className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">
                                    ~<AnimatedCounter value={day.transitToNext.estimatedCostInr} prefix="₹" /> / seat
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-950/90 dark:text-emerald-200/90 text-[11px]">
                                  <div>
                                    <span className="font-semibold block text-emerald-800 dark:text-emerald-400">Duration:</span>
                                    {day.transitToNext.duration}
                                  </div>
                                  <div>
                                    <span className="font-semibold block text-emerald-800 dark:text-emerald-400">Provider:</span>
                                    {day.transitToNext.provider}
                                  </div>
                                </div>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-900 text-[11px] text-emerald-950 dark:text-emerald-200 font-medium">
                                <strong>Transit Advice:</strong> {day.transitToNext.proTip}
                              </div>
                            </div>
                          )}

                          {/* Recommended Hotel Card */}
                          {day.recommendedStay && (
                            <div className="glass-card-subtle p-5 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 text-xs space-y-3 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200 text-sm font-heading">
                                    <Hotel className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                                    <span>Stay: {day.recommendedStay.name}</span>
                                  </div>
                                  <span className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">
                                    <AnimatedCounter value={day.recommendedStay.pricePerNightInr} prefix="₹" /> / night
                                  </span>
                                </div>

                                <p className="text-amber-950/90 dark:text-amber-200/90 text-xs leading-relaxed">
                                  {day.recommendedStay.description}
                                </p>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-100 dark:border-amber-900 text-[11px] text-amber-950 dark:text-amber-200">
                                <strong>Booking Tip:</strong> {day.recommendedStay.bookingTip}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Local Food Tips for the Day */}
                  {day.localFoodTips && day.localFoodTips.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-xs flex items-start gap-3">
                      <Utensils className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-950 dark:text-amber-200 block mb-1 font-heading">Local Dining &amp; Street Bites:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 dark:text-amber-300/90 text-[11px]">
                          {day.localFoodTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                </div>
              )
            )}
          </motion.div>
          );
        })}
      </div>

      {/* Travel Toolkit & Local Phrases Section: Bento 2-column on desktop, single column on mobile */}
      <AnimatedSection delay={0.1} duration={0.45} yOffset={24} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Packing Checklist */}
        <div className="glass-card rounded-3xl p-7 space-y-4 group">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-heading">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            Packing &amp; Travel Essentials
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {plan.packingAdvice.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Handy Kannada Phrases */}
        <div className="glass-card rounded-3xl p-7 space-y-4 group">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-heading">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Helpful Kannada Travel Phrases
          </h3>
          <div className="space-y-2">
            {plan.localPhrases.map((phrase, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs flex justify-between items-center shadow-2xs hover:bg-white/90 dark:hover:bg-slate-750 transition-colors">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{phrase.kannada}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Say: &ldquo;{phrase.pronunciation}&rdquo;</span>
                </div>
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/70">
                  {phrase.english}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Emergency Helplines Card */}
      <AnimatedSection delay={0.12} duration={0.45} yOffset={24}>
        <div className="glass-card-dark rounded-3xl p-8 sm:p-10 space-y-5 group text-white">
          <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm font-heading">
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>Karnataka 24/7 Traveller Helplines &amp; Assistance</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            {plan.emergencyHelplines.map((line, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
                <span className="text-slate-300 block text-[11px]">{line.name}</span>
                <span className="font-extrabold text-amber-300 text-sm mt-0.5 block">{line.contact}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Bottom Read-Only Plan Your Own Trip Banner */}
      {isReadOnly && onPlanYourOwnTrip && (
        <AnimatedSection delay={0.15} duration={0.45} yOffset={24}>
          <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white text-center space-y-6 shadow-xl border border-emerald-700/50">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-heading">
                Ready to craft your own Karnataka journey?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80">
                Customize your dates, pace, budget, destinations, and style. Wander through royal palaces, misty coffee hills, and sacred heritage ruins.
              </p>
            </div>
            <button
              onClick={onPlanYourOwnTrip}
              className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Plan your own trip</span>
            </button>
          </div>
        </AnimatedSection>
      )}

    </div>
  );
};
