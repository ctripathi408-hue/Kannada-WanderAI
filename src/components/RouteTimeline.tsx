import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  MapPin, 
  ArrowRight, 
  Bus, 
  Train, 
  Car, 
  Clock, 
  Sparkles, 
  Navigation,
  Compass
} from 'lucide-react';
import { KARNATAKA_CITIES } from '../data/karnataka-data';

interface RouteTimelineProps {
  stops: string[];
  activeStopIndex?: number;
  onSelectStop?: (stopName: string, index: number) => void;
  className?: string;
  variant?: 'corridor' | 'compact';
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  stops,
  activeStopIndex = 0,
  onSelectStop,
  className = '',
  variant = 'corridor'
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!stops || stops.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Timeline Corridor Header */}
      {variant !== 'compact' && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
            <Navigation className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="uppercase tracking-wider text-[11px]">Active Route Corridor Timeline</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {stops.length} Corridor Stops
          </span>
        </div>
      )}

      {/* Responsive Animated Timeline Track */}
      <div className={`relative ${variant === 'compact' ? 'p-3 sm:p-3.5' : 'p-4 sm:p-5'} rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar`}>
        {/* Animated Connecting Line */}
        <div className={`hidden sm:block absolute ${variant === 'compact' ? 'top-8 left-6 right-6 h-0.5' : 'top-10 left-8 right-8 h-1'} bg-slate-200 dark:bg-slate-800 z-0 rounded-full overflow-hidden`}>
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full"
            initial={shouldReduceMotion ? { width: '100%' } : { width: '0%' }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-start justify-between min-w-[540px] sm:min-w-0 gap-4 sm:gap-2 relative z-10">
          {stops.map((stop, idx) => {
            const cityData = KARNATAKA_CITIES.find(
              (c) => c.name.toLowerCase() === stop.toLowerCase() || stop.toLowerCase().includes(c.name.toLowerCase())
            );
            const isFirst = idx === 0;
            const isLast = idx === stops.length - 1;
            const isCurrent = idx === activeStopIndex;

            return (
              <div
                key={idx}
                onClick={() => onSelectStop && onSelectStop(stop, idx)}
                className={`flex-1 flex flex-col items-center text-center group ${
                  onSelectStop ? 'cursor-pointer' : ''
                }`}
              >
                {/* Node Anchor */}
                <motion.div
                  initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay: shouldReduceMotion ? 0 : idx * 0.1,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm font-heading shadow-md transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white ring-4 ring-emerald-500/25 scale-105'
                      : isFirst || isLast
                      ? 'bg-emerald-700 text-white group-hover:scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500'
                  }`}
                >
                  {isFirst ? (
                    <Compass className="w-4 h-4 text-amber-300" />
                  ) : isLast ? (
                    <MapPin className="w-4 h-4 text-amber-300" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}

                  {/* Pulsing beacon on current stop */}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping pointer-events-none" />
                  )}
                </motion.div>

                {/* Stop Label */}
                <div className="mt-2.5 space-y-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {stop}
                    </span>
                  </div>
                  {cityData?.kannadaName && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-medium">
                      {cityData.kannadaName}
                    </span>
                  )}
                  {isFirst && (
                    <span className="inline-block text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md">
                      Origin Hub
                    </span>
                  )}
                  {isLast && stops.length > 2 && (
                    <span className="inline-block text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-md">
                      Final Stop
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
