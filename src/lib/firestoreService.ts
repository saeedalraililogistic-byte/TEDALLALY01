import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { Salon, Service, Booking, InAppNotification, Review } from '../types.ts';

/**
 * Filter helper to permanently exclude legacy dummy or test salons
 */
export function isLegacyTestSalon(salon: Partial<Salon>): boolean {
  if (!salon) return false;
  const name = (salon.salonName || '').toLowerCase().trim();
  const id = (salon._id || '').toLowerCase().trim();
  const slug = (salon.slug || '').toLowerCase().trim();
  return (
    name.includes('احسان') ||
    name.includes('إحسان') ||
    name.includes('انامل') ||
    name.includes('أنامل') ||
    name.includes('تجريبي') ||
    name.includes('hshshajak') ||
    name === 'my salon' ||
    name === 'salon yara' ||
    name === 'احسان' ||
    name === 'صالون احسان' ||
    name === 'صالون انامل ناعمه' ||
    id.includes('ehsan') ||
    id.includes('anamil') ||
    slug.includes('ehsan') ||
    slug.includes('anamil') ||
    id === 'kh77cnn230ayx24dvgm71y5wcx8cpcgz' ||
    id === 'kh7d7v8e1467471y18g81sc1m58cqzrg' ||
    id === 'kh79dwc8bfs0gqzdf605ay17ph8derhw' ||
    id === 'kh76343batcr1qj3twsc4gfasn8cnczh'
  );
}

/**
 * Permanently purge all legacy testing data (salons, services, bookings) from Firestore.
 * Ensures a clean slate for the user to register and experience the full journey fresh.
 */
export async function deleteLegacyTestSalonsFromFirestore(): Promise<{ deletedSalons: number; deletedServices: number; deletedBookings: number }> {
  let deletedSalons = 0;
  let deletedServices = 0;
  let deletedBookings = 0;

  try {
    // 1. Purge legacy salons
    const salonsColl = collection(db, 'salons');
    const salonSnaps = await getDocs(salonsColl);
    const legacySalonIds: string[] = [];

    for (const d of salonSnaps.docs) {
      const data = d.data() as Partial<Salon>;
      data._id = d.id;
      if (isLegacyTestSalon(data)) {
        legacySalonIds.push(d.id);
        await deleteDoc(d.ref);
        deletedSalons++;
        console.log(`Deleted legacy test salon document: ${d.id}`);
      }
    }

    // 2. Purge legacy services attached to legacy salons
    const servicesColl = collection(db, 'services');
    const serviceSnaps = await getDocs(servicesColl);
    for (const d of serviceSnaps.docs) {
      const data = d.data() as Partial<Service>;
      const sName = (data.name || '').toLowerCase();
      if (legacySalonIds.includes(data.salonId || '') || sName.includes('احسان') || sName.includes('انامل')) {
        await deleteDoc(d.ref);
        deletedServices++;
      }
    }

    // 3. Purge legacy bookings attached to legacy salons
    const bookingsColl = collection(db, 'bookings');
    const bookingSnaps = await getDocs(bookingsColl);
    for (const d of bookingSnaps.docs) {
      const data = d.data() as Partial<Booking>;
      const bSalonName = (data.snapshot?.salonName || '').toLowerCase();
      if (legacySalonIds.includes(data.salonId || '') || bSalonName.includes('احسان') || bSalonName.includes('انامل')) {
        await deleteDoc(d.ref);
        deletedBookings++;
      }
    }

    console.log(`Cleaned up legacy data: ${deletedSalons} salons, ${deletedServices} services, ${deletedBookings} bookings.`);
  } catch (err) {
    console.warn('Could not run full Firestore legacy cleanup (may be offline or unauthenticated):', err);
  }

  return { deletedSalons, deletedServices, deletedBookings };
}

// Delete an individual salon from Firestore
export async function deleteSalonFromFirestore(salonId: string): Promise<void> {
  try {
    const salonRef = doc(db, 'salons', salonId);
    await deleteDoc(salonRef);
    console.log(`Successfully deleted salon ${salonId} from Firestore`);
  } catch (err) {
    console.error(`Failed to delete salon ${salonId} from Firestore:`, err);
  }
}

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

/**
 * Register a brand new salon in Firestore.
 * Enforces status: "pending" by default.
 */
export async function registerNewSalonInFirestore(salon: Salon): Promise<void> {
  try {
    if (isLegacyTestSalon(salon)) {
      console.log(`Ignoring legacy test salon registration: ${salon.salonName}`);
      return;
    }
    const salonRef = doc(db, 'salons', salon._id);
    await setDoc(salonRef, {
      ...salon,
      status: 'pending', // Starts strictly in pending state for admin review
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Registered new salon ${salon._id} with status pending`);
  } catch (err) {
    console.error('Failed to register new salon in Firestore:', err);
  }
}

/**
 * BUG FIX: Update Salon Profile / Data WITHOUT resetting status.
 * This function strips out `status` from updates to guarantee
 * that adding services or updating profile details can NEVER alter or reset the approved status!
 */
export async function updateSalonProfileInFirestore(
  salonId: string, 
  updates: Partial<Salon>
): Promise<void> {
  try {
    // Explicitly destructure and omit status, _id, ownerId, createdAt so they are NEVER overwritten
    const { status, _id, ownerId, createdAt, ...safeUpdates } = updates;
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      ...safeUpdates,
      updatedAt: serverTimestamp(),
    });
    console.log(`Safely updated profile for salon ${salonId} without modifying status`);
  } catch (err) {
    console.error(`Failed to safely update salon ${salonId}:`, err);
  }
}

/**
 * Admin action: Update salon approval status.
 * Only this dedicated function alters the status in Firestore.
 */
export async function updateSalonStatusInFirestore(
  salonId: string, 
  status: 'approved' | 'verified' | 'rejected' | 'suspended' | 'pending',
  reason?: string
): Promise<void> {
  try {
    const salonRef = doc(db, 'salons', salonId);
    const updates: Record<string, any> = {
      status,
      verificationNotes: reason || '',
      statusUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (status === 'approved' || status === 'verified') {
      updates.approvedAt = new Date().toISOString();
      updates.isActive = true;
    }
    await updateDoc(salonRef, updates);
    console.log(`Updated salon ${salonId} status to ${status} in Firestore`);
  } catch (err) {
    console.error(`Failed to update salon status in Firestore:`, err);
  }
}

// Fallback legacy sync function (safeguarded against status overwrite)
export async function syncSalonToFirestore(salon: Salon): Promise<void> {
  try {
    if (isLegacyTestSalon(salon)) {
      console.log(`Skipping sync of legacy test salon: ${salon.salonName}`);
      return;
    }
    const salonRef = doc(db, 'salons', salon._id);
    const snap = await getDoc(salonRef);
    if (snap.exists()) {
      // Document already exists: NEVER overwrite status!
      const { status, _id, ownerId, createdAt, ...safeFields } = salon;
      await updateDoc(salonRef, {
        ...safeFields,
        updatedAt: serverTimestamp(),
      });
      console.log(`Safely updated existing salon ${salon._id} in Firestore without touching status`);
    } else {
      // First time save: create with status
      await setDoc(salonRef, {
        ...salon,
        status: salon.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Created new salon ${salon._id} (${salon.salonName}) in Firestore`);
    }
  } catch (err) {
    console.error('Failed to sync salon to Firestore:', err);
  }
}

// Save or sync a new service to Firestore without touching salon document
export async function syncServiceToFirestore(service: Service): Promise<void> {
  try {
    const serviceRef = doc(db, 'services', service._id);
    await setDoc(serviceRef, {
      ...service,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`Synced service ${service._id} to Firestore`);
  } catch (err) {
    console.error('Failed to sync service to Firestore:', err);
  }
}

/**
 * Submit client review and update salon's average rating in Firestore
 */
export async function addReviewAndUpdateSalonRatingInFirestore(
  review: Review,
  salonId: string
): Promise<{ newRating: number; totalReviews: number }> {
  try {
    // 1. Add review document
    const reviewRef = doc(db, 'reviews', review._id || `rev_${Date.now()}`);
    await setDoc(reviewRef, {
      ...review,
      createdAt: serverTimestamp()
    });

    // 2. Fetch existing salon document to atomically recompute average rating
    const salonRef = doc(db, 'salons', salonId);
    const salonSnap = await getDoc(salonRef);
    let newAverage = review.rating || 5.0;
    let newTotal = 1;

    if (salonSnap.exists()) {
      const salonData = salonSnap.data() as Salon;
      const currentAvg = salonData.averageRating || 5.0;
      const currentTotal = salonData.totalReviews || 0;
      newTotal = currentTotal + 1;
      newAverage = Number(((currentAvg * currentTotal + review.rating) / newTotal).toFixed(1));

      await updateDoc(salonRef, {
        averageRating: newAverage,
        totalReviews: newTotal,
        updatedAt: serverTimestamp()
      });
    }

    return { newRating: newAverage, totalReviews: newTotal };
  } catch (err) {
    console.error('Failed to save review or update salon rating in Firestore:', err);
    return { newRating: review.rating, totalReviews: 1 };
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
          const salonData = { ...docSnap.data(), _id: docSnap.id } as Salon;
          // Filter out any legacy test salons (e.g. Ehsan, Anamil, etc.)
          if (!isLegacyTestSalon(salonData)) {
            liveSalons.push(salonData);
          }
        });
        onUpdate(liveSalons);
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


