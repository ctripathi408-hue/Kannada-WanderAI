import { BudgetTier, TransitOption } from '../types/travel.ts';
import { TRANSIT_ROUTES_DATABASE } from '../data/karnataka-data.ts';

export interface BudgetBreakdown {
  total: number;
  perPerson: number;
  breakdown: {
    stays: number;
    transit: number;
    food: number;
    activities: number;
    contingency: number;
  };
}

export function calculateEstimatedBudget(
  days: number,
  tier: BudgetTier,
  travelers: number = 2
): BudgetBreakdown {
  const safeDays = Math.max(1, days);
  const safeTravelers = Math.max(1, travelers);
  const roomsNeeded = Math.ceil(safeTravelers / 2);

  let stayCostPerRoomPerNight = 1800;
  let foodCostPerPersonPerDay = 700;
  let transitCostPerPersonPerDay = 500;
  let activityCostPerPersonPerDay = 350;

  if (tier === 'comfort') {
    stayCostPerRoomPerNight = 5500;
    foodCostPerPersonPerDay = 1400;
    transitCostPerPersonPerDay = 900;
    activityCostPerPersonPerDay = 600;
  } else if (tier === 'luxury') {
    stayCostPerRoomPerNight = 16500;
    foodCostPerPersonPerDay = 3200;
    transitCostPerPersonPerDay = 2200;
    activityCostPerPersonPerDay = 1200;
  }

  const nights = Math.max(1, safeDays - 1);
  const totalStays = nights * roomsNeeded * stayCostPerRoomPerNight;
  const totalFood = safeDays * safeTravelers * foodCostPerPersonPerDay;
  const totalTransit = safeDays * safeTravelers * transitCostPerPersonPerDay;
  const totalActivities = safeDays * safeTravelers * activityCostPerPersonPerDay;

  const subtotal = totalStays + totalFood + totalTransit + totalActivities;
  const contingency = Math.round(subtotal * 0.1);
  const total = subtotal + contingency;

  return {
    total,
    perPerson: Math.round(total / safeTravelers),
    breakdown: {
      stays: totalStays,
      transit: totalTransit,
      food: totalFood,
      activities: totalActivities,
      contingency
    }
  };
}

const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  'bengaluru': { 'mysuru': 145, 'hampi': 345, 'coorg': 265, 'chikmagalur': 245, 'gokarna': 485, 'udupi': 400 },
  'mysuru': { 'bengaluru': 145, 'coorg': 120, 'kabini': 65, 'chikmagalur': 175, 'hampi': 410 },
  'coorg': { 'bengaluru': 265, 'mysuru': 120, 'chikmagalur': 150, 'mangalore': 135, 'udupi': 190 },
  'chikmagalur': { 'bengaluru': 245, 'mysuru': 175, 'coorg': 150, 'hampi': 270, 'udupi': 165 },
  'hampi': { 'bengaluru': 345, 'mysuru': 410, 'badami': 140, 'chikmagalur': 270, 'goa': 310 },
  'gokarna': { 'bengaluru': 485, 'udupi': 175, 'murudeshwar': 78, 'hampi': 310, 'goa': 140 },
  'udupi': { 'bengaluru': 400, 'gokarna': 175, 'chikmagalur': 165, 'coorg': 190, 'mysuru': 305 }
};

export function getEstimatedDistanceKm(origin: string, destination: string): number {
  const normOrigin = origin.toLowerCase().replace(/[^a-z]/g, '');
  const normDest = destination.toLowerCase().replace(/[^a-z]/g, '');

  if (normOrigin === normDest) return 0;

  for (const [key1, targets] of Object.entries(DISTANCE_MATRIX)) {
    if (normOrigin.includes(key1) || key1.includes(normOrigin)) {
      for (const [key2, km] of Object.entries(targets)) {
        if (normDest.includes(key2) || key2.includes(normDest)) {
          return km;
        }
      }
    }
  }

  // Fallback average intra-Karnataka distance
  return 220;
}

export function getSeasonalWeatherAdvice(destination: string, month: number): {
  seasonName: string;
  isPeakSeason: boolean;
  clothingTip: string;
  summary: string;
} {
  const norm = destination.toLowerCase();
  const safeMonth = Math.min(12, Math.max(1, month)); // 1 = Jan, 12 = Dec

  const isWesternGhats = norm.includes('coorg') || norm.includes('chikmagalur') || norm.includes('western ghats') || norm.includes('sakleshpur');
  const isNorthKarnataka = norm.includes('hampi') || norm.includes('badami') || norm.includes('pattadakal') || norm.includes('bijapur');
  const isCoast = norm.includes('gokarna') || norm.includes('udupi') || norm.includes('malpe') || norm.includes('karwar');

  if (isWesternGhats) {
    if (safeMonth >= 6 && safeMonth <= 8) {
      return {
        seasonName: 'Southwest Monsoon (Dense Rains)',
        isPeakSeason: false,
        clothingTip: 'Waterproof jackets, quick-dry pants, waterproof footwear, leech socks for plantation trails.',
        summary: 'Lush emerald green vistas, roaring waterfalls, misty coffee hills. Expect sudden heavy showers.'
      };
    } else if (safeMonth >= 10 || safeMonth <= 2) {
      return {
        seasonName: 'Post-Monsoon & Winter (Best Time)',
        isPeakSeason: true,
        clothingTip: 'Light woollens for early mornings (14°C - 16°C), breathable daytime cottons.',
        summary: 'Crisp mountain air, coffee blossoms budding, clear blue skies perfect for Mullayanagiri & Raja’s Seat.'
      };
    } else {
      return {
        seasonName: 'Spring & Summer Warmth',
        isPeakSeason: false,
        clothingTip: 'Light cotton shirts, sun hats, polarized sunglasses.',
        summary: 'Pleasant mornings with mild midday warmth (28°C - 32°C). Less crowded.'
      };
    }
  }

  if (isNorthKarnataka) {
    if (safeMonth >= 3 && safeMonth <= 5) {
      return {
        seasonName: 'Deccan Summer (Dry & Hot)',
        isPeakSeason: false,
        clothingTip: 'Ultra-light breathable cottons, wide-brim sun hats, UV protection sunscreen.',
        summary: 'Afternoon temperatures can cross 38°C - 42°C. Schedule monument visits for early sunrise (06:00-09:30 AM) and late evening.'
      };
    } else if (safeMonth >= 10 || safeMonth <= 2) {
      return {
        seasonName: 'Winter Heritage Season (Optimal)',
        isPeakSeason: true,
        clothingTip: 'Comfortable trekking shoes for boulder climbs, light shawl for evening breeze.',
        summary: 'Pleasant daytime temperatures (26°C - 29°C) and cool starry nights over the Tungabhadra river.'
      };
    } else {
      return {
        seasonName: 'Monsoon Revival',
        isPeakSeason: false,
        clothingTip: 'Good grip rubber-soled shoes for wet boulders, compact umbrella.',
        summary: 'Moderate rainfall paints the granite ruins with fresh green moss and Tungabhadra runs full.'
      };
    }
  }

  if (isCoast) {
    if (safeMonth >= 6 && safeMonth <= 8) {
      return {
        seasonName: 'Rough Monsoon Seas',
        isPeakSeason: false,
        clothingTip: 'Raincoat, slippers/crocs, windbreakers.',
        summary: 'Sea is turbulent; beach swimming and watersports suspended. Dramatic coastal waves and lush inland palm groves.'
      };
    } else {
      return {
        seasonName: 'Golden Beach Season',
        isPeakSeason: true,
        clothingTip: 'Beachwear, linen shirts, sun protection, sandals.',
        summary: 'Gentle sea breezes, golden sunsets at Om Beach, vibrant beach shacks serving fresh coastal cuisine.'
      };
    }
  }

  // Default Bengaluru / South Karnataka
  return {
    seasonName: 'Pleasant Plateau Weather',
    isPeakSeason: true,
    clothingTip: 'Comfortable casuals; light jacket for evening breeze.',
    summary: 'Temperate climate typical of Bengaluru and Mysuru plateau (20°C - 28°C).'
  };
}

export function validateItinerary(plan: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!plan) {
    return { valid: false, errors: ['Plan object is null or undefined'] };
  }

  if (!plan.title || typeof plan.title !== 'string' || plan.title.trim().length === 0) {
    errors.push('Itinerary missing title');
  }

  if (!plan.durationDays || typeof plan.durationDays !== 'number' || plan.durationDays <= 0) {
    errors.push('Itinerary has invalid durationDays');
  }

  if (!Array.isArray(plan.days) || plan.days.length === 0) {
    errors.push('Itinerary must contain at least one day plan');
  } else {
    plan.days.forEach((day: any, idx: number) => {
      if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
        errors.push(`Day ${idx + 1} has no activities`);
      }
    });
  }

  if (!plan.estimatedBudgetInr || typeof plan.estimatedBudgetInr.total !== 'number' || plan.estimatedBudgetInr.total <= 0) {
    errors.push('Itinerary missing valid budget estimation');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getTransitRecommendation(origin: string, destination: string): TransitOption {
  const key1 = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
  const key2 = `${destination.toLowerCase()}-${origin.toLowerCase()}`;

  const match = TRANSIT_ROUTES_DATABASE[key1] || TRANSIT_ROUTES_DATABASE[key2];
  if (match && match.length > 0) {
    return match[0];
  }

  const distance = getEstimatedDistanceKm(origin, destination);
  const approxHours = Math.max(1.5, Math.round((distance / 50) * 10) / 10);

  return {
    mode: 'ksrtc_airavat',
    modeLabel: `KSRTC Airavat / Rajahamsa Deluxe (${origin} to ${destination})`,
    provider: 'KSRTC (Karnataka State Road Transport)',
    duration: `${approxHours} hrs (~${distance} km)`,
    frequency: 'Regular express schedules daily from central bus station',
    estimatedCostInr: Math.round(distance * 2.5),
    bookingPortal: 'ksrtc.in',
    proTip: 'Book online via ksrtc.in or official KSRTC app for reserved window seats.'
  };
}
