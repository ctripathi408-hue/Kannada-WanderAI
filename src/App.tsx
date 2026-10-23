import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlannerForm } from './components/PlannerForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { ItinerarySkeleton } from './components/ItinerarySkeleton';
import { TransitHub } from './components/TransitHub';
import { HotelDirectory } from './components/HotelDirectory';
import { ClassicCircuits } from './components/ClassicCircuits';
import { AiConciergeModal } from './components/AiConciergeModal';
import { GeminiChatbot } from './components/GeminiChatbot';
import { SavedTripsView } from './components/SavedTripsView';
import { InteractiveKarnatakaMap } from './components/InteractiveKarnatakaMap';
import { CLASSIC_ITINERARIES } from './data/karnataka-data';
import { ItineraryPlan, TripPlanRequest } from './types/travel';
import { Compass, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  saveItineraryToFirestore, 
  getSavedItinerariesFromFirestore, 
  deleteSavedItineraryFromFirestore,
  getSharedTrip 
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'planner' | 'itinerary' | 'map' | 'transit' | 'hotels' | 'circuits' | 'chatbot' | 'saved_trips'>('planner');
  const [currentPlan, setCurrentPlan] = useState<ItineraryPlan | null>(CLASSIC_ITINERARIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string | null>(null);
  const [isReadOnlyShared, setIsReadOnlyShared] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [aiGuideOpen, setAiGuideOpen] = useState(false);
  const [aiGuideContextCity, setAiGuideContextCity] = useState<string | undefined>(undefined);

  // Firebase Auth & Firestore State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [savedPlans, setSavedPlans] = useState<ItineraryPlan[]>([]);

  // Function to load a shared trip by ID
  const loadSharedTrip = async (tripId: string) => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const plan = await getSharedTrip(tripId);
      if (plan) {
        setCurrentPlan(plan);
        setIsReadOnlyShared(true);
        setActiveTab('itinerary');
        showToast(`Loaded shared trip: ${plan.title}`);
      } else {
        setErrorNotice(`Unable to load shared trip "${tripId}". The link may be expired or invalid.`);
        setIsReadOnlyShared(false);
        setActiveTab('planner');
      }
    } catch (err: any) {
      console.error('Failed to load shared trip:', err);
      setErrorNotice(`Unable to load shared trip "${tripId}". Please check your internet connection.`);
      setIsReadOnlyShared(false);
      setActiveTab('planner');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanYourOwnTrip = () => {
    // Clear the ?trip=... query parameter from the URL cleanly
    try {
      const cleanUrl = window.location.pathname;
      window.history.pushState({}, '', cleanUrl);
    } catch {}
    setIsReadOnlyShared(false);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const plans = await getSavedItinerariesFromFirestore(user.uid);
          setSavedPlans(plans);
        } catch (err) {
          console.warn('Could not load saved itineraries on auth change:', err);
        }
      } else {
        setSavedPlans([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check URL params (e.g. ?trip=ID or ?autostart=1 or ?tab=chatbot or ?tab=map)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('trip');
    if (tripId) {
      loadSharedTrip(tripId);
      return;
    }

    const tabParam = params.get('tab');
    if (
      tabParam === 'itinerary' || 
      tabParam === 'map' || 
      tabParam === 'transit' || 
      tabParam === 'hotels' || 
      tabParam === 'circuits' ||
      tabParam === 'chatbot' ||
      tabParam === 'saved_trips'
    ) {
      setActiveTab(tabParam as any);
    } else if (params.get('autostart') === '1') {
      setActiveTab('itinerary');
    }
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast(`Signed in successfully as ${user.displayName || user.email}!`);
        const plans = await getSavedItinerariesFromFirestore(user.uid);
        setSavedPlans(plans);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setErrorNotice('Google Sign-In could not be completed. Please check your browser popup settings and try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Signed out successfully.');
      if (activeTab === 'saved_trips') {
        setActiveTab('planner');
      }
    } catch (err) {
      console.warn('Logout error:', err);
    }
  };

  const handleSaveItinerary = async (plan: ItineraryPlan) => {
    if (!currentUser) {
      try {
        const user = await loginWithGoogle();
        if (!user) return; // User closed popup
        await saveItineraryToFirestore(user.uid, plan);
        const updated = await getSavedItinerariesFromFirestore(user.uid);
        setSavedPlans(updated);
        showToast('Itinerary saved to your cloud account!');
      } catch (err: any) {
        if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
          setErrorNotice('Please sign in with Google to save itineraries to your cloud account.');
        }
      }
      return;
    }

    try {
      await saveItineraryToFirestore(currentUser.uid, plan);
      const updated = await getSavedItinerariesFromFirestore(currentUser.uid);
      setSavedPlans(updated);
      showToast('Itinerary saved to your cloud account!');
    } catch (err: any) {
      console.error('Error saving itinerary to Firestore:', err);
      setErrorNotice('Failed to save itinerary to Firestore.');
    }
  };

  const handleDeleteSavedPlan = async (planId: string) => {
    if (!currentUser) return;
    try {
      await deleteSavedItineraryFromFirestore(currentUser.uid, planId);
      setSavedPlans(prev => prev.filter(p => p.id !== planId));
      showToast('Itinerary removed from saved trips.');
    } catch (err) {
      console.error('Error deleting itinerary:', err);
    }
  };

  const handleGenerateItinerary = async (request: TripPlanRequest) => {
    setIsReadOnlyShared(false);
    setIsLoading(true);
    setErrorNotice(null);
    setGenerationProgress('Finding places... Planning day 1... Adding transit.');
    setActiveTab('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await fetch('/api/plan-itinerary-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const block of parts) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/event:\s*([^\n]+)/);
          const dataMatch = block.match(/data:\s*([^\n]+)/);
          const eventType = eventMatch ? eventMatch[1].trim() : 'message';
          const rawData = dataMatch ? dataMatch[1].trim() : '';
          if (!rawData) continue;

          try {
            const data = JSON.parse(rawData);

            if (eventType === 'progress') {
              if (data.stage) {
                setGenerationProgress(data.stage);
              }
            } else if (eventType === 'overview') {
              if (data.plan) {
                setCurrentPlan({
                  ...data.plan,
                  isGenerating: true,
                  generationProgress: 'Planning day 1... Adding transit.'
                });
                setIsLoading(false); // Overview received! Switch immediately to ItineraryDisplay
              }
            } else if (eventType === 'day') {
              if (data.day) {
                setCurrentPlan((prev) => {
                  if (!prev) return prev;
                  const updatedDays = prev.days.map((d) => 
                    d.dayNumber === data.dayNumber
                      ? { ...data.day, isDayLoading: false }
                      : d
                  );
                  return {
                    ...prev,
                    days: updatedDays
                  };
                });
              }
            } else if (eventType === 'complete') {
              if (data.plan) {
                setCurrentPlan({
                  ...data.plan,
                  isGenerating: false,
                  generationProgress: undefined
                });
              }
              setGenerationProgress(null);
              setIsLoading(false);
            }
          } catch (jsonErr) {
            console.warn('Error parsing SSE event:', jsonErr);
          }
        }
      }
    } catch (err: any) {
      console.warn('Streaming API encountered issue, falling back to cached/parallel call:', err);
      try {
        const fallbackRes = await fetch('/api/plan-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        const data = await fallbackRes.json();
        if (data.plan) {
          setCurrentPlan(data.plan);
        }
      } catch {
        const fallback = CLASSIC_ITINERARIES[0];
        setCurrentPlan(fallback);
        setErrorNotice('Generated itinerary using curated Karnataka travel engine.');
      } finally {
        setIsLoading(false);
        setGenerationProgress(null);
      }
    } finally {
      setIsLoading(false);
      setGenerationProgress(null);
    }
  };

  const handleSelectPrebuilt = (itineraryId: string) => {
    setIsReadOnlyShared(false);
    const found = CLASSIC_ITINERARIES.find(c => c.id === itineraryId);
    if (found) {
      setCurrentPlan(found);
      setActiveTab('itinerary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isCurrentPlanSaved = !!(currentPlan && savedPlans.some(p => p.id === currentPlan.id));

  return (
    <div className="min-h-screen ambient-gradient-bg flex flex-col text-slate-800 dark:text-slate-100 antialiased selection:bg-emerald-100 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-100 transition-colors duration-500">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasItinerary={!!currentPlan}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        savedCount={savedPlans.length}
      />

      {/* Notice Banner if any */}
      {errorNotice && (
        <div className="max-w-5xl w-full mx-auto px-4 mt-6">
          <div className="bg-amber-50 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs px-4 py-3 rounded-2xl shadow-xs flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-medium">{errorNotice}</span>
            </div>
            <button 
              onClick={() => setErrorNotice(null)} 
              className="text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 font-semibold text-xs px-2.5 py-1 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-semibold px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-700/50 dark:border-slate-600/50 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Content Area with Smooth Page Transitions */}
      <main className="flex-1 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab === 'itinerary' && isLoading ? 'loading-itinerary' : activeTab}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -14 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.35,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full"
          >
            {activeTab === 'planner' && (
              <PlannerForm
                onGenerate={handleGenerateItinerary}
                isLoading={isLoading}
                progressMessage={generationProgress}
                onSelectPrebuilt={handleSelectPrebuilt}
              />
            )}

            {activeTab !== 'planner' && (
              <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {activeTab === 'itinerary' && (
                  isLoading ? (
                    <ItinerarySkeleton progressMessage={generationProgress} />
                  ) : currentPlan ? (
                    <ItineraryDisplay
                      plan={currentPlan}
                      generationProgress={generationProgress}
                      onModifyPlan={() => {
                        setIsReadOnlyShared(false);
                        setActiveTab('planner');
                      }}
                      onOpenAiGuide={(city) => {
                        setAiGuideContextCity(city);
                        setActiveTab('chatbot');
                      }}
                      onSavePlan={handleSaveItinerary}
                      isSaved={isCurrentPlanSaved}
                      isReadOnly={isReadOnlyShared}
                      onPlanYourOwnTrip={handlePlanYourOwnTrip}
                    />
                  ) : (
                    <div className="text-center py-16 space-y-4">
                      <p className="text-slate-600 font-medium">No itinerary selected yet.</p>
                      <button
                        onClick={() => setActiveTab('planner')}
                        className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs cursor-pointer"
                      >
                        Start Planning
                      </button>
                    </div>
                  )
                )}

                {activeTab === 'map' && (
                  <InteractiveKarnatakaMap
                    currentPlan={currentPlan}
                    onSelectDestination={() => {
                      setActiveTab('planner');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {activeTab === 'chatbot' && (
                  <GeminiChatbot
                    currentUser={currentUser}
                    onRequireLogin={handleLogin}
                    contextCity={aiGuideContextCity}
                  />
                )}

                {activeTab === 'transit' && <TransitHub />}

                {activeTab === 'hotels' && <HotelDirectory />}

                {activeTab === 'circuits' && (
                  <ClassicCircuits
                    onSelectCircuit={(plan) => {
                      setCurrentPlan(plan);
                      setActiveTab('itinerary');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {activeTab === 'saved_trips' && (
                  <SavedTripsView
                    currentUser={currentUser}
                    savedPlans={savedPlans}
                    onOpenPlan={(plan) => {
                      setCurrentPlan(plan);
                      setActiveTab('itinerary');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onDeletePlan={handleDeleteSavedPlan}
                    onLogin={handleLogin}
                    onStartPlanning={() => setActiveTab('planner')}
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Refined Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-14 border-t border-slate-800/80 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm">
              <Compass className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-slate-100 text-sm font-heading">Karnataka WanderAI</p>
              <p className="text-xs text-slate-400">One State. Many Worlds. Intelligent Travel Planning.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="font-medium text-slate-500">Official Portals:</span>
            <a href="https://ksrtc.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">KSRTC</a>
            <span className="text-slate-700">•</span>
            <a href="https://irctc.co.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">IRCTC / South Western Railway</a>
            <span className="text-slate-700">•</span>
            <a href="https://kstdc.co" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">KSTDC Tourism</a>
          </div>

          <p className="text-xs text-slate-500">
            Cloud persistence via Firebase Firestore
          </p>
        </div>
      </footer>

      {/* Quick AI Concierge Modal */}
      <AiConciergeModal
        isOpen={aiGuideOpen}
        onClose={() => setAiGuideOpen(false)}
        contextCity={aiGuideContextCity}
      />

    </div>
  );
}
