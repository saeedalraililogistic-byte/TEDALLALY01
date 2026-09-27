import { Booking } from '../types.ts';

/**
 * Clean string for CSV cell, escaping quotes and wrapping in quotes if needed
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // Replace double quotes with pair of double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Translates booking status to clean Arabic label
 */
function translateStatus(status?: string): string {
  switch (status) {
    case 'completed':
      return 'مكتمل';
    case 'confirmed':
      return 'مؤكد';
    case 'cancelled':
      return 'ملغي';
    case 'payment_pending':
      return 'بانتظار الدفع';
    case 'draft':
      return 'مسودة';
    case 'in_progress':
      return 'قيد التنفيذ';
    default:
      return status || 'مؤكد';
  }
}

/**
 * Translates booking source to clean Arabic label
 */
function translateBookingSource(source?: string): string {
  switch (source) {
    case 'manual_pos':
      return 'كاشير يدوي وحضوري بالصالون';
    case 'smart_auto_bot':
      return 'جدولة ذاتية ذكية بدون موظفات';
    case 'tedallaly_online':
    default:
      return 'منصة تدلّلي أونلاين';
  }
}

/**
 * Generates and triggers download of CSV file from bookings list
 */
export function exportBookingsToCSV(
  bookings: Booking[],
  salonName: string,
  options: {
    targetDate?: string;
    filePrefix?: string;
  } = {}
): { success: boolean; count: number; filename: string } {
  // Filter by date if specified
  const targetDate = options.targetDate;
  const filteredBookings = targetDate
    ? bookings.filter(b => b.appointmentDate === targetDate)
    : bookings;

  if (filteredBookings.length === 0) {
    return {
      success: false,
      count: 0,
      filename: '',
    };
  }

  // Define CSV Header Columns
  const headers = [
    'رقم الحجز',
    'تاريخ الموعد',
    'وقت البدء',
    'وقت الانتهاء',
    'المدة (دقيقة)',
    'اسم العميلة',
    'رقم الجوال',
    'الخدمة المطلوبة',
    'الأخصائية / الكرسي',
    'مصدر الحجز',
    'حالة الحجز',
    'المبلغ الإجمالي (ر.س)',
    'العربون المدفوع (ر.س)',
    'المتبقي للدفع بالصالون (ر.س)',
    'طريقة الدفع',
    'عمولة المنصة',
    'صافي استحقاق الصالون (ر.س)',
    'فحص منع التضارب',
    'ملاحظات الحجز'
  ];

  // Build CSV rows
  const rows: string[][] = filteredBookings.map(b => {
    const totalAmount = b.snapshot?.totalAmount || 150;
    const depositAmount = b.snapshot?.depositAmount || (b.paymentMethod === 'smart_deposit' ? Math.round(totalAmount * 0.25) : 0);
    const remainingAmount = Math.max(0, totalAmount - depositAmount);
    const commission = b.snapshot?.platformCommission || (totalAmount * 0.10);
    const salonPayout = b.snapshot?.salonPayoutAmount || (totalAmount - commission);

    return [
      b._id,
      b.appointmentDate || '',
      b.appointmentTime || '',
      b.appointmentEndTime || '',
      String(b.durationMins || 60),
      b.clientName || 'عميلة مسجلة',
      b.clientPhone || '05xxxxxxxx',
      b.snapshot?.serviceName || 'خدمة تجميل',
      b.snapshot?.staffName || 'أي أخصائية متاحة',
      translateBookingSource(b.bookingSource),
      translateStatus(b.status),
      totalAmount.toFixed(2),
      depositAmount.toFixed(2),
      remainingAmount.toFixed(2),
      b.paymentMethod === 'smart_deposit' ? 'عربون إلكتروني + الباقي بالصالون' : b.paymentMethod === 'on_arrival' ? 'دفع عند الوصول بالصالون' : 'دفع إلكتروني كامل (مدى / Apple Pay)',
      commission.toFixed(2),
      salonPayout.toFixed(2),
      b.conflictCheckPassed ? 'مؤمن ضد التضارب ✓' : 'حجز قياسي',
      b.notes || ''
    ];
  });

  // Convert array to CSV string
  // UTF-8 BOM (\uFEFF) ensures Arabic text displays correctly in Excel
  const bom = '\uFEFF';
  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\r\n');

  // Build clean filename
  const cleanSalonName = salonName.replace(/[/\\?%*:|"<>]/g, '-').trim();
  const dateStr = targetDate || new Date().toISOString().split('T')[0];
  const prefix = options.filePrefix || (targetDate ? 'حجوزات_يومية' : 'ارشيف_حجوزات');
  const filename = `${prefix}_${cleanSalonName}_${dateStr}.csv`;

  // Create Blob & trigger download
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    count: filteredBookings.length,
    filename
  };
}
