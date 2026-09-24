import React, { useState } from 'react';
import { Salon, BridalGroupBooking } from '../../types.ts';
import { 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Scissors, 
  Plus, 
  AlertCircle,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const BridalMatrixManager: React.FC<Props> = ({ salon }) => {
  const [bridalBookings, setBridalBookings] = useState<BridalGroupBooking[]>([
    {
      id: 'br_1',
      brideName: 'العروس ليلى المنصور (مع 4 مرافقات)',
      eventDate: '2026-09-25 (الجمعة القادمة)',
      targetFinishTime: '06:00 م (وقت الخروج للقاعة)',
      guestsCount: 5,
      servicesSchedule: [
        {
          guestName: 'ليلى (العروس 👰)',
          role: 'العروس',
          assignedStaff: 'أمل الشمري',
          serviceName: 'مكياج عروس ملكي VIP + رموش منك',
          startTime: '03:00 م',
          endTime: '04:30 م',
          price: 1800,
        },
        {
          guestName: 'ليلى (العروس 👰)',
          role: 'العروس',
          assignedStaff: 'سارة محمد',
          serviceName: 'تسريحة زفاف ملكية وتثبيت الطرحة والتاج',
          startTime: '04:30 م',
          endTime: '05:45 م',
          price: 1500,
        },
        {
          guestName: 'أم العروس (أم خالد)',
          role: 'أم العروس',
          assignedStaff: 'ريم العتيبي',
          serviceName: 'مكياج كلاسيك راقي + تسريحة شعر فخمة',
          startTime: '03:00 م',
          endTime: '04:45 م',
          price: 950,
        },
        {
          guestName: 'شهد المنصور (أخت العروس)',
          role: 'مرافقة',
          assignedStaff: 'نورة الدوسري',
          serviceName: 'مكياج سهرة ناعم + ويفي هوليوودي',
          startTime: '03:15 م',
          endTime: '04:45 م',
          price: 800,
        },
        {
          guestName: 'دلال المنصور (مرافقة)',
          role: 'مرافقة',
          assignedStaff: 'سارة محمد',
          serviceName: 'مكياج سهرة + استشوار وبدكير',
          startTime: '02:00 م',
          endTime: '03:30 م',
          price: 750,
        },
      ],
      totalAmount: 5800,
      depositPaid: 2000,
      status: 'confirmed',
    },
  ]);

  const [activeBookingId, setActiveBookingId] = useState('br_1');
  const activeBooking = bridalBookings.find(b => b.id === activeBookingId) || bridalBookings[0];

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold mb-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>تنظيم مواعيد العرائس الذكي</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            منسق باقات العرائس والمجموعات (Bridal & Group Booking Matrix)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            وداعاً للتأخير وتداخل الكراسي! يوزع المنسق مواعيد العروس ومرافقاتها آلياً بين خبيرات التجميل مع تحديد موعد خروج دقيق للقاعة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>حماية من التضارب الزمني</span>
          </span>
        </div>
      </div>

      {/* Package High-Level Info */}
      <div className="p-5 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-rose-200/80 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{activeBooking.brideName}</h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              مؤكد ومحجوز
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>{activeBooking.eventDate}</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeBooking.targetFinishTime}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>{activeBooking.guestsCount} ضيفات</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-left border-t md:border-t-0 md:border-r border-rose-200/80 dark:border-slate-800 pt-3 md:pt-0 pr-0 md:pr-6">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">إجمالي الباقة:</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {activeBooking.totalAmount.toLocaleString()} SAR
            </div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">العربون المدفوع:</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {activeBooking.depositPaid.toLocaleString()} SAR
            </div>
          </div>
        </div>
      </div>

      {/* Parallel Matrix Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <span>الجدول الزمني المتوازي للخدمات وتوزيع الأخصائيات (Parallel Timeline):</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ لا يوجد أي تضارب بين الأخصائيات
          </span>
        </div>

        <div className="divide-y divide-rose-100 dark:divide-slate-800 border border-rose-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {activeBooking.servicesSchedule.map((slot, index) => (
            <div
              key={index}
              className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                slot.role === 'العروس'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20'
                  : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center font-bold text-xs text-rose-600 dark:text-rose-400 shrink-0">
                  {slot.role === 'العروس' ? '👰' : '✨'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{slot.guestName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {slot.role}
                    </span>
                  </div>
                  <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold mt-0.5">
                    {slot.serviceName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-between md:justify-end text-xs">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">الأخصائية المسؤولة:</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-rose-500" />
                    <span>{slot.assignedStaff}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">الوقت المحدد:</div>
                  <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/40">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">السعر:</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {slot.price} SAR
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Exit Time Guarantee */}
      <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>وقت الانتهاء المتوقع للجميع: <strong>05:45 م</strong> (مع 15 دقيقة طوارئ وتصوير قبل المغادرة للقاعة)</span>
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          جاهز للتنفيذ ✓
        </span>
      </div>
    </div>
  );
};
