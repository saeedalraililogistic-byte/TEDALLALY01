import React, { useState } from 'react';
import { Salon, Service } from '../types.ts';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Crown, 
  Heart, 
  Share2, 
  X, 
  ChevronLeft, 
  Users, 
  Calendar,
  MessageCircle,
  Scissors,
  Check
} from 'lucide-react';

interface Props {
  salon: Salon;
  services: Service[];
  onClose: () => void;
  onBookService: (salon: Salon, service: Service) => void;
}

export const SalonPublicProfileModal: React.FC<Props> = ({
  salon,
  services,
  onClose,
  onBookService,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'flash' | 'subscriptions' | 'bridal' | 'staff' | 'info' | 'reviews'>('services');
  const [copiedLink, setCopiedLink] = useState(false);
  const [liked, setLiked] = useState(false);

  // Filter services for this salon
  const salonServices = services.filter(s => s.salonId === salon._id);

  // Group services by category/type
  const categories = [
    { id: 'all', name: 'جميع الخدمات' },
    { id: 'hair', name: 'الشعر والتساريح' },
    { id: 'makeup', name: 'المكياج والجمال' },
    { id: 'nails', name: 'الأظافر والسبا' },
    { id: 'care', name: 'العناية بالبشرة' }
  ];
  const [selectedSubCat, setSelectedSubCat] = useState('all');

  const filteredServices = salonServices.filter(s => {
    if (selectedSubCat === 'all') return true;
    const name = (s.nameAr || s.name || '').toLowerCase();
    if (selectedSubCat === 'hair') return name.includes('شعر') || name.includes('قص') || name.includes('صبغ') || name.includes('سشوار') || name.includes('بروتين');
    if (selectedSubCat === 'makeup') return name.includes('مكياج') || name.includes('ميك اب') || name.includes('عيون') || name.includes('رموش');
    if (selectedSubCat === 'nails') return name.includes('أظافر') || name.includes('منكير') || name.includes('بدكير') || name.includes('جل');
    if (selectedSubCat === 'care') return name.includes('بشرة') || name.includes('تنظيف') || name.includes('نضارة') || name.includes('مساج');
    return true;
  });

  const handleCopyShare = () => {
    const shareUrl = `https://tedallaly.com/book/@${salon.slug || 'salon'}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Mock Flash Deals for this salon
  const flashDeals = salonServices.slice(0, 2).map((srv, idx) => ({
    service: srv,
    discountPercent: idx === 0 ? 35 : 25,
    discountedPrice: Math.round(srv.price * (1 - (idx === 0 ? 0.35 : 0.25))),
    originalPrice: srv.price,
    timeLeft: idx === 0 ? 'ساعتان و 15 دقيقة' : '45 دقيقة',
    chair: idx === 0 ? 'كرسي الشعر رقم 3' : 'ركن السبا والأظافر'
  }));

  // VIP Subscription Packages
  const vipPackages = [
    {
      id: 'sub-blowout',
      title: 'باقة السشوار والويفي الأسبوعي VIP',
      price: 380,
      period: 'شهرياً',
      features: ['4 جلسات سشوار أو ويفي احترافي', 'جلسة علاج وترطيب عميق مجانية', 'أولوية الحجز في عطلة نهاية الأسبوع', 'مشروب ضيافة فاخر في كل زيارة'],
      badge: 'الأكثر طلباً'
    },
    {
      id: 'sub-nails',
      title: 'اشتراك العناية بالأظافر الملكي',
      price: 450,
      period: 'شهرياً',
      features: ['جلستي منكير وبدكير ملكي سبا', 'تغيير لون جل مرتين شهرياً', 'مساج استرخائي لليدين والقدمين', 'خصم 15% على باقي خدمات الصالون'],
      badge: 'عناية فائقة'
    },
    {
      id: 'sub-glow',
      title: 'باقة النضارة والإشراقة الدورية',
      price: 690,
      period: 'شهرياً',
      features: ['جلستان لتنظيف البشرة العميق والهايدرافيشل', 'جلسة ليزر كربوني نضارة', 'فحص وتحليل البشرة مجاناً مع أخصائية الجلدية', 'عربون الحجز ملغى للمشتركات'],
      badge: 'VIP الذهبي'
    }
  ];

  // Bridal Packages
  const bridalPackages = [
    {
      title: 'باقة العروس الملكية المتكاملة 👰👑',
      price: 2800,
      duration: 'يوم الزفاف + جلسة تحضيرية سابقة',
      items: ['تسريحة زفاف احترافية مع البروفا المسبقة', 'مكياج عروس VIP مع رموش منك ومثبت 24 ساعة', 'تركيب أظافر عروس + سبا ملكي بالأعشاب', 'حمام مغربي ملكي مع ماسك الذهب قبل الزفاف بـ 48 ساعة']
    },
    {
      title: 'باقة العروس ومرافقاتها (3 مرافقات) 👯‍♀️',
      price: 4200,
      duration: 'يوم الزفاف بالكامل',
      items: ['خدمات العروس الملكية الكاملة', 'مكياج وتسريحة لـ 3 من شقيقات أو صديقات العروس', 'جناح خاص مع ضيافة فاخرة في الصالون', 'عربون تأكيد ميسر مع دفع الباقي يوم الحفل']
    }
  ];

  // Mock Stylists
  const staffList = [
    { name: 'سارة محمد', role: 'أخصائية شعر ومكياج سينمائي', rating: 4.9, reviewsCount: 38, experience: '7 سنوات خبرة' },
    { name: 'نورة العتيبي', role: 'خبيرة سبا وأظافر معتمدة', rating: 4.8, reviewsCount: 29, experience: '5 سنوات خبرة' },
    { name: 'منى السعيد', role: 'أخصائية عناية بالبشرة وميزوثيرابي', rating: 5.0, reviewsCount: 44, experience: '8 سنوات خبرة' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#121218] border border-rose-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header with Cover / Brand Banner */}
        <div className="relative bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 p-6 sm:p-8 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all z-10"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  صالون معتمد في تدلّلي
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/30 backdrop-blur-md border border-amber-300/40 text-amber-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  حماية العربون الذكي (No-Show Safe)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{salon.salonName}</h2>

              <div className="flex items-center gap-3 text-xs text-rose-100 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-200" />
                  <span>{salon.city} {salon.address ? `• ${salon.address}` : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span className="font-bold text-white">{salon.averageRating || '4.8'}</span>
                  <span className="text-rose-200">({salon.totalReviews || 24} تقييم)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Call, WhatsApp, Share, Like) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all ${
                  liked 
                    ? 'bg-rose-500 text-white border-rose-300' 
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={handleCopyShare}
                className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md transition-all relative"
                title="مشاركة رابط الصالون"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                {copiedLink && (
                  <span className="absolute -bottom-7 right-0 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                    تم نسخ الرابط!
                  </span>
                )}
              </button>

              <a
                href={`https://wa.me/966${salon.phone ? salon.phone.replace(/^0+/, '') : '500000000'}?text=${encodeURIComponent(`مرحباً صالون ${salon.salonName}، تواصلت معكم عبر منصة تدلّلي للاستفسار عن الخدمات المتاحة.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب الصالون</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 border-b border-rose-100 dark:border-slate-800 bg-rose-50/40 dark:bg-slate-950/60 overflow-x-auto shrink-0 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>قائمة الخدمات ({salonServices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('flash')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'flash'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>عروض اللحظة الأخيرة ⚡</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'subscriptions'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>اشتراكات VIP 👑</span>
          </button>

          <button
            onClick={() => setActiveTab('bridal')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bridal'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
            }`}
          >
            <span>👰 باقات العرائس</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>الأخصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>الموقع وأوقات العمل</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>التقييمات</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {/* Category sub-filter chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubCat(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedSubCat === cat.id
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-rose-50/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredServices.map(srv => {
                    const deposit = Math.min(srv.price, Math.max(50, Math.round(srv.price * 0.2)));
                    return (
                      <div
                        key={srv._id}
                        className="bg-white dark:bg-slate-950 border border-rose-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-rose-300 dark:hover:border-slate-700 transition-all shadow-xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {srv.nameAr || srv.name}
                            </h4>
                            <span className="font-black text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                              {srv.price} {srv.currency}
                            </span>
                          </div>

                          {srv.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-rose-500" />
                              {srv.durationMins || 45} دقيقة
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              عربون التأكيد: {deposit} SAR فقط
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-rose-50 dark:border-slate-900 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            متاح للحجز اليوم وغداً
                          </span>
                          <button
                            onClick={() => {
                              onBookService(salon, srv);
                              onClose();
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1"
                          >
                            <span>احجزي الآن</span>
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-rose-50/30 dark:bg-slate-950 rounded-2xl border border-rose-100 dark:border-slate-800">
                  <Scissors className="w-8 h-8 text-rose-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-500">لا توجد خدمات مسجلة ضمن هذا التصنيف حالياً</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: FLASH DEALS ⚡ */}
          {activeTab === 'flash' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 animate-pulse">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    عروض المواعيد الشاغرة لليوم (Flash Deals)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    خصومات حصرية تبدأ من 25% على المواعيد المتاحة خلال الساعات القادمة لملء الكراسي الشاغرة.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {flashDeals.map((fd, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-slate-950 border border-amber-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                        خصم {fd.discountPercent}%
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        متبقي: {fd.timeLeft}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {fd.service.nameAr || fd.service.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{fd.chair}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-100 dark:border-slate-800">
                      <div>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          SAR {fd.discountedPrice}
                        </span>
                        <span className="text-xs line-through text-slate-400 mr-2">
                          SAR {fd.originalPrice}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onBookService(salon, { ...fd.service, price: fd.discountedPrice });
                          onClose();
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>اقتناص العرض</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: VIP SUBSCRIPTIONS 👑 */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
                <Crown className="w-8 h-8 text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    اشتراكات الجمال الشهرية VIP
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    وفري حتى 35% وضمني مواعيدك الثابتة أسبوعياً مع ميزات ضيافة خاصة وعربون حجز ملغى.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {vipPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    className="p-4 bg-white dark:bg-slate-950 border border-rose-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 shadow-xs hover:border-rose-300 transition-all"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                        {pkg.badge}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm mt-2">
                        {pkg.title}
                      </h5>
                      <div className="mt-2 text-xl font-black text-rose-600 dark:text-rose-400">
                        {pkg.price} SAR <span className="text-xs font-normal text-slate-400">/ {pkg.period}</span>
                      </div>

                      <ul className="mt-3 space-y-1.5 text-right text-[11px] text-slate-600 dark:text-slate-400">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href={`https://wa.me/966${salon.phone ? salon.phone.replace(/^0+/, '') : '500000000'}?text=${encodeURIComponent(`مرحباً صالون ${salon.salonName}، أرغب في الاشتراك في (${pkg.title}) بسعر ${pkg.price} SAR شهرياً.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold text-center transition-all block"
                    >
                      طلب الاشتراك الفوري 👑
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BRIDAL PACKAGES 👰 */}
          {activeTab === 'bridal' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-200 dark:border-pink-900/50 flex items-center gap-3">
                <span className="text-2xl">👰</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    باقات العرائس وجدول المناسبات المنسق
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    تنسيق شامل لجدول العروس ومرافقاتها بدون أي تأخير زمني في يومك الكبير.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {bridalPackages.map((bp, i) => (
                  <div
                    key={i}
                    className="p-5 bg-white dark:bg-slate-950 border border-pink-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-slate-900 dark:text-white text-base">{bp.title}</h5>
                      </div>
                      <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{bp.duration}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        {bp.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{it}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sm:text-left shrink-0 space-y-2">
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {bp.price} SAR
                      </div>
                      <a
                        href={`https://wa.me/966${salon.phone ? salon.phone.replace(/^0+/, '') : '500000000'}?text=${encodeURIComponent(`مرحباً صالون ${salon.salonName}، أرغب في حجز وتنسيق (${bp.title}) بمبلغ ${bp.price} SAR.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-block"
                      >
                        حجز وتنسيق الباقة 👰
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STAFF 👥 */}
          {activeTab === 'staff' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                طاقم أخصائيات صالون {salon.salonName} المعتمد والمرخص:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {staffList.map((st, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white dark:bg-slate-950 border border-rose-100 dark:border-slate-800 rounded-2xl space-y-2 shadow-xs text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg mx-auto">
                      {st.name.charAt(0)}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</div>
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{st.role}</div>
                    <div className="text-[10px] text-slate-400">{st.experience}</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-amber-500 font-bold pt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{st.rating}</span>
                      <span className="text-slate-400 font-normal">({st.reviewsCount})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INFO & HOURS ⏰ */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-950 border border-rose-100 dark:border-slate-800 rounded-2xl space-y-3">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    أوقات وساعات العمل
                  </h5>
                  <div className="space-y-2 text-xs divide-y divide-rose-50 dark:divide-slate-900">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600 dark:text-slate-400">السبت - الخميس:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">11:00 ص - 10:00 م</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600 dark:text-slate-400">الجمعة:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">01:00 م - 10:30 م</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-950 border border-rose-100 dark:border-slate-800 rounded-2xl space-y-3">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    العنوان والوصول
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {salon.city}، {salon.address || 'حي التحلية، بالقرب من المركز التجاري'}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${salon.salonName} ${salon.city}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline pt-1"
                  >
                    <span>فتح الموقع في خرائط Google 🗺️</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS ⭐ */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    {salon.averageRating || '4.8'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">بناءً على {salon.totalReviews || 24} تقييماً موثقاً من عميلات المنصة</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { name: 'ريم القحطاني', date: 'منذ يومين', rating: 5, comment: 'شغل رائع جداً واستقبال يفتح النفس! الأخصائية سارة دقيقة جداً في صبغة الشعر، تجربة ممتازة وسأكررها بالتأكيد.' },
                  { name: 'دلال الحربي', date: 'منذ أسبوع', rating: 5, comment: 'حجزت عبر تدللي بالعربون الذكي، الموعد كان مضبوطاً بالدقيقة وبدون أي انتظار. شكراً لكم.' },
                  { name: 'أفنان السليمان', date: 'منذ أسبوعين', rating: 4.8, comment: 'المكان نظيف وراقي، والخدمات ممتازة ومطابقة للوصف والأسعار واضحة بدون مبالغة.' }
                ].map((rev, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-rose-50 dark:border-slate-800 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{rev.name}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Sticky Footer with Direct Booking Trigger */}
        <div className="p-4 border-t border-rose-100 dark:border-slate-800 bg-rose-50/50 dark:bg-[#121218] flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
            <span className="font-bold text-slate-900 dark:text-white">{salon.salonName}</span> • الحجز مضمون مع ميزة حماية العربون الذكي
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                const primaryService = salonServices[0] || services[0];
                if (primaryService) {
                  onBookService(salon, primaryService);
                  onClose();
                }
              }}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>اختيار موعد وحجز</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
