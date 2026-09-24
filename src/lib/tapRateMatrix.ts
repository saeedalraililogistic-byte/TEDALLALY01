/**
 * Tap Payments Plan & Pricing Matrix Engine for Tedallaly (https://tedallaly.com/ar)
 * 
 * Implements the exact commercial rate cards:
 * 1. باقة البداية (Starter Plan):
 *    - Subscription: 199 SAR/mo (or 160 SAR/mo on 12-month contract)
 *    - Mada: 1% (max 200 SAR)
 *    - Visa/Mastercard (Local): 2.75%
 *    - Visa/Mastercard (GCC): 3.75%
 *    - Visa/Mastercard (International): 3.75%
 *    - Fixed per-transaction service fee: 1.00 SAR
 *    - Tamara installment: 6.5% + 1 SAR
 *    - Tabby installment: 6.5% + 1 SAR
 *    - Settlement payout schedule: Mada 3 business days, Visa/Master 5 business days (Min 100 SAR)
 *    - 15% VAT applies to Tap gateway fees
 * 
 * 2. الباقة الأساسية (Standard Plan):
 *    - Subscription: 499 SAR/mo (or 399 SAR/mo on 12-month contract)
 *    - Mada: 1% (max 200 SAR)
 *    - Visa/Mastercard (Local): 2.5%
 *    - Fixed fee: 1.00 SAR
 * 
 * 3. الباقة المتقدمة (Advanced Plan):
 *    - Subscription: 600 SAR/mo (or 480 SAR/mo on 12-month contract)
 *    - Mada: 1% (max 200 SAR)
 *    - Visa/Mastercard (Local): 2.4%
 *    - Fixed fee: 1.00 SAR
 */

export type TapPlanTier = 'starter' | 'standard' | 'advanced';

export type TapPaymentChannel = 
  | 'mada' 
  | 'visa_master_local' 
  | 'visa_master_gcc' 
  | 'visa_master_intl' 
  | 'tamara' 
  | 'tabby'
  | 'apple_pay';

export interface TapPlanDetails {
  id: TapPlanTier;
  titleAr: string;
  monthlyFee: number;
  annualMonthlyFee: number; // 12-month commitment
  madaFeePercent: number; // 1%
  madaMaxCapSAR: number; // 200 SAR
  visaLocalPercent: number; // 2.75% (starter), 2.5% (standard), 2.4% (advanced)
  visaGccPercent: number; // 3.75% (starter), 3.5% (standard), 3.4% (advanced)
  visaIntlPercent: number; // 3.75% (starter), 3.5% (standard), 3.4% (advanced)
  fixedPerTxFeeSAR: number; // 1.00 SAR
  tamaraFeePercent: number; // 6.5% + 1 SAR
  tabbyFeePercent: number; // 6.5% + 1 SAR
  madaSettlementDays: number; // 3 days
  visaSettlementDays: number; // 5 days
  minPayoutThresholdSAR: number; // 100 SAR
  vatRatePercent: number; // 15% on Tap fees
}

export const TAP_PLANS: Record<TapPlanTier, TapPlanDetails> = {
  starter: {
    id: 'starter',
    titleAr: 'باقة البداية (Starter)',
    monthlyFee: 199,
    annualMonthlyFee: 160,
    madaFeePercent: 1.0,
    madaMaxCapSAR: 200,
    visaLocalPercent: 2.75,
    visaGccPercent: 3.75,
    visaIntlPercent: 3.75,
    fixedPerTxFeeSAR: 1.00,
    tamaraFeePercent: 6.5,
    tabbyFeePercent: 6.5,
    madaSettlementDays: 3,
    visaSettlementDays: 5,
    minPayoutThresholdSAR: 100,
    vatRatePercent: 15,
  },
  standard: {
    id: 'standard',
    titleAr: 'الباقة الأساسية (Standard)',
    monthlyFee: 499,
    annualMonthlyFee: 399,
    madaFeePercent: 1.0,
    madaMaxCapSAR: 200,
    visaLocalPercent: 2.5,
    visaGccPercent: 3.5,
    visaIntlPercent: 3.5,
    fixedPerTxFeeSAR: 1.00,
    tamaraFeePercent: 6.5,
    tabbyFeePercent: 6.5,
    madaSettlementDays: 3,
    visaSettlementDays: 5,
    minPayoutThresholdSAR: 100,
    vatRatePercent: 15,
  },
  advanced: {
    id: 'advanced',
    titleAr: 'الباقة المتقدّمة (Advanced VIP)',
    monthlyFee: 600,
    annualMonthlyFee: 480,
    madaFeePercent: 1.0,
    madaMaxCapSAR: 200,
    visaLocalPercent: 2.4,
    visaGccPercent: 3.4,
    visaIntlPercent: 3.4,
    fixedPerTxFeeSAR: 1.00,
    tamaraFeePercent: 6.5,
    tabbyFeePercent: 6.5,
    madaSettlementDays: 3,
    visaSettlementDays: 5,
    minPayoutThresholdSAR: 100,
    vatRatePercent: 15,
  },
};

export interface TapFeeCalculation {
  plan: TapPlanTier;
  channel: TapPaymentChannel;
  grossAmount: number;
  percentageFee: number;
  fixedFee: number;
  gatewayFeeBeforeVAT: number;
  vatOnGatewayFee: number; // 15% VAT on Tap's fee
  totalGatewayDeduction: number; // fee + VAT
  settlementDays: number;
  minPayoutSAR: number;
  netPayoutAmount: number;
}

/**
 * Calculates exact Tap Payments fee for any transaction based on chosen plan and payment method.
 */
export function calculateTapFee(
  amount: number,
  channel: TapPaymentChannel = 'mada',
  planTier: TapPlanTier = 'starter'
): TapFeeCalculation {
  const plan = TAP_PLANS[planTier];
  const grossAmount = Math.max(0, amount);
  let percentage = 0;
  let fixedFee = plan.fixedPerTxFeeSAR;
  let settlementDays = 3;

  switch (channel) {
    case 'mada':
    case 'apple_pay': // Apple Pay on mada debit cards
      percentage = plan.madaFeePercent;
      settlementDays = plan.madaSettlementDays;
      break;
    case 'visa_master_local':
      percentage = plan.visaLocalPercent;
      settlementDays = plan.visaSettlementDays;
      break;
    case 'visa_master_gcc':
      percentage = plan.visaGccPercent;
      settlementDays = plan.visaSettlementDays;
      break;
    case 'visa_master_intl':
      percentage = plan.visaIntlPercent;
      settlementDays = plan.visaSettlementDays;
      break;
    case 'tamara':
      percentage = plan.tamaraFeePercent;
      settlementDays = 3;
      break;
    case 'tabby':
      percentage = plan.tabbyFeePercent;
      settlementDays = 3;
      break;
    default:
      percentage = plan.madaFeePercent;
      settlementDays = plan.madaSettlementDays;
  }

  // Calculate percentage fee
  let rawPercentageFee = (grossAmount * percentage) / 100;
  // Apply Mada 200 SAR max cap if applicable
  if (channel === 'mada' && rawPercentageFee > plan.madaMaxCapSAR) {
    rawPercentageFee = plan.madaMaxCapSAR;
  }

  const percentageFee = Math.round(rawPercentageFee * 100) / 100;
  const gatewayFeeBeforeVAT = Math.round((percentageFee + fixedFee) * 100) / 100;
  // Apply 15% VAT to Tap Gateway fee
  const vatOnGatewayFee = Math.round((gatewayFeeBeforeVAT * 0.15) * 100) / 100;
  const totalGatewayDeduction = Math.round((gatewayFeeBeforeVAT + vatOnGatewayFee) * 100) / 100;
  const netPayoutAmount = Math.max(0, Math.round((grossAmount - totalGatewayDeduction) * 100) / 100);

  return {
    plan: planTier,
    channel,
    grossAmount,
    percentageFee,
    fixedFee,
    gatewayFeeBeforeVAT,
    vatOnGatewayFee,
    totalGatewayDeduction,
    settlementDays,
    minPayoutSAR: plan.minPayoutThresholdSAR,
    netPayoutAmount,
  };
}
