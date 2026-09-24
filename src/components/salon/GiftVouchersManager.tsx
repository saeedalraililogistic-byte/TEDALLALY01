import React, { useState } from 'react';
import { Salon, GiftVoucher } from '../../types.ts';
import { 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Copy, 
  Check, 
  Search, 
  Calendar, 
  Share2, 
  DollarSign, 
  X,
  CreditCard,
  Heart
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const GiftVouchersManager: React.FC<Props> = ({ salon }) => {
  const [vouchers, setVouchers] = useState<GiftVoucher[]>([
    {
      id: 'gv_1',
      code: 'TED-GIFT-8821',
      salonId: salon._id,
      salonName: salon.salonName,
      senderName: 'سارة خالد المنصور',
      recipientName: 'منى العبدالله',
      recipientPhone: '+966504432190',
      amount: 450,
      serviceName: 'باقة تدليل ملكية (سبا + حمام مغربي + سشوار)',
      message: 'ألف مبروك التخرج يا أغلى منى، تستاهلين كل الدلال والراحة 💕',
      theme: 'rose_gold',
      isRedeemed: false,
      expiryDate: '2026-12-31',
      createdAt: '2026-09-14'
    },
    {
      id: 'gv_2',
      code: 'TED-GIFT-5540',
      salonId: salon._id,
      salonName: salon.salonName,
      senderName: 'فيصل السعدون',
      recipientName: 'أم فيصل (الغالية)',
      recipientPhone: '+966551199882',
      amount: 600,
      serviceName: 'رصيد مفتوح لخدمات العناية والبشرة',
      message: 'كل عام وأنتِ تاج راسنا يا ست الحبايب، يوم ميلاد سعيد 🌸',
      theme: 'royal_lavender',
      isRedeemed: true,
      expiryDate: '2026-11-20',
      createdAt: '2026-09-08'
    },
    {
      id: 'gv_3',
      code: 'TED-GIFT-9912',
      salonId: salon._id,
      salonName: salon.salonName,
      senderName: 'لطيفة الدوسري',
      recipientName: 'العروس شهد الراجحي',
      recipientPhone: '+966538876543',
      amount: 850,
      serviceName: 'جلسة تجهيز عروس VIP متكاملة',
      message: 'ألف مبروك الزواج يا أحلى عروسة في الكون، تتألقين في يومك الكبير 👑',
      theme: 'bridal_white',
      isRedeemed: false,
      expiryDate: '2027-01-15',
      createdAt: '2026-09-15'
    }
  ]);

  const [verifyCode, setVerifyCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isCreatingVoucher, setIsCreatingVoucher] = useState(false);
  const [previewVoucher, setPreviewVoucher] = useState<GiftVoucher | null>(vouchers[0]);

  // Form State
  const [formSender, setFormSender] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAmount, setFormAmount] = useState('300');
  const [formService, setFormService] = useState('جلسة مساج وسبا دلال');
  const [formMessage, setFormMessage] = useState('أتمنى لكِ يوماً مليئاً بالجمال والسعادة ✨');
  const [formTheme, setFormTheme] = useState<'rose_gold' | 'royal_lavender' | 'spring_blossom' | 'bridal_white'>('rose_gold');

  const totalGiftRevenue = vouchers.reduce((sum, v) => sum + v.amount, 0);
  const activeUnredeemed = vouchers.filter(v => !v.isRedeemed);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleVerifyRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode) return;

    const found = vouchers.find(v => v.code.toUpperCase() === verifyCode.trim().toUpperCase());
    if (!found) {
      alert('كود الإهداء غير صحيح أو غير موجود.');
      return;
    }

    if (found.isRedeemed) {
      alert('هذا الكوبون تم صرفه مسبقاً في الصالون.');
      return;
    }

    setVouchers(prev => prev.map(v => v.id === found.id ? { ...v, isRedeemed: true } : v));
    setSuccessToast(`تم صرف كرت الإهداء بقيمة SAR ${found.amount} لصالح العميلة "${found.recipientName}" بنجاح! ✓`);
    setVerifyCode('');
    setTimeout(() => setSuccessToast(null), 4500);
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSender || !formRecipient || !formPhone) return;

    const newCode = 'TED-GIFT-' + Math.floor(1000 + Math.random() * 9000);
    const newV: GiftVoucher = {
      id: 'gv_' + Date.now(),
      code: newCode,
      salonId: salon._id,
      salonName: salon.salonName,
      senderName: formSender,
      recipientName: formRecipient,
      recipientPhone: formPhone,
      amount: parseFloat(formAmount) || 200,
      serviceName: formService,
      message: formMessage,
      theme: formTheme,
      isRedeemed: false,
      expiryDate: '2027-03-30',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setVouchers(prev => [newV, ...prev]);
    setPreviewVoucher(newV);
    setIsCreatingVoucher(false);
    setSuccessToast(`تم إصدار كرت الإهداء الفاخر (${newCode}) مدفوعاً بالكامل بقيمة SAR ${newV.amount}! 🎁`);
    setTimeout(() => setSuccessToast(null), 4500);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-1.5">
            <Gift className="w-3.5 h-3.5 text-rose-500" />
            <span>كروت الهدايا والمناسبات • سيولة مسبقة 100%</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            كروت الإهداء الرقمية الفاخرة (Digital Pampering Gift Vouchers)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تمكّن الناس من إهداء جلسات دلال وخدمات الصالون للأمهات والعرائس والصديقات. يدفع المهدِي كامل المبلغ مقدماً، وتستقبل المهدى إليها كرت إهداء رقمي راقٍ للحجز به!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingVoucher(!isCreatingVoucher)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>إصدار كرت إهداء فاخر</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900/50 border border-rose-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي مبيعات كروت الإهداء</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            SAR {totalGiftRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            سيولة مسبقة مقبوضة بالكامل في حساب الصالون
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-900/50 border border-amber-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">كروت إهداء نشطة بانتظار الزيارة</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {activeUnredeemed.length} كروت
          </div>
          <div className="text-[11px] text-slate-400 mt-1">عميلات جدد قادمات لتجربة صالونك قريباً</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-slate-900/50 border border-emerald-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">التحقق السريع من الكود في الاستقبال</div>
          <form onSubmit={handleVerifyRedeem} className="mt-2 flex items-center gap-1.5">
            <input
              type="text"
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value)}
              placeholder="TED-GIFT-XXXX"
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono uppercase focus:outline-rose-500 w-full"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              صرف
            </button>
          </form>
        </div>
      </div>

      {/* Interactive Voucher Card Preview */}
      {previewVoucher && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-rose-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معاينة الكرت الرقمي المرسل للعميلة:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(previewVoucher.code)}
                className="px-3 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === previewVoucher.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{previewVoucher.code}</span>
              </button>
              <a
                href={`https://wa.me/${previewVoucher.recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`أهلاً يا ${previewVoucher.recipientName} 🌸، وصلتكِ بطاقة إهداء دلال فاخرة من "${previewVoucher.senderName}" لتدليل نفسكِ في صالون ${salon.salonName} بقيمة SAR ${previewVoucher.amount}!\n\nرسالة الإهداء: "${previewVoucher.message}"\n\nكود الإهداء: ${previewVoucher.code}\nرابط الحجز المباشر: https://tedallaly.com/gift-redeem/${previewVoucher.code}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال بالواتساب للعميلة</span>
              </a>
            </div>
          </div>

          {/* Card Presentation */}
          <div className="max-w-md mx-auto rounded-2xl p-6 text-white shadow-xl relative overflow-hidden bg-gradient-to-r from-rose-700 via-pink-600 to-rose-800">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-300" />
                <span className="font-black text-sm tracking-wide">بطاقة إهداء دلال فاخرة</span>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                {salon.salonName}
              </span>
            </div>

            <div className="my-4 space-y-2 text-center">
              <div className="text-xs text-rose-100">إلى الغالية:</div>
              <div className="text-lg font-black">{previewVoucher.recipientName}</div>
              <p className="text-xs italic bg-black/15 p-2 rounded-xl text-rose-50 leading-relaxed">
                "{previewVoucher.message}"
              </p>
              <div className="text-xs text-rose-100 pt-1">إهداء من المحبة: <span className="font-bold">{previewVoucher.senderName}</span></div>
            </div>

            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-rose-200 block">قيمة الإهداء:</span>
                <span className="text-base font-black text-amber-300">SAR {previewVoucher.amount}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-rose-200 block">كود الصرف:</span>
                <span className="font-mono font-bold bg-white text-rose-800 px-2 py-0.5 rounded-md text-xs">
                  {previewVoucher.code}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Voucher Form */}
      {isCreatingVoucher && (
        <form onSubmit={handleCreateVoucher} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">إصدار كرت إهداء مدفوع جديد</h4>
            <button type="button" onClick={() => setIsCreatingVoucher(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المهدِي</label>
              <input
                type="text"
                value={formSender}
                onChange={e => setFormSender(e.target.value)}
                placeholder="مثال: ريم السليمان"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المهدى إليها</label>
              <input
                type="text"
                value={formRecipient}
                onChange={e => setFormRecipient(e.target.value)}
                placeholder="مثال: سارة الحمد"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">رقم جوال المهدى إليها</label>
              <input
                type="tel"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+9665xxxxxxxx"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500 text-left"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">قيمة الإهداء (SAR)</label>
              <input
                type="number"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">الخدمة المقترحة (اختياري)</label>
              <input
                type="text"
                value={formService}
                onChange={e => setFormService(e.target.value)}
                placeholder="مثال: باقة تدليل متكاملة"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">رسالة الإهداء الشخصية</label>
            <input
              type="text"
              value={formMessage}
              onChange={e => setFormMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingVoucher(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              إصدار الكرت وحفظه
            </button>
          </div>
        </form>
      )}

      {/* Vouchers Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">سجل كروت الإهداء الصادرة في الصالون</h4>
        <div className="space-y-2">
          {vouchers.map(v => (
            <div
              key={v.id}
              onClick={() => setPreviewVoucher(v)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                previewVoucher?.id === v.id
                  ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-rose-200 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">إلى: {v.recipientName}</span>
                    <span className="text-[10px] text-slate-400">من: {v.senderName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    كود: {v.code} • تاريخ الإصدار: {v.createdAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-sm text-slate-900 dark:text-white">SAR {v.amount}</span>
                {v.isRedeemed ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    تم الصرف ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    جاهز للصرف
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
