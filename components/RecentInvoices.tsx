import React from 'react';
import { InvoiceData, CATEGORY_MAPPING } from '../types';
import { AlertCircle, CheckCircle, Clock, FileText, Calendar, DollarSign, Tag, Coins, Phone, CreditCard, Banknote } from 'lucide-react';

interface RecentInvoicesProps {
  invoices: InvoiceData[];
  translations: any;
  language: string;
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ invoices, translations: t, language }) => {
  
  const getStatusLabel = (status: string) => {
    if (status === 'مطابق') return t.invoices.statusCorrect;
    if (status === 'غير مطابق') return t.invoices.statusMismatch;
    if (status === 'معفى') return t.invoices.statusExempt;
    return status;
  };

  const getCategoryLabel = (cat: string) => {
    return language === 'en' && CATEGORY_MAPPING[cat] ? CATEGORY_MAPPING[cat] : cat;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 transition-colors">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.invoices.title}</h2>
        </div>
        <span className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <CheckCircle size={12} />
          {t.invoices.processedBy}
        </span>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <thead className="bg-slate-50/80 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold flex items-center gap-2"><Calendar size={14} /> {t.invoices.date}</th>
              <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><FileText size={14} /> {t.invoices.vendor}</div></th>
              <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2">وسيلة الدفع</div></th>
              <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Tag size={14} /> {t.invoices.category}</div></th>
              <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Coins size={14} /> {t.invoices.original}</div></th>
              <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><DollarSign size={14} /> {t.invoices.equivalent}</div></th>
              <th className="px-6 py-4 font-bold">{t.invoices.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {invoices.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-800/30">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-300 dark:text-slate-500">
                                <FileText size={32} />
                            </div>
                            <p>{t.invoices.emptyTitle}</p>
                            <p className="text-xs opacity-70">{t.invoices.emptyDesc}</p>
                        </div>
                    </td>
                </tr>
            ) : (
                invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{invoice.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{invoice.vendorName}</td>
                    <td className="px-6 py-4">
                        {invoice.paymentMethod === 'CARD' ? (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <CreditCard size={16} />
                                <span className="font-mono text-xs">**** {invoice.cardLast4 || 'Card'}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-500">
                                <Banknote size={16} />
                                <span className="text-xs">نقدي</span>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                            {getCategoryLabel(invoice.category)}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-medium" dir="ltr">
                        <span className="text-slate-800 dark:text-slate-200">{invoice.originalAmount?.toFixed(2) || invoice.totalAmount.toFixed(3)}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">{invoice.currency || 'OMR'}</span>
                    </td>
                    <td className="px-6 py-4 text-emerald-700 dark:text-emerald-400 font-black font-mono text-base" dir="ltr">{invoice.totalAmount.toFixed(3)}</td>
                    <td className="px-6 py-4">
                        {invoice.vatStatus === 'مطابق' ? (
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-lg text-xs font-bold gap-1 border border-emerald-100 dark:border-emerald-800">
                                <CheckCircle size={12} />
                                <span>{getStatusLabel(invoice.vatStatus)}</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 w-fit px-2 py-1 rounded-lg text-xs font-bold gap-1 border border-amber-100 dark:border-amber-800">
                                <AlertCircle size={12} />
                                <span>{getStatusLabel(invoice.vatStatus)}</span>
                            </div>
                        )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvoices;