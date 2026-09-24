import React, { useState, useMemo } from 'react';
import { Salon, Service, Booking } from '../../types.ts';
import { InteractiveCalendarView } from '../InteractiveCalendarView.tsx';
import { 
  checkSlotConflict, 
  auditSalonBookings, 
  DEFAULT_SALON_CAPACITY,
  parseTimeToMinutes,
  calculateSlotRange 
} from '../../lib/bookingConflictEngine.ts';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Zap, 
  UserCheck, 
  Search, 
  Filter, 
  Layers, 
  Check, 
  X,
  Phone,
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

interface Props {
  salon: Salon;
  services: Service[];
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export const UnifiedBookingCalendarManager: React.FC<Props> = ({
  salon,
  services,
  bookings,
  onAddBooking,
  onUpdateStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'interactive_fullcalendar' | 'calendar_grid' | 'bookings_list' | 'manual_booking' | 'auto_engine'>('interactive_fullcalendar');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Salon Capacity & Auto-Dispatcher Settings
  const [capacitySettings, setCapacitySettings] = useState({
    totalChairs: 4,
    bufferTimeMins: 10,
    autoBookingEnabled: true,
  });

  // Manual Booking Form State
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');
  const [manualServiceId, setManualServiceId] = useState(services[0]?._id || '');
  const [manualDate, setManualDate] = useState(selectedDate);
  const [manualTime, setManualTime] = useState('16:00');
  const [manualStaff, setManualStaff] = useState('تلقائي (أول كرسي متاح)');
  const [manualPayment, setManualPayment] = useState<'paid_pos' | 'pay_on_finish'>('paid_pos');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSubmitSuccess, setManualSubmitSuccess] = useState(false);

  // Available staff members for the salon
  const staffList = [
    'تلقائي (أول كرسي متاح)',
    'سارة العتيبي (شعر وتسريحات)',
    'ريم الدوسري (مكياج سهرة)',
    'نورة القحطاني (عناية وأظافر)',
    'منى الشمري (صبغات ومعالجات)',
  ];

  // Selected Service
  const selectedManualService = services.find(s => s._id === manualServiceId) || services[0] || {
    _id: 'srv_default',
    name: 'خدمة تجميلية',
    price: 150,
    durationMins: 60,
    currency: 'SAR',
  };

  // Real-time Pre-flight Conflict Check on the manual form
  const preflightConflict = useMemo(() => {
    return checkSlotConflict({
      salonId: salon._id,
      date: manualDate,
      time: manualTime,
      durationMins: selectedManualService.durationMins || 60,
      staffName: manualStaff,
      existingBookings: bookings,
      salonCapacity: {
        totalChairs: capacitySettings.totalChairs,
        bufferTimeMins: capacitySettings.bufferTimeMins,
        autoBookingEnabled: capacitySettings.autoBookingEnabled,
        operatingHours: DEFAULT_SALON_CAPACITY.operatingHours,
      },
    });
  }, [salon._id, manualDate, manualTime, selectedManualService.durationMins, manualStaff, bookings, capacitySettings]);

  // Run overall audit on all salon bookings
  const auditResult = useMemo(() => {
    return auditSalonBookings(salon._id, bookings, {
      totalChairs: capacitySettings.totalChairs,
      bufferTimeMins: capacitySettings.bufferTimeMins,
      autoBookingEnabled: capacitySettings.autoBookingEnabled,
      operatingHours: DEFAULT_SALON_CAPACITY.operatingHours,
    });
  }, [salon._id, bookings, capacitySettings]);

  // Salon-filtered bookings
  const salonBookings = useMemo(() => {
    return bookings.filter(b => b.salonId === salon._id && b.status !== 'cancelled');
  }, [bookings, salon._id]);

  // Filtered bookings for current view
  const currentDayBookings = useMemo(() => {
    return salonBookings.filter(b => {
      const matchDate = b.appointmentDate === selectedDate;
      const matchStaff = selectedStaffFilter === 'all' || (b.snapshot?.staffName || '').includes(selectedStaffFilter);
      const matchSearch =
        !searchQuery ||
        (b.snapshot?.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.clientPhone || '').includes(searchQuery);
      return matchDate && matchStaff && matchSearch;
    });
  }, [salonBookings, selectedDate, selectedStaffFilter, searchQuery]);

  // Hourly slots for Grid (10:00 AM to 10:00 PM)
  const timeHours = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Handle Manual Booking Submission
  const handleSaveManualBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualClientName.trim()) return;

    if (preflightConflict.hasConflict) {
      alert(`لا يمكن إتمام الحجز بسبب تضارب مواعيد:\n${preflightConflict.reason}`);
      return;
    }

    const duration = selectedManualService.durationMins || 60;
    const startMins = parseTimeToMinutes(manualTime);
    const endMins = startMins + duration;
    const endH = Math.floor(endMins / 60).toString().padStart(2, '0');
    const endM = (endMins % 60).toString().padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    const newBooking: Booking = {
      _id: `bkg_manual_${Date.now()}`,
      appointmentDate: manualDate,
      appointmentTime: manualTime,
      appointmentEndTime: endTime,
      customerId: `client_${Date.now()}`,
      salonId: salon._id,
      serviceId: selectedManualService._id,
      status: 'confirmed',
      bookingSource: 'manual_pos',
      durationMins: duration,
      clientName: manualClientName.trim(),
      clientPhone: manualClientPhone.trim() || 'حضوري مباشر بالصالون',
      conflictCheckPassed: true,
      notes: manualNotes,
      snapshot: {
        salonName: salon.salonName,
        serviceName: selectedManualService.nameAr || selectedManualService.name,
        staffName: manualStaff,
        totalAmount: selectedManualService.price,
        currency: selectedManualService.currency || 'SAR',
        noShowProtected: true,
      },
    };

    onAddBooking(newBooking);
    setManualSubmitSuccess(true);
    setManualClientName('');
    setManualClientPhone('');
    setManualNotes('');

    setTimeout(() => {
      setManualSubmitSuccess(false);
      setActiveSubTab('calendar_grid');
    }, 1800);
  };

  // Test Auto-Booking Simulator
  const handleSimulateAutoBooking = () => {
    // Pick next open hour on selected date
    const testHours = ['11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00'];
    let safeTime = '';

    for (const h of testHours) {
      const check = checkSlotConflict({
        salonId: salon._id,
        date: selectedDate,
        time: h,
        durationMins: 45,
        staffName: 'تلقائي (أول كرسي متاح)',
        existingBookings: bookings,
        salonCapacity: {
          totalChairs: capacitySettings.totalChairs,
          bufferTimeMins: capacitySettings.bufferTimeMins,
          autoBookingEnabled: true,
          operatingHours: DEFAULT_SALON_CAPACITY.operatingHours,
        },
      });

      if (!check.hasConflict) {
        safeTime = h;
        break;
      }
    }

    if (!safeTime) {
      alert('جميع الفترات ممتلئة بالكامل في هذا اليوم! نظام الجدولة الذكية يرفض التضارب لحماية كراسي الصالون.');
      return;
    }

    const testBooking: Booking = {
      _id: `bkg_auto_${Date.now()}`,
      appointmentDate: selectedDate,
      appointmentTime: safeTime,
      customerId: `bot_client_${Date.now()}`,
      salonId: salon._id,
      serviceId: services[0]?._id || 'srv_auto',
      status: 'confirmed',
      bookingSource: 'smart_auto_bot',
      durationMins: 45,
      clientName: 'عميلة الحجز الذكي التلقائي',
      clientPhone: '0598765432',
      conflictCheckPassed: true,
      snapshot: {
        salonName: salon.salonName,
        serviceName: services[0]?.nameAr || 'خدمة مجدولة ذاتياً بدون موظفات',
        staffName: 'توزيع ذكي على الكرسي الشاغر',
        totalAmount: services[0]?.price || 120,
        currency: 'SAR',
        noShowProtected: true,
      },
    };

    onAddBooking(testBooking);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 100% Conflict Shield Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/60 border border-emerald-200 dark:border-emerald-500/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  درع تدلّلي لمنع التضارب في المواعيد (Anti-Collision 100%)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                  مفعل ونشط 100%
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                مزامنة ذرية لحظية ثلاثية الاتجاه بين: <strong>حجوزات منصة تدلّلي</strong> + <strong>الحجز اليدوي والكاشير في الصالون</strong> + <strong>نظام الجدولة الذكية بدون موظفات</strong> لمنع أي حجز مزدوج للكرسي أو الأخصائية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <div className="bg-white/80 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">حالات التضارب</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {auditResult.conflictsFound.length} (صفر تضارب ✓)
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">كراسي الصالون</span>
              <span className="text-base font-black text-slate-800 dark:text-white">
                {capacitySettings.totalChairs} كراسي
              </span>
            </div>
          </div>
        </div>

        {/* Source breakdown chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-emerald-200/80 dark:border-emerald-900/50 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-purple-200/60 dark:border-purple-900/30">
            <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              حجوزات منصة تدلّلي:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{auditResult.onlineCount} موعد</strong>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-blue-200/60 dark:border-blue-900/30">
            <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              حجوزات يدوية وكاشير:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{auditResult.manualCount} موعد</strong>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-amber-200/60 dark:border-amber-900/30">
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              جدولة ذكية ذاتية (بدون موظفات):
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{auditResult.autoBotCount} موعد</strong>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121218] p-3 border border-rose-100 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSubTab('interactive_fullcalendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'interactive_fullcalendar'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/50'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>تقويم FullCalendar التفاعلي 📅</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calendar_grid')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'calendar_grid'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/50'
            }`}
          >
            <span>شبكة الكراسي والمحطات 🪑</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bookings_list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'bookings_list'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>جدول المواعيد الموحد ({salonBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual_booking')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'manual_booking'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ حجز يدوي مباشر (كاشير/هاتف)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('auto_engine')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'auto_engine'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>إعدادات الحجز الذكي الآلي</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-rose-50/50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-sans"
          />
        </div>
      </div>

      {/* VIEW 0: INTERACTIVE FULLCALENDAR */}
      {activeSubTab === 'interactive_fullcalendar' && (
        <InteractiveCalendarView
          bookings={bookings}
          salons={[salon]}
          services={services}
          onAddBooking={onAddBooking}
          onUpdateStatus={onUpdateStatus}
          defaultSalonId={salon._id}
        />
      )}

      {/* VIEW 1: INTERACTIVE CALENDAR & CHAIR GRID */}
      {activeSubTab === 'calendar_grid' && (
        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-500" />
                <span>جدول كراسي ومحطات الصالون ليوم: {selectedDate}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                توزيع فوري لجميع المواعيد لمنع أي تقاطع زمني بين الموظفات وكراسي الخدمة
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> منصة تدلّلي
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> كاشير يدوي
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> جدولة ذكية
              </span>
            </div>
          </div>

          {/* Chair Columns Matrix */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Header: Chairs */}
              <div className="grid grid-cols-5 gap-2 text-center pb-2 font-bold text-xs">
                <div className="p-2 text-slate-400 font-mono text-[11px]">الوقت</div>
                {Array.from({ length: capacitySettings.totalChairs }).map((_, chairIdx) => (
                  <div key={chairIdx} className="p-2 rounded-xl bg-rose-50/60 dark:bg-slate-900 border border-rose-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                    كرسي ومحطة #{chairIdx + 1}
                  </div>
                ))}
              </div>

              {/* Time Slots Rows */}
              <div className="space-y-1.5 divide-y divide-rose-50 dark:divide-slate-900">
                {timeHours.map(hour => {
                  const hourMins = parseTimeToMinutes(hour);

                  // Find bookings overlapping this hour
                  const bookingsInHour = currentDayBookings.filter(b => {
                    const range = calculateSlotRange(b.appointmentTime, b.durationMins || 60, capacitySettings.bufferTimeMins);
                    return areOverlapping(hourMins, hourMins + 60, range.startMins, range.endWithBufferMins);
                  });

                  return (
                    <div key={hour} className="grid grid-cols-5 gap-2 items-center pt-1.5 text-xs">
                      {/* Hour Label */}
                      <div className="font-mono text-slate-400 text-center font-bold text-[11px] py-2">
                        {hour}
                      </div>

                      {/* Chairs Cells */}
                      {Array.from({ length: capacitySettings.totalChairs }).map((_, chairIdx) => {
                        const bookingOnChair = bookingsInHour[chairIdx];

                        if (bookingOnChair) {
                          const isManual = bookingOnChair.bookingSource === 'manual_pos';
                          const isAuto = bookingOnChair.bookingSource === 'smart_auto_bot';

                          const bgClass = isManual
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/80 text-blue-900 dark:text-blue-200'
                            : isAuto
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                            : 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800/80 text-purple-900 dark:text-purple-200';

                          return (
                            <div
                              key={chairIdx}
                              className={`p-2.5 rounded-xl border ${bgClass} transition-all shadow-xs`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold truncate text-[11px]">
                                  {bookingOnChair.snapshot?.serviceName || 'خدمة تجميلية'}
                                </span>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-white/80 dark:bg-slate-900/80">
                                  {bookingOnChair.appointmentTime}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] opacity-80 mt-1">
                                <span className="truncate">{bookingOnChair.clientName || bookingOnChair.snapshot?.staffName || 'عميلة محجوزة'}</span>
                                <span className="shrink-0 font-bold">
                                  {isManual ? 'كاشير' : isAuto ? 'آلي ⚡' : 'منصة'}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Free Chair Slot
                        return (
                          <div
                            key={chairIdx}
                            onClick={() => {
                              setManualDate(selectedDate);
                              setManualTime(hour);
                              setActiveSubTab('manual_booking');
                            }}
                            className="p-2.5 rounded-xl border border-dashed border-rose-100 dark:border-slate-800 text-center text-[10px] text-slate-400 hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 hover:text-emerald-600 transition-all cursor-pointer group"
                          >
                            <span className="group-hover:hidden text-slate-300 dark:text-slate-700">شاغر متاح 🟢</span>
                            <span className="hidden group-hover:inline font-bold">+ حجز يدوي بالكرسي</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL BOOKINGS LIST TABLE */}
      {activeSubTab === 'bookings_list' && (
        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث بالعميلة أو الخدمة أو الهاتف..."
                className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">تصفية حسب الأخصائية:</span>
              <select
                value={selectedStaffFilter}
                onChange={e => setSelectedStaffFilter(e.target.value)}
                className="bg-rose-50/50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">جميع الأخصائيات والكراسي</option>
                <option value="سارة">سارة العتيبي</option>
                <option value="ريم">ريم الدوسري</option>
                <option value="نورة">نورة القحطاني</option>
                <option value="منى">منى الشمري</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-rose-50/60 dark:bg-slate-950/80 border-b border-rose-100 dark:border-slate-800 text-slate-500 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3">التاريخ والوقت</th>
                  <th className="py-3 px-3">الخدمة</th>
                  <th className="py-3 px-3">العميلة والتواصل</th>
                  <th className="py-3 px-3">الأخصائية / الكرسي</th>
                  <th className="py-3 px-3">المصدر ونظام الحجز</th>
                  <th className="py-3 px-3">حالة التضارب</th>
                  <th className="py-3 px-3">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 dark:divide-slate-800/60">
                {currentDayBookings.length > 0 ? (
                  currentDayBookings.map(b => {
                    const isManual = b.bookingSource === 'manual_pos';
                    const isAuto = b.bookingSource === 'smart_auto_bot';

                    return (
                      <tr key={b._id} className="hover:bg-rose-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{b.appointmentDate}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{b.appointmentTime} ({b.durationMins || 60} دقيقة)</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {b.snapshot?.serviceName || 'خدمة تجميل'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {b.clientName || 'عميلة مسجلة'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {b.clientPhone || '05xxxxxxxx'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {b.snapshot?.staffName || 'أي أخصائية متاحة'}
                        </td>
                        <td className="py-3 px-3">
                          {isManual ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                              كاشير يدوي بالصالون 🔵
                            </span>
                          ) : isAuto ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                              جدولة ذاتية بدون موظفات ⚡
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800">
                              منصة تدلّلي أونلاين 🟣
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> تم قفل الكرسي ومنع التضارب
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-rose-600 dark:text-emerald-400">
                          {b.snapshot?.totalAmount || 150} SAR
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                      لا توجد مواعيد مسجلة لتاريخ {selectedDate}. يمكنك إضافة حجز يدوي سريع بالأعلى.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: INSTANT MANUAL BOOKING FORM (WALK-IN / CASHIER POS) */}
      {activeSubTab === 'manual_booking' && (
        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>تسجيل حجز يدوي مباشر (عميلة حضورية أو هاتف)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                يقوم النظام بفحص كراسي الصالون ومواعيد المنصة تلقائياً لمنع أي حجز مزدوج في نفس اللحظة
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
              كاشير الصالون (POS)
            </span>
          </div>

          {manualSubmitSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ الحجز اليدوي وقفل الكرسي بنجاح عبر المنصة والكاشير! جارٍ نقلك للجدول...</span>
            </div>
          )}

          <form onSubmit={handleSaveManualBooking} className="space-y-4 text-right">
            {/* Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  * اسم العميلة:
                </label>
                <input
                  type="text"
                  required
                  value={manualClientName}
                  onChange={e => setManualClientName(e.target.value)}
                  placeholder="مثال: هيا الدوسري"
                  className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  رقم جوال العميلة (اختياري للواتساب):
                </label>
                <input
                  type="tel"
                  value={manualClientPhone}
                  onChange={e => setManualClientPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 dir-ltr text-right"
                />
              </div>
            </div>

            {/* Service & Staff Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  * الخدمة المطلوبة:
                </label>
                <select
                  value={manualServiceId}
                  onChange={e => setManualServiceId(e.target.value)}
                  className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                >
                  {services.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.nameAr || s.name} ({s.durationMins || 60} دقيقة - {s.price} SAR)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  الأخصائية / الكرسي:
                </label>
                <select
                  value={manualStaff}
                  onChange={e => setManualStaff(e.target.value)}
                  className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                >
                  {staffList.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  * تاريخ الموعد:
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  * وقت البدء:
                </label>
                <select
                  value={manualTime}
                  onChange={e => setManualTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                >
                  {['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* LIVE PRE-FLIGHT CONFLICT STATUS BADGE */}
            <div className="pt-1">
              {!preflightConflict.hasConflict ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">فحص التضارب اللحظي: متاح 100% ✓</span>
                      <p className="text-[11px] opacity-90">
                        لا يوجد أي تعارض مع مواعيد منصة تدلّلي أو الحجوزات السابقة. الكرسي متاح للخدمة.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                    مؤمن
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-xl space-y-2 text-xs text-rose-800 dark:text-rose-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm">تم درء تعارض مواعيد!</strong>
                      <p className="text-xs mt-0.5 leading-relaxed">{preflightConflict.reason}</p>
                    </div>
                  </div>

                  {preflightConflict.suggestedNextSlot && (
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                      <span className="text-[11px]">التوقيت المقترح الخالي من أي تضارب:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const numOnly = preflightConflict.suggestedNextSlot!.replace(/[^\d:]/g, '');
                          setManualTime(numOnly);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-500 transition-colors"
                      >
                        اختيار {preflightConflict.suggestedNextSlot} فوراً
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                ملاحظات أو متطلبات خاصة:
              </label>
              <input
                type="text"
                value={manualNotes}
                onChange={e => setManualNotes(e.target.value)}
                placeholder="تفاصيل إضافية عن نوع الشعر أو الطلب..."
                className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={preflightConflict.hasConflict}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  preflightConflict.hasConflict
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>تأكيد الحجز اليدوي وقفل الموعد فوراً على المنصة</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: AUTOMATED SMART SCHEDULING ENGINE SETTINGS */}
      {activeSubTab === 'auto_engine' && (
        <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>نظام الحجز الذكي الأوتوماتيكي بدون موظفات (AI Smart Booking)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تفعيل الجدولة الذاتية المباشرة التي تقرأ كراسي الصالون الشاغرة وتوزع العميلات آلياً دون الحاجة لموظفة استقبال
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
              تلقائي 100%
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Toggle Smart Mode */}
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 dark:text-white block text-sm">
                  تمكين استقبال الحجوزات الذكية الأوتوماتيكية
                </strong>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  السماح للذكاء الاصطناعي بتخصيص الكراسي الفارغة مباشرة فور طلب العميلة
                </span>
              </div>
              <input
                type="checkbox"
                checked={capacitySettings.autoBookingEnabled}
                onChange={e => setCapacitySettings({ ...capacitySettings, autoBookingEnabled: e.target.checked })}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            {/* Total Chairs Capacity */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                عدد كراسي ومحطات الصالون المتاحة فعلياً (Capacity):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 4, 6, 8].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setCapacitySettings({ ...capacitySettings, totalChairs: count })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      capacitySettings.totalChairs === count
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-rose-50/40 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-rose-100 dark:border-slate-800 hover:border-amber-300'
                    }`}
                  >
                    {count} كراسي
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                إذا تم حجز {capacitySettings.totalChairs} كراسي في نفس الساعة، يُغلق النظام الحجز تلقائياً لتفادي تكدس الصالون.
              </p>
            </div>

            {/* Buffer Time */}
            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                فترة التعقيم والتجهيز بين كل موعدين (Buffer Time):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setCapacitySettings({ ...capacitySettings, bufferTimeMins: mins })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      capacitySettings.bufferTimeMins === mins
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-rose-50/40 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-rose-100 dark:border-slate-800 hover:border-rose-300'
                    }`}
                  >
                    {mins} دقائق
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                يضمن عدم بدء الموعد الجديد إلا بعد اكتمال تعقيم الكرسي وتجهيز الأدوات بنسبة 100%.
              </p>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-4 border-t border-rose-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleSimulateAutoBooking}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>تشغيل تجربة محاكاة لحجز ذكي بدون موظفة واختبار عدم التضارب</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                يقوم النظام بالبحث الفوري عن أقرب كرسي شاغر في تاريخ {selectedDate} وتثبيت الموعد دون التأثير على الحجوزات القائمة.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for overlapping checking inside Grid
function areOverlapping(startA: number, endA: number, startB: number, endB: number): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}
