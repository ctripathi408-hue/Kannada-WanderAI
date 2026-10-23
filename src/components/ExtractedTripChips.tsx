import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Wallet, 
  Compass, 
  Users, 
  Car, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  RotateCcw, 
  Mic, 
  ArrowRight,
  Landmark,
  Trees,
  Coffee,
  Waves,
  Mountain,
  Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetTier, ExperienceType, ExtractedVoiceTripDetails } from '../types/travel';

interface ExtractedTripChipsProps {
  details: ExtractedVoiceTripDetails;
  onUpdate: (updated: ExtractedVoiceTripDetails) => void;
  onGenerate: (details: ExtractedVoiceTripDetails) => void;
  onClose: () => void;
  onRecordAgain?: () => void;
  isLoading?: boolean;
}

const AVAILABLE_DESTINATIONS = [
  'Hampi',
  'Mysuru',
  'Coorg (Madikeri)',
  'Gokarna',
  'Chikmagalur',
  'Badami & Pattadakal',
  'Udupi & Malpe',
  'Kabini & Nagarhole',
  'Dandeli',
  'Belur & Halebidu'
];

const STYLE_OPTIONS: { style: ExperienceType; label: string; icon: string }[] = [
  { style: 'heritage_history', label: 'UNESCO & Royal Heritage', icon: '🏛️' },
  { style: 'nature_wildlife', label: 'Western Ghats & Nature', icon: '🌿' },
  { style: 'coffee_plantations', label: 'Coffee Trails & Estates', icon: '☕' },
  { style: 'coastal_beaches', label: 'Coastal Beaches & Cliffs', icon: '🌊' },
  { style: 'adventure_trekking', label: 'Trekking & Mountain Peaks', icon: '⛰️' },
  { style: 'spiritual_pilgrimage', label: 'Sacred & Spiritual Shrines', icon: '🛕' },
  { style: 'culinary_trail', label: 'Authentic Culinary Trail', icon: '🍛' }
];

const STARTING_CITIES = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'];

export const ExtractedTripChips: React.FC<ExtractedTripChipsProps> = ({
  details,
  onUpdate,
  onGenerate,
  onClose,
  onRecordAgain,
  isLoading = false
}) => {
  const [editingField, setEditingField] = useState<
    'destinations' | 'days' | 'budget' | 'style' | 'travelers' | 'startCity' | null
  >(null);

  const toggleDestination = (dest: string) => {
    let next: string[];
    if (details.destinations.includes(dest)) {
      if (details.destinations.length <= 1) return; // Keep at least one
      next = details.destinations.filter((d) => d !== dest);
    } else {
      next = [...details.destinations, dest];
    }
    onUpdate({ ...details, destinations: next });
  };

  const setDuration = (days: number) => {
    onUpdate({ ...details, durationDays: days });
    setEditingField(null);
  };

  const setBudget = (tier: BudgetTier) => {
    onUpdate({ ...details, budgetTier: tier });
    setEditingField(null);
  };

  const setStyle = (style: ExperienceType, label: string) => {
    onUpdate({ ...details, travelStyle: style, travelStyleLabel: label });
    setEditingField(null);
  };

  const setTravelers = (count: number) => {
    onUpdate({ ...details, travelersCount: count });
    setEditingField(null);
  };

  const setStartingCity = (city: string) => {
    onUpdate({ ...details, startingCity: city });
    setEditingField(null);
  };

  const budgetLabel = {
    budget: 'Budget (Under ₹3,500/day)',
    comfort: 'Comfort (₹4,500 – ₹8,500/day)',
    luxury: 'Royal Luxury (₹15,000+/day)'
  }[details.budgetTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      className="w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/40 text-white my-6 relative overflow-hidden"
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-radial from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Gemini Spoken Entity Extractor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                AI Parsed
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-heading mt-0.5">
              Review &amp; Edit Spoken Trip Request
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onRecordAgain && (
            <button
              type="button"
              onClick={onRecordAgain}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Speak a different request"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss extracted chips"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Raw Spoken Sentence & AI Summary */}
      <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Mic className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="text-slate-400 text-[11px] block">Spoken Input (Kannada / Hindi / English / Mixed):</span>
            <span className="text-white font-semibold text-sm italic">
              &ldquo;{details.rawSentence}&rdquo;
            </span>
          </div>
        </div>
        {details.summaryExplanation && (
          <div className="text-emerald-300 font-medium sm:text-right text-[11px] sm:max-w-xs">
            ✨ {details.summaryExplanation}
          </div>
        )}
      </div>

      {/* Editable Chips Section */}
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Tap any chip to edit before generating:
          </span>
          <span className="text-[11px] text-emerald-400 hidden sm:inline flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Click chip to adjust
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Destination(s) Chip */}
          {details.destinations && details.destinations.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEditingField(editingField === 'destinations' ? null : 'destinations')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                  editingField === 'destinations'
                    ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/30'
                    : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border-emerald-500/40 hover:border-emerald-400'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Destinations:</span>
                <span className="text-white font-bold bg-emerald-500/30 px-2 py-0.5 rounded-lg">
                  {details.destinations.join(', ')}
                </span>
                <Edit3 className="w-3 h-3 text-emerald-400 opacity-60 ml-0.5" />
              </button>

              {/* Destination Editor Popover */}
              <AnimatePresence>
                {editingField === 'destinations' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 space-y-2"
                  >
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                      Select Karnataka Destinations
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pt-1">
                      {AVAILABLE_DESTINATIONS.map((city) => {
                        const isSelected = details.destinations.includes(city);
                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={() => toggleDestination(city)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-semibold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{city}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingField(null)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Duration Days Chip */}
          {Boolean(details.durationDays && details.durationDays > 0) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEditingField(editingField === 'days' ? null : 'days')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                  editingField === 'days'
                    ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-amber-950/80 hover:bg-amber-900/90 text-amber-200 border-amber-500/40 hover:border-amber-400'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Duration:</span>
                <span className="text-white font-bold bg-amber-500/30 px-2 py-0.5 rounded-lg">
                  {details.durationDays} {details.durationDays === 1 ? 'Day' : 'Days'}
                </span>
                <Edit3 className="w-3 h-3 text-amber-400 opacity-60 ml-0.5" />
              </button>

              {/* Days Editor Popover */}
              <AnimatePresence>
                {editingField === 'days' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 space-y-2"
                  >
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                      Trip Duration (Days)
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 10].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={`py-2 rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer ${
                            details.durationDays === d
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {d} {d === 1 ? 'day' : 'days'}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Budget Tier Chip */}
          {Boolean(details.budgetTier) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEditingField(editingField === 'budget' ? null : 'budget')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                  editingField === 'budget'
                    ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/30'
                    : 'bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
                }`}
              >
                <Wallet className="w-4 h-4 text-indigo-400" />
                <span>Budget:</span>
                <span className="text-white font-bold bg-indigo-500/30 px-2 py-0.5 rounded-lg uppercase text-[11px]">
                  {details.budgetTier}
                </span>
                <Edit3 className="w-3 h-3 text-indigo-400 opacity-60 ml-0.5" />
              </button>

              {/* Budget Editor Popover */}
              <AnimatePresence>
                {editingField === 'budget' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                      Budget Tier
                    </div>
                    {(['budget', 'comfort', 'luxury'] as BudgetTier[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setBudget(tier)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          details.budgetTier === tier
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="capitalize">{tier}</span>
                        <span className="text-[10px] opacity-80">
                          {tier === 'budget' ? 'Under ₹3.5k/day' : tier === 'comfort' ? '₹4.5k – ₹8.5k' : '₹15k+ luxury'}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Travel Style Chip */}
          {Boolean(details.travelStyleLabel) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEditingField(editingField === 'style' ? null : 'style')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                  editingField === 'style'
                    ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/30'
                    : 'bg-rose-950/80 hover:bg-rose-900/90 text-rose-200 border-rose-500/40 hover:border-rose-400'
                }`}
              >
                <Compass className="w-4 h-4 text-rose-400" />
                <span>Style:</span>
                <span className="text-white font-bold bg-rose-500/30 px-2 py-0.5 rounded-lg">
                  {details.travelStyleLabel}
                </span>
                <Edit3 className="w-3 h-3 text-rose-400 opacity-60 ml-0.5" />
              </button>

              {/* Travel Style Editor Popover */}
              <AnimatePresence>
                {editingField === 'style' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                      Travel Experience Style
                    </div>
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.style}
                        type="button"
                        onClick={() => setStyle(opt.style, opt.label)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          details.travelStyle === opt.style
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Travelers Count Chip */}
          {Boolean(details.travelersCount && details.travelersCount > 0) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEditingField(editingField === 'travelers' ? null : 'travelers')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                  editingField === 'travelers'
                    ? 'bg-cyan-600 text-white border-cyan-400 ring-2 ring-cyan-400/30'
                    : 'bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Travelers:</span>
                <span className="text-white font-bold bg-cyan-500/30 px-2 py-0.5 rounded-lg">
                  {details.travelersCount} {details.travelersCount === 1 ? 'Solo' : 'People'}
                </span>
                <Edit3 className="w-3 h-3 text-cyan-400 opacity-60 ml-0.5" />
              </button>

              {/* Travelers Editor Popover */}
              <AnimatePresence>
                {editingField === 'travelers' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                      Number of Travelers
                    </div>
                    {[
                      { count: 1, label: '1 (Solo Traveler)' },
                      { count: 2, label: '2 (Couple / Duo)' },
                      { count: 3, label: '3 (Small Group / Family)' },
                      { count: 4, label: '4 (Family / Friends)' },
                      { count: 6, label: '6+ (Group Expedition)' }
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setTravelers(item.count)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          details.travelersCount === item.count
                            ? 'bg-cyan-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {details.travelersCount === item.count && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Starting City Chip */}
          {Boolean(details.startingCity && details.startingCity !== '') && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setEditingField(editingField === 'startCity' ? null : 'startCity')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                  editingField === 'startCity'
                    ? 'bg-teal-600 text-white border-teal-400 ring-2 ring-teal-400/30'
                    : 'bg-teal-950/80 hover:bg-teal-900/90 text-teal-200 border-teal-500/40 hover:border-teal-400'
                }`}
              >
                <Car className="w-4 h-4 text-teal-400" />
                <span>Depart:</span>
                <span className="text-white font-bold bg-teal-500/30 px-2 py-0.5 rounded-lg">
                  {details.startingCity}
                </span>
                <Edit3 className="w-3 h-3 text-teal-400 opacity-60 ml-0.5" />
              </button>

              {/* Starting City Editor Popover */}
              <AnimatePresence>
                {editingField === 'startCity' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                      Starting Location
                    </div>
                    {STARTING_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setStartingCity(c)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          details.startingCity === c
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{c}</span>
                        {details.startingCity === c && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Everything looks good? Click below to generate your day-by-day plan with transit &amp; stays.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onGenerate(details)}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-heading font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ring-2 ring-emerald-400/30 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Generate Itinerary with Extracted Details</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
