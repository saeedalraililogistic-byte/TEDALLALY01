import React, { useState } from 'react';
import { Salon, ClientHairProfile } from '../../types.ts';
import { 
  User, 
  Palette, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Camera, 
  Plus, 
  Search, 
  CheckCircle2,
  FileText,
  Heart
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export const ClientFormulasManager: React.FC<Props> = ({ salon }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ClientHairProfile[]>([
    {
      id: 'hp_1',
      clientId: 'c_101',
      clientName: 'أروى السبيعي',
      clientPhone: '0551234567',
      hairType: 'مموج ناعم • مسامية متوسطة',
      colorFormula: 'Igora Royal 8-1 (30g) + 9-7 (15g) مع أكسجين 20 Vol (45ml) - وقت الانتظار 35 دقيقة',
      sensitivities: 'تحسس خفيف من الأمونيا العالية - تم استخدام واقي الفروة Scalp Protect قبل التطبيق',
      stylistNotes: 'العميلة تفضل الغسيل بماء فاتر وتجنب السشوار الحار جداً بالقرب من الجذور',
      lastVisitDate: '2026-09-02',
      favoriteStylist: 'سارة محمد',
    },
    {
      id: 'hp_2',
      clientId: 'c_102',
      clientName: 'خلود التميمي',
      clientPhone: '0509876543',
      hairType: 'سميك كثيف • مسامية عالية (معالج بروتين قبل 4 شهور)',
      colorFormula: 'Wella Koleston 7/00 (40g) + 7/1 (20g) مع أكسجين 20 Vol (60ml) لتغطية الشيب 100%',
      sensitivities: 'لا توجد حساسيات معروفة',
      stylistNotes: 'تحب درجات الأشقر الزيتوني الرمادي البارد، وتطلب دائماً إضافة جلسة ترطيب ألوفيرا',
      lastVisitDate: '2026-08-20',
      favoriteStylist: 'أمل الشمري',
    },
    {
      id: 'hp_3',
      clientId: 'c_103',
      clientName: 'ليان الحربي',
      clientPhone: '0543219876',
      hairType: 'ناعم جداً وخفيف • مسامية منخفضة',
      colorFormula: 'تفتيح بالياج خصل رفيعة بدرجة بيج بلوند 9.3 مع تونر Dialight 9.12',
      sensitivities: 'فروة رأس جافة سريعة التهيج',
      stylistNotes: 'تحب تدليك الرأس أثناء الغسيل وتفضل سشوار ويفي طبيعي واسع',
      lastVisitDate: '2026-09-10',
      favoriteStylist: 'سارة محمد',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newFormula, setNewFormula] = useState('');
  const [newHairType, setNewHairType] = useState('');
  const [newSensitivities, setNewSensitivities] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filtered = profiles.filter(p => 
    p.clientName.includes(searchQuery) || 
    p.clientPhone.includes(searchQuery) ||
    p.colorFormula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newProfile: ClientHairProfile = {
      id: 'hp_' + Date.now(),
      clientId: 'c_' + Date.now(),
      clientName: newClientName,
      clientPhone: '05' + Math.floor(10000000 + Math.random() * 90000000),
      hairType: newHairType || 'عادي • مسامية متوسطة',
      colorFormula: newFormula || 'لم يتم تسجيل صبغة بعد',
      sensitivities: newSensitivities || 'لا توجد حساسيات مسجلة',
      stylistNotes: newNotes || 'سجل جديد',
      lastVisitDate: new Date().toISOString().split('T')[0],
      favoriteStylist: 'طاقم العمل',
    };

    setProfiles([newProfile, ...profiles]);
    setIsAdding(false);
    setNewClientName('');
    setNewFormula('');
    setNewHairType('');
    setNewSensitivities('');
    setNewNotes('');
  };

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold mb-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>ملف صبغات وبشرة العميلات السحابي</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            البطاقة الرقمية لتاريخ صبغات وبشرة العميلة (Client Formula & Hair Profile)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            احفظي التركيبة الدقيقة لصبغة كل عميلة (أرقام الصبغة، نسبة الأكسجين، مسامية الشعر والحساسية) لضمان نفس النتيجة المذهلة كل زيارة.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة بطاقة صبغة لعميلة</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحثي باسم العميلة، رقم الجوال، أو رقم تركيبة الصبغة (مثل 7.1)..."
          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreateProfile} className="p-4 bg-rose-50/40 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>تسجيل تركيبة صبغة ومواصفات شعر جديدة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">اسم العميلة:</label>
              <input
                type="text"
                required
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                placeholder="مثال: نورة السعيد"
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">نوع ومسامية الشعر:</label>
              <input
                type="text"
                value={newHairType}
                onChange={e => setNewHairType(e.target.value)}
                placeholder="مثال: مموج، مسامية عالية، مفرود كيميائياً"
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">معادلة الصبغة الدقيقة (Color Formula):</label>
              <input
                type="text"
                value={newFormula}
                onChange={e => setNewFormula(e.target.value)}
                placeholder="مثال: Koleston 8/1 + 8/0 مع أكسجين 20 Vol (وقت الانتظار 35 دقيقة)"
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">الحساسيات وملاحظات الفروة:</label>
              <input
                type="text"
                value={newSensitivities}
                onChange={e => setNewSensitivities(e.target.value)}
                placeholder="مثال: تحسس من PPD، فروة حساسة"
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">ملاحظات وطلب العناية المفضلة:</label>
              <input
                type="text"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="مثال: ماء فاتر، ترطيب عميق بعد الصبغة"
                className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              حفظ البطاقة السحابية
            </button>
          </div>
        </form>
      )}

      {/* Profiles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(profile => (
          <div
            key={profile.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-rose-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 transition-all space-y-3.5 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black flex items-center justify-center text-xs">
                    {profile.clientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{profile.clientName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{profile.clientPhone}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  آخر زيارة: {profile.lastVisitDate}
                </span>
              </div>

              {/* Formula Box */}
              <div className="p-3 bg-rose-50/50 dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  <span>معادلة الصبغة (Color Formula):</span>
                </div>
                <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 leading-relaxed select-all">
                  {profile.colorFormula}
                </div>
              </div>

              {/* Hair Type & Sensitivities */}
              <div className="space-y-1.5 text-[11px]">
                <div className="text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-200">طبيعة ومسامية الشعر:</strong> {profile.hairType}
                </div>
                {profile.sensitivities && (
                  <div className="text-amber-700 dark:text-amber-400 flex items-start gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong>تنبيه حساسية:</strong> {profile.sensitivities}</span>
                  </div>
                )}
                {profile.stylistNotes && (
                  <div className="text-slate-500 dark:text-slate-400 italic">
                    "{profile.stylistNotes}"
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>الأخصائية المفضلة: <strong className="text-slate-700 dark:text-slate-300">{profile.favoriteStylist}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> موثق سحابياً
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
