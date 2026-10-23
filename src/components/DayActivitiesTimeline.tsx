import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Clock, 
  Info, 
  Utensils, 
  Bus, 
  Hotel, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Navigation,
  Train,
  Wallet
} from 'lucide-react';
import { ActivitySlot, HotelRecommendation, TransitOption } from '../types/travel';
import { AnimatedCounter } from './AnimatedCounter';

interface DayActivitiesTimelineProps {
  activities: ActivitySlot[];
  transitToNext?: TransitOption;
  recommendedStay?: HotelRecommendation;
  dayNumber: number;
  cityOrHub: string;
}

export const DayActivitiesTimeline: React.FC<DayActivitiesTimelineProps> = ({
  activities,
  transitToNext,
  recommendedStay,
  dayNumber,
  cityOrHub
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getSlotIcon = (slot: string, index: number) => {
    const s = slot.toLowerCase();
    if (s.includes('morning') || index === 0) {
      return <Sunrise className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (s.includes('afternoon') || index === 1) {
      return <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    return <Sunset className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
  };

  const getSlotColor = (slot: string, index: number) => {
    const s = slot.toLowerCase();
    if (s.includes('morning') || index === 0) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/70',
        border: 'border-emerald-300 dark:border-emerald-700',
        ring: 'ring-emerald-500/20',
        badge: 'bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
      };
    }
    if (s.includes('afternoon') || index === 1) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/70',
        border: 'border-amber-300 dark:border-amber-700',
        ring: 'ring-amber-500/20',
        badge: 'bg-amber-100/90 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
      };
    }
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/70',
      border: 'border-purple-300 dark:border-purple-700',
      ring: 'ring-purple-500/20',
      badge: 'bg-purple-100/90 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300'
    };
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-heading">
            Day {dayNumber} Timeline &amp; Journey Schedule
          </h4>
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {activities.length} Scheduled Stops in {cityOrHub}
        </span>
      </div>

      {/* Vertical Animated Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-400 before:to-amber-500 before:opacity-70 dark:before:opacity-40">
        
        {activities.map((activity, idx) => {
          const colors = getSlotColor(activity.timeSlot, idx);

          return (
            <motion.div
              key={idx}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion ? 0 : idx * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative group"
            >
              {/* Timeline Checkpoint Node on the track */}
              <div
                className={`absolute -left-6 sm:-left-10 top-1 w-6 h-6 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center shadow-xs ring-4 ${colors.ring} group-hover:scale-110 transition-transform duration-300 z-10`}
              >
                {getSlotIcon(activity.timeSlot, idx)}
              </div>

              {/* Activity Card */}
              <div className="glass-card-subtle p-5 sm:p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3.5 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors shadow-xs">
                
                {/* Time & Cost Header */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${colors.badge}`}>
                      {activity.timeSlot}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {activity.timeRange}
                    </span>
                  </div>

                  {activity.entryFeeInr !== undefined && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1 font-heading">
                      <Wallet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{activity.entryFeeInr === 0 ? 'Free Entry' : `₹${activity.entryFeeInr} / person`}</span>
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h5 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {activity.title}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                    {activity.description}
                  </p>
                </div>

                {/* Micro-guide Tags: Best Time & Culinary Pairing */}
                {(activity.bestTimeToVisit || activity.mustTryFoodOrExperience) && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
                    {activity.bestTimeToVisit && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-slate-800">
                        <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Best: {activity.bestTimeToVisit}</span>
                      </span>
                    )}

                    {activity.mustTryFoodOrExperience && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
                        <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Flavors: {activity.mustTryFoodOrExperience}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Transit Step Node if connecting to next destination */}
        {transitToNext && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : activities.length * 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="relative group"
          >
            {/* Transit Checkpoint Icon */}
            <div className="absolute -left-6 sm:-left-10 top-1 w-6 h-6 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-teal-950/80 border-2 border-teal-400 dark:border-teal-700 flex items-center justify-center shadow-xs ring-4 ring-teal-500/20 group-hover:scale-110 transition-transform duration-300 z-10">
              <Bus className="w-4 h-4 text-teal-700 dark:text-teal-300" />
            </div>

            {/* Transit Card */}
            <div className="glass-card-subtle p-5 sm:p-6 rounded-2xl border border-teal-200/80 dark:border-teal-800/80 space-y-3 bg-teal-50/20 dark:bg-teal-950/20 hover:border-teal-400 transition-colors shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-teal-600" />
                  <span>Evening Corridor Transit</span>
                </span>
                <span className="text-xs font-bold text-teal-900 dark:text-teal-300 font-heading">
                  ~<AnimatedCounter value={transitToNext.estimatedCostInr} prefix="₹" /> / seat
                </span>
              </div>

              <div>
                <h5 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  {transitToNext.modeLabel}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                  {transitToNext.proTip}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-teal-900 dark:text-teal-300 font-medium pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-teal-100/70 dark:bg-teal-900/40">
                  Duration: {transitToNext.duration}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-100/70 dark:bg-teal-900/40">
                  Frequency: {transitToNext.frequency}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommended Stay Step Node */}
        {recommendedStay && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : (activities.length + 1) * 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="relative group"
          >
            {/* Stay Checkpoint Icon */}
            <div className="absolute -left-6 sm:-left-10 top-1 w-6 h-6 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-700 flex items-center justify-center shadow-xs ring-4 ring-amber-500/20 group-hover:scale-110 transition-transform duration-300 z-10">
              <Hotel className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </div>

            {/* Stay Card */}
            <div className="glass-card-subtle p-5 sm:p-6 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 space-y-3 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-400 transition-colors shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Hotel className="w-3 h-3 text-amber-600" />
                  <span>Night Stay &amp; Check-In</span>
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 font-heading">
                  <AnimatedCounter value={recommendedStay.pricePerNightInr} prefix="₹" /> / night
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    {recommendedStay.name}
                  </h5>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{recommendedStay.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{recommendedStay.area}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {recommendedStay.amenities.slice(0, 3).map((amenity, aIdx) => (
                  <span
                    key={aIdx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
