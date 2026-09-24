import React, { useState } from 'react';
import { Salon } from '../../types.ts';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  AlertCircle,
  ExternalLink,
  Users
} from 'lucide-react';

interface Props {
  salon: Salon;
}

interface RecallClient {
  id: string;
  name: string;
  phone: string;
  lastService: string;
  lastVisitWeeksAgo: number;
  recommendedRecall: string;
  hasConsent: boolean;
  status: 'due' | 'sent' | 'scheduled';
  defaultMessage: string;
}

export const WhatsAppRecallManager: React.FC<Props> = ({ salon }) => {
  const [clients, setClients] = useState<RecallClient[]>([
    {
      id: 'rc_1',
      name: 'ريم عبدالعزيز',
      phone: '966501234567',
      lastService: 'صبغة شعر كاملة + معالج كولاجين',
      lastVisitWeeksAgo: 4,
      recommendedRecall: 'تجديد صبغة الجذور والعناية الدورية',
      hasConsent: true,
      status: 'due',
      defaultMessage: `أهلاً ريم ✨، مر 4 أسابيع على موعد صبغتك في صالون ${salon.salonName}، هل ترغبين بحجز موعد هذا الأسبوع لتجديد الجذور والحفاظ على نضارة شعرك مع أخصائيتك المفضلة؟ احجزي مباشرة من الرابط: https://tedallaly.com/@${salon.salonName.toLowerCase().replace(/\s+/g, '-')}`,
    },
    {
      id: 'rc_2',
      name: 'سارة خالد',
      phone: '966559876543',
      lastService: 'جلسة تنظيف بشرة عميق (هيدرافيشل)',
      lastVisitWeeksAgo: 5,
      recommendedRecall: 'جلسة تنظيف وتغذية البشرة الشهرية',
      hasConsent: true,
      status: 'due',
      defaultMessage: `مرحباً سارة 🌸 نتمنى أنك بأفضل حال! مر شهر على جلستك السابقة، حان وقت تجديد نضارة بشرتك في صالون ${salon.salonName}. يسعدنا استقبالك ويمكنك اختيار موعدك المفضل هنا: https://tedallaly.com/@${salon.salonName.toLowerCase().replace(/\s+/g, '-')}`,
    },
    {
      id: 'rc_3',
      name: 'نوف القحطاني',
      phone: '966541122334',
      lastService: 'تركيب رموش حبة حبة + بدكير سبا',
      lastVisitWeeksAgo: 3,
      recommendedRecall: 'ريتش وتعبئة رموش دورية',
      hasConsent: true,
      status: 'due',
      defaultMessage: `عزيزتي نوف ✨، نود تذكيرك بأن الرموش تحتاج إلى ريتش خفيف بعد 3 أسابيع للحفاظ على كثافتها وجاذبيتها في ${salon.salonName}. لحجز الموعد بنقرة واحدة: https://tedallaly.com/@${salon.salonName.toLowerCase().replace(/\s+/g, '-')}`,
    },
    {
      id: 'rc_4',
      name: 'منى الشمري',
      phone: '966509988776',
      lastService: 'بروتين معالج للشعر',
      lastVisitWeeksAgo: 2,
      recommendedRecall: 'متابعة نضارة الشعر بعد البروتين',
      hasConsent: false, // Explicitly false to show consent compliance
      status: 'scheduled',
      defaultMessage: `مرحباً منى من صالون ${salon.salonName}...`,
    },
  ]);

  const handleSendWhatsApp = (client: RecallClient) => {
    if (!client.hasConsent) return;
    const encoded = encodeURIComponent(client.defaultMessage);
    window.open(`https://wa.me/${client.phone}?text=${encoded}`, '_blank');
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: 'sent' } : c));
  };

  const dueCount = clients.filter(c => c.status === 'due' && c.hasConsent).length;

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>إعادة الشراء والولاء</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            إعادة استهداف وتذكير العميلات آلياً عبر الواتساب (Smart WhatsApp Auto-Recall)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ارفعي مبيعات صالونك بنسبة +40% بتذكير العميلات بتجديد صبغة الجذور، الرموش، والأظافر في الوقت المناسب تماماً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>متوافق 100% مع موافقة العميل والخصوصية</span>
          </span>
        </div>
      </div>

      {/* Privacy Policy & Consent Guarantee Notice */}
      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-emerald-900 dark:text-emerald-300">
            سياسة حماية الخصوصية وموافقة العميلة المسبقة (Opt-in Compliance)
          </div>
          <p className="text-emerald-700 dark:text-emerald-400 text-[11px] leading-relaxed">
            يتحقق النظام تلقائياً من موافقة العميلة على استلام إشعارات الواتساب المسجلة أثناء الحجز قبل إتاحة إرسال أي رسالة، التزاماً بالأنظمة واللوائح المعتمدة في المملكة لمنع الإزعاج.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">عميلات حان موعد عودتهن</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{dueCount} عميلات</div>
          <div className="text-[10px] text-slate-400 mt-0.5">جاهزات لإرسال التذكير بنقرة واحدة</div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">متوسط استجابة العميلات</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">42% إعادة حجز</div>
          <div className="text-[10px] text-slate-400 mt-0.5">تحويل فوري بدون تكاليف إعلانية</div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">موافقة العملاء على الواتساب</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">89% موافقة</div>
          <div className="text-[10px] text-slate-400 mt-0.5">موثقة عند خطوة الدفع والعربون</div>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>قائمة العميلات المستحقات للتذكير الدوري:</span>
          <span className="text-[11px] text-slate-500 font-normal">تمت تصفية العميلات بناءً على تاريخ آخر خدمة</span>
        </div>

        <div className="divide-y divide-rose-100 dark:divide-slate-800 border border-rose-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {clients.map(client => (
            <div
              key={client.id}
              className="p-4 bg-white dark:bg-slate-950 hover:bg-rose-50/30 dark:hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{client.name}</span>
                  {client.hasConsent ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> موافقة موثقة
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> بدون موافقة
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>آخر خدمة: {client.lastService}</span>
                  <span>•</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    منذ {client.lastVisitWeeksAgo} أسابيع ({client.recommendedRecall})
                  </span>
                </div>

                <div className="text-[11px] bg-slate-50 dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-300 font-sans border border-slate-100 dark:border-slate-800 mt-2 line-clamp-2">
                  💬 "{client.defaultMessage}"
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {client.status === 'sent' ? (
                  <span className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم إرسال التذكير</span>
                  </span>
                ) : client.hasConsent ? (
                  <button
                    onClick={() => handleSendWhatsApp(client)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال عبر الواتساب</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 p-2">
                    غير مفعل لعدم توفر الموافقة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
