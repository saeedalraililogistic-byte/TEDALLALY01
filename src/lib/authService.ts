import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.ts';
import { User, Salon } from '../types.ts';

/**
 * Maps Firebase Auth error codes to user-friendly Arabic error messages
 */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
    case 'auth/user-not-found':
      return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى التأكد أو إنشاء حساب جديد.';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة. يرجى المحاولة مجدداً.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة. مثال: name@example.com';
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 خانات على الأقل.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب من قبل إدارة المنصة.';
    case 'auth/too-many-requests':
      return 'تم حظر محاولات الدخول مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار دقيقة والمحاولة لاحقاً.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
    case 'auth/operation-not-allowed':
      return 'تسجيل الدخول بالبريد الإلكتروني وكلمة المرور غير مفعّل حالياً في إعدادات Firebase.';
    default:
      return 'حدث خطأ أثناء المصادقة: ' + errorCode;
  }
}

/**
 * Secure Sign-In using Firebase Auth signInWithEmailAndPassword ONLY
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    const firebaseUser = userCredential.user;

    // Fetch user profile document from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const user: User = {
        _id: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || cleanEmail.split('@')[0],
        email: data.email || cleanEmail,
        role: data.role || (cleanEmail === 'saeedalraililogistic@gmail.com' ? 'admin' : 'customer'),
        phone: data.phone || '',
        city: data.city || 'الرياض',
        isActive: data.isActive !== false,
        linkedProviderId: data.linkedProviderId
      };
      return user;
    } else {
      // Create user profile in Firestore if first time
      const isSuperAdmin = cleanEmail === 'saeedalraililogistic@gmail.com';
      const newUser: User = {
        _id: firebaseUser.uid,
        name: firebaseUser.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: isSuperAdmin ? 'admin' : 'customer',
        phone: '',
        city: 'الرياض',
        isActive: true
      };

      await setDoc(userDocRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      });

      return newUser;
    }
  } catch (error: any) {
    console.error('Firebase Auth Login Error:', error);
    const code = error?.code || '';
    throw new Error(getAuthErrorMessage(code));
  }
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'salon_owner' | 'freelancer';
  phone: string;
  city: string;
  providerName?: string;
}

/**
 * Secure Sign-Up using Firebase Auth createUserWithEmailAndPassword
 */
export async function registerWithEmail(params: RegisterParams): Promise<{ user: User; salon?: Salon }> {
  const cleanName = params.name.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPassword = params.password.trim();
  const cleanPhone = params.phone.trim();
  const cleanCity = params.city.trim() || 'الرياض';

  if (!cleanName) {
    throw new Error('يرجى كتابة الاسم الكريم.');
  }
  if (!cleanEmail) {
    throw new Error('يرجى كتابة البريد الإلكتروني.');
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام.');
  }
  if (!cleanPhone) {
    throw new Error('يرجى كتابة رقم الجوال للتواصل وتأكيد الحجوزات.');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    const firebaseUser = userCredential.user;

    // Update display name in Firebase Auth
    await updateProfile(firebaseUser, {
      displayName: cleanName
    });

    const isSuperAdmin = cleanEmail === 'saeedalraililogistic@gmail.com';
    const finalRole = isSuperAdmin ? 'admin' : params.role;

    const providerId = finalRole !== 'customer' 
      ? (finalRole === 'freelancer' ? 'freelancer_' : 'salon_') + firebaseUser.uid 
      : undefined;

    const newUser: User = {
      _id: firebaseUser.uid,
      name: cleanName,
      email: cleanEmail,
      role: finalRole,
      phone: cleanPhone,
      city: cleanCity,
      isActive: true,
      linkedProviderId: providerId
    };

    // Save user profile in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    let newSalon: Salon | undefined;

    // If salon owner or freelancer, create and provision their isolated salon profile
    if (finalRole !== 'customer' && providerId) {
      const isFreelance = finalRole === 'freelancer';
      const salonTitle = params.providerName?.trim() || 
        (isFreelance ? `${cleanName} • خبيرة مستقلة` : `صالون ${cleanName}`);

      newSalon = {
        _id: providerId,
        _creationTime: Date.now(),
        salonName: salonTitle,
        slug: (isFreelance ? 'fl-' : 'salon-') + firebaseUser.uid.substring(0, 8),
        city: cleanCity,
        district: 'حي معتمد',
        address: `${cleanCity} - حي معتمد`,
        phone: cleanPhone,
        description: isFreelance ? 'خبيرة تجميل ومكياج مستقلة معتمدة' : 'صالون تجميل وعناية متكامل ومعتمد',
        status: 'pending_verification',
        isActive: true,
        providerType: isFreelance ? 'freelancer' : 'salon',
        ownerId: firebaseUser.uid,
        ownerEmail: cleanEmail,
        ownerName: cleanName,
        commercialRegisterNumber: !isFreelance ? '1010892999' : undefined,
        freelanceDocumentNumber: isFreelance ? 'FL-99201928' : undefined,
        taxNumber: '300192837400003',
        vatNumber: '300192837400003',
        documents: [
          {
            id: 'doc_cr_' + providerId,
            type: isFreelance ? 'freelance_document' : 'commercial_register',
            title: isFreelance ? 'وثيقة العمل الحر المعتمدة' : 'السجل التجاري الرسمي',
            fileName: isFreelance ? 'Freelance_Cert.pdf' : 'CR_Document.pdf',
            fileNumber: isFreelance ? 'FL-99201928' : '1010892999',
            uploadedAt: new Date().toISOString().split('T')[0],
            status: 'pending'
          },
          {
            id: 'doc_bank_' + providerId,
            type: 'bank_certificate',
            title: 'شهادة الآيبان والحساب البنكي',
            fileName: 'IBAN_Certificate.pdf',
            uploadedAt: new Date().toISOString().split('T')[0],
            status: 'pending'
          }
        ]
      };

      // Save new salon to Firestore
      await setDoc(doc(db, 'salons', newSalon._id), {
        ...newSalon,
        createdAt: serverTimestamp(),
      });
    }

    return { user: newUser, salon: newSalon };
  } catch (error: any) {
    console.error('Firebase Auth Register Error:', error);
    const code = error?.code || '';
    throw new Error(getAuthErrorMessage(code));
  }
}

/**
 * Logout from Firebase Auth
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Listen to Firebase Auth state changes
 */
export function subscribeToAuthState(
  onStateChange: (user: User | null, firebaseUser: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      onStateChange(null, null);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const user: User = {
          _id: firebaseUser.uid,
          name: data.name || firebaseUser.displayName || (firebaseUser.email || '').split('@')[0],
          email: data.email || firebaseUser.email || '',
          role: data.role || ((firebaseUser.email || '').toLowerCase() === 'saeedalraililogistic@gmail.com' ? 'admin' : 'customer'),
          phone: data.phone || '',
          city: data.city || 'الرياض',
          isActive: data.isActive !== false,
          linkedProviderId: data.linkedProviderId
        };
        onStateChange(user, firebaseUser);
      } else {
        const email = (firebaseUser.email || '').toLowerCase();
        const user: User = {
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0] || 'مستخدم',
          email,
          role: email === 'saeedalraililogistic@gmail.com' ? 'admin' : 'customer',
          phone: '',
          city: 'الرياض',
          isActive: true
        };
        onStateChange(user, firebaseUser);
      }
    } catch (err) {
      console.warn('Could not read user profile from Firestore, using auth fallback:', err);
      const email = (firebaseUser.email || '').toLowerCase();
      const fallbackUser: User = {
        _id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0] || 'مستخدم',
        email,
        role: email === 'saeedalraililogistic@gmail.com' ? 'admin' : 'customer',
        isActive: true
      };
      onStateChange(fallbackUser, firebaseUser);
    }
  });
}
