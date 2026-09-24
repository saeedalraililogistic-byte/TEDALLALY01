import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Heart, 
  Calendar, 
  Clock, 
  Check, 
  ArrowLeft, 
  Scissors, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Gift, 
  Star 
} from 'lucide-react';
import { Salon, Service, Booking } from '../types.ts';

interface BridalPackage {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'royal';
  tagline: string;
  price: number;
  originalPrice: number;
  durationDays: string;
  badge: string;
  image: string;
  timeline: {
    phase: string;
    timing: string;
    services: string[];
  }[];
  includes: string[];
}

interface Props {
  salons: Salon[];
  onBookPackage: (pkg: BridalPackage, salon: Salon) => void;
  onBack: () => void;
}

export const BridalPackagesView: React.FC<Props> = ({ salons, onBookPackage, onBack }) => {
  const [selectedTier, setSelectedTier] = useState<'all' | 'royal' | 'gold' | 'silver'>('all');
  const [selectedPackage, setSelectedPackage] = useState<BridalPackage | null>(null);

  const packages: BridalPackage[] = [
    {
      id: 'pkg_royal_queen',
      name: 'باقة العروس الملكية الشاملة (Royal VIP)',
      tier: 'royal',
      tagline: 'تجربة ملكية استثنائية تبدأ قبل الزفاف بشهر وحتى اللحظات الأخيرة لدخول القاعة',
      price: 3850,
      originalPrice: 5200,
      durationDays: 'برنامج تحضيري متكامل على مدار 30 يوماً',
      badge: 'الأكثر فخامة وطلباً ✨',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      timeline: [
        {
          phase: 'المرحلة 1: قبل الزفاف بشهر',
          timing: 'الأسبوع الأول',
          services: ['استشارة كاملة للبشرة والشعر', 'جلسة تنظيف وتقشير عميق هيدرافيشل', 'جلسة ماسك مغذي للشعر']
        },
        {
          phase: 'المرحلة 2: قبل الزفاف بأسبوع',
          timing: 'الأسبوع الأخير',
          services: ['حمام مغربي ملكي بالأعشاب الطبيعية والدلكة', 'جلسة مساج استرخائي لكامل الجسم (60 دقيقة)', 'بدكير ومنكير سبا فرنسي بالأحجار الساخنة']
        },
        {
          phase: 'المرحلة 3: يوم الزفاف الكبير',
          timing: 'يوم المناسبة (في الصالون أو الفندق)',
          services: ['مكياج عروس VIP سينمائي فاخر مع رموش منك', 'تسريحة شعر ملكية وتثبيت الطرحة والتاج', 'باقة معطرة خاصة بالعروس لليدين والجسم']
        }
      ],
      includes: [
        'أخصائية مكياج وشعر مرافقة حتى وقت الزفة',
        'مجموعة هدايا ومنتجات عناية منزلية فاخرة للعروس',
        'خصم 20% لمرافقتي العروس (الأم والشقيقة)'
      ]
    },
    {
      id: 'pkg_gold_glam',
      name: 'باقة العروس الذهبية المتألقة (Golden Glam)',
      tier: 'gold',
      tagline: 'العناية المركزة والتألق الفاخر في الأسبوع الأخير ويوم المناسبة',
      price: 2450,
      originalPrice: 3200,
      durationDays: 'برنامج مكثف لمدة أسبوع',
      badge: 'الخيار المثالي 💛',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      timeline: [
        {
          phase: 'المرحلة 1: قبل الزفاف بـ 3 أيام',
          timing: 'جلسة الاسترخاء والتهيئة',
          services: ['حمام تركي ملكي بالورد واللافندر', 'بدكير ومنكير جل مع طلاء يدوم طويلاً', 'ماسك نضارة فوري للوجه']
        },
        {
          phase: 'المرحلة 2: يوم الزفاف',
          timing: 'يوم المناسبة',
          services: ['مكياج عروس فخم وفاخر', 'تسريحة شعر متقنة وتثبيت الطرحة', 'أظافر أكريليك أو جل احترافي']
        }
      ],
      includes: [
        'مثبت مكياج ضد التعرق يدوم 18 ساعة',
        'تجهيز وتعديل أخير قبل الخروج'
      ]
    },
    {
      id: 'pkg_silver_express',
      name: 'باقة يوم الفرح السريعة (Bridal Day Star)',
      tier: 'silver',
      tagline: 'مخصصة للعروس التي تبحث عن مكياج وتسريحة قمة في الإبداع ليوم الزفاف',
      price: 1650,
      originalPrice: 2100,
      durationDays: 'جلسة يوم المناسبة الكاملة',
      badge: 'يوم المناسبة 💍',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
      timeline: [
        {
          phase: 'يوم الزفاف',
          timing: '4 ساعات متواصلة من التدليل',
          services: ['مكياج عروس VIP', 'تسريحة شعر احترافية', 'تركيب أظافر ورموش بريميوم']
        }
      ],
      includes: [
        'كريم ترطيب وتغذية مكثف قبل المكياج',
        'شنطة طوارئ للعروس تحوي ميني مثبت وأحمر شفاه للمسات السريعة'
      ]
    }
  ];

  const filteredPackages = selectedTier === 'all' 
    ? packages 
    : packages.filter(p => p.tier === selectedTier);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 p-6 sm:p-10 text-white shadow-xl shadow-rose-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30">
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              <span>جناح باقات العرائس الملكي (Bridal Concierge)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black">أنتِ ملكة ليلتك.. ونحن نهتم بكل تفاصيلك</h1>
            <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
              جدول زمني متكامل، وخبراء تجميل معتمدون لمرافقتك من مرحلة العناية بالبشرة والحمام المغربي حتى دخولك القاعة بأجمل إطلالة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>العودة للصالونات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Perks */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-200 shrink-0" />
            <span>ضمان عدم التضارب والالتزام</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
            <span>أفضل ميكب آرتست معتمدات</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-200 shrink-0" />
            <span>خدمة في الصالون أو الفندق</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-200 shrink-0" />
            <span>هدايا ومستلزمات حصرية للعروس</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => setSelectedTier('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTier === 'all'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          كل باقات العرائس
        </button>
        <button
          onClick={() => setSelectedTier('royal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTier === 'royal'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          الباقة الملكية (Royal 30 Days)
        </button>
        <button
          onClick={() => setSelectedTier('gold')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTier === 'gold'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          الباقة الذهبية (Golden 7 Days)
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          return (
            <div 
              key={pkg.id}
              className="bg-white dark:bg-[#15151e] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-md">
                      {pkg.badge}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {pkg.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
                      {pkg.price.toLocaleString('en-US')} SAR
                    </span>
                    <span className="text-xs text-slate-400 line-through font-mono">
                      {pkg.originalPrice.toLocaleString('en-US')} SAR
                    </span>
                  </div>

                  {/* Timeline preview */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">جدول العناية الزمني:</span>
                    {pkg.timeline.map((step, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3 h-3 text-rose-500" />
                          <span>{step.phase}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mr-4">
                          {step.services.join(' • ')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block">مميزات إضافية حصرية:</span>
                    {pkg.includes.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    const fallbackSalon = salons[0];
                    if (fallbackSalon) {
                      onBookPackage(pkg, fallbackSalon);
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <Crown className="w-4 h-4 text-amber-200" />
                  <span>حجز الباقة وجدولة المواعيد</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
