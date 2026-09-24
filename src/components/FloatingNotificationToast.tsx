import React, { useEffect } from 'react';
import { InAppNotification } from '../types.ts';
import { Clock, CheckCircle2, AlertTriangle, Sparkles, X, ChevronLeft, Bell } from 'lucide-react';

interface Props {
  notification: InAppNotification | null;
  onDismiss: () => void;
  onClick: (notification: InAppNotification) => void;
}

export const FloatingNotificationToast: React.FC<Props> = ({
  notification,
  onDismiss,
  onClick,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isReminder = notification.type === 'appointment_reminder';
  const isConfirmed = notification.type === 'booking_confirmed';
  const isCancelled = notification.type === 'booking_cancelled';

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div 
        onClick={() => onClick(notification)}
        className="cursor-pointer bg-white/95 dark:bg-[#15151e]/95 backdrop-blur-md border border-rose-200/80 dark:border-slate-700/80 rounded-2xl shadow-2xl p-4 transition-all hover:scale-[1.01] overflow-hidden relative group"
      >
        {/* Accent Top Border */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isReminder ? 'bg-amber-500' : isConfirmed ? 'bg-emerald-500' : isCancelled ? 'bg-rose-500' : 'bg-rose-600'
        }`} />

        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isReminder 
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300' 
              : isConfirmed 
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300'
              : isCancelled 
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300'
              : 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300'
          }`}>
            {isReminder ? (
              <Clock className="w-5 h-5 animate-pulse" />
            ) : isConfirmed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isCancelled ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                تنبيه مباشر الآن
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
              {notification.title}
            </h4>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>

            {notification.bookingSnapshot && (
              <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono bg-rose-50/50 dark:bg-slate-900/60 px-2 py-1 rounded-lg">
                <span>{notification.bookingSnapshot.salonName}</span>
                <span>{notification.bookingSnapshot.appointmentDate} • {notification.bookingSnapshot.appointmentTime}</span>
              </div>
            )}

            <div className="mt-2 text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 justify-end">
              <span>عرض تفاصيل الإشعار</span>
              <ChevronLeft className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
