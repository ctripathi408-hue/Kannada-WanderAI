# Karnataka WanderAI ✈️🚆

**AI-powered, personalized travel & transit planner for Karnataka.**

🔗 **Live demo:** https://karnataka-wanderai-personalized-travel-transit-pl.ai.studio/

TEST CREDENTIALS-testcredentials330@gmail.com
password-Test@1234


## 📌 Overview

Karnataka WanderAI helps travelers plan trips across Karnataka, from the heritage of Hampi and Badami to the coffee hills of Coorg and Chikmagalur, the coast of Gokarna and Udupi, and the city life of Bengaluru and Mysuru. Instead of juggling blogs, maps, bus apps and booking sites, users describe their trip and get a single, personalized plan.

## ❗ Problem Statement

> AI Travel Planner for Karnataka
Develop an AI-powered travel planner that creates personalized Karnataka itineraries
based on a traveller’s interests, available time, budget, and preferred type of
experience.

Planning a trip in Karnataka today usually means:

- Searching across many disconnected sources for places, routes and stays
- Generic, one-size-fits-all itineraries that ignore budget, interests and travel style
- Confusing local transit options (KSRTC buses, trains, metro, cabs) with no unified view
- Difficulty finding suitable local hotels for a given budget and location

## 💡 Our Solution

WanderAI uses generative AI to turn a traveler's preferences into a complete plan:

- **Personalized itineraries:** day-wise plans based on interests, duration, budget and travel style
- **Transit options:** suggested ways to get between and around destinations
- **Local hotel recommendations:** stay suggestions that fit the traveler's budget and itinerary
- **Karnataka-focused:** tuned to regional destinations, culture and travel patterns

## ✨ Features

- Natural-language trip input
- AI-generated day-by-day itineraries
- Transit and route suggestions between stops
- Hotel and stay recommendations
- Clean, responsive UI for mobile and desktop

## 🆚 How It's Different

| Existing approach | Karnataka WanderAI |
|---|---|
| Generic travel blogs and listicles | Plans personalized to each user |
| Separate apps for routes, stays and sightseeing | One unified itinerary, transit and stay plan |
| Pan-India or global coverage, shallow on regional detail | Focused on Karnataka |
| Manual research and comparison | AI does the research and stitching |

## 🏗️ Architecture


User ──► Web UI (preferences input)
            │
            ▼
      Prompt builder
            │
            ▼
   Generative AI model (itinerary + transit + hotels)
            │
            ▼
   Structured response ──► Itinerary view


## 🧰 Tech Stack

- **Built with:** Google AI Studio
- **AI model:** Gemini API
- **Frontend:** React + TypeScript, Tailwind CSS _
- **Hosting:** AI Studio deployment

## 🚀 Getting Started

### Use the live app

Open https://karnataka-wanderai-personalized-travel-transit-pl.ai.studio/

### Run locally


# 1. Clone the repo
git clone https://github.com/<your-username>/karnataka-wanderai.git
cd karnataka-wanderai

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start the dev server
npm run dev


## 📖 Usage

1. Enter your destination(s) in Karnataka, trip length, budget and interests.
2. Submit your request.
3. Review the generated itinerary, transit suggestions and hotel picks.
4. Adjust preferences and regenerate as needed.

## 🗺️ Roadmap

- Real-time bus and train data
- Booking integrations
- Kannada and Hindi language support
- Offline itinerary export (PDF)
- Map view with routes

     THANKYOU
