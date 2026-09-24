import React, { useState } from 'react';
import { Salon, BeautySubscription } from '../../types.ts';
import { 
  Crown, 
  Check, 
  Repeat, 
  Plus, 
  Users, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const SubscriptionsManager: React.FC<Props> = ({ salon }) => {
  const [subscriptions, setSubscriptions] = useState<BeautySubscription[]>([
    {
      id: 'sub_1',
      salonId: salon._id,
      title: 'باقة الأظافر والسبا الشهرية (VIP Nails)',
      monthlyPrice: 280,
      billingPeriod: 'شهري',
      sessionsIncluded: 4,
      features: [
        '4 جلسات بدكير ومانكير كلاسيك شهرياً',
        'جلسة سبا مساج لليدين والقدمين مجاناً',
        'أولوية حجز في عطلة نهاية الأسبوع',
        'خصم 15% على منتجات العناية المنزلية',
      ],
      subscriberCount: 28,
      badge: 'الأكثر مبيعاً 🌟',
    },
    {
      id: 'sub_2',
      salonId: salon._id,
      title: 'اشتراك السيشوار والعناية الأسبوعية (Blowout Club)',
      monthlyPrice: 240,
      billingPeriod: 'شهري',
      sessionsIncluded: 4,
      features: [
        '4 جلسات غسيل وسشوار احترافي شهرياً',
        'ماسك كولاجين وترطيب عميق مع كل جلسة',
        'تصفيف ويفي أو ليس حسب اختيار العميلة',
      ],
      subscriberCount: 42,
      badge: 'طلب مرتفع 🔥',
    },
    {
      id: 'sub_3',
      salonId: salon._id,
      title: 'باقة نضارة البشرة الشهرية (Glow Membership)',
      monthlyPrice: 390,
      billingPeriod: 'شهري',
      sessionsIncluded: 2,
      features: [
        'جلستان تنظيف عميق وهيدرافيشل شهرياً',
        'ماسك الذهب الخالص لتفتيح البشرة',
        'فحص مسامية ونوع البشرة مجاناً مع كل زيارة',
      ],
      subscriberCount: 15,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('250');
  const [newSessions, setNewSessions] = useState('4');

  // Calculate Monthly Recurring Revenue
  const totalSubscribers = subscriptions.reduce((sum, s) => sum + s.subscriberCount, 0);
  const monthlyMRR = subscriptions.reduce((sum, s) => sum + s.monthlyPrice * s.subscriberCount, 0);

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSub: BeautySubscription = {
      id: 'sub_' + Date.now(),
      salonId: salon._id,
      title: newTitle,
      monthlyPrice: parseInt(newPrice) || 200,
      billingPeriod: 'شهري',
      sessionsIncluded: parseInt(newSessions) || 4,
      features: [
        `${newSessions} جلسات دورية شهرياً`,
        'أولوية حجز المواعيد بدون انتظار',
        'تجديد تلقائي أول كل شهر',
      ],
      subscriberCount: 1,
    };

    setSubscriptions([...subscriptions, newSub]);
    setIsAdding(false);
    setNewTitle('');
  };

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1.5">
            <Crown className="w-3.5 h-3.5" />
            <span>الدخل المتكرر التلقائي</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            اشتراكات الجمال الشهرية المتكررة (VIP Beauty Subscriptions)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            اضمني دخلاً نقدياً ثابتاً لصالونك في أول كل شهر مع اشتراكات البدكير، السيشوار، وتنظيف البشرة المجددة تلقائياً.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ إنشاء باقة اشتراك جديدة</span>
        </button>
      </div>

      {/* MRR Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-rose-500/5 to-white dark:to-slate-900 border border-purple-200/60 dark:border-purple-800/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>الدخل الشهري المضمون (MRR)</span>
            <Repeat className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {monthlyMRR.toLocaleString()} SAR
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> يتجدد تلقائياً في حسابك أول الشهر
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>إجمالي المشتركات النشطات</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubscribers} عميلة VIP
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            ولاء مضمون وزيارات متكررة كل أسبوع
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>طريقة الدفع والتجديد</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-2">
            خصم تلقائي آمن
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            عبر بطاقات مدى وApple Pay المحفوظة
          </div>
        </div>
      </div>

      {/* Adding Form */}
      {isAdding && (
        <form onSubmit={handleAddSubscription} className="p-4 bg-purple-50/40 dark:bg-slate-950 border border-purple-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-purple-600" />
            <span>بيانات باقة الاشتراك الجديدة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">اسم الباقة:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="مثال: باقة الشعر الملكي الأسبوعية"
                className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">السعر الشهري (SAR):</label>
              <input
                type="number"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">عدد الجلسات شهرياً:</label>
              <input
                type="number"
                value={newSessions}
                onChange={e => setNewSessions(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              حفظ ونشر الباقة
            </button>
          </div>
        </form>
      )}

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subscriptions.map(sub => (
          <div
            key={sub.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-purple-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between space-y-4 shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {sub.billingPeriod}
                </span>
                {sub.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                    {sub.badge}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {sub.title}
                </h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {sub.monthlyPrice}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">ر.س / شهر</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                {sub.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>{sub.subscriberCount} مشتركة نشطة</span>
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {(sub.monthlyPrice * sub.subscriberCount).toLocaleString()} SAR/ش
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
