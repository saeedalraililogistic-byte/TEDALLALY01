import React, { useState, useEffect } from 'react';
import { 
  initialSalons, 
  initialServices, 
  initialCategories, 
  initialBookings, 
  initialUsers, 
  initialStaff, 
  initialReviews 
} from './store/data.ts';
import { Salon, Service, Booking, FlashOffer, InAppNotification, User } from './types.ts';
import { testFirestoreConnection } from './lib/firebase.ts';
import { 
  syncBookingToFirestore, 
  updateBookingStatusInFirestore, 
  syncServiceToFirestore,
  syncSalonToFirestore,
  syncNotificationToFirestore,
  seedInitialDataToFirestore,
  listenToRealtimeSalons,
  listenToRealtimeNotifications
} from './lib/firestoreService.ts';
import { 
  getStoredNotifications, 
  saveStoredNotifications, 
  checkApproachingBookings, 
  createStatusChangeNotification,
  createProximityReminderNotification,
  createSalonApprovalNotification,
  createSalonRejectionNotification,
  createDocumentRejectionNotification,
  createDocumentApprovedNotification,
  createSalonRegistrationAdminNotification,
  createSalonDocumentsReuploadedAdminNotification,
  createNewBookingSalonNotification,
  playNotificationSound 
} from './lib/notificationService.ts';
import { useTheme } from './context/ThemeContext.tsx';
import { MarketplaceView } from './components/MarketplaceView.tsx';
import { BookingsDashboard } from './components/BookingsDashboard.tsx';
import { DbManagerView } from './components/DbManagerView.tsx';
import { SalonDashboardView } from './components/SalonDashboardView.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { CategoriesView } from './components/CategoriesView.tsx';
import { TrainingCoursesView } from './components/TrainingCoursesView.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { TedallalyLogo } from './components/TedallalyLogo.tsx';
import { CustomerBookingsView } from './components/CustomerBookingsView.tsx';
import { LoyaltyClubView } from './components/LoyaltyClubView.tsx';
import { BridalPackagesView } from './components/BridalPackagesView.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { NotificationCenter } from './components/NotificationCenter.tsx';
import { FloatingNotificationToast } from './components/FloatingNotificationToast.tsx';
import { LegalPoliciesModal, LegalPolicyTab } from './components/LegalPoliciesModal.tsx';
import { LegalHubView } from './components/LegalHubView.tsx';
import { RoleSwitcher } from './components/RoleSwitcher.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { RegisterModal } from './components/RegisterModal.tsx';
import { subscribeToAuthState, logoutUser } from './lib/authService.ts';
import { ProviderRegistrationModal } from './components/ProviderRegistrationModal.tsx';
import { Footer } from './components/Footer.tsx';
import { 
  Sparkles, 
  Store, 
  CalendarCheck, 
  Database, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Layers, 
  CheckCircle2, 
  Search, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Lock,
  Sun,
  Moon,
  Scale,
  Briefcase,
  UserCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const { theme, toggleTheme, setTheme, isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'market' | 'salon_dash' | 'admin_dash' | 'categories' | 'courses' | 'bookings' | 'database' | 'legal' | 'bridal' | 'loyalty'>('market');
  const [loyaltyPoints, setLoyaltyPoints] = useState(320);
  const [legalSelectedDocId, setLegalSelectedDocId] = useState<string | null>(null);
  const [salons, setSalons] = useState<Salon[]>(() => {
    try {
      const saved = localStorage.getItem('tedallaly_persistent_salons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialSalons;
  });

  // Sync salons to localStorage whenever modified (e.g. approval, rejection, update)
  useEffect(() => {
    try {
      localStorage.setItem('tedallaly_persistent_salons', JSON.stringify(salons));
    } catch (e) {
      console.error(e);
    }
  }, [salons]);
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem('tedallaly_persistent_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialServices;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tedallaly_persistent_services', JSON.stringify(services));
    } catch (e) {
      console.error(e);
    }
  }, [services]);

  const [categories, setCategories] = useState(initialCategories);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('tedallaly_persistent_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialBookings;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tedallaly_persistent_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('tedallaly_persistent_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tedallaly_persistent_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  // Current logged in user (defaults to null for visitors so every visitor sees clean guest experience until they sign in)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('tedallaly_logged_in_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed._id) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('tedallaly_logged_in_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('tedallaly_logged_in_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Separate Authentication Modals State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [registerModal, setRegisterModal] = useState<{
    isOpen: boolean;
    initialRole?: 'customer' | 'salon_owner' | 'freelancer';
  }>({
    isOpen: false,
    initialRole: 'customer'
  });

  // Registration Modals State
  const [registrationModal, setRegistrationModal] = useState<{
    isOpen: boolean;
    type: 'salon' | 'freelancer';
  }>({
    isOpen: false,
    type: 'salon'
  });

  const [selectedSalonId, setSelectedSalonId] = useState<string>(() => {
    try {
      return localStorage.getItem('tedallaly_active_salon_id') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      if (selectedSalonId) {
        localStorage.setItem('tedallaly_active_salon_id', selectedSalonId);
      }
    } catch {
      // ignore
    }
  }, [selectedSalonId]);

  // Multi-Tenant Isolation: strictly returns ONLY the salons owned by the given provider account
  const getUserSalons = (user: User | null, allSalons: Salon[]): Salon[] => {
    if (!user) return [];

    const userEmail = (user.email || '').toLowerCase().trim();

    return allSalons.filter(s => {
      // 1. Direct owner ID match
      if (s.ownerId && s.ownerId === user._id) return true;
      // 2. User's explicitly linked provider ID
      if (user.linkedProviderId && s._id === user.linkedProviderId) return true;
      // 3. Exact owner Email match
      if (s.ownerEmail && userEmail && s.ownerEmail.toLowerCase().trim() === userEmail) return true;

      return false;
    });
  };

  const userOwnedSalons = getUserSalons(currentUser, salons);

  // Default active salon: strictly isolates salon owners to their own salon
  const activeSalon: Salon = (() => {
    if (currentUser?.role === 'admin') {
      return (selectedSalonId ? salons.find(s => s._id === selectedSalonId) : undefined) || salons[0];
    }
    if (currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer') {
      const selected = userOwnedSalons.find(s => s._id === selectedSalonId);
      if (selected) return selected;
      if (userOwnedSalons.length > 0) return userOwnedSalons[0];

      // If a salon owner is logged in but has no registered salon in state yet,
      // create their dedicated isolated profile so they NEVER see competitor salons (Ehsan or Anamil)!
      const isFreelance = currentUser.role === 'freelancer';
      const autoId = currentUser.linkedProviderId || ('salon_' + currentUser._id);
      const generatedSalon: Salon = {
        _id: autoId,
        _creationTime: Date.now(),
        salonName: currentUser.name.includes('صالون') ? currentUser.name : (isFreelance ? `${currentUser.name} • خبيرة مستقلة` : `صالون ${currentUser.name}`),
        slug: 'salon-' + currentUser._id,
        city: currentUser.city || 'الرياض',
        district: 'حي معتمد',
        address: `${currentUser.city || 'الرياض'} - حي معتمد`,
        phone: currentUser.phone || '0555123456',
        description: isFreelance ? 'خبيرة تجميل ومكياج مستقلة معتمدة' : 'صالون تجميل وعناية متكامل ومعتمد',
        status: 'pending_verification',
        isActive: true,
        providerType: isFreelance ? 'freelancer' : 'salon',
        ownerId: currentUser._id,
        ownerEmail: currentUser.email,
        ownerName: currentUser.name,
        commercialRegisterNumber: '1010892999',
        taxNumber: '300192837400003',
        documents: [
          {
            id: 'doc_cr_' + autoId,
            type: isFreelance ? 'freelance_document' : 'commercial_register',
            title: isFreelance ? 'وثيقة العمل الحر المعتمدة' : 'السجل التجاري الرسمي',
            fileName: 'CR_Official_Document.pdf',
            fileNumber: '1010892999',
            uploadedAt: new Date().toISOString().split('T')[0],
            status: 'pending'
          },
          {
            id: 'doc_bank_' + autoId,
            type: 'bank_certificate',
            title: 'شهادة الآيبان والحساب البنكي',
            fileName: 'IBAN_Certificate.pdf',
            uploadedAt: new Date().toISOString().split('T')[0],
            status: 'pending'
          }
        ]
      };
      return generatedSalon;
    }
    // Visitors & Customers
    return (selectedSalonId ? salons.find(s => s._id === selectedSalonId) : undefined) ||
           salons.find(s => s.status === 'verified') || 
           salons[0];
  })();

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'salon_owner' || user.role === 'freelancer') {
      const owned = getUserSalons(user, salons);
      if (owned.length > 0) {
        setSelectedSalonId(owned[0]._id);
      } else if (user.linkedProviderId) {
        setSelectedSalonId(user.linkedProviderId);
      }
      setActiveTab('salon_dash');
    } else if (user.role === 'admin') {
      setActiveTab('admin_dash');
    }
    addToast({
      type: 'success',
      title: `مرحباً بكِ مجدداً، ${user.name} 👋`,
      description: `تم التحقق من بيانات الدخول بنجاح عبر Firebase Authentication (${user.role === 'admin' ? 'المدير العام' : user.role === 'salon_owner' ? 'إدارة صالون' : user.role === 'freelancer' ? 'خبيرة مستقلة' : 'عميلة'}).`
    });
  };

  const handleRegisterSuccess = (newUser: User, newSalon?: Salon) => {
    setUsers(prev => [newUser, ...prev.filter(u => u._id !== newUser._id)]);
    setCurrentUser(newUser);

    if (newSalon) {
      setSalons(prev => [newSalon, ...prev.filter(s => s._id !== newSalon._id)]);
      setSelectedSalonId(newSalon._id);

      // Dispatch real-time instant notification to Platform Admin!
      const adminNotif = createSalonRegistrationAdminNotification(newSalon);
      setNotifications(prev => [adminNotif, ...prev]);
      syncNotificationToFirestore(adminNotif);

      // Dispatch instant welcome confirmation to the new salon owner!
      const isFreelance = newSalon.providerType === 'freelancer';
      const welcomeNotif: InAppNotification = {
        id: `notif_welcome_${newSalon._id}_${Date.now()}`,
        salonId: newSalon._id,
        recipientId: newUser._id,
        recipientRole: isFreelance ? 'freelancer' : 'salon_owner',
        type: 'salon_registered_pending',
        title: isFreelance ? 'تم رفع وثائق العمل الحر بنجاح 🌸' : 'تم استلام أوراق الصالون وبانتظار التدقيق الإداري 🏢',
        message: `أهلاً بكِ في تدلّلي! تم استلام أوراق ومستندات "${newSalon.salonName}" وهي الآن قيد المراجعة والتدقيق الإداري.`,
        timestamp: Date.now(),
        read: false,
        urgency: 'high',
        salonSnapshot: {
          salonName: newSalon.salonName,
          providerType: newSalon.providerType,
          city: newSalon.city,
          status: 'pending_verification'
        }
      };
      setNotifications(prev => [welcomeNotif, ...prev]);
      syncNotificationToFirestore(welcomeNotif);
      playNotificationSound();
      setActiveFloatingToast(welcomeNotif);
    }

    if (newUser.role === 'salon_owner' || newUser.role === 'freelancer') {
      if (newUser.linkedProviderId) {
        setSelectedSalonId(newUser.linkedProviderId);
      }
      setActiveTab('salon_dash');
    } else if (newUser.role === 'admin') {
      setActiveTab('admin_dash');
    } else {
      setActiveTab('market');
    }

    addToast({
      type: 'success',
      title: `أهلاً بكِ في تدلّلي، ${newUser.name}! 🎉`,
      description: 'تم إنشاء حسابكِ الجديد وتأمينه سحابياً بنجاح عبر Firebase Authentication.'
    });
  };

  const handleLogout = async () => {
    const prevName = currentUser?.name || 'المستخدم';
    await logoutUser();
    setCurrentUser(null);
    setActiveTab('market');
    addToast({
      type: 'info',
      title: 'تم تسجيل الخروج بنجاح 👋',
      description: `إلى اللقاء ${prevName}. تم إنهاء الجلسة الآمنة، يمكنك تسجيل الدخول في أي وقت.`
    });
  };

  // Shared Flash Offers State for Last-Minute Deals
  const [flashOffers, setFlashOffers] = useState<FlashOffer[]>([
    {
      id: 'fo_1',
      salonId: 'kh77cnn230ayx24dvgm71y5wcx8cpcgz',
      salonName: 'صالون احسان',
      serviceTitle: 'مناكير وباديكير عناية كاملة',
      originalPrice: 120,
      discountPrice: 85,
      discountPercentage: 29,
      validTimeWindow: 'اليوم: 2:00 م - 4:30 م',
      remainingSeats: 2,
      expiresInMinutes: 45,
    },
    {
      id: 'fo_2',
      salonId: 'kh77cnn230ayx24dvgm71y5wcx8cpcgz',
      salonName: 'صالون احسان',
      serviceTitle: 'قص واستشوار احترافي',
      originalPrice: 150,
      discountPrice: 105,
      discountPercentage: 30,
      validTimeWindow: 'اليوم: 5:00 م - 7:00 م',
      remainingSeats: 1,
      expiresInMinutes: 90,
    }
  ]);

  const handleAddFlashOffer = (offer: FlashOffer) => {
    setFlashOffers(prev => [offer, ...prev]);
    addToast({
      type: 'success',
      title: 'تم إطلاق عرض اللحظة الأخيرة ⚡',
      description: `نُشر العرض "${offer.serviceTitle}" بخصم ${offer.discountPercentage}% بشارة حمراء مميزة في منصة تدلّلي!`
    });
  };

  const handleDeleteFlashOffer = (id: string) => {
    setFlashOffers(prev => prev.filter(f => f.id !== id));
    addToast({
      type: 'info',
      title: 'تم إيقاف العرض',
      description: 'تمت إزالة عرض اللحظة الأخيرة من منصة تدلّلي.'
    });
  };

  // Initialize Firestore connection test and subscribe to real-time updates
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      if (connected) {
        console.log('✅ Firebase Firestore connected.');
      }
    });

    // Subscribe to real-time salons updates from Firestore
    const unsubSalons = listenToRealtimeSalons((liveSalons) => {
      setSalons(prevSalons => {
        const map = new Map<string, Salon>(prevSalons.map(s => [s._id, s]));
        liveSalons.forEach(ls => {
          const prev = map.get(ls._id);
          map.set(ls._id, prev ? { ...prev, ...ls } : ls);
        });
        return Array.from(map.values());
      });
    });

    // Subscribe to real-time in-app notifications from Firestore
    let isInitialNotifSnapshot = true;
    const unsubNotifs = listenToRealtimeNotifications((liveNotifs) => {
      setNotifications(prevNotifs => {
        const existingIds = new Set(prevNotifs.map(n => n.id));
        const incomingNew = liveNotifs.filter(n => !existingIds.has(n.id));
        if (!isInitialNotifSnapshot && incomingNew.length > 0) {
          // Play audio alert and show floating toast for the latest incoming real-time notification!
          playNotificationSound();
          setActiveFloatingToast(incomingNew[0]);
        }
        isInitialNotifSnapshot = false;
        const notifMap = new Map<string, InAppNotification>(prevNotifs.map(n => [n.id, n]));
        liveNotifs.forEach(n => {
          const prev = notifMap.get(n.id);
          notifMap.set(n.id, prev ? { ...prev, ...n } : n);
        });
        const merged = Array.from(notifMap.values());
        merged.sort((a, b) => b.timestamp - a.timestamp);
        return merged;
      });
    });

    return () => {
      unsubSalons();
      unsubNotifs();
    };
  }, []);

  // Listen to Firebase Authentication state changes in real-time
  useEffect(() => {
    const unsubAuth = subscribeToAuthState((authUser) => {
      if (authUser) {
        setCurrentUser(authUser);
        setUsers(prev => {
          if (!prev.some(u => u._id === authUser._id)) {
            return [authUser, ...prev];
          }
          return prev.map(u => u._id === authUser._id ? authUser : u);
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Protected Routes Guard: Guard internal management pages from unauthenticated access
  useEffect(() => {
    if (!currentUser) {
      if (activeTab === 'salon_dash' || activeTab === 'admin_dash' || activeTab === 'database') {
        setActiveTab('market');
        setIsLoginModalOpen(true);
        addToast({
          type: 'error',
          title: 'تسجيل الدخول مطلوب 🔒',
          description: 'يرجى تسجيل الدخول إلى حسابكِ للوصول إلى لوحة التحكم والصفحات المحمية.'
        });
      }
    } else if (currentUser.role === 'customer') {
      if (activeTab === 'salon_dash' || activeTab === 'admin_dash' || activeTab === 'database') {
        setActiveTab('market');
        addToast({
          type: 'error',
          title: 'غير مصرح بالدخول ⚠️',
          description: 'هذه اللوحة مخصصة لأصحاب الصالونات المعتمدة وإدارة المنصة فقط.'
        });
      }
    } else if ((currentUser.role === 'salon_owner' || currentUser.role === 'freelancer') && (activeTab === 'admin_dash' || activeTab === 'database')) {
      setActiveTab('salon_dash');
      addToast({
        type: 'error',
        title: 'غير مصرح بالدخول ⚠️',
        description: 'لوحة الإدارة العامة وقواعد البيانات مخصصة للمدير العام فقط.'
      });
    }
  }, [activeTab, currentUser]);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Legal Policies Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalPolicyTab>('commission');

  // In-App Notifications State (Persistent)
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => getStoredNotifications());
  const [activeFloatingToast, setActiveFloatingToast] = useState<InAppNotification | null>(null);

  // Sync notifications to localStorage
  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Automated Proximity Checker: alerts when booking is today or approaching within 24h
  useEffect(() => {
    const scanForApproaching = () => {
      const reminders = checkApproachingBookings(bookings, notifications);
      if (reminders.length > 0) {
        setNotifications(prev => [...reminders, ...prev]);
        setActiveFloatingToast(reminders[0]);
        playNotificationSound();
      }
    };

    // Scan once on mount
    const timeout = setTimeout(scanForApproaching, 1500);

    // Periodic scan every 60 seconds
    const interval = setInterval(scanForApproaching, 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [bookings]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Notification Center Handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulated Proximity Alert for instantaneous testing
  const handleTriggerSimulatedReminder = () => {
    const sampleBooking = bookings[0] || initialBookings[0];
    const reminder = createProximityReminderNotification(
      sampleBooking,
      'متبقي قرابة 25 دقيقة على الموعد',
      'high'
    );
    setNotifications(prev => [reminder, ...prev]);
    setActiveFloatingToast(reminder);
  };

  // Simulated Salon Confirmation for instantaneous testing
  const handleTriggerSimulatedConfirmation = () => {
    const sampleBooking = bookings[0] || initialBookings[0];
    const notif = createStatusChangeNotification(
      sampleBooking,
      'confirmed',
      'payment_pending'
    );
    setNotifications(prev => [notif, ...prev]);
    setActiveFloatingToast(notif);
  };

  // Manual Scan Action
  const handleManualScanProximity = () => {
    const reminders = checkApproachingBookings(bookings, notifications);
    if (reminders.length > 0) {
      setNotifications(prev => [...reminders, ...prev]);
      setActiveFloatingToast(reminders[0]);
      playNotificationSound();
      addToast({
        type: 'info',
        title: `تم رصد ${reminders.length} موعد مقترب ⏰`,
        description: 'تم إرسال إشعارات تذكير فورية للمواعيد المقتربة.'
      });
    } else {
      handleTriggerSimulatedReminder();
      playNotificationSound();
      addToast({
        type: 'info',
        title: 'فحص المواعيد المباشر ⏰',
        description: 'تم إنشاء تنبيه لاقتراب موعد حجز قادم اليوم.'
      });
    }
  };

  // Booking Modal State
  const [bookingTarget, setBookingTarget] = useState<{ salon: Salon; service: Service } | null>(null);

  const handleBookService = (salon: Salon, service: Service) => {
    setBookingTarget({ salon, service });
  };

  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    setBookingTarget(null);

    // Sync booking asynchronously to Firebase Cloud
    syncBookingToFirestore(newBooking);

    const salonName = newBooking.snapshot?.salonName || 'الصالون';
    const serviceName = newBooking.snapshot?.serviceName || 'الخدمة';

    // In-App Notification creation for new booking (Customer alert)
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingId: newBooking._id,
      recipientId: newBooking.customerId,
      recipientRole: 'customer',
      type: 'booking_confirmed',
      title: 'تم تسجيل حجزكِ بنجاح وتأكيده! 🎉',
      message: `تم حجز موعد "${serviceName}" لدى ${salonName} بتاريخ ${newBooking.appointmentDate} الساعة ${newBooking.appointmentTime} وتأمينه سحابياً ضد أي تضارب.`,
      timestamp: Date.now(),
      read: false,
      urgency: 'high',
      bookingSnapshot: {
        salonName,
        serviceName,
        appointmentDate: newBooking.appointmentDate,
        appointmentTime: newBooking.appointmentTime,
        status: newBooking.status,
        totalAmount: newBooking.snapshot?.totalAmount,
        staffName: newBooking.snapshot?.staffName,
        clientName: newBooking.clientName,
      }
    };
    setNotifications(prev => [newNotif, ...prev]);
    syncNotificationToFirestore(newNotif);

    // In-App Notification for the Salon Owner (Immediate Real-time Alert to Salon)
    const bookedSalon = salons.find(s => s._id === newBooking.salonId);
    if (bookedSalon) {
      const salonAlert = createNewBookingSalonNotification(newBooking, bookedSalon);
      setNotifications(prev => [salonAlert, ...prev]);
      syncNotificationToFirestore(salonAlert);
    }

    setActiveFloatingToast(newNotif);
    playNotificationSound();

    addToast({
      type: 'success',
      title: 'تم تأكيد حجزك بنجاح وحفظه سحابياً! 🎉',
      description: `تم حجز موعد ${serviceName} لدى ${salonName} بتاريخ ${newBooking.appointmentDate} الساعة ${newBooking.appointmentTime} وتأمينه في Firebase.`
    });
  };

  // Salon Document Verification & Admin Approval Handlers
  const handleUpdateSalon = (updatedSalon: Salon) => {
    setSalons(prev => prev.map(s => s._id === updatedSalon._id ? updatedSalon : s));
    syncSalonToFirestore(updatedSalon);

    // Dispatch real-time alert to Platform Admin that salon re-uploaded/updated documents for review
    const adminAlert = createSalonDocumentsReuploadedAdminNotification(updatedSalon);
    setNotifications(prev => [adminAlert, ...prev]);
    syncNotificationToFirestore(adminAlert);
    playNotificationSound();
    setActiveFloatingToast(adminAlert);

    addToast({
      type: 'info',
      title: 'تم تحديث بيانات الصالون والمستندات',
      description: `تم تحديث ملف صالون ${updatedSalon.salonName} وإرسال إشعار فوري للإدارة للمراجعة والتدقيق.`
    });
  };

  const handleRegisterProvider = (newProvider: Salon) => {
    const isFreelance = newProvider.providerType === 'freelancer';

    // If current user is logged in, link to them; otherwise create linked user
    const ownerId = currentUser ? currentUser._id : ('usr_' + newProvider._id);
    const ownerEmail = currentUser?.email || `${newProvider.slug}@tedallaly.com`;
    const ownerName = currentUser?.name || newProvider.salonName;

    const assignedProvider: Salon = {
      ...newProvider,
      ownerId,
      ownerEmail,
      ownerName,
      status: 'pending_verification'
    };

    setSalons(prev => [assignedProvider, ...prev]);
    syncSalonToFirestore(assignedProvider);

    let providerUser: User;
    if (currentUser) {
      providerUser = {
        ...currentUser,
        role: isFreelance ? 'freelancer' : 'salon_owner',
        linkedProviderId: assignedProvider._id
      };
      setUsers(prev => prev.map(u => u._id === currentUser._id ? providerUser : u));
      setCurrentUser(providerUser);
    } else {
      providerUser = {
        _id: ownerId,
        name: ownerName,
        email: ownerEmail,
        phone: assignedProvider.phone,
        role: isFreelance ? 'freelancer' : 'salon_owner',
        city: assignedProvider.city,
        isActive: true,
        linkedProviderId: assignedProvider._id
      };
      setUsers(prev => [providerUser, ...prev]);
      setCurrentUser(providerUser);
    }

    setSelectedSalonId(assignedProvider._id);
    setActiveTab('salon_dash');

    // 1. Dispatch real-time instant notification to Platform Admin!
    const adminNotif = createSalonRegistrationAdminNotification(assignedProvider);
    setNotifications(prev => [adminNotif, ...prev]);
    syncNotificationToFirestore(adminNotif);

    // 2. Dispatch instant confirmation notification to the newly registered Salon Owner!
    const salonWelcomeNotif: InAppNotification = {
      id: `notif_welcome_${assignedProvider._id}_${Date.now()}`,
      salonId: assignedProvider._id,
      recipientId: providerUser._id,
      recipientRole: isFreelance ? 'freelancer' : 'salon_owner',
      type: 'salon_registered_pending',
      title: isFreelance ? 'تم رفع وثائق العمل الحر بنجاح 🌸' : 'تم استلام أوراق الصالون وبانتظار التدقيق الإداري 🏢',
      message: `أهلاً بكِ في تدلّلي! تم استلام أوراق ومستندات "${assignedProvider.salonName}" وهي الآن قيد المراجعة والتدقيق الإداري. ستصلكِ رسالة فورية هنا بمجرد الموافقة وتفعيل الصالون للعميلات.`,
      timestamp: Date.now(),
      read: false,
      urgency: 'high',
      salonSnapshot: {
        salonName: assignedProvider.salonName,
        providerType: assignedProvider.providerType,
        city: assignedProvider.city,
        status: 'pending_verification'
      }
    };
    setNotifications(prev => [salonWelcomeNotif, ...prev]);
    syncNotificationToFirestore(salonWelcomeNotif);

    playNotificationSound();
    setActiveFloatingToast(salonWelcomeNotif);

    addToast({
      type: 'info',
      title: isFreelance ? 'تم رفع طلب تسجيل الخبيرة بنجاح 🌸' : 'تم استلام طلب تسجيل الصالون 🏢',
      description: 'المستندات القانونية قيد مراجعة وتدقيق إدارة منصة تدلّلي. وصل إشعار فوري للإدارة.'
    });
  };

  const handleApproveSalon = (salonId: string) => {
    const targetSalon = salons.find(s => s._id === salonId);
    if (!targetSalon) return;

    const approvedDocuments = (targetSalon.documents || []).map(d => ({
      ...d,
      status: 'approved' as const
    }));

    const updatedSalon: Salon = {
      ...targetSalon,
      status: 'verified',
      documents: approvedDocuments,
      approvedAt: new Date().toISOString()
    };

    setSalons(prev => prev.map(s => s._id === salonId ? updatedSalon : s));
    syncSalonToFirestore(updatedSalon);

    // Create and dispatch real persistent notification targeted directly to the salon owner
    const approvalNotif = createSalonApprovalNotification(updatedSalon);
    setNotifications(prev => [approvalNotif, ...prev]);
    syncNotificationToFirestore(approvalNotif);

    setActiveFloatingToast(approvalNotif);
    playNotificationSound();

    const isFreelance = targetSalon.providerType === 'freelancer';

    addToast({
      type: 'success',
      title: isFreelance ? 'تمت الموافقة واعتماد الخبيرة المستقلة! 🛡️' : 'تمت الموافقة واعتماد الصالون بنجاح! 🛡️',
      description: `تم اعتماد "${targetSalon.salonName}" رسمياً. تم إرسال إشعار فوري لصاحبة الصالون، وأصبح متاحاً للعميلات فوراً.`
    });
  };

  const handleRejectSalon = (salonId: string, reason?: string) => {
    const targetSalon = salons.find(s => s._id === salonId);
    if (!targetSalon) return;

    const finalReason = reason && reason.trim().length > 0 
      ? reason 
      : 'المستندات غير مكتملة أو رخصة البلدية والسجل التجاري غير مطابقة لمتطلبات وزارة التجارة';

    const updatedSalon: Salon = {
      ...targetSalon,
      status: 'suspended',
      verificationNotes: finalReason,
    };

    setSalons(prev => prev.map(s => s._id === salonId ? updatedSalon : s));
    syncSalonToFirestore(updatedSalon);

    // Create and dispatch real rejection notification with explicit reason directly to the salon owner
    const rejectionNotif = createSalonRejectionNotification(updatedSalon, finalReason);
    setNotifications(prev => [rejectionNotif, ...prev]);
    syncNotificationToFirestore(rejectionNotif);

    setActiveFloatingToast(rejectionNotif);
    playNotificationSound();

    addToast({
      type: 'error',
      title: 'تم إيقاف/رفض الصالون وتوثيق السبب ⚠️',
      description: `تم إرسال إشعار فوري لصالون "${targetSalon.salonName}" بالسبب: ${finalReason}`
    });
  };

  const handleUpdateSalonDocumentStatus = (salonId: string, docId: string, docStatus: 'approved' | 'rejected', reason?: string) => {
    const targetSalon = salons.find(s => s._id === salonId);
    if (!targetSalon) return;

    let targetDocTitle = 'الوثيقة';
    const updatedDocs = (targetSalon.documents || []).map(d => {
      if (d.id === docId) {
        targetDocTitle = d.title;
        return {
          ...d,
          status: docStatus,
          verificationNote: reason
        };
      }
      return d;
    });

    const allApproved = updatedDocs.length > 0 && updatedDocs.every(d => d.status === 'approved');

    const updatedSalon: Salon = {
      ...targetSalon,
      status: allApproved ? 'verified' : (docStatus === 'rejected' ? 'suspended' : targetSalon.status),
      documents: updatedDocs,
      approvedAt: allApproved ? new Date().toISOString() : targetSalon.approvedAt,
      verificationNotes: docStatus === 'rejected' ? (reason || 'مستند مرفوض') : targetSalon.verificationNotes
    };

    setSalons(prev => prev.map(s => s._id === salonId ? updatedSalon : s));
    syncSalonToFirestore(updatedSalon);

    if (docStatus === 'approved') {
      if (allApproved) {
        const notif = createSalonApprovalNotification(updatedSalon);
        setNotifications(prev => [notif, ...prev]);
        setActiveFloatingToast(notif);
        playNotificationSound();
        syncNotificationToFirestore(notif);
      }
      addToast({
        type: 'success',
        title: 'تم اعتماد المستند بنجاح ✓',
        description: `تمت مراجعة واعتماد ${targetDocTitle} وحفظه سحابياً.`
      });
    } else {
      const docRejectionReason = reason || 'المستند غير واضح أو منتهي الصلاحية';
      const docNotif = createDocumentRejectionNotification(updatedSalon, targetDocTitle, docRejectionReason);
      setNotifications(prev => [docNotif, ...prev]);
      setActiveFloatingToast(docNotif);
      playNotificationSound();
      syncNotificationToFirestore(docNotif);

      addToast({
        type: 'error',
        title: 'تم رفض الوثيقة مع إشعار الصالون ⚠️',
        description: `سبب الرفض: ${docRejectionReason}`
      });
    }
  };

  const handleUpdateStatus = (id: string, status: string) => {
    const booking = bookings.find(b => b._id === id);
    const serviceName = booking?.snapshot?.serviceName || 'الحجز';
    const salonName = booking?.snapshot?.salonName || '';
    const oldStatus = booking?.status;

    setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));

    // Update status in Firestore
    updateBookingStatusInFirestore(id, status);

    // Create in-app notification when salon changes booking status
    if (booking) {
      const updatedBooking = { ...booking, status };
      const statusNotif = createStatusChangeNotification(updatedBooking, status, oldStatus);
      setNotifications(prev => [statusNotif, ...prev]);
      setActiveFloatingToast(statusNotif);
      playNotificationSound();
    }

    if (status === 'completed') {
      addToast({
        type: 'success',
        title: 'تم إتمام الحجز بنجاح ✓',
        description: `تم تحديث حالة موعد "${serviceName}" في ${salonName} إلى مكتمل ومزامنته مع السحابة.`
      });
    } else if (status === 'confirmed') {
      addToast({
        type: 'info',
        title: 'تم تأكيد الحجز من الصالون ✨',
        description: `تم تأكيد موعد "${serviceName}" في ${salonName}.`
      });
    } else {
      addToast({
        type: 'info',
        title: 'تم تحديث حالة الحجز',
        description: `أصبحت الحالة الآن: ${status}.`
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f9] dark:bg-[#09090d] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white font-sans transition-colors duration-300">
      {/* Top Banner with Platform Slogan */}
      <div className="bg-rose-50/90 dark:bg-[#121218] border-b border-rose-100/80 dark:border-slate-800/80 px-4 py-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400 transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-800 dark:text-white font-bold">منصة التجميل الفاخرة التي تربطك بأفضل الصالونات في الخليج</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span className="font-semibold text-slate-500 dark:text-slate-400">العربية • SAR SA</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-rose-100/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md sticky top-0 z-40 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          {/* Top Row: Logo + Quick Controls + Hamburger Button on Mobile */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div 
              onClick={() => {
                setActiveTab('market');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 dark:bg-[#121218] border border-rose-200 dark:border-rose-500/30 flex items-center justify-center p-1 shadow-md shadow-rose-500/10 group-hover:scale-105 group-hover:border-rose-500/60 transition-all">
                <TedallalyLogo size={28} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-nowrap leading-none">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide whitespace-nowrap inline-flex items-center gap-1 leading-none">
                    <span>تدلّلي</span>
                    <span className="text-rose-400 dark:text-rose-500 font-light">•</span>
                    <span>Tedallaly</span>
                  </h1>
                  <span className="hidden md:inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/90 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 select-none shadow-xs">
                    دلعي نفسك بضغطة زر
                  </span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 hidden xs:block">حجز صالونات الخليج والعناية الفاخرة</div>
              </div>
            </div>

            {/* Desktop Navigation Menus (Hidden on Mobile) */}
            <nav className="hidden xl:flex items-center gap-1 bg-rose-50/60 dark:bg-[#15151e] p-1 rounded-2xl border border-rose-100 dark:border-slate-800/80">
              <button
                onClick={() => setActiveTab('market')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'market'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                }`}
              >
                استكشفي الصالونات
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                }`}
              >
                التصنيفات
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'courses'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                }`}
              >
                الدورات التدريبية
              </button>

              {/* باقات العرائس الملكية */}
              <button
                onClick={() => setActiveTab('bridal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'bridal'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                    : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-white/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>باقات العرائس 💍</span>
              </button>

              {/* لوحة الصالون أو لوحة المستقلة */}
              {(currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => setActiveTab('salon_dash')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'salon_dash'
                      ? currentUser?.role === 'freelancer'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-rose-600 dark:text-rose-300/90 hover:text-rose-700 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{currentUser?.role === 'freelancer' ? 'لوحة المستقلة 🌸' : 'لوحة الصالون'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                </button>
              )}

              {/* لوحة الإدارة */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin_dash')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'admin_dash'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>لوحة الإدارة</span>
                </button>
              )}

              {/* الحجوزات */}
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                }`}
              >
                {currentUser?.role === 'customer' 
                  ? `حجوزاتي (${bookings.filter(b => b.customerId === currentUser._id || (currentUser.role === 'customer' && (b.customerId === 'usr_client' || b.customerId === 'j57bhqcbd12792hscvs1hmse7d8ch9mm'))).length})`
                  : currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer'
                  ? `حجوزات الصالون (${bookings.filter(b => !currentUser.linkedProviderId || b.salonId === currentUser.linkedProviderId).length})`
                  : `جدول الحجوزات (${bookings.length})`
                }
              </button>

              {/* الداتابيس للمدير */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('database')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'database'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  الداتابيس
                </button>
              )}
            </nav>

            {/* Actions: User Account + Notifications + Theme + Mobile Menu Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* User Account / Auth & Role Controls */}
              {currentUser ? (
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#15151e] p-0.5 sm:p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <RoleSwitcher
                    currentUser={currentUser}
                    onSwitchUser={(user) => {
                      setCurrentUser(user);
                      if (user.role === 'customer' && (activeTab === 'admin_dash' || activeTab === 'database' || activeTab === 'salon_dash')) {
                        setActiveTab('market');
                      } else if (user.role === 'salon_owner' || user.role === 'freelancer') {
                        if (user.linkedProviderId) {
                          setSelectedSalonId(user.linkedProviderId);
                        }
                        setActiveTab('salon_dash');
                      }
                      addToast({
                        type: 'info',
                        title: `تم تبديل الحساب إلى: ${user.name}`,
                        description: `صلاحية الحساب الحالية: ${user.role === 'admin' ? 'مدير عام كامل الصلاحيات' : user.role === 'salon_owner' ? 'صاحبة صالون' : user.role === 'freelancer' ? 'خبيرة تجميل وميكب آرتست مستقلة' : 'عميلة'}`
                      });
                    }}
                    availableUsers={users}
                    onOpenLogin={() => setIsLoginModalOpen(true)}
                    onOpenRegister={() => setRegisterModal({ isOpen: true, initialRole: 'customer' })}
                    onLogout={handleLogout}
                    onOpenFreelancerRegister={() => setRegistrationModal({ isOpen: true, type: 'freelancer' })}
                    onOpenSalonRegister={() => setRegistrationModal({ isOpen: true, type: 'salon' })}
                  />

                  {/* زر تسجيل خروج */}
                  <button
                    onClick={handleLogout}
                    title="تسجيل الخروج من الحساب"
                    className="p-1.5 sm:px-2 sm:py-1 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden 2xl:inline text-[11px]">خروج</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    دخول
                  </button>
                  <button
                    onClick={() => setRegisterModal({ isOpen: true, initialRole: 'customer' })}
                    className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-rose-600/20 whitespace-nowrap"
                  >
                    تسجيل
                  </button>
                </div>
              )}

              {/* In-App Notification Center */}
              <NotificationCenter
                notifications={notifications}
                currentUser={currentUser}
                activeSalonId={activeSalon?._id}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
                onClearAll={handleClearAllNotifications}
                onSelectBooking={(bookingId) => {
                  setActiveTab('bookings');
                }}
                onTriggerSimulatedReminder={handleTriggerSimulatedReminder}
                onTriggerSimulatedConfirmation={handleTriggerSimulatedConfirmation}
                onManualScanProximity={handleManualScanProximity}
              />

              {/* Theme Toggle (Light / Dark Mode) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-rose-50/70 dark:bg-[#15151e] border border-rose-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-all cursor-pointer shrink-0"
                title={isDark ? "التحويل للمظهر النهاري الفاتح" : "التحويل للمظهر الليلي الداكن"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-rose-500" />}
              </button>

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-rose-50/70 dark:bg-[#15151e] border border-rose-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-all cursor-pointer shrink-0"
                aria-label="فتح القائمة الرئيسية"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Quick Horizontal Scrollable Bar on Mobile/Tablet */}
          <div className="xl:hidden mt-2.5 pt-2 border-t border-rose-100/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 pb-0.5">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'market'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 bg-rose-50/50 dark:bg-slate-800/40'
              }`}
            >
              الصالونات
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'categories'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 bg-rose-50/50 dark:bg-slate-800/40'
              }`}
            >
              التصنيفات
            </button>
            <button
              onClick={() => setActiveTab('bridal')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'bridal'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-slate-800/40'
              }`}
            >
              عرائس 💍
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'courses'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 bg-rose-50/50 dark:bg-slate-800/40'
              }`}
            >
              الدورات
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'bookings'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 bg-rose-50/50 dark:bg-slate-800/40'
              }`}
            >
              الحجوزات
            </button>
            {(currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('salon_dash')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'salon_dash'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs'
                    : 'text-rose-600 dark:text-rose-300 bg-rose-50/50 dark:bg-slate-800/40'
                }`}
              >
                لوحة الصالون
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin_dash')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'admin_dash'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-600 dark:text-indigo-400 bg-rose-50/50 dark:bg-slate-800/40'
                }`}
              >
                لوحة الإدارة
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('database')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'database'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-600 dark:text-emerald-400 bg-rose-50/50 dark:bg-slate-800/40'
                }`}
              >
                الداتابيس
              </button>
            )}
          </div>

          {/* Full Expanded Mobile Drawer Navigation */}
          {isMobileMenuOpen && (
            <div className="xl:hidden mt-3 p-3 bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl shadow-xl space-y-2 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => { setActiveTab('market'); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                    activeTab === 'market' ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>استكشفي الصالونات</span>
                </button>

                <button
                  onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                    activeTab === 'categories' ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>التصنيفات والخدمات</span>
                </button>

                <button
                  onClick={() => { setActiveTab('bridal'); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                    activeTab === 'bridal' ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>💍</span>
                  <span>باقات العرائس الملكية</span>
                </button>

                <button
                  onClick={() => { setActiveTab('courses'); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                    activeTab === 'courses' ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-rose-400" />
                  <span>الدورات التدريبية</span>
                </button>

                <button
                  onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                    activeTab === 'bookings' ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-rose-400" />
                  <span>
                    {currentUser?.role === 'customer' 
                      ? 'حجوزاتي ومواعيدي' 
                      : currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer'
                      ? 'حجوزات الصالون'
                      : 'جدول الحجوزات العام'
                    }
                  </span>
                </button>

                {(currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer' || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => { setActiveTab('salon_dash'); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                      activeTab === 'salon_dash' ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Store className="w-4 h-4 text-rose-400" />
                    <span>{currentUser?.role === 'freelancer' ? 'لوحة المستقلة 🌸' : 'لوحة الصالون'}</span>
                  </button>
                )}

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => { setActiveTab('admin_dash'); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                      activeTab === 'admin_dash' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span>لوحة الإدارة الشاملة</span>
                  </button>
                )}

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => { setActiveTab('database'); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-xl text-right flex items-center gap-2 ${
                      activeTab === 'database' ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800/60 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>قواعد البيانات السحابية</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'market' && (
          <MarketplaceView
            salons={salons}
            services={services}
            categories={categories}
            flashOffers={flashOffers}
            onBookService={handleBookService}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            onSelectCategory={(catId) => {
              setActiveTab('market');
            }}
          />
        )}

        {activeTab === 'courses' && (
          <TrainingCoursesView
            onGoToSalonDashboard={() => setActiveTab('salon_dash')}
          />
        )}

        {activeTab === 'salon_dash' && (
          <SalonDashboardView
            salon={activeSalon}
            allSalons={currentUser?.role === 'admin' ? salons : (userOwnedSalons.length > 0 ? userOwnedSalons : [activeSalon])}
            isPlatformAdmin={currentUser?.role === 'admin'}
            onSelectSalon={(id) => setSelectedSalonId(id)}
            services={services}
            bookings={bookings}
            flashOffers={flashOffers}
            onAddFlashOffer={handleAddFlashOffer}
            onDeleteFlashOffer={handleDeleteFlashOffer}
            onBookService={handleBookService}
            onAddBooking={handleConfirmBooking}
            onAddService={(newService) => {
              setServices(prev => [newService, ...prev]);
              // Sync service to Firestore
              syncServiceToFirestore(newService);
              addToast({
                type: 'success',
                title: 'تمت إضافة الخدمة بنجاح وحفظها سحابياً! ✂️',
                description: `تمت إضافة خدمة "${newService.nameAr || newService.name}" بسعر ${newService.price} SAR وتأمينها في Firebase.`
              });
            }}
            onUpdateSalon={handleUpdateSalon}
            onViewPublicPage={() => setActiveTab('market')}
            onSimulateSalonApprovalNotification={() => {
              handleApproveSalon(activeSalon._id);
            }}
            onSimulateSalonRejectionNotification={() => {
              handleRejectSalon(activeSalon._id, 'السجل التجاري أو رخصة البلدية منتهية الصلاحية ويلزم تجديدها وتصحيحها');
            }}
            onSimulateAdminDocsNotification={() => {
              const adminNotif = createSalonRegistrationAdminNotification(activeSalon);
              setNotifications(prev => [adminNotif, ...prev]);
              syncNotificationToFirestore(adminNotif);
              setActiveFloatingToast(adminNotif);
              playNotificationSound();
              addToast({
                type: 'info',
                title: 'وصول إشعار فوري لإدارة المنصة 🏢',
                description: `تم إرسال إشعار فوري بحساب الإدارة يفيد بأن صالون "${activeSalon.salonName}" رفع أوراقه للمراجعة.`
              });
            }}
          />
        )}

        {activeTab === 'admin_dash' && (
          <AdminDashboardView
            salons={salons}
            bookings={bookings}
            onApproveSalon={handleApproveSalon}
            onRejectSalon={handleRejectSalon}
            onUpdateSalonDocumentStatus={handleUpdateSalonDocumentStatus}
            onSimulateAdminDocsNotification={() => {
              const pendingOrFirst = salons.find(s => s.status === 'pending_verification') || salons[0];
              const adminNotif = createSalonRegistrationAdminNotification(pendingOrFirst);
              setNotifications(prev => [adminNotif, ...prev]);
              syncNotificationToFirestore(adminNotif);
              setActiveFloatingToast(adminNotif);
              playNotificationSound();
              addToast({
                type: 'info',
                title: 'وصول إشعار صالون جديد للإدارة 🏢',
                description: `قام صالون "${pendingOrFirst.salonName}" برفع أوراقه الرسمية للمراجعة والتدقيق الإداري.`
              });
            }}
          />
        )}

        {activeTab === 'bookings' && (
          currentUser?.role === 'customer' ? (
            <CustomerBookingsView
              customer={currentUser}
              bookings={bookings}
              salons={salons}
              services={services}
              onBookNewService={() => setActiveTab('market')}
              onCancelBooking={(bookingId) => handleUpdateStatus(bookingId, 'cancelled')}
              onOpenLoyaltyClub={() => setActiveTab('loyalty')}
              onOpenBridalPackages={() => setActiveTab('bridal')}
            />
          ) : (
            <BookingsDashboard
              bookings={
                currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer'
                  ? bookings.filter(b => !currentUser.linkedProviderId || b.salonId === currentUser.linkedProviderId)
                  : bookings
              }
              salons={
                currentUser?.role === 'salon_owner' || currentUser?.role === 'freelancer'
                  ? salons.filter(s => !currentUser.linkedProviderId || s._id === currentUser.linkedProviderId)
                  : salons
              }
              services={services}
              users={users}
              onAddBooking={handleConfirmBooking}
              onUpdateStatus={handleUpdateStatus}
            />
          )
        )}

        {activeTab === 'bridal' && (
          <BridalPackagesView
            salons={salons}
            onBookPackage={(pkg, salon) => {
              const bridalService: Service = {
                _id: pkg.id,
                salonId: salon._id,
                name: pkg.name,
                nameAr: pkg.name,
                description: pkg.tagline,
                price: pkg.price,
                currency: 'SAR',
                durationMins: 180,
                categoryId: 'cat_bridal',
                isActive: true,
                isAvailableOnline: true,
              };
              handleBookService(salon, bridalService);
            }}
            onBack={() => setActiveTab('market')}
          />
        )}

        {activeTab === 'loyalty' && (
          <LoyaltyClubView
            currentPoints={loyaltyPoints}
            onRedeemReward={(reward) => {
              setLoyaltyPoints(prev => Math.max(0, prev - reward.pointsCost));
              addToast({
                type: 'success',
                title: `تم استبدال المكافأة بنجاح! 🎁`,
                description: `تم تطبيق خصم بقيمة ${reward.discountSAR} ريال على حسابك لحجزك القادم.`
              });
            }}
            onBackToBookings={() => setActiveTab('bookings')}
          />
        )}

        {activeTab === 'database' && (
          <DbManagerView 
            salons={salons}
            services={services}
            bookings={bookings}
            onSynced={(msg) => {
              addToast({
                type: 'success',
                title: 'اكتملت المزامنة السحابية 🔥',
                description: msg
              });
            }}
          />
        )}

        {activeTab === 'legal' && (
          <LegalHubView 
            onBackToMarket={() => setActiveTab('market')}
            selectedDocId={legalSelectedDocId}
            onSelectDoc={setLegalSelectedDocId}
          />
        )}
      </main>

      {/* Booking Modal */}
      {bookingTarget && (
        <BookingModal
          salon={bookingTarget.salon}
          service={bookingTarget.service}
          currentUser={currentUser}
          availableServices={services.filter(s => s.salonId === bookingTarget.salon._id)}
          existingBookings={bookings}
          onConfirm={handleConfirmBooking}
          onCancel={() => setBookingTarget(null)}
        />
      )}

      {/* Official Saudi Business Verified Footer */}
      <Footer 
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenLegalDoc={(docId) => setLegalSelectedDocId(docId)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setRegisterModal({ isOpen: true, initialRole: 'customer' })}
      />

      {/* Real-time Floating Notification Banner */}
      <FloatingNotificationToast
        notification={activeFloatingToast}
        onDismiss={() => setActiveFloatingToast(null)}
        onClick={(notif) => {
          handleMarkAsRead(notif.id);
          setActiveFloatingToast(null);
          setActiveTab('bookings');
        }}
      />

      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Global Legal & Commission Transparency Modal */}
      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Independent Login Modal: Uses signInWithEmailAndPassword only */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => setRegisterModal({ isOpen: true, initialRole: 'customer' })}
      />

      {/* Independent Register Modal: Uses createUserWithEmailAndPassword */}
      <RegisterModal
        isOpen={registerModal.isOpen}
        initialRole={registerModal.initialRole}
        onClose={() => setRegisterModal(prev => ({ ...prev, isOpen: false }))}
        onRegisterSuccess={handleRegisterSuccess}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Provider & Freelancer Registration Modal */}
      <ProviderRegistrationModal
        isOpen={registrationModal.isOpen}
        type={registrationModal.type}
        currentUser={currentUser}
        onClose={() => setRegistrationModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleRegisterProvider}
      />
    </div>
  );
}

