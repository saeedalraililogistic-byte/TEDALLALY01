export interface SalonDocument {
  id: string;
  type: 'commercial_register' | 'municipality_license' | 'tax_certificate' | 'freelance_document' | 'bank_certificate';
  title: string;
  fileNumber?: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface Salon {
  _id: string;
  _creationTime: number;
  salonName: string;
  slug: string;
  city: string;
  district?: string;
  address?: string;
  description?: string;
  phone?: string;
  status: 'verified' | 'pending_verification' | 'documents_required' | 'draft' | 'suspended' | string;
  averageRating?: number;
  totalReviews?: number;
  totalBookings?: number;
  isActive: boolean;
  ownerId?: string;
  providerType?: 'salon' | 'freelancer'; // 'salon' = صالون تجاري, 'freelancer' = ميكب آرتست / خبيرة مستقلة
  freelanceDocumentNumber?: string; // وثيقة العمل الحر
  acceptsOnlinePayment?: boolean;
  commercialRegisterNumber?: string;
  taxNumber?: string;
  documents?: SalonDocument[];
  verificationNotes?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface Service {
  _id: string;
  salonId: string;
  categoryId?: string;
  name: string;
  nameAr?: string;
  price: number;
  currency: string;
  durationMins: number;
  isActive: boolean;
  isAvailableOnline?: boolean;
  isHomeService?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  icon?: string;
}

export interface Booking {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentEndTime?: string;
  customerId: string;
  salonId: string;
  serviceId: string;
  staffId?: string;
  status: 'completed' | 'confirmed' | 'payment_pending' | 'cancelled' | string;
  bookingSource?: 'online_platform' | 'manual_pos' | 'smart_auto_bot';
  assignedChair?: string;
  durationMins?: number;
  clientName?: string;
  clientPhone?: string;
  conflictCheckPassed?: boolean;
  notes?: string;
  snapshot?: {
    salonName?: string;
    serviceName?: string;
    staffName?: string;
    totalAmount?: number;
    currency?: string;
    taxAmount?: number;
    depositAmount?: number;
    hasWhatsAppConsent?: boolean;
    noShowProtected?: boolean;
    baseServiceAmount?: number;
    platformCommission?: number;
    paymentGatewayFee?: number;
    vatOnCommission?: number;
    salonPayoutAmount?: number;
    paymentGateway?: string;
    tapChargeId?: string;
  };
}

export interface SalonCapacitySettings {
  totalChairs: number;
  bufferTimeMins: number; // e.g. 10 mins cleaning & preparation
  autoBookingEnabled: boolean; // smart AI booking without human receptionist
  operatingHours: {
    start: string; // e.g. "10:00"
    end: string;   // e.g. "22:00"
  };
}

export interface SlotConflictCheckResult {
  hasConflict: boolean;
  reason?: string;
  conflictingBooking?: Booking;
  suggestedNextSlot?: string;
}

export interface FlashOffer {
  id: string;
  salonId: string;
  salonName: string;
  serviceTitle: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  validTimeWindow: string; // e.g. "اليوم: 2:00 م - 4:30 م"
  remainingSeats: number;
  expiresInMinutes: number;
}

export interface BeautySubscription {
  id: string;
  salonId: string;
  title: string;
  monthlyPrice: number;
  billingPeriod: 'شهري' | 'فصلي';
  sessionsIncluded: number;
  features: string[];
  subscriberCount: number;
  badge?: string;
}

export interface ClientHairProfile {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  lastVisitDate: string;
  hairType: string;
  colorFormula: string;
  sensitivities: string;
  stylistNotes: string;
  favoriteStylist: string;
  photoBeforeAfterUrl?: string;
}

export interface BridalGroupBooking {
  id: string;
  brideName: string;
  eventDate: string;
  targetFinishTime: string;
  guestsCount: number;
  servicesSchedule: {
    guestName: string;
    role: 'العروس' | 'مرافقة' | 'أم العروس';
    assignedStaff: string;
    serviceName: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  totalAmount: number;
  depositPaid: number;
  status: 'confirmed' | 'draft' | 'in_progress';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'salon_owner' | 'freelancer' | 'admin' | string;
  city?: string;
  isActive: boolean;
  linkedProviderId?: string; // id of salon or freelance profile
}

export interface Staff {
  _id: string;
  salonId: string;
  name: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

export interface Review {
  _id: string;
  salonId: string;
  rating: number;
  comment?: string;
  customerName?: string;
  _creationTime: number;
}

export interface WaitlistEntry {
  id: string;
  salonId: string;
  clientName: string;
  clientPhone: string;
  serviceTitle: string;
  preferredDate: string;
  preferredTimeWindow: string;
  urgency: 'high' | 'normal';
  status: 'waiting' | 'alerted' | 'claimed' | 'expired';
  alertExpiresAt?: number;
  notes?: string;
}

export interface RetailProduct {
  id: string;
  salonId: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  compatibleServices?: string[];
  salesCount: number;
}

export interface GiftVoucher {
  id: string;
  code: string;
  salonId: string;
  salonName: string;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  serviceName?: string;
  message: string;
  theme: 'rose_gold' | 'royal_lavender' | 'spring_blossom' | 'bridal_white';
  isRedeemed: boolean;
  expiryDate: string;
  createdAt: string;
}

export interface ExternalGlamOrder {
  id: string;
  salonId: string;
  clientName: string;
  clientPhone: string;
  locationAddress: string;
  neighborhood: string;
  city: string;
  assignedStaff: string;
  serviceNames: string[];
  bookingDate: string;
  eventTime: string;
  travelFee: number;
  totalServiceAmount: number;
  status: 'pending' | 'on_the_way' | 'in_service' | 'completed' | 'cancelled';
  toolKitChecklist: { item: string; checked: boolean }[];
}

export interface ConsultationLook {
  id: string;
  salonId: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  estimatedDuration: string;
  recommendedFormulas?: string;
}

export type NotificationType = 
  | 'appointment_reminder' 
  | 'status_change' 
  | 'booking_confirmed' 
  | 'booking_cancelled';

export interface InAppNotification {
  id: string;
  bookingId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  urgency: 'high' | 'normal' | 'low';
  bookingSnapshot?: {
    salonName?: string;
    serviceName?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    status?: string;
    totalAmount?: number;
    staffName?: string;
    clientName?: string;
  };
}
