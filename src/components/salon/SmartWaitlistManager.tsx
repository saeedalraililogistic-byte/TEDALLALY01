import React, { useState } from 'react';
import { Salon, WaitlistEntry } from '../../types.ts';
import { 
  Hourglass, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Send, 
  UserPlus, 
  AlertCircle, 
  RefreshCw,
  Phone,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const SmartWaitlistManager: React.FC<Props> = ({ salon }) => {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
    {
      id: 'wl_1',
      salonId: salon._id,
      clientName: 'نورة السبيعي',
      clientPhone: '+966501239844',
      serviceTitle: 'مكياج سهرة VIP + رموش',
      preferredDate: 'اليوم (الجمعة)',
      preferredTimeWindow: '5:30 م - 7:00 م',
      urgency: 'high',
      status: 'waiting',
      notes: 'لديها مناسبة زواج مهمة، مستعدة للدفع الفوري بمجرد توفر شاغر'
    },
    {
      id: 'wl_2',
      salonId: salon._id,
      clientName: 'هدى القحطاني',
      clientPhone: '+966554128790',
      serviceTitle: 'صبغة بالياج كراميل كاملة',
      preferredDate: 'اليوم (الجمعة)',
      preferredTimeWindow: '4:00 م - 6:00 م',
      urgency: 'high',
      status: 'alerted',
      alertExpiresAt: Date.now() + 5 * 60 * 1000 + 35 * 1000, // 5 min 35 sec left
      notes: 'تم إرسال رابط الدفع الفوري لمدة 7 دقائق'
    },
    {
      id: 'wl_3',
      salonId: salon._id,
      clientName: 'ريم العتيبي',
      clientPhone: '+966539981240',
      serviceTitle: 'جلسة تنظيف بشرة هيدرافيشل',
      preferredDate: 'غداً (السبت)',
      preferredTimeWindow: '2:00 م - 4:00 م',
      urgency: 'normal',
      status: 'claimed',
      notes: 'اقتنصت الموعد بعد اعتذار عميلة أخرى ودفعت كامل الحساب SAR 350 عبر Apple Pay'
    }
  ]);

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formService, setFormService] = useState('مكياج سهرة');
  const [formDate, setFormDate] = useState('اليوم');
  const [formTime, setFormTime] = useState('6:00 م');
  const [formUrgency, setFormUrgency] = useState<'high' | 'normal'>('high');

  const triggerAlertToClient = (entry: WaitlistEntry) => {
    setWaitlist(prev => prev.map(item => {
      if (item.id === entry.id) {
        return {
          ...item,
          status: 'alerted',
          alertExpiresAt: Date.now() + 7 * 60 * 1000 // 7 minutes
        };
      }
      return item;
    }));

    setSuccessToast(`تم إرسال إشعار المقعد الشاغر ورابط الدفع الفوري للعميلة "${entry.clientName}" بمهلة 7 دقائق! ⚡`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  const handleAddWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    const newEntry: WaitlistEntry = {
      id: 'wl_' + Date.now(),
      salonId: salon._id,
      clientName: formName,
      clientPhone: formPhone,
      serviceTitle: formService,
      preferredDate: formDate,
      preferredTimeWindow: formTime,
      urgency: formUrgency,
      status: 'waiting',
      notes: 'طلب حجز في الانتظار'
    };

    setWaitlist(prev => [newEntry, ...prev]);
    setIsAddingClient(false);
    setFormName('');
    setFormPhone('');
    setSuccessToast(`تمت إضافة العميلة "${formName}" إلى قائمة الانتظار الذكية.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold mb-1.5">
            <Hourglass className="w-3.5 h-3.5 text-amber-500" />
            <span>نظام الشواغر التلقائي • مهلة الـ 7 دقائق</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            قائمة الانتظار الذكية لتبادل المواعيد (Smart Waitlist & Instant Seat Swap)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            عندما تمتلئ مواعيد الصالون، تنضم العميلات لقائمة الانتظار. وبمجرد حدوث أي شاغر، يرسل النظام تنبيهاً ذكياً برابط دفع فوري لمدة 7 دقائق لملء المقعد فوراً دون فقدان أي إيراد!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingClient(!isAddingClient)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة عميلة للانتظار</span>
          </button>
        </div>
      </div>

      {/* Value Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-900/50 border border-amber-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">العميلات بانتظار شاغر اليوم</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {waitlist.filter(w => w.status === 'waiting' || w.status === 'alerted').length} عميلات
          </div>
          <div className="text-[11px] text-slate-400 mt-1">جاهزات للدفع الإلكتروني الفوري فور توفر المقعد</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-slate-900/50 border border-emerald-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">مواعيد تم إنقاذها ودفعها 100%</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            18 موعداً هذا الشهر
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            + SAR 4,850 إيرادات صافية للصالون كانت ستضيع
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">معدل سرعة اقتناص الموعد</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            3 دقائق و 40 ثانية
          </div>
          <div className="text-[11px] text-slate-400 mt-1">من إرسال الإشعار حتى إتمام الدفع بالكامل</div>
        </div>
      </div>

      {/* Add Client Form (Collapsible) */}
      {isAddingClient && (
        <form onSubmit={handleAddWaitlist} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">تسجيل عميلة جديدة في قائمة الانتظار الذكية</h4>
            <button type="button" onClick={() => setIsAddingClient(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اسم العميلة</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="مثال: منيرة الفهد"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الواتساب</label>
              <input
                type="tel"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+9665xxxxxxxx"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500 text-left"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">الخدمة المطلوبة</label>
              <input
                type="text"
                value={formService}
                onChange={e => setFormService(e.target.value)}
                placeholder="مثال: تسريحة ومكياج"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingClient(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              حفظ في الانتظار
            </button>
          </div>
        </form>
      )}

      {/* Table of Waitlist Entries */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>العميلات المسجلات حالياً في انتظار شواغر</span>
          <span className="text-[11px] font-normal text-slate-400">يتم الفرز حسب الأولوية وتوقيت التقديم</span>
        </h4>

        <div className="space-y-2.5">
          {waitlist.map(entry => (
            <div
              key={entry.id}
              className={`p-4 rounded-xl border transition-all ${
                entry.status === 'alerted'
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                  : entry.status === 'claimed'
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-rose-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{entry.clientName}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{entry.clientPhone}</span>
                    {entry.urgency === 'high' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        🔥 عاجل جداً
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">✂️ {entry.serviceTitle}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {entry.preferredDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {entry.preferredTimeWindow}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5">{entry.notes}</p>
                  )}
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {entry.status === 'waiting' && (
                    <button
                      onClick={() => triggerAlertToClient(entry)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>تنبيه بكرسي شاغر (مهلة 7 د)</span>
                    </button>
                  )}

                  {entry.status === 'alerted' && (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>جاري الانتظار: متبقي 5 دقائق للدفع</span>
                      </div>
                      <a
                        href={`https://wa.me/${entry.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${entry.clientName} 🌸، توفر الآن كرسي شاغر لخدمتكِ في صالون ${salon.salonName}! لديكِ مهلة 7 دقائق لتأكيد الموعد والدفع الكامل عبر الرابط: https://tedallaly.com/book/${salon._id}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="مراسلة واتساب"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {entry.status === 'claimed' && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم اقتناص الموعد ودُفع 100%</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How the 7-minute swap algorithm works */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>كيف تعمل خوارزمية تبادل المقاعد الذكية (Seat Swap Engine)؟</span>
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          عندما تعتذر أي عميلة عن موعدها، يبحث النظام فوراً في قائمة الانتظار عن العميلات المسجلات لنفس الخدمة والوقت. يتم إرسال رابط دفع مشفر للعميلة الأولى بمهلة عد تنازلي 7 دقائق. إذا أتمت الدفع الإلكتروني بنجاح يتم تثبيت الحجز تلقائياً؛ وإذا انتهت المهلة، ينتقل المقعد تلقائياً للعميلة التالية في القائمة!
        </p>
      </div>
    </div>
  );
};
