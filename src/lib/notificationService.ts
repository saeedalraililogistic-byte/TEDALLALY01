import { Booking, InAppNotification, Salon } from '../types.ts';

const STORAGE_KEY = 'tedallaly_in_app_notifications_v2';
const REMINDED_KEY = 'tedallaly_reminded_booking_ids_v2';

/**
 * Creates an instant notification dispatched to Platform Admin when a new salon/freelancer registers and uploads documents.
 */
export function createSalonRegistrationAdminNotification(salon: Salon): InAppNotification {
  const isFreelance = salon.providerType === 'freelancer';
  const docsCount = salon.documents?.length || 0;
  const docNames = salon.documents?.map(d => d.title).join('، ') || 'المستندات الرسمية';

  return {
    id: `notif_admin_new_salon_${salon._id}_${Date.now()}`,
    salonId: salon._id,
    type: 'salon_registered_pending',
    recipientRole: 'admin',
    title: isFreelance 
      ? `📋 خبيرة مستقلة جديدة بانتظار الاعتماد والمراجعة: ${salon.salonName}`
      : `📋 صالون جديد رفع أوراقه وبانتظار الاعتماد والمراجعة: ${salon.salonName}`,
    message: `قام ${isFreelance ? 'الخبيرة المستقلة' : 'صالون'} "${salon.salonName}" في ${salon.city} برفع مستنداته القانونية (${docNames}). يتطلب طلب الانضمام مراجعة وتدقيق المستندات والموافقة عليها.`,
    timestamp: Date.now(),
    read: false,
    urgency: 'high',
    salonSnapshot: {
      salonName: salon.salonName,
      providerType: salon.providerType,
      city: salon.city,
      documentTitle: docNames,
      status: 'pending_verification'
    }
  };
}

/**
 * Creates an instant notification to Admin when an existing salon re-uploads/updates documents for review.
 */
export function createSalonDocumentsReuploadedAdminNotification(salon: Salon, updatedDocTitle?: string): InAppNotification {
  return {
    id: `notif_admin_docs_update_${salon._id}_${Date.now()}`,
    salonId: salon._id,
    type: 'documents_uploaded',
    recipientRole: 'admin',
    title: `🔄 تحديث مستندات بانتظار التدقيق: صالون ${salon.salonName}`,
    message: `قام صالون "${salon.salonName}" برفع/تحديث ${updatedDocTitle || 'المستندات القانونية'} لإعادة التدقيق ورفع التعليق. يرجى المراجعة والاعتماد.`,
    timestamp: Date.now(),
    read: false,
    urgency: 'high',
    salonSnapshot: {
      salonName: salon.salonName,
      providerType: salon.providerType,
      city: salon.city,
      documentTitle: updatedDocTitle,
      status: 'pending_verification'
    }
  };
}

/**
 * Creates a notification when an individual legal document is approved.
 */
export function createDocumentApprovedNotification(salon: Salon, docTitle: string): InAppNotification {
  return {
    id: `notif_doc_appr_${salon._id}_${Date.now()}`,
    salonId: salon._id,
    type: 'document_approved',
    recipientRole: salon.providerType === 'freelancer' ? 'freelancer' : 'salon_owner',
    recipientId: salon.ownerId || salon._id,
    title: `✓ تم اعتماد وثيقة: ${docTitle}`,
    message: `تم تدقيق واعتماد وثيقة "${docTitle}" لصالون ${salon.salonName} بنجاح من قبل إدارة منصة تدلّلي.`,
    timestamp: Date.now(),
    read: false,
    urgency: 'normal',
    salonSnapshot: {
      salonName: salon.salonName,
      providerType: salon.providerType,
      documentTitle: docTitle,
      status: 'approved'
    }
  };
}

/**
 * Creates an instant notification dispatched to the Salon Owner when a client books an appointment.
 */
export function createNewBookingSalonNotification(booking: Booking, salon: Salon): InAppNotification {
  const serviceName = booking.snapshot?.serviceName || 'خدمة تجميلية';
  const clientName = booking.clientName || 'عميلة جديدة';
  const totalAmount = booking.snapshot?.totalAmount || 0;

  return {
    id: `notif_salon_bkg_${booking._id}_${Date.now()}`,
    salonId: salon._id,
    bookingId: booking._id,
    type: 'new_booking_received',
    recipientRole: salon.providerType === 'freelancer' ? 'freelancer' : 'salon_owner',
    recipientId: salon.ownerId || salon._id,
    title: `📅 حجز جديد مؤكد في صالونكِ!`,
    message: `تم حجز موعد جديد لخدمة "${serviceName}" من قبل العميلة ${clientName} بتاريخ ${booking.appointmentDate} الساعة ${booking.appointmentTime}. الإجمالي: ${totalAmount} SAR. تم تأمين الكرسي بنجاح ضد أي تضارب.`,
    timestamp: Date.now(),
    read: false,
    urgency: 'high',
    bookingSnapshot: {
      salonName: salon.salonName,
      serviceName,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      status: booking.status,
      totalAmount,
      staffName: booking.snapshot?.staffName,
      clientName
    }
  };
}

/**
 * Creates a real notification when a salon or freelancer profile is approved.
 */
export function createSalonApprovalNotification(salon: Salon): InAppNotification {
  const isFreelance = salon.providerType === 'freelancer';
  const title = isFreelance 
    ? `تم اعتماد ملفكِ كخبيرة تجميل مستقلة بنجاح! 🛡️`
    : `تم اعتماد صالون "${salon.salonName}" رسمياً ✓`;
  
  const message = isFreelance
    ? `تهانينا! تمت مراجعة وثيقة العمل الحر الخاصة بكِ والموافقة على حسابكِ. خدماتكِ التجميلية تظهر الآن لجميع العميلات في ${salon.city} مع إمكانية استقبال الحجوزات والدفع الإلكتروني.`
    : `تهانينا! تمت مراجعة السجلات والتراخيص لـ "${salon.salonName}" بنجاح. ملف الصالون نشط ومعتمد رسمياً في منصة تدلّلي وتستطيع العميلات الحجز فوراً.`;

  return {
    id: `notif_salon_appr_${salon._id}_${Date.now()}`,
    salonId: salon._id,
    type: 'salon_approved',
    recipientRole: isFreelance ? 'freelancer' : 'salon_owner',
    recipientId: salon.ownerId || salon._id,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    urgency: 'high',
    salonSnapshot: {
      salonName: salon.salonName,
      providerType: salon.providerType,
      city: salon.city,
      status: 'verified'
    }
  };
}

/**
 * Creates a real notification when a salon is rejected or suspended with exact reason.
 */
export function createSalonRejectionNotification(salon: Salon, reason: string): InAppNotification {
  const isFreelance = salon.providerType === 'freelancer';
  const title = isFreelance
    ? `تنبيه: مطلوب مراجعة وتصحيح وثيقة العمل الحر ⚠️`
    : `تم تعليق اعتماد صالون "${salon.salonName}" مؤقتاً ⚠️`;

  const message = `نود إفادتكم بقرار إدارة الامتثال بخصوص ${isFreelance ? 'ملف العمل الحر' : 'طلب اعتماد الصالون'}: ${reason}. يرجى الدخول للوحة التحكم ورفع المستندات المطلوبة لإعادة التفعيل.`;

  return {
    id: `notif_salon_rej_${salon._id}_${Date.now()}`,
    salonId: salon._id,
    type: 'salon_rejected',
    recipientRole: isFreelance ? 'freelancer' : 'salon_owner',
    recipientId: salon.ownerId || salon._id,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    urgency: 'high',
    rejectionReason: reason,
    salonSnapshot: {
      salonName: salon.salonName,
      providerType: salon.providerType,
      city: salon.city,
      status: 'suspended'
    }
  };
}

/**
 * Creates a notification when an individual legal document is rejected.
 */
export function createDocumentRejectionNotification(salon: Salon, docTitle: string, reason: string): InAppNotification {
  return {
    id: `notif_doc_rej_${salon._id}_${Date.now()}`,
    salonId: salon._id,
    type: 'document_rejected',
    recipientRole: salon.providerType === 'freelancer' ? 'freelancer' : 'salon_owner',
    recipientId: salon.ownerId || salon._id,
    title: `مطلوب تصحيح مستند: ${docTitle} ⚠️`,
    message: `تم رفض وثيقة "${docTitle}" لصالون ${salon.salonName}. السبب: ${reason}. يرجى إرفاق نسخة سارية ومحدثة من منصة بلدي أو العمل الحر.`,
    timestamp: Date.now(),
    read: false,
    urgency: 'high',
    rejectionReason: reason,
    salonSnapshot: {
      salonName: salon.salonName,
      providerType: salon.providerType,
      documentTitle: docTitle,
      status: 'rejected'
    }
  };
}

/**
 * Parses appointment date and time into a Date object.
 * Format examples: "2026-09-17", "16:00"
 */
export function parseBookingDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return null;
    }
    return new Date(year, month - 1, day, hours, minutes);
  } catch {
    return null;
  }
}

/**
 * Calculates hours and minutes remaining until appointment.
 */
export function getTimeUntilBooking(dateStr: string, timeStr: string): { totalMinutes: number; hours: number; minutes: number; isPast: boolean } {
  const targetDate = parseBookingDateTime(dateStr, timeStr);
  if (!targetDate) {
    return { totalMinutes: 999999, hours: 999, minutes: 0, isPast: false };
  }

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const totalMinutes = Math.round(diffMs / (1000 * 60));

  return {
    totalMinutes,
    hours: Math.floor(Math.abs(totalMinutes) / 60),
    minutes: Math.abs(totalMinutes) % 60,
    isPast: totalMinutes < 0,
  };
}

/**
 * Creates a status change notification triggered by the salon.
 */
export function createStatusChangeNotification(
  booking: Booking,
  newStatus: string,
  oldStatus?: string
): InAppNotification {
  const salonName = booking.snapshot?.salonName || 'الصالون';
  const serviceName = booking.snapshot?.serviceName || 'الخدمة التجميلية';
  const time = booking.appointmentTime;
  const date = booking.appointmentDate;

  let title = 'تحديث حالة الحجز من الصالون 🔔';
  let message = `قام ${salonName} بتحديث حالة موعد "${serviceName}" إلى: ${newStatus}`;
  let urgency: 'high' | 'normal' | 'low' = 'normal';
  let type: InAppNotification['type'] = 'status_change';

  if (newStatus === 'confirmed') {
    type = 'booking_confirmed';
    title = 'تم تأكيد موعدكِ من قبل الصالون! ✨';
    message = `يسعدنا إبلاغكِ بأن ${salonName} قام بتأكيد حجزكِ لخدمة "${serviceName}" بتاريخ ${date} في تمام الساعة ${time}. نتشرف باستقبالكِ.`;
    urgency = 'high';
  } else if (newStatus === 'completed') {
    title = 'تم إتمام زيارتكِ بنجاح 🌸';
    message = `شكراً لزيارتكِ ${salonName} لخدمة "${serviceName}". نتمنى أن تكون تجربتكِ رائعة ومدللة! يمكنكِ الآن تقييم الخدمة.`;
    urgency = 'normal';
  } else if (newStatus === 'cancelled') {
    type = 'booking_cancelled';
    title = 'تم إلغاء الحجز من الصالون ⚠️';
    message = `نعتذر منكِ، قام ${salonName} بإلغاء موعد "${serviceName}" المقرر بتاريخ ${date}. تم إشعار فريق الدعم لإعادة أي مبالغ مدفوعة إن وجدت.`;
    urgency = 'high';
  }

  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    bookingId: booking._id,
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    urgency,
    bookingSnapshot: {
      salonName,
      serviceName,
      appointmentDate: date,
      appointmentTime: time,
      status: newStatus,
      totalAmount: booking.snapshot?.totalAmount,
      staffName: booking.snapshot?.staffName,
      clientName: booking.clientName || 'العميلة الكريمة',
    },
  };
}

/**
 * Creates an approaching appointment reminder notification.
 */
export function createProximityReminderNotification(
  booking: Booking,
  timeRemainingText: string,
  urgency: 'high' | 'normal' = 'high'
): InAppNotification {
  const salonName = booking.snapshot?.salonName || 'الصالون';
  const serviceName = booking.snapshot?.serviceName || 'الخدمة التجميلية';
  const time = booking.appointmentTime;
  const date = booking.appointmentDate;
  const staff = booking.snapshot?.staffName ? `مع الأخصائية ${booking.snapshot.staffName}` : '';

  return {
    id: `notif_reminder_${booking._id}_${Date.now()}`,
    bookingId: booking._id,
    type: 'appointment_reminder',
    title: `تذكير: اقتراب موعد حجزكِ ${urgency === 'high' ? '⏰ (اليوم)' : '📅'}`,
    message: `موعدكِ لخدمة "${serviceName}" لدى ${salonName} ${staff} يقترب! الموعد: ${date} في تمام الساعة ${time} (${timeRemainingText}). نرجو الحضور قبل الموعد بـ 10 دقائق لتجربة مريحة.`,
    timestamp: Date.now(),
    read: false,
    urgency,
    bookingSnapshot: {
      salonName,
      serviceName,
      appointmentDate: date,
      appointmentTime: time,
      status: booking.status,
      totalAmount: booking.snapshot?.totalAmount,
      staffName: booking.snapshot?.staffName,
      clientName: booking.clientName || 'العميلة الكريمة',
    },
  };
}

/**
 * Scans bookings to find appointments that are approaching (e.g. today or within next 24 hours).
 * Returns new reminder notifications to dispatch.
 */
export function checkApproachingBookings(
  bookings: Booking[],
  existingNotifications: InAppNotification[]
): InAppNotification[] {
  const newReminders: InAppNotification[] = [];
  const remindedBookingIds = getRemindedBookingIds();

  const activeBookings = bookings.filter(
    b => b.status === 'confirmed' || b.status === 'payment_pending'
  );

  const todayStr = new Date().toISOString().split('T')[0];

  for (const booking of activeBookings) {
    // If we already sent an appointment reminder for this booking in the current session
    if (remindedBookingIds.has(booking._id)) {
      continue;
    }

    const { totalMinutes, hours, minutes, isPast } = getTimeUntilBooking(
      booking.appointmentDate,
      booking.appointmentTime
    );

    // If appointment is today OR within the next 24 hours (totalMinutes between 0 and 1440)
    const isToday = booking.appointmentDate === todayStr;
    const isWithin24Hours = !isPast && totalMinutes <= 1440;

    if (isToday || isWithin24Hours) {
      let timeRemainingText = '';
      let urgency: 'high' | 'normal' = 'normal';

      if (isPast) {
        // Just started or starting now
        timeRemainingText = 'الموعد الآن أو قيد البدء';
        urgency = 'high';
      } else if (totalMinutes <= 120) {
        // Within 2 hours
        timeRemainingText = `متبقي قرابة ${hours > 0 ? `${hours} ساعة و ` : ''}${minutes} دقيقة`;
        urgency = 'high';
      } else if (isToday) {
        timeRemainingText = `اليوم في تمام الساعة ${booking.appointmentTime}`;
        urgency = 'high';
      } else {
        timeRemainingText = `غداً في تمام الساعة ${booking.appointmentTime}`;
        urgency = 'normal';
      }

      const reminder = createProximityReminderNotification(booking, timeRemainingText, urgency);
      newReminders.push(reminder);
      remindedBookingIds.add(booking._id);
    }
  }

  if (newReminders.length > 0) {
    saveRemindedBookingIds(remindedBookingIds);
  }

  return newReminders;
}

/**
 * Local Storage Persisters
 */
export function getStoredNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse stored notifications:', e);
  }

  // No fake or mock notifications - only real operational notifications created by actions
  return [];
}

export function saveStoredNotifications(notifications: InAppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications to localStorage:', e);
  }
}

function getRemindedBookingIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(REMINDED_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // fallback
  }
  return new Set<string>();
}

function saveRemindedBookingIds(ids: Set<string>): void {
  try {
    sessionStorage.setItem(REMINDED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // fallback
  }
}

/**
 * Plays a pleasant, subtle notification chime using Web Audio API (zero external assets needed).
 */
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Elegant ascending chime: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz)
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(830.61, now + 0.1);
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.2);

    osc2.frequency.setValueAtTime(329.63, now);
    osc2.frequency.exponentialRampToValueAtTime(415.3, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch {
    // Audio may be blocked before first user gesture, fail silently
  }
}
