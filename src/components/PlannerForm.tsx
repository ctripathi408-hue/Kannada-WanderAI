import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  Info, 
  Coffee, 
  Landmark, 
  Trees, 
  Waves, 
  Utensils, 
  Mountain, 
  ShieldCheck,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Compass,
  Users,
  ArrowRight,
  Bus,
  Bot,
  Wallet,
  Navigation,
  Map as MapIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AnimatedSection } from './AnimatedSection';
import { AnimatedCounter } from './AnimatedCounter';
import { DestinationPhotoCards } from './DestinationPhotoCards';
import { VoiceSearchInput } from './VoiceSearchInput';
import { ExtractedTripChips } from './ExtractedTripChips';
import { InteractiveKarnatakaMap } from './InteractiveKarnatakaMap';
import { BudgetTier, ExperienceType, TripPlanRequest, ExtractedVoiceTripDetails, ItineraryPlan } from '../types/travel';
import { KARNATAKA_CITIES } from '../data/karnataka-data';
import { getSeasonalWeatherAdvice } from '../utils/travel-calculator';

interface PlannerFormProps {
  onGenerate: (request: TripPlanRequest) => void;
  isLoading: boolean;
  progressMessage?: string | null;
  onSelectPrebuilt: (itineraryId: string) => void;
  currentPlan?: ItineraryPlan | null;
}

const INTEREST_OPTIONS: { id: string; label: string; expType: ExperienceType; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'heritage',
    label: 'UNESCO & Royal Heritage',
    expType: 'heritage_history',
    icon: <Landmark className="w-5 h-5 text-amber-600" />,
    desc: 'Mysuru Palace, Hampi ruins, Belur Hoysala temples & Badami caves'
  },
  {
    id: 'ghats',
    label: 'Western Ghats & Nature',
    expType: 'nature_wildlife',
    icon: <Trees className="w-5 h-5 text-emerald-700" />,
    desc: 'Lush rainforests, misty valleys, waterfalls & spice plantations'
  },
  {
    id: 'coffee',
    label: 'Coffee Trails & Estates',
    expType: 'coffee_plantations',
    icon: <Coffee className="w-5 h-5 text-amber-600" />,
    desc: 'Chikmagalur & Coorg heritage homestays with bean-to-cup brewing'
  },
  {
    id: 'coastal',
    label: 'Coastal Beaches & Cliffs',
    expType: 'coastal_beaches',
    icon: <Waves className="w-5 h-5 text-emerald-700" />,
    desc: 'Gokarna Om Beach, Kudle cliffs, St. Mary basalt islands & Malpe'
  },
  {
    id: 'wildlife',
    label: 'Wildlife & Tiger Safaris',
    expType: 'nature_wildlife',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
    desc: 'Kabini boat safaris, Nagarhole tigers & Bandipur wild elephants'
  },
  {
    id: 'culinary',
    label: 'Authentic Culinary Trail',
    expType: 'culinary_trail',
    icon: <Utensils className="w-5 h-5 text-amber-600" />,
    desc: 'Udupi thali, Mangalore ghee roast, Coorg pandi curry & Mysore pak'
  },
  {
    id: 'trekking',
    label: 'Trekking & Mountain Peaks',
    expType: 'adventure_trekking',
    icon: <Mountain className="w-5 h-5 text-emerald-700" />,
    desc: 'Mullayanagiri, Baba Budangiri, Kumara Parvatha & Kudremukh'
  },
  {
    id: 'spiritual',
    label: 'Sacred & Spiritual Shrines',
    expType: 'spiritual_pilgrimage',
    icon: <Compass className="w-5 h-5 text-amber-600" />,
    desc: 'Udupi Krishna Matha, Gokarna Mahabaleshwar, Murudeshwar & Sringeri'
  }
];

const MONTHS = [
  { value: 1, label: 'January (Pleasant Winter)' },
  { value: 2, label: 'February (Dry & Warm)' },
  { value: 3, label: 'March (Spring Warmth)' },
  { value: 4, label: 'April (Deccan Summer)' },
  { value: 5, label: 'May (Pre-monsoon Showers)' },
  { value: 6, label: 'June (Monsoon Arrival)' },
  { value: 7, label: 'July (Peak Monsoon Rains)' },
  { value: 8, label: 'August (Emerald Ghats)' },
  { value: 9, label: 'September (Post-monsoon Lush)' },
  { value: 10, label: 'October (Dasara Festivities)' },
  { value: 11, label: 'November (Cool & Clear)' },
  { value: 12, label: 'December (Peak Travel Season)' }
];

export const PlannerForm: React.FC<PlannerFormProps> = ({
  onGenerate,
  isLoading,
  progressMessage,
  onSelectPrebuilt,
  currentPlan
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [startingCity, setStartingCity] = useState('');
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [budgetTier, setBudgetTier] = useState<BudgetTier | null>(null);
  const [travelersCount, setTravelersCount] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [travelMonth, setTravelMonth] = useState<number | null>(null);
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'packed' | null>(null);
  const [transportPreference, setTransportPreference] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [destinationViewMode, setDestinationViewMode] = useState<'cards' | 'badges'>('cards');
  const [heroVoicePrompt, setHeroVoicePrompt] = useState('');
  const [extractedDetails, setExtractedDetails] = useState<ExtractedVoiceTripDetails | null>(null);
  const [isExtractingVoice, setIsExtractingVoice] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<any>(null);
  // Map starts collapsed by default, not restored from saved state
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);

  // Auto-expand map only when an itinerary has been generated
  useEffect(() => {
    if (currentPlan) {
      setIsMapExpanded(true);
    }
  }, [currentPlan]);

  const canPlan = selectedDestinations.length > 0 && durationDays !== null && durationDays > 0;

  const weatherHint = travelMonth && (selectedDestinations[0] || startingCity)
    ? getSeasonalWeatherAdvice(selectedDestinations[0] || startingCity, travelMonth)
    : null;

  const handleClearAll = () => {
    setSelectedDestinations([]);
    setDurationDays(null);
    setBudgetTier(null);
    setTravelersCount(null);
    setSelectedInterests([]);
    setStartingCity('');
    setTravelMonth(null);
    setPace(null);
    setTransportPreference('');
    setFoodPreference('');
    setSpecialRequirements('');
    setHeroVoicePrompt('');
    setExtractedDetails(null);
    setVoiceLanguage(null);
    setIsMapExpanded(false);
  };

  const handleExtractFromVoice = async (transcript: string, lang = 'en-IN') => {
    if (!transcript || !transcript.trim()) return;
    const text = transcript.trim();
    setHeroVoicePrompt(text);
    setSpecialRequirements(text);
    setIsExtractingVoice(true);

    try {
      const res = await fetch('/api/extract-trip-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang })
      });
      const data = await res.json();
      if (data.success && data.details) {
        const details: ExtractedVoiceTripDetails = data.details;
        setExtractedDetails(details);
        // Automatically synchronize form inputs to match the AI extraction
        if (details.destinations?.length > 0) {
          setSelectedDestinations(details.destinations);
        }
        if (details.durationDays) {
          setDurationDays(details.durationDays);
        }
        if (details.budgetTier) {
          setBudgetTier(details.budgetTier);
        }
        if (details.travelersCount) {
          setTravelersCount(details.travelersCount);
        }
        if (details.startingCity) {
          setStartingCity(details.startingCity);
        }
        if (details.travelStyleLabel) {
          setSelectedInterests([details.travelStyleLabel]);
        }
      }
    } catch (err) {
      console.error('Failed to extract voice details:', err);
    } finally {
      setIsExtractingVoice(false);
    }
  };

  const handleHeroVoiceSubmit = (promptText: string) => {
    const textToUse = promptText.trim() || heroVoicePrompt.trim();
    if (!textToUse) return;
    // Extract parameters using Gemini and display editable chips
    handleExtractFromVoice(textToUse);
  };

  const handleGenerateFromExtracted = (detailsToUse: ExtractedVoiceTripDetails) => {
    const primaryInterest = INTEREST_OPTIONS.find(
      opt => opt.expType === detailsToUse.travelStyle || opt.label === detailsToUse.travelStyleLabel
    );
    const expType: ExperienceType = detailsToUse.travelStyle || (primaryInterest ? primaryInterest.expType : 'heritage_history');
    const monthObj = travelMonth ? MONTHS.find(m => m.value === travelMonth) : null;

    onGenerate({
      startingCity: detailsToUse.startingCity || startingCity || 'Bengaluru',
      destinations: detailsToUse.destinations?.length > 0 ? detailsToUse.destinations : (selectedDestinations.length > 0 ? selectedDestinations : ['Mysuru']),
      durationDays: detailsToUse.durationDays || durationDays || 3,
      interests: [detailsToUse.travelStyleLabel || (primaryInterest ? primaryInterest.label : 'UNESCO & Royal Heritage')],
      budgetTier: detailsToUse.budgetTier || budgetTier || 'comfort',
      experienceType: expType,
      travelersCount: detailsToUse.travelersCount || travelersCount || 2,
      travelMonth: monthObj ? monthObj.label : 'November',
      pace: pace || 'moderate',
      specialRequirements: detailsToUse.rawSentence,
      transportPreference: transportPreference || undefined,
      foodPreference: foodPreference || undefined
    });
  };

  const toggleInterest = (label: string) => {
    if (selectedInterests.includes(label)) {
      setSelectedInterests(selectedInterests.filter(i => i !== label));
    } else {
      setSelectedInterests([...selectedInterests, label]);
    }
  };

  const toggleDestination = (cityName: string) => {
    if (selectedDestinations.includes(cityName)) {
      setSelectedDestinations(selectedDestinations.filter(c => c !== cityName));
    } else {
      setSelectedDestinations([...selectedDestinations, cityName]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canPlan) return;

    const primaryInterest = INTEREST_OPTIONS.find(opt => selectedInterests.includes(opt.label));
    const expType: ExperienceType = primaryInterest ? primaryInterest.expType : 'heritage_history';
    const monthObj = travelMonth ? MONTHS.find(m => m.value === travelMonth) : null;

    const notesParts: string[] = [];
    if (transportPreference) {
      notesParts.push(`Transport: ${transportPreference}`);
    }
    if (foodPreference) {
      notesParts.push(`Food preference: ${foodPreference}`);
    }
    if (specialRequirements.trim()) {
      notesParts.push(specialRequirements.trim());
    }

    onGenerate({
      startingCity: startingCity || 'Bengaluru',
      destinations: selectedDestinations,
      durationDays: durationDays!,
      interests: selectedInterests.length > 0 ? selectedInterests : ['UNESCO & Royal Heritage'],
      budgetTier: budgetTier || 'comfort',
      experienceType: expType,
      travelersCount: travelersCount || 2,
      travelMonth: monthObj ? monthObj.label : 'November',
      pace: pace || 'moderate',
      specialRequirements: notesParts.length > 0 ? notesParts.join('; ') : undefined,
      transportPreference: transportPreference || undefined,
      foodPreference: foodPreference || undefined
    });
  };

  return (
    <div className="w-full">
      {/* Full-width Hero with high-quality background image and dark gradient overlay */}
      <section className="relative w-full bg-slate-950 text-white min-h-[540px] sm:min-h-[620px] lg:min-h-[680px] flex items-center justify-center">
        {/* High-quality background image */}
        <img
          src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2560&q=85"
          alt="Karnataka Heritage and Royal Architecture"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.1] scale-105 pointer-events-none"
          loading="eager"
        />

        {/* Dark multi-stop gradient overlays for rich contrast and depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/50 via-transparent to-slate-950/85" />

        {/* Hero Content with Framer Motion fade-in and slide-up */}
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center flex flex-col items-center"
        >
          {/* Eyebrow badge with fade-up */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 text-xs sm:text-sm font-semibold uppercase tracking-wider backdrop-blur-md mb-6 shadow-lg shadow-emerald-950/50">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Travel Architect for Karnataka</span>
          </div>

          {/* Large headline with gradient text and fade-up */}
          <h1 className="animate-fade-up-delay-1 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-[1.08] text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-amber-200 drop-shadow-sm max-w-4xl mx-auto">
            Craft Your Bespoke Karnataka Journey
          </h1>

          {/* Subheading with fade-up */}
          <p className="animate-fade-up-delay-2 text-base sm:text-xl text-slate-200/90 leading-relaxed font-normal max-w-2xl mx-auto mt-6">
            From the 14th-century stone ruins of Hampi and the royal sandalwood palaces of Mysuru, to the misty coffee peaks of Coorg and pristine cliffs of Gokarna. Generate day-by-day itineraries with real-time transit and vetted stays.
          </p>

          {/* Prominent Search Box with Microphone Button, Web Speech API & Language Selector */}
          <div className="relative z-50 w-full max-w-3xl mx-auto mt-8" style={{ zIndex: 50 }}>
            <VoiceSearchInput
              value={heroVoicePrompt}
              onChange={(val) => {
                setHeroVoicePrompt(val);
                setSpecialRequirements(val);
              }}
              onSubmit={handleHeroVoiceSubmit}
              onVoiceEnd={(transcript, lang) => handleExtractFromVoice(transcript, lang)}
              selectedLanguage={voiceLanguage}
              onLanguageChange={(lang) => setVoiceLanguage(lang)}
              placeholder="Search or tap mic to speak: e.g. 'Hampi ge 2 days, budget kammi'..."
              submitButtonText="Extract & Plan"
              variant="hero"
            />

            {/* Loading Indicator while Gemini extracts entity details */}
            {isExtractingVoice && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-3 backdrop-blur-xl shadow-xl text-xs sm:text-sm font-semibold"
              >
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Gemini is extracting destination, days, budget, style &amp; travelers from your spoken sentence...</span>
                </span>
              </motion.div>
            )}

            {/* Extracted Details as Editable Chips */}
            {extractedDetails && (
              <div className="w-full text-left">
                <ExtractedTripChips
                  details={extractedDetails}
                  onUpdate={(updated) => {
                    setExtractedDetails(updated);
                    if (updated.destinations?.length > 0) setSelectedDestinations(updated.destinations);
                    if (updated.durationDays) setDurationDays(updated.durationDays);
                    if (updated.budgetTier) setBudgetTier(updated.budgetTier);
                    if (updated.travelersCount) setTravelersCount(updated.travelersCount);
                    if (updated.startingCity) setStartingCity(updated.startingCity);
                    if (updated.travelStyleLabel) setSelectedInterests([updated.travelStyleLabel]);
                  }}
                  onGenerate={handleGenerateFromExtracted}
                  onClose={() => setExtractedDetails(null)}
                  isLoading={isLoading}
                  onRecordAgain={() => {
                    setExtractedDetails(null);
                    setHeroVoicePrompt('');
                  }}
                />
              </div>
            )}
          </div>

          {/* Hero Actions: Start Planning Your Journey CTA & Options */}
          <div className="relative z-1 mt-9 flex flex-col items-center justify-center gap-3 w-full sm:w-auto" style={{ zIndex: 1 }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <div className="flex flex-col items-center w-full sm:w-auto">
                <button
                  type="button"
                  disabled={!canPlan || isLoading}
                  onClick={() => {
                    if (!canPlan) return;
                    handleSubmit();
                  }}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-heading font-semibold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                    canPlan
                      ? 'glow-btn-primary bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white cursor-pointer ring-2 ring-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.55)] hover:shadow-[0_0_40px_rgba(16,185,129,0.85)] hover:scale-105 active:scale-95'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-60'
                  }`}
                  aria-disabled={!canPlan}
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Start Planning Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {!canPlan && (
                  <p className="text-xs text-slate-300/80 mt-2 font-medium">
                    Choose a place and trip length to continue.
                  </p>
                )}
              </div>

              <a
                href="#planner-form-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('planner-form-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm sm:text-base border border-white/20 hover:border-white/35 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Jump to Options ↓</span>
              </a>
            </div>

            {/* Clear all link in hero if any selection or input exists */}
            {(selectedDestinations.length > 0 || durationDays !== null || budgetTier !== null || selectedInterests.length > 0 || heroVoicePrompt) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-white underline mt-1 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Quick highlights strip */}
          <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300/80">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/15 backdrop-blur-md flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> UNESCO Heritage Included
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/15 backdrop-blur-md flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> KSRTC Transit &amp; Trains
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/15 backdrop-blur-md flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Curated Stays &amp; Flavors
            </span>
          </div>
        </motion.div>
      </section>

      {/* Main Interactive Form with scroll-triggered animation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20 pb-16 space-y-12">
        
        {/* Animated Statistics Counter Strip */}
        <AnimatedSection delay={0.05} duration={0.45} yOffset={20}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-card rounded-3xl p-5 sm:p-6 text-center space-y-2 group">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                <AnimatedCounter value={30} suffix="+" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                UNESCO &amp; Heritage Sites
              </p>
            </div>

            <div className="glass-card rounded-3xl p-5 sm:p-6 text-center space-y-2 group">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Bus className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                <AnimatedCounter value={3500} suffix="+" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                KSRTC &amp; Rail Services
              </p>
            </div>

            <div className="glass-card rounded-3xl p-5 sm:p-6 text-center space-y-2 group">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                <AnimatedCounter value={140} suffix="+" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Curated Stays &amp; Homestays
              </p>
            </div>

            <div className="glass-card rounded-3xl p-5 sm:p-6 text-center space-y-2 group">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Grounded Timetables
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Current Plan Section */}
        {selectedDestinations.length === 0 && !currentPlan ? (
          <AnimatedSection delay={0.08} duration={0.4} yOffset={16} id="current-plan-section">
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block font-heading">
                    Current Plan
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Your plan will appear here once you choose a place.
                  </span>
                </div>
              </div>
              <a
                href="#destinations-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('destinations-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline shrink-0 text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Choose a place</span>
                <span>↓</span>
              </a>
            </div>
          </AnimatedSection>
        ) : (
          <AnimatedSection delay={0.08} duration={0.4} yOffset={16} id="current-plan-section">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 dark:border-emerald-500/20 shadow-md space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                    <Compass className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
                        Current Plan
                      </h2>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                        {selectedDestinations.length} {selectedDestinations.length === 1 ? 'Place' : 'Places'} Selected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Your active destinations, chosen travel preferences, and route corridor
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {/* Places and Preferences Chips */}
              <div className="space-y-3">
                {/* Selected Places */}
                {selectedDestinations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Places:</span>
                    </span>
                    {selectedDestinations.map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => toggleDestination(dest)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-medium cursor-pointer hover:bg-emerald-200/80 dark:hover:bg-emerald-900/80 transition-colors"
                        title="Click to remove from plan"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{dest}</span>
                        <X className="w-3 h-3 text-emerald-700 dark:text-emerald-400 opacity-75 hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Preferences: ONLY show if user has actually chosen it */}
                {(durationDays !== null ||
                  budgetTier !== null ||
                  selectedInterests.length > 0 ||
                  travelersCount !== null ||
                  (startingCity && startingCity !== '') ||
                  (transportPreference && transportPreference !== '') ||
                  (foodPreference && foodPreference !== '') ||
                  (travelMonth !== null && travelMonth !== undefined) ||
                  pace !== null ||
                  (specialRequirements && specialRequirements.trim() !== '')) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Preferences:</span>
                    </span>

                    {durationDays !== null && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{durationDays} Days</span>
                      </span>
                    )}

                    {budgetTier !== null && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
                        <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="capitalize">{budgetTier} Tier</span>
                      </span>
                    )}

                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs font-semibold"
                      >
                        <Compass className="w-3.5 h-3.5 text-rose-600" />
                        <span>{interest}</span>
                      </span>
                    ))}

                    {travelersCount !== null && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{travelersCount} {travelersCount === 1 ? 'Traveler' : 'Travelers'}</span>
                      </span>
                    )}

                    {startingCity && startingCity !== '' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>From {startingCity}</span>
                      </span>
                    )}

                    {transportPreference && transportPreference !== '' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                        <Bus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{transportPreference}</span>
                      </span>
                    )}

                    {foodPreference && foodPreference !== '' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800 text-xs font-semibold">
                        <Utensils className="w-3.5 h-3.5 text-orange-600" />
                        <span>{foodPreference}</span>
                      </span>
                    )}

                    {travelMonth !== null && travelMonth !== undefined && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800 text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        <span>{MONTHS.find(m => m.value === travelMonth)?.label.split(' ')[0]}</span>
                      </span>
                    )}

                    {pace !== null && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span className="capitalize">{pace} Pace</span>
                      </span>
                    )}

                    {specialRequirements && specialRequirements.trim() !== '' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium">
                        <span>“{specialRequirements.trim().length > 30 ? specialRequirements.trim().slice(0, 30) + '…' : specialRequirements.trim()}”</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Google Map: Collapsed by default, compact bar with "Show map", and "Minimize" when expanded with smooth height animation */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {!isMapExpanded ? (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750 flex items-center justify-between gap-3 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <Navigation className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-heading block truncate">
                          Google Map Route Preview
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {selectedDestinations.length > 0
                            ? `${selectedDestinations.length} destination markers on live Karnataka map`
                            : 'Preview travel corridor, ghat roads & UNESCO landmarks'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMapExpanded(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      <MapIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Show map</span>
                    </button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    <motion.div
                      key="planner-google-map"
                      initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden space-y-3"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Interactive Google Map • {selectedDestinations.join(' → ') || 'Karnataka Map'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsMapExpanded(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Minimize</span>
                        </button>
                      </div>
                      <InteractiveKarnatakaMap
                        height="380px"
                        currentPlan={currentPlan}
                        selectedDestinations={selectedDestinations}
                        onSelectDestination={toggleDestination}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection id="planner-form-section" delay={0.1} duration={0.5} yOffset={28}>
          <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 sm:p-12 space-y-12">
            
            {/* Top Form Ribbon with Clear All Link */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Custom Itinerary Builder</span>
                <span className="text-slate-400 dark:text-slate-600 ml-1 font-normal lowercase">(fields marked <span className="text-rose-500 font-bold">*</span> are required)</span>
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 underline transition-colors cursor-pointer"
                title="Reset all form options and selections"
              >
                Clear all
              </button>
            </div>
        
            {/* Section 1: Destinations & Starting Hub */}
            <div id="destinations-section" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-heading font-bold text-sm flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800 shadow-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                      Starting City &amp; Destinations
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Where does your journey commence and which Karnataka regions fascinate you?
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label htmlFor="starting-hub-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Starting Location / Hub <span className="font-normal lowercase text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      id="starting-hub-select"
                      aria-label="Starting Location / Hub"
                      value={startingCity}
                      onChange={(e) => setStartingCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
                    >
                      <option value="">Select starting city</option>
                      <option value="Bengaluru">Bengaluru (BLR Airport / Majestic KSRTC)</option>
                      <option value="Mysuru">Mysuru (MYS Junction / Palace Area)</option>
                      <option value="Mangaluru">Mangaluru (IXE Airport / Coastal Hub)</option>
                      <option value="Hubballi">Hubballi / Belagavi (North Karnataka Gateway)</option>
                      <option value="Goa Border">Goa Border / Karwar (Coastal Entry)</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                    KSRTC Flybus directly connects BLR airport to Mysuru and Madikeri without city traffic.
                  </p>
                </div>

                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
                        <span>Included Destinations</span>
                        <span className="text-rose-500 font-bold ml-1 text-sm leading-none" title="Required">*</span>
                        <span className="ml-1.5 font-normal text-slate-400">({selectedDestinations.length} Selected)</span>
                      </label>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setDestinationViewMode('cards')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            destinationViewMode === 'cards'
                              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Photo Cards Gallery</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDestinationViewMode('badges')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            destinationViewMode === 'badges'
                              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>Compact Badges</span>
                        </button>
                      </div>
                    </div>

                    {/* Selected preview chips only if destinations are chosen */}
                    {selectedDestinations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 min-h-[48px]">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                          Route Stops:
                        </span>
                        {selectedDestinations.map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDestination(d)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 text-xs font-medium flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800 cursor-pointer hover:bg-emerald-200/70 dark:hover:bg-emerald-900/80 transition-colors"
                            title="Click to remove from plan"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{d}</span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 opacity-75">✕</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Render Destination Photo Cards Gallery or Compact Badges */}
              {destinationViewMode === 'cards' ? (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <DestinationPhotoCards
                    selectedDestinations={selectedDestinations}
                    onToggleDestination={toggleDestination}
                    title="Select Karnataka Destinations"
                    subtitle="Hover over any photo card to zoom into architectural and scenic details. Click any card to include or exclude it from your itinerary."
                    showFilters={true}
                  />
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2.5">
                    {KARNATAKA_CITIES.map((city) => {
                      const isSelected = selectedDestinations.includes(city.name);
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => toggleDestination(city.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                            isSelected
                              ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600 shadow-sm'
                              : 'bg-slate-50/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-750'
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
                          <span>{city.name}</span>
                          <span className="text-[11px] opacity-75 font-normal">({city.region.split('/')[0]})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Trip Duration & Travel Dates */}
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-heading font-bold text-sm flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800 shadow-xs">
                  2
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                    Duration, Month &amp; Season
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    How much time do you have and when are you traveling?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label htmlFor="duration-days-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>Trip Duration</span>
                      <span className="text-rose-500 font-bold ml-0.5 text-sm leading-none" title="Required">*</span>
                      {durationDays ? (
                        <span className="text-emerald-800 dark:text-emerald-400 font-bold normal-case text-sm ml-1.5">{durationDays} Days</span>
                      ) : null}
                    </label>
                  </div>

                  {/* Duration Dropdown with Neutral Placeholder */}
                  <select
                    id="duration-days-select"
                    aria-label="Trip Duration Days"
                    value={durationDays ?? ''}
                    onChange={(e) => setDurationDays(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs mb-3"
                  >
                    <option value="">Select days</option>
                    <option value="1">1 Day (Express Day Trip)</option>
                    <option value="2">2 Days (Overnight Weekend)</option>
                    <option value="3">3 Days (Long Weekend Circuit)</option>
                    <option value="4">4 Days (Mini Vacation)</option>
                    <option value="5">5 Days (Classic Karnataka)</option>
                    <option value="6">6 Days (Heritage &amp; Hills)</option>
                    <option value="7">7 Days (Full Grand Circuit)</option>
                    <option value="8">8 Days (Ghats &amp; Coast)</option>
                    <option value="10">10 Days (Complete Odyssey)</option>
                    <option value="14">14 Days (Grand Karnataka)</option>
                  </select>

                  {/* Quick duration buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-3.5">
                    {[3, 5, 7, 10].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationDays(d)}
                        className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                          durationDays === d
                            ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600 shadow-xs font-semibold'
                            : 'bg-slate-50/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-750'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={durationDays ?? 1}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    className="w-full accent-emerald-700 dark:accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                    <span>1 Day</span>
                    <span>Weekend (3D)</span>
                    <span>Week (7D)</span>
                    <span>Grand (14D)</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="travel-month-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Travel Month &amp; Season <span className="font-normal lowercase text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      id="travel-month-select"
                      aria-label="Travel Month & Season"
                      value={travelMonth ?? ''}
                      onChange={(e) => setTravelMonth(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
                    >
                      <option value="">Select travel month</option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Seasonal Alert in warm accent amber */}
                  {weatherHint ? (
                    <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{weatherHint.seasonName}: </span>
                        {weatherHint.summary}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                      Select a month to see seasonal Western Ghats weather advice.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="travel-pace-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Travel Pace <span className="font-normal lowercase text-slate-400">(optional)</span>
                  </label>
                  <select
                    id="travel-pace-select"
                    aria-label="Travel Pace"
                    value={pace ?? ''}
                    onChange={(e) => setPace((e.target.value as any) || null)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
                  >
                    <option value="">Select pace</option>
                    <option value="relaxed">Relaxed (1-2 main highlights / day, slow food)</option>
                    <option value="moderate">Balanced (2-3 highlights / day, comfortable)</option>
                    <option value="packed">High-Energy (Full explorer, early sunrises)</option>
                  </select>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                    Karnataka road trips reward relaxed pacing due to scenic ghats and viewpoints.
                  </p>
                </div>
              </div>
            </div>

        {/* Section 3: Interests & Desired Experiences */}
        <div className="space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-heading font-bold text-sm flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800 shadow-xs">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                Your Interests &amp; Desired Experience <span className="font-normal lowercase text-slate-400 text-sm">(optional)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pick what you love most so AI can weave the perfect narrative
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INTEREST_OPTIONS.map((opt) => {
              const isSelected = selectedInterests.includes(opt.label);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleInterest(opt.label)}
                  className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                      {opt.icon}
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3.5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-heading leading-tight">{opt.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{opt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Budget Tier & Group Size */}
        <div className="space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-heading font-bold text-sm flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800 shadow-xs">
              4
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                Budget Tier &amp; Group Size <span className="font-normal lowercase text-slate-400 text-sm">(optional)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                We balance real hotel tariffs, KSRTC / train tickets, and meal costs accordingly
              </p>
            </div>
          </div>

          {/* Budget Dropdown with Neutral Placeholder */}
          <div>
            <label htmlFor="budget-tier-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Budget Tier <span className="font-normal lowercase text-slate-400">(optional)</span>
            </label>
            <div className="relative mb-4">
              <Wallet className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                id="budget-tier-select"
                aria-label="Budget Tier"
                value={budgetTier ?? ''}
                onChange={(e) => setBudgetTier((e.target.value as any) || null)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
              >
                <option value="">Choose budget</option>
                <option value="budget">Backpacker / Budget (₹1,500 – ₹3,000 / day)</option>
                <option value="comfort">Comfort / Mid-Range (₹4,500 – ₹8,500 / day)</option>
                <option value="luxury">Royal Heritage &amp; Luxury (₹15,000+ / day)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Budget / Backpacker */}
            <div
              onClick={() => setBudgetTier(budgetTier === 'budget' ? null : 'budget')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                budgetTier === 'budget'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
                  Backpacker / Budget
                </span>
                {budgetTier === 'budget' && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-heading">₹1,500 – ₹3,000 / day</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Zostel hostels, clean KSTDC Mayura guest hotels, KSRTC Rajahamsa buses, local canteen meals (MTR, CTR, Udupi cafes).
              </p>
            </div>

            {/* Comfort / Mid-Range */}
            <div
              onClick={() => setBudgetTier(budgetTier === 'comfort' ? null : 'comfort')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                budgetTier === 'comfort'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  Comfort / Mid-Range
                </span>
                {budgetTier === 'comfort' && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-heading">₹4,500 – ₹8,500 / day</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Boutique coffee estate homestays, Radisson Blu, KSRTC Airavat Club Class / Vande Bharat Express, private cabs.
              </p>
            </div>

            {/* Royal Heritage / Luxury */}
            <div
              onClick={() => setBudgetTier(budgetTier === 'luxury' ? null : 'luxury')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                budgetTier === 'luxury'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-900/40 border border-amber-300/70 dark:border-amber-700/60 px-2.5 py-1 rounded-lg">
                  Royal Heritage &amp; Luxury
                </span>
                {budgetTier === 'luxury' && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-heading">₹15,000+ / day</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Lalitha Mahal Palace, Evolve Back Kamalapura Hampi &amp; Kabini, Tamara Coorg, chauffeured Innova Crysta, private guides.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label htmlFor="travelers-count-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Number of Travelers <span className="font-normal lowercase text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                id="travelers-count-select"
                aria-label="Number of Travelers"
                value={travelersCount ?? ''}
                onChange={(e) => setTravelersCount(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
              >
                <option value="">Select travelers</option>
                <option value="1">1 Traveler (Solo Wanderer)</option>
                <option value="2">2 Travelers (Couple / Duo)</option>
                <option value="3">3 Travelers (Small Family / Friends)</option>
                <option value="4">4 Travelers (Family)</option>
                <option value="6">6+ Travelers (Group Expedition)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Transit, Food & Special Requests */}
        <div className="space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-heading font-bold text-sm flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800 shadow-xs">
              5
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                Transport &amp; Food Preferences <span className="font-normal lowercase text-slate-400 text-sm">(optional)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tailor your Karnataka journey with specific travel modes and cuisine styles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="transport-pref-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Transport Preference <span className="font-normal lowercase text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Bus className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  id="transport-pref-select"
                  aria-label="Transport Preference"
                  value={transportPreference}
                  onChange={(e) => setTransportPreference(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
                >
                  <option value="">Select transport</option>
                  <option value="KSRTC Buses">KSRTC Airavat / Rajahamsa Buses</option>
                  <option value="Vande Bharat & Express Trains">Vande Bharat &amp; Express Trains</option>
                  <option value="Private Cab / Taxi">Private Cab / Chauffeured Car</option>
                  <option value="Self Drive">Self Drive Car / Rental</option>
                  <option value="Mixed Transit">Mixed (Trains + Scenic Ghat Buses)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="food-pref-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Food Preference <span className="font-normal lowercase text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Utensils className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  id="food-pref-select"
                  aria-label="Food Preference"
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
                >
                  <option value="">Select food preference</option>
                  <option value="Pure Vegetarian / Jain">Pure Vegetarian / Jain Friendly (Darshini &amp; Temple Cafes)</option>
                  <option value="South Indian & Local Karnataka">Traditional Karnataka (Akki Roti, Ragi Mudde, Pandi Curry)</option>
                  <option value="Coastal Seafood">Coastal Karnataka &amp; Mangalorean Seafood</option>
                  <option value="Multi-Cuisine">Multi-Cuisine / No Restrictions</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="special-preferences-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Special Requests or Dietary Notes <span className="font-normal lowercase text-slate-400">(optional)</span>
            </label>
            <VoiceSearchInput
              inputId="special-preferences-input"
              value={specialRequirements}
              onChange={setSpecialRequirements}
              onVoiceEnd={(transcript, lang) => handleExtractFromVoice(transcript, lang)}
              placeholder="e.g. Pure vegetarian food, senior-friendly stairs, photography focus..."
              variant="compact"
              showSubmitButton={false}
            />
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Includes real-time KSRTC transit, SWR train timetables, and curated local hotels</span>
          </div>

          <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
            <button
              type="submit"
              disabled={!canPlan || isLoading}
              className={`glow-btn-primary w-full sm:w-auto px-9 py-4 rounded-2xl font-heading font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 ${
                canPlan
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.85)] hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-400/30'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-60'
              }`}
              aria-disabled={!canPlan}
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
                  <span className="text-sm font-semibold">{progressMessage || 'Finding places... Planning day 1... Adding transit.'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Generate AI Travel Itinerary</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            {!canPlan && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Choose a place and trip length to continue.
              </p>
            )}
          </div>
        </div>
      </form>
      </AnimatedSection>

      {/* Bento Grid Features Section */}
      <section id="features" className="space-y-8 pt-6 scroll-mt-24">
        <AnimatedSection duration={0.45} yOffset={24} className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Intelligent Travel Features</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Designed for Authentic Karnataka Wanderlust
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Every route is grounded in real Karnataka state infrastructure, live KSRTC timetables, ASI monument tickets, and vetted local homestays.
          </p>
        </AnimatedSection>

        {/* Bento Grid: 1 col on mobile, bento 3-col on desktop with scroll-triggered animations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bento Tile 1 (2 cols on desktop) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.05,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card rounded-3xl p-8 sm:p-9 lg:col-span-2 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Bus className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Live Timetables
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
                Multi-Modal Transit &amp; Ghat Pass Engine
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Seamlessly connects KSRTC Airavat Club Class volvos, Flybus direct airport coaches, and South Western Railway Express berths. Accurately anticipates mountain hairpins along Shiradi, Charmadi, and Agumbe Ghats.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                BLR ➔ MYS 10-Lane Expressway (2h 15m)
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                Hampi Express (#16592) Overnight Sleeper
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                Mangaluru Coastal Highway KSRTC
              </span>
            </div>
          </motion.div>

          {/* Bento Tile 2 (1 col on desktop) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.12,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card rounded-3xl p-8 sm:p-9 lg:col-span-1 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/70 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Landmark className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  UNESCO Certified
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                UNESCO &amp; Royal Heritage
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Step back into the 14th-century Vijayanagara empire at Hampi, marvel at intricate soapstone carvings of Belur and Halebidu, and witness the golden illuminations of Mysore Palace.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified ASI Timings &amp; Local Guides</span>
            </div>
          </motion.div>

          {/* Bento Tile 3 (1 col on desktop) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.18,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card rounded-3xl p-8 sm:p-9 lg:col-span-1 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Coffee className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Western Ghats
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                Misty Coffee Trails &amp; Stays
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Wander through lush Arabica and Robusta plantations in Madikeri, trek to Mullayanagiri peak in Chikmagalur, and taste authentic pandi curry and akki roti.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Estate Homestays</span>
            </div>
          </motion.div>

          {/* Bento Tile 4 (1 col on desktop) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card rounded-3xl p-8 sm:p-9 lg:col-span-1 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  Multi-Turn AI
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                Gemini Local Concierge
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ask about temple dress protocols, Ghat road monsoon landslide updates, Kannadiga dialect phrases, or authentic vegetarian Darshini eateries.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Interactive Guide with Grounded Tips</span>
            </div>
          </motion.div>

          {/* Bento Tile 5 (1 col on desktop, perfectly completing 3-column second row) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card rounded-3xl p-8 sm:p-9 lg:col-span-1 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/70 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Zero Guesswork
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
                Real-World Tiered Budget Intelligence
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you’re a solo backpacker living in Zostels, a couple savoring coffee estate resorts, or a family booking royal palace suites — all tariffs, meals, and transit costs are transparently detailed in INR with 10% contingency.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Backpacker: ₹1,500 – ₹3,000 / day
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Comfort: ₹4,500 – ₹8,500 / day
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Royal Luxury: ₹15,000+ / day
              </span>
            </div>
          </motion.div>

        </div>
      </section>
      </div>
    </div>
  );
};
