import React, { useState } from 'react';
import { Salon, Service, Booking } from '../types.ts';
import { 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Phone, 
  MapPin, 
  Scissors, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  FileText,
  Gift,
  HelpCircle,
  ExternalLink,
  Lock,
  Smartphone,
  Info,
  Loader2
} from 'lucide-react';
import { checkSlotConflict } from '../lib/bookingConflictEngine.ts';
import { calculateBookingFinances, formatSAR } from '../lib/commissionCalculator.ts';
import { buildTapChargePayload, processTapPayment, TapChargeResponse, TAP_CONFIG } from '../lib/tapPaymentsService.ts';
import { LegalPoliciesModal, LegalPolicyTab } from './LegalPoliciesModal.tsx';

interface Props {
  salon: Salon;
  service: Service;
  availableServices?: Service[];
  existingBookings?: Booking[];
  onConfirm: (booking: Booking) => void;
  onCancel: () => void;
}

export const BookingModal: React.FC<Props> = ({
  salon,
  service: initialService,
  availableServices = [],
  existingBookings = [],
  onConfirm,
  onCancel,
}) => {
  // Current active step in the stepper: 1 = Service, 2 = Date/Time, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedService, setSelectedService] = useState<Service>(initialService);
  const [date, setDate] = useState(() => {
    // Default to tomorrow or today
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('16:00');
  const [staffName, setStaffName] = useState('أي أخصائية متاحة (أسرع حجز)');
  const [serviceLocation, setServiceLocation] = useState<'salon' | 'home'>('salon');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'electronic' | 'smart_deposit' | 'on_arrival'>('electronic');
  const [hasWhatsAppConsent, setHasWhatsAppConsent] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  // Tap Payments Gateway State
  const [tapPaymentSource, setTapPaymentSource] = useState<'mada' | 'apple_pay' | 'visa_master' | 'tamara' | 'tabby'>('mada');
  const [isProcessingTap, setIsProcessingTap] = useState(false);
  const [tapReceipt, setTapReceipt] = useState<TapChargeResponse | null>(null);

  // Legal Policies Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalPolicyTab>('commission');

  // Retail products add-ons state (Checkout retail upsell)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // Visual consultation / inspiration look
  const [inspirationLookTitle, setInspirationLookTitle] = useState('');
  const [hairConsultationNote, setHairConsultationNote] = useState('');
  // Gift voucher / gift for someone else
  const [isGiftBooking, setIsGiftBooking] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState('');

  const retailUpsellOptions = [
    {
      id: 'prod_1',
      title: 'ماسك أولابلكس رقم 3 لإصلاح الروابط والشعر المصبوغ',
      price: 145,
      desc: 'استلميه مغلفاً باسمك عند وصولك الصالون',
      image: 'https://images.unsplash.com/photo-1608248597359-009180746b5a?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_2',
      title: 'سيروم كيراتين وأرجان موروكان أويل النقي (100 مل)',
      price: 180,
      desc: 'لمعان فاخر وحماية من حرارة السشوار والتطاير',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_3',
      title: 'زيت مغذي للجلد الميت للأظافر بخلاصة فيتامين E',
      price: 55,
      desc: 'ترطيب وحماية للأظافر بعد جلسة البدكير والمناكير',
      image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const selectedProducts = retailUpsellOptions.filter(p => selectedProductIds.includes(p.id));
  const productsSubtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  // Tap Payments Channel Mapping
  let tapChannel: 'mada' | 'apple_pay' | 'visa_master_local' | 'tamara' | 'tabby' = 'mada';
  if (tapPaymentSource === 'visa_master') tapChannel = 'visa_master_local';
  else if (tapPaymentSource === 'apple_pay') tapChannel = 'apple_pay';
  else if (tapPaymentSource === 'tamara') tapChannel = 'tamara';
  else if (tapPaymentSource === 'tabby') tapChannel = 'tabby';

  // Exact Tap Payments Rate Card Calculation (Starter Plan / باقة البداية):
  // Mada: 1% + 1 SAR | Visa Local: 2.75% + 1 SAR | Tamara/Tabby: 6.5% + 1 SAR
  const finances = calculateBookingFinances(
    selectedService.price,
    productsSubtotal,
    selectedService.currency || 'ر.س',
    tapChannel,
    'starter'
  );
  const totalAmountDue = finances.totalCustomerDue;
  const platformFee = finances.platformCommission;

  // Service list for salon
  const salonServices = availableServices.length > 0 ? availableServices : [initialService];

  // Calculated Smart Deposit (20% or 50 SAR minimum, capped at total price)
  const depositAmount = Math.min(
    selectedService.price,
    Math.max(50, Math.round(selectedService.price * 0.2))
  );
  const remainingOnArrival = Math.max(0, selectedService.price - depositAmount);

  // Available Time Slots
  const timeSlots = [
    { time: '11:00', label: '11:00 ص', period: 'صباحي' },
    { time: '12:30', label: '12:30 م', period: 'ظهيرة' },
    { time: '14:00', label: '02:00 م', period: 'ظهيرة' },
    { time: '15:30', label: '03:30 م', period: 'مسائي' },
    { time: '16:00', label: '04:00 م', period: 'مسائي' },
    { time: '17:30', label: '05:30 م', period: 'مسائي' },
    { time: '19:00', label: '07:00 م', period: 'مسائي' },
    { time: '20:30', label: '08:30 م', period: 'مسائي' },
  ];

  // Quick date chips
  const getQuickDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    return [
      { label: 'اليوم', val: today.toISOString().split('T')[0] },
      { label: 'غداً', val: tomorrow.toISOString().split('T')[0] },
      { label: 'بعد غد', val: dayAfter.toISOString().split('T')[0] },
    ];
  };

  const steps = [
    { number: 1, title: 'اختيار الخدمة', subtitle: 'الخدمة والباقة' },
    { number: 2, title: 'تحديد الوقت', subtitle: 'الموعد والأخصائية' },
    { number: 3, title: 'تأكيد الحجز', subtitle: 'البيانات والدفع' },
  ];

  const selectedSlotConflict = checkSlotConflict({
    salonId: salon._id,
    date,
    time,
    durationMins: selectedService.durationMins || 60,
    staffName,
    existingBookings,
  });

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedSlotConflict.hasConflict) {
        alert(`عذراً، هذا الموعد غير متاح لتفادي تضارب المواعيد مع كراسي وأخصائيات الصالون:\n${selectedSlotConflict.reason}`);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      return;
    }

    if (salon.status !== 'verified') {
      alert('عذراً، هذا الصالون قيد تدقيق ومطابقة المستندات من إدارة المنصة ولا يمكن إتمام الحجز في الوقت الحالي حتى يتم اعتماده رسمياً.');
      return;
    }

    if (selectedSlotConflict.hasConflict) {
      alert(`لا يمكن إتمام الحجز بسبب تضارب مواعيد:\n${selectedSlotConflict.reason}`);
      return;
    }

    const bookingRef = `TED-${Math.floor(100000 + Math.random() * 900000)}`;
    const actualDeposit = paymentMethod === 'smart_deposit' ? depositAmount : (paymentMethod === 'electronic' ? finances.totalCustomerDue : 0);

    let tapChargeResult: TapChargeResponse | null = null;
    if (paymentMethod === 'electronic' || paymentMethod === 'smart_deposit') {
      setIsProcessingTap(true);
      try {
        const payload = buildTapChargePayload(
          finances,
          clientName,
          clientPhone,
          selectedService.nameAr || selectedService.name,
          salon.salonName,
          bookingRef,
          tapPaymentSource
        );
        tapChargeResult = await processTapPayment(payload);
        setTapReceipt(tapChargeResult);
      } catch (err) {
        console.error('Tap Payment processing error:', err);
      } finally {
        setIsProcessingTap(false);
      }
    }

    const newBooking: Booking = {
      _id: `bkg_${Date.now()}`,
      appointmentDate: date,
      appointmentTime: time,
      customerId: `usr_${Date.now()}`,
      salonId: salon._id,
      serviceId: selectedService._id,
      staffId: staffName,
      status: 'confirmed',
      bookingSource: 'online_platform',
      durationMins: selectedService.durationMins || 60,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      conflictCheckPassed: true,
      snapshot: {
        salonName: salon.salonName,
        serviceName: selectedService.nameAr || selectedService.name,
        staffName: staffName,
        totalAmount: finances.totalCustomerDue,
        currency: selectedService.currency,
        taxAmount: finances.vatOnCommission,
        depositAmount: actualDeposit,
        hasWhatsAppConsent: hasWhatsAppConsent,
        noShowProtected: paymentMethod === 'smart_deposit' || paymentMethod === 'electronic',
        baseServiceAmount: finances.baseServiceAmount,
        platformCommission: finances.platformCommission,
        paymentGatewayFee: finances.paymentGatewayFee,
        vatOnCommission: finances.vatOnCommission,
        salonPayoutAmount: finances.salonPayoutAmount,
        paymentGateway: 'Tap Payments (https://tedallaly.com/ar)',
        tapChargeId: tapChargeResult?.id,
      },
    };

    setConfirmedBookingId(bookingRef);
    setIsSuccess(true);
    setTimeout(() => {
      onConfirm(newBooking);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-[#121218] border border-rose-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 relative shadow-2xl overflow-hidden transition-all my-auto">
        
        {/* Success View */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-scaleUp">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 mb-2">
                رقم الحجز: {confirmedBookingId}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">تم تأكيد حجزك بنجاح!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                يسرنا إبلاغك بتأكيد موعدك في <strong className="text-rose-600 dark:text-rose-400">{salon.salonName}</strong> لخدمة <strong className="text-rose-600 dark:text-rose-400">{selectedService.nameAr || selectedService.name}</strong>.
              </p>
            </div>

            <div className="bg-rose-50/50 dark:bg-slate-950 p-4 rounded-2xl border border-rose-100 dark:border-slate-800 text-right text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500">التاريخ والوقت:</span>
                <span className="font-bold">{date} • {time}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500">الاسم والجوال:</span>
                <span className="font-bold">{clientName} ({clientPhone})</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500">الإجمالي:</span>
                <span className="font-black text-rose-600 dark:text-emerald-400">{selectedService.price} {selectedService.currency}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>تم حفظ تفاصيل الحجز ومزامنته مع تطبيق تدلّلي وقاعدة البيانات</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header with Salon Info and Close button */}
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">حجز موعد تجميل</h3>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{salon.salonName}</span>
                    <span className="text-slate-400">•</span>
                    <span>{salon.city}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs px-2.5 py-1 bg-rose-50/70 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            {/* PROGRESS STEPPER BAR */}
            <div className="bg-rose-50/40 dark:bg-slate-950/60 p-3 sm:p-4 rounded-2xl border border-rose-100 dark:border-slate-800">
              <div className="relative flex items-center justify-between">
                {/* Connecting Track Line behind steps */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
                <div 
                  className="absolute top-4 right-6 h-0.5 bg-gradient-to-l from-rose-500 to-pink-500 -z-0 transition-all duration-300"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
                  }}
                />

                {steps.map((st) => {
                  const isCompleted = currentStep > st.number;
                  const isCurrent = currentStep === st.number;
                  const isUpcoming = currentStep < st.number;

                  return (
                    <div 
                      key={st.number}
                      className="relative z-10 flex flex-col items-center cursor-pointer group"
                      onClick={() => {
                        // Allow clicking back to already completed steps
                        if (isCompleted) {
                          setCurrentStep(st.number as 1 | 2 | 3);
                        }
                      }}
                    >
                      <div 
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                          isCompleted
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                            : isCurrent
                            ? 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white ring-4 ring-rose-500/20 shadow-lg shadow-rose-600/40 scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          st.number
                        )}
                      </div>
                      <div className="mt-1.5 text-center">
                        <div 
                          className={`text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap ${
                            isCurrent 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : isCompleted 
                              ? 'text-slate-800 dark:text-slate-200' 
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {st.title}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
                          {st.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: اختيار الخدمة وتفاصيلها */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>الخدمة المطلوبة:</span>
                    <span className="text-[11px] font-normal text-slate-500">اختر الخدمة أو أكد اختيارك</span>
                  </label>

                  {/* List of salon services if multiple, or active selected one */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {salonServices.map((srv) => {
                      const isSelected = selectedService._id === srv._id;
                      return (
                        <div
                          key={srv._id}
                          onClick={() => setSelectedService(srv)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-400 dark:border-rose-500/50 shadow-xs ring-1 ring-rose-500/30'
                              : 'bg-white dark:bg-slate-950 border-rose-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                                isSelected 
                                  ? 'bg-rose-600 text-white' 
                                  : 'bg-rose-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              <Scissors className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {srv.nameAr || srv.name}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <span>{srv.durationMins} دقيقة</span>
                                {srv.isHomeService && (
                                  <>
                                    <span>•</span>
                                    <span className="text-rose-600 dark:text-rose-400 font-semibold">متاح كخدمة منزلية</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-left">
                            <div className="text-xs font-black text-rose-600 dark:text-emerald-400">
                              {srv.price} {srv.currency}
                            </div>
                            <div className="text-[9px] text-slate-400">شامل الضريبة</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Service Location Option */}
                {selectedService.isHomeService && (
                  <div className="p-3 bg-rose-50/30 dark:bg-slate-950 rounded-2xl border border-rose-100 dark:border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">مكان تقديم الخدمة:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceLocation('salon')}
                        className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          serviceLocation === 'salon'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-rose-100 dark:border-slate-800'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>في مقر الصالون</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceLocation('home')}
                        className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          serviceLocation === 'home'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-rose-100 dark:border-slate-800'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>خدمة منزلية (في بيتك)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Visual Consultation & Look Inspiration */}
                <div className="p-3 bg-gradient-to-r from-rose-50/50 to-pink-50/40 dark:from-slate-900/90 dark:to-slate-950 rounded-2xl border border-rose-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">استشارة بصرية مجانية</span>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>اختاري لوك الإلهام المفضل لتجهيز خبيرة التجميل:</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'ويفي هوليوود كلاسيك',
                      'بالياج كراميل عسلي',
                      'ميك اب سموكي سهرة ناعم',
                      'أظافر فرينش مع كروم لؤلؤي',
                      'تريتمنت بروتين ترميمي',
                    ].map(look => (
                      <button
                        key={look}
                        type="button"
                        onClick={() => setInspirationLookTitle(inspirationLookTitle === look ? '' : look)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                          inspirationLookTitle === look
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-rose-100 dark:border-slate-800 hover:border-rose-300'
                        }`}
                      >
                        {look} {inspirationLookTitle === look ? '✓' : '+'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={hairConsultationNote}
                    onChange={e => setHairConsultationNote(e.target.value)}
                    placeholder="رابط صورة انستغرام أو وصف مظهرك المفضل (اختياري)..."
                    className="w-full bg-white dark:bg-slate-950 border border-rose-200/70 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Additional Notes / Special Preferences */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ملاحظات أو طلبات خاصة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="مثال: نوع الشعر، حساسية معينة، أو تفضيل تجميلي..."
                    className="w-full bg-rose-50/30 dark:bg-slate-950 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Step 1 Actions */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>متابعة لتحديد الوقت والموعد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: تحديد الوقت والموعد */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>اختر تاريخ الموعد:</span>
                    </label>
                    <div className="flex gap-1">
                      {getQuickDates().map(chip => (
                        <button
                          key={chip.val}
                          type="button"
                          onClick={() => setDate(chip.val)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            date === chip.val
                              ? 'bg-rose-600 text-white font-bold'
                              : 'bg-rose-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-sans"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>اختر الوقت المناسب:</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> فحص الكراسي والأخصائيات نشط (0 تضارب)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(slot => {
                      const isSelected = time === slot.time;
                      const conflict = checkSlotConflict({
                        salonId: salon._id,
                        date,
                        time: slot.time,
                        durationMins: selectedService.durationMins || 60,
                        staffName,
                        existingBookings,
                      });

                      const isOccupied = conflict.hasConflict;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => setTime(slot.time)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center relative ${
                            isOccupied
                              ? 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800/80 cursor-not-allowed opacity-75'
                              : isSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30 cursor-pointer'
                              : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-rose-100 dark:border-slate-800 hover:border-rose-300 cursor-pointer'
                          }`}
                        >
                          <div>{slot.label}</div>
                          <div className={`text-[9px] font-normal ${
                            isOccupied 
                              ? 'text-rose-500 dark:text-rose-400 font-bold' 
                              : isSelected 
                              ? 'text-rose-100' 
                              : 'text-slate-400'
                          }`}>
                            {isOccupied ? 'محجوز ✕' : slot.period}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSlotConflict.hasConflict && (
                    <div className="mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-xl text-xs text-rose-800 dark:text-rose-200">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>الوقت المحدد ({time}) غير متاح حالياً:</span>
                      </div>
                      <p className="text-[11px] mt-0.5 opacity-90">{selectedSlotConflict.reason}</p>
                      {selectedSlotConflict.suggestedNextSlot && (
                        <div className="mt-1.5 pt-1.5 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                          <span className="text-[10px]">الوقت المقترح الخالي من التضارب:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const numOnly = selectedSlotConflict.suggestedNextSlot!.replace(/[^\d:]/g, '');
                              setTime(numOnly);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-500"
                          >
                            اختيار {selectedSlotConflict.suggestedNextSlot}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Specialist / Staff preference */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    <span>تفضيل الأخصائية / خبيرة التجميل:</span>
                  </label>
                  <select
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="أي أخصائية متاحة (أسرع حجز)">أي أخصائية متاحة (أسرع حجز)</option>
                    <option value="أخصائية التجميل سارة (مكياج وشعر)">أخصائية التجميل سارة (مكياج وشعر)</option>
                    <option value="أخصائية العناية نورة (بشرة ومساج)">أخصائية العناية نورة (بشرة ومساج)</option>
                    <option value="خبيرة الأظافر ريم">خبيرة الأظافر ريم</option>
                  </select>
                </div>

                {/* Retail Upsell Products: Add-on to booking */}
                <div className="p-3.5 bg-gradient-to-r from-amber-50/60 to-rose-50/50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-amber-200/60 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-100/70 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                      تجهيز فوري بالصالون
                    </span>
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>منتجات عناية منزلية مقترحة لخدمتك:</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    {retailUpsellOptions.map(prod => {
                      const isAdded = selectedProductIds.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setSelectedProductIds(prev =>
                              isAdded ? prev.filter(id => id !== prod.id) : [...prev, prod.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isAdded
                              ? 'bg-white dark:bg-slate-900 border-rose-500 shadow-xs'
                              : 'bg-white/60 dark:bg-slate-950/60 border-rose-100 dark:border-slate-800 hover:border-rose-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-10 h-10 rounded-lg object-cover border border-rose-100 dark:border-slate-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                {prod.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {prod.desc}
                              </div>
                            </div>
                          </div>
                          <div className="text-left shrink-0">
                            <div className="text-xs font-black text-rose-600 dark:text-rose-400">
                              +{prod.price} ر.س
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                              isAdded ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {isAdded ? 'مُضاف ✓' : '+ إضافة'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 Actions (Back and Next) */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>متابعة لتأكيد الحجز والدفع</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: تأكيد الحجز والبيانات والدفع */}
            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
                {/* Summary Card with User's Exact Fee Formula Breakdown */}
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-slate-950 border border-rose-100 dark:border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تفاصيل الحجز والشفافية المالية (فاتورة نظامية):</span>
                    </span>
                    {inspirationLookTitle && (
                      <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg">
                        لوك: {inspirationLookTitle}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs border-b border-rose-100 dark:border-slate-800/80 pb-2">
                    {/* Base Service Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedService.nameAr || selectedService.name}:</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-normal">
                          (سعر الخدمة محدد من الصالون شاملاً ضريبة القيمة المضافة 15%)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{Number(finances.baseServiceAmount).toFixed(2)} {selectedService.currency}</span>
                    </div>

                    {/* Products Add-on if any */}
                    {selectedProducts.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-dashed border-rose-100 dark:border-slate-800">
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">منتجات عناية إضافية مجهزة بالصالون:</div>
                        {selectedProducts.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>+ {p.title.substring(0, 35)}...</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{p.price} {selectedService.currency}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Platform Commission 10% */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <span>عمولة المنصة والوساطة التقنية (10%):</span>
                      </span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">+{finances.platformCommission.toFixed(2)} {selectedService.currency}</span>
                    </div>

                    {/* Gateway Fee (Tap Payments Starter Rates) */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>
                          رسوم بوابة الدفع Tap ({
                            tapPaymentSource === 'mada' ? 'مدى 1% + 1 ر.س' :
                            tapPaymentSource === 'visa_master' ? 'فيزا 2.75% + 1 ر.س' :
                            tapPaymentSource === 'tamara' ? 'تمارا 6.5% + 1 ر.س' :
                            tapPaymentSource === 'tabby' ? 'تابي 6.5% + 1 ر.س' : 'Apple Pay'
                          }):
                        </span>
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">+{finances.paymentGatewayFee.toFixed(2)} {selectedService.currency}</span>
                    </div>

                    {/* ZATCA VAT 15% on Platform Earning */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>ضريبة القيمة المضافة 15% (محسوبة نظاماً على عمولة المنصة):</span>
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">+{finances.vatOnCommission.toFixed(2)} {selectedService.currency}</span>
                    </div>

                    {/* Salon Guarantee Badge */}
                    <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1.5 rounded-lg mt-1 border border-emerald-200/60 dark:border-emerald-900/40">
                      <div>
                        <span className="font-bold block">مستحق الصالون الصافي الكامل (شامل ضريبته):</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">المنصة تحول للصالون كامل سعره وضريبته ولا علاقة للمنصة بضريبة الصالون</span>
                      </div>
                      <span className="font-black text-xs font-mono">{finances.salonPayoutAmount} {selectedService.currency} (100%)</span>
                    </div>
                  </div>

                  {/* Pricing Total Due & Legal Link */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <div className="text-slate-700 dark:text-slate-300 font-bold">المبلغ الإجمالي المطلوب للدفع:</div>
                      <button
                        type="button"
                        onClick={() => { setLegalModalTab('commission'); setIsLegalModalOpen(true); }}
                        className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 mt-0.5 cursor-pointer"
                      >
                        <Info className="w-3 h-3" />
                        <span>تفاصيل سياسة العمولة والرسوم والخصوصية</span>
                      </button>
                    </div>
                    <div className="text-xl font-black text-rose-600 dark:text-emerald-400 font-mono">
                      {finances.totalCustomerDue.toFixed(2)} {selectedService.currency}
                    </div>
                  </div>
                </div>

                {/* Gift Booking Toggle */}
                <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">إهداء هذا الموعد كبطاقة إهداء رقمية فاخرة 🎁</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isGiftBooking}
                      onChange={e => setIsGiftBooking(e.target.checked)}
                      className="accent-purple-600 rounded"
                    />
                  </label>
                  {isGiftBooking && (
                    <input
                      type="text"
                      value={giftRecipientName}
                      onChange={e => setGiftRecipientName(e.target.value)}
                      placeholder="اسم المهدى إليها ورسالتك الخاصة لها لتصلها عبر الواتساب..."
                      className="w-full bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  )}
                </div>

                {/* Client Information Form */}
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-rose-500" />
                      <span>اسم العميلة:</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم الكامل لتسجيل الحجز..."
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-rose-500" />
                      <span>رقم الجوال لتأكيد الحجز:</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05XXXXXXXX"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                {/* Payment method option */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-rose-500" />
                      <span>طريقة تأكيد الحجز والدفع:</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                      دفع محمي 100% عبر Tap
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Option 1: Full Electronic via Tap Payments (Recommended) */}
                    <div
                      onClick={() => setPaymentMethod('electronic')}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        paymentMethod === 'electronic'
                          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500 font-bold text-rose-700 dark:text-rose-300 shadow-xs'
                          : 'bg-white dark:bg-slate-950 border-rose-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${paymentMethod === 'electronic' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                        <span className="truncate">دفع إلكتروني (Tap)</span>
                      </div>
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                        {finances.totalCustomerDue.toFixed(2)} {selectedService.currency}
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Apple Pay / مدى / فيزا</span>
                    </div>

                    {/* Option 2: Smart Deposit */}
                    <div
                      onClick={() => setPaymentMethod('smart_deposit')}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all relative ${
                        paymentMethod === 'smart_deposit'
                          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500 font-bold text-rose-700 dark:text-rose-300 shadow-xs'
                          : 'bg-white dark:bg-slate-950 border-rose-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${paymentMethod === 'smart_deposit' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                        <span className="truncate">عربون ذكي (مضمون)</span>
                      </div>
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                        {depositAmount + platformFee} {selectedService.currency} الآن
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">الباقي بالصالون</span>
                    </div>

                    {/* Option 3: Pay on arrival */}
                    <div
                      onClick={() => setPaymentMethod('on_arrival')}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        paymentMethod === 'on_arrival'
                          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500 font-bold text-rose-700 dark:text-rose-300 shadow-xs'
                          : 'bg-white dark:bg-slate-950 border-rose-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${paymentMethod === 'on_arrival' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                        <span className="truncate">الدفع عند الحضور</span>
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {finances.totalCustomerDue.toFixed(2)} {selectedService.currency}
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">نقداً أو كاشير</span>
                    </div>
                  </div>

                  {/* Tap Payments Sub-methods Selector for Electronic Payments */}
                  {paymentMethod === 'electronic' && (
                    <div className="p-3 bg-gradient-to-r from-slate-50 to-rose-50/40 dark:from-slate-900 dark:to-slate-950 border border-rose-200/80 dark:border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <Lock className="w-3.5 h-3.5 text-emerald-500" />
                          <span>بوابة الدفع المعتمدة: Tap Payments</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          https://tedallaly.com/ar
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                        {/* Apple Pay */}
                        <button
                          type="button"
                          onClick={() => setTapPaymentSource('apple_pay')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            tapPaymentSource === 'apple_pay'
                              ? 'bg-black text-white border-black shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-center gap-1">
                            <span>Pay</span>
                          </div>
                          <div className="text-[9px] opacity-80 mt-0.5">Apple Pay</div>
                        </button>

                        {/* Mada */}
                        <button
                          type="button"
                          onClick={() => setTapPaymentSource('mada')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            tapPaymentSource === 'mada'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-center gap-1">
                            <span>مدى</span>
                          </div>
                          <div className="text-[9px] opacity-80 mt-0.5">1% + 1 ر.س</div>
                        </button>

                        {/* Visa / Master */}
                        <button
                          type="button"
                          onClick={() => setTapPaymentSource('visa_master')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            tapPaymentSource === 'visa_master'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-center gap-1">
                            <span>فيزا/ماستر</span>
                          </div>
                          <div className="text-[9px] opacity-80 mt-0.5">2.75% + 1 ر.س</div>
                        </button>

                        {/* Tamara */}
                        <button
                          type="button"
                          onClick={() => setTapPaymentSource('tamara')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            tapPaymentSource === 'tamara'
                              ? 'bg-orange-500 text-white border-orange-500 shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-400'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-center gap-1">
                            <span>تمارا</span>
                          </div>
                          <div className="text-[9px] opacity-80 mt-0.5">قسميها على 4</div>
                        </button>

                        {/* Tabby */}
                        <button
                          type="button"
                          onClick={() => setTapPaymentSource('tabby')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            tapPaymentSource === 'tabby'
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-center gap-1">
                            <span>تابي</span>
                          </div>
                          <div className="text-[9px] opacity-80 mt-0.5">قسط بدون فوائد</div>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>معالجة مشفرة 256-bit بمعايير PCI-DSS</span>
                        </span>
                        <span>معتمد من البنك المركزي</span>
                      </div>
                    </div>
                  )}

                  {/* Breakdown & No-show protection details */}
                  {paymentMethod === 'smart_deposit' && (
                    <div className="p-3 bg-gradient-to-r from-rose-50/70 to-pink-50/50 dark:from-rose-950/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span>العربون المطلوب لضمان حجز الكرسي:</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{depositAmount} {selectedService.currency}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                        <span>المبلغ المتبقي يُدفع عند الحضور:</span>
                        <span>{remainingOnArrival} {selectedService.currency}</span>
                      </div>
                      <div className="pt-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-rose-100 dark:border-slate-800 leading-relaxed flex items-start gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>سياسة حماية الصالون (No-Show Policy):</strong> إلغاء مجاني كامل واسترداد فوري للعربون حتى 4 ساعات قبل الموعد. في حال عدم الحضور دون عذر مسبق، يُحفظ العربون لتعويض وقت الأخصائية وحجز الموعد.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Auto-Recall & Reminders Consent */}
                <div className="p-2.5 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/30 rounded-xl">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWhatsAppConsent}
                      onChange={e => setHasWhatsAppConsent(e.target.checked)}
                      className="mt-0.5 accent-emerald-600 rounded"
                    />
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">تنبيهات الواتساب الذكية (WhatsApp):</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        أوافق على استلام تأكيد الحجز وتذكيرات موعد العناية الدورية عبر الواتساب (يمكنك إلغاء الاشتراك في أي وقت).
                      </span>
                    </div>
                  </label>
                </div>

                {/* Step 3 Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isProcessingTap}
                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessingTap}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingTap ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري تأمين الحجز ومعالجة الدفع عبر Tap...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>تأكيد الحجز والدفع النهائي ({finances.totalCustomerDue.toFixed(2)} {selectedService.currency})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Platform Guarantee Footer */}
            <div className="pt-2 border-t border-rose-100 dark:border-slate-800/70 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                حجز موثق وآمن عبر منصة تدلّلي وبوابة Tap
              </span>
              <button 
                type="button"
                onClick={() => { setLegalModalTab('terms'); setIsLegalModalOpen(true); }}
                className="hover:underline cursor-pointer"
              >
                الشروط والسياسات المعتمدة
              </button>
            </div>
          </div>
        )}

        {/* Legal Policies & Transparency Modal */}
        <LegalPoliciesModal
          isOpen={isLegalModalOpen}
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalOpen(false)}
        />
      </div>
    </div>
  );
};
