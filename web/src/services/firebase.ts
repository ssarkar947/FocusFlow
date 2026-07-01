import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useStore } from '../store/useStore';

let db: any = null;
let unsubscribeRemote: (() => void) | null = null;
let unsubscribeLocalStore: (() => void) | null = null;
let isUpdatingFromRemote = false;

export const startFirebaseSync = (config: any, userId: string = 'default_user') => {
  // Prevent duplicate initialization
  if (getApps().length > 0) {
    console.log('Firebase already initialized.');
    return;
  }

  try {
    const app = initializeApp(config);
    
    // Initialize Firestore with persistent multi-tab local cache for offline support
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

    console.log('Firebase Sync Engine started with offline persistence.');

    const userDocRef = doc(db, 'users', userId);

    // 1. Remote -> Local Sync
    // Listen for Firestore updates and sync them to Zustand
    unsubscribeRemote = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.metadata.hasPendingWrites) {
        console.log('Ignoring snapshot with pending local writes to prevent state regression');
        return;
      }
      if (docSnap.exists()) {
        const remoteState = docSnap.data();
        console.log('Syncing state from Firestore...');
        
        isUpdatingFromRemote = true;
        useStore.getState().importState(remoteState);
        isUpdatingFromRemote = false;
      }
    }, (error) => {
      console.warn('Firestore subscription error:', error);
    });

    // 2. Local -> Remote Sync
    // Listen for Zustand changes and sync them to Firestore
    unsubscribeLocalStore = useStore.subscribe((state) => {
      if (isUpdatingFromRemote) return; // Avoid infinite loop of updates

      const stateToSync = {
        goals: state.goals,
        projects: state.projects,
        tasks: state.tasks,
        sessions: state.sessions,
        dailyReviews: state.dailyReviews,
        weeklyReviews: state.weeklyReviews,
      };

      setDoc(userDocRef, stateToSync, { merge: true }).catch((err) => {
        console.warn('Firestore write deferred (offline mode):', err);
      });
    });

  } catch (err) {
    console.error('Failed to start Firebase Sync:', err);
  }
};

export const stopFirebaseSync = () => {
  if (unsubscribeRemote) {
    unsubscribeRemote();
    unsubscribeRemote = null;
  }
  if (unsubscribeLocalStore) {
    unsubscribeLocalStore();
    unsubscribeLocalStore = null;
  }
  console.log('Firebase Sync Engine stopped.');
};
