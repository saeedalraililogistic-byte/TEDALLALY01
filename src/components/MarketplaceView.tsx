import React, { useState } from 'react';
import { Salon, Service, Category, Booking, FlashOffer } from '../types.ts';
import { SalonsGoogleMap } from './SalonsGoogleMap.tsx';
import { SalonPublicProfileModal } from './SalonPublicProfileModal.tsx';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  ChevronLeft, 
  CheckCircle2, 
  Phone,
  Filter,
  Map as MapIcon,
  LayoutGrid,
  Heart,
  Award,
  Zap,
  Tag,
  Flame
} from 'lucide-react';

interface Props {
  salons: Salon[];
  services: Service[];
  categories: Category[];
  flashOffers?: FlashOffer[];
  onBookService: (salon: Salon, service: Service) => void;
}

export const MarketplaceView: React.FC<Props> = ({
  salons,
  services,
  categories,
  flashOffers,
  onBookService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);

  // Default high-quality flash offers if none passed
  const defaultFlashOffers: FlashOffer[] = [
    {
      id: 'fo_1',
      salonId: salons[0]?._id || 'kh77cnn230ayx24dvgm71y5wcx8cpcgz',
      salonName: salons[0]?.salonName || 'صالون احسان',
      serviceTitle: 'مناكير وباديكير عناية كاملة',
      originalPrice: 120,
      discountPrice: 85,
      discountPercentage: 29,
      validTimeWindow: 'اليوم: 2:00 م - 4:30 م',
      remainingSeats: 2,
      expiresInMinutes: 45,
    },
    {
      id: 'fo_2',
      salonId: salons[0]?._id || 'kh77cnn230ayx24dvgm71y5wcx8cpcgz',
      salonName: salons[0]?.salonName || 'صالون احسان',
      serviceTitle: 'قص واستشوار احترافي',
      originalPrice: 150,
      discountPrice: 105,
      discountPercentage: 30,
      validTimeWindow: 'اليوم: 5:00 م - 7:00 م',
      remainingSeats: 1,
      expiresInMinutes: 90,
    }
  ];

  const activeFlashOffers = (flashOffers && flashOffers.length > 0) ? flashOffers : defaultFlashOffers;

  const filteredSalons = salons.filter(s => {
    // Strict compliance rule: Only officially verified salons with approved commercial documents appear to clients
    if (s.status !== 'verified') {
      return false;
    }

    const matchesSearch = s.salonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCity = selectedCity === 'all' || s.city.toLowerCase().includes(selectedCity.toLowerCase());

    if (selectedCategory === 'flash_deals') {
      const hasFlash = activeFlashOffers.some(f => f.salonId === s._id || (f.salonName && f.salonName.includes(s.salonName)));
      return matchesSearch && matchesCity && hasFlash;
    }

    return matchesSearch && matchesCity;
  });

  const getCategoryServices = (salonId: string) => {
    return services.filter(srv => {
      const matchesSalon = srv.salonId === salonId;
      const matchesCat = selectedCategory === 'all' || selectedCategory === 'flash_deals' || srv.categoryId === selectedCategory;
      return matchesSalon && matchesCat;
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Luxury Banner with Search */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-100/90 via-pink-50 to-white dark:from-rose-950/70 dark:via-slate-900 dark:to-indigo-950/60 border border-rose-200/80 dark:border-rose-500/20 p-6 sm:p-10 shadow-lg shadow-rose-900/5 transition-all">
        {/* Subtle decorative glow elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-400/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10"></div>

        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/10 dark:bg-rose-500/15 border border-rose-600/20 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            منصة تدلّلي (Tedallaly) • بوابتك نحو الفخامة والجمال
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            احجزي أرقى خدمات الصالونات والتجميل بكل سهولة
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            اختاري من بين نخبة الصالونات المعتمدة في المملكة والخليج. تم تأمين ومزامنة كافة الحجوزات والخدمات سحابياً لتجربة استثنائية.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحثي عن صالون، خدمة، أو حي..."
                className="w-full bg-white dark:bg-slate-950/90 border border-rose-200 dark:border-slate-700/80 rounded-2xl pr-11 pl-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-xs transition-all"
              />
            </div>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="bg-white dark:bg-slate-950/90 border border-rose-200 dark:border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-xs"
            >
              <option value="all">جميع المدن (الرياض، جدة...)</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills with Brand Colors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-500" />
            التصنيفات المتاحة ({categories.length} تصنيف)
          </h3>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">✨ خدمات حصرية</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-slate-200 hover:border-rose-300'
            }`}
          >
            جميع التصنيفات
          </button>

          {/* Distinctive Red Badge Filter for Last-Minute Deals */}
          <button
            onClick={() => setSelectedCategory('flash_deals')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'flash_deals'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400 fill-red-500" />
            <span>عروض اللحظة الأخيرة ({activeFlashOffers.length})</span>
          </button>

          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === c._id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-slate-200 hover:border-rose-300'
              }`}
            >
              {c.nameAr || c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Google Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">خريطة الصالونات المعتمدة ومواقع الفروع</span>
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-white hover:border-rose-400 transition-colors shadow-xs"
          >
            {showMap ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-rose-500" />
                <span>إخفاء الخريطة مؤقتاً</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>إظهار خريطة Google Maps</span>
              </>
            )}
          </button>
        </div>

        {showMap && (
          <SalonsGoogleMap
            salons={filteredSalons}
            selectedSalon={selectedSalon}
            onSelectSalon={(salon) => setSelectedSalon(salon)}
            userCity={selectedCity}
          />
        )}
      </div>

      {/* Flash Booster: Last Minute Offers Section with Distinctive Red Badges */}
      <div className="bg-gradient-to-r from-red-600/10 via-rose-500/10 to-amber-500/10 border-2 border-red-500/40 dark:border-red-500/30 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-red-600/30 animate-pulse">
              ⚡
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>عروض اللحظة الأخيرة (Flash Deals)</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  🔴 شارة التخفيض اللحظي
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                كراسي شاغرة بالساعات القادمة — احجزي الآن بخصومات تصل إلى 40% قبل نفاد الشواغر
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-red-600 dark:text-red-400 flex items-center gap-1 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-xl border border-red-200 dark:border-red-800">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>تحديث حي للكراسي الشاغرة ⏱️</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {activeFlashOffers.map((offer) => {
            const salon = salons.find(s => s._id === offer.salonId || s.salonName === offer.salonName) || salons[0];
            const salonService = services.find(s => s.salonId === salon?._id && (s.nameAr === offer.serviceTitle || s.name === offer.serviceTitle)) || services[0];

            return (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-950/80 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-4 space-y-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Visual subtle red corner accent */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-red-500/10 rounded-full blur-xl pointer-events-none"></div>

                <div>
                  {/* Distinctive Red Badge Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black text-xs shadow-xs animate-pulse">
                      <Zap className="w-3 h-3 fill-white" />
                      <span>🔴 خصم {offer.discountPercentage}%</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                      ⚡ متبقي {offer.remainingSeats} {offer.remainingSeats === 1 ? 'كرسي' : 'كراسي'}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {offer.salonName}
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 group-hover:text-red-600 transition-colors">
                      {offer.serviceTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-bold mt-2 bg-red-50/70 dark:bg-red-950/30 p-1.5 rounded-xl border border-red-100 dark:border-red-900/40">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{offer.validTimeWindow}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-red-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-red-600 dark:text-red-400">
                      SAR {offer.discountPrice}
                    </span>
                    <span className="text-xs line-through text-slate-400">
                      SAR {offer.originalPrice}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (salon && salonService) {
                        onBookService(salon, { 
                          ...salonService, 
                          nameAr: offer.serviceTitle, 
                          price: offer.discountPrice 
                        });
                      }
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm shadow-red-600/20 active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>حجز بالخصم ⚡</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Salons Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            قائمة الصالونات المعتمدة ({filteredSalons.length})
          </h3>
          {selectedCategory === 'flash_deals' && (
            <span className="text-xs font-black text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>عرض الصالونات ذات الشواغر اللحظية فقط</span>
              <button 
                onClick={() => setSelectedCategory('all')} 
                className="underline text-slate-400 hover:text-slate-600 mr-2"
              >
                (إلغاء التصفية)
              </button>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSalons.map(salon => {
            const salonServices = getCategoryServices(salon._id);
            const salonFlash = activeFlashOffers.find(f => f.salonId === salon._id || (f.salonName && f.salonName.includes(salon.salonName)));

            return (
              <div
                key={salon._id}
                className={`bg-white dark:bg-[#13141f] rounded-3xl overflow-hidden transition-all flex flex-col justify-between group relative ${
                  salonFlash
                    ? 'border-2 border-red-500/80 shadow-md shadow-red-600/5 hover:border-red-600 dark:border-red-500/70'
                    : 'border border-rose-100 dark:border-slate-800 hover:border-rose-400/70 hover:shadow-xl hover:shadow-rose-950/5 dark:hover:border-rose-500/40'
                }`}
              >
                {/* Prominent Red Banner Header for Salons with Active Flash Offers */}
                {salonFlash && (
                  <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-black shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>🔴 عرض اللحظة الأخيرة ⚡ (خصم {salonFlash.discountPercentage}%)</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                      {salonFlash.validTimeWindow}
                    </span>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-rose-600 transition-colors">
                          {salon.salonName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          salon.providerType === 'freelancer'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {salon.providerType === 'freelancer' ? 'مستقلة • خدمة منزلية/استديو' : 'صالون تجاري'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{salon.city} {salon.address ? `• ${salon.address}` : ''}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      معتمد
                    </span>
                  </div>

                  {salon.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {salon.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-rose-100/70 dark:border-slate-800/80">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{salon.averageRating || '4.8'}</span>
                      <span className="text-slate-400 font-normal">({salon.totalReviews || 12})</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {salon.totalBookings ? `${salon.totalBookings} حجز سابق` : 'حجوزات نشطة'}
                    </div>
                  </div>

                  {/* Services preview */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                      الخدمات المتوفرة ({salonServices.length}):
                    </span>
                    <div className="space-y-2">
                      {salonServices.length > 0 ? (
                        salonServices.slice(0, 3).map(s => {
                          const isFlashService = salonFlash && (salonFlash.serviceTitle.includes(s.nameAr || s.name) || (s.nameAr && s.nameAr.includes(salonFlash.serviceTitle)));
                          const effectivePrice = isFlashService ? salonFlash.discountPrice : s.price;

                          return (
                            <div
                              key={s._id}
                              className={`flex items-center justify-between text-xs p-2.5 rounded-xl border transition-colors ${
                                isFlashService
                                  ? 'bg-red-50/70 dark:bg-red-950/40 border-red-300 dark:border-red-900/60'
                                  : 'bg-rose-50/40 dark:bg-slate-950/60 border-rose-100/70 dark:border-slate-800/80 hover:border-rose-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isFlashService && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px] shrink-0 animate-pulse">
                                    🔴 خصم {salonFlash.discountPercentage}%
                                  </span>
                                )}
                                <span className="text-slate-800 dark:text-slate-200 font-bold truncate">{s.nameAr || s.name}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isFlashService ? (
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-black text-red-600 dark:text-red-400">{effectivePrice} {s.currency}</span>
                                    <span className="line-through text-slate-400 text-[10px]">{s.price}</span>
                                  </div>
                                ) : (
                                  <span className="font-black text-rose-600 dark:text-emerald-400">{s.price} {s.currency}</span>
                                )}
                                <button
                                  onClick={() => onBookService(salon, { ...s, price: effectivePrice })}
                                  className={`px-3 py-1 rounded-lg text-white text-[11px] font-bold transition-all shadow-xs hover:shadow-md cursor-pointer ${
                                    isFlashService
                                      ? 'bg-red-600 hover:bg-red-500 font-black'
                                      : 'bg-rose-600 hover:bg-rose-500'
                                  }`}
                                >
                                  {isFlashService ? 'حجز العرض ⚡' : 'حجز'}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-slate-400 dark:text-slate-500 py-1">
                          لا توجد خدمات مطابقة للتصنيف المختار
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-rose-50/30 dark:bg-slate-950/60 border-t border-rose-100/70 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-mono">{salon.phone || '0500000000'}</span>
                  </div>
                  <button
                    onClick={() => setSelectedSalon(salon)}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    عرض الملف والخدمات
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Salon Public Profile Modal */}
      {selectedSalon && (
        <SalonPublicProfileModal
          salon={selectedSalon}
          services={services}
          onClose={() => setSelectedSalon(null)}
          onBookService={(salon, service) => {
            setSelectedSalon(null);
            onBookService(salon, service);
          }}
        />
      )}
    </div>
  );
};
