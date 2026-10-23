import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Compass, Bus, Hotel, Wallet } from 'lucide-react';

const LOADING_STAGES = [
  'Finding places... Planning day 1... Adding transit.',
  'Planning day 2... Adding transit & local stays...',
  'Curating heritage corridors & authentic dining...',
  'Finalizing transparent INR budget & timings...'
];

export interface ItinerarySkeletonProps {
  progressMessage?: string | null;
}

export const ItinerarySkeleton: React.FC<ItinerarySkeletonProps> = ({ progressMessage }) => {
  const shouldReduceMotion = useReducedMotion();
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const displayMessage = progressMessage || LOADING_STAGES[stageIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Status Progress Card */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-white/80 to-amber-50/50 dark:from-emerald-950/60 dark:via-slate-900/80 dark:to-amber-950/40 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/25 shrink-0">
              <Compass className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Streaming Fast
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Building Days in Parallel
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                Crafting Your Bespoke Karnataka Itinerary
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold mt-1 min-h-[20px] transition-all flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>{displayMessage}</span>
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-slate-200/80 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-300/50 dark:border-slate-700">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2.5 rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: ['20%', '55%', '85%', '95%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Ambient background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent pointer-events-none" />
      </motion.div>

      {/* Bento Grid Results Overview Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tile 1 Skeleton: 2 cols on desktop */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
          className="glass-card-dark rounded-3xl p-8 sm:p-10 lg:col-span-2 text-white space-y-6"
        >
          <div className="space-y-4">
            <div className="h-6 w-36 bg-emerald-700/50 rounded-full animate-pulse" />
            <div className="h-9 w-3/4 bg-white/20 rounded-2xl animate-pulse" />
            <div className="h-4 w-5/6 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-4 w-2/3 bg-white/10 rounded-xl animate-pulse" />
          </div>

          <div className="pt-4 border-t border-emerald-700/50 space-y-3">
            <div className="h-3 w-32 bg-emerald-400/30 rounded-lg animate-pulse" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-28 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-7 w-24 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-7 w-32 bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Tile 2 Skeleton: 1 col on desktop */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.1 }}
          className="glass-card rounded-3xl p-7 lg:col-span-1 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 animate-pulse" />
              <div className="h-5 w-24 bg-emerald-100 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-36 bg-slate-300 rounded-xl animate-pulse" />
              <div className="h-3 w-40 bg-emerald-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
        </motion.div>

        {/* Tile 3 Skeleton: 1 col on desktop */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.15 }}
          className="glass-card rounded-3xl p-7 lg:col-span-1 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-100/70 animate-pulse" />
              <div className="h-5 w-28 bg-amber-100 rounded-full animate-pulse" />
            </div>
            <div className="h-5 w-36 bg-slate-200 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-4 w-32 bg-emerald-100 rounded animate-pulse" />
        </motion.div>

        {/* Tile 4 Skeleton: 2 cols on desktop */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.2 }}
          className="glass-card rounded-3xl p-7 sm:p-8 lg:col-span-2 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-5 w-48 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-3 w-56 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass-card-subtle p-3.5 rounded-2xl space-y-2">
                <div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-14 bg-slate-300 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Day by Day Itinerary Skeleton Cards */}
      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="h-6 w-48 bg-slate-300 rounded-xl animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </div>

        {[1, 2].map((dayNum) => (
          <motion.div
            key={dayNum}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: dayNum * 0.1 }}
            className="glass-card rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800/60 animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-emerald-100 rounded animate-pulse" />
                  <div className="h-5 w-56 bg-slate-300 rounded-xl animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
            </div>

            {/* Activities 3-column bento schedule skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="glass-card-subtle p-5 rounded-2xl space-y-3">
                  <div className="h-4 w-24 bg-emerald-100 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-slate-300 rounded animate-pulse" />
                  <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Transit and Hotel 2-column skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="glass-card-subtle p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-slate-300 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="glass-card-subtle p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-slate-300 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
