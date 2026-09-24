import React, { useState } from 'react';
import { 
  Briefcase, 
  Store, 
  X, 
  UploadCloud, 
  FileCheck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Salon } from '../types.ts';

interface RegistrationModalProps {
  isOpen: boolean;
  type: 'salon' | 'freelancer';
  onClose: () => void;
  onSubmit: (newProvider: Salon) => void;
}

export const ProviderRegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  type,
  onClose,
  onSubmit
}) => {
  const isFreelancer = type === 'freelancer';

  const [name, setName] = useState('');
  const [city, setCity] = useState('الرياض');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [docNumber, setDocNumber] = useState(''); // CR number or Freelance document ID
  const [vatNumber, setVatNumber] = useState(''); // ZATCA VAT registration number
  const [iban, setIban] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [bankFileName, setBankFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('يرجى كتابة الاسم ورقم الجوال');
      return;
    }

    setIsSubmitting(true);

    const newId = (isFreelancer ? 'freelancer_' : 'salon_') + Date.now();
    const newSlug = (isFreelancer ? 'fl-' : 'salon-') + Date.now();

    const newProvider: Salon = {
      _id: newId,
      _creationTime: Date.now(),
      salonName: name.trim(),
      slug: newSlug,
      city,
      district: district.trim() || undefined,
      address: isFreelancer ? `خدمة منزلية وحضور - ${city}` : `${city} - ${district}`,
      phone: phone.trim(),
      description: description.trim() || (isFreelancer ? 'خبيرة تجميل ومكياج مستقلة معتمدة' : 'صالون تجميل وعناية متكامل'),
      status: 'pending_verification', // Starts as pending verification for admin review!
      isActive: true,
      providerType: isFreelancer ? 'freelancer' : 'salon',
      freelanceDocumentNumber: isFreelancer ? docNumber.trim() : undefined,
      commercialRegisterNumber: !isFreelancer ? docNumber.trim() : undefined,
      vatNumber: !isFreelancer ? (vatNumber.trim() || '310492817200003') : undefined,
      acceptsOnlinePayment: true,
      averageRating: 5.0,
      totalReviews: 1,
      totalBookings: 0,
      documents: [
        {
          id: 'doc_' + Date.now(),
          type: isFreelancer ? 'freelance_document' : 'commercial_register',
          title: isFreelancer ? 'وثيقة العمل الحر المعتمدة' : 'السجل التجاري الرسمي',
          fileName: docFileName.trim() || (isFreelancer ? 'Freelance_Cert.pdf' : 'CR_Document.pdf'),
          fileNumber: docNumber.trim(),
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'pending' // pending review
        },
        {
          id: 'doc_bank_' + Date.now(),
          type: 'bank_certificate',
          title: 'شهادة الحساب البنكي والآيبان',
          fileName: bankFileName.trim() || 'IBAN_Certificate.pdf',
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'pending'
        }
      ]
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(newProvider);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#121218] border border-rose-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${
              isFreelancer 
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30' 
                : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
            }`}>
              {isFreelancer ? <Briefcase className="w-6 h-6" /> : <Store className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isFreelancer ? 'انضمام خبيرة تجميل مستقلة (Freelancer)' : 'تسجيل صالون تجميل تجاري جديد'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isFreelancer 
                  ? 'سجلي بوثيقة العمل الحر وابدئي استقبال حجوزات العميلات والمناسبات' 
                  : 'أدرجي صالونك في منصة تدلّلي مع الاستفادة من كافة الأنظمة مجاناً'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-1">متطلب نظامي إلزامي للتدقيق والامتثال:</span>
            {isFreelancer 
              ? 'يتطلب اعتماد حساب الخبيرة المستقلة رفع وثيقة العمل الحر المعتمدة وشهادة الآيبان البنكي ليتم مراجعتها واعتمادها من إدارة منصة تدلّلي قبل استقبال الحجوزات.'
              : 'يتطلب فتح حساب الصالون رفع السجل التجاري ورخصة البلدية والحساب البنكي ليتم تدقيقها من إدارة تدلّلي والموافقة عليها.'}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              {isFreelancer ? 'اسم الخبيرة المستقلة / الاسم المهني' : 'اسم الصالون التجاري'}
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isFreelancer ? 'مثال: ريم العبدالله • ميكب آرتست' : 'مثال: صالون إيليت لاونج'}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">المدينة</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-bold cursor-pointer"
              >
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام</option>
                <option value="الخبر">الخبر</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                {isFreelancer ? 'نطاق الخدمة / الحي الرئيسي' : 'الحي وموقع الصالون'}
              </label>
              <input 
                type="text" 
                value={district}
                onChange={e => setDistrict(e.target.value)}
                placeholder="مثال: حطين، النرجس، التحلية"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">رقم الهاتف / واتساب التواصل الرسمي</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="05XXXXXXXX"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-bold"
            />
          </div>

          {/* Legal Document Upload Fields */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>المستندات القانونية وبينات التحقق الرسمية:</span>
            </h4>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isFreelancer ? 'رقم وثيقة العمل الحر المعتمدة' : 'رقم السجل التجاري (وزارة التجارة)'}
              </label>
              <input 
                type="text" 
                required
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                placeholder={isFreelancer ? 'مثال: FL-99201928' : 'مثال: 1010XXXXXX'}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-mono"
              />
            </div>

            {!isFreelancer && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرقم الضريبي الموحد (15 رقماً من هيئة الزكاة والضريبة والجمارك)
                </label>
                <input 
                  type="text" 
                  value={vatNumber}
                  onChange={e => setVatNumber(e.target.value)}
                  placeholder="3XXXXXXXXXXXX03"
                  maxLength={15}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-mono"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isFreelancer ? 'اسم ملف وثيقة العمل الحر (PDF / صورة)' : 'اسم ملف السجل التجاري'}
              </label>
              <input 
                type="text" 
                value={docFileName}
                onChange={e => setDocFileName(e.target.value)}
                placeholder="Freelance_Certificate_2026.pdf"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شهادة الآيبان البنكي (لتحويل المبالغ)
              </label>
              <input 
                type="text" 
                value={bankFileName}
                onChange={e => setBankFileName(e.target.value)}
                placeholder="Bank_IBAN_Certificate.pdf"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">نبذة عن الخدمات والخبرة</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isFreelancer ? 'مثال: متخصصة في مكياج العرائس وتسريحات السهرات بخبرة 6 سنوات...' : 'نبذة عن صالونكم وخدماتكم...'}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isFreelancer 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/25'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/25'
              }`}
            >
              {isSubmitting ? (
                <span>جاري إرسال الطلب والمستندات...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>إرسال طلب التسجيل إلى إدارة تدلّلي</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
