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
  categories?: Category[];
};

// CLEAN SLATE INITIALIZATION:
// All legacy test salons ("صالون إحسان", "أنامل ناعمة", etc.) are completely eliminated.
// New salons will be registered fresh by providers and verified by Admin.
export const initialSalons: Salon[] = [];
export const initialServices: Service[] = [];
export const initialCategories: Category[] = rawData.categories || [];
export const initialBookings: Booking[] = [];

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
    _id: 'usr_client',
    name: 'سارة العتيبي',
    email: 'sara@tedallaly.com',
    role: 'customer',
    phone: '0555112233',
    city: 'الرياض',
    isActive: true
  }
];

export const initialStaff: Staff[] = [];
export const initialReviews: Review[] = [];
