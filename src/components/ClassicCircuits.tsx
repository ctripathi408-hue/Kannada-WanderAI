import React from 'react';
import { Compass, ArrowRight, Clock, Wallet, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedSection } from './AnimatedSection';
import { AnimatedCounter } from './AnimatedCounter';
import { RouteTimeline } from './RouteTimeline';
import { CLASSIC_ITINERARIES } from '../data/karnataka-data';
import { ItineraryPlan } from '../types/travel';

interface ClassicCircuitsProps {
  onSelectCircuit: (plan: ItineraryPlan) => void;
}

export const ClassicCircuits: React.FC<ClassicCircuitsProps> = ({ onSelectCircuit }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <AnimatedSection duration={0.45} yOffset={24}>
        <div className="glass-card-dark text-white rounded-3xl p-8 sm:p-12 space-y-4 relative overflow-hidden group">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider border border-emerald-400/30 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Signature Karnataka Travel Circuits</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Mastercrafted Journeys Across Karnataka
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
            Need inspiration? Explore these battle-tested, culturally rich signature routes with realistic schedules, vetted highway stops, and iconic culinary encounters. Load and customize with a single click.
          </p>
        </div>
      </AnimatedSection>

      {/* Circuits Bento Grid: 1 col on mobile, 2-col bento on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CLASSIC_ITINERARIES.map((circuit, idx) => (
          <motion.div
            key={circuit.id}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : idx * 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group"
          >
            <div className="p-7 sm:p-9 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-3 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      <AnimatedCounter value={circuit.durationDays} /> Days / <AnimatedCounter value={circuit.durationDays - 1} /> Nights
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>
                      From <AnimatedCounter value={circuit.estimatedBudgetInr.perPerson} prefix="₹" /> / person
                    </span>
                  </span>
                </div>
                {idx === 0 && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Most Popular Route
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
                {circuit.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {circuit.summary}
              </p>

              {/* Route Corridor Timeline Animation */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  Corridor Route Timeline:
                </span>
                <RouteTimeline stops={circuit.routeStops} variant="compact" />
              </div>

              {/* Highlights preview */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  Signature Highlights:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {circuit.days.slice(0, 4).map((d) => (
                    <div key={d.dayNumber} className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">Day {d.dayNumber}: {d.theme.split(':')[1] || d.theme}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div className="p-7 sm:p-9 bg-slate-50/60 dark:bg-slate-800/60 border-t border-slate-100/90 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Estimated Budget</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5 font-heading">
                  <AnimatedCounter value={circuit.estimatedBudgetInr.total} prefix="₹" />
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Total for 2 travellers</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectCircuit(circuit)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 active:scale-95 text-white font-heading font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Load This Circuit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
