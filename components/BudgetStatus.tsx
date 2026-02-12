import React from 'react';
import { ExpenseCategory, BudgetLimits, CATEGORY_MAPPING } from '../types';
import { AlertTriangle, CheckCircle, TrendingDown, BellRing } from 'lucide-react';

interface BudgetStatusProps {
  budgets: BudgetLimits;
  currentSpending: Record<string, number>;
  translations: any;
  language: string;
}

const BudgetStatus: React.FC<BudgetStatusProps> = ({ budgets, currentSpending, translations: t, language }) => {
  // Filter categories that actually have a budget set
  const activeBudgets = Object.entries(budgets)
    .filter(([_, limit]) => typeof limit === 'number' && limit > 0) as [string, number][];

  if (activeBudgets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col items-center justify-center text-center transition-colors">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-3 text-slate-400 dark:text-slate-500">
            <AlertTriangle size={24} />
        </div>
        <h3 className="text-slate-600 dark:text-slate-300 font-bold mb-1">{t.budgetStatus.noBudgetTitle}</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">{t.budgetStatus.noBudgetDesc}</p>
      </div>
    );
  }

  const getCategoryLabel = (cat: string) => {
    return language === 'en' && CATEGORY_MAPPING[cat] ? CATEGORY_MAPPING[cat] : cat;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 h-full overflow-y-auto transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BellRing size={20} className="text-emerald-500" />
          <span>{t.budgetStatus.title}</span>
        </h2>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full uppercase tracking-widest">{t.budgetStatus.monthly}</span>
      </div>
      
      <div className="space-y-5">
        {activeBudgets.map(([cat, limit]) => {
          const category = cat as ExpenseCategory;
          const spent = currentSpending[category] || 0;
          const percentage = Math.min((spent / limit) * 100, 100);
          const isOverBudget = spent > limit;

          return (
            <div 
              key={category} 
              className={`p-3 rounded-2xl transition-all border ${
                isOverBudget 
                  ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800 animate-shake animate-pulse-red' 
                  : 'bg-transparent border-transparent'
              }`}
            >
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${isOverBudget ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {getCategoryLabel(category)}
                  </span>
                  {isOverBudget && (
                    <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                      <TrendingDown size={10} />
                      تجاوز بنسبة {Math.round((spent/limit)*100 - 100)}%
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono" dir="ltr">
                  <span className={isOverBudget ? "text-rose-600 dark:text-rose-400 font-black" : "text-slate-600 dark:text-slate-400 font-bold"}>
                    {spent.toFixed(3)}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500"> / {limit.toFixed(1)} {t.stats.currency}</span>
                </div>
              </div>
              
              <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`absolute top-0 right-0 h-full rounded-full transition-all duration-700 ease-out ${
                    isOverBudget 
                      ? 'bg-gradient-to-l from-rose-500 to-red-600' 
                      : percentage > 85 
                        ? 'bg-gradient-to-l from-amber-400 to-orange-500' 
                        : 'bg-gradient-to-l from-emerald-400 to-teal-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {isOverBudget && (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-rose-600 dark:text-rose-400 font-black bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                  <AlertTriangle size={14} className="animate-bounce" />
                  <span>{t.budgetStatus.overBudget}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetStatus;