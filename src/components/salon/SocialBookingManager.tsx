import React, { useState } from 'react';
import { Salon } from '../../types.ts';
import { 
  Instagram, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Smartphone,
  QrCode,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const SocialBookingManager: React.FC<Props> = ({ salon }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const salonSlug = salon.salonName.toLowerCase().replace(/\s+/g, '-');
  const bioLink = `https://tedallaly.com/@${salonSlug}`;
  const directBookingUrl = `https://tedallaly.com/book/${salon._id || '1'}`;
  const instagramActionUrl = `https://tedallaly.com/ig-action/${salon._id || '1'}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold mb-1.5">
            <Instagram className="w-3.5 h-3.5" />
            <span>حجز السوشيال ميديا الفوري</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            زر الحجز الفوري داخل إنستغرام وتيك توك (Direct Social Booking)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            حولي متابعات الإنستغرام والتيك توك إلى حجوزات مدفوعة خلال 30 ثانية بدون محادثات واتساب طويلة أو تفويت عميلات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>متوافق مع Meta & TikTok</span>
          </span>
        </div>
      </div>

      {/* Why it works metric bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">سرعة الحجز</div>
          <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">30 ثانية</div>
          <div className="text-[10px] text-slate-400 mt-0.5">من رؤية البوست إلى تأكيد الموعد</div>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">زيادة المبيعات</div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+48% حجوزات</div>
          <div className="text-[10px] text-slate-400 mt-0.5">بسبب اختصار وقت الرد على الخاص</div>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">دعم وسائل الدفع</div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">Apple Pay & مدى</div>
          <div className="text-[10px] text-slate-400 mt-0.5">دفع العربون الفوري لحماية الكرسي</div>
        </div>
      </div>

      {/* The 3 Links Generator */}
      <div className="space-y-4">
        {/* Link 1: Instagram Bio Link */}
        <div className="p-4 rounded-xl border border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-sm shadow-xs">
                📸
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">رابط البايو الموحد (Bio Link) لإنستغرام وتيك توك</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">ضعيه في خانة "Website" بملفك التعريفي لفتح صفحة الحجز الفاخرة</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(bioLink, 'bio')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedType === 'bio' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'bio' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 select-all break-all border border-slate-200/60 dark:border-slate-800">
            {bioLink}
          </div>
        </div>

        {/* Link 2: Instagram Action Button */}
        <div className="p-4 rounded-xl border border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-sm shadow-xs font-black">
                🔘
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">زر الحجز الرسمي في إنستغرام (Book Now Button)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">أضيفيه في إعدادات الحساب التجاري &gt; أزرار الإجراء (Action Buttons) &gt; حجز الآن</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(instagramActionUrl, 'ig_action')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedType === 'ig_action' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'ig_action' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 select-all break-all border border-slate-200/60 dark:border-slate-800">
            {instagramActionUrl}
          </div>
        </div>

        {/* Link 3: TikTok Quick Booking Link */}
        <div className="p-4 rounded-xl border border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm shadow-xs font-black">
                🎵
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">رابط الحجز السريع لتيك توك وسناب شات</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">رابط خفيف وسريع الفتح داخل متصفح التطبيق مباشرة</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(directBookingUrl, 'tiktok')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedType === 'tiktok' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'tiktok' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 select-all break-all border border-slate-200/60 dark:border-slate-800">
            {directBookingUrl}
          </div>
        </div>
      </div>

      {/* Visual Live Preview mockup */}
      <div className="p-4 bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-rose-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 flex items-center justify-center shadow-xs text-xl">
            📲
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">معاينة تجربة العميلة في إنستغرام</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              تضغط العميلة على زر "احجز الآن" &larr; تفتح قائمة خدمات {salon.salonName} &larr; اختيار الوقت ودفع العربون خلال ثوانٍ.
            </div>
          </div>
        </div>

        <a
          href={bioLink}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>اختبار الرابط المباشر</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
