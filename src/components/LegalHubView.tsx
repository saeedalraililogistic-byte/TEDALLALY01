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
  Search,
  Scale,
  Sparkles,
  Download,
  X
} from 'lucide-react';
import { TEDALLALY_LEGAL_DOCUMENTS, LegalDocument } from '../data/legalPoliciesData.ts';
import { LegalDocumentView } from './LegalDocumentView.tsx';

interface LegalHubViewProps {
  onBackToMarket?: () => void;
  selectedDocId?: string | null;
  onSelectDoc?: (docId: string | null) => void;
}

export const LegalHubView: React.FC<LegalHubViewProps> = ({
  onBackToMarket,
  selectedDocId: externalSelectedDocId,
  onSelectDoc: externalOnSelectDoc,
}) => {
  const [internalSelectedDocId, setInternalSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'bookings' | 'user' | 'disputes' | 'salon'>('all');

  const selectedDocId = externalSelectedDocId !== undefined ? externalSelectedDocId : internalSelectedDocId;
  const setSelectedDocId = (id: string | null) => {
    if (externalOnSelectDoc) {
      externalOnSelectDoc(id);
    } else {
      setInternalSelectedDocId(id);
    }
  };

  const selectedDoc = TEDALLALY_LEGAL_DOCUMENTS.find(doc => doc.id === selectedDocId);

  // Filtered documents
  const filteredDocs = TEDALLALY_LEGAL_DOCUMENTS.filter(doc => {
    const matchesSearch = 
      doc.titleAr.includes(searchQuery) ||
      doc.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shortSummary.includes(searchQuery);
    
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Render matching icon dynamically from lucide-react
  const renderIcon = (iconName: string, className = "w-6 h-6") => {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 text-right" dir="rtl">
      
      {/* Top Breadcrumb Bar (Shown in Hub Index Mode) */}
      {!selectedDoc && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#121218] border border-rose-100/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <button 
              type="button"
              onClick={onBackToMarket}
              className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>الرئيسية</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="font-bold text-slate-800 dark:text-white">
              المركز القانوني والشفافية
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>tedallaly.com/ar/legal</span>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED DOCUMENT VIEW (CARDS & GLASSMORPHISM) OR HUB GRID */}
      {selectedDoc ? (
        <LegalDocumentView
          document={selectedDoc}
          onBack={() => setSelectedDocId(null)}
          onSelectDoc={(id) => setSelectedDocId(id)}
        />
      ) : (
        /* GRID OF LEGAL CARDS */
        <div className="space-y-6">
          {/* Hero Banner & Search Filter */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f0f15] border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50 mb-2">
                <Scale className="w-3.5 h-3.5" />
                <span>المركز القانوني وسياسات الاستخدام والشفافية</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                وثائق وسياسات منصة تدلّلي المعتمدة
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                الإصدار 1.0 • تاريخ السريان: ١٩/٨/٢٠٢٦ • اضغطي على أي بطاقة لقراءة نصوص السياسات والإجراءات الرسمية المعتمدة بالتفصيل.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي في الوثائق والسياسات..."
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Categories Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#0f0f15] border border-rose-100/80 dark:border-slate-800 overflow-x-auto text-xs">
            {[
              { id: 'all', label: `جميع الوثائق (${TEDALLALY_LEGAL_DOCUMENTS.length})` },
              { id: 'disputes', label: 'الشكاوى والنزاعات' },
              { id: 'bookings', label: 'الحجوزات والإلغاء والاسترداد' },
              { id: 'user', label: 'الخصوصية وحقوق البيانات' },
              { id: 'salon', label: 'اتفاقية الصالونات الشريكة' },
              { id: 'core', label: 'الأساسية والنظامية' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* THE GRID OF LEGAL CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#111118] border border-slate-200/90 dark:border-slate-800/90 hover:border-rose-500/60 dark:hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-200 cursor-pointer min-h-[240px]"
              >
                <div>
                  {/* Card Icon & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/30 text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 border border-slate-200/60 dark:border-slate-800 group-hover:border-rose-300/40 dark:group-hover:border-rose-500/30 flex items-center justify-center transition-all shadow-xs">
                      {renderIcon(doc.iconName, "w-6 h-6")}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20">
                        {doc.badge || doc.version}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        سريان: {doc.effectiveDate}
                      </span>
                    </div>
                  </div>

                  {/* Document Title */}
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {doc.titleAr}
                  </h3>

                  {/* Short summary */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {doc.shortSummary}
                  </p>
                </div>

                {/* Card Action Button */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="w-full py-2.5 rounded-xl bg-slate-50 group-hover:bg-rose-600 dark:bg-slate-900/80 dark:group-hover:bg-rose-600 text-slate-700 group-hover:text-white dark:text-slate-300 dark:group-hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200/60 dark:border-slate-800 group-hover:border-transparent">
                    <span>اقرأ الوثيقة</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-[-2px] transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Notice Footer Banner */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0f15] border border-rose-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">حماية قانونية كاملة للصالون والعميلة</span>
                <span>كافة المعاملات المالية والحجوزات تخضع للأنظمة السعودية المعتمدة لعام 2026.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                سجل: 7032822137
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                توثيق: 0000320986
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
