import React, { useState } from 'react';
import { Booking, Salon, Service, User } from '../types.ts';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  CalendarDays, 
  Receipt, 
  RefreshCw,
  Star,
  Check,
  XCircle,
  ExternalLink,
  MessageSquare,
  FileText,
  Crown
} from 'lucide-react';
import { TaxInvoiceModal } from './TaxInvoiceModal.tsx';

interface Props {
  customer: User;
  bookings: Booking[];
  salons: Salon[];
  services: Service[];
  onBookNewService: () => void;
  onCancelBooking: (bookingId: string) => void;
  onOpenLoyaltyClub?: () => void;
  onOpenBridalPackages?: () => void;
}

export const CustomerBookingsView: React.FC<Props> = ({
  customer,
  bookings,
  salons,
  services,
  onBookNewService,
  onCancelBooking,
  onOpenLoyaltyClub,
  onOpenBridalPackages
}) => {
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState<string | null>(null);

  // Filter bookings belonging to this customer
  // If matched by customerId OR customer phone/email or if demo fallback
  const customerBookings = bookings.filter(b => {
    if (b.customerId === customer._id) return true;
    if (b.clientPhone && customer.phone && b.clientPhone === customer.phone) return true;
    if (customer.role === 'customer' && (b.customerId === 'usr_client' || b.customerId === 'j57bhqcbd12792hscvs1hmse7d8ch9mm')) return true;
    return false;
  });

  const upcomingBookings = customerBookings.filter(b => b.status === 'confirmed' || b.status === 'payment_pending');
  const pastBookings = customerBookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const displayedBookings = activeFilter === 'upcoming' 
    ? upcomingBookings 
    : activeFilter === 'completed' 
      ? pastBookings 
      : customerBookings;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            مؤكد وجاهز
          </span>
        );
      case 'payment_pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            بانتظار التأكيد / الدفع
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Check className="w-3.5 h-3.5" />
            مكتمل ومُنفّذ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            ملغي
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingForReview) {
      setReviewSubmitted(selectedBookingForReview._id);
      setTimeout(() => {
        setSelectedBookingForReview(null);
        setReviewSubmitted(null);
        setReviewComment('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Profile Banner for Customer */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-rose-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5" />
              حساب العميلة الملكي
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">أهلاً بكِ، {customer.name} ✨</h1>
            <p className="text-rose-100 text-sm max-w-xl">
              هنا تجدين جميع حجوزاتك، مواعيدك القادمة، وسجل زياراتك السابقة مع صالوناتك وخبيراتك المفضلة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenLoyaltyClub && (
              <button
                onClick={onOpenLoyaltyClub}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
              >
                <Crown className="w-4 h-4 text-amber-900" />
                <span>نادي نقاط الولاء VIP (320 ن)</span>
              </button>
            )}

            {onOpenBridalPackages && (
              <button
                onClick={onOpenBridalPackages}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>باقات العرائس 💍</span>
              </button>
            )}

            <button
              onClick={onBookNewService}
              className="px-4 py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs shadow-lg shadow-black/10 transition-all flex items-center gap-1.5 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>حجز خدمة جديدة</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-xs text-rose-100 block">المواعيد القادمة</span>
            <span className="text-2xl font-black mt-0.5 block">{upcomingBookings.length} موعد</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-xs text-rose-100 block">الزيارات المكتملة</span>
            <span className="text-2xl font-black mt-0.5 block">{pastBookings.length} زيارة</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-xs text-rose-100 block">إجمالي المدفوعات</span>
            <span className="text-2xl font-black mt-0.5 block font-mono">
              {customerBookings
                .reduce((sum, b) => sum + (Number(b.snapshot?.totalAmount) || 150), 0)
                .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-normal">SAR</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeFilter === 'upcoming'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>المواعيد القادمة ({upcomingBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeFilter === 'completed'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>السجل والمكتملة ({pastBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeFilter === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>كل الحجوزات ({customerBookings.length})</span>
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {displayedBookings.length === 0 ? (
        <div className="bg-white dark:bg-[#15151e] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <CalendarDays className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {activeFilter === 'upcoming' 
                ? 'لا توجد مواعيد قادمة مجدولة حالياً' 
                : 'لا توجد حجوزات سابقة في هذه القائمة'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              دلّلي نفسك اليوم بحجز موعد استثنائي في أرقى صالونات التجميل أو مع أفضل الميكب آرتست والخدمات المنزلية.
            </p>
          </div>
          <button
            onClick={onBookNewService}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            تصفح الصالونات والخدمات المتاحة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedBookings.map((b) => {
            const salon = salons.find(s => s._id === b.salonId);
            const salonName = b.snapshot?.salonName || salon?.salonName || 'صالون تدلّلي المعتمد';
            const serviceName = b.snapshot?.serviceName || 'جلسة تجميل وعناية فاخرة';
            const price = b.snapshot?.totalAmount || 150;
            const staff = b.snapshot?.staffName || 'خبيرة الصالون';

            return (
              <div 
                key={b._id}
                className="bg-white dark:bg-[#15151e] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                        {salonName}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {serviceName}
                      </h3>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{b.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{b.appointmentTime} {b.appointmentEndTime ? `- ${b.appointmentEndTime}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Receipt className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-bold font-mono">
                        {(Number(price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>الخبيرة: {staff}</span>
                    </div>
                  </div>

                  {salon?.address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{salon.city} - {salon.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Invoice Button */}
                    <button
                      onClick={() => setSelectedBookingForInvoice(b)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="عرض وطباعة الفاتورة الضريبية"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>الفاتورة</span>
                    </button>

                    {/* WhatsApp confirmation/support */}
                    <a
                      href={`https://wa.me/${(salon?.phone || '966500000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `مرحباً ${salonName}، بخصوص حجزي برقم (${b._id.substring(0, 6)}) لخدمة ${serviceName} في موعد ${b.appointmentDate} الساعة ${b.appointmentTime}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-bold flex items-center gap-1 transition-all"
                      title="مراسلة الصالون عبر واتساب"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>

                    {b.status === 'completed' ? (
                      <button
                        onClick={() => setSelectedBookingForReview(b)}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>تقييم</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onCancelBooking(b._id)}
                        className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-medium cursor-pointer"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>

                  <button
                    onClick={onBookNewService}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer mr-auto"
                  >
                    <span>حجز موعد مجدداً</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedBookingForInvoice && (
        <TaxInvoiceModal
          booking={selectedBookingForInvoice}
          salon={salons.find(s => s._id === selectedBookingForInvoice.salonId)}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#15151e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>تقييم الخدمة</span>
              </h3>
              <button 
                onClick={() => setSelectedBookingForReview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {reviewSubmitted === selectedBookingForReview._id ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">شكراً لكِ على تقييمك! ❤️</h4>
                <p className="text-xs text-slate-500">تم تسجيل تقييمك ومشاركته مع الصالون لدعم الجودة وتجربة العميلات.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    كيف كانت تجربتك مع {selectedBookingForReview.snapshot?.salonName || 'الصالون'}؟
                  </label>
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star 
                          className={`w-7 h-7 ${s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ملاحظاتك وتقييمك الشخصي (اختياري)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="شاركينا رأيك في جودة الخدمة، دقة الموعد، والتعامل..."
                    className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForReview(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    إرسال التقييم
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
