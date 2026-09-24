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
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Building2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { User } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'customer' | 'salon_owner' | 'freelancer';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  initialMode = 'login',
  initialRole = 'customer'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'customer' | 'salon_owner' | 'freelancer'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('جدة');
  const [providerName, setProviderName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('يرجى كتابة الاسم الكريم');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('يرجى كتابة رقم الجوال للتواصل وتأكيد الحجوزات');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (mode === 'login') {
        // Quick demo matching or instant session
        const normalizedEmail = email.trim().toLowerCase();
        let loggedUser: User;

        if (normalizedEmail.includes('saeedalraili') || normalizedEmail.includes('admin')) {
          loggedUser = {
            _id: 'usr_admin',
            name: 'سعيد جمال',
            email: 'saeedalraililogistic@gmail.com',
            role: 'admin',
            phone: '0566364725',
            city: 'جدة',
            isActive: true
          };
        } else if (normalizedEmail.includes('historytime') || normalizedEmail.includes('ehsan')) {
          loggedUser = {
            _id: 'usr_salon_ehsan',
            name: 'إدارة صالون إحسان',
            email: 'historytime29@gmail.com',
            role: 'salon_owner',
            phone: '0566364725',
            city: 'جدة',
            linkedProviderId: 'kh77cnn230ayx24dvgm71y5wcx8cpcgz',
            isActive: true
          };
        } else if (normalizedEmail.includes('anamil')) {
          loggedUser = {
            _id: 'usr_salon_anamil',
            name: 'إدارة صالون أنامل ناعمة',
            email: 'anamil@tedallaly.com',
            role: 'salon_owner',
            phone: '0564505943',
            city: 'جدة',
            linkedProviderId: 'kh79dwc8bfs0gqzdf605ay17ph8derhw',
            isActive: true
          };
        } else {
          // Standard customer or dynamic user
          loggedUser = {
            _id: `usr_${Date.now()}`,
            name: name.trim() || email.split('@')[0],
            email: normalizedEmail,
            role: role,
            phone: phone.trim() || '0500000000',
            city: city,
            isActive: true
          };
        }

        onLoginSuccess(loggedUser);
        onClose();
      } else {
        // Registering a new user
        const newUser: User = {
          _id: `usr_${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role,
          phone: phone.trim(),
          city: city,
          isActive: true,
          linkedProviderId: role !== 'customer' ? `provider_${Date.now()}` : undefined
        };

        onRegisterSuccess(newUser);
        onClose();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50" dir="rtl">
      <div className="bg-white dark:bg-[#121218] border border-rose-200/80 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 relative">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 text-white relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-white/20 text-white backdrop-blur-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-wider opacity-90">تدلّلي • TEDALLALY</span>
          </div>
          
          <h3 className="text-xl font-black">
            {mode === 'login' ? 'مرحباً بكِ مجدداً في تدلّلي' : 'إنشاء حساب جديد في تدلّلي'}
          </h3>
          <p className="text-xs text-rose-100 mt-1">
            {mode === 'login' 
              ? 'سجلي الدخول للوصول لحجوزاتكِ، خدماتكِ، وإدارتها بخصوصية وأمان' 
              : 'انضمي لمنصة التجميل الفاخرة للصالونات والعميلات في السعودية'}
          </p>
        </div>

        {/* Tab switcher: Login / Register */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 bg-slate-50/70 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            حساب جديد (تسجيل)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* If registering: Choose Account Type */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">نوع الحساب:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    role === 'customer'
                      ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-[11px]">عميلة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('salon_owner')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    role === 'salon_owner'
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4 text-rose-600" />
                  <span className="text-[11px]">صالون تجميل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    role === 'freelancer'
                      ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span className="text-[11px]">خبيرة مستقلة</span>
                </button>
              </div>
            </div>
          )}

          {/* Name Field (if registering) */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {role === 'salon_owner' ? 'اسم مالكة / مديرة الصالون' : role === 'freelancer' ? 'اسم خبيرة التجميل' : 'الاسم الكامل'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="مثال: ريما عبدالله"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Provider / Salon Name if provider */}
          {mode === 'register' && role !== 'customer' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {role === 'salon_owner' ? 'الاسم التجاري للصالون' : 'الاسم المهني للخبيرة'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={role === 'salon_owner' ? 'مثال: صالون اللمسة المخملية' : 'مثال: خبيرة المكياج نورة'}
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Phone & City (if registering) */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رقم الجوال</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">المدينة</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="جدة">جدة</option>
                    <option value="الرياض">الرياض</option>
                    <option value="الدمام">الدمام</option>
                    <option value="الخبر">الخبر</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300">كلمة المرور</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('يمكنك استخدام حساب الإدارة saeedalraililogistic@gmail.com أو تجربة حسابات الصالونات النشطة مباشرة')}
                  className="text-[10px] text-rose-600 hover:underline"
                >
                  نسيتِ كلمة المرور؟
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-9 pl-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Fast Quick-Fill Shortcuts for Easy Verification */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>⚡ تسجيل دخول سريع بنقرة واحدة:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('saeedalraililogistic@gmail.com');
                    setPassword('admin2026');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-[10px] font-bold hover:bg-amber-100 transition-colors"
                >
                  حساب المشرف (سعيد جمال)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('historytime29@gmail.com');
                    setPassword('salon123');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-[10px] font-bold hover:bg-rose-100 transition-colors"
                >
                  إدارة صالون إحسان
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('noura@example.com');
                    setPassword('client123');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-200 transition-colors"
                >
                  حساب عميلة (نورة)
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>جاري التحقق والمتابعة...</span>
            ) : mode === 'login' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>تسجيل الدخول للمنصة</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إنشاء الحساب والبدء فوراً</span>
              </>
            )}
          </button>

          <div className="text-center text-[10px] text-slate-500 dark:text-slate-400 pt-1">
            {mode === 'login' ? (
              <span>ليس لديكِ حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                >
                  سجلي حسابكِ الآن مجاناً
                </button>
              </span>
            ) : (
              <span>لديكِ حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                >
                  تسجيل الدخول هنا
                </button>
              </span>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
