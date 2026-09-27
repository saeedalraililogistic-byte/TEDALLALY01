import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Sparkles, 
  Store, 
  Briefcase, 
  Heart, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  AlertCircle,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { User, Salon } from '../types.ts';
import { registerWithEmail } from '../lib/authService.ts';
import { TedallalyLogo } from './TedallalyLogo.tsx';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newUser: User, newSalon?: Salon) => void;
  onOpenLogin: () => void;
  initialRole?: 'customer' | 'salon_owner' | 'freelancer';
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onOpenLogin,
  initialRole = 'customer'
}) => {
  const [role, setRole] = useState<'customer' | 'salon_owner' | 'freelancer'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('الرياض');
  const [providerName, setProviderName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('يرجى كتابة الاسم الكريم.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('يرجى كتابة البريد الإلكتروني.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('يرجى كتابة رقم الجوال لتأكيد الحساب والمواعيد.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerWithEmail({
        name,
        email,
        password,
        role,
        phone,
        city,
        providerName: role !== 'customer' ? providerName : undefined
      });

      setIsLoading(false);
      onRegisterSuccess(result.user, result.salon);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white dark:bg-[#121218] border border-rose-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center p-1.5 shadow-md shadow-rose-500/10">
              <TedallalyLogo size={28} />
            </div>
            <div>
              <h3 id="register-title" className="text-lg font-black text-slate-900 dark:text-white">
                إنشاء حساب جديد
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                انضمي إلى منصة تدلّلي للجمال والعناية
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            حددي نوع الحساب:
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                role === 'customer'
                  ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-black shadow-xs ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Heart className={`w-5 h-5 ${role === 'customer' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span className="text-[11px]">عميلة تدلّلي</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('salon_owner')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                role === 'salon_owner'
                  ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-black shadow-xs ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Store className={`w-5 h-5 ${role === 'salon_owner' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span className="text-[11px]">صاحبة صالون</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                role === 'freelancer'
                  ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-black shadow-xs ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Briefcase className={`w-5 h-5 ${role === 'freelancer' ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="text-[11px]">خبيرة مستقلة</span>
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed flex-1">
              <span className="font-bold block mb-0.5">خطأ في التسجيل:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              الاسم الكريم
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                required
                value={name}
                onChange={e => { setName(e.target.value); setErrorMsg(''); }}
                placeholder="الاسم الثلاثي أو الثنائي"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="name@example.com"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              كلمة المرور (6 خانات على الأقل)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
                placeholder="••••••••"
                className="w-full pr-10 pl-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-medium text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'إخفاء' : 'إظهار'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                رقم الجوال
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="tel"
                  required
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setErrorMsg(''); }}
                  placeholder="05XXXXXXXX"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                المدينة
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام</option>
                <option value="الخبر">الخبر</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
              </select>
            </div>
          </div>

          {role !== 'customer' && (
            <div className="p-3 bg-rose-50/50 dark:bg-slate-900 border border-rose-200 dark:border-slate-800 rounded-2xl space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                {role === 'freelancer' ? 'الاسم المهني للخبيرة' : 'اسم الصالون التجاري'}
              </label>
              <input 
                type="text"
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                placeholder={role === 'freelancer' ? 'مثال: ريم العبدالله • خبيرة تجميل' : 'مثال: صالون إيليت لاونج'}
                className="w-full px-3 py-2 bg-white dark:bg-[#121218] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 outline-none font-bold text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                سيتم تفعيل لوحة تحكم مخصصة لإدارة جدول المواعيد والحسابات بعد إنشاء الحساب.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              role === 'freelancer'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/25'
                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/25'
            }`}
          >
            {isLoading ? (
              <span>جاري إنشاء الحساب وحفظ البيانات سحابياً...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إنشاء الحساب وتفعيله سحابياً</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            لديكِ حساب بالفعل؟{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>تسجيل الدخول</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
