import React, { useState } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { ExpenseCategory, BudgetLimits } from '../types';

interface BudgetSettingsModalProps {
  currentBudgets: BudgetLimits;
  onSave: (budgets: BudgetLimits) => void;
  onClose: () => void;
}

const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({ currentBudgets, onSave, onClose }) => {
  const [budgets, setBudgets] = useState<BudgetLimits>(currentBudgets);

  const handleChange = (category: ExpenseCategory, value: string) => {
    const numValue = parseFloat(value);
    setBudgets(prev => ({
      ...prev,
      [category]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSave = () => {
    onSave(budgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mt-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3">
            <Calculator size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">إعداد الموازنة الشهرية</h2>
          <p className="text-slate-500 text-sm mt-1">حدد الحد الأقصى للمصروفات لكل بند لتلقي التنبيهات</p>
        </div>

        <div className="space-y-4 mb-8">
          {Object.values(ExpenseCategory).map((category) => (
            <div key={category} className="flex items-center gap-4">
              <label className="w-1/2 text-sm font-medium text-slate-700">{category}</label>
              <div className="relative w-1/2">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={budgets[category] || ''}
                  onChange={(e) => handleChange(category, e.target.value)}
                  placeholder="0.000"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left ltr"
                  dir="ltr"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">ر.ع</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          <span>حفظ الموازنة</span>
        </button>
      </div>
    </div>
  );
};

export default BudgetSettingsModal;