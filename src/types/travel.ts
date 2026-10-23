export type BudgetTier = 'budget' | 'comfort' | 'luxury';

export type ExperienceType = 
  | 'heritage_history'
  | 'nature_wildlife'
  | 'coffee_plantations'
  | 'coastal_beaches'
  | 'spiritual_pilgrimage'
  | 'culinary_trail'
  | 'adventure_trekking'
  | 'family_leisure';

export type TransitMode = 'ksrtc_airavat' | 'vande_bharat' | 'express_train' | 'taxi_car' | 'flight' | 'local_auto';

export interface TransitOption {
  mode: TransitMode;
  modeLabel: string;
  provider: string; // e.g., 'KSRTC Airavat Club Class', 'IRCTC / Vande Bharat Exp (20608)', 'Flybus Volvo'
  duration: string; // e.g., '3h 15m'
  frequency: string; // e.g., 'Every 30 mins from Kempegowda Bus Station'
  estimatedCostInr: number;
  bookingPortal: string; // e.g., 'ksrtc.in', 'irctc.co.in'
  proTip: string; // e.g., 'Book window seat on left side for scenic Western Ghats views'
  scheduleHint?: string;
}

export interface HotelRecommendation {
  id: string;
  name: string;
  city: string;
  area: string;
  tier: BudgetTier;
  pricePerNightInr: number;
  rating: number; // e.g., 4.7
  reviewsCount: number;
  badge?: string; // e.g., 'Heritage Palace', 'Coffee Estate Homestay', 'Beachfront'
  amenities: string[];
  description: string;
  bookingTip: string;
  directBookingLink?: string;
}

export interface ActivitySlot {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  timeRange: string; // e.g., '09:00 AM - 11:30 AM'
  title: string;
  location: string;
  description: string;
  entryFeeInr?: number;
  bestTimeToVisit?: string;
  mustTryFoodOrExperience?: string;
  tag?: string; // e.g. 'UNESCO World Heritage', 'Scenic Viewpoint', 'Local Delicacy'
}

export interface DayItinerary {
  dayNumber: number;
  theme: string; // e.g., 'Royal Palaces & Silk Weavers of Mysuru'
  cityOrHub: string;
  highlights: string[];
  activities: ActivitySlot[];
  transitToNext?: TransitOption;
  recommendedStay?: HotelRecommendation;
  localFoodTips: string[];
  weatherAlert?: string;
  isDayLoading?: boolean;
}

export interface TripPlanRequest {
  startingCity: string;
  destinations?: string[];
  durationDays: number;
  interests: string[];
  budgetTier: BudgetTier;
  experienceType: ExperienceType;
  travelersCount: number;
  travelMonth?: string;
  pace?: 'relaxed' | 'moderate' | 'packed';
  specialRequirements?: string;
  transportPreference?: string;
  foodPreference?: string;
}

export interface ItineraryPlan {
  id: string;
  title: string;
  summary: string;
  tagline: string;
  durationDays: number;
  estimatedBudgetInr: {
    total: number;
    perPerson: number;
    breakdown: {
      stays: number;
      transit: number;
      food: number;
      activities: number;
      contingency: number;
    };
  };
  startingCity: string;
  routeStops: string[];
  days: DayItinerary[];
  packingAdvice: string[];
  localPhrases: { kannada: string; english: string; pronunciation: string }[];
  emergencyHelplines: { name: string; contact: string }[];
  isAiGenerated: boolean;
  generatedAt: string;
  isGenerating?: boolean;
  generationProgress?: string;
}

export interface ExtractedVoiceTripDetails {
  destinations: string[];
  durationDays: number;
  budgetTier: BudgetTier;
  travelStyle: ExperienceType;
  travelStyleLabel: string;
  travelersCount: number;
  startingCity: string;
  rawSentence: string;
  summaryExplanation?: string;
  confidence?: 'high' | 'medium' | 'fallback';
}
