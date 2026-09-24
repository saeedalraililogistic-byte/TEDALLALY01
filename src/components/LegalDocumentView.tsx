import React, { useState } from 'react';
import { 
  FileText, 
  Shield, 
  XCircle, 
  RotateCcw, 
  Calendar, 
  CreditCard, 
  AlertCircle, 
  Star, 
  Cookie, 
  Trash2, 
  Info, 
  Gavel, 
  Building2,
  Mail,
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Scale,
  Sparkles,
  Clock,
  ChevronLeft,
  Copy,
  Check,
  Share2,
  Printer,
  BookOpen,
  Award,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { LegalDocument, TEDALLALY_LEGAL_DOCUMENTS } from '../data/legalPoliciesData.ts';

interface LegalDocumentViewProps {
  document: LegalDocument;
  onBack: () => void;
  onSelectDoc?: (docId: string) => void;
}

export const LegalDocumentView: React.FC<LegalDocumentViewProps> = ({
  document,
  onBack,
  onSelectDoc
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Icon resolver based on document or section keywords
  const getDocumentIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'FileText': return <FileText className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'XCircle': return <XCircle className={className} />;
      case 'RotateCcw': return <RotateCcw className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'AlertCircle': return <AlertCircle className={className} />;
      case 'Star': return <Star className={className} />;
      case 'Cookie': return <Cookie className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      case 'Info': return <Info className={className} />;
      case 'Gavel': return <Gavel className={className} />;
      case 'Building2': return <Building2 className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const getSectionIcon = (heading: string, index: number) => {
    const text = heading.toLowerCase();
    if (text.includes('شكوى') || text.includes('نزاع') || text.includes('قنوات')) return <AlertCircle className="w-5 h-5 text-rose-500" />;
    if (text.includes('جدول') || text.includes('معالجة') || text.includes('مهلة') || text.includes('وقت') || text.includes('مواعيد')) return <Clock className="w-5 h-5 text-amber-500" />;
    if (text.includes('بيانات') || text.includes('خصوصية') || text.includes('pdpl') || text.includes('أطراف')) return <Shield className="w-5 h-5 text-emerald-500" />;
    if (text.includes('استرداد') || text.includes('رسوم') || text.includes('إعادة') || text.includes('مالية')) return <RotateCcw className="w-5 h-5 text-indigo-500" />;
    if (text.includes('دفع') || text.includes('بطاقات') || text.includes('ساما') || text.includes('قيمة')) return <CreditCard className="w-5 h-5 text-blue-500" />;
    if (text.includes('إلغاء') || text.includes('تخلف') || text.includes('no-show')) return <XCircle className="w-5 h-5 text-rose-500" />;
    if (text.includes('حذف') || text.includes('إتلاف')) return <Trash2 className="w-5 h-5 text-red-500" />;
    if (text.includes('قانون') || text.includes('قضاء') || text.includes('محاكم') || text.includes('نظام')) return <Gavel className="w-5 h-5 text-purple-500" />;
    if (text.includes('صالون') || text.includes('شريك') || text.includes('وسيط')) return <Building2 className="w-5 h-5 text-pink-500" />;
    if (text.includes('تقييم') || text.includes('مراجعة')) return <Star className="w-5 h-5 text-amber-400" />;
    if (text.includes('كوكيز') || text.includes('ارتباط')) return <Cookie className="w-5 h-5 text-amber-600" />;
    if (text.includes('إخلاء') || text.includes('مسؤولية')) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    if (text.includes('تواصل') || text.includes('بريد')) return <Mail className="w-5 h-5 text-teal-500" />;
    return <BookOpen className="w-5 h-5 text-rose-500" />;
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Other related policies in the same or nearby category
  const relatedDocs = TEDALLALY_LEGAL_DOCUMENTS.filter(d => d.id !== document.id).slice(0, 3);

  return (
    <div className="space-y-8 font-['Cairo',sans-serif] animate-in fade-in duration-300 text-right" dir="rtl">
      
      {/* Top Navigation & Breadcrumbs Bar with Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-[#111118]/70 border border-white/50 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-lg shadow-black/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>العودة لشبكة الوثائق</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">المركز القانوني</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-none">
            {document.titleAr}
          </span>
        </div>

        {/* Action Controls: Copy Link, Print */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="نسخ رابط السياسة"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'تم النسخ' : 'مشاركة الرابط'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="طباعة الوثيقة الرسمية"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">طباعة</span>
          </button>
        </div>
      </div>

      {/* Hero Glassmorphic Header Card */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/90 via-rose-50/30 to-pink-50/20 dark:from-[#14141e]/90 dark:via-[#101018]/80 dark:to-[#0c0c14]/90 border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-xl shadow-rose-500/5">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 -left-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30 border border-white/30">
              {getDocumentIcon(document.iconName, "w-8 h-8 sm:w-10 sm:h-10")}
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300/40 dark:border-rose-500/30 backdrop-blur-md">
                  {document.badge || 'وثيقة رسمية معتمدة'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/10 backdrop-blur-md">
                  {document.version}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تاريخ السريان: {document.effectiveDate}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {document.titleAr}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-mono font-bold">
                <span>{document.titleEn}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0 text-xs">
            <div className="px-4 py-2.5 rounded-2xl backdrop-blur-md bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 space-y-1 text-right">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>الامتثال النظامي السعودي</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                سجل: 7032822137 • توثيق: 0000320986
              </p>
            </div>
          </div>
        </div>

        {/* Short Executive Summary Box */}
        <div className="relative z-10 mt-6 p-4 sm:p-5 rounded-2xl backdrop-blur-xl bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-inner">
          <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">خلاصة الوثيقة المعتمدة:</span>
            <span>{document.shortSummary}</span>
          </div>
        </div>
      </div>

      {/* Official Contact Alert Card (If Official Email Exists) */}
      {document.officialEmail && (
        <div className="backdrop-blur-xl bg-gradient-to-r from-rose-50/80 via-white/80 to-rose-50/60 dark:from-rose-950/30 dark:via-[#13131c]/70 dark:to-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-3xl p-5 sm:p-6 shadow-md shadow-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                قناة المراسلة الرسمية المباشرة لهذه الوثيقة
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                لأي استفسار أو متابعة أو تقديم مستندات رسمية تتعلق بهذه السياسة
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-rose-600 dark:text-rose-400 select-all shadow-2xs">
              {document.officialEmail}
            </span>
            <a
              href={`mailto:${document.officialEmail}`}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/20 cursor-pointer"
            >
              <span>إرسال بريد</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* SPECIAL INTERACTIVE CALLOUTS FOR CORE POLICIES */}

      {/* 1. Disputes Policy Step-by-Step Flow */}
      {document.id === 'disputes' && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-[#11111a]/80 dark:to-[#0e0e16]/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-rose-500" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                مسار معالجة الشكاوى والنزاعات النظامية (Timeline)
              </h3>
            </div>
            <span className="text-xs text-rose-600 font-bold">وفق نظام التجارة الإلكترونية</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/60 dark:bg-white/5 border border-rose-200/50 dark:border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 font-bold flex items-center justify-center text-xs">
                01
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">رفع الشكوى</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يحق للعميلة أو الصالون رفع شكوى رسمية عبر الدعم خلال <strong className="text-rose-600 font-bold">[48 ساعة]</strong> من تقديم الخدمة.
              </p>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/60 dark:bg-white/5 border border-amber-200/50 dark:border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-xs">
                02
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">فتح الملف والتحقق</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تلتزم المنصة بفتح ملف والتواصل مع المشكو في حقه خلال <strong className="text-amber-600 font-bold">[3 أيام عمل]</strong> لطلب الإثباتات والتسوية الودية.
              </p>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/60 dark:bg-white/5 border border-emerald-200/50 dark:border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                03
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">التسوية أو التصعيد الرسمي</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تسوية عادلة تحفظ الحقوق، وفي حال التعذر يحق اللجوء للمحاكم المختصة بالمملكة مع تزويد الجهات بالبيانات الرسمية.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Refund & Operational Fees Detailed Glass Card */}
      {document.id === 'refund' && (
        <div className="backdrop-blur-2xl bg-gradient-to-br from-amber-50/80 via-white/80 to-rose-50/80 dark:from-[#17141f]/90 dark:via-[#13131c]/80 dark:to-[#17141f]/90 border border-amber-300/60 dark:border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
            <Scale className="w-5 h-5 text-amber-600" />
            <span>جدول ضوابط العمليات المالية والاسترداد المعتمد:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-black/30 border border-amber-200/70 dark:border-white/10 space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">رسوم الخدمة والتشغيل البنكي</span>
              <span className="text-xl font-black text-rose-600 block">12.75%</span>
              <span className="text-[11px] text-rose-500 font-semibold block">غير قابلة للاسترداد نهائياً عند إلغاء العميل</span>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-black/30 border border-emerald-200/70 dark:border-white/10 space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">الإلغاء المرن (أكثر من 24 ساعة)</span>
              <span className="text-xl font-black text-emerald-600 block">فوري للمحفظة</span>
              <span className="text-[11px] text-emerald-600 font-semibold block">استرداد قيمة خدمة الصالون تلقائياً</span>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-black/30 border border-blue-200/70 dark:border-white/10 space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">التحويل للبطاقة البنكية</span>
              <span className="text-xl font-black text-blue-600 block">7 - 14 يوم</span>
              <span className="text-[11px] text-slate-500 font-semibold block">أيام عمل وفق المعالجة المصرفية المحلية</span>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-black/30 border border-purple-200/70 dark:border-white/10 space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">إلغاء الصالون أو عطل تقني</span>
              <span className="text-xl font-black text-purple-600 block">100% كامل</span>
              <span className="text-[11px] text-purple-600 font-semibold block">شامل كامل القيمة والرسوم</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Booking Policy Highlights */}
      {document.id === 'booking_policy' && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-rose-50/70 via-white/80 to-pink-50/60 dark:from-[#15121b]/80 dark:to-[#0f0e15]/80 border border-rose-200/60 dark:border-rose-900/40 rounded-3xl p-6 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
            <Calendar className="w-4 h-4" />
            <span>قواعد الانضباط الزمني للحجوزات والمواعيد:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-rose-200/50 dark:border-white/10">
              <strong className="block text-slate-900 dark:text-white mb-1">الوصول المبكر (10 دقائق):</strong>
              <span className="text-slate-600 dark:text-slate-400">لضمان الترحيب والتهيئة وتقديم الخدمة في وقتها الكامل.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-rose-200/50 dark:border-white/10">
              <strong className="block text-rose-600 mb-1">مهلة التأخير (15 دقيقة):</strong>
              <span className="text-slate-600 dark:text-slate-400">بعدها يحق للصالون إلغاء الحجز لتفادي تعطيل المواعيد اللاحقة.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-rose-200/50 dark:border-white/10">
              <strong className="block text-emerald-600 mb-1">تعديل الموعد (24 ساعة):</strong>
              <span className="text-slate-600 dark:text-slate-400">متاح مجاناً قبل الموعد بـ 24 ساعة حسب توفر الخانات في النظام.</span>
            </div>
          </div>
        </div>
      )}

      {/* POLICY SECTIONS: RENDERED AS ELEGANT GLASSMORPHIC CARDS */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              بنود ومواد الوثيقة الرسمية ({document.sections.length} بنود)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            محدثة ومعتمدة إلكترونياً
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {document.sections.map((section, idx) => (
            <div 
              key={idx}
              className="group relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/75 dark:bg-[#111119]/75 border border-white/60 dark:border-white/10 hover:border-rose-300/70 dark:hover:border-rose-500/40 p-6 sm:p-7 shadow-md hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300"
            >
              {/* Subtle top accent bar */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500/40 via-pink-500/30 to-transparent" />

              {/* Section Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl backdrop-blur-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-500/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {getSectionIcon(section.heading, idx)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {section.heading}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">البند رقم {idx + 1}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold">
                  § {idx + 1}
                </span>
              </div>

              {/* Section Paragraphs */}
              <div className="space-y-3 pr-2 sm:pr-4 border-r-2 border-rose-200/70 dark:border-rose-900/50">
                {section.content.map((paragraph, pIdx) => (
                  <p 
                    key={pIdx}
                    className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Saudi Business Center Verification Banner */}
      <div className="rounded-3xl backdrop-blur-xl bg-gradient-to-r from-emerald-50/80 via-white/80 to-emerald-50/60 dark:from-[#0d1612]/80 dark:via-[#111118]/70 dark:to-[#0d1612]/80 border border-emerald-300/70 dark:border-emerald-800/40 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-2xl shadow-md shadow-emerald-600/20 border-2 border-emerald-400 shrink-0">
            🇸🇦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white text-sm">
                موثق رسمياً من المركز السعودي للأعمال
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700/50">
                ساري المفعول
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              منصة تدلّلي (Tedallaly) مسجلة رسمياً وتخضع للأنظمة التجارية والرقابية السعودية لعام 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200">
            سجل: <strong className="font-bold">7032822137</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200">
            توثيق: <strong className="font-bold">0000320986</strong>
          </div>
        </div>
      </div>

      {/* Related Policies Switcher / Recommendation */}
      {relatedDocs.length > 0 && onSelectDoc && (
        <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>سياسات ووثائق أخرى ذات صلة قد تهمك:</span>
            </h3>
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              عرض كافة الـ 13 وثيقة ↗
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedDocs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectDoc(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-4 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-[#12121c]/70 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 text-right transition-all group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    {getDocumentIcon(item.iconName, "w-4 h-4")}
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-1 transition-transform" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-rose-600 transition-colors">
                  {item.titleAr}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                  {item.shortSummary}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>العودة للمركز القانوني وشبكة الوثائق</span>
        </button>
      </div>

    </div>
  );
};
