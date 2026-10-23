import { HotelRecommendation, TransitOption, ItineraryPlan } from '../types/travel.ts';

export interface KarnatakaCity {
  id: string;
  name: string;
  kannadaName: string;
  region: 'South Karnataka' | 'Coastal Karnataka' | 'Malenadu / Western Ghats' | 'North Karnataka / Deccan';
  tagline: string;
  description: string;
  popularAttractions: string[];
  bestMonths: string;
  airportNear: string;
  railwayStation: string;
  icon: string;
  imageUrl: string;
  imageAlt: string;
}

export const KARNATAKA_CITIES: KarnatakaCity[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    kannadaName: 'ಬೆಂಗಳೂರು',
    region: 'South Karnataka',
    tagline: 'Garden City & Vibrant Capital',
    description: 'Cosmopolitan capital blending Cubbon Park greenery, craft breweries, historic Bangalore Palace, and iconic filter coffee.',
    popularAttractions: ['Lalbagh Botanical Garden', 'Cubbon Park', 'Bangalore Palace', 'Vidhana Soudha', 'MTR Lalbagh Road', 'Bannerghatta National Park'],
    bestMonths: 'Year-round (Oct to Mar is optimal)',
    airportNear: 'Kempegowda International Airport (BLR)',
    railwayStation: 'KSR Bengaluru (SBC) / Yesvantpur (YPR)',
    icon: 'City',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Bengaluru city skyline and lush canopy'
  },
  {
    id: 'mysuru',
    name: 'Mysuru',
    kannadaName: 'ಮೈಸೂರು',
    region: 'South Karnataka',
    tagline: 'City of Palaces & Heritage Silk',
    description: 'The cultural capital famous for the illuminated Amba Vilas Palace, Devaraja Market fragrances, authentic Mysore Pak, and Chamundi Hill.',
    popularAttractions: ['Mysore Palace', 'Chamundi Hills', 'Devaraja Market', 'St. Philomena Cathedral', 'Brindavan Gardens', 'Srirangapatna (Tipu Sultan fort)'],
    bestMonths: 'Sep to Mar (Dasara festival in Oct is spectacular)',
    airportNear: 'Mysore Airport (MYQ) / Bengaluru (BLR) 140km',
    railwayStation: 'Mysuru Junction (MYS)',
    icon: 'Palace',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Mysore Palace illuminated with golden lights'
  },
  {
    id: 'hampi',
    name: 'Hampi',
    kannadaName: 'ಹಂಪಿ',
    region: 'North Karnataka / Deccan',
    tagline: 'UNESCO Bouldered Wonder of Vijayanagara',
    description: 'Surreal granite landscape cradling monumental 14th-century Vijayanagara Empire ruins, coracle rides on Tungabhadra, and Matanga Hill sunrises.',
    popularAttractions: ['Virupaksha Temple', 'Stone Chariot & Vijaya Vittala', 'Matanga Hill Sunrise', 'Lotus Mahal & Elephant Stables', 'Sanapur Lake Coracle Ride', 'Queen’s Bath'],
    bestMonths: 'Oct to Mar (pleasant breeze; avoid scorching Apr-May)',
    airportNear: 'Jindal Vidyanagar Airport (VDY) 38km / Hubballi (HBX) 140km',
    railwayStation: 'Hosapete Junction (HPT) 12km',
    icon: 'Landmark',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Virupaksha temple gopuram and ancient boulders in Hampi'
  },
  {
    id: 'coorg',
    name: 'Coorg (Madikeri)',
    kannadaName: 'ಕೊಡಗು',
    region: 'Malenadu / Western Ghats',
    tagline: 'Scotland of India & Coffee Heartlands',
    description: 'Misty hills blanketed in robusta coffee, cardamom estates, roaring Abbey Falls, Raja’s Seat sunsets, and Namdroling Tibetan Golden Temple.',
    popularAttractions: ['Abbey Falls', 'Raja’s Seat', 'Namdroling Tibetan Monastery (Bylakuppe)', 'Madikeri Fort', 'Tala Kaveri', 'Dubare Elephant Camp'],
    bestMonths: 'Oct to May (Monsoon Jun-Aug is lush and magical for rain lovers)',
    airportNear: 'Kannur (CNN) 85km / Mangaluru (IXE) 135km / Bengaluru 260km',
    railwayStation: 'Mysuru (MYS) 120km / Hassan 110km',
    icon: 'Trees',
    imageUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Misty green coffee plantations of Coorg'
  },
  {
    id: 'chikmagalur',
    name: 'Chikmagalur',
    kannadaName: 'ಚಿಕ್ಕಮಗಳೂರು',
    region: 'Malenadu / Western Ghats',
    tagline: 'Birthplace of Indian Coffee & Mountain Treks',
    description: 'First region where Baba Budan planted 7 sacred coffee beans. Home to Mullayanagiri (Karnataka’s highest peak) and emerald valleys.',
    popularAttractions: ['Mullayanagiri Peak', 'Baba Budangiri / Datta Peeta', 'Hebbe Falls', 'Coffee Museum', 'Bhadra Wildlife Sanctuary', 'Z Point Kemmangundi'],
    bestMonths: 'Sep to May',
    airportNear: 'Mangaluru (IXE) 150km / Bengaluru (BLR) 240km',
    railwayStation: 'Chikkamagaluru (CMGR) / Kadur (DRU) 40km',
    icon: 'Mountain',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Misty Western Ghats mountain ridges in Chikmagalur'
  },
  {
    id: 'gokarna',
    name: 'Gokarna',
    kannadaName: 'ಗೋಕರ್ಣ',
    region: 'Coastal Karnataka',
    tagline: 'Sacred Temples & Untamed Bohemian Beaches',
    description: 'Pilgrimage and cliff-top seaside paradise. Renowned for the five beaches (Om, Kudle, Half Moon, Paradise, Gokarna) and Mahabaleshwar Shiva temple.',
    popularAttractions: ['Om Beach', 'Kudle Beach Cliff Walk', 'Half Moon & Paradise Beach Trek', 'Mahabaleshwar Temple', 'Mirjan Fort', 'Yana Rocks (day trip)'],
    bestMonths: 'Oct to Apr (calm waters and beach cafes open)',
    airportNear: 'Dabolim Goa (GOI) 140km / Hubballi (HBX) 150km',
    railwayStation: 'Gokarna Road (GOK) / Kumta (KT) 30km',
    icon: 'Waves',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Scenic coastal cliffs and sandy shores of Gokarna Om Beach'
  },
  {
    id: 'udupi_malpe',
    name: 'Udupi & Malpe',
    kannadaName: 'ಉಡುಪಿ & ಮಲ್ಪೆ',
    region: 'Coastal Karnataka',
    tagline: 'Culinary Heritage & Hexagonal Basalt Islands',
    description: 'Birthplace of world-famous Udupi cuisine (masala dosa, sambar), historic Sri Krishna Matha, and volcanic columnar basalt on St. Mary’s Island.',
    popularAttractions: ['Sri Krishna Matha', 'St. Mary’s Island', 'Malpe Sea Walk', 'Kaup Beach & Lighthouse', 'Woodland Restaurant (Thali)', 'Pabbas Ice Cream (Mangaluru)'],
    bestMonths: 'Oct to Mar',
    airportNear: 'Mangaluru International (IXE) 55km',
    railwayStation: 'Udupi (UD) Konkan Railway',
    icon: 'Utensils',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'St. Mary Island basalt formations and turquoise Arabian sea'
  },
  {
    id: 'kabini_nagarhole',
    name: 'Kabini & Nagarhole',
    kannadaName: 'ಕಬಿನಿ',
    region: 'South Karnataka',
    tagline: 'Prime Tiger, Leopard & Black Panther Habitat',
    description: 'Famous Kabini backwaters where wild Asian elephants congregate, and legendary safari zone with high density of tigers and leopards.',
    popularAttractions: ['Kabini River Boat Safari', 'Nagarhole Jungle Jeep Safari', 'Coracle rides on reservoir', 'Tribal village trails'],
    bestMonths: 'Nov to May (dry season draws wildlife to river banks)',
    airportNear: 'Mysuru (MYQ) 70km / Bengaluru (BLR) 215km',
    railwayStation: 'Mysuru (MYS) 65km',
    icon: 'Compass',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Wild elephants and pristine waters at Kabini backwaters'
  },
  {
    id: 'badami_pattadakal',
    name: 'Badami & Pattadakal',
    kannadaName: 'ಬಾದಾಮಿ',
    region: 'North Karnataka / Deccan',
    tagline: 'Chalukyan Sandstone Cave Temples & UNESCO Gems',
    description: 'Dramatic red sandstone cliffs housing 6th-century rock-cut cave temples facing Agastya Lake, alongside Pattadakal and Aihole temple clusters.',
    popularAttractions: ['Badami Cave Temples (1 to 4)', 'Agastya Lake & Bhutanatha Temple', 'Pattadakal UNESCO Temple Complex', 'Aihole Durga Temple', 'Banashankari Temple'],
    bestMonths: 'Oct to Mar',
    airportNear: 'Hubballi (HBX) 105km',
    railwayStation: 'Badami (BDM)',
    icon: 'Shield',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Ancient Chalukyan sandstone rock-cut cave temples of Badami'
  }
];

export const CURATED_HOTELS: HotelRecommendation[] = [
  // Mysuru
  {
    id: 'mys-1',
    name: 'Lalitha Mahal Palace Hotel',
    city: 'Mysuru',
    area: 'Chamundi Hill Foothills',
    tier: 'luxury',
    pricePerNightInr: 9500,
    rating: 4.6,
    reviewsCount: 1420,
    badge: 'Heritage Viceroy Palace',
    amenities: ['Italian Marble Architecture', 'Billiards Room', 'Royal Dining', 'Swimming Pool', 'Lush Gardens'],
    description: 'Built by Maharaja Krishnaraja Wadiyar IV in 1921 for the Viceroy of India, featuring pure white domes and sweeping views of Chamundi Hill.',
    bookingTip: 'Book the Heritage Suite on the upper terrace for original antique furnishings and palace views.'
  },
  {
    id: 'mys-2',
    name: 'Radisson Blu Plaza Hotel Mysuru',
    city: 'Mysuru',
    area: 'MG Road, Nazarbad',
    tier: 'comfort',
    pricePerNightInr: 5200,
    rating: 4.5,
    reviewsCount: 3100,
    badge: 'Scenic Chamundi View',
    amenities: ['Free High-Speed WiFi', 'Infinity Pool', '24/7 Room Service', 'Spa & Wellness', 'Valet Parking'],
    description: 'Modern luxury overlooking the lush Mysore Golf Club with direct sightlines to Chamundi Hill, 5 mins from Mysore Palace.',
    bookingTip: 'Ask for Chamundi-facing rooms on floors 3 and above.'
  },
  {
    id: 'mys-3',
    name: 'KSTDC Hotel Mayura Hoysala',
    city: 'Mysuru',
    area: 'Jhansi Lakshmibai Road',
    tier: 'budget',
    pricePerNightInr: 1800,
    rating: 4.1,
    reviewsCount: 890,
    badge: 'Govt Certified Value Stay',
    amenities: ['Clean AC Rooms', 'In-house Restaurant', 'Tourism Helpdesk', 'Free Parking', 'Near Railway Station'],
    description: 'Run by Karnataka Tourism Development Corporation. Ultra-clean, dependable, and 800m from Mysore Railway Station.',
    bookingTip: 'Direct booking via kstdc.co provides discount vouchers for nearby KSTDC day tours.'
  },
  // Hampi
  {
    id: 'hmp-1',
    name: 'Evolve Back Kamalapura Palace Hampi',
    city: 'Hampi',
    area: 'Kamalapura',
    tier: 'luxury',
    pricePerNightInr: 28000,
    rating: 4.9,
    reviewsCount: 980,
    badge: 'Vijayanagara Fortress Palace',
    amenities: ['Private Plunge Pool', 'Vaidyasala Ayurvedic Spa', 'Infinity Pool', 'Curated Historian Safaris', 'Royal Dining'],
    description: 'Architecturally patterned after the 14th-century Vijayanagara imperial palace with vaulted archways, stonework, and royal courtyards.',
    bookingTip: 'Includes complimentary evening storytelling and guided history walks around Kamalapura ruins.'
  },
  {
    id: 'hmp-2',
    name: 'Heritage Resort Hampi',
    city: 'Hampi',
    area: 'Hosapete - Hampi Road',
    tier: 'comfort',
    pricePerNightInr: 6500,
    rating: 4.4,
    reviewsCount: 1250,
    badge: 'Organic Farm & Cottages',
    amenities: ['Swimming Pool', 'Ayurveda Spa', 'Organic Plantation Dining', 'Bicycle Rentals', 'Free WiFi'],
    description: 'Peaceful villa-style cottages set within 9 acres of organic farmland, located midway between Hosapete Junction and Hampi ruins.',
    bookingTip: 'Rent their mountain bikes to cycle along the Tungabhadra canal path.'
  },
  {
    id: 'hmp-3',
    name: 'Zostel Hampi',
    city: 'Hampi',
    area: 'Anegundi / Gangavathi Road',
    tier: 'budget',
    pricePerNightInr: 1100,
    rating: 4.5,
    reviewsCount: 1670,
    badge: 'Backpacker & Traveler Hub',
    amenities: ['AC Dorms & Private Shacks', 'Rooftop Cafe', 'Common Room Games', 'Scooter Rental Desk', 'Sunset Trek Tours'],
    description: 'Lively community stay situated on the Hippie Island / Anegundi side surrounded by paddy fields and boulder ridges.',
    bookingTip: 'Book at least 2 weeks in advance for winter weekends (Nov-Feb).'
  },
  // Coorg
  {
    id: 'crg-1',
    name: 'The Tamara Coorg',
    city: 'Coorg (Madikeri)',
    area: 'Kabbinakad, Yavakapadi',
    tier: 'luxury',
    pricePerNightInr: 19000,
    rating: 4.8,
    reviewsCount: 1840,
    badge: 'Eco-Luxury Tree Stays',
    amenities: ['Private Wooden Cottages on Stilts', 'Coffee Blending Workshop', 'Heated Outdoor Pool', 'Waterfall Treks', 'Fine Dining'],
    description: 'Perched at 3,500 ft amid 180 acres of organic coffee, cardamom, and pepper plantations, featuring cascading natural waterfalls.',
    bookingTip: 'Participate in their "Bean to Cup" interactive coffee brewing session on terrace.'
  },
  {
    id: 'crg-2',
    name: 'Club Mahindra Madikeri Resort',
    city: 'Coorg (Madikeri)',
    area: 'Galibeedu Road, Madikeri',
    tier: 'comfort',
    pricePerNightInr: 5800,
    rating: 4.4,
    reviewsCount: 3800,
    badge: 'Family & Plantation Haven',
    amenities: ['2 Swimming Pools', 'Adventure Zone', 'Kodava Cooking Classes', 'Spa', 'Kids Play Park'],
    description: 'Built in traditional Ainmane Kodava architecture tucked in the rainforest slopes of Madikeri.',
    bookingTip: 'Great for families with children due to extensive activity workshops.'
  },
  {
    id: 'crg-3',
    name: 'Zostel Coorg (Madikeri)',
    city: 'Coorg (Madikeri)',
    area: 'Siddapur Road',
    tier: 'budget',
    pricePerNightInr: 1200,
    rating: 4.4,
    reviewsCount: 1120,
    badge: 'Plantation Backpacker Base',
    amenities: ['Coffee Estate Views', 'Bonfire Courtyard', 'High Speed WiFi', 'Shared Kitchen', 'Board Games'],
    description: 'Cozy backpacker hostel surrounded by coffee bushes and betel nut trees, ideal for solo travellers and trekkers.',
    bookingTip: 'Hosts evening bonfire sessions where travellers coordinate shared taxis for Tala Kaveri.'
  },
  // Gokarna
  {
    id: 'gok-1',
    name: 'Kahani Paradise',
    city: 'Gokarna',
    area: 'Belekan Bay',
    tier: 'luxury',
    pricePerNightInr: 22000,
    rating: 4.9,
    reviewsCount: 320,
    badge: 'Cliff-edge Estate Sanctuary',
    amenities: ['Private Estate', 'Panoramic Ocean Views', 'Infinity Pool', 'Private Beach Path', 'Organic Chef Menus'],
    description: 'An exclusive 20-acre cliff-top estate overlooking the Arabian Sea and secluded Belekan beach, offering ultimate privacy.',
    bookingTip: 'Direct private trail down to Half Moon Beach without road traffic.'
  },
  {
    id: 'gok-2',
    name: 'Kudle Beach View Resort & Spa',
    city: 'Gokarna',
    area: 'Kudle Beach Hilltop',
    tier: 'comfort',
    pricePerNightInr: 4500,
    rating: 4.3,
    reviewsCount: 1540,
    badge: 'Sunset Ocean Clifftop',
    amenities: ['Swimming Pool', 'Ayurvedic Massage', 'Multi-cuisine Sea View Restaurant', 'Yoga Lawn', 'AC Cottages'],
    description: 'Perched directly above Kudle Beach with stairway access down to the sand and sunset views across the bay.',
    bookingTip: 'Request upper tier sea-view rooms.'
  },
  {
    id: 'gok-3',
    name: 'Zostel Gokarna',
    city: 'Gokarna',
    area: 'Kudle Beach Road Clifftop',
    tier: 'budget',
    pricePerNightInr: 1050,
    rating: 4.5,
    reviewsCount: 2200,
    badge: 'Iconic Clifftop Sea View',
    amenities: ['Cliff-edge Sea View Cafe', 'AC Dorms & Private Cottages', 'Sunset Deck', 'Hammocks', 'Fast WiFi'],
    description: 'Widely considered one of India’s most scenic hostels with cliff views directly sweeping across Gokarna main beach.',
    bookingTip: 'Book early for peak season (Nov-Jan) as dorms sell out weeks ahead.'
  },
  // Chikmagalur
  {
    id: 'chk-1',
    name: 'Java Rain Resort',
    city: 'Chikmagalur',
    area: 'Mullayanagiri Foothills',
    tier: 'luxury',
    pricePerNightInr: 14500,
    rating: 4.7,
    reviewsCount: 1400,
    badge: 'Coffee Estate Villas',
    amenities: ['Private Jacuzzi / Plunge Pool', 'Mirador Viewpoint Bar', 'Infinity Pool', 'Spice Plantation Walk', 'Spa'],
    description: 'Spectacular estate nestled in the lap of Mullayanagiri hills offering ultra-luxury villas amidst coffee bushes.',
    bookingTip: 'Sunset drinks at the elevated Mirador treehouse bar is a highlight.'
  },
  {
    id: 'chk-2',
    name: 'The Serai Chikmagalur',
    city: 'Chikmagalur',
    area: 'Mugthihalli',
    tier: 'comfort',
    pricePerNightInr: 9000,
    rating: 4.6,
    reviewsCount: 2100,
    badge: 'Private Pool Villas',
    amenities: ['Individual Villa Pools', 'Oma Spa', 'Estate Bicycle Trails', 'Coffee Tasting Sessions', 'Fine Dining'],
    description: 'Designed around the theme of coffee, where each villa has an individual plunge pool and floor-to-ceiling glass doors.',
    bookingTip: 'Complimentary morning guided nature and bird-watching walk.'
  },
  {
    id: 'chk-3',
    name: 'Nature Nirvana Homestay',
    city: 'Chikmagalur',
    area: 'Baba Budangiri Hills',
    tier: 'budget',
    pricePerNightInr: 2200,
    rating: 4.4,
    reviewsCount: 650,
    badge: 'Authentic Malnad Homestay',
    amenities: ['Homecooked Malnad Meals', 'Private Waterfall on Property', 'Bonfire', 'Plantation Treks', 'Jeep Safari Assistance'],
    description: 'Centuries-old coffee plantation homestay serving authentic akki rotti and kaayi payasa with private stream.',
    bookingTip: 'All three traditional Malnad home-cooked meals included in the tariff.'
  }
];

export const TRANSIT_ROUTES_DATABASE: Record<string, TransitOption[]> = {
  'bengaluru-mysuru': [
    {
      mode: 'vande_bharat',
      modeLabel: 'Vande Bharat Express (Train #20608 / #20642)',
      provider: 'Indian Railways (IRCTC)',
      duration: '1h 35m',
      frequency: 'Multiple departures daily from KSR Bengaluru (SBC)',
      estimatedCostInr: 650,
      bookingPortal: 'irctc.co.in',
      proTip: 'Fastest connection; travels on the high-speed electrified corridor with catering included.',
      scheduleHint: 'Departs KSR Bengaluru at 05:45 AM & 10:30 AM'
    },
    {
      mode: 'ksrtc_airavat',
      modeLabel: 'KSRTC Airavat Club Class (Multi-Axle Volvo)',
      provider: 'KSRTC (Karnataka State Road Transport)',
      duration: '2h 15m',
      frequency: 'Every 15-20 minutes from Satellite Bus Terminal & Kempegowda Bus Station',
      estimatedCostInr: 380,
      bookingPortal: 'ksrtc.in',
      proTip: 'Smooth cruising via the 10-lane Bengaluru-Mysuru Expressway. No advance booking strictly needed, frequent walk-in.'
    },
    {
      mode: 'taxi_car',
      modeLabel: 'Private Highway Cab via Bengaluru-Mysuru Expressway',
      provider: 'KSTDC Travels / MakeMyTrip / Ola Outstation',
      duration: '2h 00m',
      frequency: 'On Demand 24/7',
      estimatedCostInr: 2800,
      bookingPortal: 'kstdc.co / cab aggregators',
      proTip: 'Stop at Maddur Tiffany’s or Empire for classic Maddur Vada and South Indian filter coffee.'
    }
  ],
  'bengaluru-hampi': [
    {
      mode: 'express_train',
      modeLabel: 'Hampi Express (#16592) Overnight Sleeper / 3AC',
      provider: 'South Western Railway (IRCTC)',
      duration: '8h 45m',
      frequency: 'Daily departing KSR Bengaluru at 21:50, arrives Hosapete at 07:05 AM',
      estimatedCostInr: 920,
      bookingPortal: 'irctc.co.in',
      proTip: 'The classic traveller choice. Board in Bangalore after dinner, wake up at Hosapete junction ready for morning temple visits.'
    },
    {
      mode: 'ksrtc_airavat',
      modeLabel: 'KSRTC Ambaari Dream Class (Multi-Axle AC Sleeper)',
      provider: 'KSRTC',
      duration: '7h 30m',
      frequency: 'Evening departures from Kempegowda Bus Station (22:00, 22:45)',
      estimatedCostInr: 890,
      bookingPortal: 'ksrtc.in',
      proTip: 'Ultra-plush Scandinavian-style sleeper berths with USB charging and smooth air suspension.'
    },
    {
      mode: 'flight',
      modeLabel: 'Alliance Air Direct Flight (BLR -> VDY Jindal Vidyanagar)',
      provider: 'Alliance Air',
      duration: '1h 05m (plus 40m taxi to Hampi)',
      frequency: 'Daily direct regional flight',
      estimatedCostInr: 3200,
      bookingPortal: 'allianceair.in',
      proTip: 'Land at Vidyanagar airport inside JSW township, only 38km from Hampi ruins. Saves an entire overnight journey.'
    }
  ],
  'bengaluru-coorg': [
    {
      mode: 'ksrtc_airavat',
      modeLabel: 'KSRTC Flybus / Airavat Club Class Direct to Madikeri',
      provider: 'KSRTC',
      duration: '5h 30m',
      frequency: 'Departs both BLR Airport (Flybus) and Satellite Bus Stand every 1-2 hours',
      estimatedCostInr: 680,
      bookingPortal: 'ksrtc.in',
      proTip: 'If landing at BLR Airport, board the direct Flybus to Madikeri without navigating city traffic!'
    },
    {
      mode: 'taxi_car',
      modeLabel: 'Private SUV via Mysore Expressway & Kushalnagar',
      provider: 'Private Car / Self-Drive (Zoomcar/Revv)',
      duration: '5h 00m',
      frequency: 'Flexible departure',
      estimatedCostInr: 4500,
      bookingPortal: 'kstdc.co / Zoomcar',
      proTip: 'Stop at Bylakuppe Golden Temple en route to Madikeri for Tibetan thukpa and momos.'
    }
  ],
  'bengaluru-chikmagalur': [
    {
      mode: 'ksrtc_airavat',
      modeLabel: 'KSRTC Rajahamsa / Airavat Express',
      provider: 'KSRTC',
      duration: '4h 45m',
      frequency: 'Every hour from Kempegowda Bus Station (Majestic)',
      estimatedCostInr: 460,
      bookingPortal: 'ksrtc.in',
      proTip: 'Route goes via NH75 to Hassan and Belur. Stop by the Chennakeshava Temple if self-driving!'
    },
    {
      mode: 'express_train',
      modeLabel: 'Jan Shatabdi / Intercity to Kadur or Chikkamagaluru',
      provider: 'Indian Railways (IRCTC)',
      duration: '3h 30m to Kadur + 45m local bus/cab',
      frequency: 'Daily morning & afternoon services',
      estimatedCostInr: 320,
      bookingPortal: 'irctc.co.in',
      proTip: 'Disembark at Kadur Junction (DRU); shared cabs and KSRTC shuttles connect to Chikmagalur every 10 mins.'
    }
  ],
  'bengaluru-gokarna': [
    {
      mode: 'ksrtc_airavat',
      modeLabel: 'KSRTC Ambaari Dream Class AC Sleeper',
      provider: 'KSRTC',
      duration: '9h 30m',
      frequency: 'Daily evening buses (20:30, 21:30) from Majestic',
      estimatedCostInr: 1250,
      bookingPortal: 'ksrtc.in',
      proTip: 'Arrives directly at Gokarna town bus stand at 06:30 AM, just in time for breakfast on Kudle Beach.'
    },
    {
      mode: 'express_train',
      modeLabel: 'Panchaganga SF Express (#16595) via Western Ghats',
      provider: 'South Western Railway',
      duration: '11h 20m',
      frequency: 'Departs KSR Bengaluru 18:50, arrives Gokarna Road (GOK) 06:18 AM',
      estimatedCostInr: 680,
      bookingPortal: 'irctc.co.in',
      proTip: 'Spectacular engineering crossing Sakleshpur-Subrahmanya ghats. Highly recommended train for scenic rail buffs.'
    }
  ],
  'mysuru-coorg': [
    {
      mode: 'ksrtc_airavat',
      modeLabel: 'KSRTC Airavat / Sarige Express',
      provider: 'KSRTC',
      duration: '2h 45m',
      frequency: 'Every 30 minutes from Mysuru KSRTC Sub-urban Bus Stand',
      estimatedCostInr: 210,
      bookingPortal: 'ksrtc.in',
      proTip: 'Scenic winding roads ascending through Kushalnagar coffee gardens.'
    },
    {
      mode: 'taxi_car',
      modeLabel: 'Scenic Day Cab via Dubare Elephant Camp',
      provider: 'Local Mysuru Taxi Stand / KSTDC',
      duration: '2h 15m',
      frequency: 'On demand',
      estimatedCostInr: 2200,
      bookingPortal: 'mysoretaxis.com',
      proTip: 'Combine with a 2-hour morning stop at Dubare Elephant Camp along the Cauvery River.'
    }
  ]
};

export const CLASSIC_ITINERARIES: ItineraryPlan[] = [
  {
    id: 'karnataka-classic-heritage',
    title: 'Royal Dynasties & Stone Carvings: Mysuru to Hampi',
    tagline: '7-Day UNESCO Heritage, Palaces, and Bouldered Kingdoms',
    summary: 'A journey through Karnataka’s grandeur: from the illuminated palaces of the Wadiyars in Mysuru to the Hoysala temple sculptures in Belur & Halebidu, culminating in the 14th-century boulder-strewn ruins of the Vijayanagara Empire in Hampi.',
    durationDays: 7,
    startingCity: 'Bengaluru',
    routeStops: ['Bengaluru', 'Mysuru', 'Belur & Halebidu', 'Hampi', 'Bengaluru'],
    estimatedBudgetInr: {
      total: 28500,
      perPerson: 14250,
      breakdown: {
        stays: 14000,
        transit: 4800,
        food: 5200,
        activities: 2500,
        contingency: 2000
      }
    },
    days: [
      {
        dayNumber: 1,
        theme: 'Arrival & Colonial Greenery of Bengaluru',
        cityOrHub: 'Bengaluru',
        highlights: ['Cubbon Park stroll', 'Lalbagh Glass House', 'Iconic filter coffee at MTR', 'Bangalore Palace'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '08:30 AM - 11:30 AM',
            title: 'Lalbagh Botanical Gardens & Heritage Breakfast',
            location: 'Mavalli / Lalbagh',
            description: 'Walk through the 240-acre botanical marvel commissioned by Hyder Ali. Marvel at the 1889 Glass House inspired by London’s Crystal Palace, then walk 200m to the legendary MTR (1924) for rava idli and filter coffee.',
            entryFeeInr: 50,
            bestTimeToVisit: 'Early morning for bird songs',
            mustTryFoodOrExperience: 'MTR Masala Dosa & Pure Ghee Rava Idli',
            tag: 'Heritage & Botanical'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '01:30 PM - 04:30 PM',
            title: 'Bangalore Palace & Tudor Architecture Tour',
            location: 'Vasanth Nagar',
            description: 'Explore the wooden carvings, turrets, and memorabilia of the Wadiyar royal family set in sprawling gardens.',
            entryFeeInr: 250,
            tag: 'Royal Heritage'
          },
          {
            timeSlot: 'Evening',
            timeRange: '05:30 PM - 08:30 PM',
            title: 'Vidhana Soudha & Cubbon Park Evening Promenade',
            location: 'Ambedkar Veedhi',
            description: 'View the Neo-Dravidian granite facade of Karnataka’s state legislature (lit up on Sundays and holidays), followed by a walk under Cubbon Park’s ancient mahogany trees.',
            entryFeeInr: 0,
            tag: 'Architectural Icon'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'mys-2'),
        localFoodTips: ['Filter Coffee from Brahmin’s Coffee Bar', 'Benne Dosa at CTR Malleshwaram'],
        transitToNext: TRANSIT_ROUTES_DATABASE['bengaluru-mysuru'][0]
      },
      {
        dayNumber: 2,
        theme: 'The Grandeur of the Wadiyars & Devaraja Fragrances',
        cityOrHub: 'Mysuru',
        highlights: ['Mysore Palace interior & Durbar hall', 'Chamundi Hill panoramic view', 'Devaraja Market spice walk', 'Mysore Pak tasting'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '09:00 AM - 12:30 PM',
            title: 'Amba Vilas (Mysore Palace) Private Tour',
            location: 'Sayyaji Rao Road, Mysuru',
            description: 'One of India’s most visited monuments. Admire the stained glass ceilings, peacock courtyard, carved rosewood doorways, and golden howdah.',
            entryFeeInr: 100,
            tag: 'UNESCO Cultural Icon'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '02:30 PM - 05:00 PM',
            title: 'Chamundeshwari Temple & Nandi Bull Statue',
            location: 'Chamundi Hills',
            description: 'Drive up Chamundi hill overlooking the entire city. Pay homage at the Dravidian gopuram and see the massive monolithic 16-foot Nandi Bull carved from single granite rock.',
            entryFeeInr: 0,
            tag: 'Panoramic Hill View'
          },
          {
            timeSlot: 'Evening',
            timeRange: '06:00 PM - 08:30 PM',
            title: 'Devaraja Market Walking Trail & Palace Illumination',
            location: 'Devaraja Mohalla',
            description: 'Vibrant 130-year-old market overflowing with conical piles of kumkum powder, fragrant jasmine garlands, and Mysore sandalwood oil. Finish with live Mysore Palace lighting on Sunday evening.',
            entryFeeInr: 0,
            mustTryFoodOrExperience: 'Guru Sweets Store (original creators of Mysore Pak)',
            tag: 'Local Bazaar'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'mys-1'),
        localFoodTips: ['Mylari Dosa with white butter on Nazarbad Main Road', 'Authentic melt-in-mouth Mysore Pak from Guru Sweets']
      },
      {
        dayNumber: 3,
        theme: 'Tipu Sultan’s Stronghold & The Hoysala Masterpieces',
        cityOrHub: 'Srirangapatna to Hassan',
        highlights: ['Dariya Daulat Bagh', 'Chennakeshava Temple Belur', 'Halebidu Hoysaleshwara sculptures'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '08:30 AM - 11:30 AM',
            title: 'Srirangapatna Island Fortress & Summer Palace',
            location: 'Srirangapatna (Cauvery River island)',
            description: 'Visit Tipu Sultan’s teakwood summer palace adorned with battle frescoes, followed by the Colonel Bailey’s dungeon.',
            entryFeeInr: 25,
            tag: 'Historic Battlefield'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '01:30 PM - 05:00 PM',
            title: 'Belur Chennakeshava & Halebidu Hoysaleshwara',
            location: 'Belur & Halebidu (UNESCO World Heritage 2023)',
            description: 'Marvel at 12th-century star-shaped temples with soapstone reliefs so intricate they resemble ivory carvings—featuring dancing celestial nymphs (Madanikas).',
            entryFeeInr: 40,
            tag: 'UNESCO Star Temples'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'chk-2'),
        localFoodTips: ['Hassan Akki Rotti with coconut chutney', 'Filter coffee by the ghats'],
        transitToNext: TRANSIT_ROUTES_DATABASE['bengaluru-hampi'][0]
      },
      {
        dayNumber: 4,
        theme: 'Across the Deccan Plains to the Forgotten Empire',
        cityOrHub: 'Hampi',
        highlights: ['Virupaksha Temple at sunset', 'Hemakuta Hill temples', 'Tungabhadra river walk'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '09:00 AM - 12:00 PM',
            title: 'Arrival & Check-in amid Boulders',
            location: 'Kamalapura / Hampi Bazaar',
            description: 'Arrive via train at Hosapete and transfer to Hampi. Check in and soak in the surreal prehistoric boulder-strewn skyline.',
            entryFeeInr: 0,
            tag: 'Landscape Arrival'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '03:30 PM - 06:30 PM',
            title: 'Virupaksha Temple & Hemakuta Hill Sunset',
            location: 'Hampi Bazaar',
            description: 'Active 7th-century sanctuary dedicated to Lord Shiva with an inverted pinhole shadow phenomenon. Climb the gentle Hemakuta slopes for golden sunset over ruins.',
            entryFeeInr: 50,
            tag: 'Living Heritage'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'hmp-2'),
        localFoodTips: ['Mango Tree Restaurant thali', 'Wood-fired pizza and fresh juices near Anegundi']
      },
      {
        dayNumber: 5,
        theme: 'The Musical Pillars & Royal Enclosure of Vijayanagara',
        cityOrHub: 'Hampi',
        highlights: ['Vijaya Vittala Stone Chariot', 'Musical resonance pillars', 'Lotus Mahal', 'Elephant Stables', 'Coracle ride'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '06:30 AM - 10:30 AM',
            title: 'Vijaya Vittala Temple & The Iconic Stone Chariot',
            location: 'Vittala Complex',
            description: 'Visit the centerpiece of Hampi seen on the Indian ₹50 currency note. Walk through the hall of 56 resonant musical pillars.',
            entryFeeInr: 40,
            bestTimeToVisit: 'Early morning to beat the afternoon heat',
            tag: 'Iconic Wonder'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '02:30 PM - 05:00 PM',
            title: 'Zenana Enclosure, Lotus Mahal & Elephant Stables',
            location: 'Royal Enclosure',
            description: 'Indo-Islamic architectural synthesis where the royal elephants of Krishnadevaraya were housed, alongside tiered stepped tanks.',
            entryFeeInr: 40,
            tag: 'Imperial Splendor'
          },
          {
            timeSlot: 'Evening',
            timeRange: '05:15 PM - 07:00 PM',
            title: 'Tungabhadra River Coracle Ride',
            location: 'Kodi Rama Temple bank',
            description: 'Glide across the sacred river in a traditional woven round basket boat past granite cliffs and temple carvings.',
            entryFeeInr: 300,
            mustTryFoodOrExperience: 'Round coracle ride at sunset',
            tag: 'River Experience'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'hmp-1'),
        localFoodTips: ['Jowar Rotti with brinjal curry (Yennegayi) - North Karnataka specialty']
      },
      {
        dayNumber: 6,
        theme: 'Sunrise over Matanga Hill & The Bohemian North Bank',
        cityOrHub: 'Hampi / Anegundi',
        highlights: ['Matanga Hill 360-degree sunrise', 'Sanapur Lake boulder cliff jumping', 'Anjaneya Hill (Monkey Temple)'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '05:30 AM - 08:30 AM',
            title: 'Matanga Hill Sunrise Trek',
            location: 'Central Hampi',
            description: 'The highest point in central Hampi. Climb the stepped trail in pre-dawn twilight to watch the sunrise bathe the ancient boulder landscape in amber glow.',
            entryFeeInr: 0,
            tag: 'Top Sunrise Vantage'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '01:00 PM - 05:00 PM',
            title: 'Anegundi Village & Sanapur Lake Exploration',
            location: 'Anegundi (Mythological Kishkindha)',
            description: 'Cross the river to mythic Kishkindha. Chill beside emerald Sanapur lake enclosed by towering granite stacks.',
            entryFeeInr: 0,
            tag: 'Nature & Myth'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'hmp-3'),
        localFoodTips: ['Local banana flower curry', 'Fresh pomegranate and tender coconut water'],
        transitToNext: TRANSIT_ROUTES_DATABASE['bengaluru-hampi'][0]
      },
      {
        dayNumber: 7,
        theme: 'Return to Bengaluru via Chitradurga Fort of Seven Circles',
        cityOrHub: 'Chitradurga & Bengaluru',
        highlights: ['Chitradurga Kallina Kote (Stone Fort)', 'Onake Obavva crevice', 'Farewell dinner in Bengaluru'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '09:00 AM - 01:00 PM',
            title: 'Chitradurga Fort (Palace of 7 Concentric Walls)',
            location: 'Chitradurga (NH 48 en route to Bangalore)',
            description: 'Impregnable granite fortress with 19 gateways, 38 postern gates, and ingenious rainwater harvesting tanks. Hear the heroic tale of Onake Obavva.',
            entryFeeInr: 25,
            tag: 'Fortress Wonder'
          },
          {
            timeSlot: 'Evening',
            timeRange: '06:00 PM - 09:30 PM',
            title: 'Return to Bengaluru & Craft Brewery Farewell',
            location: 'Indiranagar / MG Road, Bengaluru',
            description: 'Celebrate the journey with Karnataka craft beers (mango ales, jaggery stouts) at Toit or Arbor Brewing Company.',
            entryFeeInr: 0,
            tag: 'Celebration'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'mys-2'),
        localFoodTips: ['Davanagere Benne Dose (crispy butter dosa with spicy potato palya) near Chitradurga']
      }
    ],
    packingAdvice: [
      'Comfortable hiking shoes with sturdy grip for granite boulder climbs at Hampi',
      'Cotton, breathable clothing and broad sun hat (Hampi gets warm even in winter)',
      'Modest attire covering knees and shoulders for active temple sanctums',
      'Refillable insulated water bottle & sunscreen',
      'Power bank for long days exploring outdoor monuments'
    ],
    localPhrases: [
      { kannada: 'Namaskara', english: 'Hello / Greetings', pronunciation: 'Nah-mas-KAH-rah' },
      { kannada: 'Dhanyavada', english: 'Thank you', pronunciation: 'Dhahn-yah-VAH-dah' },
      { kannada: 'Eshtu aagutthe?', english: 'How much does this cost?', pronunciation: 'Esh-too ah-GOO-teh?' },
      { kannada: 'Oota aayitha?', english: 'Did you have food? (Courteous greeting)', pronunciation: 'Oo-tah EYE-tah?' },
      { kannada: 'Hampi raste ellide?', english: 'Where is the road to Hampi?', pronunciation: 'Hahm-pee RAH-steh EL-lee-deh?' }
    ],
    emergencyHelplines: [
      { name: 'Karnataka Tourism Police', contact: '112 / +91 80 2235 2828' },
      { name: 'KSRTC 24/7 Helpline', contact: '080-49596666' },
      { name: 'Hosapete Railway Police', contact: '139' },
      { name: 'Medical Emergency (Ambulance)', contact: '108' }
    ],
    isAiGenerated: false,
    generatedAt: '2026-10-19'
  },
  {
    id: 'karnataka-misty-ghats',
    title: 'Misty Mountains & Coffee Trails: Coorg & Chikmagalur',
    tagline: '5-Day Western Ghats, Coffee Estates & High Mountain Treks',
    summary: 'Immerse in the verdant Western Ghats. Breathe in the crisp aroma of arabica blossoms, trek Karnataka’s highest peak at Mullayanagiri, and experience warm Kodava hospitality.',
    durationDays: 5,
    startingCity: 'Bengaluru',
    routeStops: ['Bengaluru', 'Chikmagalur', 'Coorg (Madikeri)', 'Bengaluru'],
    estimatedBudgetInr: {
      total: 22000,
      perPerson: 11000,
      breakdown: {
        stays: 11000,
        transit: 3800,
        food: 4200,
        activities: 1800,
        contingency: 1200
      }
    },
    days: [
      {
        dayNumber: 1,
        theme: 'Ascent to the Coffee Capital',
        cityOrHub: 'Chikmagalur',
        highlights: ['Scenic NH 75 highway drive', 'Belur temple stop', 'Coffee estate plantation walk', 'Evening bonfire'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '06:30 AM - 11:30 AM',
            title: 'Drive from Bengaluru to Chikmagalur via Hassan',
            location: 'NH 75 Corridor',
            description: 'Early morning start beating city traffic. Stop for traditional Thatte Idli at Bidadi and hot filter coffee at Hassan.',
            entryFeeInr: 0,
            tag: 'Scenic Drive'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '02:30 PM - 05:30 PM',
            title: 'Private Coffee Estate & Spice Trail Walk',
            location: 'Mugthihalli',
            description: 'Learn how raw coffee cherries are harvested, pulped, and roasted alongside wild pepper vines, nutmeg, and cardamom bushes.',
            entryFeeInr: 150,
            mustTryFoodOrExperience: 'Freshly roasted estate peaberry coffee',
            tag: 'Plantation Immersion'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'chk-1'),
        localFoodTips: ['Malnad Akki Rotti with spicy chicken or raw jackfruit curry', 'Kadamuttu (rice balls) with vegetable stew'],
        transitToNext: TRANSIT_ROUTES_DATABASE['bengaluru-chikmagalur'][0]
      },
      {
        dayNumber: 2,
        theme: 'Conquering Mullayanagiri & Baba Budan Hills',
        cityOrHub: 'Chikmagalur',
        highlights: ['Mullayanagiri peak summit (1,930m)', 'Baba Budangiri shrine', 'Buttermilk falls (Jhari Falls)'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '06:00 AM - 10:00 AM',
            title: 'Mullayanagiri Summit Cloud Walk',
            location: 'Mullayanagiri (Karnataka’s highest point)',
            description: 'Climb the 500 stone steps leading to the hilltop Shiva temple above a blanket of swirling monsoon/winter mist.',
            entryFeeInr: 0,
            bestTimeToVisit: 'Early morning to catch the ocean of clouds',
            tag: 'Summit Viewpoint'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '01:30 PM - 04:30 PM',
            title: 'Jhari Falls (Buttermilk Falls) 4x4 Jeep Safari',
            location: 'Attigundi',
            description: 'Thrilling off-road 4WD ride down steep plantation terrain to a crystal-clear mountain pool cascading from green cliffs.',
            entryFeeInr: 400,
            tag: 'Waterfall Adventure'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'chk-3'),
        localFoodTips: ['Steaming Mysore filter coffee at hilltop stalls', 'Authentic Malnad Thali at Town Canteen']
      },
      {
        dayNumber: 3,
        theme: 'Through Bisle Ghat to Kodagu (Scotland of India)',
        cityOrHub: 'Madikeri, Coorg',
        highlights: ['Namdroling Golden Temple Bylakuppe', 'Abbey Falls cascade', 'Raja’s Seat sunset'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '08:30 AM - 12:00 PM',
            title: 'Namdroling Tibetan Monastery (Golden Temple)',
            location: 'Bylakuppe',
            description: 'One of the largest Tibetan Buddhist settlements in exile. Gaze at the 40-foot gilded statues of Buddha Shakyamuni, Padmasambhava, and Amitayus.',
            entryFeeInr: 0,
            tag: 'Peaceful Sanctuary'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '02:30 PM - 04:30 PM',
            title: 'Abbey Falls Hanging Bridge',
            location: 'Madikeri outskirts',
            description: 'Roaring waterfall tumbling between private coffee estates and dense spice groves, viewed from a pedestrian suspension bridge.',
            entryFeeInr: 30,
            tag: 'Scenic Cascade'
          },
          {
            timeSlot: 'Evening',
            timeRange: '05:30 PM - 07:00 PM',
            title: 'Raja’s Seat Musical Fountain & Sunset',
            location: 'Madikeri Town',
            description: 'The vantage point where the Kings of Kodagu watched sunset over the endless rolling hills of the Western Ghats.',
            entryFeeInr: 20,
            tag: 'Sunset Pavilion'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'crg-1'),
        localFoodTips: ['Kodava Pandi Curry (or Mushroom/Jackfruit Curry with Kachampuli vinegar)', 'Noolputtu (string hoppers) with coconut milk'],
        transitToNext: TRANSIT_ROUTES_DATABASE['mysuru-coorg'][0]
      },
      {
        dayNumber: 4,
        theme: 'River Cauvery Source & Elephant Camp',
        cityOrHub: 'Coorg',
        highlights: ['Tala Kaveri (source of River Cauvery)', 'Dubare Elephant interaction', 'Kodava spice shopping'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '08:00 AM - 11:30 AM',
            title: 'Tala Kaveri & Brahmagiri Hill Climb',
            location: 'Brahmagiri Range',
            description: 'Pilgrimage site where the holy river Cauvery emerges as a sacred spring. Hike the stairs to Brahmagiri peak for 360-degree views of dense rainforest.',
            entryFeeInr: 0,
            tag: 'Sacred Source'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '01:30 PM - 04:30 PM',
            title: 'Dubare Elephant Camp along Cauvery River',
            location: 'Dubare Forest',
            description: 'Cross the river by boat to observe Asian elephants being bathed and fed by their mahouts with natural river reeds.',
            entryFeeInr: 100,
            tag: 'Wildlife Encounter'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'crg-2'),
        localFoodTips: ['Madikeri homemade chocolates & estate spices', 'Fresh honey collected from Western Ghats hives']
      },
      {
        dayNumber: 5,
        theme: 'Farewell Kodagu via Mysuru Expressway',
        cityOrHub: 'Madikeri to Bengaluru',
        highlights: ['Madikeri Fort & Palace', 'Sandalwood soap shopping', 'Return via expressway'],
        activities: [
          {
            timeSlot: 'Morning',
            timeRange: '09:00 AM - 11:30 AM',
            title: 'Madikeri Fort & District Museum',
            location: 'Madikeri',
            description: '17th-century fort rebuilt in granite by Tipu Sultan, housing life-size stone elephant statues and a heritage museum.',
            entryFeeInr: 25,
            tag: 'Kodava History'
          },
          {
            timeSlot: 'Afternoon',
            timeRange: '01:00 PM - 06:30 PM',
            title: 'Scenic Return Drive to Bengaluru',
            location: 'Mysuru Expressway Corridor',
            description: 'Smooth ride via the 10-lane expressway with a coffee break at Maddur.',
            entryFeeInr: 0,
            tag: 'Return Journey'
          }
        ],
        recommendedStay: CURATED_HOTELS.find(h => h.id === 'mys-2'),
        localFoodTips: ['Tender coconut and Maddur Vada on the highway']
      }
    ],
    packingAdvice: [
      'Light rain jacket or windbreaker (weather changes quickly in the hills)',
      'Warm fleece or sweater for chilly Madikeri & Mullayanagiri mornings (14°C - 18°C)',
      'Leech socks or salt if visiting trails during or immediately after monsoon',
      'Good walking shoes for wet estate paths',
      'Motion sickness medicine if prone to ghat road hairpin turns'
    ],
    localPhrases: [
      { kannada: 'Idhu tumba sundaravagide', english: 'This is very beautiful', pronunciation: 'Ee-dhoo toom-bah soon-dah-rah-VAH-gee-deh' },
      { kannada: 'Coffee thindi siguttha?', english: 'Can we get coffee and snacks?', pronunciation: 'Coffee thin-dee see-goo-THAH?' },
      { kannada: 'Neeru kodi', english: 'Please give water', pronunciation: 'Nee-roo koh-DEE' }
    ],
    emergencyHelplines: [
      { name: 'Kodagu District Disaster Management', contact: '08272-221077 / 1077' },
      { name: 'Chikmagalur Police Control Room', contact: '08262-230401' },
      { name: 'KSRTC Madikeri Depot', contact: '08272-228362' }
    ],
    isAiGenerated: false,
    generatedAt: '2026-10-19'
  }
];
