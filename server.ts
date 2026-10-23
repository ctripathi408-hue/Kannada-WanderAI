import express, { Request, Response } from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { CLASSIC_ITINERARIES, CURATED_HOTELS, KARNATAKA_CITIES, TRANSIT_ROUTES_DATABASE } from './src/data/karnataka-data.ts';
import { calculateEstimatedBudget, getSeasonalWeatherAdvice, getTransitRecommendation } from './src/utils/travel-calculator.ts';
import type { ItineraryPlan, TripPlanRequest, BudgetTier, ExperienceType, ExtractedVoiceTripDetails } from './src/types/travel.ts';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

// Shared server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Fallback generator when API key is unavailable or quota is exceeded
function generateDeterministicItinerary(reqBody: TripPlanRequest): ItineraryPlan {
  const duration = Math.min(14, Math.max(1, reqBody.durationDays || 3));
  const budgetTier = reqBody.budgetTier || 'comfort';
  const travelers = reqBody.travelersCount || 2;
  const startingCity = reqBody.startingCity || 'Bengaluru';
  const experienceType = reqBody.experienceType || 'heritage_history';

  // Check if matches classic archetype
  if (duration >= 5 && (reqBody.interests?.includes('Coffee & Plantation Trails') || experienceType === 'coffee_plantations')) {
    const classic = CLASSIC_ITINERARIES.find(c => c.id === 'karnataka-misty-ghats');
    if (classic) {
      return {
        ...classic,
        id: `plan-${Date.now()}`,
        startingCity,
        estimatedBudgetInr: calculateEstimatedBudget(classic.durationDays, budgetTier, travelers),
        isAiGenerated: false,
        generatedAt: new Date().toISOString()
      };
    }
  }

  const classicHeritage = CLASSIC_ITINERARIES.find(c => c.id === 'karnataka-classic-heritage');
  if (classicHeritage && duration >= 6) {
    return {
      ...classicHeritage,
      id: `plan-${Date.now()}`,
      startingCity,
      estimatedBudgetInr: calculateEstimatedBudget(classicHeritage.durationDays, budgetTier, travelers),
      isAiGenerated: false,
      generatedAt: new Date().toISOString()
    };
  }

  // Synthesize tailored day-by-day plan using Karnataka database
  const selectedDestinations: string[] = reqBody.destinations && reqBody.destinations.length > 0 
    ? reqBody.destinations 
    : ['Mysuru', 'Coorg (Madikeri)', 'Hampi', 'Gokarna', 'Chikmagalur'];

  const days = [];
  const routeStops = [startingCity];

  for (let i = 1; i <= duration; i++) {
    const targetCityName = selectedDestinations[(i - 1) % selectedDestinations.length];
    const cityInfo = KARNATAKA_CITIES.find(c => targetCityName.toLowerCase().includes(c.name.toLowerCase())) || KARNATAKA_CITIES[1];
    
    if (!routeStops.includes(cityInfo.name)) {
      routeStops.push(cityInfo.name);
    }

    const cityHotels = CURATED_HOTELS.filter(h => h.city.toLowerCase().includes(cityInfo.name.toLowerCase()));
    const matchingHotel = cityHotels.find(h => h.tier === budgetTier) || cityHotels[0] || CURATED_HOTELS[0];

    const prevStop = i === 1 ? startingCity : (routeStops[routeStops.length - 2] || startingCity);
    const transit = getTransitRecommendation(prevStop, cityInfo.name);

    days.push({
      dayNumber: i,
      theme: `Day ${i}: ${cityInfo.tagline} in ${cityInfo.name}`,
      cityOrHub: cityInfo.name,
      highlights: cityInfo.popularAttractions.slice(0, 3),
      activities: [
        {
          timeSlot: 'Morning' as const,
          timeRange: '08:30 AM - 11:30 AM',
          title: `Explore ${cityInfo.popularAttractions[0] || 'Historic Center'}`,
          location: cityInfo.name,
          description: `Begin your morning taking in the cultural essence and architecture of ${cityInfo.name}.`,
          entryFeeInr: 50,
          bestTimeToVisit: 'Early morning to avoid queues and midday heat',
          tag: 'Key Monument'
        },
        {
          timeSlot: 'Afternoon' as const,
          timeRange: '02:00 PM - 05:00 PM',
          title: `Discover ${cityInfo.popularAttractions[1] || 'Scenic Viewpoint'}`,
          location: cityInfo.name,
          description: `After a traditional lunch, experience local craft traditions and scenic landscapes.`,
          entryFeeInr: 30,
          tag: 'Scenic & Culture'
        },
        {
          timeSlot: 'Evening' as const,
          timeRange: '06:00 PM - 08:30 PM',
          title: `Bazaar Stroll & Sunset at ${cityInfo.popularAttractions[2] || 'Promenade'}`,
          location: cityInfo.name,
          description: `Wind down with local delicacies, temple bells, and scenic evening views.`,
          entryFeeInr: 0,
          mustTryFoodOrExperience: `Traditional ${cityInfo.name} specialty treats`,
          tag: 'Evening Leisure'
        }
      ],
      recommendedStay: matchingHotel,
      localFoodTips: [`Authentic South Karnataka filter coffee & hot snacks`, `Local thali with fresh regional seasonal produce`],
      transitToNext: transit
    });
  }

  const budget = calculateEstimatedBudget(duration, budgetTier, travelers);
  const weather = getSeasonalWeatherAdvice(selectedDestinations[0] || startingCity, 10);

  return {
    id: `plan-${Date.now()}`,
    title: `${duration}-Day Personalized Karnataka ${experienceType.replace(/_/g, ' ').toUpperCase()} Odyssey`,
    tagline: `Curated ${budgetTier} journey across ${routeStops.join(' → ')}`,
    summary: `A balanced itinerary tailored for ${travelers} traveler(s), optimizing travel time, heritage wonders, local food, and vetted accommodations across Karnataka.`,
    durationDays: duration,
    startingCity,
    routeStops,
    estimatedBudgetInr: budget,
    days,
    packingAdvice: [
      weather.clothingTip,
      'Comfortable walking/hiking footwear for temple complexes and viewpoints',
      'Modest shoulders & knees clothing for sacred sanctuaries',
      'Refillable insulated water bottle and personal medications'
    ],
    localPhrases: [
      { kannada: 'Namaskara', english: 'Hello / Greetings', pronunciation: 'Nah-mas-KAH-rah' },
      { kannada: 'Dhanyavada', english: 'Thank you', pronunciation: 'Dhahn-yah-VAH-dah' },
      { kannada: 'Idhu tumba chennagide', english: 'This is very good', pronunciation: 'Ee-dhoo toom-bah chen-nah-gee-deh' },
      { kannada: 'Eshtu aagutthe?', english: 'How much does it cost?', pronunciation: 'Esh-too ah-GOO-teh?' }
    ],
    emergencyHelplines: [
      { name: 'Karnataka Police Helpline', contact: '112' },
      { name: 'KSRTC 24/7 Helpline', contact: '080-49596666' },
      { name: 'Medical Emergency', contact: '108' }
    ],
    isAiGenerated: false,
    generatedAt: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// Itinerary Caching & Fast Parallel Streaming Engine
// -------------------------------------------------------------

const itineraryCache = new Map<string, ItineraryPlan>();

function getItineraryCacheKey(req: TripPlanRequest): string {
  const places = (req.destinations || []).slice().sort().join(',').toLowerCase();
  const start = (req.startingCity || 'bengaluru').toLowerCase();
  const duration = Math.min(14, Math.max(1, req.durationDays || 3));
  const budget = req.budgetTier || 'comfort';
  const exp = req.experienceType || 'heritage_history';
  const pace = req.pace || 'moderate';
  const travelers = req.travelersCount || 2;
  const month = (req.travelMonth || '').toLowerCase();
  const style = (req.transportPreference || '').toLowerCase();
  const food = (req.foodPreference || '').toLowerCase();
  return `${start}|${places}|${duration}|${budget}|${exp}|${pace}|${travelers}|${month}|${style}|${food}`;
}

function getFallbackDay(
  dayNumber: number,
  cityOrHub: string,
  budgetTier: BudgetTier,
  prevCity: string
): any {
  const cityInfo = KARNATAKA_CITIES.find(c => cityOrHub.toLowerCase().includes(c.name.toLowerCase())) || KARNATAKA_CITIES[1];
  const cityHotels = CURATED_HOTELS.filter(h => h.city.toLowerCase().includes(cityInfo.name.toLowerCase()));
  const matchingHotel = cityHotels.find(h => h.tier === budgetTier) || cityHotels[0] || CURATED_HOTELS[0];
  const transit = getTransitRecommendation(prevCity || 'Bengaluru', cityInfo.name);

  return {
    dayNumber,
    theme: `Day ${dayNumber}: ${cityInfo.tagline} in ${cityInfo.name}`,
    cityOrHub: cityInfo.name,
    highlights: cityInfo.popularAttractions.slice(0, 3),
    activities: [
      {
        timeSlot: 'Morning',
        timeRange: '08:30 AM - 11:30 AM',
        title: `Explore ${cityInfo.popularAttractions[0] || 'Historic Center'}`,
        location: cityInfo.name,
        description: `Begin your morning taking in the cultural essence and architecture of ${cityInfo.name}.`,
        entryFeeInr: 50,
        bestTimeToVisit: 'Early morning to avoid queues',
        tag: 'Heritage'
      },
      {
        timeSlot: 'Afternoon',
        timeRange: '02:00 PM - 05:00 PM',
        title: `Discover ${cityInfo.popularAttractions[1] || 'Scenic Viewpoint'}`,
        location: cityInfo.name,
        description: `After a traditional lunch, experience local craft traditions and scenic landscapes.`,
        entryFeeInr: 30,
        tag: 'Scenic & Culture'
      },
      {
        timeSlot: 'Evening',
        timeRange: '06:00 PM - 08:30 PM',
        title: `Bazaar Stroll & Sunset at ${cityInfo.popularAttractions[2] || 'Promenade'}`,
        location: cityInfo.name,
        description: `Wind down with local delicacies, temple bells, and scenic evening views.`,
        entryFeeInr: 0,
        mustTryFoodOrExperience: `Traditional ${cityInfo.name} specialty treats`,
        tag: 'Evening Leisure'
      }
    ],
    recommendedStay: matchingHotel,
    localFoodTips: [`Authentic South Karnataka filter coffee & hot snacks`, `Local thali with fresh regional seasonal produce`],
    transitToNext: transit
  };
}

async function generateItineraryOverview(ai: GoogleGenAI, planRequest: TripPlanRequest): Promise<any> {
  const duration = Math.min(14, Math.max(1, planRequest.durationDays || 3));
  const startingCity = planRequest.startingCity || 'Bengaluru';
  const destinations = planRequest.destinations && planRequest.destinations.length > 0
    ? planRequest.destinations
    : ['Mysuru', 'Coorg (Madikeri)', 'Hampi', 'Gokarna'];

  const systemPrompt = `You are the Karnataka WanderAI travel architect.
Create a concise high-level Karnataka travel plan overview and day outlines in compact JSON.
Rules:
1. Summaries must be strictly 1 or 2 concise sentences.
2. Output concise, authentic Karnataka corridor route stops and day themes.
3. No verbose filler.`;

  const userPrompt = `Trip Overview:
- Starting Hub: ${startingCity}
- Destinations: ${destinations.join(', ')}
- Duration: ${duration} days
- Budget Tier: ${planRequest.budgetTier || 'comfort'}
- Experience: ${planRequest.experienceType || 'heritage_history'}
- Travelers: ${planRequest.travelersCount || 2}
- Pace: ${planRequest.pace || 'moderate'}

Return compact JSON with title, tagline, 1-2 sentence summary, routeStops, estimatedBudgetInr, packingAdvice (3 items), localPhrases (4 items), emergencyHelplines (3 items), and dayStubs (array of ${duration} items each with dayNumber, theme, cityOrHub, highlights: 2-3 items).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          summary: { type: Type.STRING },
          durationDays: { type: Type.INTEGER },
          startingCity: { type: Type.STRING },
          routeStops: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          estimatedBudgetInr: {
            type: Type.OBJECT,
            properties: {
              total: { type: Type.INTEGER },
              perPerson: { type: Type.INTEGER },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  stays: { type: Type.INTEGER },
                  transit: { type: Type.INTEGER },
                  food: { type: Type.INTEGER },
                  activities: { type: Type.INTEGER },
                  contingency: { type: Type.INTEGER }
                },
                required: ['stays', 'transit', 'food', 'activities', 'contingency']
              }
            },
            required: ['total', 'perPerson', 'breakdown']
          },
          dayStubs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayNumber: { type: Type.INTEGER },
                theme: { type: Type.STRING },
                cityOrHub: { type: Type.STRING },
                highlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['dayNumber', 'theme', 'cityOrHub', 'highlights']
            }
          },
          packingAdvice: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          localPhrases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                kannada: { type: Type.STRING },
                english: { type: Type.STRING },
                pronunciation: { type: Type.STRING }
              },
              required: ['kannada', 'english', 'pronunciation']
            }
          },
          emergencyHelplines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                contact: { type: Type.STRING }
              },
              required: ['name', 'contact']
            }
          }
        },
        required: ['title', 'summary', 'durationDays', 'startingCity', 'routeStops', 'estimatedBudgetInr', 'dayStubs']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

async function generateSingleDayPlan(
  ai: GoogleGenAI,
  planRequest: TripPlanRequest,
  dayStub: { dayNumber: number; theme: string; cityOrHub: string; highlights: string[] },
  prevCity: string,
  nextCity: string
): Promise<any> {
  try {
    const systemPrompt = `You are a Karnataka travel expert.
Generate a compact, authentic 1-day itinerary for Day ${dayStub.dayNumber} in ${dayStub.cityOrHub}, Karnataka.
Rules:
1. Activity descriptions must be strictly 1 or 2 concise sentences.
2. Include authentic Karnataka details (timings, entry fee in INR, food, transit).
3. Do not include extraneous commentary.`;

    const userPrompt = `Day ${dayStub.dayNumber} of ${planRequest.durationDays}:
- City/Hub: ${dayStub.cityOrHub}
- Theme: ${dayStub.theme}
- Budget Tier: ${planRequest.budgetTier || 'comfort'}
- Next Destination: ${nextCity || dayStub.cityOrHub}
- Preferred Pace: ${planRequest.pace || 'moderate'}

Return compact JSON with 3 activities (Morning, Afternoon, Evening: 1-2 sentence description each), 1 recommended hotel in ${dayStub.cityOrHub}, transit to ${nextCity || dayStub.cityOrHub}, and 2 local food tips.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dayNumber: { type: Type.INTEGER },
            theme: { type: Type.STRING },
            cityOrHub: { type: Type.STRING },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  timeRange: { type: Type.STRING },
                  title: { type: Type.STRING },
                  location: { type: Type.STRING },
                  description: { type: Type.STRING },
                  entryFeeInr: { type: Type.INTEGER },
                  bestTimeToVisit: { type: Type.STRING },
                  mustTryFoodOrExperience: { type: Type.STRING },
                  tag: { type: Type.STRING }
                },
                required: ['timeSlot', 'timeRange', 'title', 'location', 'description']
              }
            },
            recommendedStay: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                city: { type: Type.STRING },
                area: { type: Type.STRING },
                tier: { type: Type.STRING },
                pricePerNightInr: { type: Type.INTEGER },
                rating: { type: Type.NUMBER },
                description: { type: Type.STRING },
                bookingTip: { type: Type.STRING }
              },
              required: ['name', 'city', 'pricePerNightInr', 'rating', 'description']
            },
            transitToNext: {
              type: Type.OBJECT,
              properties: {
                modeLabel: { type: Type.STRING },
                provider: { type: Type.STRING },
                duration: { type: Type.STRING },
                estimatedCostInr: { type: Type.INTEGER },
                bookingPortal: { type: Type.STRING },
                proTip: { type: Type.STRING }
              },
              required: ['modeLabel', 'provider', 'duration', 'estimatedCostInr', 'bookingPortal']
            },
            localFoodTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['dayNumber', 'theme', 'cityOrHub', 'highlights', 'activities', 'localFoodTips']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      dayNumber: dayStub.dayNumber,
      theme: parsed.theme || dayStub.theme,
      cityOrHub: parsed.cityOrHub || dayStub.cityOrHub,
      highlights: parsed.highlights?.length ? parsed.highlights : dayStub.highlights,
      activities: parsed.activities || [],
      recommendedStay: parsed.recommendedStay,
      transitToNext: parsed.transitToNext,
      localFoodTips: parsed.localFoodTips || [`Authentic ${dayStub.cityOrHub} regional specialities`]
    };
  } catch (err) {
    console.warn(`Day ${dayStub.dayNumber} AI generation error, using fallback:`, err);
    return getFallbackDay(dayStub.dayNumber, dayStub.cityOrHub, planRequest.budgetTier || 'comfort', prevCity);
  }
}

// Streaming Endpoint: SSE Itinerary Generation
app.post('/api/plan-itinerary-stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const planRequest: TripPlanRequest = req.body;
    const cacheKey = getItineraryCacheKey(planRequest);

    // 1. Check Cache first (Instant load on repeated requests)
    const cachedPlan = itineraryCache.get(cacheKey);
    if (cachedPlan) {
      sendEvent('progress', { stage: 'Finding places... Loading saved plan...', percent: 50 });
      sendEvent('overview', { plan: cachedPlan });
      for (const d of cachedPlan.days) {
        sendEvent('day', { dayNumber: d.dayNumber, day: d });
      }
      sendEvent('progress', { stage: 'Itinerary ready!', percent: 100 });
      sendEvent('complete', { plan: cachedPlan });
      res.end();
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      sendEvent('progress', { stage: 'Finding places... Planning day 1... Adding transit.', percent: 30 });
      const plan = generateDeterministicItinerary(planRequest);
      itineraryCache.set(cacheKey, plan);
      sendEvent('overview', { plan });
      for (const d of plan.days) {
        sendEvent('day', { dayNumber: d.dayNumber, day: d });
      }
      sendEvent('complete', { plan });
      res.end();
      return;
    }

    // 2. Fast Overview Call
    sendEvent('progress', { stage: 'Finding places... Planning day 1... Adding transit.', percent: 20 });
    let overviewData: any;
    try {
      overviewData = await generateItineraryOverview(ai, planRequest);
    } catch (err) {
      console.warn('Overview generation error, using deterministic plan:', err);
      const plan = generateDeterministicItinerary(planRequest);
      itineraryCache.set(cacheKey, plan);
      sendEvent('overview', { plan });
      for (const d of plan.days) {
        sendEvent('day', { dayNumber: d.dayNumber, day: d });
      }
      sendEvent('complete', { plan });
      res.end();
      return;
    }

    const dayStubs = overviewData.dayStubs || [];
    const partialDays = dayStubs.map((stub: any) => ({
      dayNumber: stub.dayNumber,
      theme: stub.theme,
      cityOrHub: stub.cityOrHub,
      highlights: stub.highlights || [],
      activities: [],
      isDayLoading: true
    }));

    const partialPlan: ItineraryPlan = {
      id: `plan-ai-${Date.now()}`,
      title: overviewData.title || `${planRequest.durationDays}-Day Karnataka Journey`,
      tagline: overviewData.tagline || 'Curated Karnataka Experience',
      summary: overviewData.summary || 'A curated journey through the best of Karnataka.',
      durationDays: overviewData.durationDays || planRequest.durationDays || 3,
      startingCity: overviewData.startingCity || planRequest.startingCity || 'Bengaluru',
      routeStops: overviewData.routeStops || [planRequest.startingCity || 'Bengaluru'],
      estimatedBudgetInr: overviewData.estimatedBudgetInr || calculateEstimatedBudget(planRequest.durationDays, planRequest.budgetTier, planRequest.travelersCount),
      days: partialDays,
      packingAdvice: overviewData.packingAdvice || [
        'Comfortable walking shoes for heritage temples and scenic viewpoints',
        'Modest clothing for sacred sanctums',
        'Refillable water bottle'
      ],
      localPhrases: overviewData.localPhrases || [
        { kannada: 'Namaskara', english: 'Hello', pronunciation: 'Nah-mas-KAH-rah' },
        { kannada: 'Dhanyavada', english: 'Thank you', pronunciation: 'Dhahn-yah-VAH-dah' }
      ],
      emergencyHelplines: overviewData.emergencyHelplines || [
        { name: 'Karnataka Police Helpline', contact: '112' },
        { name: 'KSRTC 24/7 Support', contact: '080-49596666' }
      ],
      isAiGenerated: true,
      generatedAt: new Date().toISOString()
    };

    // Render overview and day skeletons immediately!
    sendEvent('overview', { plan: partialPlan });
    sendEvent('progress', { stage: 'Planning day 1... Adding transit.', percent: 35 });

    // 3. Generate days in parallel as separate calls (one per day)
    const completedDays: any[] = new Array(dayStubs.length);
    let completedCount = 0;

    await Promise.all(
      dayStubs.map(async (stub: any, idx: number) => {
        const prevCity = idx === 0 ? partialPlan.startingCity : (dayStubs[idx - 1]?.cityOrHub || partialPlan.startingCity);
        const nextCity = dayStubs[idx + 1]?.cityOrHub || stub.cityOrHub;

        const dayPlan = await generateSingleDayPlan(ai, planRequest, stub, prevCity, nextCity);
        completedDays[idx] = dayPlan;
        completedCount++;

        // Stream day as soon as it arrives
        sendEvent('day', { dayNumber: dayPlan.dayNumber, day: dayPlan });
        sendEvent('progress', {
          stage: completedCount < dayStubs.length 
            ? `Planning day ${completedCount + 1}... Adding transit.`
            : 'Adding transit... Finalizing itinerary.',
          percent: Math.min(95, Math.round(35 + (completedCount / dayStubs.length) * 60))
        });
      })
    );

    const fullPlan: ItineraryPlan = {
      ...partialPlan,
      days: completedDays.filter(Boolean)
    };

    // Cache the complete itinerary
    itineraryCache.set(cacheKey, fullPlan);

    sendEvent('progress', { stage: 'Itinerary complete!', percent: 100 });
    sendEvent('complete', { plan: fullPlan });
    res.end();
  } catch (streamErr: any) {
    console.error('Streaming itinerary error:', streamErr);
    const fallback = generateDeterministicItinerary(req.body);
    sendEvent('overview', { plan: fallback });
    for (const d of fallback.days) {
      sendEvent('day', { dayNumber: d.dayNumber, day: d });
    }
    sendEvent('complete', { plan: fallback });
    res.end();
  }
});

// Endpoint: Generate Personalized Itinerary (Non-streaming / Cache-aware fallback)
app.post('/api/plan-itinerary', async (req: Request, res: Response) => {
  try {
    const planRequest: TripPlanRequest = req.body;
    const cacheKey = getItineraryCacheKey(planRequest);

    // 1. Check cache first
    const cachedPlan = itineraryCache.get(cacheKey);
    if (cachedPlan) {
      return res.json({ success: true, plan: cachedPlan, source: 'cache' });
    }

    const ai = getAiClient();
    if (!ai) {
      const plan = generateDeterministicItinerary(planRequest);
      itineraryCache.set(cacheKey, plan);
      return res.json({ success: true, plan, source: 'curated_database' });
    }

    // 2. Quick overview + parallel day calls
    const overviewData = await generateItineraryOverview(ai, planRequest);
    const dayStubs = overviewData.dayStubs || [];

    const completedDays = await Promise.all(
      dayStubs.map((stub: any, idx: number) => {
        const prevCity = idx === 0 ? overviewData.startingCity : (dayStubs[idx - 1]?.cityOrHub || overviewData.startingCity);
        const nextCity = dayStubs[idx + 1]?.cityOrHub || stub.cityOrHub;
        return generateSingleDayPlan(ai, planRequest, stub, prevCity, nextCity);
      })
    );

    const fullPlan: ItineraryPlan = {
      id: `plan-ai-${Date.now()}`,
      title: overviewData.title || `${planRequest.durationDays}-Day Karnataka Journey`,
      tagline: overviewData.tagline || 'Curated Karnataka Experience',
      summary: overviewData.summary || 'A curated journey through the best of Karnataka.',
      durationDays: overviewData.durationDays || planRequest.durationDays || 3,
      startingCity: overviewData.startingCity || planRequest.startingCity || 'Bengaluru',
      routeStops: overviewData.routeStops || [planRequest.startingCity || 'Bengaluru'],
      estimatedBudgetInr: overviewData.estimatedBudgetInr || calculateEstimatedBudget(planRequest.durationDays, planRequest.budgetTier, planRequest.travelersCount),
      days: completedDays.filter(Boolean),
      packingAdvice: overviewData.packingAdvice || [
        'Comfortable walking footwear for heritage sites',
        'Modest temple dress',
        'Refillable water bottle'
      ],
      localPhrases: overviewData.localPhrases || [
        { kannada: 'Namaskara', english: 'Hello', pronunciation: 'Nah-mas-KAH-rah' },
        { kannada: 'Dhanyavada', english: 'Thank you', pronunciation: 'Dhahn-yah-VAH-dah' }
      ],
      emergencyHelplines: overviewData.emergencyHelplines || [
        { name: 'Karnataka Police Helpline', contact: '112' },
        { name: 'KSRTC 24/7 Helpline', contact: '080-49596666' }
      ],
      isAiGenerated: true,
      generatedAt: new Date().toISOString()
    };

    itineraryCache.set(cacheKey, fullPlan);
    return res.json({ success: true, plan: fullPlan, source: 'gemini-3.8-flash-parallel' });
  } catch (error: any) {
    console.error('Error generating AI itinerary:', error);
    const fallbackPlan = generateDeterministicItinerary(req.body);
    return res.json({ 
      success: true, 
      plan: fallbackPlan, 
      source: 'curated_fallback'
    });
  }
});

// Endpoint: Extract Trip Parameters from Casual / Mixed-Language Voice Sentences using Gemini
app.post('/api/extract-trip-voice', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en-IN' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text query is required' });
    }

    const trimmedText = text.trim();
    const lower = trimmedText.toLowerCase();

    // Helper deterministic fallback parser (e.g., Kanglish, Hinglish, Kannada, Hindi, English)
    const getFallbackExtraction = (): ExtractedVoiceTripDetails => {
      // 1. Destinations
      const detectedCities: string[] = [];
      if (lower.includes('hampi') || lower.includes('ಹಂಪಿ') || lower.includes('हम्पी')) detectedCities.push('Hampi');
      if (lower.includes('mysur') || lower.includes('mysore') || lower.includes('ಮೈಸೂರು') || lower.includes('मैसूर')) detectedCities.push('Mysuru');
      if (lower.includes('coorg') || lower.includes('madikeri') || lower.includes('ಕೊಡಗು') || lower.includes('कूर्ग')) detectedCities.push('Coorg (Madikeri)');
      if (lower.includes('gokarna') || lower.includes('ಗೋಕರ್ಣ') || lower.includes('गोकर्ण')) detectedCities.push('Gokarna');
      if (lower.includes('chikmagalur') || lower.includes('chikkamagaluru') || lower.includes('ಚಿಕ್ಕಮಗಳೂರು') || lower.includes('चिकमगलूर')) detectedCities.push('Chikmagalur');
      if (lower.includes('badami') || lower.includes('ಬಾದಾಮಿ') || lower.includes('बादामी') || lower.includes('pattadakal')) detectedCities.push('Badami & Pattadakal');
      if (lower.includes('udupi') || lower.includes('ಉಡುಪಿ') || lower.includes('उडुपी') || lower.includes('malpe')) detectedCities.push('Udupi & Malpe');
      if (lower.includes('kabini') || lower.includes('nagarhole') || lower.includes('ಕಬಿನಿ')) detectedCities.push('Kabini & Nagarhole');
      if (lower.includes('dandeli') || lower.includes('ದಾಂಡೇಲಿ')) detectedCities.push('Dandeli');
      if (detectedCities.length === 0) {
        detectedCities.push('Hampi');
      }

      // 2. Days count
      let durationDays = 3;
      const dayMatch = lower.match(/(\d+)\s*(day|days|din|dina|ದಿನ|दिन)/i);
      if (dayMatch && dayMatch[1]) {
        const parsed = parseInt(dayMatch[1], 10);
        if (parsed >= 1 && parsed <= 14) durationDays = parsed;
      } else if (lower.includes('two') || lower.includes('೨') || lower.includes('do din') || lower.includes('eradu') || lower.includes('erad')) {
        durationDays = 2;
      } else if (lower.includes('three') || lower.includes('೩') || lower.includes('teen') || lower.includes('mooru')) {
        durationDays = 3;
      } else if (lower.includes('four') || lower.includes('೪') || lower.includes('chaar') || lower.includes('naalku')) {
        durationDays = 4;
      } else if (lower.includes('five') || lower.includes('೫') || lower.includes('paanch') || lower.includes('aidu')) {
        durationDays = 5;
      }

      // 3. Budget (e.g. Kanglish 'kammi', 'kadime', Hindi 'sasta', 'kam', English 'cheap', 'budget', etc.)
      let budgetTier: BudgetTier = 'comfort';
      if (
        lower.includes('kammi') ||
        lower.includes('kadime') ||
        lower.includes('sasta') ||
        lower.includes('saste') ||
        lower.includes('budget') ||
        lower.includes('cheap') ||
        lower.includes('low budget') ||
        lower.includes('backpacker') ||
        lower.includes('ಕಡಿಮೆ') ||
        lower.includes('कमी') ||
        lower.includes('सस्ता')
      ) {
        budgetTier = 'budget';
      } else if (
        lower.includes('luxury') ||
        lower.includes('rich') ||
        lower.includes('palace') ||
        lower.includes('resort') ||
        lower.includes('premium') ||
        lower.includes('mehenga') ||
        lower.includes('ಐಷಾರಾಮಿ')
      ) {
        budgetTier = 'luxury';
      }

      // 4. Travelers count
      let travelersCount = 2;
      const travelerMatch = lower.match(/(\d+)\s*(people|person|travelers|friends|adults|log|jana|dost|ಮಂದಿ|लोग)/i);
      if (travelerMatch && travelerMatch[1]) {
        travelersCount = Math.min(10, Math.max(1, parseInt(travelerMatch[1], 10)));
      } else if (lower.includes('solo') || lower.includes('obba') || lower.includes('alone') || lower.includes('ekla') || lower.includes('single')) {
        travelersCount = 1;
      } else if (lower.includes('couple') || lower.includes('ibbaru') || lower.includes('two friends') || lower.includes('do log') || lower.includes('do dost')) {
        travelersCount = 2;
      } else if (lower.includes('family') || lower.includes('group')) {
        travelersCount = 4;
      }

      // 5. Travel Style / Experience
      let travelStyle: ExperienceType = 'heritage_history';
      let travelStyleLabel = 'UNESCO & Royal Heritage';
      if (lower.includes('coffee') || lower.includes('estate') || lower.includes('plantation') || lower.includes('ಕಾಫಿ') || lower.includes('कॉफ़ी')) {
        travelStyle = 'coffee_plantations';
        travelStyleLabel = 'Coffee Trails & Estates';
      } else if (lower.includes('beach') || lower.includes('cliff') || lower.includes('sea') || lower.includes('ocean') || lower.includes('ಕಡಲತೀರ') || lower.includes('समुद्र')) {
        travelStyle = 'coastal_beaches';
        travelStyleLabel = 'Coastal Beaches & Cliffs';
      } else if (lower.includes('trek') || lower.includes('hike') || lower.includes('peak') || lower.includes('adventure') || lower.includes('ಟ್ರ trek')) {
        travelStyle = 'adventure_trekking';
        travelStyleLabel = 'Trekking & Mountain Peaks';
      } else if (lower.includes('wildlife') || lower.includes('tiger') || lower.includes('safari') || lower.includes('forest') || lower.includes('nature') || lower.includes('ಕಾಡು')) {
        travelStyle = 'nature_wildlife';
        travelStyleLabel = 'Western Ghats & Nature';
      } else if (lower.includes('temple') || lower.includes('spiritual') || lower.includes('pilgrimage') || lower.includes('matha') || lower.includes('ದೇವಸ್ಥಾನ') || lower.includes('मंदिर')) {
        travelStyle = 'spiritual_pilgrimage';
        travelStyleLabel = 'Sacred & Spiritual Shrines';
      } else if (lower.includes('food') || lower.includes('thali') || lower.includes('culinary') || lower.includes('ಊಟ') || lower.includes('खाना')) {
        travelStyle = 'culinary_trail';
        travelStyleLabel = 'Authentic Culinary Trail';
      } else if (detectedCities.includes('Coorg (Madikeri)') || detectedCities.includes('Chikmagalur')) {
        travelStyle = 'coffee_plantations';
        travelStyleLabel = 'Coffee Trails & Estates';
      } else if (detectedCities.includes('Gokarna') || detectedCities.includes('Udupi & Malpe')) {
        travelStyle = 'coastal_beaches';
        travelStyleLabel = 'Coastal Beaches & Cliffs';
      }

      return {
        destinations: detectedCities,
        durationDays,
        budgetTier,
        travelStyle,
        travelStyleLabel,
        travelersCount,
        startingCity: 'Bengaluru',
        rawSentence: trimmedText,
        summaryExplanation: `${durationDays}-day ${budgetTier} getaway to ${detectedCities.join(' & ')} for ${travelersCount} traveler(s)`,
        confidence: 'fallback'
      };
    };

    const ai = getAiClient();
    if (!ai) {
      return res.json({ success: true, details: getFallbackExtraction(), source: 'fallback' });
    }

    const prompt = `You are an expert Karnataka Travel Entity Extraction Engine.
Analyze this spoken travel request sentence: "${trimmedText}".
Language hint: "${language}". Note: the speaker may use casual English, Kannada, Hindi, Kanglish (e.g. "Hampi ge 2 days, budget kammi", "Mysore hogona 3 days, low budget"), Hinglish (e.g. "Hampi aur Gokarna 4 din ke liye saste me do dost"), or mixed Kannada/Hindi/English.

Extract these exact parameters:
1. destinations: Array of Karnataka destination names (e.g. ["Hampi"], ["Mysuru", "Coorg (Madikeri)"], ["Gokarna"], ["Chikmagalur"], ["Badami & Pattadakal"], ["Udupi & Malpe"], ["Kabini & Nagarhole"], ["Dandeli"]). Use standard canonical Karnataka names. If not clear, default to ["Hampi"].
2. durationDays: Integer number of days between 1 and 14 (default 3 if not specified). e.g. "2 days" -> 2.
3. budgetTier: "budget" | "comfort" | "luxury".
   - "kammi", "kadime", "sasta", "cheap", "pocket friendly", "budget", "bachat", "student" -> "budget"
   - "luxury", "rich", "palace", "resort", "mehenga", "5 star", "premium", "royal" -> "luxury"
   - "normal", "medium", "decent", "comfort", or unspecified -> "comfort"
4. travelStyle: One of ["heritage_history", "nature_wildlife", "coffee_plantations", "coastal_beaches", "spiritual_pilgrimage", "culinary_trail", "adventure_trekking", "family_leisure"].
5. travelStyleLabel: The human-friendly label corresponding to travelStyle:
   - "UNESCO & Royal Heritage"
   - "Western Ghats & Nature"
   - "Coffee Trails & Estates"
   - "Coastal Beaches & Cliffs"
   - "Trekking & Mountain Peaks"
   - "Sacred & Spiritual Shrines"
   - "Authentic Culinary Trail"
6. travelersCount: Integer count of travelers between 1 and 10 (default 2). E.g. "solo" -> 1, "do dost / couple" -> 2, "3 people" -> 3.
7. startingCity: Departure city (default "Bengaluru", or "Mangaluru", "Mysuru", "Hubballi" if stated).
8. summaryExplanation: A concise friendly English summary of what was understood (e.g. "2-day budget heritage getaway to Hampi for 2 travelers").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destinations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of Karnataka destinations'
            },
            durationDays: {
              type: Type.INTEGER,
              description: 'Duration in days'
            },
            budgetTier: {
              type: Type.STRING,
              description: 'budget, comfort, or luxury'
            },
            travelStyle: {
              type: Type.STRING,
              description: 'Style enum'
            },
            travelStyleLabel: {
              type: Type.STRING,
              description: 'Human label for travel style'
            },
            travelersCount: {
              type: Type.INTEGER,
              description: 'Traveler count'
            },
            startingCity: {
              type: Type.STRING,
              description: 'Starting city'
            },
            summaryExplanation: {
              type: Type.STRING,
              description: 'Concise summary sentence'
            }
          },
          required: ['destinations', 'durationDays', 'budgetTier', 'travelStyle', 'travelStyleLabel', 'travelersCount', 'startingCity']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const validTiers: BudgetTier[] = ['budget', 'comfort', 'luxury'];
    const validTier = validTiers.includes(parsed.budgetTier?.toLowerCase()) ? parsed.budgetTier.toLowerCase() as BudgetTier : 'comfort';
    
    const extracted: ExtractedVoiceTripDetails = {
      destinations: Array.isArray(parsed.destinations) && parsed.destinations.length > 0 ? parsed.destinations : ['Hampi'],
      durationDays: Math.min(14, Math.max(1, Number(parsed.durationDays) || 3)),
      budgetTier: validTier,
      travelStyle: (parsed.travelStyle || 'heritage_history') as ExperienceType,
      travelStyleLabel: parsed.travelStyleLabel || 'UNESCO & Royal Heritage',
      travelersCount: Math.min(10, Math.max(1, Number(parsed.travelersCount) || 2)),
      startingCity: parsed.startingCity || 'Bengaluru',
      rawSentence: trimmedText,
      summaryExplanation: parsed.summaryExplanation || `${parsed.durationDays || 3}-day ${validTier} trip to ${parsed.destinations?.join(', ') || 'Karnataka'}`,
      confidence: 'high'
    };

    return res.json({ success: true, details: extracted, source: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Gemini voice extraction error:', err);
    // In case of any error or model timeout, return the fallback parsed result smoothly
    const fallbackDetails = {
      destinations: ['Hampi'],
      durationDays: 3,
      budgetTier: 'comfort' as BudgetTier,
      travelStyle: 'heritage_history' as ExperienceType,
      travelStyleLabel: 'UNESCO & Royal Heritage',
      travelersCount: 2,
      startingCity: 'Bengaluru',
      rawSentence: req.body.text || '',
      summaryExplanation: 'Trip request extracted',
      confidence: 'fallback' as const
    };
    return res.json({ success: true, details: fallbackDetails, source: 'fallback' });
  }
});

// Endpoint: Multi-Turn Role-Based Gemini Chat
app.post('/api/chat-multiturn', async (req: Request, res: Response) => {
  try {
    const { history = [], message, persona = 'concierge', model = 'gemini-3.8-flash' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Role-specific system instructions
    let systemInstruction = 'You are an authentic Karnataka travel concierge. Give precise, helpful, friendly advice with real local details.';
    if (persona === 'transit_dispatcher') {
      systemInstruction = 'You are the Karnataka State Transit & Logistics Dispatcher. You specialize in rapid, actionable transit guidance: exact KSRTC bus classes (Airavat Club Class, Ambaari Dream Class, Flybus), Indian Railways train numbers (Vande Bharat #20608, Hampi Express #16592, Panchaganga #16595), highway routes (Bengaluru-Mysuru Expressway, Shiradi/Charmadi Ghats), and official booking portals (ksrtc.in, irctc.co.in). Be concise, precise, and fast.';
    } else if (persona === 'heritage_scholar') {
      systemInstruction = 'You are a Senior Karnataka Heritage Scholar & Historian. You possess deep expertise on the Vijayanagara Empire at Hampi, the Hoysala dynasty temples of Belur & Halebidu, the Badami Chalukyas, and the Mysore Wadiyars. Provide captivating historical depth, architectural analysis, and mythological significance.';
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply: `[Offline Local Guide]: For Karnataka travel, KSRTC Airavat buses and Vande Bharat trains provide dependable transit between Bengaluru, Mysuru, and major hubs. Try local specialties like Mysore Pak in Mysuru and Neer Dosa along the coast!`,
        modelUsed: 'offline-fallback'
      });
    }

    // Map conversation history to contents array format
    const contents: any[] = [];
    for (const item of history) {
      if (item.text && item.role) {
        contents.push({
          role: item.role === 'model' || item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }]
        });
      }
    }
    // Append current turn
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Valid model selection per prompt instructions
    const selectedModel = model === 'gemini-3.1-flash-lite' 
      ? 'gemini-3.1-flash-lite' 
      : model === 'gemini-4-argon' 
        ? 'gemini-4-argon' 
        : 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({
      reply: response.text || 'Karnataka offers limitless wonders. Safe journey!',
      modelUsed: selectedModel,
      persona
    });
  } catch (error: any) {
    console.error('Multi-turn chat error:', error);
    return res.json({
      reply: 'Karnataka travel is full of wonderful discoveries. Early morning visits (6:00-9:00 AM) are recommended for Hampi and Badami. For any urgent transit check, visit ksrtc.in or irctc.co.in.',
      modelUsed: 'fallback',
      warning: error.message
    });
  }
});


// Health endpoints for Cloud Run & monitoring
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Endpoint: Curated Itineraries and Destinations catalog
app.get('/api/destinations', (_req: Request, res: Response) => {
  res.json({
    cities: KARNATAKA_CITIES,
    curatedHotels: CURATED_HOTELS,
    transitRoutes: TRANSIT_ROUTES_DATABASE,
    classicItineraries: CLASSIC_ITINERARIES
  });
});

// Shared Trips Server Store (In-memory + persistence fallback)
const sharedTripsStore = new Map<string, any>();

app.post('/api/share-trip', (req: Request, res: Response) => {
  try {
    const { plan, tripId: customTripId } = req.body;
    if (!plan || !plan.title) {
      return res.status(400).json({ error: 'Valid itinerary plan is required.' });
    }

    const tripId = customTripId && /^[a-zA-Z0-9_\-]+$/.test(customTripId)
      ? customTripId
      : `kw_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const deployedUrl = process.env.APP_URL && !process.env.APP_URL.includes('localhost') && !process.env.APP_URL.includes('ais-dev-')
      ? process.env.APP_URL.replace(/\/+$/, '')
      : 'https://ais-pre-3wgkb5mi52kt36zxf5g2zs-55244605720.asia-east1.run.app';

    const record = {
      id: tripId,
      title: plan.title,
      durationDays: plan.durationDays || (plan.days ? plan.days.length : 3),
      destinations: plan.routeStops || [],
      plan,
      createdAt: new Date().toISOString()
    };

    sharedTripsStore.set(tripId, record);

    return res.json({
      success: true,
      tripId,
      shareUrl: `${deployedUrl}/?trip=${tripId}`
    });
  } catch (err: any) {
    console.error('Error saving shared trip on server:', err);
    return res.status(500).json({ error: 'Failed to share trip.' });
  }
});

app.get('/api/shared-trip/:tripId', (req: Request, res: Response) => {
  const { tripId } = req.params;
  if (!tripId) {
    return res.status(400).json({ error: 'Trip ID is required.' });
  }

  const found = sharedTripsStore.get(tripId);
  if (!found) {
    return res.status(404).json({ error: 'Shared itinerary not found.' });
  }

  return res.json(found);
});

async function startServer() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const distIndex = path.resolve(distDir, 'index.html');
  const hasDist = fs.existsSync(distIndex);
  const isRunningFromDist = (process.argv[1] && process.argv[1].includes('dist')) || import.meta.url.includes('/dist/');
  const isProd = isRunningFromDist || process.env.NODE_ENV === 'production' || (!process.env.VITE_DEV && hasDist);

  if (isProd && hasDist) {
    console.log(`[Production] Serving static files from ${distDir}`);
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndex);
    });
  } else {
    console.log('[Development] Initializing Vite middleware mode');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Karnataka WanderAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
