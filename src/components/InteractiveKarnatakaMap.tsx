import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';

declare const google: any;
import { 
  MapPin, 
  Sparkles, 
  Navigation, 
  Landmark, 
  Trees, 
  Coffee, 
  Waves, 
  ShieldCheck, 
  Calendar, 
  Train, 
  Bus, 
  X, 
  Check, 
  Compass, 
  ArrowRight,
  Layers,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KARNATAKA_CITIES, KarnatakaCity } from '../data/karnataka-data';
import { ItineraryPlan } from '../types/travel';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBAbac4aGGuoZjEDCAzz7ehWF0JXPhM02Q';

export interface DestinationGeoPoint {
  id: string;
  name: string;
  kannadaName: string;
  lat: number;
  lng: number;
  category: 'heritage' | 'ghats' | 'coffee' | 'coastal' | 'wildlife' | 'capital';
  tagline: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  bestSeason: string;
}

export const KARNATAKA_GEO_DESTINATIONS: DestinationGeoPoint[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    kannadaName: 'ಬೆಂಗಳೂರು',
    lat: 12.9716,
    lng: 77.5946,
    category: 'capital',
    tagline: 'Capital Hub & Garden City',
    description: 'Cosmopolitan gateway with Lalbagh, Bangalore Palace, craft breweries, and premier transit connections.',
    highlights: ['Lalbagh Botanical Garden', 'Bangalore Palace', 'Vidhana Soudha', 'Cubbon Park'],
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – Mar (Year-round pleasant)'
  },
  {
    id: 'mysuru',
    name: 'Mysuru',
    kannadaName: 'ಮೈಸೂರು',
    lat: 12.2958,
    lng: 76.6394,
    category: 'heritage',
    tagline: 'City of Palaces & Royal Heritage',
    description: 'Golden illuminated Amba Vilas Palace, silk weaving looms, Devaraja Market scents, and Chamundi Hill.',
    highlights: ['Mysore Palace', 'Chamundi Hill', 'Devaraja Market', 'St. Philomena Cathedral'],
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Sep – Mar (Dasara in Oct)'
  },
  {
    id: 'hampi',
    name: 'Hampi',
    kannadaName: 'ಹಂಪಿ',
    lat: 15.3350,
    lng: 76.4600,
    category: 'heritage',
    tagline: 'UNESCO Bouldered Wonder of Vijayanagara',
    description: '14th-century capital of the Vijayanagara Empire with monolithic shrines, Tungabhadra riverbanks, and granite peaks.',
    highlights: ['Virupaksha Temple', 'Stone Chariot & Vittala', 'Matanga Hill', 'Lotus Mahal'],
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f443b794?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – Mar'
  },
  {
    id: 'coorg',
    name: 'Coorg (Madikeri)',
    kannadaName: 'ಕೊಡಗು (ಮಡಿಕೇರಿ)',
    lat: 12.4244,
    lng: 75.7382,
    category: 'coffee',
    tagline: 'Scotland of India & Misty Coffee Estates',
    description: 'Sprawling Arabica coffee plantations, Abbey Falls, Dubare elephant camp, and authentic Kodava homestays.',
    highlights: ['Abbey Falls', 'Dubare Elephant Camp', 'Raja’s Seat', 'Coffee Estate Trails'],
    imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – Apr'
  },
  {
    id: 'gokarna',
    name: 'Gokarna',
    kannadaName: 'ಗೋಕರ್ಣ',
    lat: 14.5479,
    lng: 74.3188,
    category: 'coastal',
    tagline: 'Pristine Om Beach & Coastal Cliffs',
    description: 'Sacred Mahabaleshwar temple meets Arabian Sea coast with dramatic five-beach cliff trails and beachside cafes.',
    highlights: ['Om Beach', 'Kudle Beach', 'Mahabaleshwar Temple', 'Half Moon Beach Cliff Trek'],
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – Mar'
  },
  {
    id: 'chikmagalur',
    name: 'Chikmagalur',
    kannadaName: 'ಚಿಕ್ಕಮಗಳೂರು',
    lat: 13.3153,
    lng: 75.7754,
    category: 'coffee',
    tagline: 'Cradle of Indian Coffee & Mullayanagiri',
    description: 'Home of Baba Budan who brought first coffee seeds to India; highest peak in Karnataka and lush green shola forests.',
    highlights: ['Mullayanagiri Peak', 'Baba Budangiri', 'Hebbe Falls', 'Coffee Museum'],
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Sep – Apr'
  },
  {
    id: 'badami',
    name: 'Badami & Pattadakal',
    kannadaName: 'ಬಾದಾಮಿ ಮತ್ತು ಪಟ್ಟದಕಲ್ಲು',
    lat: 15.9187,
    lng: 75.6766,
    category: 'heritage',
    tagline: 'Chalukya Rock-Cut Cave Architecture',
    description: '6th-century red sandstone rock-cut cave temples overlooking Agastya Lake and UNESCO monument complex at Pattadakal.',
    highlights: ['Badami Cave Temples', 'Agastya Lake', 'Pattadakal UNESCO Temples', 'Aihole'],
    imageUrl: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – Mar'
  },
  {
    id: 'udupi',
    name: 'Udupi & Malpe',
    kannadaName: 'ಉಡುಪಿ ಮತ್ತು ಮಲ್ಪೆ',
    lat: 13.3409,
    lng: 74.7421,
    category: 'coastal',
    tagline: 'Krishna Temple & St. Mary’s Basalt Islands',
    description: 'Historic Sri Krishna Matha, authentic Udupi vegetarian gastronomy, and columnar hexagonal basalt islands at Malpe.',
    highlights: ['Sri Krishna Matha', 'St. Mary’s Islands', 'Malpe Sea Walk', 'Kaup Lighthouse'],
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – Mar'
  },
  {
    id: 'kabini',
    name: 'Kabini & Nagarhole',
    kannadaName: 'ಕಬಿನಿ ಮತ್ತು ನಾಗರಹೊಳೆ',
    lat: 11.9542,
    lng: 76.3533,
    category: 'wildlife',
    tagline: 'Tiger Reserve & Forest Boat Safaris',
    description: 'Premier wildlife sanctuary with one of the highest densities of Bengal tigers, leopards, and Asiatic elephant herds.',
    highlights: ['Kabini River Boat Safari', 'Nagarhole Jungle Safari', 'Bird Watching Coracle Ride'],
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – May'
  },
  {
    id: 'dandeli',
    name: 'Dandeli',
    kannadaName: 'ದಾಂಡೇಲಿ',
    lat: 15.2361,
    lng: 74.6173,
    category: 'ghats',
    tagline: 'Kali River Whitewater & Hornbill Canopy',
    description: 'Dense rainforest wilderness in the Western Ghats with Kali river rafting, black panthers, and canopy walks.',
    highlights: ['Kali River Rafting', 'Syntheri Rocks', 'Kavala Caves', 'Hornbill Viewpoint'],
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
    bestSeason: 'Oct – May'
  }
];

// Helper to fit map bounds to stops
function MapBoundsFitter({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  const coreLib = useMapsLibrary('core');

  useEffect(() => {
    if (!map || points.length === 0) return;

    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(10);
      return;
    }

    const LatLngBoundsClass = coreLib?.LatLngBounds || (typeof google !== 'undefined' ? google.maps.LatLngBounds : null);
    if (!LatLngBoundsClass) return;

    const bounds = new LatLngBoundsClass();
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [map, points, coreLib]);

  return null;
}

// Helper to draw connecting line between route stops
function RoutePolyline({ stops }: { stops: { lat: number; lng: number }[] }) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || stops.length < 2) return;

    const PolylineClass = mapsLib?.Polyline || (typeof google !== 'undefined' ? google.maps.Polyline : null);
    if (!PolylineClass) return;

    const polyline = new PolylineClass({
      path: stops,
      geodesic: true,
      strokeColor: '#059669', // Emerald-600
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: map
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, stops, mapsLib]);

  return null;
}

interface InteractiveKarnatakaMapProps {
  currentPlan?: ItineraryPlan | null;
  selectedDestinations?: string[];
  onSelectDestination?: (destName: string) => void;
  className?: string;
  height?: string;
}

export const InteractiveKarnatakaMap: React.FC<InteractiveKarnatakaMapProps> = ({
  currentPlan,
  selectedDestinations = [],
  onSelectDestination,
  className = '',
  height = '620px'
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'selected' | 'heritage' | 'coffee' | 'coastal' | 'wildlife'>(
    selectedDestinations.length > 0 && !currentPlan ? 'selected' : 'all'
  );
  const [selectedDest, setSelectedDest] = useState<DestinationGeoPoint | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'destinations' | 'itinerary_route'>('destinations');

  // Map route stops if an itinerary plan is provided
  const itineraryStops = useMemo(() => {
    if (!currentPlan || !currentPlan.routeStops) return [];
    return currentPlan.routeStops
      .map((stopName, idx) => {
        const found = KARNATAKA_GEO_DESTINATIONS.find((d) =>
          d.name.toLowerCase().includes(stopName.toLowerCase()) ||
          stopName.toLowerCase().includes(d.name.toLowerCase())
        );
        if (found) {
          return { ...found, sequenceNumber: idx + 1 };
        }
        return null;
      })
      .filter((s): s is (DestinationGeoPoint & { sequenceNumber: number }) => s !== null);
  }, [currentPlan]);

  const filteredDestinations = useMemo(() => {
    if (activeTabMode === 'itinerary_route' && itineraryStops.length > 0) {
      return itineraryStops;
    }
    if (selectedFilter === 'selected' && selectedDestinations && selectedDestinations.length > 0) {
      const matched = KARNATAKA_GEO_DESTINATIONS.filter((d) =>
        selectedDestinations.some(sd => sd.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(sd.toLowerCase()))
      );
      return matched.length > 0 ? matched : KARNATAKA_GEO_DESTINATIONS;
    }
    if (selectedFilter === 'all') return KARNATAKA_GEO_DESTINATIONS;
    return KARNATAKA_GEO_DESTINATIONS.filter((d) => d.category === selectedFilter);
  }, [selectedFilter, activeTabMode, itineraryStops, selectedDestinations]);

  const activePointsForBounds = useMemo(() => {
    return filteredDestinations.map((d) => ({ lat: d.lat, lng: d.lng }));
  }, [filteredDestinations]);

  const getPinColor = (category: string) => {
    switch (category) {
      case 'heritage':
        return { background: '#D97706', glyphColor: '#FFFFFF', borderColor: '#78350F' }; // Amber
      case 'coffee':
        return { background: '#059669', glyphColor: '#FFFFFF', borderColor: '#064E3B' }; // Emerald
      case 'coastal':
        return { background: '#0284C7', glyphColor: '#FFFFFF', borderColor: '#0369A1' }; // Sky
      case 'wildlife':
        return { background: '#0D9488', glyphColor: '#FFFFFF', borderColor: '#115E59' }; // Teal
      case 'capital':
        return { background: '#7C3AED', glyphColor: '#FFFFFF', borderColor: '#4C1D95' }; // Violet
      default:
        return { background: '#10B981', glyphColor: '#FFFFFF', borderColor: '#047857' };
    }
  };

  return (
    <div className={`w-full flex flex-col space-y-4 ${className}`}>
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Interactive Karnataka Route &amp; Destination Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by Google Maps Platform • Explore 10 UNESCO ruins, Ghats, coastlines &amp; stays
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {currentPlan && (
            <button
              type="button"
              onClick={() => setActiveTabMode(activeTabMode === 'itinerary_route' ? 'destinations' : 'itinerary_route')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'itinerary_route'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Itinerary Route ({currentPlan.durationDays} Days)</span>
            </button>
          )}

          {selectedDestinations.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTabMode('destinations');
                setSelectedFilter('selected');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'destinations' && selectedFilter === 'selected'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Selected ({selectedDestinations.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveTabMode('destinations');
              setSelectedFilter('all');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTabMode === 'destinations' && selectedFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Destinations
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTabMode('destinations');
              setSelectedFilter('heritage');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTabMode === 'destinations' && selectedFilter === 'heritage'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Landmark className="w-3 h-3 text-amber-500" />
            <span>Heritage</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTabMode('destinations');
              setSelectedFilter('coffee');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTabMode === 'destinations' && selectedFilter === 'coffee'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-3 h-3 text-emerald-500" />
            <span>Coffee Hills</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTabMode('destinations');
              setSelectedFilter('coastal');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTabMode === 'destinations' && selectedFilter === 'coastal'
                ? 'bg-sky-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Waves className="w-3 h-3 text-sky-500" />
            <span>Coastal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTabMode('destinations');
              setSelectedFilter('wildlife');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTabMode === 'destinations' && selectedFilter === 'wildlife'
                ? 'bg-teal-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-teal-500" />
            <span>Wildlife</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl bg-slate-950"
        style={{ height }}
      >
        <APIProvider
          apiKey={GOOGLE_MAPS_API_KEY}
          libraries={['marker', 'routes']}
          language="en"
          region="IN"
        >
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat: 14.1, lng: 75.8 }}
            defaultZoom={7}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Auto fit map bounds */}
            <MapBoundsFitter points={activePointsForBounds} />

            {/* Connecting Polyline for active route */}
            {activeTabMode === 'itinerary_route' && itineraryStops.length > 1 && (
              <RoutePolyline stops={itineraryStops.map((s) => ({ lat: s.lat, lng: s.lng }))} />
            )}

            {/* Advanced Markers */}
            {filteredDestinations.map((dest) => {
              const pinStyle = getPinColor(dest.category);
              const seq = (dest as any).sequenceNumber;

              return (
                <AdvancedMarker
                  key={dest.id}
                  position={{ lat: dest.lat, lng: dest.lng }}
                  onClick={() => setSelectedDest(dest)}
                  title={`${dest.name} (${dest.kannadaName})`}
                >
                  <Pin
                    background={pinStyle.background}
                    glyphColor={pinStyle.glyphColor}
                    borderColor={pinStyle.borderColor}
                    scale={seq ? 1.25 : 1.05}
                  >
                    {seq ? (
                      <span className="text-[11px] font-bold text-white leading-none">{seq}</span>
                    ) : null}
                  </Pin>
                </AdvancedMarker>
              );
            })}

            {/* Selected Destination InfoWindow */}
            {selectedDest && (
              <InfoWindow
                position={{ lat: selectedDest.lat, lng: selectedDest.lng }}
                onCloseClick={() => setSelectedDest(null)}
                maxWidth={320}
              >
                <div className="p-1 space-y-2.5 text-slate-900 dark:text-slate-100">
                  <div className="relative h-28 w-full rounded-xl overflow-hidden shadow-xs">
                    <img
                      src={selectedDest.imageUrl}
                      alt={selectedDest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-white">
                      <div className="text-xs text-amber-300 font-bold">{selectedDest.kannadaName}</div>
                      <div className="text-base font-bold font-heading">{selectedDest.name}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedDest.description}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Key Highlights:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDest.highlights.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      Best: {selectedDest.bestSeason.split('(')[0]}
                    </span>

                    {onSelectDestination && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDestination(selectedDest.name);
                          setSelectedDest(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Plan Here</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Legend / Overlay Badge */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 text-white text-xs shadow-lg">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Heritage</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Coffee Estates</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Coastal Cliffs</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Wildlife Tigers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
