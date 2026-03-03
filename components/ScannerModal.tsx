
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Loader2, AlertCircle, Receipt, CreditCard, Save, Edit3, Calendar, Building2, DollarSign, Tag, CheckCircle2, BrainCircuit, AlertTriangle, Phone, Coins, ArrowRightLeft, Landmark, Banknote } from 'lucide-react';
import { fileToGenerativePart, processInvoiceWithGemini } from '../services/geminiService';
import { InvoiceData, ExpenseCategory, CURRENCIES, AccountType, BUSINESS_CATEGORIES, INDIVIDUAL_CATEGORIES } from '../types';

interface ScannerModalProps {
  onClose: () => void;
  onInvoiceAdded: (invoice: Omit<InvoiceData, 'id'>) => void;
  defaultCurrency: string;
  translations: any;
  accountType?: AccountType;
  invoices?: InvoiceData[];
  customCategories?: string[];
  hiddenCategories?: string[];
}

// Approximate static rates for offline calculation convenience
const EXCHANGE_RATES: Record<string, number> = {
    'OMR': 1,
    'USD': 0.385,
    'EUR': 0.420,
    'AED': 0.105,
    'SAR': 0.103,
    'GBP': 0.490
};

const ScannerModal: React.FC<ScannerModalProps> = ({ onClose, onInvoiceAdded, defaultCurrency, translations: t, accountType, invoices = [], customCategories = [], hiddenCategories = [] }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<Omit<InvoiceData, 'id'> | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPotentialDuplicate, setIsPotentialDuplicate] = useState(false);
  const [scanMode, setScanMode] = useState<'tax_invoice' | 'bank_receipt'>('tax_invoice');
  
  // Ref for Direct Camera Capture
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref for Gallery/File Selection
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (reviewData) {
        checkForDuplicate();
    }
  }, [reviewData, invoices]);

  const checkForDuplicate = () => {
      if (!reviewData) return;
      const isDup = invoices.some(inv => 
          inv.vendorName === reviewData.vendorName && 
          inv.date === reviewData.date && 
          Math.abs(inv.totalAmount - reviewData.totalAmount) < 0.001
      );
      setIsPotentialDuplicate(isDup);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
        const fileData = await fileToGenerativePart(file);
        // Create accessible URL for the image to store in history
        const imageUrl = `data:${fileData.mimeType};base64,${fileData.data}`;
        setCapturedImage(imageUrl);

        // Now passing the object { data, mimeType } directly
        const data = await processInvoiceWithGemini(fileData, defaultCurrency, scanMode);
        setReviewData(data);
    } catch (e: any) {
        console.error(e);
        if (e.message === "NOT_AN_INVOICE") {
            setError(t.scanner.invalidImage);
        } else {
            setError(t.scanner.error);
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (reviewData) {
        if (isPotentialDuplicate) {
            const confirmed = window.confirm(t.scanner.duplicateConfirm);
            if (!confirmed) return;
        }

        onInvoiceAdded({
            ...reviewData,
            type: scanMode,
            imageUrl: capturedImage || undefined
        });
        onClose();
    }
  };

  const updateReviewField = (field: keyof Omit<InvoiceData, 'id'>, value: any) => {
    if (reviewData) {
        setReviewData({ ...reviewData, [field]: value });
    }
  };

  // Smart Handler for Currency Change
  const handleCurrencyChange = (newCurrency: string) => {
      if (!reviewData) return;
      
      const rate = EXCHANGE_RATES[newCurrency] || 1;
      const currentOriginal = reviewData.originalAmount || reviewData.totalAmount;
      
      // Calculate new Total in OMR
      const newTotalOMR = parseFloat((currentOriginal * rate).toFixed(3));

      setReviewData({
          ...reviewData,
          currency: newCurrency,
          totalAmount: newTotalOMR,
          originalAmount: currentOriginal
      });
  };

  // Smart Handler for Original Amount Change
  const handleOriginalAmountChange = (newAmount: number) => {
      if (!reviewData) return;

      const rate = EXCHANGE_RATES[reviewData.currency || 'OMR'] || 1;
      const newTotalOMR = parseFloat((newAmount * rate).toFixed(3));

      setReviewData({
          ...reviewData,
          originalAmount: newAmount,
          totalAmount: newTotalOMR
      });
  };

  // Determine categories to show based on account type
  const standardCats = (accountType === 'INDIVIDUAL' ? INDIVIDUAL_CATEGORIES : BUSINESS_CATEGORIES)
    .filter(cat => !hiddenCategories.includes(cat));
  
  // Combine standard and custom categories for selection
  const allCategories = [...standardCats, ...customCategories];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-xl relative transition-colors overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {reviewData ? "مراجعة وتدقيق البيانات" : t.scanner.title}
            </h2>
            {!reviewData && <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t.scanner.subtitle}</p>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm flex items-center gap-2 border border-red-100 dark:border-red-800">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                </div>
            )}

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                    <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400 w-16 h-16" strokeWidth={1.5} />
                    <BrainCircuit className="absolute inset-0 m-auto text-emerald-500 w-6 h-6 animate-pulse" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.scanner.processing}</p>
                    <p className="text-sm text-slate-400">{t.scanner.processingDesc}</p>
                </div>
              </div>
            ) : reviewData ? (
              /* Review Form */
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3 mb-2">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">تم استخراج البيانات بنجاح. يرجى التأكد من صحتها قبل الحفظ.</p>
                </div>

                {isPotentialDuplicate && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start gap-3 animate-shake">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">{t.scanner.duplicateTitle}</p>
                            <p className="text-xs text-amber-700 dark:text-amber-500">{t.scanner.duplicateMsg}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Preview (Small) */}
                    {capturedImage && (
                        <div className="md:col-span-2 flex justify-center mb-2">
                            <img src={capturedImage} alt="Scanned Invoice" className="h-40 rounded-xl border border-slate-200 dark:border-slate-700 object-contain bg-slate-100 dark:bg-slate-800" />
                        </div>
                    )}

                    {scanMode === 'bank_receipt' ? (
                        <>
                            {/* Bank Name */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Landmark size={12} /> اسم البنك
                                </label>
                                <input 
                                    type="text" 
                                    value={reviewData.bankName || ''}
                                    onChange={(e) => updateReviewField('bankName', e.target.value)}
                                    placeholder="مثلاً: بنك مسقط"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                                />
                            </div>

                            {/* Company Name */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Building2 size={12} /> اسم الشركة
                                </label>
                                <input 
                                    type="text" 
                                    value={reviewData.vendorName}
                                    onChange={(e) => updateReviewField('vendorName', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-bold"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Calendar size={12} /> التاريخ
                                </label>
                                <input 
                                    type="text" 
                                    value={reviewData.date}
                                    onChange={(e) => updateReviewField('date', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                                />
                            </div>

                            {/* Total Amount (OMR) */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <DollarSign size={12} /> مبلغ الاجمالي
                                </label>
                                <input 
                                    type="number" 
                                    step="0.001"
                                    value={reviewData.totalAmount}
                                    onChange={(e) => updateReviewField('totalAmount', parseFloat(e.target.value))}
                                    className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono font-black text-emerald-800 dark:text-emerald-400"
                                />
                            </div>

                            {/* Card Last 4 */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <CreditCard size={12} /> اخر اربع ارقام من حساب البطاقة البنكية
                                </label>
                                <input 
                                    type="text" 
                                    value={reviewData.cardLast4 || ''}
                                    onChange={(e) => updateReviewField('cardLast4', e.target.value)}
                                    placeholder="مثلاً: 3970"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Banknote size={12} /> وسيلة الدفع
                                </label>
                                <select 
                                    value={reviewData.paymentMethod}
                                    onChange={(e) => updateReviewField('paymentMethod', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none"
                                >
                                    <option value="CARD">بطاقة بنكية</option>
                                    <option value="CASH">نقدي</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Date */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Calendar size={12} /> التاريخ
                                </label>
                                <input 
                                    type="text" 
                                    value={reviewData.date}
                                    onChange={(e) => updateReviewField('date', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                                />
                            </div>

                            {/* Merchant Name */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Building2 size={12} /> المورد
                                </label>
                                <input 
                                    type="text" 
                                    value={reviewData.vendorName}
                                    onChange={(e) => updateReviewField('vendorName', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-bold"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Banknote size={12} /> وسيلة الدفع
                                </label>
                                <select 
                                    value={reviewData.paymentMethod}
                                    onChange={(e) => updateReviewField('paymentMethod', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none"
                                >
                                    <option value="CARD">بطاقة بنكية</option>
                                    <option value="CASH">نقدي</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Tag size={12} /> التصنيف
                                </label>
                                <select 
                                    value={reviewData.category}
                                    onChange={(e) => updateReviewField('category', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none"
                                >
                                    {allCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Currency & Original Amount Section */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Coins size={12} /> المبلغ الأصلي
                                </label>
                                <div className="flex gap-2">
                                     <select 
                                        value={reviewData.currency || 'OMR'}
                                        onChange={(e) => handleCurrencyChange(e.target.value)}
                                        className="w-1/3 px-2 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white text-sm font-bold"
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.code}</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={reviewData.originalAmount || reviewData.totalAmount}
                                        onChange={(e) => handleOriginalAmountChange(parseFloat(e.target.value))}
                                        className="w-2/3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono font-bold"
                                    />
                                </div>
                            </div>

                            {/* Total Amount (OMR) */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <DollarSign size={12} /> المعادل (ر.ع)
                                </label>
                                <input 
                                    type="number" 
                                    step="0.001"
                                    value={reviewData.totalAmount}
                                    onChange={(e) => updateReviewField('totalAmount', parseFloat(e.target.value))}
                                    className="w-full px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono font-black text-emerald-800 dark:text-emerald-400"
                                />
                            </div>

                            {/* VAT Status */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> الحالة
                                </label>
                                <select 
                                    value={reviewData.vatStatus || 'مطابق'}
                                    onChange={(e) => updateReviewField('vatStatus', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white appearance-none"
                                >
                                    <option value="مطابق">مطابق</option>
                                    <option value="غير مطابق">غير مطابق</option>
                                    <option value="معفى">معفى</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
              </div>
            ) : (
              /* Upload Options */
              <div className="space-y-4 animate-fadeIn">
                {/* Input for Camera (Force Environment) */}
                <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {/* Input for Gallery/Files (No capture attribute) */}
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={galleryInputRef}
                    onChange={handleFileChange}
                />

                <div className={`grid grid-cols-1 ${accountType === 'INDIVIDUAL' ? '' : 'sm:grid-cols-2'} gap-4`}>
                    {accountType !== 'INDIVIDUAL' && (
                        <button 
                            onClick={() => {
                                setScanMode('tax_invoice');
                                if (fileInputRef.current) fileInputRef.current.value = '';
                                fileInputRef.current?.click();
                            }}
                            className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                        >
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                                <Receipt size={32} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-slate-800 dark:text-white text-base">{t.scanner.scanTax}</span>
                                <span className="text-xs text-slate-400 mt-1">فواتير ضريبية، سجل المشتريات</span>
                            </div>
                        </button>
                    )}

                    <button 
                        onClick={() => {
                            setScanMode('bank_receipt');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                            fileInputRef.current?.click();
                        }}
                        className={`flex flex-col items-center gap-4 p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-700 transition-all group ${accountType === 'INDIVIDUAL' ? 'w-full' : ''}`}
                    >
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <CreditCard size={32} />
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-slate-800 dark:text-white text-base">{t.scanner.scanVisa}</span>
                            <span className="text-xs text-slate-400 mt-1">إيصالات نقاط البيع، تتبع البطاقة</span>
                        </div>
                    </button>
                </div>

                <button 
                    onClick={() => {
                        if (galleryInputRef.current) galleryInputRef.current.value = '';
                        galleryInputRef.current?.click();
                    }}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                    <Upload size={18} />
                    <span>أو ارفع ملف من جهازك</span>
                </button>
                
                <p className="text-xs text-center text-slate-400 dark:text-slate-500 pt-2">
                    {t.scanner.supportText.replace('{curr}', defaultCurrency)}
                </p>
              </div>
            )}
        </div>

        {/* Footer Actions */}
        {reviewData && !isProcessing && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-3">
                    <button 
                        onClick={() => setReviewData(null)}
                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={handleConfirmSave}
                        className={`flex-[2] py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 text-white ${
                            isPotentialDuplicate 
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-amber-900/20' 
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-emerald-900/20'
                        }`}
                    >
                        {isPotentialDuplicate ? <AlertTriangle size={20} /> : <Save size={20} />}
                        <span>{isPotentialDuplicate ? (accountType === 'INDIVIDUAL' ? "تأكيد التكرار" : "تأكيد وحفظ رغم التكرار") : "تأكيد وحفظ الفاتورة"}</span>
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScannerModal;
