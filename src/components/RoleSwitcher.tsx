import React, { useState } from 'react';
import { 
  Sparkles, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  LogOut, 
  KeyRound, 
  Check, 
  ChevronDown, 
  Briefcase,
  Store,
  Crown,
  Heart
} from 'lucide-react';
import { User, Salon } from '../types.ts';

interface RoleSwitcherProps {
  currentUser: User | null;
  onSwitchUser: (user: User) => void;
  availableUsers: User[];
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onLogout?: () => void;
  onOpenFreelancerRegister?: () => void;
  onOpenSalonRegister?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentUser,
  onSwitchUser,
  availableUsers,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onOpenFreelancerRegister,
  onOpenSalonRegister
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenLogin}
          className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>تسجيل الدخول</span>
        </button>
        <button
          onClick={onOpenRegister}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>حساب جديد</span>
        </button>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'مدير النظام (إدارة المنصة)',
          shortLabel: 'المدير العام',
          icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
          color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50'
        };
      case 'salon_owner':
        return {
          label: 'صاحبة صالون',
          shortLabel: 'صالون',
          icon: <Store className="w-3.5 h-3.5 text-rose-500" />,
          color: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700/50'
        };
      case 'freelancer':
        return {
          label: 'مستقلة (ميكب آرتست / خبيرة)',
          shortLabel: 'خبيرة مستقلة',
          icon: <Briefcase className="w-3.5 h-3.5 text-purple-500" />,
          color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-700/50'
        };
      case 'customer':
      default:
        return {
          label: 'عميلة تدلّلي',
          shortLabel: 'عميلة',
          icon: <Heart className="w-3.5 h-3.5 text-pink-500" />,
          color: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
        };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <div className="relative inline-block text-right">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${currentBadge.color}`}
        title="تغيير الحساب النشط والصلاحيات"
      >
        <span className="flex items-center gap-1.5">
          {currentBadge.icon}
          <span className="hidden sm:inline">{currentUser.name}</span>
          <span className="text-[11px] opacity-80">({currentBadge.shortLabel})</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto mt-2 sm:w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#15151e] border border-rose-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in-50 zoom-in-95">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                {currentUser.role === 'admin' ? 'تبديل الحساب النشط:' : 'الملف الشخصي والحساب:'}
              </span>
              {currentUser.role === 'admin' 
                ? 'تخصيص الواجهة والصلاحيات حسب رتبة الحساب المحددة' 
                : `${currentUser.email || currentUser.phone || 'حساب مفعل في منصة تدلّلي'}`}
            </div>

            {/* If admin, allow switching. If regular customer or salon owner, ONLY show their own account */}
            <div className="space-y-1 py-1">
              {(currentUser.role === 'admin' ? availableUsers : [currentUser]).map((user) => {
                const isSelected = user._id === currentUser._id;
                const badge = getRoleBadge(user.role);
                return (
                  <div
                    key={user._id}
                    onClick={() => {
                      if (currentUser.role === 'admin') {
                        onSwitchUser(user);
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-right ${
                      currentUser.role === 'admin' ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected 
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {badge.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{badge.label}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
                  </div>
                );
              })}
            </div>

            {(onOpenFreelancerRegister || onOpenSalonRegister || onLogout) && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                {onOpenFreelancerRegister && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenFreelancerRegister();
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>تسجيل خبيرة تجميل مستقلة جديدة</span>
                  </button>
                )}
                {onOpenSalonRegister && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSalonRegister();
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>تسجيل صالون تجاري جديد</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800/80 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج من الحساب</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
