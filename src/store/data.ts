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
// Realistic sample bookings over the last 30 days for dashboard analytics
const supplementary30DaysBookings: Booking[] = [
  {
    _id: 'bk_sep_01',
    appointmentDate: '2026-09-03',
    appointmentTime: '14:30',
    customerId: 'cust_01',
    salonId: '-1787048765057',
    serviceId: 'srv_1',
    status: 'completed',
    clientName: 'منى القحطاني',
    clientPhone: '0551234567',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون لوسيندا',
      serviceName: 'مكياج سهرة VIP',
      staffName: 'سارة العتيبي',
      totalAmount: 350,
      currency: 'SAR',
      depositAmount: 100,
      platformCommission: 35,
      salonPayoutAmount: 315
    }
  },
  {
    _id: 'bk_sep_02',
    appointmentDate: '2026-09-05',
    appointmentTime: '16:00',
    customerId: 'cust_02',
    salonId: '-1787048765057',
    serviceId: 'srv_2',
    status: 'completed',
    clientName: 'نورة الدوسري',
    clientPhone: '0549876543',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون لوسيندا',
      serviceName: 'تنظيف بشرة هيدرافيشل',
      staffName: 'نوف الشمري',
      totalAmount: 280,
      currency: 'SAR',
      depositAmount: 80,
      platformCommission: 28,
      salonPayoutAmount: 252
    }
  },
  {
    _id: 'bk_sep_03',
    appointmentDate: '2026-09-08',
    appointmentTime: '18:15',
    customerId: 'cust_03',
    salonId: 'salon_ehsan',
    serviceId: 'srv_3',
    status: 'customer_cancelled',
    clientName: 'هند السبيعي',
    clientPhone: '0533344556',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون إحسان للتزيين النسائي',
      serviceName: 'قص واستشوار احترافي',
      staffName: 'منى الراجحي',
      totalAmount: 180,
      currency: 'SAR',
      depositAmount: 50,
      platformCommission: 18,
      salonPayoutAmount: 162
    }
  },
  {
    _id: 'bk_sep_04',
    appointmentDate: '2026-09-10',
    appointmentTime: '13:00',
    customerId: 'cust_04',
    salonId: '-1787048765057',
    serviceId: 'srv_4',
    status: 'completed',
    clientName: 'لطيفة المطيري',
    clientPhone: '0567788990',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون لوسيندا',
      serviceName: 'صبغة وبلياج شعر رويال',
      staffName: 'سارة العتيبي',
      totalAmount: 480,
      currency: 'SAR',
      depositAmount: 150,
      platformCommission: 48,
      salonPayoutAmount: 432
    }
  },
  {
    _id: 'bk_sep_05',
    appointmentDate: '2026-09-12',
    appointmentTime: '15:45',
    customerId: 'cust_05',
    salonId: 'salon_anamil',
    serviceId: 'srv_5',
    status: 'completed',
    clientName: 'أريج الحربي',
    clientPhone: '0501122334',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'أنامل الإبداع للتجميل',
      serviceName: 'بدكير ومنكير سبا',
      staffName: 'ريم خالد',
      totalAmount: 220,
      currency: 'SAR',
      depositAmount: 60,
      platformCommission: 22,
      salonPayoutAmount: 198
    }
  },
  {
    _id: 'bk_sep_06',
    appointmentDate: '2026-09-14',
    appointmentTime: '17:30',
    customerId: 'cust_06',
    salonId: '-1787048765057',
    serviceId: 'srv_6',
    status: 'customer_cancelled',
    clientName: 'شهد التميمي',
    clientPhone: '0556677889',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون لوسيندا',
      serviceName: 'معالج بروتين للشعر',
      staffName: 'نوف الشمري',
      totalAmount: 420,
      currency: 'SAR',
      depositAmount: 120,
      platformCommission: 42,
      salonPayoutAmount: 378
    }
  },
  {
    _id: 'bk_sep_07',
    appointmentDate: '2026-09-17',
    appointmentTime: '19:00',
    customerId: 'cust_07',
    salonId: 'salon_ehsan',
    serviceId: 'srv_7',
    status: 'completed',
    clientName: 'نجود الزهراني',
    clientPhone: '0544455667',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون إحسان للتزيين النسائي',
      serviceName: 'حمام مغربي ملكي بالأعشاب',
      staffName: 'فاطمة علي',
      totalAmount: 320,
      currency: 'SAR',
      depositAmount: 100,
      platformCommission: 32,
      salonPayoutAmount: 288
    }
  },
  {
    _id: 'bk_sep_08',
    appointmentDate: '2026-09-19',
    appointmentTime: '14:00',
    customerId: 'cust_08',
    salonId: '-1787048765057',
    serviceId: 'srv_8',
    status: 'completed',
    clientName: 'خلود الشهري',
    clientPhone: '0533322110',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون لوسيندا',
      serviceName: 'تركيب رموش دائمة VIP',
      staffName: 'سارة العتيبي',
      totalAmount: 260,
      currency: 'SAR',
      depositAmount: 80,
      platformCommission: 26,
      salonPayoutAmount: 234
    }
  },
  {
    _id: 'bk_sep_09',
    appointmentDate: '2026-09-21',
    appointmentTime: '16:30',
    customerId: 'cust_09',
    salonId: 'salon_anamil',
    serviceId: 'srv_9',
    status: 'customer_cancelled',
    clientName: 'ريم الغامدي',
    clientPhone: '0566677889',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'أنامل الإبداع للتجميل',
      serviceName: 'مكياج ناعم وتسريحة ويفي',
      staffName: 'ريم خالد',
      totalAmount: 310,
      currency: 'SAR',
      depositAmount: 90,
      platformCommission: 31,
      salonPayoutAmount: 279
    }
  },
  {
    _id: 'bk_sep_10',
    appointmentDate: '2026-09-23',
    appointmentTime: '15:00',
    customerId: 'cust_10',
    salonId: '-1787048765057',
    serviceId: 'srv_10',
    status: 'completed',
    clientName: 'بيان العسيري',
    clientPhone: '0555544332',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون لوسيندا',
      serviceName: 'جلسة نضارة كولاجين للوجه',
      staffName: 'نوف الشمري',
      totalAmount: 290,
      currency: 'SAR',
      depositAmount: 90,
      platformCommission: 29,
      salonPayoutAmount: 261
    }
  },
  {
    _id: 'bk_sep_11',
    appointmentDate: '2026-09-25',
    appointmentTime: '17:15',
    customerId: 'cust_11',
    salonId: '-1787048765057',
    serviceId: 'srv_11',
    status: 'completed',
    clientName: 'دلال الشريف',
    clientPhone: '0543322119',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون لوسيندا',
      serviceName: 'مساج استرخائي بالأحجار الساخنة',
      staffName: 'فاطمة علي',
      totalAmount: 360,
      currency: 'SAR',
      depositAmount: 110,
      platformCommission: 36,
      salonPayoutAmount: 324
    }
  },
  {
    _id: 'bk_sep_12',
    appointmentDate: '2026-09-26',
    appointmentTime: '18:45',
    customerId: 'cust_12',
    salonId: 'salon_ehsan',
    serviceId: 'srv_12',
    status: 'customer_cancelled',
    clientName: 'عفاف القحطاني',
    clientPhone: '0509988776',
    conflictCheckPassed: true,
    snapshot: {
      salonName: 'صالون إحسان للتزيين النسائي',
      serviceName: 'تجهيز عروس ملكي متكامل',
      staffName: 'سارة العتيبي',
      totalAmount: 850,
      currency: 'SAR',
      depositAmount: 250,
      platformCommission: 85,
      salonPayoutAmount: 765
    }
  }
];

export const initialBookings: Booking[] = [
  ...((rawData.bookings || []).filter(b => {
    const serviceName = b.snapshot?.serviceName || '';
    const totalAmount = b.snapshot?.totalAmount || 0;
    // Filter out 1.15 SAR test bookings or dummy Sara/Ceut items
    if (totalAmount <= 5 || serviceName === 'Sara' || serviceName === 'Ceut') {
      return false;
    }
    return true;
  })),
  ...supplementary30DaysBookings
];

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
