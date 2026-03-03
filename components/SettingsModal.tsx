
import React, { useState } from 'react';
import { X, Save, Calculator, Globe, CreditCard, Building2, UserCircle, FileBadge, Mail, Plus, Trash2 } from 'lucide-react';
import { ExpenseCategory, AppSettings, CURRENCIES, CATEGORY_MAPPING, UserProfile, BUSINESS_CATEGORIES, INDIVIDUAL_CATEGORIES } from '../types';

interface SettingsModalProps {
  currentSettings: AppSettings;
  userProfile: UserProfile | null;
  onSave: (settings: AppSettings) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
  translations: any;
  language: string;
}

type Tab = 'general' | 'budgets' | 'profile';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    currentSettings, 
    userProfile, 
    onSave, 
    onUpdateProfile, 
    onClose, 
    translations: t, 
    language 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  
  // Custom Budget State
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [newCustomBudget, setNewCustomBudget] = useState('');

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(userProfile || {
      id: '',
      role: 'USER',
      accountType: 'BUSINESS', // Default fallback
      status: 'ACTIVE',
      companyName: '',
      email: '',
      crNumber: '',
      vatNumber: '',
      subscription: {
          plan: 'FREE',
          cycle: 'MONTHLY',
          usageCount: 0,
          limit: 30,
          renewalDate: new Date().toISOString()
      }
  });

  const handleBudgetChange = (category: string, value: string) => {
    const numValue = parseFloat(value);
    setSettings(prev => ({
      ...prev,
      budgets: {
          ...prev.budgets,
          [category]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleAddCustomBudget = () => {
    if (newCustomCategory.trim() && newCustomBudget) {
        handleBudgetChange(newCustomCategory.trim(), newCustomBudget);
        setNewCustomCategory('');
        setNewCustomBudget('');
    }
  };

  const handleDeleteBudget = (category: string) => {
      const newBudgets = { ...settings.budgets };
      delete newBudgets[category];
      
      const isStandard = (isBusiness ? BUSINESS_CATEGORIES : INDIVIDUAL_CATEGORIES).includes(category as ExpenseCategory);
      
      setSettings(prev => ({
          ...prev,
          budgets: newBudgets,
          hiddenCategories: isStandard 
            ? [...(prev.hiddenCategories || []), category]
            : prev.hiddenCategories
      }));
  };

  const handleCurrencyChange = (code: string) => {
      setSettings(prev => ({
          ...prev,
          defaultCurrency: code
      }));
  };

  const handleSave = () => {
    if (activeTab === 'profile') {
        onUpdateProfile(profile);
    } else {
        // Auto-add pending custom budget if user forgot to click (+)
        let finalSettings = { ...settings };
        if (activeTab === 'budgets' && newCustomCategory.trim() && newCustomBudget) {
            const numVal = parseFloat(newCustomBudget);
            if (!isNaN(numVal)) {
                finalSettings.budgets = {
                    ...finalSettings.budgets,
                    [newCustomCategory.trim()]: numVal
                };
            }
        }
        onSave(finalSettings);
    }
    onClose();
  };

  const getCategoryLabel = (cat: string) => {
    return language === 'en' && CATEGORY_MAPPING[cat] ? CATEGORY_MAPPING[cat] : cat;
  };

  const isAr = language === 'ar';
  const isBusiness = profile.accountType === 'BUSINESS';

  // Determine standard categories based on account type
  const allStandardCategories = isBusiness ? BUSINESS_CATEGORIES : INDIVIDUAL_CATEGORIES;
  const standardCategories = allStandardCategories.filter(cat => !(settings.hiddenCategories || []).includes(cat));
  
  // Custom categories are those present in settings.budgets but NOT in the standard list
  const customCategories = Object.keys(settings.budgets).filter(cat => !allStandardCategories.includes(cat as ExpenseCategory));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-0 relative max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button 
                onClick={onClose}
                className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center">{t.settings.title}</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'general' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <Globe size={18} />
                <span className="hidden sm:inline">{t.settings.tabGeneral}</span>
            </button>
            <button 
                onClick={() => setActiveTab('budgets')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'budgets' ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <Calculator size={18} />
                <span className="hidden sm:inline">{t.settings.tabBudgets}</span>
            </button>
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'profile' ? 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20' : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <Building2 size={18} />
                <span className="hidden sm:inline">{isBusiness ? (isAr ? 'ملف الشركة' : 'Company') : (isAr ? 'الملف الشخصي' : 'Profile')}</span>
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
                <div className="space-y-6 animate-fadeIn">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3 flex items-center gap-2">
                            <CreditCard size={18} className="text-emerald-500" />
                            {t.settings.defaultCurrency}
                        </label>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            {t.settings.currencyDesc}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {CURRENCIES.map((curr) => (
                                <button
                                    key={curr.code}
                                    onClick={() => handleCurrencyChange(curr.code)}
                                    className={`p-3 rounded-xl border text-right transition-all ${
                                        settings.defaultCurrency === curr.code 
                                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500' 
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-200 dark:hover:border-emerald-700'
                                    }`}
                                >
                                    <div className="font-bold flex justify-between">
                                        <span>{language === 'ar' ? curr.nameAr : curr.nameEn}</span>
                                        <span className="font-mono text-sm opacity-50">{curr.code}</span>
                                    </div>
                                    <div className="text-sm opacity-70 mt-1">{curr.symbol}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'budgets' && (
                <div className="space-y-6 animate-fadeIn">
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t.settings.budgetDesc}</p>
                     
                     {/* Add Custom Category Section */}
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                            <Plus size={16} className="text-blue-500" />
                            {isAr ? 'إضافة بند موازنة خاص' : 'Add Custom Budget Item'}
                        </h4>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={newCustomCategory}
                                onChange={(e) => setNewCustomCategory(e.target.value)}
                                placeholder={isAr ? "اسم البند (مثلاً: إيجار)" : "Item Name"}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-white outline-none focus:border-blue-500"
                            />
                            <input 
                                type="number"
                                value={newCustomBudget}
                                onChange={(e) => setNewCustomBudget(e.target.value)}
                                placeholder="0.00"
                                className="w-24 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                                dir="ltr"
                            />
                            <button 
                                onClick={handleAddCustomBudget}
                                disabled={!newCustomCategory || !newCustomBudget}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'البنود الأساسية' : 'Standard Categories'}</h4>
                        {standardCategories.map((category) => (
                            <div key={category} className="flex items-center gap-4 group">
                                <div className="w-1/2 flex items-center gap-2">
                                    <button 
                                        onClick={() => handleDeleteBudget(category)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                        title={isAr ? "حذف البند" : "Delete Item"}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={getCategoryLabel(category)}>
                                        {getCategoryLabel(category)}
                                    </label>
                                </div>
                                <div className="relative w-1/2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="10"
                                        value={settings.budgets[category] || ''}
                                        onChange={(e) => handleBudgetChange(category, e.target.value)}
                                        placeholder="0.000"
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left ltr"
                                        dir="ltr"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{t.settings.currencyUnit}</span>
                                </div>
                            </div>
                        ))}

                        {customCategories.length > 0 && (
                            <>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 pt-2 border-t border-slate-100 dark:border-slate-800">{isAr ? 'بنود مضافة يدوياً' : 'Custom Items'}</h4>
                                {customCategories.map((category) => (
                                    <div key={category} className="flex items-center gap-4 group">
                                        <div className="w-1/2 flex items-center gap-2">
                                            <button 
                                                onClick={() => handleDeleteBudget(category)}
                                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={category}>{category}</label>
                                        </div>
                                        <div className="relative w-1/2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="10"
                                                value={settings.budgets[category] || ''}
                                                onChange={(e) => handleBudgetChange(category, e.target.value)}
                                                className="w-full px-4 py-2 border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left ltr"
                                                dir="ltr"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{t.settings.currencyUnit}</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                     </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                            <UserCircle size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">{profile.companyName || 'الاسم'}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 mt-1 inline-block">
                                {isBusiness ? (isAr ? 'حساب شركات' : 'Business') : (isAr ? 'حساب فردي' : 'Individual')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Building2 size={16} className="text-slate-400" />
                                {isBusiness ? t.login.companyName : (isAr ? 'الاسم الكامل' : 'Full Name')}
                            </label>
                            <input
                                type="text"
                                value={profile.companyName}
                                onChange={(e) => setProfile(prev => ({ ...prev, companyName: e.target.value }))}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" />
                                {t.login.email}
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        
                        {isBusiness && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                        <FileBadge size={16} className="text-slate-400" />
                                        {isAr ? 'رقم السجل' : 'CR No.'}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.crNumber}
                                        onChange={(e) => setProfile(prev => ({ ...prev, crNumber: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                        <FileBadge size={16} className="text-slate-400" />
                                        {isAr ? 'الرقم الضريبي' : 'VAT No.'}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.vatNumber || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev, vatNumber: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
            <button 
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-white ${activeTab === 'profile' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 dark:shadow-purple-900/30' : 'bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-slate-200 dark:shadow-emerald-900/30'}`}
            >
            <Save size={20} />
            <span>{t.settings.saveBtn}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
