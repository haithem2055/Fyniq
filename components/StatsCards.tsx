import React from 'react';
import { TrendingUp, Receipt, FileText, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
  translations: any;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, translations: t }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Expenses */}
      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <TrendingUp size={24} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                    <Activity size={12} />
                    {t.stats.active}
                </span>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t.stats.totalSpend}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight" dir="ltr">
              {stats.totalSpend.toFixed(3)} <span className="text-lg text-slate-400 dark:text-slate-500 font-bold">{t.stats.currency}</span>
            </h3>
        </div>
      </div>

      {/* Total VAT */}
      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-rose-100/50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl">
                    <Receipt size={24} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                    {t.stats.tax5}
                </span>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t.stats.totalVat}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight" dir="ltr">
              {stats.totalVat.toFixed(3)} <span className="text-lg text-slate-400 dark:text-slate-500 font-bold">{t.stats.currency}</span>
            </h3>
        </div>
      </div>

      {/* Invoice Count */}
      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100/50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <FileText size={24} strokeWidth={2.5} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    <ArrowUpRight size={12} />
                    {t.stats.updated}
                </span>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t.stats.invoiceCount}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {stats.invoiceCount} <span className="text-lg text-slate-400 dark:text-slate-500 font-bold">{t.stats.invoiceUnit}</span>
            </h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;