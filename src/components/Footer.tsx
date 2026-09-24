import React from 'react';
import { 
  CheckCircle2, 
  Mail, 
  Phone, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Scale, 
  FileText, 
  Building2, 
  Sparkles, 
  ChevronLeft,
  Calendar,
  HeartHandshake
} from 'lucide-react';
import { TedallalyLogo } from './TedallalyLogo.tsx';

interface FooterProps {
  onNavigateTab: (tab: 'market' | 'salon_dash' | 'admin_dash' | 'categories' | 'courses' | 'bookings' | 'database' | 'legal') => void;
  onOpenLegalDoc: (docId: string | null) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateTab, 
  onOpenLegalDoc,
  onOpenLogin,
  onOpenRegister 
}) => {
  const currentYear = new Date().getFullYear();

  const handleOpenDoc = (docId: string | null) => {
    onOpenLegalDoc(docId);
    onNavigateTab('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-rose-100/80 dark:border-slate-800/80 bg-white dark:bg-[#0b0b10] pt-14 pb-8 text-xs text-slate-600 dark:text-slate-400 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/50 flex items-center justify-center p-1 shadow-xs">
                <TedallalyLogo size={28} />
              </div>
              <div>
                <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">تدلّلي</span>
                <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-bold font-sans">Tedallaly Platform</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              المنصة السعودية الذكية لحجز خدمات ومواعيد مراكز التجميل وصالونات العناية الفاخرة بأسعار شفافة ودفع إلكتروني آمن.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <a 
                href="mailto:info@tedallaly.com"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#13131a] hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-100/60 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[11px] font-medium">info@tedallaly.com</span>
              </a>

              <a 
                href="tel:+966530091580"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#13131a] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[11px] font-medium dir-ltr text-right" dir="ltr">+966 530 091 580</span>
              </a>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>خدمة العملاء متوفرة يومياً من ٩ ص حتى ١١ م</span>
            </div>
          </div>

          {/* Column 2: Salons & Service Providers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-rose-100 dark:border-slate-800 pb-2.5">
              <Building2 className="w-4 h-4 text-rose-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">للصالونات والمستقلات</h4>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => { onNavigateTab('salon_dash'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium">تسجيل صالون تجاري جديد</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { onNavigateTab('salon_dash'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-300 font-bold transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>تسجيل خبيرة تجميل مستقلة (وثيقة عمل حر)</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { onNavigateTab('salon_dash'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>لوحة تحكم وإدارة المواعيد</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('salon_agreement')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>اتفاقية الصالون الشريك</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">رسمي</span>
                  </span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('payment_policy')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>التسويات والتحويلات المالية</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Clients & Services */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-rose-100 dark:border-slate-800 pb-2.5">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">للعميلات</h4>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => { onNavigateTab('market'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>استكشاف الصالونات المعتمدة</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { onNavigateTab('categories'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>تصفح التصنيفات والخدمات</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { onNavigateTab('bookings'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium text-rose-600 dark:text-rose-400">حجوزاتي ومواعيدي النشطة</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              {onOpenLogin && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-300 font-bold transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>تسجيل الدخول إلى حسابكِ</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                </li>
              )}
              {onOpenRegister && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>إنشاء حساب جديد (تسجيل عميلة)</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => { onNavigateTab('courses'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>الدورات والأكاديمية التجميلية</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('disputes')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>المساعدة وتقديم شكوى (خلال 48 س)</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Transparency Hub */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-rose-500" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">المركز القانوني والشفافية</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                13 وثيقة
              </span>
            </div>

            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('terms')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>الشروط والأحكام العامة</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('privacy')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>سياسة الخصوصية وحماية البيانات (PDPL)</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('cancellation')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>سياسة الإلغاء المرن (24 ساعة)</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('refund')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>سياسة الاسترداد والرسوم التشغيلية</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc('disputes')}
                  className="w-full text-right py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span>إجراءات الشكاوى والنزاعات الرسمية</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </li>
            </ul>

            {/* Dedicated link to browse all documents */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleOpenDoc(null)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/5 hover:from-rose-500/20 hover:to-rose-500/15 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 font-bold transition-all flex items-center justify-between group cursor-pointer text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>تصفح كافة الوثائق (13 وثيقة)</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] text-rose-500">
                  <span>tedallaly.com/ar/legal</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-[-2px] transition-transform" />
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Official Saudi Business Center Verification Certificate Card */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/40 dark:from-[#0d1612] dark:via-[#111118] dark:to-[#0d1612] border border-emerald-200/80 dark:border-emerald-800/40 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Seal & Certification Name */}
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0 text-xl border-2 border-emerald-400">
                🇸🇦
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    موثق رسمياً من المركز السعودي للأعمال
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>ساري المفعول</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  شهادة توثيق التجارة الإلكترونية الصادرة لـ منصة تدلّلي وفق الأنظمة واللوائح المعتمدة في المملكة العربية السعودية
                </p>
              </div>
            </div>

            {/* Official Numbers & Validation Badges */}
            <div className="w-full lg:w-auto flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-mono">
              <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#151520] border border-emerald-200/60 dark:border-emerald-900/40 shadow-2xs flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px]">السجل التجاري:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold select-all">7032822137</strong>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#151520] border border-emerald-200/60 dark:border-emerald-900/40 shadow-2xs flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px]">رقم التوثيق:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold select-all">0000320986</strong>
              </div>

              <div className="px-3 py-2 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-300/60 dark:border-emerald-600/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-sans text-[11px] font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>الانتهاء: 26/07/2027</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright & Regulatory Trust Badges */}
        <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              جميع الحقوق محفوظة © {currentYear} منصة تدلّلي (Tedallaly Platform)
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>بترخيص ووساطة تقنية موثقة</span>
          </div>

          {/* Trust and Compliance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>تشفير SSL 256-bit</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>قنوات دفع ساما (SAMA)</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>نظام PDPL لحماية البيانات</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};
