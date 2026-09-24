import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Tag, 
  CreditCard, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  FileCheck,
  XCircle,
  AlertTriangle,
  Eye,
  ShieldCheck,
  Search,
  Check,
  X,
  Download,
  Receipt,
  BadgeDollarSign
} from 'lucide-react';
import { Salon, Booking, SalonDocument } from '../types.ts';
import { TedallalyLogo } from './TedallalyLogo.tsx';
import { TAP_CONFIG } from '../lib/tapPaymentsService.ts';
import { TAP_PLANS, calculateTapFee } from '../lib/tapRateMatrix.ts';

interface Props {
  salons: Salon[];
  bookings: Booking[];
  onApproveSalon?: (salonId: string) => void;
  onRejectSalon?: (salonId: string, reason?: string) => void;
  onUpdateSalonDocumentStatus?: (salonId: string, docId: string, status: 'approved' | 'rejected', reason?: string) => void;
}

export const AdminDashboardView: React.FC<Props> = ({ 
  salons, 
  bookings,
  onApproveSalon,
  onRejectSalon,
  onUpdateSalonDocumentStatus
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'verifications' | 'salons' | 'tap_gateway'>('verifications');
  const [selectedTapPlan, setSelectedTapPlan] = useState<'starter' | 'standard' | 'advanced'>('starter');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; salonId: string; docId?: string; salonName: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspectDocModal, setInspectDocModal] = useState<{
    isOpen: boolean;
    salonName: string;
    doc: SalonDocument;
  } | null>(null);

  const verifiedSalons = salons.filter(s => s.status === 'verified');
  const pendingSalons = salons.filter(s => s.status === 'pending_verification' || (s.documents && s.documents.some(d => d.status === 'pending')));
  const rejectedSalons = salons.filter(s => s.status === 'suspended' || (s.documents && s.documents.some(d => d.status === 'rejected')));
  const requiringDocsSalons = salons.filter(s => s.status === 'documents_required' || (!s.documents || s.documents.length === 0));

  const filteredPending = salons.filter(s => {
    // Status Filter condition
    if (statusFilter === 'pending') {
      const isPending = s.status === 'pending_verification' || (s.documents && s.documents.some(d => d.status === 'pending'));
      if (!isPending) return false;
    } else if (statusFilter === 'verified') {
      if (s.status !== 'verified') return false;
    } else if (statusFilter === 'rejected') {
      const isRejected = s.status === 'suspended' || (s.documents && s.documents.some(d => d.status === 'rejected'));
      if (!isRejected) return false;
    }

    const matchesSearch = s.salonName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleApprove = (salonId: string) => {
    if (onApproveSalon) {
      onApproveSalon(salonId);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectionModal) return;
    if (rejectionModal.docId && onUpdateSalonDocumentStatus) {
      onUpdateSalonDocumentStatus(rejectionModal.salonId, rejectionModal.docId, 'rejected', rejectionReason || 'المستند غير واضح أو منتهي الصلاحية');
    } else if (onRejectSalon) {
      onRejectSalon(rejectionModal.salonId, rejectionReason || 'المستندات المرفقة لا تطابق متطلبات الامتثال التجاري');
    }
    setRejectionModal(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 dark:bg-[#121218] border border-rose-200 dark:border-rose-500/30 flex items-center justify-center p-1.5 shadow-md shadow-rose-500/10 shrink-0">
            <TedallalyLogo size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">لوحة الإدارة والموافقة على الصالونات</h2>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">سعيد جمال • المالك والمشرف العام على الامتثال</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            بوابة اعتماد التراخيص والسجلات
          </span>
        </div>
      </div>

      {/* Main Stats Grid - Clickable to instantly filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verified Salons */}
        <button
          onClick={() => {
            setSelectedTab('verifications');
            setStatusFilter('verified');
          }}
          className={`bg-white dark:bg-[#121218] border rounded-2xl p-5 relative overflow-hidden shadow-xs text-right cursor-pointer transition-all hover:scale-[1.01] ${
            statusFilter === 'verified' && selectedTab === 'verifications'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-rose-100 dark:border-slate-800/80'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">الصالونات المعتمدة (تظهر للعميلات)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-3">{verifiedSalons.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">اضغط لعرض المعتمدة فقط</div>
        </button>

        {/* Pending Review */}
        <button
          onClick={() => {
            setSelectedTab('verifications');
            setStatusFilter('pending');
          }}
          className={`bg-white dark:bg-[#121218] border rounded-2xl p-5 relative overflow-hidden shadow-xs text-right cursor-pointer transition-all hover:scale-[1.01] ${
            statusFilter === 'pending' && selectedTab === 'verifications'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40'
              : 'border-amber-200 dark:border-amber-500/40 bg-amber-50/20'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">بانتظار موافقتك واعتمادك</span>
            <Clock className="w-4 h-4 text-amber-500 animate-bounce" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-3">{pendingSalons.length}</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 font-semibold">اضغط لعرض من ينتظر الموافقة</div>
        </button>

        {/* Rejected Salons */}
        <button
          onClick={() => {
            setSelectedTab('verifications');
            setStatusFilter('rejected');
          }}
          className={`bg-white dark:bg-[#121218] border rounded-2xl p-5 relative overflow-hidden shadow-xs text-right cursor-pointer transition-all hover:scale-[1.01] ${
            statusFilter === 'rejected' && selectedTab === 'verifications'
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
              : 'border-rose-200 dark:border-rose-900/40 bg-rose-50/10'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">الصالونات المرفوضة / المعلقة</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-3">{rejectedSalons.length}</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">اضغط لعرض المرفوض فقط</div>
        </button>

        {/* Total Salons */}
        <button
          onClick={() => {
            setSelectedTab('verifications');
            setStatusFilter('all');
          }}
          className={`bg-white dark:bg-[#121218] border rounded-2xl p-5 relative overflow-hidden shadow-xs text-right cursor-pointer transition-all hover:scale-[1.01] ${
            statusFilter === 'all' && selectedTab === 'verifications'
              ? 'border-cyan-500 ring-2 ring-cyan-500/20'
              : 'border-rose-100 dark:border-slate-800/80'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي الصالونات</span>
            <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-3">{salons.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">اضغط لعرض الكل</div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSelectedTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedTab === 'verifications'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>طلبات اعتماد الصالونات والمستندات</span>
          {pendingSalons.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingSalons.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedTab('salons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedTab === 'salons'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>قائمة جميع الصالونات وحالاتها</span>
        </button>

        <button
          onClick={() => setSelectedTab('tap_gateway')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedTab === 'tap_gateway'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>بوابة دفع Tap والعمولات (باقة البداية)</span>
        </button>
      </div>

      {/* VERIFICATIONS VIEW: Approve / Reject Flow */}
      {selectedTab === 'verifications' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                شرط الأمان الصارم المفعّل: لن يظهر أي صالون في منصة تدلّلي ولن يستقبل أي موعد حتى تضغط على "موافقة واعتماد الصالون".
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                يمكنك معاينة السجل التجاري ورخصة البلدية والحساب البنكي، والموافقة الفورية أو رفض الطلب مع توضيح السبب.
              </p>
            </div>
          </div>

          {/* Quick Filter Bar (All / Pending / Rejected / Verified) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121218] border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>الكل</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {salons.length}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>ينتظر الموافقة والاعتماد</span>
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingSalons.length}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  statusFilter === 'rejected'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>المرفوض / معلق</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-200 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'}`}>
                  {rejectedSalons.length}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  statusFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>المعتمدة والنشطة</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'verified' ? 'bg-white/20 text-white' : 'bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'}`}>
                  {verifiedSalons.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث باسم الصالون أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredPending.length === 0 ? (
              <div className="bg-white dark:bg-[#121218] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
                <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {statusFilter === 'pending' && 'لا توجد صالونات بانتظار الاعتماد حالياً'}
                  {statusFilter === 'rejected' && 'لا توجد صالونات مرفوضة حالياً'}
                  {statusFilter === 'verified' && 'لا توجد صالونات معتمدة مطابقة للبحث'}
                  {statusFilter === 'all' && 'لا توجد صالونات مطابقة للبحث'}
                </div>
                <p className="text-xs text-slate-500">
                  {statusFilter !== 'all' ? 'يمكنك التبديل إلى فلتر "الكل" لرؤية باقي الصالونات' : 'جرّب البحث بكلمة مختلفة أو قم بإزالة نص البحث.'}
                </p>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="mt-2 text-xs font-bold text-rose-600 hover:underline"
                  >
                    عرض جميع الصالونات
                  </button>
                )}
              </div>
            ) : filteredPending.map(salonItem => {
              const isSalonApproved = salonItem.status === 'verified';
              const docs = salonItem.documents || [];

              return (
                <div 
                  key={salonItem._id}
                  className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center font-black text-rose-600 dark:text-rose-400 text-lg">
                        {salonItem.salonName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{salonItem.salonName}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            salonItem.providerType === 'freelancer'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                          }`}>
                            {salonItem.providerType === 'freelancer' ? 'مستقلة / خبيرة تجميل' : 'صالون تجاري'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSalonApproved 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                              : salonItem.status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                          }`}>
                            {isSalonApproved ? 'معتمد رسمياً ✓' : salonItem.status === 'pending_verification' ? 'بانتظار موافقة الإدارة ⏳' : 'مطلوب إرفاق المستندات'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                          <span>{salonItem.city} — {salonItem.address || 'حي معتمد'}</span>
                          <span>•</span>
                          <span>الهاتف: {salonItem.phone || '0500000000'}</span>
                          {salonItem.freelanceDocumentNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-purple-600 dark:text-purple-400">وثيقة العمل الحر: {salonItem.freelanceDocumentNumber}</span>
                            </>
                          )}
                          {salonItem.commercialRegisterNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono">السجل: {salonItem.commercialRegisterNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSalonApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(salonItem._id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>موافقة واعتماد {salonItem.providerType === 'freelancer' ? 'المستقلة' : 'الصالون'} فوراً ✓</span>
                          </button>

                          <button
                            onClick={() => setRejectionModal({ isOpen: true, salonId: salonItem._id, salonName: salonItem.salonName })}
                            className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>رفض الطلب</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>الصالون متاح ونشط للعميلات</span>
                          </span>
                          <button
                            onClick={() => setRejectionModal({ isOpen: true, salonId: salonItem._id, salonName: salonItem.salonName })}
                            className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg font-medium transition-colors"
                          >
                            إلغاء الاعتماد مؤقتاً
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents Detailed Checklist */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                      المستندات الرسمية المرفوعة من إدارة الصالون:
                    </div>
                    {docs.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs text-center">
                        لم يقم الصالون برفع أي ملفات حتى الآن (الحالة: محجوب عن العميلات لحين الرفع والاعتماد)
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {docs.map(doc => (
                          <div 
                            key={doc.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 transition-all text-xs flex flex-col justify-between gap-2 shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  doc.status === 'approved' 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                    : doc.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                                }`}>
                                  {doc.status === 'approved' ? 'معتمد ✓' : doc.status === 'pending' ? 'قيد المراجعة ⏳' : 'مرفوض ✗'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono truncate">{doc.fileName}</div>
                              {doc.fileNumber && (
                                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                  رقم الوثيقة: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{doc.fileNumber}</span>
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400">تاريخ الرفع: {doc.uploadedAt}</div>
                            </div>

                            {/* Prominent Inspection Button */}
                            <button
                              type="button"
                              onClick={() => setInspectDocModal({
                                isOpen: true,
                                salonName: salonItem.salonName,
                                doc
                              })}
                              className="w-full mt-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>معاينة وفحص المستند الكامل</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL SALONS VIEW */}
      {selectedTab === 'salons' && (
        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">قائمة الصالونات المعتمدة وغير المعتمدة:</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {salons.map(s => (
              <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{s.salonName}</div>
                  <div className="text-slate-500">{s.city} • {s.address || 'حي رئيسي'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    s.status === 'verified' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                    {s.status === 'verified' ? 'معتمد (نشط في السوق)' : 'معلق لحين التحقق'}
                  </span>
                  {s.status !== 'verified' && (
                    <button
                      onClick={() => handleApprove(s._id)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors"
                    >
                      اعتماد الآن ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAP PAYMENTS INTEGRATION & COMMISSION MATRIX VIEW */}
      {selectedTab === 'tap_gateway' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Card with Account Details from User's Screenshot */}
          <div className="bg-gradient-to-r from-slate-900 via-[#161622] to-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl shadow-lg">
                  Tap
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{TAP_CONFIG.merchantNameAr}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      بوابة نشطة ومربوطة
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    المنشأة: السجل التجاري <span className="font-mono text-slate-300 font-bold">{TAP_CONFIG.entityCr}</span> • معرف التاجر (Merchant ID): <span className="font-mono text-emerald-400 font-bold">{TAP_CONFIG.merchantId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 font-bold border border-blue-500/30">
                  الباقة المطبقة: باقة البداية
                </span>
              </div>
            </div>

            {/* Operator Keys Guide & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Merchant ID (معرف التاجر):</span>
                <span className="font-mono text-emerald-400 font-bold text-sm block">68071827</span>
                <span className="text-[10px] text-slate-500">مطابق للوحة تحكم TapOS</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">المفتاح المطلوب في الواجهة (Public Key):</span>
                <span className="font-mono text-blue-400 font-bold text-xs block truncate">pk_live_... أو pk_test_...</span>
                <span className="text-[10px] text-emerald-400">هو المفتاح الوحيد المصرح بوضعه في المتصفح</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">المفتاح السري (Secret Key):</span>
                <span className="font-mono text-amber-400 font-bold text-xs block truncate">sk_live_... أو sk_test_...</span>
                <span className="text-[10px] text-rose-400 font-bold">سري للباك إند والسيرفر فقط (Webhook)</span>
              </div>
            </div>

            {/* BIN & Card Detection Notice */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <CreditCard className="w-4 h-4" />
                <span>كيف تتعرف بوابة Tap تلقائياً على نوع ومصدر البطاقة (مدى / فيزا محلي أو خليجي أو دولي)؟</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                بمجرد إدخال العميل لأول 6 إلى 8 أرقام من البطاقة (تسمى <strong>BIN/IIN Range</strong>)، تقوم أنظمة Tap بالتحقق الفوري مع شبكة المدفوعات السعودية ومؤسسة النقد (SAMA) و Visa/Mastercard لمعرفة الدولة المصدرة ونوع البطاقة وتطبيق نسبة عمولة باقة البداية تلقائياً:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold block">1. مدى (السعودية):</span>
                  <span className="text-slate-400">تطابق أرقام مدى المعتمدة (1% عمولة بحد أقصى 200 ر.س).</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-blue-400 font-bold block">2. بطاقات محلية (Local):</span>
                  <span className="text-slate-400">بطاقات صادرة من بنوك سعودية (2.75% عمولة).</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-purple-400 font-bold block">3. بطاقات خليجية (GCC):</span>
                  <span className="text-slate-400">بنوك الإمارات، الكويت، قطر، البحرين، عمان (3.75%).</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-amber-400 font-bold block">4. بطاقات دولية (Intl):</span>
                  <span className="text-slate-400">بطاقات أجنبية من أمريكا، أوروبا وغيرها (3.75%).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Cards Comparison */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                تفاصيل عمولات التحصيل والتحويل البنكي (باقات Tap Payments الثلاث):
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                تطبق ضريبة القيمة المضافة 15% على الرسوم المستحقة لـ Tap
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plan 1: Starter (Active) */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/20 to-slate-900/60 border-2 border-blue-500 relative space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-blue-400">باقة البداية (المفعلة)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white">النشطة الآن</span>
                </div>

                <div className="space-y-1 pb-3 border-b border-slate-800">
                  <div className="text-2xl font-black text-white font-mono">199 <span className="text-xs font-normal text-slate-400">ر.س / شهرياً</span></div>
                  <div className="text-[11px] text-emerald-400">160 ر.س شهرياً عند التعاقد السنوي</div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-300">عمولة التحصيل:</div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li className="flex justify-between">
                      <span className="text-slate-400">مدى (mada):</span>
                      <strong className="text-emerald-400">1% (أقصى حد 200 ر.س)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">فيزا وماستركارد (محلي):</span>
                      <strong className="text-white">2.75%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">فيزا وماستركارد (خليجي):</span>
                      <strong className="text-white">3.75%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">فيزا وماستركارد (دولي):</span>
                      <strong className="text-white">3.75%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">رسوم الخدمة لكل معاملة:</span>
                      <strong className="text-amber-400 font-mono">1.00 ر.س</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">تمارا / تابي (تقسيط):</span>
                      <strong className="text-rose-400">6.5% + 1 ر.س</strong>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="font-bold text-slate-300">مدة التحويل للحساب البنكي:</div>
                  <div className="flex justify-between text-slate-400">
                    <span>مدى: <strong>3 أيام عمل</strong></span>
                    <span>فيزا: <strong>5 أيام عمل</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-500">الحد الأدنى للتحويل: 100 ر.س</div>
                </div>
              </div>

              {/* Plan 2: Standard */}
              <div className="p-5 rounded-2xl bg-[#121218] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">الباقة الأساسية</span>
                  <span className="text-[10px] text-slate-400">خيار الترقية</span>
                </div>

                <div className="space-y-1 pb-3 border-b border-slate-800">
                  <div className="text-2xl font-black text-white font-mono">499 <span className="text-xs font-normal text-slate-400">ر.س / شهرياً</span></div>
                  <div className="text-[11px] text-emerald-400">399 ر.س شهرياً عند التعاقد السنوي</div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-300">عمولة التحصيل:</div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li className="flex justify-between">
                      <span className="text-slate-400">مدى (mada):</span>
                      <strong className="text-emerald-400">1% (أقصى حد 200 ر.س)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">فيزا وماستركارد (محلي):</span>
                      <strong className="text-white">2.5%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">فيزا وماستركارد (خليجي/دولي):</span>
                      <strong className="text-white">3.5%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">رسوم الخدمة لكل معاملة:</span>
                      <strong className="text-amber-400 font-mono">1.00 ر.س</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">تمارا / تابي:</span>
                      <strong className="text-rose-400">6.5% + 1 ر.س</strong>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="font-bold text-slate-300">مدة التحويل للحساب البنكي:</div>
                  <div className="flex justify-between text-slate-400">
                    <span>مدى: <strong>3 أيام عمل</strong></span>
                    <span>فيزا: <strong>5 أيام عمل</strong></span>
                  </div>
                </div>
              </div>

              {/* Plan 3: Advanced */}
              <div className="p-5 rounded-2xl bg-[#121218] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-400">الباقة المتقدّمة</span>
                  <span className="text-[10px] text-slate-400">لحجم العمليات الضخم</span>
                </div>

                <div className="space-y-1 pb-3 border-b border-slate-800">
                  <div className="text-2xl font-black text-white font-mono">600 <span className="text-xs font-normal text-slate-400">ر.س / شهرياً</span></div>
                  <div className="text-[11px] text-emerald-400">480 ر.س شهرياً عند التعاقد السنوي</div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-300">عمولة التحصيل:</div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li className="flex justify-between">
                      <span className="text-slate-400">مدى (mada):</span>
                      <strong className="text-emerald-400">1% (أقصى حد 200 ر.س)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">فيزا وماستركارد (محلي):</span>
                      <strong className="text-white">2.4%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">فيزا وماستركارد (خليجي/دولي):</span>
                      <strong className="text-white">3.4%</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">رسوم الخدمة لكل معاملة:</span>
                      <strong className="text-amber-400 font-mono">1.00 ر.س</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">تمارا / تابي:</span>
                      <strong className="text-rose-400">6.5% + 1 ر.س</strong>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="font-bold text-slate-300">مدة التحويل للحساب البنكي:</div>
                  <div className="flex justify-between text-slate-400">
                    <span>مدى: <strong>3 أيام عمل</strong></span>
                    <span>فيزا: <strong>5 أيام عمل</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Interactive Simulation Calculator */}
          <div className="bg-[#121218] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
              <span>حاسبة محاكاة عمولة المعاملات في منصة تدلّلي (باقة البداية المعتمدة):</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { label: 'حجز مدى (100 ر.س)', ch: 'mada' as const, amt: 100 },
                { label: 'حجز فيزا محلي (200 ر.س)', ch: 'visa_master_local' as const, amt: 200 },
                { label: 'حجز أبل باي (300 ر.س)', ch: 'apple_pay' as const, amt: 300 },
                { label: 'تقسيط تمارا / تابي (500 ر.س)', ch: 'tamara' as const, amt: 500 }
              ].map(sim => {
                const feeResult = calculateTapFee(sim.amt, sim.ch, 'starter');
                return (
                  <div key={sim.label} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <span className="text-slate-400 font-bold block">{sim.label}</span>
                    <div className="text-emerald-400 font-mono font-bold text-base">
                      رسوم Tap: {feeResult.totalGatewayDeduction} ر.س
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <div>عمولة التحصيل: {feeResult.percentageFee} ر.س</div>
                      <div>رسوم الخدمة: {feeResult.fixedFee} ر.س + ضريبة {feeResult.vatOnGatewayFee} ر.س</div>
                      <div className="text-white font-bold">الصافي: {feeResult.netPayoutAmount} ر.س</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121218] border border-rose-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>رفض اعتماد صالون "{rejectionModal.salonName}"</span>
              </h3>
              <button 
                onClick={() => setRejectionModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              سيتم إيقاف ظهور الصالون فوراً وإرسال إشعار لصاحب الصالون بضرورة تصحيح المستند أو إرفاق رخصة جديدة سارية.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                سبب الرفض (سيظهر في لوحة تحكم الصالون):
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="مثال: رخصة البلدية منتهية الصلاحية، يرجى إرفاق الرخصة المجددة من منصة بلدي."
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors shadow-md shadow-rose-600/20"
              >
                تأكيد الرفض والإيقاف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspection Full Modal */}
      {inspectDocModal && inspectDocModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121218] border-2 border-rose-200 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    فحص ومراجعة الوثيقة القانونية
                  </h3>
                  <p className="text-xs text-slate-500">{inspectDocModal.salonName} — {inspectDocModal.doc.title}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectDocModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Digital Card / Inspection Preview */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-500">اسم الملف الرقمي المرفوع:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{inspectDocModal.doc.fileName}</span>
              </div>
              {inspectDocModal.doc.fileNumber && (
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-500">رقم الوثيقة / الترخيص:</span>
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">{inspectDocModal.doc.fileNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-500">تاريخ الرفع في المنصة:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{inspectDocModal.doc.uploadedAt}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">الحالة النظامية الحالية:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  inspectDocModal.doc.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : inspectDocModal.doc.status === 'pending'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {inspectDocModal.doc.status === 'approved' ? 'معتمد رسمياً ✓' : inspectDocModal.doc.status === 'pending' ? 'بانتظار التحقق والموافقة ⏳' : 'مرفوض ✗'}
                </span>
              </div>

              {/* Verified Badge Details */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>تم التحقق من ختم الوثيقة وصلاحيتها عبر الربط المباشر مع منصات التوثيق المعتمدة بالمملكة.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInspectDocModal(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق نافذة المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
