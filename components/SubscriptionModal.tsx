
import React, { useState } from 'react';
import { X, Check, Crown, Zap, Building2, Star, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';
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
      limit: 20,
      icon: Star,
      color: 'bg-slate-100 dark:bg-slate-800',
      textColor: 'text-slate-600 dark:text-slate-300',
      features: t.plans.free.features,
      tag: language === 'ar' ? 'البداية المجانية' : 'Free Start'
    },
    {
      id: 'STANDARD' as PlanType,
      name: t.plans.standard.name,
      price: cycle === 'MONTHLY' ? 5 : 50, 
      limit: 100,
      icon: Zap,
      color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      features: t.plans.standard.features,
      popular: true,
      tag: language === 'ar' ? 'الأكثر طلباً' : 'Best Value'
    },
    {
      id: 'ENTERPRISE' as PlanType,
      name: t.plans.enterprise.name,
      price: -1, 
      limit: -1,
      icon: ShieldCheck,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200',
      textColor: 'text-blue-700 dark:text-blue-400',
      features: t.plans.enterprise.features,
      tag: language === 'ar' ? 'للشركات الكبيرة' : 'Enterprise'
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] shadow-2xl w-full max-w-6xl overflow-hidden relative flex flex-col max-h-[95vh] border border-white/10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute left-6 top-6 z-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-800 p-2 rounded-full shadow-md border border-slate-100 dark:border-slate-700"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="p-8 pb-0 text-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -ml-32 -mt-32"></div>

            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                    {t.plans.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
                    {t.plans.subtitle}
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center mt-10 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl flex relative border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button
                            onClick={() => setCycle('MONTHLY')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 ${
                                cycle === 'MONTHLY' 
                                ? 'bg-slate-900 dark:bg-slate-600 text-white shadow-lg' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {t.plans.monthly}
                        </button>
                        <button
                            onClick={() => setCycle('YEARLY')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10 flex items-center gap-2 ${
                                cycle === 'YEARLY' 
                                ? 'bg-emerald-500 text-white shadow-lg' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {t.plans.yearly}
                            <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-md font-black animate-pulse">
                                {t.plans.save}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {plans.map((plan) => {
                    const isCurrent = currentSubscription.plan === plan.id;
                    const Icon = plan.icon;
                    
                    return (
                        <div 
                            key={plan.id}
                            className={`relative rounded-[2.5rem] p-8 border-2 flex flex-col transition-all duration-500 group ${
                                plan.popular 
                                ? 'border-emerald-500 dark:border-emerald-500 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/10' 
                                : 'border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900'
                            }`}
                        >
                            {/* Popular Ribbon / Tag */}
                            <div className={`absolute top-6 ${language === 'ar' ? 'left-8' : 'right-8'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                plan.popular 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                                {plan.tag}
                            </div>

                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${plan.color} ${plan.textColor} group-hover:scale-110 transition-transform`}>
                                <Icon size={32} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                            
                            <div className="mb-8">
                                {plan.price === -1 ? (
                                    <div className="h-12 flex items-center">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.plans.contactUs}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter" dir="ltr">
                                            {plan.price.toFixed(plan.price === 0 ? 0 : 0)}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{t.stats.currency}</span>
                                            <span className="text-xs font-bold text-slate-400">/{cycle === 'MONTHLY' ? t.plans.mo : t.plans.yr}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feat: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 group/feat">
                                        <div className={`mt-1 rounded-full p-0.5 ${plan.popular ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className={`text-sm font-medium leading-snug transition-colors ${plan.popular ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {feat}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => onUpgrade(plan.id, cycle)}
                                disabled={isCurrent}
                                className={`w-full py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 group/btn ${
                                    isCurrent 
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default'
                                    : plan.popular 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30' 
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xl'
                                }`}
                            >
                                {isCurrent ? (
                                    <>
                                        <ShieldCheck size={18} />
                                        <span>{t.plans.currentPlan}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t.plans.choosePlan}</span>
                                        <ArrowRight size={18} className={`transition-transform ${language === 'ar' ? 'rotate-180' : ''} group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1`} />
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Guarantee Section */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                        <ShieldAlert size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'ضمان أمان البيانات وفق المعايير العمانية' : 'Data security guaranteed by Omani standards'}
                    </span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Check size={14} className="text-emerald-500" />
                    {language === 'ar' ? 'دعم فني متوفر' : 'Technical support available'}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Check size={14} className="text-emerald-500" />
                    {language === 'ar' ? 'إلغاء في أي وقت' : 'Cancel anytime'}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
