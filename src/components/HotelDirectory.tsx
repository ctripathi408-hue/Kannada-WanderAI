import React, { useState } from 'react';
import { Hotel, Star, MapPin, Check, Filter } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedSection } from './AnimatedSection';
import { AnimatedCounter } from './AnimatedCounter';
import { CURATED_HOTELS } from '../data/karnataka-data';

export const HotelDirectory: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');

  const cities = ['All', 'Mysuru', 'Hampi', 'Coorg (Madikeri)', 'Chikmagalur', 'Gokarna'];
  const tiers: { value: string; label: string }[] = [
    { value: 'All', label: 'All Tiers' },
    { value: 'budget', label: 'Budget / Backpacker (Under ₹3k)' },
    { value: 'comfort', label: 'Comfort & Plantation (₹4k - ₹9k)' },
    { value: 'luxury', label: 'Royal Heritage & Luxury (₹10k+)' }
  ];

  const filteredHotels = CURATED_HOTELS.filter((hotel) => {
    const matchesCity = selectedCity === 'All' || hotel.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesTier = selectedTier === 'All' || hotel.tier === selectedTier;
    return matchesCity && matchesTier;
  });

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <AnimatedSection duration={0.45} yOffset={24}>
        <div className="glass-card-dark text-white rounded-3xl p-8 sm:p-12 space-y-4 relative overflow-hidden group">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider border border-emerald-400/30 backdrop-blur-md">
            <Hotel className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Curated Karnataka Accommodations &amp; Stays</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight">
            Palace Suites, Coffee Estate Cottages &amp; Cliff Villas
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
            From genuine Maharaja palaces in Mysuru and 14th-century inspired stone fortresses in Hampi, to treehouse cottages tucked into Coorg coffee estates and cliff-top seaside stays in Gokarna.
          </p>
        </div>
      </AnimatedSection>

      {/* Filter Controls with generous whitespace and soft shadows */}
      <AnimatedSection delay={0.08} duration={0.45} yOffset={24}>
        <div className="glass-card rounded-3xl p-7 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 font-heading">
            <Filter className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Filter Curated Stays</span>
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Showing <AnimatedCounter value={filteredHotels.length} /> verified stays
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Destination / Region
            </label>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    selectedCity === city
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600 shadow-xs font-semibold'
                      : 'bg-slate-50/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/80'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Budget Tier
            </label>
            <div className="flex flex-wrap gap-2">
              {tiers.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSelectedTier(t.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    selectedTier === t.value
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600 shadow-xs font-semibold'
                      : 'bg-slate-50/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </AnimatedSection>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHotels.map((hotel, idx) => (
          <motion.div
            key={hotel.id}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.42,
              delay: shouldReduceMotion ? 0 : Math.min(0.25, idx * 0.06),
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group"
          >
            <div className="p-7 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                      {hotel.city}
                    </span>
                    {hotel.badge && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-lg border border-amber-200/80 dark:border-amber-800/60">
                        {hotel.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 font-heading">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>{hotel.area}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                    <AnimatedCounter value={hotel.pricePerNightInr} prefix="₹" />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">/ night approx</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {hotel.description}
              </p>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hotel.amenities.map((amenity, aIdx) => (
                  <span
                    key={aIdx}
                    className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>

              {/* Booking Tip in accent amber */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200">
                <strong>Insider Booking Tip:</strong> {hotel.bookingTip}
              </div>
            </div>

            <div className="p-4.5 bg-slate-50/70 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{hotel.rating} / 5.0</span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  (<AnimatedCounter value={hotel.reviewsCount} /> reviews)
                </span>
              </div>

              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {hotel.tier} class
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
