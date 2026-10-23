import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ItineraryPlan } from '../types/travel';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Error handling per Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection per skill mandate
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initial connection check completed.');
    }
  }
}
testConnection();

// Auth Helpers
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Store or update user profile
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Traveler',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    return result.user;
  } catch (error: any) {
    // Normal user cancellation - do not treat as fatal error
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    console.error('Google Sign-in error:', error?.message || error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Firestore Itinerary Persistence Helpers
export async function saveItineraryToFirestore(userId: string, plan: ItineraryPlan): Promise<void> {
  const path = `users/${userId}/itineraries/${plan.id}`;
  // Keep local backup
  try {
    const key = `karnataka_saved_itins_${userId}`;
    const raw = localStorage.getItem(key);
    const list: ItineraryPlan[] = raw ? JSON.parse(raw) : [];
    const updated = [plan, ...list.filter(p => p.id !== plan.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}

  try {
    await setDoc(doc(db, 'users', userId, 'itineraries', plan.id), {
      ...plan,
      userId,
      savedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.warn(`Firestore write warning for ${path}:`, err?.message || err);
    // Don't crash if network or permissions fail; local copy is preserved
  }
}

export async function getSavedItinerariesFromFirestore(userId: string): Promise<ItineraryPlan[]> {
  const key = `karnataka_saved_itins_${userId}`;
  let localList: ItineraryPlan[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) localList = JSON.parse(raw);
  } catch {}

  const path = `users/${userId}/itineraries`;
  try {
    const itinsCol = collection(db, 'users', userId, 'itineraries');
    const snapshot = await getDocs(itinsCol);
    const remoteList = snapshot.docs.map(d => d.data() as ItineraryPlan);
    if (remoteList.length > 0) {
      // Sync local cache
      try {
        localStorage.setItem(key, JSON.stringify(remoteList));
      } catch {}
      return remoteList;
    }
    return localList;
  } catch (err: any) {
    console.warn(`Firestore read warning for ${path}:`, err?.message || err);
    return localList;
  }
}

export async function deleteSavedItineraryFromFirestore(userId: string, planId: string): Promise<void> {
  const path = `users/${userId}/itineraries/${planId}`;
  try {
    const key = `karnataka_saved_itins_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const list: ItineraryPlan[] = JSON.parse(raw);
      localStorage.setItem(key, JSON.stringify(list.filter(p => p.id !== planId)));
    }
  } catch {}

  try {
    await deleteDoc(doc(db, 'users', userId, 'itineraries', planId));
  } catch (err: any) {
    console.warn(`Firestore delete warning for ${path}:`, err?.message || err);
  }
}

// -------------------------------------------------------------
// Shared Trip Itineraries (Public Read & Unique Link Sharing)
// -------------------------------------------------------------

export const DEPLOYED_LIVE_URL = 'https://ais-pre-3wgkb5mi52kt36zxf5g2zs-55244605720.asia-east1.run.app';

/**
 * Returns the deployed live URL for trip sharing.
 * Strictly never returns preview, localhost, or dev iframe URLs.
 */
export function getDeployedAppUrl(): string {
  try {
    const metaEnv = (import.meta as any).env?.VITE_APP_URL;
    if (metaEnv && typeof metaEnv === 'string' && !metaEnv.includes('localhost') && !metaEnv.includes('ais-dev-')) {
      return metaEnv.replace(/\/+$/, '');
    }
  } catch {}
  return DEPLOYED_LIVE_URL;
}

/**
 * Robust clipboard copy utility.
 * Attempts navigator.clipboard first, with seamless fallback using a temporary textarea.
 */
export async function copyToClipboardWithFallback(text: string): Promise<boolean> {
  // 1. Try modern clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText threw, using textarea fallback:', err);
    }
  }

  // 2. Fallback using temporary textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (fallbackErr) {
    console.error('Fallback clipboard copy error:', fallbackErr);
    return false;
  }
}

export interface SharedTripRecord {
  id: string;
  title: string;
  durationDays: number;
  destinations: string[];
  plan: ItineraryPlan;
  createdAt: string;
}

/**
 * Saves an itinerary to Firestore (and server backup) under a unique ID.
 * Returns the unique ID and the formatted [deployed app URL]/?trip=ID link.
 */
export async function saveSharedTrip(plan: ItineraryPlan): Promise<{ tripId: string; shareUrl: string }> {
  // Generate a clean URL-safe alphanumeric unique ID
  const tripId = `kw_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const deployedBase = getDeployedAppUrl();
  const shareUrl = `${deployedBase}/?trip=${tripId}`;

  const payload: SharedTripRecord = {
    id: tripId,
    title: (plan.title || 'Karnataka WanderAI Itinerary').slice(0, 200),
    durationDays: plan.durationDays || (plan.days ? plan.days.length : 3),
    destinations: plan.routeStops || [],
    plan,
    createdAt: new Date().toISOString()
  };

  let savedSuccessfully = false;

  // 1. Write to Firestore /sharedTrips/{tripId}
  try {
    const docRef = doc(db, 'sharedTrips', tripId);
    await setDoc(docRef, payload);
    savedSuccessfully = true;
  } catch (err) {
    console.warn('Direct Firestore saveSharedTrip warning:', err);
  }

  // 2. Also sync to server endpoint for resilience
  try {
    const res = await fetch('/api/share-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId, plan })
    });
    if (res.ok) {
      savedSuccessfully = true;
    }
  } catch (err) {
    console.warn('Server fallback /api/share-trip warning:', err);
  }

  // Also cache in localStorage for instant retrieval across sessions
  try {
    localStorage.setItem(`kw_shared_trip_${tripId}`, JSON.stringify(payload));
  } catch {}

  if (!savedSuccessfully) {
    throw new Error('Failed to save itinerary to the database.');
  }

  return { tripId, shareUrl };
}

/**
 * Loads a shared trip by its unique ID from Firestore, server API, or cache.
 */
export async function getSharedTrip(tripId: string): Promise<ItineraryPlan | null> {
  if (!tripId || !/^[a-zA-Z0-9_\-]+$/.test(tripId)) {
    return null;
  }

  // 1. Try Firestore /sharedTrips/{tripId}
  try {
    const docRef = doc(db, 'sharedTrips', tripId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SharedTripRecord;
      if (data && data.plan) {
        return data.plan;
      }
    }
  } catch (err) {
    console.warn(`Firestore getSharedTrip warning for ${tripId}:`, err);
  }

  // 2. Try server endpoint
  try {
    const res = await fetch(`/api/shared-trip/${encodeURIComponent(tripId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.plan) {
        return data.plan;
      }
    }
  } catch (err) {
    console.warn(`Server getSharedTrip warning for ${tripId}:`, err);
  }

  // 3. Try local cache fallback
  try {
    const raw = localStorage.getItem(`kw_shared_trip_${tripId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.plan) return parsed.plan;
    }
  } catch {}

  return null;
}
