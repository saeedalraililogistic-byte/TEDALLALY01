import React, { useState } from 'react';
import { Salon, ExternalGlamOrder } from '../../types.ts';
import { 
  Car, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Navigation, 
  Phone, 
  AlertCircle, 
  Calendar,
  Briefcase,
  TrendingUp,
  UserCheck,
  X,
  Send
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const ExternalGlamDispatcher: React.FC<Props> = ({ salon }) => {
  const [orders, setOrders] = useState<ExternalGlamOrder[]>([
    {
      id: 'ext_1',
      salonId: salon._id,
      clientName: 'أريج آل الشيخ',
      clientPhone: '+966542218899',
      locationAddress: 'برج الفيصلية، الجناح الملكي 24',
      neighborhood: 'حي العليا',
      city: 'الرياض',
      assignedStaff: 'سارة مراد (كوافير) + ليلى حاتم (ميك اب)',
      serviceNames: ['مكياج عروس VIP فندقي', 'تسريحة ويفي ملكي'],
      bookingDate: 'اليوم (الجمعة)',
      eventTime: '4:30 م',
      travelFee: 150,
      totalServiceAmount: 1800,
      status: 'on_the_way',
      toolKitChecklist: [
        { item: 'حقيبة أجهزة التصفيف والحرارة (Dyson & Babyliss)', checked: true },
        { item: 'باليت مكياج احترافي ومثبتات ضد الرطوبة', checked: true },
        { item: 'مناشف قطنية فاخرة للاستخدام الواحد', checked: true },
        { item: 'رينغ لايت متنقل مع بطارية شحن', checked: true }
      ]
    },
    {
      id: 'ext_2',
      salonId: salon._id,
      clientName: 'مشاعل المطيري',
      clientPhone: '+966509988771',
      locationAddress: 'فيلا 18، شارع أنس بن مالك',
      neighborhood: 'حي الملقا',
      city: 'الرياض',
      assignedStaff: 'إيلينا ماري (أظافر وسبا)',
      serviceNames: ['بدكير ومناكير سبا منزلي متكامل', 'جلسة مساج استرخائي'],
      bookingDate: 'غداً (السبت)',
      eventTime: '1:00 م',
      travelFee: 120,
      totalServiceAmount: 650,
      status: 'pending',
      toolKitChecklist: [
        { item: 'حوض بدكير متنقل مع كيس حماية معقم', checked: true },
        { item: 'جهاز تجفيف أظافر UV لاسلكي', checked: false },
        { item: 'زيوت ترطيب وعطور لافندر منزلية', checked: true }
      ]
    },
    {
      id: 'ext_3',
      salonId: salon._id,
      clientName: 'خلود العتيبي',
      clientPhone: '+966553311224',
      locationAddress: 'فندق الفورسيزونز، قاعة المملكة',
      neighborhood: 'حي العليا',
      city: 'الرياض',
      assignedStaff: 'رزان الحربي (مصففة شعر)',
      serviceNames: ['تجهيز تسريحات مرافقة عروس (3 تسريحات)'],
      bookingDate: 'أمس',
      eventTime: '6:00 م',
      travelFee: 150,
      totalServiceAmount: 1200,
      status: 'completed',
      toolKitChecklist: [
        { item: 'مثبتات شعر قوية ومستلزمات بنسات وحشوات', checked: true },
        { item: 'حقيبة أدوات معقمة', checked: true }
      ]
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<ExternalGlamOrder | null>(orders[0]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const totalExternalEarnings = orders.reduce((sum, o) => sum + o.totalServiceAmount + o.travelFee, 0);

  const handleUpdateStatus = (orderId: string, newStatus: ExternalGlamOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    const statusLabels: Record<ExternalGlamOrder['status'], string> = {
      pending: 'قيد التجهيز',
      on_the_way: 'في الطريق إلى موقع العميلة 🚗',
      in_service: 'جاري تقديم الخدمة في الموقع ✨',
      completed: 'اكتملت الخدمة بنجاح ✓',
      cancelled: 'تم الإلغاء'
    };
    setSuccessToast(`تم تحديث حالة الفريق الخارجي إلى: "${statusLabels[newStatus]}"`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleToggleChecklist = (orderId: string, itemIdx: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = [...o.toolKitChecklist];
        updated[itemIdx] = { ...updated[itemIdx], checked: !updated[itemIdx].checked };
        return { ...o, toolKitChecklist: updated };
      }
      return o;
    }));

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => {
        if (!prev) return null;
        const updated = [...prev.toolKitChecklist];
        updated[itemIdx] = { ...updated[itemIdx], checked: !updated[itemIdx].checked };
        return { ...prev, toolKitChecklist: updated };
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1.5">
            <Car className="w-3.5 h-3.5 text-indigo-500" />
            <span>الخدمات المنزلية والفندقية • حاسبة التوصيل التلقائية</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            إدارة فريق الضيافة والمناسبات الخارجية (Home & Venue Glam Squad Dispatcher)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدولة مواعيد المنازل والفنادق مع حساب رسوم الانتقال الجغرافي حسب الحي آلياً، وتتبع حقائب الأدوات وموقع الأخصائيات لضمان وصولهن في الموعد المحدد.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <Navigation className="w-4 h-4 text-indigo-500" />
          <span>مربوط بخرائط جوجل</span>
        </span>
      </div>

      {/* Value Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي حجوزات الخدمات الخارجية المدفوعة</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            SAR {totalExternalEarnings.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">تشمل رسوم الخدمات ورسوم الانتقال الجغرافي</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900/50 border border-rose-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">مواعيد خارجية نشطة اليوم</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {orders.filter(o => o.status === 'on_the_way' || o.status === 'in_service').length} مهام
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            جميعها مدفوعة بالكامل 100% مسبقاً
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-slate-900/50 border border-emerald-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">حاسبة رسوم التوصيل حسب الحي</div>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
            تحتسب تلقائياً عند الدفع
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مثال: حي الملقا (120 SAR) • فنادق العليا (150 SAR)
          </div>
        </div>
      </div>

      {/* Main Grid: Orders on Left, Details/Checklist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* List of Orders */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">جدول الحجوزات الخارجية ومواقع العميلات</h4>
          <div className="space-y-3">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOrder?.id === order.id
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{order.clientName}</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {order.neighborhood}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{order.locationAddress}</span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      الأخصائية المعينة: <span className="font-bold text-slate-800 dark:text-slate-200">{order.assignedStaff}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      SAR {(order.totalServiceAmount + order.travelFee).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      (يشمل التوصيل: SAR {order.travelFee})
                    </span>

                    {order.status === 'on_the_way' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                        <Car className="w-3 h-3" />
                        <span>في الطريق للعميلة</span>
                      </span>
                    )}

                    {order.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        قيد التجهيز
                      </span>
                    )}

                    {order.status === 'completed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        اكتملت الخدمة ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details & Tool Kit Checklist */}
        {selectedOrder && (
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">تفاصيل المهمة الخارجية</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{selectedOrder.clientName}</h4>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{selectedOrder.clientPhone}</span>
              </div>
            </div>

            {/* Google Map Link & Call */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedOrder.locationAddress + ' ' + selectedOrder.neighborhood + ' ' + selectedOrder.city)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>فتح بالخرائط</span>
              </a>

              <a
                href={`https://wa.me/${selectedOrder.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${selectedOrder.clientName} 🌸، فريق صالون ${salon.salonName} في الطريق إليكِ لتقديم خدماتكِ!`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>واتساب العميلة</span>
              </a>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">تحديث حالة الفريق:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'on_the_way')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedOrder.status === 'on_the_way'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🚗 انطلق في الطريق
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'in_service')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedOrder.status === 'in_service'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ✨ جاري الخدمة
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                  className={`col-span-2 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedOrder.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  ✓ تم الانتهاء بنجاح
                </button>
              </div>
            </div>

            {/* Toolkit Checklist */}
            <div className="pt-3 border-t border-indigo-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>قائمة تأكيد شنطة الأدوات والمواد:</span>
              </span>
              <div className="space-y-1.5">
                {selectedOrder.toolKitChecklist.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => handleToggleChecklist(selectedOrder.id, idx)}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-900/60"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      readOnly
                      className="mt-0.5 rounded text-indigo-600 focus:ring-0"
                    />
                    <span className={item.checked ? 'line-through text-slate-400' : ''}>
                      {item.item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
