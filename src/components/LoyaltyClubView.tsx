import React, { useState } from 'react';
import { 
  Sparkles, 
  Gift, 
  Crown, 
  Check, 
  ArrowLeft, 
  Coins, 
  Star, 
  Zap, 
  ShoppingBag,
  Percent,
  Calendar,
  Heart
} from 'lucide-react';

interface LoyaltyReward {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  discountSAR: number;
  category: 'discount' | 'free_service' | 'upgrade';
  badge?: string;
}

interface Props {
  currentPoints: number;
  onRedeemReward: (reward: LoyaltyReward) => void;
  onBackToBookings: () => void;
}

export const LoyaltyClubView: React.FC<Props> = ({
  currentPoints,
  onRedeemReward,
  onBackToBookings
}) => {
  const [points, setPoints] = useState(currentPoints || 320);
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const availableRewards: LoyaltyReward[] = [
    {
      id: 'rew_1',
      title: 'قسيمة خصم فوري 50 ريال',
      pointsCost: 150,
      description: 'صالحة للاستخدام على أي خدمة صالون أو شعر تتجاوز 150 ريال.',
      discountSAR: 50,
      category: 'discount',
      badge: 'الأكثر طلباً 🔥'
    },
    {
      id: 'rew_2',
      title: 'جلسة مساج استرخائي لليدين مجاناً',
      pointsCost: 200,
      description: 'مساج بالكولاجين وزيوت اللافندر العطرية أثناء جلسة البدكير.',
      discountSAR: 80,
      category: 'free_service',
      badge: 'هدية مجانية 🎁'
    },
    {
      id: 'rew_3',
      title: 'قسيمة خصم 100 ريال على باقات العناية',
      pointsCost: 300,
      description: 'تخصم مباشرة عند حجز خدمات الصبغات أو باقات البروتين الملكي.',
      discountSAR: 100,
      category: 'discount'
    },
    {
      id: 'rew_4',
      title: 'ماسك ترطيب عميق للشعر مع البخار',
      pointsCost: 250,
      description: 'ماسك مغذي للشعر بإشراف خبيرة الصالون لإعادة اللمعان والحيوية.',
      discountSAR: 120,
      category: 'upgrade',
      badge: 'VIP ترقية'
    }
  ];

  const handleRedeem = (reward: LoyaltyReward) => {
    if (points >= reward.pointsCost) {
      setPoints(prev => prev - reward.pointsCost);
      setRedeemedIds(prev => [...prev, reward.id]);
      setNotification(`مبروك! تم استبدال المكافأة "${reward.title}" بنجاح وتمت إضافتها لحسابك.`);
      onRedeemReward(reward);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-rose-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30">
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              <span>نادي تدلّلي VIP للولاء والمكافآت</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">رصيد نقاط تدليلك الملكي</h1>
            <p className="text-rose-100 text-xs sm:text-sm max-w-xl">
              كل حجز في تدلّلي يمنحك نقاطاً حقيقية تتحول لخصومات فورية، جلسات مجانية، وتجارب استثنائية.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-5 text-center shrink-0 min-w-[180px]">
            <span className="text-xs text-rose-100 block font-medium">نقاطك المتاحة الآن</span>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-3xl font-black font-mono tracking-tight">{points}</span>
              <span className="text-xs font-bold text-amber-200">نقطة</span>
            </div>
            <span className="text-[10px] text-white/80 block mt-1">تعادل تقريباً {(points * 0.35).toFixed(0)} ريال خصومات</span>
          </div>
        </div>

        {/* How to earn */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/20 text-xs">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <p className="font-bold">احجزي أي خدمة</p>
              <p className="text-[10px] text-rose-100">اكسب 10 نقاط لكل 100 ريال مدفوعة</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <p className="font-bold">قيّمي تجربتك</p>
              <p className="text-[10px] text-rose-100">25 نقطة إضافية لكل تقييم صالون</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <p className="font-bold">استبدلي وافرحي</p>
              <p className="text-[10px] text-rose-100">خصومات فورية تطبق في خطوة الدفع</p>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-rose-500" />
            <span>كتالوج المكافآت الحصرية المتاحة للاستبدال</span>
          </h2>
          <button
            onClick={onBackToBookings}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>العودة لحجوزاتي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRewards.map((reward) => {
            const isRedeemed = redeemedIds.includes(reward.id);
            const canAfford = points >= reward.pointsCost;

            return (
              <div 
                key={reward.id}
                className="bg-white dark:bg-[#15151e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {reward.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-1">
                          {reward.badge}
                        </span>
                      )}
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {reward.title}
                      </h3>
                    </div>

                    <div className="px-3 py-1 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs font-black border border-rose-200 dark:border-rose-800 flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      <span>{reward.pointsCost} نقطة</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    توفير {reward.discountSAR} SAR
                  </span>

                  {isRedeemed ? (
                    <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم الاستبدال بنجاح</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md cursor-pointer'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'استبدال النقاط الآن' : 'نقاطك لا تكفي'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
