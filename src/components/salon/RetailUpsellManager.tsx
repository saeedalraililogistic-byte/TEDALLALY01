import React, { useState } from 'react';
import { Salon, RetailProduct } from '../../types.ts';
import { 
  ShoppingBag, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  DollarSign, 
  Eye, 
  AlertCircle,
  Tag,
  X,
  Edit2
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const RetailUpsellManager: React.FC<Props> = ({ salon }) => {
  const [products, setProducts] = useState<RetailProduct[]>([
    {
      id: 'prod_1',
      salonId: salon._id,
      title: 'ماسك أولابلكس رقم 3 لإصلاح الروابط والشعر المصبوغ',
      category: 'عناية بالشعر',
      price: 145,
      stock: 14,
      imageUrl: 'https://images.unsplash.com/photo-1608248597359-009180746b5a?w=400&auto=format&fit=crop&q=80',
      description: 'يقترح تلقائياً عند حجز جلسات الصبغة وسحب اللون لحماية لون الشعر وتغذيته',
      compatibleServices: ['صبغة', 'هايلايت', 'معالج'],
      salesCount: 42
    },
    {
      id: 'prod_2',
      salonId: salon._id,
      title: 'سيروم كيراتين وأرجان موروكان أويل النقي (100 مل)',
      category: 'معالجة وترطيب',
      price: 180,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80',
      description: 'يُعرض للعميلة في صفحة الدفع لجلسات السشوار والقص لمنع التقصف وإضفاء لمعان فاخر',
      compatibleServices: ['سشوار', 'قص', 'بروتين'],
      salesCount: 65
    },
    {
      id: 'prod_3',
      salonId: salon._id,
      title: 'زيت مغذي للجلد الميت للأظافر بخلاصة فيتامين E',
      category: 'عناية بالأظافر',
      price: 55,
      stock: 22,
      imageUrl: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&auto=format&fit=crop&q=80',
      description: 'إضافة فورية بسعر رمزي للعميلات عند حجز جلسات البدكير والمناكير',
      compatibleServices: ['بدكير', 'مناكير', 'جل'],
      salesCount: 89
    }
  ]);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('عناية بالشعر');
  const [formPrice, setFormPrice] = useState('95');
  const [formStock, setFormStock] = useState('10');
  const [formDesc, setFormDesc] = useState('');

  const totalRetailEarnings = products.reduce((sum, p) => sum + (p.price * p.salesCount), 0);
  const totalItemsSold = products.reduce((sum, p) => sum + p.salesCount, 0);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    const newProd: RetailProduct = {
      id: 'prod_' + Date.now(),
      salonId: salon._id,
      title: formTitle,
      category: formCategory,
      price: parseFloat(formPrice) || 50,
      stock: parseInt(formStock) || 10,
      imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80',
      description: formDesc || 'منتج عناية منزلية فاخر من الصالون',
      salesCount: 0
    };

    setProducts(prev => [newProd, ...prev]);
    setIsAddingProduct(false);
    setFormTitle('');
    setFormDesc('');
    setSuccessToast(`تمت إضافة منتج "${formTitle}" ليظهر كإضافة ذكية في شاشة الدفع للعميلات! 🛍️`);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
            <span>زيادة مبيعات أرفف الصالون (Retail Upsell Engine)</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            شراء منتجات العناية المنزلية كإضافة عند الدفع (Checkout Product Add-ons)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            أثناء قيام العميلة بحجز خدمتها، يقترح النظام منتجات العناية المناسبة لتضيفها بضغطة زر وتدفع قيمتها بالكامل، وتجدها مغلفة بانتظارها عند وصولها للصالون!
          </p>
        </div>

        <button
          onClick={() => setIsAddingProduct(!isAddingProduct)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج للأرفف الذكية</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-slate-900/50 border border-emerald-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي مبيعات المنتجات عبر شاشة الحجز</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            SAR {totalRetailEarnings.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            إيراد إضافي للصالون بنسبة 100% بدون أي تسويق داخل الصالون
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900/50 border border-rose-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">قطع منتجات بيعت مع الحجوزات</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalItemsSold} عبوة
          </div>
          <div className="text-[11px] text-slate-400 mt-1">تم تسليمها جاهزة ومغلفة بأسماء العميلات</div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-200/70 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">معدل تحويل إضافة المنتج (Conversion)</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            28.4%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">من كل 4 حجوزات، عميلة تشتري منتجاً للعناية</div>
        </div>
      </div>

      {/* Add Product Form */}
      {isAddingProduct && (
        <form onSubmit={handleAddProduct} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">إضافة منتج جديد يظهر في شاشة دفع العميلات</h4>
            <button type="button" onClick={() => setIsAddingProduct(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المنتج</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="مثال: شامبو كولاجين خالي من السلفات"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">السعر (SAR)</label>
              <input
                type="number"
                value={formPrice}
                onChange={e => setFormPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">الكمية المتوفرة</label>
              <input
                type="number"
                value={formStock}
                onChange={e => setFormStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">وصف المنتج وجاذبيته عند الدفع</label>
            <input
              type="text"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="مثال: يحافظ على حيوية الصبغة ويمنع جفاف الأطراف بعد المعالجة"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingProduct(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              حفظ وتفعيل في الدفع
            </button>
          </div>
        </form>
      )}

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(prod => (
          <div key={prod.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between hover:border-rose-300 transition-all group">
            <div className="space-y-3">
              <div className="relative h-36 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <img
                  src={prod.imageUrl}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur-xs shadow-xs">
                  المخزون: {prod.stock} قطع
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                  SAR {prod.price}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                  {prod.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-2 leading-snug">
                  {prod.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{prod.salesCount} مبيعة عند الدفع</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                SAR {(prod.price * prod.salesCount).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
