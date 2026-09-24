import React, { useState, useRef, useEffect } from 'react';
import { InAppNotification, Booking } from '../types.ts';
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Check, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  Volume2,
  ChevronDown,
  Info
} from 'lucide-react';
import { playNotificationSound } from '../lib/notificationService.ts';

interface Props {
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onSelectBooking?: (bookingId: string) => void;
  onTriggerSimulatedReminder: () => void;
  onTriggerSimulatedConfirmation: () => void;
  onManualScanProximity: () => void;
}

export const NotificationCenter: React.FC<Props> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onSelectBooking,
  onTriggerSimulatedReminder,
  onTriggerSimulatedConfirmation,
  onManualScanProximity,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'reminders' | 'salon_updates'>('all');
  const [showSandbox, setShowSandbox] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close panel on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'reminders') return n.type === 'appointment_reminder';
    if (activeFilter === 'salon_updates') return n.type === 'status_change' || n.type === 'booking_confirmed' || n.type === 'booking_cancelled';
    return true;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const getNotificationIcon = (type: InAppNotification['type'], urgency: InAppNotification['urgency']) => {
    switch (type) {
      case 'appointment_reminder':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        );
      case 'booking_confirmed':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'booking_cancelled':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'status_change':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="تنبيهات الحجوزات والمواعيد"
        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-rose-50 dark:bg-slate-800 border-rose-300 dark:border-rose-500/50 text-rose-600 dark:text-rose-400'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 dark:hover:border-slate-700'
        }`}
      >
        <Bell className="w-5 h-5" />
        
        {unreadCount > 0 && (
          <>
            {/* Pulsing ring */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[9px] font-black items-center justify-center">
                {unreadCount > 9 ? '+9' : unreadCount}
              </span>
            </span>
          </>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div 
          id="notification-center-dropdown"
          className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto mt-2 sm:w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-4 border-b border-rose-100/80 dark:border-slate-800 bg-rose-50/40 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    التنبيهات والإشعارات
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {unreadCount} غير مقروء
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      كل المواعيد محدثة ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  تنبيهات فورية عند اقتراب الموعد وتأكيدات الصالون
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-rose-100/50 dark:hover:bg-slate-800 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-50/60 dark:bg-slate-950/60 border-b border-rose-100/60 dark:border-slate-800/80 overflow-x-auto text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeFilter === 'unread'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white'
              }`}
            >
              غير مقروءة ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('reminders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'reminders'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              <span>⏰ تذكيرات المواعيد</span>
            </button>
            <button
              onClick={() => setActiveFilter('salon_updates')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'salon_updates'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              <span>✨ تأكيدات الصالون</span>
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between px-3 py-2 text-[11px] border-b border-rose-100/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#121218]">
            <div className="flex items-center gap-2">
              <button
                onClick={onManualScanProximity}
                className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                title="فحص فوري للمواعيد المقتربة خلال 24 ساعة"
              >
                <RefreshCw className="w-3 h-3" />
                <span>فحص اقتراب المواعيد</span>
              </button>
              <span>•</span>
              <button
                onClick={() => playNotificationSound()}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
                title="تجربة صوت النغمة"
              >
                <Volume2 className="w-3 h-3" />
                <span>صوت</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  تحديد الكل كمقروء ✓
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                  title="مسح جميع الإشعارات"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-rose-100/60 dark:divide-slate-800/60 p-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-slate-900 border border-rose-100 dark:border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  لا توجد إشعارات في هذا التصنيف
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  ستتلقين هنا تنبيهات فورية عند اقتراب موعد حجزكِ أو تأكيد الصالون لأي تغيير في الموعد.
                </p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) onMarkAsRead(notif.id);
                  }}
                  className={`p-3 transition-colors rounded-xl mx-1 my-1 cursor-pointer relative group ${
                    notif.read
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      : 'bg-rose-50/60 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-slate-800/80 border border-rose-100 dark:border-rose-900/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notif.type, notif.urgency)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-bold truncate ${
                          notif.read ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white'
                        }`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Snapshot Details Tag */}
                      {notif.bookingSnapshot && (
                        <div className="mt-2 p-2 rounded-lg bg-white/90 dark:bg-slate-950/80 border border-rose-100/80 dark:border-slate-800 text-[10px] space-y-1">
                          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                            <span className="text-rose-600 dark:text-rose-400">
                              {notif.bookingSnapshot.salonName}
                            </span>
                            <span>{notif.bookingSnapshot.serviceName}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {notif.bookingSnapshot.appointmentDate} • {notif.bookingSnapshot.appointmentTime}
                            </span>
                            {notif.bookingSnapshot.staffName && (
                              <span>الأخصائية: {notif.bookingSnapshot.staffName}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-rose-100/40 dark:border-slate-800/40 text-[10px]">
                        {onSelectBooking && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!notif.read) onMarkAsRead(notif.id);
                              onSelectBooking(notif.bookingId);
                              setIsOpen(false);
                            }}
                            className="text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>عرض جدول الحجوزات</span>
                          </button>
                        )}

                        <div className="flex items-center gap-2 mr-auto">
                          {!notif.read ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notif.id);
                              }}
                              className="text-slate-500 hover:text-emerald-600 flex items-center gap-0.5"
                              title="تحديد كمقروء"
                            >
                              <Check className="w-3 h-3" />
                              <span>مقروء</span>
                            </button>
                          ) : (
                            <span className="text-slate-400">تم الاطلاع ✓</span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNotification(notif.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                            title="حذف الإشعار"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Interactive Simulation / Test Sandbox Accordion */}
          <div className="border-t border-rose-100 dark:border-slate-800 bg-rose-50/50 dark:bg-slate-900/60 p-3">
            <button
              type="button"
              onClick={() => setShowSandbox(!showSandbox)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>أدوات تجربة واختبار التنبيهات المباشرة 🧪</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSandbox ? 'rotate-180' : ''}`} />
            </button>

            {showSandbox && (
              <div className="mt-3 space-y-2 text-[11px] pt-2 border-t border-rose-200/50 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                  يمكنكِ تجربة النظام بمحاكاة وصول إشعار اقتراب موعد أو تأكيد الصالون فوراً:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerSimulatedReminder();
                      playNotificationSound();
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-center transition-colors cursor-pointer"
                  >
                    ⏰ محاكاة اقتراب موعد حجز
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onTriggerSimulatedConfirmation();
                      playNotificationSound();
                    }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-center transition-colors cursor-pointer"
                  >
                    ✨ محاكاة تأكيد حجز من صالون
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
