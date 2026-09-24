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
  ...((rawData.salons || [])
    .filter(s => 
      !s.salonName.includes('التجريبي') && 
      !s.salonName.includes('Hshshajak') && 
      s.salonName !== 'My Salon' &&
      s.salonName !== 'Salon yara'
    )
    .map((s, idx) => {
      const isInitiallyVerified = s.status === 'verified';
      return {
        ...s,
        providerType: 'salon' as const,
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
export const initialBookings: Booking[] = rawData.bookings || [];

export const initialUsers: User[] = [
  {
    _id: 'usr_admin',
    name: 'سعيد جمال',
    email: 'saeedalraililogistic@gmail.com',
    role: 'admin',
    phone: '0566364725',
    city: 'جدة',
    isActive: true
  },
  {
    _id: 'usr_salon_ehsan',
    name: 'إدارة صالون إحسان',
    email: 'historytime29@gmail.com',
    role: 'salon_owner',
    phone: '0566364725',
    city: 'جدة',
    linkedProviderId: 'kh77cnn230ayx24dvgm71y5wcx8cpcgz',
    isActive: true
  },
  {
    _id: 'usr_salon_anamil',
    name: 'إدارة صالون أنامل ناعمة',
    email: 'anamil@tedallaly.com',
    role: 'salon_owner',
    phone: '0564505943',
    city: 'جدة',
    linkedProviderId: 'kh79dwc8bfs0gqzdf605ay17ph8derhw',
    isActive: true
  },
  {
    _id: 'usr_client',
    name: 'نورة المنصور',
    email: 'noura@example.com',
    role: 'customer',
    phone: '0566334455',
    city: 'جدة',
    isActive: true
  }
];
export const initialStaff: Staff[] = rawData.staff || [];
export const initialReviews: Review[] = rawData.reviews || [];
