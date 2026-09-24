import React, { useState } from 'react';
import { Booking, Salon } from '../types.ts';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  QrCode, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  User, 
  Phone, 
  Sparkles, 
  X,
  CreditCard
} from 'lucide-react';

interface Props {
  booking: Booking;
  salon?: Salon;
  onClose: () => void;
}

export const TaxInvoiceModal: React.FC<Props> = ({ booking, salon, onClose }) => {
  const [copied, setCopied] = useState(false);

  const totalAmount = Number(booking.snapshot?.totalAmount || 150);
  // Calculate VAT (15% Saudi Standard VAT included in total)
  const baseAmount = Number((totalAmount / 1.15).toFixed(2));
  const vatAmount = Number((totalAmount - baseAmount).toFixed(2));
  const invoiceNumber = `INV-${booking._id.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`;
  const invoiceDate = booking.appointmentDate || new Date().toISOString().split('T')[0];
  const vatNumber = salon?.vatNumber || '310492817200003';
  const salonName = booking.snapshot?.salonName || salon?.salonName || 'صالون تدلّلي المعتمد';
  const serviceName = booking.snapshot?.serviceName || 'جلسة تجميل وعناية فاخرة';
  const clientName = booking.clientName || 'عميلة تدلّلي الملكية';
  const clientPhone = booking.clientPhone || '966500000000';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>فاتورة ضريبية مبسطة (ZATCA Compliant)</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              فاتورة إلكترونية معتمدة
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              رقم الفاتورة: {invoiceNumber}
            </p>
          </div>

          {/* Simulated QR Code for ZATCA E-Invoicing standard */}
          <div className="p-2 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 text-center shadow-xs">
            <div className="w-16 h-16 bg-slate-900 flex flex-col items-center justify-center text-white rounded-lg p-1">
              <QrCode className="w-12 h-12 text-white" />
            </div>
            <span className="text-[9px] text-slate-600 block mt-1 font-mono font-bold">QR مشفر</span>
          </div>
        </div>

        {/* Salon & Client Details */}
        <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold block text-[11px]">مقدم الخدمة (الصالون):</span>
            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-rose-500" />
              <span>{salonName}</span>
            </p>
            <p className="text-slate-500 font-mono text-[11px]">الرقم الضريبي: {vatNumber}</p>
            <p className="text-slate-500">{salon?.city || 'المملكة العربية السعودية'}</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 font-bold block text-[11px]">بيانات العميلة الملكية:</span>
            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-500" />
              <span>{clientName}</span>
            </p>
            <p className="text-slate-500 font-mono text-[11px]">الهاتف: {clientPhone}</p>
            <p className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>تاريخ الموعد: {invoiceDate}</span>
            </p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="py-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 block">تفاصيل البنود والخدمات:</span>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between font-bold text-xs pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <span>البند</span>
              <span>السعر الخاضع للضريبة</span>
            </div>
            
            <div className="flex items-center justify-between text-xs py-2.5">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{serviceName}</p>
                <p className="text-[10px] text-slate-400">بواسطة الأخصائية: {booking.snapshot?.staffName || 'خبيرة الصالون'}</p>
              </div>
              <span className="font-mono font-bold">{baseAmount.toFixed(2)} SAR</span>
            </div>

            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>المبلغ الأساسي الخاضع للضريبة (15%):</span>
                <span className="font-mono">{baseAmount.toFixed(2)} SAR</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>ضريبة القيمة المضافة (VAT 15%):</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{vatAmount.toFixed(2)} SAR</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <span>الإجمالي الكلي المستحق:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>طريقة الدفع: الدفع الإلكتروني (مدى / Apple Pay)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
