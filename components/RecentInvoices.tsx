
import React, { useState } from 'react';
import { InvoiceData, CATEGORY_MAPPING } from '../types';
import { AlertCircle, CheckCircle, Clock, FileText, Calendar, DollarSign, Tag, Coins, Phone, CreditCard, Banknote, ArrowRightLeft, Landmark, Building2 } from 'lucide-react';

interface RecentInvoicesProps {
  invoices: InvoiceData[];
  translations: any;
  language: string;
  mode?: 'invoices' | 'bank_receipts' | 'full_log';
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ invoices, translations: t, language, mode = 'invoices' }) => {
  
  const getStatusLabel = (status: string) => {
    if (status === 'مطابق') return t.invoices.statusCorrect;
    if (status === 'غير مطابق') return t.invoices.statusMismatch;
    if (status === 'معفى') return t.invoices.statusExempt;
    return status;
  };

  const getCategoryLabel = (cat: string) => {
    return language === 'en' && CATEGORY_MAPPING[cat] ? CATEGORY_MAPPING[cat] : cat;
  };

  const isBankMode = mode === 'bank_receipts';
  const isFullLog = mode === 'full_log';
  const labels = isBankMode ? t.bankReceipts : t.invoices;
  const title = isFullLog ? t.fullHistory : labels.title;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 transition-colors">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                {isBankMode ? <Landmark size={20} /> : isFullLog ? <FileText size={20} /> : <Clock size={20} />}
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
        </div>
        <span className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <CheckCircle size={12} />
          {t.invoices.processedBy}
        </span>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <thead className="bg-slate-50/80 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 backdrop-blur-sm sticky top-0 z-10">
            {isFullLog ? (
              <tr>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><Calendar size={14} /> {t.invoices.date}</div></th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><Tag size={14} /> {language === 'ar' ? 'النوع' : 'Type'}</div></th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><Building2 size={14} /> {language === 'ar' ? 'الجهة' : 'Entity'}</div></th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><Tag size={14} /> {t.invoices.category}</div></th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><Coins size={14} /> {language === 'ar' ? 'الضريبة' : 'VAT'}</div></th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><Coins size={14} /> {t.invoices.original}</div></th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><DollarSign size={14} /> {t.invoices.equivalent}</div></th>
                <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500"><div className="flex items-center gap-2"><CreditCard size={14} /> {language === 'ar' ? 'الدفع' : 'Payment'}</div></th>
              </tr>
            ) : isBankMode ? (
              <tr>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Landmark size={14} /> {labels.bankName}</div></th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Building2 size={14} /> {labels.companyName}</div></th>
                <th className="px-6 py-4 font-bold flex items-center gap-2"><Calendar size={14} /> {labels.date}</th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><DollarSign size={14} /> {labels.totalAmount}</div></th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><CreditCard size={14} /> {labels.cardLast4}</div></th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Banknote size={14} /> {labels.paymentMethod}</div></th>
              </tr>
            ) : (
              <tr>
                <th className="px-6 py-4 font-bold flex items-center gap-2"><Calendar size={14} /> {labels.date}</th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><FileText size={14} /> {labels.vendor}</div></th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Coins size={14} /> سعر الضريبة</div></th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Tag size={14} /> {labels.category}</div></th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><Coins size={14} /> {labels.original}</div></th>
                <th className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><DollarSign size={14} /> سعر الاجمالي</div></th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {invoices.length === 0 ? (
                <tr>
                    <td colSpan={isFullLog ? 8 : 6} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-800/30">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-300 dark:text-slate-500">
                                <FileText size={32} />
                            </div>
                            <p>{labels.emptyTitle}</p>
                            <p className="text-xs opacity-70">{labels.emptyDesc}</p>
                        </div>
                    </td>
                </tr>
            ) : (
                invoices.map((invoice, idx) => {
                  if (isFullLog) {
                    const isBank = invoice.type === 'bank_receipt';
                    return (
                      <tr key={invoice.id || `full-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all group border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                        <td className="px-6 py-4">
                          <div className="text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap flex items-center gap-2">
                            <Calendar size={12} className="text-slate-400" />
                            {invoice.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${isBank ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                            {isBank ? <Landmark size={10} /> : <FileText size={10} />}
                            {isBank ? (language === 'ar' ? 'إيصال بنكي' : 'Bank Receipt') : (language === 'ar' ? 'فاتورة ضريبية' : 'Tax Invoice')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-[180px]">
                            <span className="font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {isBank ? (invoice.bankName || invoice.vendorName) : invoice.vendorName}
                            </span>
                            {!isBank && invoice.vendorPhone && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone size={10} className="opacity-50" />
                                <span dir="ltr">{invoice.vendorPhone}</span>
                              </div>
                            )}
                            {isBank && invoice.vendorName && invoice.bankName && (
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                                <Building2 size={10} className="opacity-50" />
                                {invoice.vendorName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 text-[10px] font-bold border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            {invoice.category ? getCategoryLabel(invoice.category) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4" dir="ltr">
                          {invoice.vatAmount > 0 ? (
                            <div className="flex flex-col">
                              <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">{invoice.vatAmount.toFixed(3)}</span>
                              <span className="text-[8px] text-slate-400 font-bold">OMR</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 font-mono">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4" dir="ltr">
                          {invoice.currency && invoice.currency !== 'OMR' ? (
                            <div className="flex flex-col">
                              <span className="text-slate-700 dark:text-slate-300 font-mono font-bold text-sm">{invoice.originalAmount?.toFixed(2)}</span>
                              <span className="text-slate-400 text-[8px] font-black uppercase">{invoice.currency}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 font-mono">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4" dir="ltr">
                          <div className="flex flex-col">
                            <span className="text-emerald-700 dark:text-emerald-400 font-black font-mono text-base">{invoice.totalAmount.toFixed(3)}</span>
                            <span className="text-[8px] text-slate-400 font-black">OMR</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${invoice.paymentMethod === 'CARD' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                              {invoice.paymentMethod === 'CARD' ? <CreditCard size={14} /> : <Banknote size={14} />}
                            </div>
                            <div className="flex flex-col leading-tight">
                              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">
                                {invoice.paymentMethod === 'CARD' ? (language === 'ar' ? 'بطاقة' : 'Card') : (language === 'ar' ? 'نقدي' : 'Cash')}
                              </span>
                              {invoice.cardLast4 && (
                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter">**** {invoice.cardLast4}</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (isBankMode) {
                    return (
                      <tr key={invoice.id || `bank-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                          <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 dark:text-white">{invoice.bankName || 'غير محدد'}</div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="font-medium text-slate-700 dark:text-slate-300">{invoice.vendorName}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{invoice.date}</td>
                          <td className="px-6 py-4" dir="ltr">
                               <div className="flex flex-col items-start">
                                  <span className="text-emerald-700 dark:text-emerald-400 font-black font-mono text-base">{invoice.totalAmount.toFixed(3)}</span>
                                  <span className="text-[10px] text-slate-400">ر.ع</span>
                               </div>
                          </td>
                          <td className="px-6 py-4">
                              {invoice.cardLast4 ? (
                                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                      <span className="font-mono text-xs">**** {invoice.cardLast4}</span>
                                  </div>
                              ) : (
                                  <span className="text-slate-400 text-xs">-</span>
                              )}
                          </td>
                          <td className="px-6 py-4">
                              {invoice.paymentMethod === 'CARD' ? (
                                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                      <CreditCard size={14} />
                                      <span className="text-xs">بطاقة بنكية</span>
                                  </div>
                              ) : (
                                  <div className="flex items-center gap-2 text-slate-500">
                                      <Banknote size={14} />
                                      <span className="text-xs">نقدي</span>
                                  </div>
                              )}
                          </td>
                      </tr>
                    );
                  }

                  const isForeign = invoice.currency && invoice.currency !== 'OMR';
                  const rate = isForeign && invoice.originalAmount && invoice.originalAmount > 0 
                    ? (invoice.totalAmount / invoice.originalAmount).toFixed(3) 
                    : null;

                  return (
                    <tr key={invoice.id || `inv-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{invoice.date}</td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 dark:text-white">{invoice.vendorName}</div>
                            {invoice.vendorPhone && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Phone size={10} />
                                    <span dir="ltr">{invoice.vendorPhone}</span>
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-4" dir="ltr">
                            <div className="flex flex-col items-start">
                                <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">{invoice.vatAmount.toFixed(3)}</span>
                                <span className="text-[10px] text-slate-400">ر.ع</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                {getCategoryLabel(invoice.category)}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-medium" dir="ltr">
                            {isForeign ? (
                              <div className="flex flex-col items-end">
                                <span className="text-slate-800 dark:text-slate-200 font-bold">{invoice.originalAmount?.toFixed(2)}</span>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px]">{invoice.currency}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 text-xs text-center block w-full">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4" dir="ltr">
                             <div className="flex flex-col items-end">
                                <span className="text-emerald-700 dark:text-emerald-400 font-black font-mono text-base">{invoice.totalAmount.toFixed(3)}</span>
                                {rate && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded" title="Exchange Rate">
                                    <ArrowRightLeft size={8} />
                                    <span>{rate}</span>
                                  </div>
                                )}
                             </div>
                        </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvoices;
