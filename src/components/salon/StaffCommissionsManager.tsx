import React, { useState } from 'react';
import { Salon } from '../../types.ts';
import { StaffPerformanceAnalytics } from './StaffPerformanceAnalytics.tsx';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Download, 
  Sparkles, 
  Scissors, 
  CheckCircle2,
  Percent,
  Plus,
  BarChart3
} from 'lucide-react';

interface Props {
  salon: Salon;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  baseSalary: number;
  servicesRevenue: number;
  commissionRate: number; // e.g., 15%
  productsSold: number;
  productCommissionRate: number; // e.g., 10%
  tips: number;
  completedBookings: number;
  rating: number;
}

export const StaffCommissionsManager: React.FC<Props> = ({ salon }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'st_1',
      name: 'سارة محمد',
      role: 'كبيرة أخصائيات الشعر والمعالجات',
      baseSalary: 3500,
      servicesRevenue: 14800,
      commissionRate: 15,
      productsSold: 1200,
      productCommissionRate: 10,
      tips: 450,
      completedBookings: 38,
      rating: 4.9,
    },
    {
      id: 'st_2',
      name: 'أمل الشمري',
      role: 'خبيرة مكياج وتسريحات سينمائية',
      baseSalary: 3800,
      servicesRevenue: 18200,
      commissionRate: 18,
      productsSold: 600,
      productCommissionRate: 10,
      tips: 620,
      completedBookings: 29,
      rating: 5.0,
    },
    {
      id: 'st_3',
      name: 'نورة العتيبي',
      role: 'أخصائية عناية بالأظافر وسبا',
      baseSalary: 3000,
      servicesRevenue: 9400,
      commissionRate: 12,
      productsSold: 800,
      productCommissionRate: 10,
      tips: 280,
      completedBookings: 45,
      rating: 4.8,
    },
    {
      id: 'st_4',
      name: 'ريم الدوسري',
      role: 'أخصائية تنظيف بشرة ومساج',
      baseSalary: 3200,
      servicesRevenue: 11500,
      commissionRate: 14,
      productsSold: 1500,
      productCommissionRate: 10,
      tips: 340,
      completedBookings: 32,
      rating: 4.9,
    },
  ]);

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'commissions' | 'analytics'>('commissions');

  // Totals
  const totalRevenue = staffList.reduce((sum, s) => sum + s.servicesRevenue, 0);
  const totalCommissions = staffList.reduce((sum, s) => {
    const srvComm = s.servicesRevenue * (s.commissionRate / 100);
    const prodComm = s.productsSold * (s.productCommissionRate / 100);
    return sum + srvComm + prodComm;
  }, 0);
  const totalPayout = staffList.reduce((sum, s) => {
    const srvComm = s.servicesRevenue * (s.commissionRate / 100);
    const prodComm = s.productsSold * (s.productCommissionRate / 100);
    return sum + s.baseSalary + srvComm + prodComm + s.tips;
  }, 0);

  const handleExportPayroll = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (activeSubTab === 'analytics') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('commissions')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 transition-all flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>العودة لجدول الرواتب والعمولات</span>
            </button>
            <span className="text-xs font-bold text-slate-900 dark:text-white px-2">
              الرسم البياني التفاعلي للأداء وقرارات التوظيف والمكافآت 📊
            </span>
          </div>
        </div>
        <StaffPerformanceAnalytics salon={salon} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#121218] border border-rose-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xs">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-rose-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('commissions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'commissions'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>مسير الرواتب والعمولات</span>
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-rose-50 dark:bg-slate-800/80 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/50"
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-500" />
            <span>الرسم البياني لتحليل الأداء والتوظيف 📊</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-600 text-white font-black">جديد</span>
          </button>
        </div>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>حساب العمولات الآلي</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            حاسبة عمولات وأداء الأخصائيات اللحظية (Staff Commission & Performance Tracker)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            لا داعي للحسابات اليدوية المعقدة! يحسب النظام عمولة كل أخصائية من الخدمات والمنتجات بدقة تامة ويصدر مسير رواتب فوري.
          </p>
        </div>

        <button
          onClick={handleExportPayroll}
          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" />
          <span>{downloadSuccess ? 'تم تنزيل مسير الرواتب ✓' : 'تصدير مسير الرواتب (PDF / Excel)'}</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-slate-900 border border-blue-200/60 dark:border-blue-800/40">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">إجمالي مبيعات الخدمات هذا الشهر</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalRevenue.toLocaleString()} SAR
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            من 144 موعد منجز بنجاح
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">إجمالي العمولات المستحقة للأخصائيات</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {Math.round(totalCommissions).toLocaleString()} SAR
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            محسوبة آلياً بدون أي أخطاء حسابية
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900/60 border border-rose-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">صافي مسير الرواتب والعمولات والإكراميات</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {Math.round(totalPayout).toLocaleString()} SAR
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            جاهز للاعتماد والتحويل البنكي
          </div>
        </div>
      </div>

      {/* Staff Breakdown Table */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>تفصيل مستحقات وأداء أخصائيات صالون {salon.salonName}:</span>
          <span className="text-[11px] text-slate-500">تم التحديث لحظياً بناءً على الحجوزات المنفذة</span>
        </div>

        <div className="overflow-x-auto border border-rose-100 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-rose-50/70 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-rose-100 dark:border-slate-800">
              <tr>
                <th className="p-3">الأخصائية</th>
                <th className="p-3">المواعيد المنفذة</th>
                <th className="p-3">مبيعات الخدمات</th>
                <th className="p-3">نسبة العمولة</th>
                <th className="p-3">عمولة الخدمات</th>
                <th className="p-3">الراتب الأساسي</th>
                <th className="p-3">الإكراميات</th>
                <th className="p-3 font-black text-rose-600 dark:text-rose-400">إجمالي المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100 dark:divide-slate-800">
              {staffList.map(member => {
                const serviceCommission = member.servicesRevenue * (member.commissionRate / 100);
                const productCommission = member.productsSold * (member.productCommissionRate / 100);
                const totalDue = member.baseSalary + serviceCommission + productCommission + member.tips;

                return (
                  <tr key={member.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                      <div className="text-[11px] text-slate-400">{member.role} ⭐ {member.rating}</div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                      {member.completedBookings} موعد
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {member.servicesRevenue.toLocaleString()} SAR
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                        {member.commissionRate}%
                      </span>
                    </td>
                    <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(serviceCommission).toLocaleString()} SAR
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {member.baseSalary.toLocaleString()} SAR
                    </td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">
                      +{member.tips} SAR
                    </td>
                    <td className="p-3 font-black text-slate-900 dark:text-white text-sm">
                      {Math.round(totalDue).toLocaleString()} SAR
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
