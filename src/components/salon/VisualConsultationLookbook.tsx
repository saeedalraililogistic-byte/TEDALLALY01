import React, { useState } from 'react';
import { Salon, ConsultationLook } from '../../types.ts';
import { 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  Upload, 
  Eye, 
  Clock, 
  Plus, 
  Layers, 
  TrendingUp, 
  X,
  FileText,
  Palette
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const VisualConsultationLookbook: React.FC<Props> = ({ salon }) => {
  const [looks, setLooks] = useState<ConsultationLook[]>([
    {
      id: 'look_1',
      salonId: salon._id,
      title: 'بالياج كراميل عسلي دافئ (Warm Honey Balayage)',
      category: 'صبغات وهايلايت',
      imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
      description: 'صبغة متدرجة ناعمة تعطي كثافة وإشراقة طبيعية للشعر البني والأسود',
      estimatedDuration: '120 دقيقة',
      recommendedFormulas: 'سحب لون بأوكسجين 20vol + رينساج 8.31 مع نقطة 9.12'
    },
    {
      id: 'look_2',
      salonId: salon._id,
      title: 'أظافر فرنش كروم لؤلؤي جليزد (Glazed Donut Chrome)',
      category: 'فن الأظافر',
      imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=80',
      description: 'ستايل عصري وناعم يعكس الضوء اللؤلؤي مناسب للمناسبات والعرائس',
      estimatedDuration: '45 دقيقة',
      recommendedFormulas: 'بيس جل وردي شفاف + بودرة كروم وايت ميرور'
    },
    {
      id: 'look_3',
      salonId: salon._id,
      title: 'تسريحة ويفي ملكي هوليوودي (Hollywood Glam Waves)',
      category: 'تسريحات ومناسبات',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
      description: 'تموجات عريضة منتظمة ومصقولة تدوم لأكثر من 12 ساعة بدون تطاير',
      estimatedDuration: '60 دقيقة',
      recommendedFormulas: 'موس حجم + سيروم حماية حرارية 230C + سبراي تثبيت فلكسبل'
    }
  ]);

  const [clientRequests] = useState([
    {
      id: 'req_1',
      clientName: 'أفنان الشمري',
      serviceBooked: 'صبغة وتفتيح',
      appointmentDate: 'اليوم - 5:00 م',
      uploadedImage: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&auto=format&fit=crop&q=80',
      hairLength: 'طويل تحت الكتف',
      hairDensity: 'كثافة متوسطة',
      clientNote: 'أريد نفس درجة الإلهام تماماً بدون سحب لون حاد، شعري مصبوغ أسود قبل 9 أشهر'
    },
    {
      id: 'req_2',
      clientName: 'سارة الدخيل',
      serviceBooked: 'أظافر جل آرت',
      appointmentDate: 'غداً - 3:30 م',
      uploadedImage: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&auto=format&fit=crop&q=80',
      hairLength: 'طول أظافر لوزي متوسط',
      hairDensity: 'أظافر طبيعية مقواة',
      clientNote: 'تريد أطراف أومبري كروم لؤلؤي مع وردة ناعمة على إصبع الخاتم'
    }
  ]);

  const [isAddingLook, setIsAddingLook] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('صبغات وهايلايت');
  const [formDuration, setFormDuration] = useState('60 دقيقة');
  const [formDesc, setFormDesc] = useState('');
  const [formFormula, setFormFormula] = useState('');

  const handleAddLook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const newLook: ConsultationLook = {
      id: 'look_' + Date.now(),
      salonId: salon._id,
      title: formTitle,
      category: formCategory,
      imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=80',
      description: formDesc || 'إطلالة عصرية متألقة من صالون تدللي',
      estimatedDuration: formDuration,
      recommendedFormulas: formFormula
    };

    setLooks(prev => [newLook, ...prev]);
    setIsAddingLook(false);
    setFormTitle('');
    setFormDesc('');
    setFormFormula('');
    setSuccessToast(`تمت إضافة إطلالة "${formTitle}" لكتالوج الإلهام العام للعميلات! 🎨`);
    setTimeout(() => setSuccessToast(null), 4500);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold mb-1.5">
            <Palette className="w-3.5 h-3.5 text-pink-500" />
            <span>كتالوج الإلهام والاستشارة البصرية المسبقة</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            الاستشارة البصرية وكتالوج الإلهام للعميلات (Visual Lookbook & Pre-Consultation)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ترفع العميلة صورة الإلهام (Inspiration Photo) أثناء الحجز أو تختار من أعمال الصالون، لتصل الأخصائية جاهزة بالخلطات ومحضرة بالكامل، موفرة 20 دقيقة نقاش في كل موعد!
          </p>
        </div>

        <button
          onClick={() => setIsAddingLook(!isAddingLook)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إطلالة للكتالوج</span>
        </button>
      </div>

      {/* Incoming Pre-Consultations from Clients */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>طلبات استشارة الإلهام المرفوعة من العميلات لمواعيد اليوم والغد</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientRequests.map(req => (
            <div key={req.id} className="p-4 rounded-xl border border-rose-200 dark:border-slate-800 bg-rose-50/30 dark:bg-slate-900/40 flex gap-3.5 items-start">
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100">
                <img
                  src={req.uploadedImage}
                  alt={req.clientName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{req.clientName}</span>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-full">
                    {req.appointmentDate}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">الخدمة المحجوزة: <span className="font-bold text-slate-700 dark:text-slate-300">{req.serviceBooked}</span></div>
                <div className="text-[11px] text-slate-500">مواصفات الشعر: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.hairLength} • {req.hairDensity}</span></div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-1 italic leading-relaxed">
                  "{req.clientNote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Look Form */}
      {isAddingLook && (
        <form onSubmit={handleAddLook} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">إضافة إطلالة جديدة لكتالوج صالونك</h4>
            <button type="button" onClick={() => setIsAddingLook(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الإطلالة أو التسريحة</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="مثال: صبغة برونيت شوكولاتة"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">التصنيف</label>
              <input
                type="text"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">المدة التقديرية</label>
              <input
                type="text"
                value={formDuration}
                onChange={e => setFormDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">الوصف العام للإطلالة</label>
              <input
                type="text"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="مثال: تموجات فاخرة تناسب فساتين السهرة ذات الياقات العالية"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">التركيبة أو المواد الموصى بها للأخصائية</label>
              <input
                type="text"
                value={formFormula}
                onChange={e => setFormFormula(e.target.value)}
                placeholder="مثال: صبغة 6.71 مع أوكسجين 20vol وماسك ترميم"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingLook(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              حفظ الإطلالة في الكتالوج
            </button>
          </div>
        </form>
      )}

      {/* Lookbook Gallery */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">كتالوج إطلالات الصالون المميزة (Signature Looks)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {looks.map(look => (
            <div key={look.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between hover:border-pink-300 transition-all group">
              <div className="space-y-3">
                <div className="relative h-44 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={look.imageUrl}
                    alt={look.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>{look.estimatedDuration}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-md">
                    {look.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {look.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {look.description}
                  </p>
                </div>
              </div>

              {look.recommendedFormulas && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">تركيبة الصالون:</span>
                  <span className="italic">{look.recommendedFormulas}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
