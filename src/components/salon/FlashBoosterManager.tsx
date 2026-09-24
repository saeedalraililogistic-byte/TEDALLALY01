import React, { useState } from 'react';
import { Salon, Service, FlashOffer } from '../../types.ts';
import { 
  Zap, 
  Clock, 
  Tag, 
  Users, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Props {
  salon: Salon;
  services: Service[];
  onBookService?: (salon: Salon, service: Service) => void;
  flashOffers?: FlashOffer[];
  onAddFlashOffer?: (offer: FlashOffer) => void;
  onDeleteFlashOffer?: (id: string) => void;
}

export const FlashBoosterManager: React.FC<Props> = ({ 
  salon, 
  services,
  onBookService,
  flashOffers: propFlashOffers,
  onAddFlashOffer,
  onDeleteFlashOffer
}) => {
  const [internalFlashOffers, setInternalFlashOffers] = useState<FlashOffer[]>([
    {
      id: 'fo_1',
      salonId: salon._id,
      salonName: salon.salonName,
      serviceTitle: 'بدكير وسبا أظافر VIP متكامل',
      originalPrice: 180,
      discountPrice: 125,
      discountPercentage: 30,
      validTimeWindow: 'اليوم: 2:00 م - 4:30 م',
      remainingSeats: 2,
      expiresInMinutes: 45,
    },
    {
      id: 'fo_2',
      salonId: salon._id,
      salonName: salon.salonName,
      serviceTitle: 'سشوار كولاجين + ماسك ترطيب عميق',
      originalPrice: 220,
      discountPrice: 165,
      discountPercentage: 25,
      validTimeWindow: 'اليوم: 5:00 م - 7:00 م',
      remainingSeats: 1,
      expiresInMinutes: 90,
    },
  ]);

  const flashOffers = propFlashOffers || internalFlashOffers;

  const [isCreating, setIsCreating] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?._id || '');
  const [discountPercent, setDiscountPercent] = useState('25');
  const [seatsCount, setSeatsCount] = useState('2');
  const [timeWindow, setTimeWindow] = useState('اليوم: من الآن وحتى 6:00 م');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s._id === selectedServiceId) || services[0];
    const origPrice = service ? service.price : 200;
    const discount = parseInt(discountPercent) || 20;
    const discPrice = Math.round(origPrice * (1 - discount / 100));

    const newOffer: FlashOffer = {
      id: 'fo_' + Date.now(),
      salonId: salon._id,
      salonName: salon.salonName,
      serviceTitle: service ? (service.nameAr || service.name) : 'خدمة تجميلية خاصة',
      originalPrice: origPrice,
      discountPrice: discPrice,
      discountPercentage: discount,
      validTimeWindow: timeWindow,
      remainingSeats: parseInt(seatsCount) || 1,
      expiresInMinutes: 120,
    };

    if (onAddFlashOffer) {
      onAddFlashOffer(newOffer);
    } else {
      setInternalFlashOffers(prev => [newOffer, ...prev]);
    }

    setIsCreating(false);
    setSuccessMessage('تم إطلاق عرض اللحظة الأخيرة فوراً وظهر للعميلات بشارة حمراء مميزة في منصة تدلّلي!');
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  const handleDeleteOffer = (id: string) => {
    if (onDeleteFlashOffer) {
      onDeleteFlashOffer(id);
    } else {
      setInternalFlashOffers(prev => prev.filter(f => f.id !== id));
    }
  };

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>مقتنص الساعات الشاغرة</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            عروض اللحظة الأخيرة وملء المقاعد الشاغرة (Last-Minute Flash Booster)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            هل ألغت عميلة موعدها فجأة؟ أو لديكِ أوقات هادئة وسط النهار؟ أطلقي عرضاً سريعاً لملء الكرسي خلال دقائق.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ إطلاق عرض لحظي جديد</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateOffer} className="p-4 bg-rose-50/50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>بيانات عرض اللحظة الأخيرة السريع</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">الخدمة الشاغرة:</label>
              <select
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                {services.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.nameAr || s.name} ({s.price} SAR)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">نسبة الخصم اللحظي:</label>
              <select
                value={discountPercent}
                onChange={e => setDiscountPercent(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-bold"
              >
                <option value="15">خصم 15%</option>
                <option value="20">خصم 20%</option>
                <option value="25">خصم 25% (موصى به)</option>
                <option value="30">خصم 30%</option>
                <option value="40">خصم 40% (تصفية فورية)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">عدد المقاعد الشاغرة:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={seatsCount}
                onChange={e => setSeatsCount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">فترة صلاحية العرض:</label>
              <input
                type="text"
                value={timeWindow}
                onChange={e => setTimeWindow(e.target.value)}
                placeholder="مثال: اليوم: 2:00 م - 4:30 م"
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>نشر العرض فوراً للعميلات</span>
            </button>
          </div>
        </form>
      )}

      {/* Active Flash Offers Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>العروض النشطة حالياً في صالونك ({flashOffers.length}):</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            ⚡ تظهر بشارة حمراء مميزة في الصفحة الرئيسية
          </span>
        </div>

        {flashOffers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            لا توجد عروض لحظية نشطة الآن. اضغطي على زر "إطلاق عرض لحظي" لملء أي كرسي شاغر.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flashOffers.map(offer => (
              <div
                key={offer.id}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-white dark:to-slate-950 border border-amber-300/60 dark:border-amber-500/30 relative overflow-hidden shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black animate-pulse">
                      <Zap className="w-3 h-3" />
                      <span>خصم {offer.discountPercentage}% حصري الآن</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                      {offer.serviceTitle}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md"
                    title="إنهاء العرض"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                    {offer.discountPrice} SAR
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {offer.originalPrice} SAR
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    توفير {offer.originalPrice - offer.discountPrice} SAR
                  </span>
                </div>

                <div className="pt-2 border-t border-rose-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{offer.validTimeWindow}</span>
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>متبقي {offer.remainingSeats} مقعد</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
