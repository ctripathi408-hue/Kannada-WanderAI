import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  Bus, 
  Hotel, 
  MapPin, 
  BookOpen, 
  Bot, 
  BookmarkCheck, 
  LogIn, 
  LogOut,
  Sun,
  Moon,
  Navigation
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: 'planner' | 'itinerary' | 'map' | 'transit' | 'hotels' | 'circuits' | 'chatbot' | 'saved_trips';
  setActiveTab: (tab: 'planner' | 'itinerary' | 'map' | 'transit' | 'hotels' | 'circuits' | 'chatbot' | 'saved_trips') => void;
  hasItinerary: boolean;
  currentUser: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasItinerary,
  currentUser,
  onLogin,
  onLogout,
  savedCount
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] py-0'
          : 'bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-transparent shadow-none py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('planner')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-all duration-300">
              <Compass className="w-5 h-5 text-amber-300 transition-transform group-hover:rotate-45 duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                  Karnataka<span className="text-emerald-700 dark:text-emerald-400">Wander</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Intelligent travel &amp; transit planner</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Plan Trip</span>
            </button>

            {hasItinerary && (
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'itinerary'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Current Plan</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Google Map</span>
            </button>

            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'chatbot'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>AI Concierge</span>
            </button>

            <button
              onClick={() => setActiveTab('circuits')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'circuits'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Circuits</span>
            </button>

            <button
              onClick={() => setActiveTab('transit')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'transit'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Transit Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'hotels'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Hotel className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Stays</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('saved_trips')}
                className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'saved_trips'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/70 dark:border-emerald-800/80 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookmarkCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Saved Trips</span>
                {savedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {savedCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Right Controls: Dark Mode Toggle & User Auth */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/90 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95 group"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 -rotate-12 transition-transform duration-300 group-hover:rotate-0" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('saved_trips')}
                  className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {currentUser.displayName || 'Traveler'}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar with horizontal scrolling and edge padding */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 px-2 gap-1.5 border-t border-slate-100 dark:border-slate-800/80 text-xs font-medium no-scrollbar flex-nowrap items-center">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'planner' 
                ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            Plan Trip
          </button>
          {hasItinerary && (
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'itinerary' 
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              Current Plan
            </button>
          )}
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'map' 
                ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            Google Map
          </button>
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'chatbot' 
                ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            AI Concierge
          </button>
          <button
            onClick={() => setActiveTab('circuits')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'circuits' 
                ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            Circuits
          </button>
          <button
            onClick={() => setActiveTab('transit')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'transit' 
                ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            Transit Hub
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'hotels' 
                ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            Stays
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab('saved_trips')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'saved_trips' 
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              Saved Trips ({savedCount})
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
