import React from 'react';
import { 
  BookmarkCheck, 
  Trash2, 
  Clock, 
  Wallet, 
  ArrowRight, 
  Compass, 
  LogIn
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { ItineraryPlan } from '../types/travel';
import { User as FirebaseUser } from 'firebase/auth';

interface SavedTripsViewProps {
  currentUser: FirebaseUser | null;
  savedPlans: ItineraryPlan[];
  onOpenPlan: (plan: ItineraryPlan) => void;
  onDeletePlan: (planId: string) => void;
  onLogin: () => void;
  onStartPlanning: () => void;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  currentUser,
  savedPlans,
  onOpenPlan,
  onDeletePlan,
  onLogin,
  onStartPlanning
}) => {
  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-16 border border-slate-200/70 dark:border-slate-800 text-center max-w-xl mx-auto space-y-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs">
          <BookmarkCheck className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Sign In to Save &amp; Access Your Itineraries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Connect securely with Google to save your personalized Karnataka itineraries, custom routes, and multi-turn chat sessions to the cloud.
          </p>
        </div>
        <button
          onClick={onLogin}
          className="px-7 py-3.5 rounded-2xl bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 text-white font-heading font-semibold text-sm shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <LogIn className="w-4 h-4 text-amber-300" />
          <span>Sign In with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-900/10 border border-emerald-500/20 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-medium uppercase tracking-wider border border-emerald-400/30 backdrop-blur-md">
          <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Cloud Itinerary Vault (Firestore Persisted)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight">
          My Saved Karnataka Itineraries
        </h1>
        <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
          Logged in as <strong>{currentUser.email}</strong>. All saved journeys, personalized schedules, transit notes, and budget projections are saved securely to your private cloud storage.
        </p>
      </div>

      {/* Plans List */}
      {savedPlans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 border border-slate-200/70 dark:border-slate-800 text-center space-y-5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
          <Compass className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-heading">No Saved Trips Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Generate or view an itinerary, then click &ldquo;Save to My Trips&rdquo; to keep it safely in your account.
          </p>
          <button
            onClick={onStartPlanning}
            className="px-6 py-3.5 rounded-xl bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 text-white font-heading font-semibold text-xs transition-all cursor-pointer shadow-xs"
          >
            Create Your First Itinerary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {savedPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] p-7 sm:p-9 hover:border-emerald-300/60 dark:hover:border-emerald-700/60 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-3 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      <AnimatedCounter value={plan.durationDays} /> Days / <AnimatedCounter value={Math.max(1, plan.durationDays - 1)} /> Nights
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>
                      <AnimatedCounter value={plan.estimatedBudgetInr?.total || 25000} prefix="₹" />
                    </span>
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  {plan.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {plan.summary}
                </p>

                {/* Route */}
                {plan.routeStops && plan.routeStops.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold mr-1">Corridor:</span>
                    {plan.routeStops.map((stop, i) => (
                      <React.Fragment key={i}>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                          {stop}
                        </span>
                        {i < plan.routeStops.length - 1 && (
                          <span className="text-slate-300 dark:text-slate-600">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col justify-end md:justify-center items-center md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onOpenPlan(plan)}
                  className="px-5 py-3 rounded-xl bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 text-white font-heading font-semibold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePlan(plan.id)}
                  className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Delete Itinerary"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
