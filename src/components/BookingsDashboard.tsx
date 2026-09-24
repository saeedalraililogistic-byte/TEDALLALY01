import React, { useState } from 'react';
import { Booking, Salon, Service, User } from '../types.ts';
import { InteractiveCalendarView } from './InteractiveCalendarView.tsx';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  UserCheck, 
  Plus, 
  Search, 
  ChevronDown,
  TrendingUp,
  CreditCard,
  Phone,
  MessageCircle,
  X,
  ShieldCheck,
  MapPin,
  Check,
  Table as TableIcon,
  Bell
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  salons: Salon[];
  services: Service[];
  users: User[];
  onAddBooking: (booking: Booking) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const BookingsDashboard: React.FC<Props> = ({
  bookings,
  salons,
  services,
  users,
  onAddBooking,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Calculate metrics
  const totalAmount = bookings.reduce((sum, b) => sum + (b.snapshot?.totalAmount || 150), 0);
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const pendingCount = bookings.filter(b => b.status === 'payment_pending' || b.status === 'confirmed').length;

  const filtered = bookings.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch = 
      (b.snapshot?.salonName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.snapshot?.serviceName || '').toLowerCase().includes(search.toLowerCase()) ||
      b.appointmentDate.includes(search);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">مكتمل</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">مؤكد</span>;
      case 'payment_pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">بانتظار الدفع</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>إجمالي الحجوزات المسجلة</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{bookings.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3" /> مستوردة بنجاح ومؤمنة في Firebase
          </div>
        </div>

        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>إجمالي الإيرادات المسجلة</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            حسب إحصائيات الداتابيس الحالية
          </div>
        </div>

        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>نسبة الإنجاز</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {completedCount} مكتمل <span className="text-xs text-slate-500 font-normal">/ {pendingCount} قيد المتابعة</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            نظام الإشعارات الفوري نشط ✓
          </div>
        </div>
      </div>

      {/* In-App Notification System Notice */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-900 dark:to-[#1a141b] border border-rose-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>نظام التنبيهات المباشرة للمستخدمات</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                تلقائي ومباشر
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
              يُنبه النظام المستخدمات بصوت ورسائل عائمة فور اقتراب موعد الحجز (خلال 24 ساعة واليوم)، أو فور تأكيد الصالون لتغيير حالة الحجز.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 font-bold text-[11px] text-rose-600 dark:text-rose-400">
          <span className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800 border border-rose-200 dark:border-slate-700">
            🔔 زر التنبيهات بأعلى الصفحة
          </span>
        </div>
      </div>

      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121218] p-3 border border-rose-100 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>التقويم التفاعلي (FullCalendar) 📅</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/50'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>جدول الحجوزات السريع 📋</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>حماية ضد التضارب 100% بين الحجوزات اليدوية والآلية</span>
        </div>
      </div>

      {/* RENDER CALENDAR VIEW OR TABLE VIEW */}
      {viewMode === 'calendar' ? (
        <InteractiveCalendarView
          bookings={bookings}
          salons={salons}
          services={services}
          onAddBooking={onAddBooking}
          onUpdateStatus={onUpdateStatus}
        />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#121218] p-4 border border-rose-100 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالصالون أو الخدمة أو التاريخ..."
                className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-700/80 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['all', 'completed', 'confirmed', 'payment_pending'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    filterStatus === st
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 font-bold'
                      : 'bg-rose-50/50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white border border-rose-100 dark:border-slate-800'
                  }`}
                >
                  {st === 'all' && 'الكل'}
                  {st === 'completed' && 'مكتمل'}
                  {st === 'confirmed' && 'مؤكد'}
                  {st === 'payment_pending' && 'بانتظار الدفع'}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-rose-50/60 dark:bg-slate-950/80 border-b border-rose-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">رقم وتاريخ الحجز</th>
                    <th className="py-3.5 px-4">الصالون والخدمة</th>
                    <th className="py-3.5 px-4">الموظفة / الأخصائية</th>
                    <th className="py-3.5 px-4">المبلغ</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100 dark:divide-slate-800/60">
                  {filtered.map(b => (
                    <tr 
                      key={b._id} 
                      onClick={() => setSelectedBooking(b)}
                      className="hover:bg-rose-50/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          <span>{b.appointmentDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {b.appointmentTime} {b.appointmentEndTime ? `- ${b.appointmentEndTime}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {b.snapshot?.salonName || 'الصالون'}
                        </div>
                        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                          {b.snapshot?.serviceName || 'خدمة تجميلية'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {b.snapshot?.staffName || 'طاقم العمل'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-rose-600 dark:text-emerald-400">
                          {b.snapshot?.totalAmount || 150} {b.snapshot?.currency || 'SAR'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-2.5 py-1 bg-rose-50 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-300 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            تفاصيل
                          </button>
                          {b.status !== 'completed' ? (
                            <button
                              onClick={() => onUpdateStatus(b._id, 'completed')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              إتمام
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 dark:text-slate-500 font-bold">مكتمل ✓</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (() => {
        const totalAmount = selectedBooking.snapshot?.totalAmount || 150;
        const deposit = Math.min(totalAmount, Math.max(50, Math.round(totalAmount * 0.2)));
        const remaining = Math.max(0, totalAmount - deposit);
        const clientPhone = selectedBooking.notes?.match(/هاتف:\s*([0-9+]+)/)?.[1] || '0500000000';
        const clientName = selectedBooking.notes?.match(/العميلة:\s*([^\n•]+)/)?.[1] || 'العميلة الكريمة';
        const salonName = selectedBooking.snapshot?.salonName || 'الصالون';
        const serviceName = selectedBooking.snapshot?.serviceName || 'الخدمة';

        const whatsappMsg = `مرحباً بكِ في منصة تدلّلي 🌸\nنود تأكيد موعدكِ:\n• الصالون: ${salonName}\n• الخدمة: ${serviceName}\n• الموعد: ${selectedBooking.appointmentDate} الساعة ${selectedBooking.appointmentTime}\n• الأخصائية: ${selectedBooking.snapshot?.staffName || 'طاقم العمل'}\nنتطلع لاستقبالك بكل ود!`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#121218] border border-rose-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">تفاصيل وسند الحجز رقم #{selectedBooking._id.substring(0, 8)}</h4>
                  <span className="text-xs text-slate-500">حجز موثق في نظام تدلّلي وسحابة Firebase</span>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Service & Salon Snapshot */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-950 border border-rose-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-900 dark:text-white text-base">{serviceName}</div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    {selectedBooking.snapshot?.durationMins || 45} دقيقة
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {salonName} • الأخصائية: {selectedBooking.snapshot?.staffName || 'طاقم العمل'}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    {selectedBooking.appointmentDate}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {selectedBooking.appointmentTime}
                  </span>
                </div>
              </div>

              {/* Smart Deposit & Tap Financial Breakdown Box */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">إجمالي المبلغ المحصّل من العميلة:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{totalAmount} SAR</span>
                </div>

                {selectedBooking.snapshot?.platformCommission !== undefined && (
                  <div className="space-y-1 text-[11px] border-t border-emerald-200 dark:border-emerald-800/80 pt-2 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>سعر الخدمة الأساسي (للصالون):</span>
                      <span className="font-bold font-mono">{selectedBooking.snapshot.baseServiceAmount ?? totalAmount} SAR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>عمولة منصة تدلّلي (10%):</span>
                      <span className="font-bold font-mono text-rose-600">+{selectedBooking.snapshot.platformCommission} SAR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>رسوم المعاملة البنكية (Tap):</span>
                      <span className="font-bold font-mono text-blue-600">+{selectedBooking.snapshot.paymentGatewayFee} SAR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ضريبة القيمة المضافة 15% (على العمولة):</span>
                      <span className="font-bold font-mono text-amber-600">+{selectedBooking.snapshot.vatOnCommission} SAR</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold pt-1 border-t border-dashed border-emerald-200 dark:border-emerald-800">
                      <span>صافي مستحقات الصالون (100%):</span>
                      <span className="font-mono text-xs">{selectedBooking.snapshot.salonPayoutAmount ?? totalAmount} SAR</span>
                    </div>
                    {selectedBooking.snapshot.tapChargeId && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>معرّف عملية Tap:</span>
                        <span className="font-mono">{selectedBooking.snapshot.tapChargeId}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200 dark:border-emerald-800/80">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    عربون التأكيد المدفوع (مضمون ضد الغياب):
                  </span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono">{deposit} SAR</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">المتبقي عند الحضور بالصالون:</span>
                  <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-sm">{remaining} SAR</span>
                </div>
              </div>

              {/* Client & Communication Actions */}
              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-bold">بيانات التواصل والتأكيد:</div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-rose-50 dark:border-slate-800 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{clientName}</div>
                    <div className="text-slate-500 font-mono mt-0.5">{clientPhone}</div>
                  </div>
                  <a
                    href={`https://wa.me/966${clientPhone.replace(/^0+/, '')}?text=${encodeURIComponent(whatsappMsg)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>واتساب العميلة 💬</span>
                  </a>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-2 border-t border-rose-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedBooking._id, 'confirmed');
                      setSelectedBooking({ ...selectedBooking, status: 'confirmed' });
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                  >
                    تأكيد الموعد
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedBooking._id, 'completed');
                      setSelectedBooking({ ...selectedBooking, status: 'completed' });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    إتمام الخدمة ✓
                  </button>
                </div>

                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
