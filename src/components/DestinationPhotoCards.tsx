import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Plane, 
  Train, 
  Check, 
  Plus, 
  Sparkles, 
  Landmark, 
  Compass, 
  ExternalLink,
  ZoomIn
} from 'lucide-react';
import { KARNATAKA_CITIES, KarnatakaCity } from '../data/karnataka-data';

interface DestinationPhotoCardsProps {
  selectedDestinations?: string[];
  onToggleDestination?: (cityName: string) => void;
  onExploreCity?: (city: KarnatakaCity) => void;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export const DestinationPhotoCards: React.FC<DestinationPhotoCardsProps> = ({
  selectedDestinations = [],
  onToggleDestination,
  onExploreCity,
  title = 'Iconic Karnataka Destinations',
  subtitle = 'Discover UNESCO heritage ruins, misty coffee ridges, golden beaches, and ancient rock temples. Hover to explore, click to include in your bespoke itinerary.',
  showFilters = true,
  compact = false
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = [
    'All',
    'South Karnataka',
    'Malenadu / Western Ghats',
    'Coastal Karnataka',
    'North Karnataka / Deccan'
  ];

  const filteredCities = selectedRegion === 'All'
    ? KARNATAKA_CITIES
    : KARNATAKA_CITIES.filter((city) => city.region === selectedRegion);

  return (
    <div className="space-y-6">
      {/* Title & Region Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {title && (
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                {title}
              </h3>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto shrink-0">
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  selectedRegion === region
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600 shadow-xs font-semibold'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-750'
                }`}
              >
                {region === 'Malenadu / Western Ghats' ? 'Western Ghats' : region}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Destination Photo Cards with Image Zoom on Hover */}
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {filteredCities.map((city, idx) => {
          const isSelected = selectedDestinations.includes(city.name);

          return (
            <motion.div
              key={city.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion ? 0 : Math.min(0.24, idx * 0.05),
                ease: [0.22, 1, 0.36, 1]
              }}
              onClick={() => onToggleDestination && onToggleDestination(city.name)}
              className={`group relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                  : 'glass-card border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/50 dark:hover:border-emerald-500/50 hover:shadow-xl'
              }`}
            >
              {/* Photo Container with Hover Zoom */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
                <img
                  src={city.imageUrl}
                  alt={city.imageAlt || `${city.name} scenery and architecture`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform"
                />

                {/* Dark Vignette & Gradient Overlays for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-black/20 pointer-events-none" />

                {/* Top Ribbons: Region Pill + Select Status */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-emerald-300 border border-white/15 shadow-xs">
                    {city.region.split('/')[0]}
                  </span>

                  {onToggleDestination && (
                    <button
                      type="button"
                      aria-label={isSelected ? `Remove ${city.name} from itinerary` : `Add ${city.name} to itinerary`}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md ${
                        isSelected
                          ? 'bg-emerald-600 text-white ring-2 ring-white/80'
                          : 'bg-black/50 text-white/90 hover:bg-emerald-600 hover:text-white border border-white/20'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Bottom Image Overlay: City Name in English & Kannada */}
                <div className="absolute bottom-3.5 left-4 right-4 z-10 flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xl font-extrabold text-white font-heading tracking-tight drop-shadow-md">
                        {city.name}
                      </h4>
                      <span className="text-xs text-amber-300 font-bold opacity-90 drop-shadow-xs">
                        {city.kannadaName}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-100/90 line-clamp-1 mt-0.5 drop-shadow-xs">
                      {city.tagline}
                    </p>
                  </div>

                  {/* Subtle Zoom on Hover Badge */}
                  <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 text-[10px] font-semibold text-white/95 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 flex items-center gap-1 shadow-xs pointer-events-none">
                    <ZoomIn className="w-3 h-3 text-amber-300" />
                    <span>Zoom</span>
                  </span>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {city.description}
                  </p>

                  {/* Highlights Badges */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                      Signature Attractions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {city.popularAttractions.slice(0, 3).map((attraction, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/80 flex items-center gap-1 truncate max-w-full"
                        >
                          <Landmark className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{attraction}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Transit Gateway & Selection Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] gap-2">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                    <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{city.bestMonths.split('(')[0]}</span>
                  </div>

                  {onToggleDestination && (
                    <span className={`font-semibold shrink-0 flex items-center gap-1 ${
                      isSelected 
                        ? 'text-emerald-700 dark:text-emerald-400' 
                        : 'text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'
                    }`}>
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Included</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Plan</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
