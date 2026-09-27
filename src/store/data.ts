import tedallalyRaw from '../tedallaly_data.json';
import { Salon, Service, Category, Booking, User, Staff, Review } from '../types.ts';

export interface TedallalyStoreState {
  salons: Salon[];
  services: Service[];
  categories: Category[];
  bookings: Booking[];
  users: User[];
  staff: Staff[];
  reviews: Review[];
  activeSalonId: string;
}

const rawData = tedallalyRaw as unknown as {
  salons?: Salon[];
  services?: Service[];
  categories?: Category[];
  bookings?: Booking[];
  users?: User[];
  staff?: Staff[];
  reviews?: Review[];
};

export const initialSalons: Salon[] = [
  // Salon Yara - Owned by Yara (salon_owner) in Pending Verification for Admin Review
  {
    _id: 'salon_yara',
    _creationTime: 1716000000000,
    salonName: 'صالون يارا للجمال والعناية',
    slug: 'salon-yara',
    city: 'الرياض',
    district: 'حطين',
    address: 'الرياض - حي حطين - طريق الملك خالد',
    description: 'صالون تجميل وعناية فاخر متخصص في العناية بالشعر، البديكير، والمكياج السينمائي والمناسبات.',
    phone: '0555123456',
    status: 'pending_verification',
    isActive: true,
    providerType: 'salon' as const,
    ownerId: 'usr_yara',
    ownerEmail: 'yara@tedallaly.com',
    ownerName: 'يارا',
    commercialRegisterNumber: '1010892999',
    taxNumber: '300192837400003',
    acceptsOnlinePayment: true,
    averageRating: 4.9,
    totalReviews: 12,
    totalBookings: 8,
    documents: [
      {
        id: 'doc_cr_salon_yara',
        type: 'commercial_register' as const,
        title: 'السجل التجاري (وزارة التجارة)',
        fileName: 'CR_Salon_Yara_Official.pdf',
        fileNumber: '1010892999',
        uploadedAt: '2026-09-24',
        status: 'pending' as const,
      },
      {
        id: 'doc_lic_salon_yara',
        type: 'municipality_license' as const,
        title: 'رخصة البلدية / بلدي',
        fileName: 'Balady_License_Yara.pdf',
        fileNumber: 'BLD-9981-YARA',
        uploadedAt: '2026-09-24',
        status: 'pending' as const,
      },
      {
        id: 'doc_bank_salon_yara',
        type: 'bank_certificate' as const,
        title: 'شهادة الآيبان والحساب البنكي',
        fileName: 'IBAN_Certificate_Yara.pdf',
        uploadedAt: '2026-09-24',
        status: 'pending' as const,
      }
    ]
  },
  // Freelancer Reem
  {
    _id: 'freelancer_reem',
    _creationTime: 1716100000000,
    salonName: 'ريم العبدالله • خبيرة مكياج وتسريحات',
    slug: 'fl-reem',
    city: 'الرياض',
    district: 'النرجس',
    address: 'الرياض - خدمة منزلية واستوديو خاص',
    description: 'ميكب آرتست معتمدة بوثيقة العمل الحر، متخصصة في مكياج العرائس والسهرات الراقية.',
    phone: '0555987654',
    status: 'verified',
    isActive: true,
    providerType: 'freelancer' as const,
    ownerId: 'usr_reem',
    ownerEmail: 'reem@tedallaly.com',
    ownerName: 'ريم العبدالله',
    freelanceDocumentNumber: 'FL-99201928',
    acceptsOnlinePayment: true,
    averageRating: 5.0,
    totalReviews: 28,
    totalBookings: 34,
    documents: [
      {
        id: 'doc_fl_reem',
        type: 'freelance_document' as const,
        title: 'وثيقة العمل الحر المعتمدة',
        fileName: 'Freelance_Cert_Reem.pdf',
        fileNumber: 'FL-99201928',
        uploadedAt: '2026-01-10',
        status: 'approved' as const,
      }
    ]
  },
  ...((rawData.salons || [])
    .filter(s => 
      !s.salonName.includes('التجريبي') && 
      !s.salonName.includes('Hshshajak') && 
      s.salonName !== 'My Salon' &&
      s.salonName !== 'Salon yara'
    )
    .map((s, idx) => {
      const isInitiallyVerified = s.status === 'verified';
      const isEhsan = s.salonName.includes('احسان');
      const isAnamil = s.salonName.includes('انامل');
      const assignedOwnerId = isEhsan ? 'usr_salon_ehsan' : isAnamil ? 'usr_salon_anamil' : `usr_owner_${s._id}`;
      const assignedOwnerEmail = isEhsan ? 'ehsan.salon@tedallaly.com' : isAnamil ? 'anamil.salon@tedallaly.com' : `${s.slug}@tedallaly.com`;
      const assignedPhone = isEhsan ? '0501112233' : isAnamil ? '0502223344' : (s.phone || `050333${idx}00`);

      return {
        ...s,
        phone: assignedPhone,
        providerType: 'salon' as const,
        ownerId: assignedOwnerId,
        ownerEmail: assignedOwnerEmail,
        ownerName: s.salonName,
        status: isInitiallyVerified ? 'verified' : (s.status === 'suspended' ? 'suspended' : 'pending_verification'),
        commercialRegisterNumber: s.commercialRegisterNumber || `1010${892100 + idx}`,
        taxNumber: s.taxNumber || `300192837400003`,
        documents: isInitiallyVerified ? [
          {
            id: `doc_cr_${s._id}`,
            type: 'commercial_register' as const,
            title: 'السجل التجاري',
            fileName: `CR_${s.slug || 'salon'}_Official.pdf`,
            fileNumber: `1010${892100 + idx}`,
            uploadedAt: '2026-01-15',
            status: 'approved' as const,
          },
          {
            id: `doc_lic_${s._id}`,
            type: 'municipality_license' as const,
            title: 'رخصة البلدية / بلدي',
            fileName: `Balady_License_${s.slug || 'salon'}.pdf`,
            fileNumber: `BLD-9981-${idx}`,
            uploadedAt: '2026-01-16',
            status: 'approved' as const,
          },
          {
            id: `doc_bank_${s._id}`,
            type: 'bank_certificate' as const,
            title: 'شهادة الحساب البنكي والآيبان (IBAN)',
            fileName: `IBAN_Certificate_${s.slug || 'salon'}.pdf`,
            uploadedAt: '2026-01-18',
            status: 'approved' as const,
          }
        ] : [
          {
            id: `doc_cr_pending_${s._id}`,
            type: 'commercial_register' as const,
            title: 'السجل التجاري',
            fileName: `CR_Pending_Review.pdf`,
            fileNumber: `1010992211`,
            uploadedAt: '2026-09-20',
            status: 'pending' as const,
          },
          {
            id: `doc_lic_pending_${s._id}`,
            type: 'municipality_license' as const,
            title: 'رخصة البلدية / بلدي',
            fileName: `Balady_License_Pending.pdf`,
            fileNumber: `BLD-2026-90`,
            uploadedAt: '2026-09-20',
            status: 'pending' as const,
          }
        ],
        isActive: true,
      };
    }))
];

export const initialServices: Service[] = [
  // Services for Salon Yara
  {
    _id: 'srv_yara_1',
    salonId: 'salon_yara',
    categoryId: 'jn7c5aa52jt70khgwsx0cb92c58cgxrk',
    name: 'قص واستشوار احترافي VIP',
    nameAr: 'قص واستشوار احترافي VIP',
    price: 150,
    currency: 'SAR',
    durationMins: 45,
    isActive: true,
    isAvailableOnline: true,
  },
  {
    _id: 'srv_yara_2',
    salonId: 'salon_yara',
    categoryId: 'jn7c5aa52jt70khgwsx0cb92c58cgxrk',
    name: 'علاج شعر وبوتوكس عضوي',
    nameAr: 'علاج شعر وبوتوكس عضوي',
    price: 350,
    currency: 'SAR',
    durationMins: 90,
    isActive: true,
    isAvailableOnline: true,
  },
  {
    _id: 'srv_yara_3',
    salonId: 'salon_yara',
    categoryId: 'jn74z1a812m177swy5j6y07r958cgkex',
    name: 'مكياج سهرة كامل مع رموش',
    nameAr: 'مكياج سهرة كامل مع رموش',
    price: 280,
    currency: 'SAR',
    durationMins: 60,
    isActive: true,
    isAvailableOnline: true,
  },
  {
    _id: 'srv_yara_4',
    salonId: 'salon_yara',
    categoryId: 'jn73104q6f3f01905t9wha1s6h8ce4c1',
    name: 'سبا بديكير ومناكير ملكي',
    nameAr: 'سبا بديكير ومناكير ملكي',
    price: 140,
    currency: 'SAR',
    durationMins: 50,
    isActive: true,
    isAvailableOnline: true,
  },
  ...((rawData.services || [])
    .filter(srv => srv.name !== 'Ceut' && srv.name !== 'Sara' && srv.name !== 'نورة')
    .map(srv => {
      return {
        ...srv,
        salonId: 'kh77cnn230ayx24dvgm71y5wcx8cpcgz', // صالون إحسان المعتمد
        price: srv.price < 20 ? 120 : srv.price,
      };
    }))
];
export const initialCategories: Category[] = rawData.categories || [];
export const initialBookings: Booking[] = (rawData.bookings || []).filter(b => {
  const serviceName = b.snapshot?.serviceName || '';
  const totalAmount = b.snapshot?.totalAmount || 0;
  // Filter out any 1.15 SAR test or cancelled draft bookings and Sara dummy items
  if (totalAmount <= 5 || serviceName === 'Sara' || serviceName === 'Ceut' || b.status === 'customer_cancelled' || b.status === 'timeout_cancelled') {
    return false;
  }
  return true;
});

export const initialUsers: User[] = [
  {
    _id: 'usr_admin',
    name: 'سعيد جمال',
    email: 'saeedalraililogistic@gmail.com',
    role: 'admin',
    phone: '0566364725',
    city: 'الرياض',
    isActive: true
  },
  {
    _id: 'usr_yara',
    name: 'يارا',
    email: 'yara@tedallaly.com',
    role: 'salon_owner',
    phone: '0555123456',
    city: 'الرياض',
    isActive: true,
    linkedProviderId: 'salon_yara'
  },
  {
    _id: 'usr_reem',
    name: 'ريم العبدالله',
    email: 'reem@tedallaly.com',
    role: 'freelancer',
    phone: '0555987654',
    city: 'الرياض',
    isActive: true,
    linkedProviderId: 'freelancer_reem'
  },
  {
    _id: 'usr_client',
    name: 'سارة العتيبي',
    email: 'sara@tedallaly.com',
    role: 'customer',
    phone: '0555112233',
    city: 'الرياض',
    isActive: true
  }
];
export const initialStaff: Staff[] = rawData.staff || [];
export const initialReviews: Review[] = rawData.reviews || [];
