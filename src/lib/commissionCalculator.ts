/**
 * Tedallaly Platform Commission & Financial Calculation Engine
 * 
 * Formula Specified:
 * - Base Service Price (قيمة حجز الخدمة): e.g. 100 SAR
 * - Platform Commission (عمولة المنصة): 10 SAR per 100 SAR (10%)
 * - Payment Gateway Transaction Fee (رسوم المعاملة المالية): 2.75 SAR (Tap Payments)
 * - VAT 15% on Platform Earning (ضريبة 15% على المبلغ الذي ستحصل عليه المنصة):
 *     15% * 10.00 SAR = 1.50 SAR
 * 
 * Total Paid by Customer = 100 + 10 + 2.75 + 1.50 = 114.25 SAR
 * Salon Net Payout = 100.00 SAR (Full price, zero deduction)
 * Platform Net Earning = 10.00 SAR
 * Gateway Processing = 2.75 SAR
 * ZATCA VAT Due = 1.50 SAR
 */

import { calculateTapFee, TapPaymentChannel, TapPlanTier } from './tapRateMatrix.ts';

export interface BookingFinancialBreakdown {
  // Base
  baseServiceAmount: number;      // e.g. 100.00
  productsAmount: number;         // e.g. 0.00
  subtotal: number;               // baseServiceAmount + productsAmount

  // Platform & Fees
  commissionRatePercent: number;  // 10%
  platformCommission: number;     // 10.00 SAR
  paymentGatewayFee: number;      // Tap Fee (e.g. 1% + 1 SAR for Mada, or 2.75% + 1 SAR for Visa)
  gatewayVatAmount: number;       // 15% VAT on Tap gateway fee
  channel: TapPaymentChannel;
  settlementDays: number;
  
  // Tax
  vatRatePercent: number;         // 15%
  vatOnCommission: number;        // 15% * platformCommission = 1.50 SAR
  
  // Totals
  totalCustomerDue: number;       // subtotal + platformCommission + paymentGatewayFee + vatOnCommission
  salonPayoutAmount: number;      // subtotal (100% to salon)
  platformGrossRevenue: number;   // platformCommission + paymentGatewayFee + vatOnCommission
  platformNetRevenue: number;     // platformCommission (10.00 SAR)
  currency: string;               // 'SAR'
}

/**
 * Calculates complete financial breakdown based on service price & add-on products
 * using the official Tap Payments Starter Plan rates.
 */
export function calculateBookingFinances(
  servicePrice: number,
  productsPrice: number = 0,
  currency: string = 'ر.س',
  paymentChannel: TapPaymentChannel = 'mada',
  planTier: TapPlanTier = 'starter'
): BookingFinancialBreakdown {
  const baseServiceAmount = Math.max(0, servicePrice);
  const productsAmount = Math.max(0, productsPrice);
  const subtotal = baseServiceAmount + productsAmount;

  // Platform commission: 10% (10 SAR for 100 SAR)
  const commissionRatePercent = 10;
  const platformCommission = Math.round((subtotal * 0.10) * 100) / 100;

  // Exact Tap Payments Rate Card Calculation (باقة البداية)
  const tapFee = calculateTapFee(subtotal, paymentChannel, planTier);
  const paymentGatewayFee = tapFee.gatewayFeeBeforeVAT;
  const gatewayVatAmount = tapFee.vatOnGatewayFee;

  // VAT: 15% on the platform's revenue
  const vatRatePercent = 15;
  const vatOnCommission = Math.round((platformCommission * 0.15) * 100) / 100;

  // Total charged to customer (Service + Platform 10% + Gateway Fee + VAT)
  const totalCustomerDue = Math.round((subtotal + platformCommission + paymentGatewayFee + vatOnCommission) * 100) / 100;

  // Salon receives 100% of their service and product price (full net payout)
  const salonPayoutAmount = subtotal;

  // Platform gross collected above salon payout
  const platformGrossRevenue = Math.round((totalCustomerDue - salonPayoutAmount) * 100) / 100;

  // Platform net profit
  const platformNetRevenue = platformCommission;

  return {
    baseServiceAmount,
    productsAmount,
    subtotal,
    commissionRatePercent,
    platformCommission,
    paymentGatewayFee,
    gatewayVatAmount,
    channel: paymentChannel,
    settlementDays: tapFee.settlementDays,
    vatRatePercent,
    vatOnCommission,
    totalCustomerDue,
    salonPayoutAmount,
    platformGrossRevenue,
    platformNetRevenue,
    currency
  };
}

/**
 * Formats a number to Saudi Arabian currency string with 2 decimal places.
 */
export function formatSAR(amount: number, currency = 'ر.س'): string {
  return `${amount.toFixed(2)} ${currency}`;
}
