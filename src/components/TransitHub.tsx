import React, { useState } from 'react';
import { Bus, Train, Car, Plane, Clock, ArrowRight, ShieldCheck, ExternalLink, MapPin, Fuel, Info, Sparkles, Navigation } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { AnimatedCounter } from './AnimatedCounter';
import { TRANSIT_ROUTES_DATABASE, KARNATAKA_CITIES } from '../data/karnataka-data';
import { TransitOption } from '../types/travel';
import { getEstimatedDistanceKm } from '../utils/travel-calculator';

export const TransitHub: React.FC = () => {
  const [origin, setOrigin] = useState('Bengaluru');
  const [destination, setDestination] = useState('Mysuru');

  const routeKey1 = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
  const routeKey2 = `${destination.toLowerCase()}-${origin.toLowerCase()}`;

  const availableRoutes: TransitOption[] = TRANSIT_ROUTES_DATABASE[routeKey1] || TRANSIT_ROUTES_DATABASE[routeKey2] || [
    {
      mode: 'ksrtc_airavat',
      modeLabel: `KSRTC Airavat Club Class (${origin} ↔ ${destination})`,
      provider: 'Karnataka State Road Transport Corp (KSRTC)',
      duration: `${Math.round(getEstimatedDistanceKm(origin, destination) / 50 * 10) / 10} hrs (~${getEstimatedDistanceKm(origin, destination)} km)`,
      frequency: 'Express departures throughout the day from central bus station',
      estimatedCostInr: Math.round(getEstimatedDistanceKm(origin, destination) * 2.8),
      bookingPortal: 'ksrtc.in',
      proTip: 'Book online on ksrtc.in or official Mobile App to choose preferred seats.'
    },
    {
      mode: 'taxi_car',
      modeLabel: `Highway Cab / Intercity Taxi (${origin} ↔ ${destination})`,
      provider: 'KSTDC Travels / MakeMyTrip / Private Cab',
      duration: `${Math.round(getEstimatedDistanceKm(origin, destination) / 60 * 10) / 10} hrs`,
      frequency: 'On-demand 24/7 private pickup',
      estimatedCostInr: Math.round(getEstimatedDistanceKm(origin, destination) * 16),
      bookingPortal: 'kstdc.co',
      proTip: 'Ideal for groups of 3-4 travelers with luggage. Stop at scenic highway diners.'
    }
  ];

  const distanceKm = getEstimatedDistanceKm(origin, destination);

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Header with Emerald gradient and Poppins heading */}
      <AnimatedSection duration={0.45} yOffset={24}>
        <div className="glass-card-dark text-white rounded-3xl p-8 sm:p-12 space-y-4 relative overflow-hidden group">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider border border-emerald-400/30 backdrop-blur-md">
            <Bus className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Real-Time Karnataka Transit &amp; Transport Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight">
            KSRTC Buses, Vande Bharat Trains &amp; Highway Corridors
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
            Plan seamless travel across Karnataka. Compare high-speed Vande Bharat trains, plush KSRTC Airavat &amp; Ambaari Dream Class Volvo buses, direct airport Flybus connections, and scenic ghat road corridors.
          </p>
        </div>
      </AnimatedSection>

      {/* Transit Statistics Bar with Animated Counters */}
      <AnimatedSection delay={0.05} duration={0.45} yOffset={20}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 sm:p-5 text-center space-y-1.5 group">
            <Bus className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              <AnimatedCounter value={3500} suffix="+" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              KSRTC Daily Services
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-5 text-center space-y-1.5 group">
            <Navigation className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              <AnimatedCounter value={12} suffix=" Scenic" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mountain Ghat Passes
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-5 text-center space-y-1.5 group">
            <Train className="w-5 h-5 mx-auto text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              <AnimatedCounter value={28} suffix="+" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Express &amp; Vande Bharat
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-5 text-center space-y-1.5 group">
            <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              <AnimatedCounter value={100} suffix="%" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              State Tariff Verified
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Transit Route Selector */}
      <AnimatedSection delay={0.08} duration={0.45} yOffset={24}>
        <div className="glass-card rounded-3xl p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Check Transit Between Karnataka Cities</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-2">
            <label htmlFor="transit-origin-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Origin City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                id="transit-origin-select"
                aria-label="Origin City"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
              >
                {KARNATAKA_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center pt-5">
            <button
              type="button"
              onClick={() => {
                const temp = origin;
                setOrigin(destination);
                setDestination(temp);
              }}
              className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Swap Cities"
            >
              <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
            </button>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="transit-destination-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Destination City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                id="transit-destination-select"
                aria-label="Destination City"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/90 text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
              >
                {KARNATAKA_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Route Stats in warm amber and slate neutrals */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Highway Corridor Distance: <strong><AnimatedCounter value={distanceKm} prefix="~" suffix=" km" /></strong></span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="text-slate-600 dark:text-slate-400">
            Official Portals: 
            <a href="https://ksrtc.in" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold ml-1.5 mr-2">ksrtc.in</a>
            <a href="https://irctc.co.in" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">irctc.co.in</a>
          </div>
        </div>
      </div>
      </AnimatedSection>

      {/* Transit Options List */}
      <AnimatedSection delay={0.1} duration={0.45} yOffset={24} className="space-y-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
          Available Transit Options (<AnimatedCounter value={availableRoutes.length} />)
        </h2>

        <div className="grid grid-cols-1 gap-5">
          {availableRoutes.map((opt, idx) => (
            <div
              key={idx}
              className="glass-card rounded-3xl p-7 space-y-5 group"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/60">
                    {opt.mode === 'vande_bharat' || opt.mode === 'express_train' ? (
                      <Train className="w-6 h-6" />
                    ) : opt.mode === 'flight' ? (
                      <Plane className="w-6 h-6" />
                    ) : opt.mode === 'taxi_car' ? (
                      <Car className="w-6 h-6" />
                    ) : (
                      <Bus className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                      {opt.provider}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 font-heading">
                      {opt.modeLabel}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                    <AnimatedCounter value={opt.estimatedCostInr} prefix="₹" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">approx fare / seat</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>{opt.duration}</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60">
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Frequency / Departure</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                    {opt.frequency}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Booking Portal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{opt.bookingPortal}</span>
                  </div>
                  <a
                    href={`https://${opt.bookingPortal}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 transition-colors shadow-xs"
                    title="Book on official portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {opt.scheduleHint && (
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 p-3 rounded-2xl flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span><strong>Schedule Note:</strong> {opt.scheduleHint}</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Local Transit Tip:</strong> {opt.proTip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Transit Logistics Directory */}
      <AnimatedSection delay={0.12} duration={0.45} yOffset={24}>
        <div className="glass-card-subtle rounded-3xl p-8 sm:p-10 space-y-4 text-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-heading">
            Essential Karnataka Travel Logistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-1.5">
              <strong className="text-slate-900 dark:text-white block font-bold font-heading">KSRTC Flybus from BLR Airport</strong>
              <p className="leading-relaxed">Direct Volvo Multi-Axle buses connect Kempegowda Airport directly to Mysuru (every 1.5h) and Madikeri without entering central Bangalore traffic.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-1.5">
              <strong className="text-slate-900 dark:text-white block font-bold font-heading">Bengaluru-Mysuru Expressway</strong>
              <p className="leading-relaxed">Access-controlled 10-lane expressway with 100 km/h speed limit. Tolls payable via FASTag. Note: Two-wheelers and three-wheelers are prohibited.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-1.5">
              <strong className="text-slate-900 dark:text-white block font-bold font-heading">Western Ghats Rail (Sakleshpur to Subrahmanya)</strong>
              <p className="leading-relaxed">The green route across 57 tunnels and dozens of railway viaducts. Book window seats on the day express or the Panchaganga overnight express.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-1.5">
              <strong className="text-slate-900 dark:text-white block font-bold font-heading">Hampi Night Trains</strong>
              <p className="leading-relaxed">Hampi Express (Train #16592) and Golgumbaz Express provide convenient overnight sleeper journeys right into Hosapete Junction (12km from ruins).</p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};
