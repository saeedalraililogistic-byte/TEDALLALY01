import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scale, 
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { LegalHubView } from './LegalHubView.tsx';

export type LegalPolicyTab = 
  | 'all'
  | 'terms'
  | 'privacy'
  | 'cancellation'
  | 'refund'
  | 'booking_policy'
  | 'payment_policy'
  | 'disputes'
  | 'reviews_policy'
  | 'cookies'
  | 'account_deletion'
  | 'disclaimer'
  | 'salon_agreement'
  | 'jurisdiction'
  | 'commission';

interface Props {
  isOpen: boolean;
  initialTab?: LegalPolicyTab;
  onClose: () => void;
}

export const LegalPoliciesModal: React.FC<Props> = ({
  isOpen,
  initialTab = 'all',
  onClose,
}) => {
  // Map initialTab to document id if specific, or null if 'all' or 'commission' (which maps to payment_policy)
  const getInitialDocId = (tab?: string | null): string | null => {
    if (!tab || tab === 'all') return null;
    if (tab === 'commission') return 'payment_policy';
    return tab;
  };

  const [selectedDocId, setSelectedDocId] = useState<string | null>(getInitialDocId(initialTab));

  useEffect(() => {
    setSelectedDocId(getInitialDocId(initialTab));
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#faf8f9] dark:bg-[#0c0c12] border border-rose-100 dark:border-slate-800 rounded-3xl shadow-2xl max-w-6xl w-full h-[92vh] flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Modal Header Bar with Close Button */}
        <div className="p-3.5 sm:p-4 px-5 border-b border-rose-100/80 dark:border-slate-800/90 bg-white/95 dark:bg-[#121218]/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  المركز القانوني والسياسات • tedallaly.com/ar/legal
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  توثيق رسمي 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                وثائق وسياسات نظامية معتمدة وفق أنظمة التجارة الإلكترونية وحماية البيانات في المملكة العربية السعودية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-rose-100/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container with the Exact 12 Cards Grid & Detail Reader */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <LegalHubView
            onBackToMarket={onClose}
            selectedDocId={selectedDocId}
            onSelectDoc={setSelectedDocId}
          />
        </div>
      </div>
    </div>
  );
};
