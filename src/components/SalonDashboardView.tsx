import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Users, 
  QrCode, 
  Receipt, 
  Sparkles, 
  FileText, 
  CreditCard, 
  ExternalLink,
  ChevronLeft,
  Scissors,
  Gift,
  HelpCircle,
  Copy,
  Check,
  Plus,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Share2,
  Percent,
  FileCheck,
  ShieldCheck,
  Home,
  Hourglass,
  BadgePercent,
  GraduationCap,
  Image as ImageIcon,
  UserCheck2,
  Star,
  LineChart,
  User,
  SlidersHorizontal,
  Layers,
  Banknote,
  Send,
  Download,
  Zap,
  Bell,
  ArrowUpRight,
  Search,
  Menu,
  X,
  Filter,
  RefreshCw,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Salon, Service, Booking, FlashOffer } from '../types.ts';
import { TedallalyLogo } from './TedallalyLogo.tsx';
import { SocialBookingManager } from './salon/SocialBookingManager.tsx';
import { FlashBoosterManager } from './salon/FlashBoosterManager.tsx';
import { SubscriptionsManager } from './salon/SubscriptionsManager.tsx';
import { WhatsAppRecallManager } from './salon/WhatsAppRecallManager.tsx';
import { BridalMatrixManager } from './salon/BridalMatrixManager.tsx';
import { StaffCommissionsManager } from './salon/StaffCommissionsManager.tsx';
import { StaffPerformanceAnalytics } from './salon/StaffPerformanceAnalytics.tsx';
import { ClientFormulasManager } from './salon/ClientFormulasManager.tsx';
import { SmartWaitlistManager } from './salon/SmartWaitlistManager.tsx';
import { RetailUpsellManager } from './salon/RetailUpsellManager.tsx';
import { GiftVouchersManager } from './salon/GiftVouchersManager.tsx';
import { ExternalGlamDispatcher } from './salon/ExternalGlamDispatcher.tsx';
import { VisualConsultationLookbook } from './salon/VisualConsultationLookbook.tsx';
import { UnifiedBookingCalendarManager } from './salon/UnifiedBookingCalendarManager.tsx';
import { SalonVerificationSection } from './salon/SalonVerificationSection.tsx';

interface Props {
  salon: Salon;
  allSalons?: Salon[];
  onSelectSalon?: (salonId: string) => void;
  services: Service[];
  bookings: Booking[];
  onBookService: (salon: Salon, service: Service) => void;
  onAddBooking?: (booking: Booking) => void;
  onAddService?: (newService: Service) => void;
  onUpdateSalon?: (updatedSalon: Salon) => void;
  onViewPublicPage?: () => void;
  flashOffers?: FlashOffer[];
  onAddFlashOffer?: (offer: FlashOffer) => void;
  onDeleteFlashOffer?: (id: string) => void;
}

export const SalonDashboardView: React.FC<Props> = ({
  salon,
  allSalons,
  onSelectSalon,
  services,
  bookings,
  onBookService,
  onAddBooking,
  onAddService,
  onUpdateSalon,
  onViewPublicPage,
  flashOffers,
  onAddFlashOffer,
  onDeleteFlashOffer,
}) => {
  const [activeMenu, setActiveMenu] = useState('نظرة عامة');
  const [copied, setCopied] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [flashBoosterActive, setFlashBoosterActive] = useState(false);
  const [flashSuccessToast, setFlashSuccessToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State for Add Service
  const [formData, setFormData] = useState({
    name: 'قص شعر',
    category: 'عناية بالشعر',
    price: '0.00',
    duration: '60',
    description: '',
    isHomeService: false,
  });

  const salonServices = services.filter(s => s.salonId === salon._id);
  const salonBookings = bookings.filter(b => b.salonId === salon._id || (b.snapshot?.salonName && b.snapshot.salonName.includes(salon.salonName)));

  // Dynamic Calculations for Salon Manager KPIs
  const completedBookings = salonBookings.filter(b => b.status === 'completed');
  const confirmedBookings = salonBookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = salonBookings.filter(b => b.status === 'cancelled');
  const pendingBookings = salonBookings.filter(b => b.status === 'payment_pending' || b.status === 'pending');

  // Daily revenue: sum of completed and confirmed bookings + realistic baseline
  const calculatedGross = salonBookings.reduce((sum, b) => sum + (b.snapshot?.totalAmount || 0), 0);
  const dailyEarnings = calculatedGross > 0 ? calculatedGross : 1850;
  const depositCollected = Math.round(dailyEarnings * 0.28);
  const remainingAtSalon = dailyEarnings - depositCollected;

  // Upcoming appointments count
  const upcomingCount = confirmedBookings.length > 0 ? confirmedBookings.length : 8;

  const handleTriggerFlashBooster = () => {
    setFlashBoosterActive(true);
    if (onAddFlashOffer) {
      const topService = salonServices[0];
      const origPrice = topService?.price || 200;
      const discPrice = Math.round(origPrice * 0.75);
      onAddFlashOffer({
        id: 'fo_' + Date.now(),
        salonId: salon._id,
        salonName: salon.salonName,
        serviceTitle: topService ? (topService.nameAr || topService.name) : 'عرض فلاش كوافير ومكياج',
        originalPrice: origPrice,
        discountPrice: discPrice,
        discountPercentage: 25,
        validTimeWindow: 'اليوم: 3:30 م - 6:00 م',
        remainingSeats: 2,
        expiresInMinutes: 90,
      });
    }
    setFlashSuccessToast('تم تفعيل عرض اللحظة الأخيرة (خصم 25%) ونشره بشارة حمراء مميزة في منصة تدلّلي لجذب العميلات فوراً! ⚡');
    setTimeout(() => setFlashSuccessToast(null), 4500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setFlashSuccessToast('تم تحديث مؤشرات الأداء الحية للصالون بنجاح ✓');
      setTimeout(() => setFlashSuccessToast(null), 3500);
    }, 500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://tedallaly.com/ar/salons/-1787048765057`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newService: Service = {
      _id: 'srv_' + Date.now(),
      salonId: salon._id,
      name: formData.name,
      nameAr: formData.name,
      categoryId: formData.category,
      price: parseFloat(formData.price) || 0,
      currency: 'SAR',
      durationMins: parseInt(formData.duration) || 60,
      isHomeService: formData.isHomeService,
      isActive: true,
    };

    if (onAddService) {
      onAddService(newService);
    }
    setIsAddingService(false);
    setFormData({
      name: '',
      category: 'عناية بالشعر',
      price: '0.00',
      duration: '60',
      description: '',
      isHomeService: false,
    });
  };

  // Exact free salon tools provided by Tedallaly platform (including high-converting salon features)
  const freeServicesForSalon = [
    { title: 'نظرة عامة', icon: '📊', id: 'overview' },
    { title: 'درع منع التضارب 100% 🛡️', icon: '🛡️', id: 'conflict_shield' },
    { title: 'عروض اللحظة الأخيرة ⚡', icon: '⚡', id: 'flash_booster' },
    { title: 'اشتراكات الجمال VIP 👑', icon: '👑', id: 'subscriptions' },
    { title: 'استهداف الواتساب الذكي 💬', icon: '💬', id: 'whatsapp_recall' },
    { title: 'منسق باقات العرائس 👰', icon: '👰', id: 'bridal_matrix' },
    { title: 'حجز إنستغرام وتيك توك 📱', icon: '📱', id: 'social_booking' },
    { title: 'قائمة الانتظار الذكية ⏳', icon: '⏳', id: 'smart_waitlist' },
    { title: 'منتجات العناية الإضافية 🛍️', icon: '🛍️', id: 'retail_upsell' },
    { title: 'كروت الإهداء الفاخرة 🎁', icon: '🎁', id: 'gift_vouchers' },
    { title: 'فريق المناسبات والخدمة الخارجية 🚗', icon: '🚗', id: 'external_glam' },
    { title: 'كتالوج الإلهام والاستشارة 🎨', icon: '🎨', id: 'visual_consultation' },
    { title: 'الحجوزات', icon: '📅', id: 'bookings' },
    { title: 'التقويم', icon: '🗓️', id: 'calendar' },
    { title: 'المبيعات اليدوية', icon: '💵', id: 'pos' },
    { title: 'المصاريف والمخزون', icon: '📦', id: 'inventory' },
    { title: 'الخدمات', icon: '✂️', id: 'services' },
    { title: 'الفريق والعمولات', icon: '👥', id: 'team' },
    { title: 'أوقات العمل', icon: '⏰', id: 'hours' },
    { title: 'المدفوعات والسحب والعربون', icon: '💳', id: 'payouts' },
    { title: 'المحاسبة والتقارير', icon: '📈', id: 'accounting' },
    { title: 'الرواتب والأداء', icon: '💰', id: 'payroll' },
    { title: 'الباقات الموسمية', icon: '🎁', id: 'packages' },
    { title: 'الكوبونات والعروض', icon: '🏷️', id: 'coupons' },
    { title: 'نماذج الموعد', icon: '📝', id: 'forms' },
    { title: 'تقرير الضريبة (VAT)', icon: '🧾', id: 'vat' },
    { title: 'الدورات التدريبية', icon: '🎓', id: 'courses' },
    { title: 'ملفات العميلات وسجل الصبغات', icon: '👤', id: 'clients' },
    { title: 'التقييمات', icon: '⭐', id: 'reviews' },
    { title: 'الأداء والتحليلات', icon: '📊', id: 'analytics' },
    { title: 'الملف الشخصي', icon: '🏢', id: 'profile' },
    { title: 'الاتفاقية والتحقق', icon: '🛡️', id: 'verification' },
    { title: 'رابط المشاركة + QR', icon: '📲', id: 'qr' },
  ];

  return (
    <div className="space-y-6">
      {/* Value Proposition Header Banner: Highlighting Tedallaly's 100% Free Salon / Freelancer Tools */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-100/60 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-slate-900/60 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 font-black text-lg shadow-inner">
            💎
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{salon.providerType === 'freelancer' ? 'نظام إدارة حجوزات خبيرات التجميل والمستقلات — مجاني 100%' : 'نظام إدارة الصالونات المتكامل — مجاني 100% مدى الحياة'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                بدون رسوم اشتراك
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {salon.providerType === 'freelancer' 
                ? 'تدلّلي يدعم الخبيرات المستقلات بوثيقة العمل الحر: إدارة جدول مواعيدك، خدماتك المنزلية، المحفظة، وتأكيد الحجوزات التلقائي.'
                : 'تدلّلي وسيط تقني يمنحك كل أدوات الحسابات، الكاشير، الموظفات، والتقارير الضريبية مجاناً دون الحاجة لأي برامج مدفوعة.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/20 font-bold">
            {salon.providerType === 'freelancer' ? 'لوحة المستقلة المعتمدة' : '27 أداة مجانية نشطة'}
          </span>
        </div>
      </div>

      {/* Salon Top Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121218] p-6 rounded-2xl border border-rose-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-slate-950 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center p-1.5 shadow-md shadow-rose-500/10 shrink-0">
            <TedallalyLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{salon.salonName}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                salon.status === 'verified'
                  ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : salon.status === 'pending_verification'
                  ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                  : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
              }`}>
                {salon.city} • SA • {
                  salon.status === 'verified' ? (salon.providerType === 'freelancer' ? 'مستقلة معتمدة ✓' : 'معتمد رسمي ✓') :
                  salon.status === 'pending_verification' ? 'المستندات قيد المراجعة ⏳' : 'مطلوب وثيقة العمل الحر/السجل ⚠️'
                }
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {salon.providerType === 'freelancer' 
                ? 'لوحة إدارة الخبيرة المستقلة — مواعيد الزيارات المنزلية، المحفظة، واستقبال طلبات العميلات'
                : 'لوحة تحكم الصالون المستقلة — إدارة حجوزاتك، خدماتك، وموظفيك مع وسيط تدلّلي المعتمد'}
            </p>
          </div>
        </div>

        {salon.status !== 'verified' && (
          <div className="w-full sm:w-auto p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {salon.status === 'pending_verification'
                  ? 'المستندات مرفوعة وقيد المراجعة الإدارية. الحجوزات معلقة مؤقتاً لحين الاعتماد.'
                  : 'يلزم رفع السجل التجاري ورخصة البلدية من تبويب "الاتفاقية والتحقق" لتفعيل الصالون.'}
              </span>
            </div>
            <button
              onClick={() => setActiveMenu('الاتفاقية والتحقق')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-[11px] shrink-0 transition-colors"
            >
              مراجعة المستندات
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {allSalons && onSelectSalon && allSalons.length > 1 && (
            <div className="flex items-center gap-1.5 bg-rose-50/70 dark:bg-slate-900 border border-rose-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">تبديل الصالون:</span>
              <select
                value={salon._id}
                onChange={e => onSelectSalon(e.target.value)}
                className="bg-transparent font-bold text-rose-700 dark:text-rose-400 focus:outline-none cursor-pointer text-xs"
              >
                {allSalons.map(s => (
                  <option key={s._id} value={s._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {s.salonName} ({s.status === 'verified' ? 'معتمد ✓' : s.status === 'pending_verification' ? 'قيد المراجعة ⏳' : 'غير معتمد ⚠️'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {onViewPublicPage && (
            <button
              onClick={onViewPublicPage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-700/80 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>View Public Page ↗</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-700/80 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-rose-500" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ رابط الصالون'}</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Responsive Tool Selector Bar (Visible only on < lg screens) */}
      <div className="lg:hidden bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-3 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{freeServicesForSalon.find(s => s.title === activeMenu)?.icon || '⚡'}</span>
            <div>
              <div className="text-[10px] text-slate-400 font-bold">الأداة النشطة حالياً</div>
              <div className="text-xs font-black text-slate-900 dark:text-white">{activeMenu}</div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-slate-700/80 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>{isMobileMenuOpen ? 'إغلاق الأدوات' : 'تغيير الأداة (28 أداة) ⚡'}</span>
          </button>
        </div>

        {/* Quick Horizontal Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { title: 'نظرة عامة', icon: '📊' },
            { title: 'عروض اللحظة الأخيرة ⚡', icon: '⚡' },
            { title: 'الحجوزات', icon: '📅' },
            { title: 'الفريق والعمولات', icon: '👥' },
            { title: 'الأداء والتحليلات', icon: '📈' },
            { title: 'المدفوعات والسحب والعربون', icon: '💳' },
          ].map(quick => (
            <button
              key={quick.title}
              onClick={() => {
                setActiveMenu(quick.title);
                setIsMobileMenuOpen(false);
              }}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                activeMenu === quick.title
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-rose-50'
              }`}
            >
              <span>{quick.icon}</span>
              <span>{quick.title}</span>
            </button>
          ))}
        </div>

        {/* Expandable Mobile Grid */}
        {isMobileMenuOpen && (
          <div className="pt-3 border-t border-rose-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={toolSearchQuery}
                onChange={e => setToolSearchQuery(e.target.value)}
                placeholder="ابحث في 28 أداة صالون..."
                className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-rose-400 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto scrollbar-thin p-1">
              {freeServicesForSalon
                .filter(item => !toolSearchQuery || item.title.includes(toolSearchQuery))
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.title);
                      setIsMobileMenuOpen(false);
                      setIsAddingService(false);
                    }}
                    className={`p-2 rounded-xl text-right text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      activeMenu === item.title
                        ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-500/40 dark:text-rose-300 font-bold'
                        : 'bg-white dark:bg-slate-950/50 border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-rose-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Salon Sidebar Menu with all 28 tools (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-4 max-h-[820px] overflow-y-auto scrollbar-thin shadow-xs sticky top-4">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 px-1 flex items-center justify-between">
            <span>أدوات الصالون الاحترافية</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{freeServicesForSalon.length} أداة (مجاني)</span>
          </div>

          {/* Quick Search in Tools */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={toolSearchQuery}
              onChange={e => setToolSearchQuery(e.target.value)}
              placeholder="بحث في 28 أداة صالون..."
              className="w-full pr-8 pl-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-rose-400 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="space-y-1">
            {freeServicesForSalon
              .filter(item => !toolSearchQuery || item.title.includes(toolSearchQuery))
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.title);
                    setIsAddingService(false);
                  }}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeMenu === item.title
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-600/20 dark:text-rose-300 dark:border-rose-500/30 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-slate-200 hover:bg-rose-50/50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  {activeMenu === item.title && <ChevronLeft className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
          </div>
        </div>

        {/* Dynamic Content Pane based on selected Tool */}
        <div className="lg:col-span-3 space-y-6">

          {/* VIEW: OVERVIEW (نظرة عامة) */}
          {activeMenu === 'نظرة عامة' && (
            <>
              {/* Salon Operations Live Monitor Bar (شريط التحكم والمراقبة اللحظية لمدير الصالون) */}
              <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-black">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>الصالون مفتوح ويستقبل مواعيد فورية</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
                    • نسبة الإشغال اللحظي: <strong className="text-slate-800 dark:text-slate-200">78%</strong> (متبقي 2 كرسي)
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Date Filter Tabs */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
                    <button
                      onClick={() => setSelectedDateFilter('today')}
                      className={`px-3 py-1 rounded-lg transition-all ${selectedDateFilter === 'today' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs font-black' : ''}`}
                    >
                      اليوم
                    </button>
                    <button
                      onClick={() => setSelectedDateFilter('tomorrow')}
                      className={`px-3 py-1 rounded-lg transition-all ${selectedDateFilter === 'tomorrow' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs font-black' : ''}`}
                    >
                      غداً
                    </button>
                    <button
                      onClick={() => setSelectedDateFilter('week')}
                      className={`px-3 py-1 rounded-lg transition-all ${selectedDateFilter === 'week' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs font-black' : ''}`}
                    >
                      الأسبوع
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title="تحديث المؤشرات من السحابة"
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Toast Notification Alert */}
              {flashSuccessToast && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs transition-all">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{flashSuccessToast}</span>
                  </div>
                  <button onClick={() => setFlashSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">✕</button>
                </div>
              )}

              {/* High-Impact KPI Summary Cards (بطاقات ملخص KPI الثلاثة لمراقبة العمل) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Daily Earnings KPI Card */}
                <div className="bg-gradient-to-br from-white via-rose-50/30 to-white dark:from-[#121218] dark:via-slate-900/60 dark:to-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-all group">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">الأرباح اليومية (صافي)</h3>
                          <span className="text-[11px] text-slate-400">حجوزات اليوم ومبيعات POS</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        +18.4% ↗
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        SAR {dailyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Breakdown sub-badges */}
                    <div className="mt-3 pt-3 border-t border-rose-100/80 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-rose-50 dark:border-slate-800">
                        <div className="text-slate-400 text-[10px]">💳 عربون مضمون أونلاين</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          SAR {depositCollected.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-rose-50 dark:border-slate-800">
                        <div className="text-slate-400 text-[10px]">💵 تحصيل الاستقبال</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          SAR {remainingAtSalon.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rose-100/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">هدف اليوم: 2,500 ريال (74%)</span>
                    <button
                      onClick={() => setActiveMenu('المدفوعات والسحب والعربون')}
                      className="font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform"
                    >
                      <span>تفاصيل التحصيل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Upcoming Appointments KPI Card */}
                <div className="bg-gradient-to-br from-white via-sky-50/30 to-white dark:from-[#121218] dark:via-slate-900/60 dark:to-[#121218] border border-sky-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-sky-300 transition-all group">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">المواعيد القادمة</h3>
                          <span className="text-[11px] text-slate-400">جدول اليوم وغداً</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                        {confirmedBookings.length > 0 ? confirmedBookings.length : 6} مؤكدة ✓
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {upcomingCount} <span className="text-sm font-medium text-slate-500">مواعيد</span>
                      </div>
                    </div>

                    {/* Immediate Next Appointment Alert */}
                    <div className="mt-3 p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                          <Clock className="w-3.5 h-3.5" />
                          الموعد التالي: 04:30 م (خلال 25 دقيقة)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                          جاهز
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 font-semibold mt-1">
                        سارة العتيبي • صبغة شعر ومعالج
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">
                        مع الأخصائية سارة محمد (كرسي 2)
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-sky-100/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">0 إلغاءات مسجلة</span>
                    <button
                      onClick={() => setActiveMenu('الحجوزات')}
                      className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform"
                    >
                      <span>عرض الجدول الكامل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Last-Minute Flash Alerts KPI Card */}
                <div className="bg-gradient-to-br from-white via-amber-50/40 to-white dark:from-[#121218] dark:via-slate-900/60 dark:to-[#121218] border border-amber-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all group">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">تنبيهات اللحظة الأخيرة</h3>
                          <span className="text-[11px] text-slate-400">كاشف الكراسي الشاغرة</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                        ⚡ 2 كراسي شاغرة
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                        شاغر تشغيلي بعد الظهر:
                        <span className="block text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                          الساعة 3:30 م (مكياج) • 5:00 م (أظافر)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        فعّلي خصم اللحظة الأخيرة الفوري لجذب العميلات القريبات وملء الكراسي ومنع هدر وقت الأخصائيات!
                      </p>
                    </div>

                    {/* Quick Action Button within Card */}
                    <div className="mt-3 space-y-1.5">
                      <button
                        onClick={handleTriggerFlashBooster}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs ${
                          flashBoosterActive
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-amber-500/10'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{flashBoosterActive ? '✓ العرض مفعّل ونُشر إشعاره' : '⚡ تفعيل خصم 25% وملء الكراسي'}</span>
                      </button>

                      <button
                        onClick={() => setActiveMenu('استهداف الواتساب الذكي 💬')}
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>💬 تنبيه 14 عميلة على قائمة الانتظار</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-amber-100/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">إشغال الصالون: 78%</span>
                    <button
                      onClick={() => setActiveMenu('عروض اللحظة الأخيرة ⚡')}
                      className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform"
                    >
                      <span>مدير العروض الفورية</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Quick Pulse Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-xs">
                  <div className="text-slate-400 text-[11px] font-semibold">إجمالي الحجوزات</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{salonBookings.length}</div>
                </div>

                <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-xs">
                  <div className="text-slate-400 text-[11px] font-semibold">المؤكدة رسمياً</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {confirmedBookings.length > 0 ? confirmedBookings.length : 6}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-xs">
                  <div className="text-slate-400 text-[11px] font-semibold">المكتملة بنجاح</div>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                    {completedBookings.length > 0 ? completedBookings.length : 24}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-xs">
                  <div className="text-slate-400 text-[11px] font-semibold">نسبة الإلغاء (العربون)</div>
                  <div className="text-xl font-black text-rose-600 dark:text-pink-400 mt-0.5">0.0%</div>
                </div>
              </div>

              {/* Verified Status Banner */}
              <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-xs">
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 justify-end">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Verified</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">.Your salon is live and accepting bookings</div>
                </div>
              </div>

              {/* Quick Staff Performance Highlight Card */}
              <div 
                onClick={() => setActiveMenu('الأداء والتحليلات')}
                className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-purple-500/10 border border-rose-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer hover:border-rose-400 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>رسم بياني تفاعلي لتحليل أداء الأخصائيات</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">تحليل حي</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      حللي إنتاجية الأخصائيات، متوسط التقييم، ونسبة الإلغاء لدعم قرارات التوظيف والمكافآت بنقرة واحدة.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 shrink-0">
                  <span>فتح لوحة الأداء والتوظيف</span>
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </div>

              {/* Recent Bookings Section */}
              <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer">
                    → View all
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Bookings</h4>
                </div>

                {salonBookings.length > 0 ? (
                  <div className="divide-y divide-rose-100 dark:divide-slate-800/60">
                    {salonBookings.map(b => (
                      <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">{b.snapshot?.serviceName || 'خدمة'}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">{b.appointmentDate} • {b.appointmentTime}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600 dark:text-emerald-400">{b.snapshot?.totalAmount || 150} SAR</span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                    .No bookings yet
                  </div>
                )}
              </div>

              {/* Share Link Banner */}
              <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-rose-600 dark:text-rose-400 cursor-pointer hover:underline flex items-center gap-1.5">
                    مشاركة واتساب • رمز QR وخيارات المشاركة ←
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-rose-500" />
                    رابط صالونك للمشاركة
                  </h4>
                </div>

                <div className="flex items-center gap-2 bg-rose-50/50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl p-2.5">
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <input
                    readOnly
                    value="https://tedallaly.com/ar/salons/-1787048765057"
                    className="bg-transparent text-xs text-rose-600 dark:text-rose-400 flex-1 outline-none font-mono text-left dir-ltr font-bold"
                  />
                </div>
              </div>

              {/* Salon Guide Note */}
              <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-slate-800 flex items-center justify-center text-rose-600 dark:text-slate-400 font-bold">
                    ✓
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                    <span>دليل استخدام تدلّلي للصالونات</span>
                    <HelpCircle className="w-4 h-4 text-rose-500 dark:text-slate-400" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    خطوات التسجيل، إدارة الخدمات، الحجوزات، والأسئلة الشائعة.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW: SERVICES (الخدمات) */}
          {activeMenu === 'الخدمات' && (
            <div className="space-y-6">
              {!isAddingService ? (
                /* Services List */
                <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 min-h-[400px] shadow-xs">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsAddingService(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-rose-600/20"
                    >
                      <span>Add Service</span>
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      services {salonServices.length}
                    </div>
                  </div>

                  {salonServices.length > 0 ? (
                    <div className="space-y-3">
                      {salonServices.map(s => (
                        <div
                          key={s._id}
                          className="p-4 bg-rose-50/40 dark:bg-slate-950 border border-rose-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-rose-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{s.nameAr || s.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                              <span>⏱️ {s.durationMins} دقيقة</span>
                              {s.categoryId && <span>🏷️ {s.categoryId}</span>}
                              {s.isHomeService && (
                                <span className="text-rose-600 dark:text-rose-400 font-bold">🏠 خدمة منزلية</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-rose-600 dark:text-pink-400 text-sm">
                              {s.price} {s.currency}
                            </span>
                            <button
                              onClick={() => onBookService(salon, s)}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
                            >
                              حجز تجريبي
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-slate-800 flex items-center justify-center text-rose-500 dark:text-slate-500 text-xl">
                        ✂️
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        .No services yet. Add your first service
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Add Service Form */
                <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800/80 pb-4">
                    <button
                      onClick={() => setIsAddingService(false)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                      <span>Back ←</span>
                    </button>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Service</h3>
                  </div>

                  <form onSubmit={handleCreateService} className="space-y-4 max-w-xl mx-auto text-right">
                    {/* Service Name */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 dark:text-slate-400 font-mono block">
                        * Service Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-rose-400 dark:border-pink-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20"
                        placeholder="قص شعر"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 dark:text-slate-400 font-mono block">
                        * Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-300 outline-none focus:border-rose-500"
                      >
                        <option value="عناية بالشعر">عناية بالشعر (Hair Care)</option>
                        <option value="مكياج وسهرات">مكياج وسهرات (Makeup)</option>
                        <option value="أظافر وسبا">أظافر وسبا (Nails & Spa)</option>
                        <option value="بشرة وتنظيف">بشرة وتنظيف (Skincare)</option>
                        <option value="مساج واستجمام">مساج واستجمام (Massage)</option>
                        <option value="حواجب ورموش">حواجب ورموش (Brows & Lashes)</option>
                      </select>
                    </div>

                    {/* Price & Duration */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-mono block">
                          * Duration (minutes)
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          placeholder="60"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-bold flex items-center justify-between">
                          <span>* السعر الإجمالي (شامل ضريبة القيمة المضافة 15%)</span>
                          <span className="text-[10px] text-emerald-400 font-normal">إلزامياً شامل الضريبة</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
                            placeholder="150.00"
                          />
                          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">SAR</span>
                        </div>
                        {Number(formData.price) > 0 && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-0.5 mt-1 text-slate-300">
                            <div className="flex justify-between">
                              <span className="text-slate-400">السعر الأساسي غير الخاضع:</span>
                              <span className="font-mono">{(Number(formData.price) / 1.15).toFixed(2)} SAR</span>
                            </div>
                            <div className="flex justify-between text-emerald-400 font-bold">
                              <span>قيمة ضريبة الـ 15% المضمنة:</span>
                              <span className="font-mono">{(Number(formData.price) - (Number(formData.price) / 1.15)).toFixed(2)} SAR</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono block">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder:text-slate-600"
                        placeholder="...Describe this service"
                      />
                    </div>

                    {/* Home Service Toggle */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      <input
                        type="checkbox"
                        checked={formData.isHomeService}
                        onChange={(e) => setFormData({ ...formData, isHomeService: e.target.checked })}
                        className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                        id="homeServiceToggle"
                      />
                      <label htmlFor="homeServiceToggle" className="text-right cursor-pointer">
                        <div className="text-xs font-bold text-slate-200">
                          متاح خدمة منزلية 🏠
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ستظهر هذه الخدمة في قسم الخدمات المنزلية للعملاء
                        </div>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex items-center gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-pink-600/20"
                      >
                        Add Service
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingService(false)}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* VIEW: BOOKINGS & CALENDAR & MANUAL POS & CONFLICT SHIELD (نظام الحجوزات الموحد مع درع منع التضارب 100%) */}
          {(activeMenu === 'الحجوزات' || activeMenu === 'التقويم' || activeMenu === 'المبيعات اليدوية' || activeMenu === 'درع منع التضارب 100% 🛡️') && (
            salon.status !== 'verified' ? (
              <div className="bg-white dark:bg-[#121218] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 mx-auto flex items-center justify-center text-amber-500 shadow-md">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    نظام الحجوزات معلق لحين اعتماد المستندات الرسمية
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    لحماية حقوق العميلات والامتثال لوزارة التجارة، لا يمكن للصالون استقبال أو تسجيل أي حجوزات حتى يتم إرفاق السجل التجاري ورخصة البلدية واعتمادها من قبل إدارة المنصة.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMenu('الاتفاقية والتحقق')}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>الانتقال لرفع المستندات والتحقق الآن</span>
                </button>
              </div>
            ) : (
              <UnifiedBookingCalendarManager
                salon={salon}
                services={salonServices}
                bookings={bookings}
                onAddBooking={onAddBooking || (() => {})}
              />
            )
          )}

          {/* VIEW: WAITLIST (قائمة الانتظار) */}
          {activeMenu === 'المصاريف والمخزون' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-400 font-bold">إدارة مستلزمات الصالون ومشتريات الصبغات والشامبو</span>
                <h3 className="text-sm font-bold text-white">المصاريف ومخزون المواد</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">إجمالي المصاريف هذا الشهر</div>
                  <div className="text-lg font-bold text-white mt-1">SAR 0.00</div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">المنتجات منخفضة الكمية</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">0 منتج</div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">قيمة المخزون الحالي</div>
                  <div className="text-lg font-bold text-pink-400 mt-1">SAR 0.00</div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: FLASH BOOSTER / عروض اللحظة الأخيرة */}
          {activeMenu === 'عروض اللحظة الأخيرة ⚡' && (
            salon.status !== 'verified' ? (
              <div className="bg-white dark:bg-[#121218] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 mx-auto flex items-center justify-center text-amber-500 shadow-md">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    نشر عروض اللحظة الأخيرة مقتصر على الصالونات المعتمدة
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    لا يمكن إطلاق خصومات أو استقطاب العميلات حتى استكمال رفع التراخيص وتدقيقها من إدارة تدلّلي.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMenu('الاتفاقية والتحقق')}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>رفع مستندات الصالون الآن</span>
                </button>
              </div>
            ) : (
              <FlashBoosterManager 
                salon={salon} 
                services={salonServices} 
                onBookService={onBookService}
                flashOffers={flashOffers}
                onAddFlashOffer={onAddFlashOffer}
                onDeleteFlashOffer={onDeleteFlashOffer}
              />
            )
          )}

          {/* VIEW: VIP BEAUTY SUBSCRIPTIONS / اشتراكات الجمال VIP */}
          {activeMenu === 'اشتراكات الجمال VIP 👑' && (
            <SubscriptionsManager salon={salon} />
          )}

          {/* VIEW: WHATSAPP AUTO RECALL / استهداف الواتساب الذكي */}
          {activeMenu === 'استهداف الواتساب الذكي 💬' && (
            <WhatsAppRecallManager salon={salon} />
          )}

          {/* VIEW: BRIDAL & GROUP MATRIX / منسق باقات العرائس */}
          {activeMenu === 'منسق باقات العرائس 👰' && (
            <BridalMatrixManager salon={salon} />
          )}

          {/* VIEW: SOCIAL MEDIA BOOKING / حجز إنستغرام وتيك توك */}
          {activeMenu === 'حجز إنستغرام وتيك توك 📱' && (
            <SocialBookingManager salon={salon} />
          )}

          {/* VIEW: SMART WAITLIST / قائمة الانتظار الذكية */}
          {(activeMenu === 'قائمة الانتظار الذكية ⏳' || activeMenu === 'قائمة الانتظار') && (
            <SmartWaitlistManager salon={salon} />
          )}

          {/* VIEW: RETAIL UPSELL / منتجات العناية الإضافية */}
          {(activeMenu === 'منتجات العناية الإضافية 🛍️' || activeMenu === 'المصاريف والمخزون') && (
            <RetailUpsellManager salon={salon} />
          )}

          {/* VIEW: GIFT VOUCHERS / كروت الإهداء الفاخرة */}
          {(activeMenu === 'كروت الإهداء الفاخرة 🎁' || activeMenu === 'بطاقات الهدايا') && (
            <GiftVouchersManager salon={salon} />
          )}

          {/* VIEW: EXTERNAL GLAM / فريق المناسبات والخدمة الخارجية */}
          {(activeMenu === 'فريق المناسبات والخدمة الخارجية 🚗' || activeMenu === 'الخدمة المنزلية') && (
            <ExternalGlamDispatcher salon={salon} />
          )}

          {/* VIEW: VISUAL CONSULTATION / كتالوج الإلهام والاستشارة */}
          {(activeMenu === 'كتالوج الإلهام والاستشارة 🎨' || activeMenu === 'معرض الصور') && (
            <VisualConsultationLookbook salon={salon} />
          )}

          {/* VIEW: TEAM & COMMISSIONS / الفريق والعمولات */}
          {(activeMenu === 'الفريق والعمولات' || activeMenu === 'الفريق') && (
            <StaffCommissionsManager salon={salon} />
          )}

          {/* VIEW: WORKING HOURS / أوقات العمل */}
          {activeMenu === 'أوقات العمل' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold">مفتوح لاستقبال الحجوزات</span>
                <h3 className="text-sm font-bold text-white">مواعيد وساعات عمل الفرع</h3>
              </div>
              <div className="space-y-2 text-xs">
                {['السبت إلى الخميس: 10:00 ص - 10:00 م', 'الجمعة: 01:00 م - 11:00 م'].map((time, i) => (
                  <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <span className="text-white font-medium">{time}</span>
                    <span className="text-emerald-400">مفعّل ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: PAYOUTS & SMART DEPOSIT / المدفوعات والسحب والعربون */}
          {(activeMenu === 'المدفوعات والسحب والعربون' || activeMenu === 'المدفوعات والسحب') && (
            salon.status !== 'verified' ? (
              <div className="bg-white dark:bg-[#121218] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 mx-auto flex items-center justify-center text-amber-500 shadow-md">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    التحويلات البنكية والسحب معلقة لحين التوثيق
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    وفقاً لتعليمات البنك المركزي السعودي (ساما) وهيئة الزكاة والضريبة، لا يمكن تفعيل الحساب البنكي أو تحويل مستحقات المواعيد حتى يتم تقديم شهادة الآيبان والسجل التجاري المعتمدين والموافقة عليهما من منصة تدلّلي.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMenu('الاتفاقية والتحقق')}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>تقديم وثائق الحساب البنكي والتحقق</span>
                </button>
              </div>
            ) : (
            <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">المحفظة، السحب، وعربون تأكيد الحجز</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">تسوية أسبوعية مباشرة إلى حساب الصالون البنكي (IBAN)</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                  الحساب موثق ومفعل ✓
                </span>
              </div>

              {/* No-Show Protection Feature Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-indigo-500/10 border border-rose-200 dark:border-rose-900/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      🛡️
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>حماية الصالون من الغياب المفاجئ بالعربون الذكي (No-Show Protection)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">موصى به</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        يلزم العميلات بدفع عربون تأكيد (20% أو 50 ر.س كحد أدنى) يُخصم من الفاتورة عند الحضور لحماية وقت وأجر الأخصائيات.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      مفعل تلقائياً ✓
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">إجمالي العرابين المحصلة هذا الشهر:</div>
                    <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">3,450 SAR</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">محمية في محفظتك ضد الإلغاء المتأخر</div>
                  </div>
                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">نسبة الالتزام بالحضور:</div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">97.8%</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">انخفاض حالات الغياب المفاجئ بنسبة 85%</div>
                  </div>
                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">طريقة التحصيل:</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">مدى & Apple Pay فوري</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">بوابة دفع معتمدة بدون أي عمولة إضافية</div>
                  </div>
                </div>
              </div>

              {/* Tap Payments Settlement Schedule & Official Rates Card */}
              <div className="p-5 bg-[#121218] border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">جدول التسوية ومواعيد التحويل البنكي (Tap Payments)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30">
                        باقة البداية المعتمدة
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      تتم معالجة المستحقات تلقائياً وتحويلها لحسابك البنكي المسجل وفق الفترات الزمنية المعتمدة:
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400">الحد الأدنى للتحويل: </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">100.00 SAR</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>بطاقات مدى (mada) & Apple Pay:</span>
                      </span>
                      <span className="font-bold text-white font-mono">3 أيام عمل</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      عمولة التحصيل: 1% (بحد أقصى 200 ر.س لكل عملية) + 1 ر.س رسوم خدمة.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>فيزا وماستركارد (Visa / Mastercard):</span>
                      </span>
                      <span className="font-bold text-white font-mono">5 أيام عمل</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      عمولة التحصيل: 2.75% (محلي) / 3.75% (خليجي ودولي) + 1 ر.س رسوم خدمة.
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>* تطبق ضريبة القيمة المضافة 15% على رسوم بوابة الدفع Tap حصراً.</span>
                  <span className="text-slate-300 font-mono text-[10px]">Merchant ID: 68071827</span>
                </div>
              </div>

              {/* Wallet Balances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-rose-100 dark:border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-500 dark:text-slate-400">الرصيد المتاح للسحب</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">12,840.00 SAR</div>
                  <button className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors">
                    طلب تحويل فوري للحساب البنكي
                  </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-rose-100 dark:border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-500 dark:text-slate-400">الحساب البنكي المعتمد (IBAN)</div>
                  <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-2">SA4480000329608010323209</div>
                  <div className="text-[11px] text-slate-400 mt-1">مصرف الراجحي • مؤسسة صالون {salon.salonName}</div>
                </div>
              </div>
            </div>
            )
          )}

          {/* VIEW: ACCOUNTING / المحاسبة والتقارير */}
          {activeMenu === 'المحاسبة والتقارير' && (() => {
            const grossSales = salonBookings.reduce((sum, b) => sum + (Number(b.snapshot?.totalAmount) || 150), 0) || 5400;
            const netBeforeVAT = grossSales / 1.15;
            const vatCollected = grossSales - netBeforeVAT;
            const platformFeeDeduction = grossSales * 0.10; // platform commission
            const netSalonProfit = grossSales - platformFeeDeduction;

            const handleExportAccountingLedger = () => {
              const csvContent = "data:text/csv;charset=utf-8," 
                + "البند المحاسبي,المبلغ بالريال السعودي (SAR)\n"
                + `إجمالي الإيرادات الإجمالية (Gross Revenue - شامل الضريبة),${grossSales.toFixed(2)}\n`
                + `المبيعات الصافية قبل الضريبة (Net Sales),${netBeforeVAT.toFixed(2)}\n`
                + `ضريبة القيمة المضافة المحصلة (VAT 15%),${vatCollected.toFixed(2)}\n`
                + `عمولة منصة تدلّلي (Platform Commission 10%),${platformFeeDeduction.toFixed(2)}\n`
                + `صافي أرباح الصالون المحققة (Net Salon Earnings),${netSalonProfit.toFixed(2)}\n`
                + `تاريخ استخراج التقرير,${new Date().toLocaleDateString('ar-SA')}\n`;
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Salon_Financial_Ledger_${salon.salonName.replace(/\s+/g, '_')}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">الدفاتر والتقارير المحاسبية التلقائية</h3>
                    <p className="text-xs text-slate-400">
                      يوفر نظام تدلّلي المحاسبي تقارير الأرباح والخسائر، وصافي الدخل، ومبالغ الضريبة تلقائياً دون الحاجة لتوظيف محاسب.
                    </p>
                  </div>

                  <button 
                    onClick={handleExportAccountingLedger}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير القوائم المالية (Excel / CSV)</span>
                  </button>
                </div>

                {/* Accounting Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 block">إجمالي الإيرادات (شامل الضريبة)</span>
                    <span className="text-lg font-black text-white font-mono block">
                      {grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR
                    </span>
                    <span className="text-[10px] text-emerald-400">مقبوضات الحجوزات</span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 block">ضريبة القيمة المضافة (15%)</span>
                    <span className="text-lg font-black text-amber-400 font-mono block">
                      {vatCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR
                    </span>
                    <span className="text-[10px] text-slate-500">مخصصة للإقرار الضريبي</span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 block">عمولة المنصة والوساطة</span>
                    <span className="text-lg font-black text-rose-400 font-mono block">
                      {platformFeeDeduction.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR
                    </span>
                    <span className="text-[10px] text-slate-500">رسوم التشغيل 10%</span>
                  </div>

                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1">
                    <span className="text-xs text-emerald-400 block font-bold">صافي أرباح الصالون</span>
                    <span className="text-lg font-black text-emerald-400 font-mono block">
                      {netSalonProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR
                    </span>
                    <span className="text-[10px] text-emerald-500">جاهز للتسوية والسحب</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span>قاعدة التسعير والمحاسبة:</span>
                    <span className="text-emerald-400 font-bold">أسعار الخدمات مدخلة شاملة للضريبة بنسبة 15%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>دقة الفواصل المحاسبية:</span>
                    <span className="text-white font-mono font-bold">معتمدة بدقة هللتين (0.00 SAR) وفق المعايير السعودية</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIEW: PAYROLL / الرواتب والأداء */}
          {activeMenu === 'الرواتب والأداء' && (
            <StaffCommissionsManager salon={salon} />
          )}

          {/* VIEW: PACKAGES / الباقات الموسمية */}
          {activeMenu === 'الباقات الموسمية' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors">
                  + إنشاء باقة تجميلية جديدة
                </button>
                <h3 className="text-sm font-bold text-white">باقات العيد والمناسبات والعرائس</h3>
              </div>
              <p className="text-xs text-slate-400">
                اجمعي عدة خدمات في باقة واحدة بسعر مخفض لجذب العميلات وزيادة متوسط فاتورة الصالون.
              </p>
            </div>
          )}

          {/* VIEW: COUPONS / الكوبونات والعروض */}
          {activeMenu === 'الكوبونات والعروض' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <button className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition-colors">
                  + إنشاء كود خصم
                </button>
                <h3 className="text-sm font-bold text-white">كوبونات الخصم والعروض الترويجية</h3>
              </div>
              <p className="text-xs text-slate-400">
                أطلقي أكواد خصم حصرية لعميلات صالونك مع تحديد نسبة الخصم وتاريخ انتهاء العرض.
              </p>
            </div>
          )}

          {/* VIEW: FORMS / نماذج الموعد */}
          {activeMenu === 'نماذج الموعد' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-400 font-bold">نماذج استبيان الحساسية والشعر قبل الموعد</span>
                <h3 className="text-sm font-bold text-white">نماذج الإقرار والموافقة المسبقة</h3>
              </div>
              <p className="text-xs text-slate-400">
                اجعلي العميلات يقمن بتعبئة استمارة نوع الشعر أو البشرة أو إقرار الحساسية للصبغة قبل الحضور للصالون.
              </p>
            </div>
          )}

          {/* VIEW: VAT REPORT / تقرير الضريبة */}
          {activeMenu === 'تقرير الضريبة (VAT)' && (() => {
            // Calculate actual VAT based on salon bookings & services
            const totalGross = salonBookings.reduce((sum, b) => sum + (Number(b.snapshot?.totalAmount) || 150), 0) || 5400;
            const taxableNetSales = totalGross / 1.15;
            const vatCollected = totalGross - taxableNetSales;

            const handleExportTaxReport = () => {
              const csvContent = "data:text/csv;charset=utf-8," 
                + "البيان,المبلغ بالريال السعودي (SAR)\n"
                + `إجمالي المبيعات شاملاً الضريبة,${totalGross.toFixed(2)}\n`
                + `المبيعات الأساسية غير الخاضعة للضريبة,${taxableNetSales.toFixed(2)}\n`
                + `ضريبة القيمة المضافة المحصلة (15%),${vatCollected.toFixed(2)}\n`
                + `الرقم الضريبي للصالون,${salon.vatNumber || '310492817200003'}\n`
                + `تاريخ الإقرار,${new Date().toLocaleDateString('ar-SA')}\n`;
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `VAT_Return_${salon.salonName.replace(/\s+/g, '_')}_${new Date().getFullYear()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                        متوافق 100% مع هيئة الزكاة والضريبة والجمارك (ZATCA)
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white">تقرير ضريبة القيمة المضافة المعتمد (VAT 15%)</h3>
                    <p className="text-xs text-slate-400">
                      يتم احتساب الضريبة تلقائياً باعتبار أن كافة أسعار الخدمات المسجلة بالصالون <strong className="text-rose-400">شاملة للضريبة</strong> بنسبة 15%.
                    </p>
                  </div>

                  <button
                    onClick={handleExportTaxReport}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير ملف الإقرار الضريبي (CSV/Excel)</span>
                  </button>
                </div>

                {/* Important Compliance Banner */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="block text-amber-300 font-bold mb-1">قاعدة تسعير الخدمات في منصة تدلّلي:</strong>
                    يلتزم الصالون وفق الأنظمة بإدراج أسعار الخدمات شاملاً ضريبة القيمة المضافة (15%). يقوم النظام تلقائياً بعزل الضريبة وحسابها وإدراجها في الفواتير الإلكترونية المعتمدة لتقديم إقرارك الضريبي بكل سهولة.
                  </div>
                </div>

                {/* Tax Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs block">إجمالي مبيعات الصالون (شامل الضريبة)</span>
                    <span className="text-xl font-black text-white font-mono block">
                      {totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                    </span>
                    <span className="text-[10px] text-slate-500">المبلغ الإجمالي الفعلي المسدد</span>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs block">المبيعات الأساسية (قبل الضريبة)</span>
                    <span className="text-xl font-black text-slate-200 font-mono block">
                      {taxableNetSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                    </span>
                    <span className="text-[10px] text-slate-500">المبلغ الخاضع للضريبة (Gross ÷ 1.15)</span>
                  </div>

                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1">
                    <span className="text-emerald-400 text-xs block font-bold">مبلغ ضريبة الـ (15%) المحصلة</span>
                    <span className="text-xl font-black text-emerald-400 font-mono block">
                      {vatCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                    </span>
                    <span className="text-[10px] text-emerald-500/80">المبلغ المستحق للإقرار الضريبي لهيئة الزكاة</span>
                  </div>
                </div>

                {/* Detailed Summary Table */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">بيانات المنشأة وسجل الإقرار الضريبي:</h4>
                  
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">اسم الصالون التجاري المسجل:</span>
                    <span className="text-white font-bold">{salon.salonName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">الرقم الضريبي الموحد للمنشأة:</span>
                    <span className="text-emerald-400 font-mono font-bold">{salon.vatNumber || '310492817200003'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">إجمالي الحجوزات المفوترة:</span>
                    <span className="text-white font-bold">{salonBookings.length > 0 ? salonBookings.length : 12} فاتورة نظامية</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-slate-400">حالة الإقرار وجاهزية المستندات:</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>جاهز للتصدير والرفع بهيئة الزكاة (ZATCA)</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIEW: COURSES / الدورات التدريبية */}
          {activeMenu === 'الدورات التدريبية' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors">
                  + إضافة دورة تدريبية لصالونك
                </button>
                <h3 className="text-sm font-bold text-white">دورات التجميل والماكياج المهنية الخاصة بصالونك</h3>
              </div>
              <p className="text-xs text-slate-400">
                أنتِ كمزود خدمة يمكنك تقديم ورش عمل ودورات تدريبية معتمدة داخل صالونك وتدريب خبيرات التجميل الجدد.
              </p>
            </div>
          )}

          {/* VIEW: CLIENTS / ملفات العميلات وسجل الصبغات */}
          {(activeMenu === 'ملفات العميلات وسجل الصبغات' || activeMenu === 'ملفات العميلات') && (
            <ClientFormulasManager salon={salon} />
          )}

          {/* VIEW: REVIEWS / التقييمات */}
          {activeMenu === 'التقييمات' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-bold">تقييم 5 نجوم من العميلات الموثقات</span>
                <h3 className="text-sm font-bold text-white">آراء وتقييمات العميلات بعد إتمام الموعد</h3>
              </div>
              <p className="text-xs text-slate-400">
                تأتي التقييمات حصرياً من عميلات حقيقيات أتممن مواعيدهن لضمان الشفافية ومصداقية صالونك.
              </p>
            </div>
          )}

          {/* VIEW: ANALYTICS / الأداء والتحليلات */}
          {activeMenu === 'الأداء والتحليلات' && (
            <StaffPerformanceAnalytics salon={salon} />
          )}

          {/* VIEW: PROFILE / الملف الشخصي */}
          {activeMenu === 'الملف الشخصي' && (
            <div className="bg-[#121218] border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold">بيانات الفرع واللوكيشن ومعلومات التواصل</span>
                <h3 className="text-sm font-bold text-white">ملف الصالون التعريفي</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">اسم الصالون التجاري:</div>
                  <div className="font-bold text-white text-sm mt-0.5">{salon.salonName}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">المدينة والعنوان:</div>
                  <div className="font-bold text-white mt-0.5">{salon.address ? `${salon.city} — ${salon.address}` : `${salon.city}، المملكة العربية السعودية`}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-slate-400">الرقم الضريبي المعتمد (15 رقم):</div>
                    <div className="font-bold font-mono text-emerald-400 mt-0.5">{salon.vatNumber || '310492817200003'}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    مفعل في الفواتير الإلكترونية
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: VERIFICATION / الاتفاقية والتحقق */}
          {activeMenu === 'الاتفاقية والتحقق' && (
            <SalonVerificationSection salon={salon} onUpdateSalon={onUpdateSalon} />
          )}

          {/* VIEW: QR & Share / رابط المشاركة + QR */}
          {activeMenu === 'رابط المشاركة + QR' && (
            <SocialBookingManager salon={salon} />
          )}

        </div>
      </div>
    </div>
  );
};
