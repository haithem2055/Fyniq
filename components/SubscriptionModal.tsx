import React, { useState } from 'react';
import { X, Check, Crown, Zap, Building2, Star } from 'lucide-react';
import { PlanType, SubscriptionDetails } from '../types';

interface SubscriptionModalProps {
  currentSubscription: SubscriptionDetails;
  onUpgrade: (plan: PlanType, cycle: 'MONTHLY' | 'YEARLY') => void;
  onClose: () => void;
  translations: any;
  language: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  currentSubscription, 
  onUpgrade, 
  onClose, 
  translations: t,
  language
}) => {
  const [cycle, setCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const plans = [
    {
      id: 'FREE' as PlanType,
      name: t.plans.free.name,
      price: 0,
      limit: 30,
      icon: Star,
      color: 'bg-slate-100 dark:bg-slate-800',
      textColor: 'text-slate-600 dark:text-slate-300',
      features: t.plans.free.features
    },
    {
      id: 'STANDARD' as PlanType,
      name: t.plans.standard.name,
      price: cycle === 'MONTHLY' ? 4 : 40, // 4 OMR/Month approx covers the 100 baisa logic for 40 extra invoices
      limit: 70,
      icon: Zap,
      color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      features: t.plans.standard.features,
      popular: true
    },
    {
      id: 'ENTERPRISE' as PlanType,
      name: t.plans.enterprise.name,
      price: -1, // Contact Sales
      limit: -1,
      icon: Building2,
      color: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-400',
      features: t.plans.enterprise.features
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-5xl overflow-hidden relative flex flex-col max-h-[95vh]">
        <button 
          onClick={onClose}
          className="absolute left-6 top-6 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white/50 dark:bg-slate-800/50 p-2 rounded-full backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        <div className="p-8 pb-4 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                {t.plans.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                {t.plans.subtitle}
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center mt-8 mb-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex relative">
                    <button
                        onClick={() => setCycle('MONTHLY')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${
                            cycle === 'MONTHLY' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {t.plans.monthly}
                    </button>
                    <button
                        onClick={() => setCycle('YEARLY')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 flex items-center gap-2 ${
                            cycle === 'YEARLY' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {t.plans.yearly}
                        <span className="bg-amber-400 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-md">
                            {t.plans.save}
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrent = currentSubscription.plan === plan.id;
                    const Icon = plan.icon;
                    
                    return (
                        <div 
                            key={plan.id}
                            className={`relative rounded-3xl p-6 border-2 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                plan.popular ? 'border-emerald-500 dark:border-emerald-500 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 whitespace-nowrap">
                                    <Crown size={12} fill="currentColor" />
                                    {t.plans.popularBadge}
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${plan.color} ${plan.textColor}`}>
                                <Icon size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                            
                            <div className="mb-6">
                                {plan.price === -1 ? (
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{t.plans.contactUs}</span>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white" dir="ltr">
                                            {plan.price.toFixed(3)}
                                        </span>
                                        <span className="text-sm font-medium text-slate-500">
                                            {t.stats.currency} / {cycle === 'MONTHLY' ? t.plans.mo : t.plans.yr}
                                        </span>
                                    </div>
                                )}
                                <p className="text-xs text-slate-400 mt-2">
                                    {plan.limit === -1 
                                        ? t.plans.unlimitedInvoices 
                                        : t.plans.limitDesc.replace('{limit}', plan.limit)}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feat: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <Check size={16} className="mt-0.5 text-emerald-500 shrink-0" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => onUpgrade(plan.id, cycle)}
                                disabled={isCurrent}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                                    isCurrent 
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default'
                                    : plan.popular 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30' 
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                                }`}
                            >
                                {isCurrent ? t.plans.currentPlan : t.plans.choosePlan}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;