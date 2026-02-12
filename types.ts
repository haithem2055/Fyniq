
export enum ExpenseCategory {
  COGS = 'تكلفة البضاعة المباعة',
  OPERATING = 'مصاريف تشغيلية',
  SALARY = 'رواتب وأجور',
  MARKETING = 'تسويق وبيع',
  ADMIN = 'مصاريف إدارية',
  ASSETS = 'أصول ثابتة',
  UTILITIES = 'خدمات ومرافق',
  UNCATEGORIZED = 'غير مصنف'
}

export interface InvoiceData {
  id: string;
  vendorName: string;
  vendorPhone?: string;
  vendorTaxId?: string;
  date: string;
  
  // Base Currency (OMR) for Reporting
  totalAmount: number; 
  vatAmount: number;
  
  // Original Currency Data
  originalAmount: number;
  currency: string;

  category: ExpenseCategory;
  description?: string;
  vatStatus: 'مطابق' | 'غير مطابق' | 'معفى' | 'صفرية';

  // New Fields for Payment Tracking
  paymentMethod?: 'CARD' | 'CASH' | 'TRANSFER';
  cardLast4?: string;
  authCode?: string;
  
  // New Field for Image Archive
  imageUrl?: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export interface DashboardStats {
  totalSpend: number;
  totalVat: number;
  invoiceCount: number;
}

export type BudgetLimits = Partial<Record<ExpenseCategory, number>>;

export interface AppSettings {
  defaultCurrency: string;
  budgets: BudgetLimits;
  dbConfig?: {
    server: string;
    database: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  };
}

export type PlanType = 'FREE' | 'STANDARD' | 'ENTERPRISE';
export type UserRole = 'USER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type AccountType = 'BUSINESS' | 'INDIVIDUAL';

export interface SubscriptionDetails {
  plan: PlanType;
  cycle: 'MONTHLY' | 'YEARLY';
  usageCount: number;
  limit: number;
  renewalDate: string;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  accountType: AccountType; // New field
  status: AccountStatus;
  companyName: string;
  crNumber: string;
  vatNumber?: string;
  email: string;
  password?: string; // Stored for simulation only
  isVerified?: boolean;
  subscription: SubscriptionDetails;
}

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export const CURRENCIES = [
  { code: 'OMR', nameAr: 'ريال عماني', nameEn: 'Omani Rial', symbol: 'ر.ع' },
  { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$' },
  { code: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'EUR', nameAr: 'يورو', nameEn: 'Euro', symbol: '€' },
  { code: 'GBP', nameAr: 'جنيه إسترليني', nameEn: 'British Pound', symbol: '£' },
];

export const CATEGORY_MAPPING: Record<string, string> = {
  [ExpenseCategory.COGS]: 'Cost of Goods Sold',
  [ExpenseCategory.OPERATING]: 'Operating Expenses',
  [ExpenseCategory.SALARY]: 'Salaries & Wages',
  [ExpenseCategory.MARKETING]: 'Sales & Marketing',
  [ExpenseCategory.ADMIN]: 'Administrative',
  [ExpenseCategory.ASSETS]: 'Fixed Assets',
  [ExpenseCategory.UTILITIES]: 'Utilities',
  [ExpenseCategory.UNCATEGORIZED]: 'Uncategorized'
};
