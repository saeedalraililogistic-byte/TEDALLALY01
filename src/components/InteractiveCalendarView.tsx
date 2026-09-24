import React, { useState, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Booking, Salon, Service } from '../types.ts';
import { 
  checkSlotConflict, 
  parseTimeToMinutes, 
  formatMinutesToTime,
  calculateSlotRange,
  DEFAULT_SALON_CAPACITY,
  auditSalonBookings 
} from '../lib/bookingConflictEngine.ts';
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
  MapPin,
  DollarSign,
  Info,
  CalendarCheck
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  salons: Salon[];
  services: Service[];
  onAddBooking: (booking: Booking) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  defaultSalonId?: string;
}

export const InteractiveCalendarView: React.FC<Props> = ({
  bookings,
  salons,
  services,
  onAddBooking,
  onUpdateStatus,
  defaultSalonId,
}) => {
  const calendarRef = useRef<any>(null);

  // Filters
  const [selectedSalonFilter, setSelectedSalonFilter] = useState<string>(defaultSalonId || 'all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Booking Modal / Detail Popover
  const [activeBookingDetail, setActiveBookingDetail] = useState<Booking | null>(null);

  // New Slot Booking Modal (triggered by clicking any calendar slot)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState<string>('');
  const [slotTime, setSlotTime] = useState<string>('14:00');
  const [slotSalonId, setSlotSalonId] = useState<string>(defaultSalonId || salons[0]?._id || '');
  const [slotServiceId, setSlotServiceId] = useState<string>('');
  const [slotStaffName, setSlotStaffName] = useState<string>('تلقائي (أول كرسي متاح)');
  const [slotClientName, setSlotClientName] = useState<string>('');
  const [slotClientPhone, setSlotClientPhone] = useState<string>('');
  const [slotBookingType, setSlotBookingType] = useState<'manual_pos' | 'smart_auto_bot'>('manual_pos');
  const [slotNotes, setSlotNotes] = useState<string>('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(false);

  // Filtered Salons & Services
  const activeSalon = salons.find(s => s._id === (selectedSalonFilter === 'all' ? slotSalonId : selectedSalonFilter)) || salons[0];
  const salonServices = useMemo(() => {
    const targetSalonId = slotSalonId || activeSalon?._id;
    return services.filter(s => s.salonId === targetSalonId);
  }, [services, slotSalonId, activeSalon]);

  // Set default service when services change
  const selectedService = salonServices.find(s => s._id === slotServiceId) || salonServices[0] || {
    _id: 'srv_def',
    name: 'خدمة تجميلية',
    nameAr: 'خدمة تجميلية',
    price: 150,
    durationMins: 60,
    currency: 'SAR',
    salonId: activeSalon?._id || '',
  };

  // Staff options
  const staffList = [
    'تلقائي (أول كرسي متاح)',
    'سارة العتيبي (شعر وتسريحات)',
    'ريم الدوسري (مكياج سهرة)',
    'نورة القحطاني (عناية وأظافر)',
    'منى الشمري (صبغات ومعالجات)',
  ];

  // Real-time conflict check for the selected slot in the modal
  const conflictEvaluation = useMemo(() => {
    if (!slotDate || !slotTime) return { hasConflict: false };
    return checkSlotConflict({
      salonId: slotSalonId || activeSalon?._id || '',
      date: slotDate,
      time: slotTime,
      durationMins: selectedService.durationMins || 60,
      staffName: slotStaffName,
      existingBookings: bookings,
    });
  }, [slotSalonId, activeSalon, slotDate, slotTime, selectedService.durationMins, slotStaffName, bookings]);

  // Overall audit for current salon or all bookings
  const currentAudit = useMemo(() => {
    const targetSalonId = selectedSalonFilter !== 'all' ? selectedSalonFilter : (salons[0]?._id || '');
    return auditSalonBookings(targetSalonId, bookings);
  }, [selectedSalonFilter, salons, bookings]);

  // Transform bookings to FullCalendar events
  const calendarEvents = useMemo(() => {
    return bookings
      .filter(b => {
        if (b.status === 'cancelled') return false;
        if (selectedSalonFilter !== 'all' && b.salonId !== selectedSalonFilter) return false;
        if (sourceFilter !== 'all' && (b.bookingSource || 'online_platform') !== sourceFilter) return false;
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchService = (b.snapshot?.serviceName || '').toLowerCase().includes(q);
          const matchClient = (b.clientName || '').toLowerCase().includes(q);
          const matchStaff = (b.snapshot?.staffName || '').toLowerCase().includes(q);
          const matchSalon = (b.snapshot?.salonName || '').toLowerCase().includes(q);
          if (!matchService && !matchClient && !matchStaff && !matchSalon) return false;
        }
        return true;
      })
      .map(b => {
        const source = b.bookingSource || 'online_platform';
        const startMins = parseTimeToMinutes(b.appointmentTime);
        const duration = b.durationMins || 60;
        const endMins = startMins + duration;
        
        const startH = Math.floor(startMins / 60).toString().padStart(2, '0');
        const startM = (startMins % 60).toString().padStart(2, '0');
        const endH = Math.floor(endMins / 60).toString().padStart(2, '0');
        const endM = (endMins % 60).toString().padStart(2, '0');

        const startISO = `${b.appointmentDate}T${startH}:${startM}:00`;
        const endISO = `${b.appointmentDate}T${endH}:${endM}:00`;

        // Color coding by source
        let bgColor = '#8b5cf6'; // Online: Purple
        let borderColor = '#7c3aed';
        let textColor = '#ffffff';

        if (source === 'manual_pos') {
          bgColor = '#2563eb'; // Manual POS: Blue
          borderColor = '#1d4ed8';
        } else if (source === 'smart_auto_bot') {
          bgColor = '#d97706'; // Smart Auto: Amber
          borderColor = '#b45309';
        }

        return {
          id: b._id,
          title: `${b.snapshot?.serviceName || 'خدمة'} - ${b.clientName || b.snapshot?.staffName || 'عميلة'}`,
          start: startISO,
          end: endISO,
          backgroundColor: bgColor,
          borderColor: borderColor,
          textColor: textColor,
          extendedProps: {
            booking: b,
            source,
            serviceName: b.snapshot?.serviceName,
            salonName: b.snapshot?.salonName,
            staffName: b.snapshot?.staffName,
            clientName: b.clientName,
            clientPhone: b.clientPhone,
            totalAmount: b.snapshot?.totalAmount,
            durationMins: duration,
            timeLabel: `${b.appointmentTime} (${duration} د)`,
          },
        };
      });
  }, [bookings, selectedSalonFilter, sourceFilter, statusFilter, searchQuery]);

  // Handle clicking empty date or slot in FullCalendar
  const handleDateSelect = (selectInfo: { startStr: string; allDay: boolean }) => {
    let dateStr = selectInfo.startStr.split('T')[0];
    let timeStr = '14:00';

    if (selectInfo.startStr.includes('T')) {
      const parts = selectInfo.startStr.split('T')[1].split(':');
      timeStr = `${parts[0]}:${parts[1]}`;
    }

    setSlotDate(dateStr);
    setSlotTime(timeStr);
    setSlotSalonId(selectedSalonFilter !== 'all' ? selectedSalonFilter : salons[0]?._id || '');
    if (salonServices[0]) {
      setSlotServiceId(salonServices[0]._id);
    }
    setIsSlotModalOpen(true);
  };

  // Handle clicking an existing booking event
  const handleEventClick = (clickInfo: any) => {
    const booking = clickInfo.event.extendedProps.booking as Booking;
    if (booking) {
      setActiveBookingDetail(booking);
    }
  };

  // Submit manual or auto booking
  const handleSaveSlotBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (conflictEvaluation.hasConflict) {
      alert(`لا يمكن إتمام الحجز بسبب تضارب مواعيد:\n${conflictEvaluation.reason}`);
      return;
    }

    const duration = selectedService.durationMins || 60;
    const startMins = parseTimeToMinutes(slotTime);
    const endMins = startMins + duration;
    const endH = Math.floor(endMins / 60).toString().padStart(2, '0');
    const endM = (endMins % 60).toString().padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    const newBooking: Booking = {
      _id: `bkg_${slotBookingType}_${Date.now()}`,
      appointmentDate: slotDate,
      appointmentTime: slotTime,
      appointmentEndTime: endTime,
      customerId: `client_${Date.now()}`,
      salonId: slotSalonId || activeSalon?._id || '',
      serviceId: selectedService._id,
      status: 'confirmed',
      bookingSource: slotBookingType,
      durationMins: duration,
      clientName: slotClientName.trim() || (slotBookingType === 'manual_pos' ? 'عميلة كاشير صالون' : 'حجز ذكي آلي'),
      clientPhone: slotClientPhone.trim() || '0500000000',
      conflictCheckPassed: true,
      notes: slotNotes,
      snapshot: {
        salonName: activeSalon?.salonName || 'الصالون',
        serviceName: selectedService.nameAr || selectedService.name,
        staffName: slotStaffName,
        totalAmount: selectedService.price,
        currency: selectedService.currency || 'SAR',
        noShowProtected: true,
      },
    };

    onAddBooking(newBooking);
    setBookingSuccessMsg(true);

    setTimeout(() => {
      setBookingSuccessMsg(false);
      setIsSlotModalOpen(false);
      setSlotClientName('');
      setSlotClientPhone('');
      setSlotNotes('');
    }, 1200);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 100% Conflict Shield Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/60 border border-emerald-200 dark:border-emerald-500/40 rounded-2xl p-4.5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  تقويم المواعيد التفاعلي الموحد (FullCalendar Anti-Collision 100%)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                  مؤمن لحظياً
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                عرض بصري متقدم للمواعيد مع تحقق فوري من توفر الخدمة والكراسي والأخصائيات لمنع أي تعارض بين الحجوزات اليدوية والآلية وأونلاين.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setSlotDate(new Date().toISOString().split('T')[0]);
                setSlotTime('14:00');
                setIsSlotModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>فحص توفر وحجز موعد جديد</span>
            </button>
          </div>
        </div>

        {/* Legend / Source Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3.5 mt-3.5 border-t border-emerald-200/70 dark:border-emerald-900/50 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-purple-200/60 dark:border-purple-900/30">
            <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              حجوزات منصة تدلّلي:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{currentAudit.onlineCount} موعد</strong>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-blue-200/60 dark:border-blue-900/30">
            <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              حجوزات كاشير يدوي:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{currentAudit.manualCount} موعد</strong>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-amber-200/60 dark:border-amber-900/30">
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              حجوزات ذكية ذاتية:
            </span>
            <strong className="text-slate-900 dark:text-white font-mono">{currentAudit.autoBotCount} موعد</strong>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Salon Selector (if multiple) */}
          {salons.length > 1 && !defaultSalonId && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">الصالون:</span>
              <select
                value={selectedSalonFilter}
                onChange={e => setSelectedSalonFilter(e.target.value)}
                className="bg-rose-50/50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="all">جميع الصالونات ({salons.length})</option>
                {salons.map(s => (
                  <option key={s._id} value={s._id}>{s.salonName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Source Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">المصدر:</span>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-rose-50/50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">جميع المصادر</option>
              <option value="online_platform">منصة تدلّلي (أونلاين)</option>
              <option value="manual_pos">كاشير يدوي بالفرع</option>
              <option value="smart_auto_bot">حجز ذكي آلي</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">الحالة:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-rose-50/50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="confirmed">مؤكد</option>
              <option value="completed">مكتمل</option>
              <option value="payment_pending">بانتظار الدفع</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالعميلة أو الخدمة..."
            className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* FullCalendar Interactive Container */}
      <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="fullcalendar-custom-wrapper" dir="rtl">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              right: 'prev,next today',
              center: 'title',
              left: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: 'اليوم',
              month: 'شهري',
              week: 'أسبوعي',
              day: 'يومي',
            }}
            locale="ar"
            direction="rtl"
            slotMinTime="09:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            slotLabelInterval="01:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
              hour12: true,
            }}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            events={calendarEvents}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
              hour12: true,
            }}
            height="auto"
            expandRows={true}
            nowIndicator={true}
          />
        </div>
      </div>

      {/* MODAL 1: QUICK BOOKING & ANTI-CONFLICT VERIFICATION (Triggered by Slot Click) */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#15151e] border border-rose-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 text-right max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800/80 pb-4">
              <button
                type="button"
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-rose-600" />
                  <span>حجز موعد وفحص توفر الخدمة الفوري</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  فحص تلقائي لمنع أي تضارب مع كراسي الصالون ومواعيد المنصة
                </p>
              </div>
            </div>

            {bookingSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم تأكيد الحجز وقفل الموعد في التقويم ومنع التضارب بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSaveSlotBooking} className="space-y-4">
              {/* Booking Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-rose-50/50 dark:bg-slate-950 rounded-xl border border-rose-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSlotBookingType('manual_pos')}
                  className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    slotBookingType === 'manual_pos'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  حجز كاشير يدوي (POS / هاتف) 🔵
                </button>
                <button
                  type="button"
                  onClick={() => setSlotBookingType('smart_auto_bot')}
                  className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    slotBookingType === 'smart_auto_bot'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  جدولة ذاتية ذكية ⚡
                </button>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    * اسم العميلة:
                  </label>
                  <input
                    type="text"
                    required
                    value={slotClientName}
                    onChange={e => setSlotClientName(e.target.value)}
                    placeholder="مثال: ريم العبدالله"
                    className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    رقم الجوال للتواصل:
                  </label>
                  <input
                    type="tel"
                    value={slotClientPhone}
                    onChange={e => setSlotClientPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Service & Salon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    * الخدمة المطلوبة:
                  </label>
                  <select
                    value={slotServiceId}
                    onChange={e => setSlotServiceId(e.target.value)}
                    className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  >
                    {salonServices.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.nameAr || s.name} ({s.durationMins || 60} دقيقة - {s.price} SAR)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    الأخصائية / محطة العمل:
                  </label>
                  <select
                    value={slotStaffName}
                    onChange={e => setSlotStaffName(e.target.value)}
                    className="w-full bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  >
                    {staffList.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    * التاريخ المحدد:
                  </label>
                  <input
                    type="date"
                    required
                    value={slotDate}
                    onChange={e => setSlotDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    * وقت البدء:
                  </label>
                  <select
                    value={slotTime}
                    onChange={e => setSlotTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  >
                    {['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LIVE CONFLICT ENGINE RESULT BADGE */}
              <div className="pt-1">
                {!conflictEvaluation.hasConflict ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">متاح 100% بدون أي تضارب ✓</span>
                        <p className="text-[11px] opacity-90">
                          الكرسي والأخصائية جاهزان في توقيت {slotTime} دون تعارض مع مواعيد المنصة أو الكاشير.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                      مؤمن
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-xl space-y-2 text-xs text-rose-800 dark:text-rose-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-sm">تم درء تضارب المواعيد!</strong>
                        <p className="text-xs mt-0.5 leading-relaxed">{conflictEvaluation.reason}</p>
                      </div>
                    </div>

                    {conflictEvaluation.suggestedNextSlot && (
                      <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                        <span className="text-[11px]">الوقت المقترح الخالي من التضارب:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const numOnly = conflictEvaluation.suggestedNextSlot!.replace(/[^\d:]/g, '');
                            setSlotTime(numOnly);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-500 transition-colors cursor-pointer"
                        >
                          اختيار {conflictEvaluation.suggestedNextSlot} فوراً
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={conflictEvaluation.hasConflict}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    conflictEvaluation.hasConflict
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : slotBookingType === 'manual_pos'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 cursor-pointer'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/25 cursor-pointer'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد الحجز وتثبيت الموعد في التقويم</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-rose-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-slate-900 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EVENT DETAILS POPOVER */}
      {activeBookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#15151e] border border-rose-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800/80 pb-3">
              <button
                type="button"
                onClick={() => setActiveBookingDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  activeBookingDetail.bookingSource === 'manual_pos'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200'
                    : activeBookingDetail.bookingSource === 'smart_auto_bot'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200'
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200'
                }`}>
                  {activeBookingDetail.bookingSource === 'manual_pos' ? 'كاشير يدوي بالصالون' : activeBookingDetail.bookingSource === 'smart_auto_bot' ? 'حجز ذكي آلي' : 'منصة تدلّلي أونلاين'}
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  تفاصيل الموعد
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50/40 dark:bg-slate-950 rounded-xl border border-rose-100 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">الخدمة والتوقيت</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {activeBookingDetail.snapshot?.serviceName || 'خدمة تجميلية'}
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mt-1.5 font-mono text-[11px]">
                  <span>📅 {activeBookingDetail.appointmentDate}</span>
                  <span>⏰ {activeBookingDetail.appointmentTime} ({activeBookingDetail.durationMins || 60} دقيقة)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-rose-50/30 dark:bg-slate-950 rounded-xl border border-rose-100 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">العميلة</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeBookingDetail.clientName || 'عميلة المنصة'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {activeBookingDetail.clientPhone || '05xxxxxxxx'}
                  </div>
                </div>

                <div className="p-3 bg-rose-50/30 dark:bg-slate-950 rounded-xl border border-rose-100 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">الأخصائية / الكرسي</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeBookingDetail.snapshot?.staffName || 'أي أخصائية متاحة'}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> محجوز ومؤمن
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">درع منع التضارب 100%</span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      تم قفل هذا الوقت ضد أي حجز مزدوج في قاعدة البيانات الموحدة
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">المبلغ</span>
                  <span className="font-bold text-rose-600 dark:text-emerald-400">
                    {activeBookingDetail.snapshot?.totalAmount || 150} SAR
                  </span>
                </div>
              </div>

              {/* Status change actions */}
              <div className="pt-2 flex items-center gap-2">
                {onUpdateStatus && activeBookingDetail.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus(activeBookingDetail._id, 'completed');
                      setActiveBookingDetail(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    إتمام الموعد بنجاح ✓
                  </button>
                )}
                {onUpdateStatus && activeBookingDetail.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus(activeBookingDetail._id, 'cancelled');
                      setActiveBookingDetail(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    إلغاء الموعد
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
