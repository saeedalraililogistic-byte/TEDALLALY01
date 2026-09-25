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
import { Salon, Service, Booking, FlashOffer, InAppNotification } from './types.ts';
import { testFirestoreConnection } from './lib/firebase.ts';
import { 
  syncBookingToFirestore, 
  updateBookingStatusInFirestore, 
  syncServiceToFirestore,
  syncSalonToFirestore,
  seedInitialDataToFirestore 
} from './lib/firestoreService.ts';
import { 
  getStoredNotifications, 
  saveStoredNotifications, 
  checkApproachingBookings, 
  createStatusChangeNotification,
  createProximityReminderNotification,
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
import { AuthModal } from './components/AuthModal.tsx';
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

  // Auth Modal State (Login & Register)
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    initialRole?: 'customer' | 'salon_owner' | 'freelancer';
  }>({
    isOpen: false,
    mode: 'login',
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

  const [selectedSalonId, setSelectedSalonId] = useState<string>('');

  // Default active salon (e.g. linked to user, or selected, or first verified salon)
  const activeSalon = salons.find(s => s._id === selectedSalonId) || 
                      (currentUser?.linkedProviderId ? salons.find(s => s._id === currentUser.linkedProviderId) : undefined) ||
                      salons.find(s => s.salonName.includes('احسان') || s.status === 'verified') || 
                      salons[0];

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'salon_owner' || user.role === 'freelancer') {
      if (user.linkedProviderId) setSelectedSalonId(user.linkedProviderId);
      setActiveTab('salon_dash');
    } else if (user.role === 'admin') {
      setActiveTab('admin_dash');
    }
    addToast({
      type: 'success',
      title: `مرحباً بكِ مجدداً، ${user.name} 👋`,
      description: `تم تسجيل الدخول بنجاح بصلاحية: ${user.role === 'admin' ? 'المدير العام' : user.role === 'salon_owner' ? 'إدارة صالون' : user.role === 'freelancer' ? 'خبيرة مستقلة' : 'عميلة'}`
    });
  };

  const handleRegisterSuccess = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    if (newUser.role === 'salon_owner' || newUser.role === 'freelancer') {
      setActiveTab('salon_dash');
    }
    addToast({
      type: 'success',
      title: `أهلاً بكِ في تدلّلي، ${newUser.name}! 🎉`,
      description: 'تم إنشاء حسابكِ الجديد بنجاح ويمكنكِ الاستفادة من جميع المزايا.'
    });
  };

  const handleLogout = () => {
    const prevName = currentUser?.name || 'المستخدم';
    setCurrentUser(null);
    setActiveTab('market');
    addToast({
      type: 'info',
      title: 'تم تسجيل الخروج بنجاح 👋',
      description: `إلى اللقاء ${prevName}. يمكنك تسجيل الدخول في أي وقت.`
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

  // Initialize Firestore connection test and seed verified data on mount
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      if (connected) {
        // Sync real salons, services, and bookings to ensure Firestore database is populated
        seedInitialDataToFirestore(salons, services, bookings).catch(err => {
          console.log('Background sync to Firestore status:', err);
        });
      }
    });
  }, []);

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

    // In-App Notification creation for new booking
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingId: newBooking._id,
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
    addToast({
      type: 'info',
      title: 'تم تحديث بيانات الصالون والمستندات',
      description: `تم تحديث ملف صالون ${updatedSalon.salonName} وإرسال التحديث للمراجعة الإدارية.`
    });
  };

  const handleRegisterProvider = (newProvider: Salon) => {
    setSalons(prev => [newProvider, ...prev]);

    // Automatically create a linked user account for this new provider
    const isFreelance = newProvider.providerType === 'freelancer';
    const newUser: User = {
      _id: 'usr_' + newProvider._id,
      name: newProvider.salonName,
      email: `${newProvider.slug}@tedallaly.com`,
      phone: newProvider.phone,
      role: isFreelance ? 'freelancer' : 'salon_owner',
      city: newProvider.city,
      isActive: true,
      linkedProviderId: newProvider._id
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser); // switch to newly registered provider so they can view their dashboard immediately!
    setSelectedSalonId(newProvider._id);
    setActiveTab('salon_dash');

    addToast({
      type: 'info',
      title: isFreelance ? 'تم رفع طلب تسجيل الخبيرة بنجاح 🌸' : 'تم استلام طلب تسجيل الصالون 🏢',
      description: 'المستندات القانونية قيد مراجعة وتدقيق إدارة منصة تدلّلي. يمكنك استعراض لوحة التحكم ورفع أي مستندات إضافية.'
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

    const isFreelance = targetSalon.providerType === 'freelancer';

    addToast({
      type: 'success',
      title: isFreelance ? 'تمت الموافقة واعتماد الخبيرة المستقلة! 🛡️' : 'تمت الموافقة واعتماد الصالون بنجاح! 🛡️',
      description: `تم اعتماد "${targetSalon.salonName}" رسمياً. يظهر الآن لجميع العميلات ويمكن استقبال الحجوزات ونشر العروض.`
    });
  };

  const handleRejectSalon = (salonId: string, reason?: string) => {
    const targetSalon = salons.find(s => s._id === salonId);
    if (!targetSalon) return;

    const updatedSalon: Salon = {
      ...targetSalon,
      status: 'suspended',
      verificationNotes: reason || 'المستندات غير مكتملة أو غير مطابقة',
    };

    setSalons(prev => prev.map(s => s._id === salonId ? updatedSalon : s));
    syncSalonToFirestore(updatedSalon);

    addToast({
      type: 'error',
      title: 'تم إيقاف/رفض الصالون',
      description: `تم إيقاف صالون "${targetSalon.salonName}" وحجبه عن العميلات لحين استيفاء الشروط وتصحيح التراخيص.`
    });
  };

  const handleUpdateSalonDocumentStatus = (salonId: string, docId: string, docStatus: 'approved' | 'rejected', reason?: string) => {
    const targetSalon = salons.find(s => s._id === salonId);
    if (!targetSalon) return;

    const updatedDocs = (targetSalon.documents || []).map(d => {
      if (d.id === docId) {
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
      approvedAt: allApproved ? new Date().toISOString() : targetSalon.approvedAt
    };

    setSalons(prev => prev.map(s => s._id === salonId ? updatedSalon : s));
    syncSalonToFirestore(updatedSalon);

    addToast({
      type: docStatus === 'approved' ? 'success' : 'info',
      title: docStatus === 'approved' ? 'تم اعتماد المستند بنجاح ✓' : 'تم رفض المستند',
      description: docStatus === 'approved' ? 'تم تحديث حالة المستند وحفظه سحابياً.' : `تم رفض المستند مع إشعار الصالون: ${reason || ''}`
    });
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
                    onOpenLogin={() => setAuthModal({ isOpen: true, mode: 'login' })}
                    onOpenRegister={() => setAuthModal({ isOpen: true, mode: 'register', initialRole: 'customer' })}
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
                    onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    دخول
                  </button>
                  <button
                    onClick={() => setAuthModal({ isOpen: true, mode: 'register', initialRole: 'customer' })}
                    className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-rose-600/20 whitespace-nowrap"
                  >
                    تسجيل
                  </button>
                </div>
              )}

              {/* In-App Notification Center */}
              <NotificationCenter
                notifications={notifications}
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
            allSalons={salons}
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
          />
        )}

        {activeTab === 'admin_dash' && (
          <AdminDashboardView
            salons={salons}
            bookings={bookings}
            onApproveSalon={handleApproveSalon}
            onRejectSalon={handleRejectSalon}
            onUpdateSalonDocumentStatus={handleUpdateSalonDocumentStatus}
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
              setSelectedSalonForBooking(salon);
              // Find or create service for this bridal package
              const bridalService: Service = {
                _id: pkg.id,
                salonId: salon._id,
                title: pkg.name,
                description: pkg.tagline,
                price: pkg.price,
                durationMinutes: 180,
                categoryId: 'cat_bridal',
                availableForHome: true,
                rating: 5.0,
                reviewCount: 38
              };
              setSelectedServiceForBooking(bridalService);
              setIsBookingModalOpen(true);
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
        onOpenLogin={() => setAuthModal({ isOpen: true, mode: 'login' })}
        onOpenRegister={() => setAuthModal({ isOpen: true, mode: 'register', initialRole: 'customer' })}
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

      {/* Authentication Modal: Login & Registration */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        initialRole={authModal.initialRole}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Provider & Freelancer Registration Modal */}
      <ProviderRegistrationModal
        isOpen={registrationModal.isOpen}
        type={registrationModal.type}
        onClose={() => setRegistrationModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleRegisterProvider}
      />
    </div>
  );
}

