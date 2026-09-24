import React, { useState } from 'react';
import { Salon } from '../../types.ts';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  Users,
  Award,
  UserPlus,
  Star,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  BarChart3,
  Check,
  Briefcase,
  DollarSign,
  ChevronRight,
  Info
} from 'lucide-react';

interface Props {
  salon: Salon;
}

export interface StaffPerformanceData {
  id: string;
  name: string;
  role: string;
  department: 'hair' | 'makeup' | 'nails' | 'skincare';
  completedServices: number; // عدد الخدمات المنجزة
  averageRating: number;      // متوسط التقييم (من 5.0)
  cancelledBookings: number;  // عدد الحجوزات الملغاة
  totalBookings: number;      // إجمالي الحجوزات المستلمة
  cancellationRate: number;   // نسبة الحجوزات الملغاة %
  revenueGenerated: number;   // الإيراد المحقق
  rebookingRate: number;      // نسبة عودة العميلات %
  utilizationRate: number;    // نسبة إشغال الكرسي/الوقت %
  recommendedBonus: number;   // المكافأة المقترحة بالريال
  bonusStatus?: 'pending' | 'approved';
  hiringImpact: {
    status: 'overloaded' | 'optimal' | 'underutilized';
    recommendation: string;
  };
}

export const StaffPerformanceAnalytics: React.FC<Props> = ({ salon }) => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'week'>('month');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [chartView, setChartView] = useState<'performance' | 'radar'>('performance');
  const [approvedBonuses, setApprovedBonuses] = useState<Record<string, boolean>>({});
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireSubmitted, setHireSubmitted] = useState(false);

  // Mock Performance Data tailored for the Salon
  const [staffData, setStaffData] = useState<StaffPerformanceData[]>([
    {
      id: 'st_1',
      name: 'سارة محمد',
      role: 'كبيرة أخصائيات الشعر والصبغات',
      department: 'hair',
      completedServices: 58,
      averageRating: 4.95,
      cancelledBookings: 2,
      totalBookings: 60,
      cancellationRate: 3.3,
      revenueGenerated: 19800,
      rebookingRate: 94,
      utilizationRate: 92,
      recommendedBonus: 1500,
      hiringImpact: {
        status: 'overloaded',
        recommendation: 'تعمل بسعة 92% مع جدول محجوز لأسبوعين قادمين. يوصى بتوظيف مساعدة شعر لتخفيف الضغط وزيادة الطاقة الاستيعابية.'
      }
    },
    {
      id: 'st_2',
      name: 'أمل الشمري',
      role: 'خبيرة مكياج سينمائي وعرائس',
      department: 'makeup',
      completedServices: 46,
      averageRating: 4.98,
      cancelledBookings: 1,
      totalBookings: 47,
      cancellationRate: 2.1,
      revenueGenerated: 24500,
      rebookingRate: 97,
      utilizationRate: 88,
      recommendedBonus: 2000,
      hiringImpact: {
        status: 'optimal',
        recommendation: 'أعلى إيراد وأقل نسبة إلغاء (2.1%). طاقتها الحالية متوازنة ومثالية لباقات العرائس VIP.'
      }
    },
    {
      id: 'st_3',
      name: 'نورة العتيبي',
      role: 'أخصائية العناية بالأظافر والسبا',
      department: 'nails',
      completedServices: 74,
      averageRating: 4.75,
      cancelledBookings: 6,
      totalBookings: 80,
      cancellationRate: 7.5,
      revenueGenerated: 11200,
      rebookingRate: 83,
      utilizationRate: 96,
      recommendedBonus: 800,
      hiringImpact: {
        status: 'overloaded',
        recommendation: 'ضغط طلب هائل (نسبة إشغال 96%) تسبب في زيادة طفيفة بالإلغاء (7.5%) بسبب الانتظار. قرار ملح: توظيف أخصائية أظافر ثانية فوراً.'
      }
    },
    {
      id: 'st_4',
      name: 'منى السعيد',
      role: 'أخصائية تنظيف بشرة ومساج',
      department: 'skincare',
      completedServices: 38,
      averageRating: 4.88,
      cancelledBookings: 2,
      totalBookings: 40,
      cancellationRate: 5.0,
      revenueGenerated: 14200,
      rebookingRate: 89,
      utilizationRate: 78,
      recommendedBonus: 950,
      hiringImpact: {
        status: 'optimal',
        recommendation: 'أداء مستقر ومعدل رضا مرتفع. يوجد مجال لاستيعاب 8 جلسات هيدرافيشل إضافية أسبوعياً قبل الحاجة لتوظيف جديد.'
      }
    },
    {
      id: 'st_5',
      name: 'ليلى الحربي',
      role: 'أخصائية علاجات بروتين وفيلر',
      department: 'hair',
      completedServices: 32,
      averageRating: 4.65,
      cancelledBookings: 4,
      totalBookings: 36,
      cancellationRate: 11.1,
      revenueGenerated: 12800,
      rebookingRate: 76,
      utilizationRate: 70,
      recommendedBonus: 500,
      hiringImpact: {
        status: 'underutilized',
        recommendation: 'نسبة إلغاء مرتفعة نسبياً (11.1%). يوصى بورشة تدريبية على بروتوكول استقبال العميلات وتأكيد المواعيد قبل النظر في مكافآت الترقية.'
      }
    }
  ]);

  // Filter staff based on selected department
  const filteredStaff = staffData.filter(s => {
    if (selectedDept !== 'all' && s.department !== selectedDept) return false;
    if (selectedStaffId !== 'all' && s.id !== selectedStaffId) return false;
    return true;
  });

  // Calculate aggregated performance metrics
  const totalCompleted = filteredStaff.reduce((acc, s) => acc + s.completedServices, 0);
  const totalCancelled = filteredStaff.reduce((acc, s) => acc + s.cancelledBookings, 0);
  const overallBookings = filteredStaff.reduce((acc, s) => acc + s.totalBookings, 0);
  const avgCancellationRate = overallBookings > 0 ? ((totalCancelled / overallBookings) * 100).toFixed(1) : '0.0';
  const avgTeamRating = (filteredStaff.reduce((acc, s) => acc + s.averageRating, 0) / (filteredStaff.length || 1)).toFixed(2);
  const totalBonusPool = filteredStaff.reduce((acc, s) => acc + s.recommendedBonus, 0);

  // Prepare chart dataset
  const chartData = filteredStaff.map(s => ({
    name: s.name,
    'الخدمات المنجزة': s.completedServices,
    'متوسط التقييم': Number((s.averageRating).toFixed(2)),
    'نسبة الإلغاء %': Number(s.cancellationRate.toFixed(1)),
    ratingScaled: Number((s.averageRating * 15).toFixed(1)), // for visual balance in dual charts
    bonus: s.recommendedBonus
  }));

  // Radar data for multidimensional comparison
  const radarData = [
    {
      subject: 'حجم الإنتاجية',
      'سارة محمد': 90,
      'أمل الشمري': 80,
      'نورة العتيبي': 98,
      'متوسط الصالون': 85
    },
    {
      subject: 'جودة التقييم',
      'سارة محمد': 98,
      'أمل الشمري': 100,
      'نورة العتيبي': 88,
      'متوسط الصالون': 92
    },
    {
      subject: 'الالتزام (قلة الإلغاء)',
      'سارة محمد': 94,
      'أمل الشمري': 98,
      'نورة العتيبي': 82,
      'متوسط الصالون': 90
    },
    {
      subject: 'ولاء العميلات',
      'سارة محمد': 95,
      'أمل الشمري': 97,
      'نورة العتيبي': 84,
      'متوسط الصالون': 89
    },
    {
      subject: 'العائد المالي',
      'سارة محمد': 88,
      'أمل الشمري': 100,
      'نورة العتيبي': 75,
      'متوسط الصالون': 84
    }
  ];

  const handleApproveBonus = (staffId: string) => {
    setApprovedBonuses(prev => ({ ...prev, [staffId]: true }));
  };

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-rose-100 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ذكاء الأعمال وتحليل كفاءة الفريق (HR & Staff Analytics)</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            تحليل أداء الأخصائيات وقرارات التوظيف والمكافآت
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            رسم بياني تفاعلي يحلل أداء كل أخصائية بالصالون بناءً على عدد الخدمات المنفذة، متوسط تقييم العميلات، ونسبة الحجوزات الملغاة لاتخاذ قرارات الترقية والتوظيف بدقة.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'month'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'quarter'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              آخر 3 أشهر
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'week'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              هذا الأسبوع
            </button>
          </div>

          <button
            onClick={() => setShowHireModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إعلان توظيف جديد</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Completed Services */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-white dark:to-slate-900 border border-rose-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>إجمالي الخدمات المنجزة</span>
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {totalCompleted} خدمة
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% مقارنة بالفترة السابقة</span>
          </div>
        </div>

        {/* KPI 2: Average Rating */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white dark:to-slate-900 border border-amber-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>متوسط تقييم الفريق</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 flex items-baseline gap-1">
            <span>{avgTeamRating}</span>
            <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            من 240 تقييماً موثقاً من العميلات
          </div>
        </div>

        {/* KPI 3: Cancellation Rate */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white dark:to-slate-900 border border-purple-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>نسبة الحجوزات الملغاة</span>
            <XCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">
            {avgCancellationRate}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            معدل منخفض جداً بفضل العربون الذكي ✓
          </div>
        </div>

        {/* KPI 4: Bonus Pool Recommendation */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-slate-900 border border-emerald-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>حوافز ومكافآت التميز المقترحة</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {totalBonusPool.toLocaleString()} SAR
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            مستحقة لـ {filteredStaff.filter(s => s.averageRating >= 4.8).length} أخصائيات متميزات
          </div>
        </div>
      </div>

      {/* Filter Tabs & Chart View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Department filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-500 font-bold ml-1 shrink-0">التصنيف:</span>
          {[
            { id: 'all', label: 'جميع الأقسام' },
            { id: 'hair', label: 'الشعر والمعالجات ✂️' },
            { id: 'makeup', label: 'المكياج والعرائس 💄' },
            { id: 'nails', label: 'الأظافر والسبا 💅' },
            { id: 'skincare', label: 'البشرة والمساج 💆‍♀️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedDept(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDept === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Switch Chart Type */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setChartView('performance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartView === 'performance'
                ? 'bg-slate-900 dark:bg-slate-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>مخطط الأداء الثلاثي</span>
          </button>
          <button
            onClick={() => setChartView('radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartView === 'radar'
                ? 'bg-slate-900 dark:bg-slate-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مقارنة الرادار متعددة الأبعاد</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-rose-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {chartView === 'performance'
                  ? 'المخطط التفاعلي: الخدمات المنجزة، متوسط التقييم، ونسبة الإلغاء'
                  : 'مخطط كفاءة الأبعاد التنافسية للأخصائيات'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                تفاعلي
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              مرري مؤشر الفأرة على الأعمدة والخطوط لمعاينة التفاصيل الرقمية الدقيقة لكل أخصائية.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span>الخدمات المنجزة (عمود)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span>متوسط التقييم (من 5.0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span>نسبة الإلغاء %</span>
            </div>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="w-full h-[360px] pt-4">
          {chartView === 'performance' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                {/* Left Y Axis: Completed Services Count */}
                <YAxis
                  yAxisId="left"
                  stroke="#f43f5e"
                  fontSize={11}
                  label={{ value: 'الخدمات المنجزة', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 11 }}
                />
                {/* Right Y Axis: Rating & Cancellation Rate */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#fbbf24"
                  fontSize={11}
                  domain={[0, 15]}
                  label={{ value: 'التقييم / نسبة الإلغاء %', angle: 90, position: 'insideRight', fill: '#fbbf24', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900/95 border border-slate-700 rounded-xl shadow-xl text-right text-xs space-y-1.5 text-white backdrop-blur-md">
                          <div className="font-bold text-rose-400 text-sm border-b border-slate-700 pb-1">
                            {label}
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">الخدمات المنجزة:</span>
                            <span className="font-bold text-rose-300 font-mono">{data['الخدمات المنجزة']} خدمة</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">متوسط التقييم:</span>
                            <span className="font-bold text-amber-300 font-mono flex items-center gap-1">
                              ⭐ {data['متوسط التقييم']} / 5.0
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">نسبة الحجوزات الملغاة:</span>
                            <span className="font-bold text-purple-300 font-mono">{data['نسبة الإلغاء %']}%</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t border-slate-700">
                            <span className="text-slate-400">المكافأة المقترحة:</span>
                            <span className="font-bold text-emerald-400 font-mono">{data.bonus} SAR</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {/* Bar for completed services */}
                <Bar
                  yAxisId="left"
                  dataKey="الخدمات المنجزة"
                  fill="#f43f5e"
                  radius={[8, 8, 0, 0]}
                  barSize={38}
                />
                {/* Line for Average Rating */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="متوسط التقييم"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f59e0b' }}
                />
                {/* Line for Cancellation Rate */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="نسبة الإلغاء %"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#9333ea' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#334155" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Radar name="سارة محمد" dataKey="سارة محمد" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                <Radar name="أمل الشمري" dataKey="أمل الشمري" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} />
                <Radar name="نورة العتيبي" dataKey="نورة العتيبي" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Decision Support Matrix: Hiring Decisions vs Bonus Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* SECTION 1: Bonus Recommendations & Recognition (قرارات المكافآت) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-white dark:to-slate-900 border border-amber-200 dark:border-amber-900/50 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  توصيات المكافآت والحوافز التلقائية
                </h4>
                <p className="text-[11px] text-slate-500">
                  محسوبة بناءً على (حجم الإنجاز + تقييم ≥ 4.8 + نسبة إلغاء منخفضة &lt; 4%)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              دعم القرار الذكي 💡
            </span>
          </div>

          <div className="space-y-3">
            {filteredStaff.map(staff => {
              const isTop = staff.averageRating >= 4.9 && staff.cancellationRate <= 3.5;
              const isApproved = approvedBonuses[staff.id];

              return (
                <div
                  key={staff.id}
                  className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/80 border border-amber-100 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{staff.name}</span>
                      {isTop && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white flex items-center gap-0.5">
                          ⭐ نجمة الصالون
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>{staff.completedServices} خدمة منجزة</span>
                      <span>• التقييم: {staff.averageRating}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        • الإلغاء: {staff.cancellationRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-left">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {staff.recommendedBonus} SAR
                      </div>
                      <div className="text-[10px] text-slate-400">مكافأة مقترحة</div>
                    </div>

                    <button
                      onClick={() => handleApproveBonus(staff.id)}
                      disabled={isApproved}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-500 hover:bg-amber-400 text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم الصرف ✓</span>
                        </>
                      ) : (
                        <span>اعتماد الصرف</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Hiring & Staffing Optimization (قرارات التوظيف وسد العجز) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-slate-900 border border-blue-200 dark:border-blue-900/50 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  قرارات التوظيف وتوزيع عبء العمل
                </h4>
                <p className="text-[11px] text-slate-500">
                  تحديد الأقسام التي وصلت لسعتها القصوى وتحتاج لتعيين موظفات إضافيات
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              توسيع السعة 📈
            </span>
          </div>

          <div className="space-y-3">
            {filteredStaff.map(staff => {
              const isOverloaded = staff.hiringImpact.status === 'overloaded';
              const isUnder = staff.hiringImpact.status === 'underutilized';

              return (
                <div
                  key={`hire-${staff.id}`}
                  className={`p-3.5 rounded-xl border transition-all text-xs space-y-1.5 ${
                    isOverloaded
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : isUnder
                      ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50'
                      : 'bg-white/90 dark:bg-slate-950/80 border-blue-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{staff.name}</span>
                      <span className="text-[11px] text-slate-500">({staff.role})</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isOverloaded
                          ? 'bg-rose-600 text-white'
                          : isUnder
                          ? 'bg-purple-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      إشغال {staff.utilizationRate}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {staff.hiringImpact.recommendation}
                  </p>

                  {isOverloaded && (
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => setShowHireModal(true)}
                        className="text-rose-600 dark:text-rose-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>بدء إجراءات التوظيف لهذا القسم</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Staff Performance Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-rose-500" />
            <span>جدول التحليل الشامل لأداء الأخصائيات ومؤشرات الجودة</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            محدث بناءً على مواعيد تطبيق تدلّلي وسجلات الحضور الفعلية
          </span>
        </div>

        <div className="overflow-x-auto border border-rose-100 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-rose-50/70 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-rose-100 dark:border-slate-800">
              <tr>
                <th className="p-3">الأخصائية والمسؤولية</th>
                <th className="p-3 text-center">الخدمات المنجزة</th>
                <th className="p-3 text-center">متوسط التقييم</th>
                <th className="p-3 text-center">الحجوزات الملغاة</th>
                <th className="p-3 text-center">نسبة الإلغاء</th>
                <th className="p-3 text-center">ولاء العميلات</th>
                <th className="p-3 text-center">الإيراد المحقق</th>
                <th className="p-3 text-center">توصية التوظيف والمكافأة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100 dark:divide-slate-800/60">
              {filteredStaff.map(staff => (
                <tr
                  key={`tbl-${staff.id}`}
                  className="hover:bg-rose-50/40 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{staff.name}</div>
                    <div className="text-[10px] text-slate-400">{staff.role}</div>
                  </td>
                  <td className="p-3 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {staff.completedServices}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 font-bold text-amber-500 font-mono">
                      <span>{staff.averageRating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  </td>
                  <td className="p-3 text-center text-slate-500 font-mono">
                    {staff.cancelledBookings}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        staff.cancellationRate <= 3.5
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : staff.cancellationRate <= 7.0
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {staff.cancellationRate}%
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {staff.rebookingRate}%
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900 dark:text-white font-mono">
                    {staff.revenueGenerated.toLocaleString()} SAR
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      مكافأة {staff.recommendedBonus} SAR
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Staff Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121218] border border-rose-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  إعلان توظيف أخصائية جديدة
                </h4>
              </div>
              <button
                onClick={() => {
                  setShowHireModal(false);
                  setHireSubmitted(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {hireSubmitted ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                  تم نشر إعلان التوظيف في شبكة تدلّلي للتوظيف بنجاح!
                </h5>
                <p className="text-xs text-slate-500">
                  سيتم تزويدك بالسير الذاتية لأخصائيات التجميل المرخصات والمتاحة في مدينتك خلال 24 ساعة.
                </p>
                <button
                  onClick={() => {
                    setShowHireModal(false);
                    setHireSubmitted(false);
                  }}
                  className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التخصص المطلوب:
                  </label>
                  <select className="w-full p-2.5 rounded-xl border border-rose-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                    <option>أخصائية عناية بالأظافر وسبا (طلب مرتفع جداً 96%)</option>
                    <option>مساعدة أخصائية شعر ومعالجات</option>
                    <option>أخصائية مكياج وتسريحات سينمائية</option>
                    <option>أخصائية عناية بالبشرة وتنظيف عميق</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع التعاقد والراتب المقترح:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="الراتب الأساسي (مثلاً 3,500)"
                      className="p-2.5 rounded-xl border border-rose-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="نسبة العمولة (مثلاً 15%)"
                      className="p-2.5 rounded-xl border border-rose-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سنوات الخبرة المطلوبة:
                  </label>
                  <select className="w-full p-2.5 rounded-xl border border-rose-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                    <option>سنتان إلى 4 سنوات (متوسطة الخبرة)</option>
                    <option>أكثر من 5 سنوات (كبيرة أخصائيات)</option>
                    <option>مبتدئة مع تدريب صالون معتمد</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowHireModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => setHireSubmitted(true)}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-xs"
                  >
                    نشر الإعلان الوظيفي 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
