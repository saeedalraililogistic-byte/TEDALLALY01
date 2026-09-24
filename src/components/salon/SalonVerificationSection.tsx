import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Lock, 
  Eye, 
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Salon, SalonDocument } from '../../types.ts';

interface Props {
  salon: Salon;
  onUpdateSalon?: (updated: Salon) => void;
}

export const SalonVerificationSection: React.FC<Props> = ({ salon, onUpdateSalon }) => {
  const [crNumber, setCrNumber] = useState(salon.commercialRegisterNumber || '');
  const [taxNumber, setTaxNumber] = useState(salon.taxNumber || '');
  const [selectedDocType, setSelectedDocType] = useState<SalonDocument['type']>('commercial_register');
  const [fileNameInput, setFileNameInput] = useState('');
  const [fileNumberInput, setFileNumberInput] = useState('');
  const [expiryDateInput, setExpiryDateInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const documents = salon.documents || [];

  const isFreelancer = salon.providerType === 'freelancer';

  const requiredDocTypes: { type: SalonDocument['type']; title: string; required: boolean; desc: string }[] = isFreelancer ? [
    { 
      type: 'freelance_document', 
      title: 'وثيقة العمل الحر المعتمدة', 
      required: true, 
      desc: 'وثيقة رسمية صادرة من منصة العمل الحر (وزارة الموارد البشرية والتنمية الاجتماعية)' 
    },
    { 
      type: 'bank_certificate', 
      title: 'شهادة الحساب البنكي والآيبان (IBAN)', 
      required: true, 
      desc: 'خطاب رسمي أو شهادة آيبان بنكية باسم الخبيرة المستقلة لتحويل مستحقات الحجوزات' 
    },
    { 
      type: 'tax_certificate', 
      title: 'شهادة التسجيل الضريبي أو بطاقة الهوية', 
      required: false, 
      desc: 'إثبات الهوية الوطنية أو شهادة تسجيل الزكاة والضريبة إن وجدت' 
    }
  ] : [
    { 
      type: 'commercial_register', 
      title: 'السجل التجاري أو وثيقة العمل الحر', 
      required: true, 
      desc: 'سجل تجاري نشط صادر من وزارة التجارة أو وثيقة معتمدة' 
    },
    { 
      type: 'municipality_license', 
      title: 'رخصة البلدية / الدفاع المدني', 
      required: true, 
      desc: 'رخصة فتح المحل التجاري سارية المفعول لموقع الصالون' 
    },
    { 
      type: 'tax_certificate', 
      title: 'شهادة ضريبة القيمة المضافة (ZATCA)', 
      required: false, 
      desc: 'شهادة التسجيل في ضريبة القيمة المضافة (إن وجدت)' 
    },
    { 
      type: 'bank_certificate', 
      title: 'شهادة الحساب البنكي والآيبان (IBAN)', 
      required: true, 
      desc: 'خطاب آيبان بنكي رسمي معتمد باسم المؤسسة لتحويل العوائد ومستحقات الحجوزات' 
    }
  ];

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileNameInput.trim()) {
      setNotification({ type: 'error', message: 'يرجى إدخال اسم المستند أو إرفاق ملفه' });
      return;
    }

    const docDef = requiredDocTypes.find(d => d.type === selectedDocType);
    const newDoc: SalonDocument = {
      id: 'doc_' + Date.now(),
      type: selectedDocType,
      title: docDef?.title || 'مستند قانوني',
      fileName: fileNameInput.trim(),
      fileNumber: fileNumberInput.trim() || undefined,
      uploadedAt: new Date().toISOString().split('T')[0],
      expiryDate: expiryDateInput.trim() || undefined,
      status: 'pending', // Pending Admin Approval!
    };

    const updatedDocuments = [...documents.filter(d => d.type !== selectedDocType), newDoc];
    
    // Check if uploaded minimum required docs based on provider type
    let hasMinDocs = false;
    if (isFreelancer) {
      const hasFreelanceDoc = updatedDocuments.some(d => d.type === 'freelance_document' || d.type === 'commercial_register');
      const hasBank = updatedDocuments.some(d => d.type === 'bank_certificate');
      hasMinDocs = hasFreelanceDoc && hasBank;
    } else {
      const hasCr = updatedDocuments.some(d => d.type === 'commercial_register');
      const hasLicense = updatedDocuments.some(d => d.type === 'municipality_license');
      const hasBank = updatedDocuments.some(d => d.type === 'bank_certificate');
      hasMinDocs = hasCr && hasLicense && hasBank;
    }

    const nextStatus = hasMinDocs ? 'pending_verification' : 'documents_required';

    const updatedSalon: Salon = {
      ...salon,
      commercialRegisterNumber: crNumber.trim() || salon.commercialRegisterNumber,
      taxNumber: taxNumber.trim() || salon.taxNumber,
      documents: updatedDocuments,
      status: salon.status === 'verified' ? 'verified' : nextStatus,
      submittedAt: new Date().toISOString()
    };

    if (onUpdateSalon) {
      onUpdateSalon(updatedSalon);
    }

    setFileNameInput('');
    setFileNumberInput('');
    setExpiryDateInput('');
    setNotification({
      type: 'success',
      message: 'تم إرفاق المستند بنجاح. هو الآن قيد مراجعة إدارة منصة تدلّلي المعتمدة.'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const isVerified = salon.status === 'verified';
  const isPending = salon.status === 'pending_verification';

  return (
    <div className="space-y-6">
      {/* Verification Status Header Card */}
      <div className={`p-6 rounded-3xl border ${
        isVerified 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100' 
          : isPending
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
              isVerified 
                ? 'bg-emerald-500/20 text-emerald-500' 
                : isPending 
                ? 'bg-amber-500/20 text-amber-500' 
                : 'bg-rose-500/20 text-rose-500'
            }`}>
              {isVerified ? <ShieldCheck className="w-8 h-8" /> : isPending ? <Clock className="w-8 h-8 animate-spin" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">
                  {isVerified && (isFreelancer ? 'خبيرة تجميل موثقة ومعتمدة رسمياً ✓' : 'صالون موثق ومعتمد رسمياً ✓')}
                  {isPending && 'المستندات قيد المراجعة والمطابقة من إدارة المنصة'}
                  {!isVerified && !isPending && (isFreelancer ? 'مطلوب إرفاق وثيقة العمل الحر والآيبان للبدء' : 'مطلوب إرفاق المستندات الرسمية للبدء')}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isVerified 
                    ? 'bg-emerald-500 text-white' 
                    : isPending 
                    ? 'bg-amber-500 text-slate-900' 
                    : 'bg-rose-500 text-white'
                }`}>
                  {isVerified ? 'معتمد ومتاح للعميلات' : isPending ? 'قيد المراجعة الفورية' : 'موقوف مؤقتاً لحين التوثيق'}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-1 max-w-2xl leading-relaxed">
                {isVerified && (isFreelancer ? 'تهانينا! حسابك كخبيرة مستقلة معتمد ويظهر للعميلات في منصة تدلّلي، مع تفعيل خاصية استقبال الحجوزات والمحفظة.' : 'تهانينا! صالونك معتمد ويظهر لآلاف العميلات في منصة تدلّلي، مع تفعيل خاصية استقبال الحجوزات، الدفع الإلكتروني، ودرع منع التضارب 100%.')}
                {isPending && (isFreelancer ? 'تم استلام وثيقة العمل الحر وبيانات الحساب البنكي بنجاح. يقوم فريق الامتثال بالتدقيق للاعتماد الفوري.' : 'تم استلام مستنداتكم القانونية بنجاح. يقوم فريق الامتثال ومسؤولو منصة تدلّلي بمطابقة السجل التجاري ورخصة البلدية حالياً.')}
                {!isVerified && !isPending && (isFreelancer ? 'حرصاً على أمان العميلات والامتثال لضوابط العمل الحر، لن تتمكني من استقبال الحجوزات أو الظهور في المنصة قبل رفع وثيقة العمل الحر وموافقة الإدارة عليها.' : 'حرصاً على أمان العميلات والامتثال لأنظمة وزارة التجارة والبلديات في المملكة، لن يتمكن الصالون من استقبال الحجوزات أو الظهور في المنصة قبل رفع المستندات وموافقة الإدارة عليها.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
          notification.type === 'success' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Mandatory Requirements Status Checklist */}
      <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">حالة المستندات النظامية للصالون</h4>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {documents.filter(d => d.status === 'approved').length} من {requiredDocTypes.length} معتمد
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {requiredDocTypes.map(doc => {
            const uploaded = documents.find(d => d.type === doc.type);
            const isDocApproved = uploaded?.status === 'approved';
            const isDocPending = uploaded?.status === 'pending';
            const isDocRejected = uploaded?.status === 'rejected';

            return (
              <div 
                key={doc.type}
                className={`p-4 rounded-xl border transition-all ${
                  isDocApproved 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/30' 
                    : isDocPending 
                    ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-500/30'
                    : isDocRejected
                    ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-500/30'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{doc.title}</span>
                      {doc.required && (
                        <span className="text-[10px] text-rose-500 font-bold">*إلزامي</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{doc.desc}</p>
                  </div>

                  <div>
                    {isDocApproved && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        معتمد
                      </span>
                    )}
                    {isDocPending && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        قيد المراجعة
                      </span>
                    )}
                    {isDocRejected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        مرفوض
                      </span>
                    )}
                    {!uploaded && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        غير مرفوع
                      </span>
                    )}
                  </div>
                </div>

                {uploaded && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{uploaded.fileName}</span>
                    {uploaded.fileNumber && <span>رقم: {uploaded.fileNumber}</span>}
                  </div>
                )}

                {isDocRejected && uploaded?.rejectionReason && (
                  <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded-lg">
                    سبب الرفض: {uploaded.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Document Form */}
      <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-rose-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">إرفاق مستند جديد للمراجعة والاعتماد</h4>
        </div>

        <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1.5">نوع المستند</label>
              <select
                value={selectedDocType}
                onChange={e => setSelectedDocType(e.target.value as SalonDocument['type'])}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                {requiredDocTypes.map(d => (
                  <option key={d.type} value={d.type}>
                    {d.title} {d.required ? '*(مطلوب)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1.5">رقم المستند / السجل / الرخصة</label>
              <input
                type="text"
                value={fileNumberInput}
                onChange={e => setFileNumberInput(e.target.value)}
                placeholder="مثال: 1010892341"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1.5">اسم الملف المرفق أو البيان</label>
              <input
                type="text"
                value={fileNameInput}
                onChange={e => setFileNameInput(e.target.value)}
                placeholder="مثال: CR_Tedallaly_Salon_2026.pdf"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1.5">تاريخ انتهاء الصلاحية</label>
              <input
                type="date"
                value={expiryDateInput}
                onChange={e => setExpiryDateInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>إرسال المستند للاعتماد</span>
            </button>
          </div>
        </form>
      </div>

      {/* Safety Policy Reminder */}
      <div className="bg-rose-50/50 dark:bg-slate-900/40 border border-rose-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>سياسة منصة تدلّلي الصارمة:</strong> نلتزم بأعلى معايير الشفافية والموثوقية لحماية حقوق عميلاتنا وصالوناتنا الشريكة. أي صالون غير معتمد لا يمكنه استلام مبالغ الحجوزات أو الظهور في محرك بحث المنصة أو تفعيل عروض اللحظة الأخيرة.
        </p>
      </div>
    </div>
  );
};
