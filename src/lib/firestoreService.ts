import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { Salon, Service, Booking, InAppNotification } from '../types.ts';

// Save or sync a booking to Firestore
export async function syncBookingToFirestore(booking: Booking): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', booking._id);
    await setDoc(bookingRef, {
      ...booking,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`Synced booking ${booking._id} to Firestore`);
  } catch (err) {
    console.error('Failed to sync booking to Firestore:', err);
  }
}

// Update booking status in Firestore
export async function updateBookingStatusInFirestore(bookingId: string, status: string): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error(`Failed to update booking ${bookingId} in Firestore:`, err);
  }
}

// Save or sync a salon to Firestore
export async function syncSalonToFirestore(salon: Salon): Promise<void> {
  try {
    const salonRef = doc(db, 'salons', salon._id);
    await setDoc(salonRef, {
      ...salon,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`Synced salon ${salon._id} (${salon.salonName}) to Firestore`);
  } catch (err) {
    console.error('Failed to sync salon to Firestore:', err);
  }
}

// Save or sync a new service to Firestore
export async function syncServiceToFirestore(service: Service): Promise<void> {
  try {
    const serviceRef = doc(db, 'services', service._id);
    await setDoc(serviceRef, {
      ...service,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`Synced service ${service._id} to Firestore`);
  } catch (err) {
    console.error('Failed to sync service to Firestore:', err);
  }
}

// Seed initial database collections into Firestore (Salons, Services, Bookings)
export async function seedInitialDataToFirestore(
  salons: Salon[], 
  services: Service[], 
  bookings: Booking[]
): Promise<{ success: boolean; count: number }> {
  try {
    let count = 0;

    // Seed salons
    for (const salon of salons) {
      await setDoc(doc(db, 'salons', salon._id), {
        ...salon,
        syncedAt: new Date().toISOString()
      }, { merge: true });
      count++;
    }

    // Seed services
    for (const srv of services) {
      await setDoc(doc(db, 'services', srv._id), {
        ...srv,
        syncedAt: new Date().toISOString()
      }, { merge: true });
      count++;
    }

    // Seed bookings
    for (const bkg of bookings) {
      await setDoc(doc(db, 'bookings', bkg._id), {
        ...bkg,
        syncedAt: new Date().toISOString()
      }, { merge: true });
      count++;
    }

    return { success: true, count };
  } catch (err: any) {
    console.warn('Seeding to Firestore skipped or requires authenticated session:', err?.message);
    return { success: false, count: 0 };
  }
}

// Sync or save a real notification to Firestore
export async function syncNotificationToFirestore(notification: InAppNotification): Promise<void> {
  try {
    const notifRef = doc(db, 'notifications', notification.id);
    await setDoc(notifRef, {
      ...notification,
      syncedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`Synced real notification ${notification.id} to Firestore`);
  } catch (err) {
    console.error('Failed to sync notification to Firestore:', err);
  }
}

// Mark a notification as read in Firestore
export async function markNotificationAsReadInFirestore(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (err) {
    console.error(`Failed to mark notification ${notificationId} as read in Firestore:`, err);
  }
}

// Real-time listener for salons collection
export function listenToRealtimeSalons(
  onUpdate: (salons: Salon[]) => void,
  onError?: (err: unknown) => void
): () => void {
  try {
    const salonsColl = collection(db, 'salons');
    return onSnapshot(
      salonsColl,
      (snapshot) => {
        const liveSalons: Salon[] = [];
        snapshot.forEach((docSnap) => {
          liveSalons.push({ ...docSnap.data(), _id: docSnap.id } as Salon);
        });
        if (liveSalons.length > 0) {
          onUpdate(liveSalons);
        }
      },
      (err) => {
        console.warn('Real-time salons listener warning:', err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Could not establish real-time salons listener:', err);
    return () => {};
  }
}

// Real-time listener for notifications collection
export function listenToRealtimeNotifications(
  onUpdate: (notifications: InAppNotification[]) => void,
  onError?: (err: unknown) => void
): () => void {
  try {
    const notifsColl = collection(db, 'notifications');
    return onSnapshot(
      notifsColl,
      (snapshot) => {
        const liveNotifs: InAppNotification[] = [];
        snapshot.forEach((docSnap) => {
          liveNotifs.push({ ...docSnap.data(), id: docSnap.id } as InAppNotification);
        });
        // Sort newest first
        liveNotifs.sort((a, b) => b.timestamp - a.timestamp);
        if (liveNotifs.length > 0) {
          onUpdate(liveNotifs);
        }
      },
      (err) => {
        console.warn('Real-time notifications listener warning:', err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Could not establish real-time notifications listener:', err);
    return () => {};
  }
}


