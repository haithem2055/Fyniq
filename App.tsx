
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import ExpensesChart from './components/ExpensesChart';
import RecentInvoices from './components/RecentInvoices';
import ScannerModal from './components/ScannerModal';
import SettingsModal from './components/SettingsModal';
import BudgetStatus from './components/BudgetStatus';
import BudgetComparisonChart from './components/BudgetComparisonChart';
import ChatBot from './components/ChatBot';
import LoginScreen from './components/LoginScreen';
import SubscriptionModal from './components/SubscriptionModal';
import AdminDashboard from './components/AdminDashboard';
import ImageArchive from './components/ImageArchive';
import { InvoiceData, ChartData, DashboardStats, ExpenseCategory, AppSettings, Language, CATEGORY_MAPPING, Theme, UserProfile, PlanType } from './types';
import { generateVatReturnReport } from './services/exportService';
import { 
  Download, FileText, Printer, ArrowLeft, LayoutDashboard, AlertTriangle, 
  PieChart, BarChart3, ScanLine, BrainCircuit, ShieldCheck, Zap, ChevronRight, FileDown, Camera, Sun, Moon, Landmark, CreditCard, ShoppingBag, Search
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);


type ViewState = 'home' | 'dashboard' | 'reports' | 'payments' | 'archive';

const TRANSLATIONS = {
  ar: {
    heroTitle: <>نظم أموالك بذكاء<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">بدون تعقيد</span></>,
    heroSubtitle: "فينيك الذكي (Fyniq AI) هو الحل الأمثل للمشاريع الصغيرة والمتوسطة. صور فواتيرك، ودع الـ AI يتولى التصنيف وحساب الضريبة والتقارير.",
    aiBadge: "الذكاء الاصطناعي في خدمة المحاسبة",
    btnDashboard: "لوحة التحكم",
    btnScan: "بدء مسح الفواتير",
    step1Title: "1. صور الفاتورة",
    step1Desc: "التقط صورة للفاتورة الورقية بهاتفك، وسيقوم النظام بمعالجتها فوراً.",
    step2Title: "2. التحليل الذكي",
    step2Desc: "تكنولوجيا Qwen-2.5 تقوم بقراءة البيانات، وتصنيف المصروف، وتدقيق الضريبة.",
    step3Title: "3. استلم تقريرك",
    step3Desc: "احصل على تقارير مالية وضريبية جاهزة بصيغة Word و PDF للمحاسب القانوني.",
    dashboardTitle: "نظرة عامة",
    dashboardSubtitle: "ملخص الأداء المالي والضريبي للمؤسسة",
    budgetAlertTitle: "تنبيه الموازنة:",
    quickActions: "إجراءات سريعة",
    exportDesc: "تصدير التقرير المالي الحالي للفواتير للمعالجة الفورية.",
    reportsTitle: "مركز التقارير المعتمدة",
    reportsSubtitle: "قم بتنزيل التقارير المالية التفصيلية المتوافقة مع متطلبات الهيئة العامة للضرائب والمحاسبة القانونية.",
    paymentsTitle: "مركز المدفوعات البنكية",
    paymentsSubtitle: "تتبع كافة المشتريات التي تمت عبر بطاقات الفيزا والماستركارد الخاصة بالعمل.",
    reportWord: "تقرير Word قابل للتعديل",
    reportWordDesc: "مناسب للمحاسبين للتعديل والإضافة",
    reportPdf: "تقرير PDF للطباعة",
    reportPdfDesc: "نسخة نهائية للأرشفة والتقديم",
    reportTax: "مساعد الإقرار الضريبي",
    reportTaxDesc: "توزيع مبالغ المدخلات حسب خانات بوابة الضرائب",
    fullHistory: "سجل الفواتير الكامل",
    header: {
      appName: "فينيك الذكي",
      poweredBy: "مدعوم بالذكاء الاصطناعي",
      home: "الرئيسية",
      dashboard: "لوحة التحكم",
      reports: "التقارير",
      payments: "المدفوعات",
      archive: "أرشيف الصور",
      addInvoice: "إضافة فاتورة",
      settings: "إعدادات الموازنة",
      logout: "تسجيل الخروج"
    },
    stats: {
      totalSpend: "إجمالي المصروفات",
      totalVat: "الضريبة المستردة (VAT)",
      invoiceCount: "عدد الفواتير المسجلة",
      currency: "ر.ع",
      invoiceUnit: "فاتورة",
      active: "نشط",
      tax5: "5% ضريبة",
      updated: "محدث"
    },
    charts: {
      expensesTitle: "توزيع المصروفات",
      expensesSubtitle: "تحليل النفقات حسب التصنيف المحاسبي",
      noData: "سيظهر الرسم البياني هنا فور إضافة البيانات...",
      amount: "المبلغ",
      budgetTitle: "تحليل الموازنة",
      budgetSubtitle: "مقارنة المصروفات الفعلية مع الموازنة المحددة",
      actual: "المصروف الفعلي",
      budget: "الموازنة المحددة",
      noBudgetData: "لا توجد بيانات كافية للعرض. أضف فواتير أو حدد موازنة لرؤية التحليل."
    },
    invoices: {
      title: "سجل الفواتير الحديثة",
      processedBy: "تمت المعالجة بواسطة AI",
      date: "التاريخ",
      vendor: "المورد",
      phone: "رقم الهاتف",
      category: "التصنيف",
      original: "المبلغ الأصلي",
      equivalent: "المعادل (ر.ع)",
      status: "الحالة",
      emptyTitle: "لم يتم إضافة أي فواتير بعد.",
      emptyDesc: "اضغط على \"إضافة فاتورة\" للبدء.",
      statusCorrect: "مطابق",
      statusMismatch: "غير مطابق",
      statusExempt: "معفى"
    },
    scanner: {
      title: "إضافة فاتورة جديدة",
      subtitle: "الذكاء الاصطناعي سيقوم باستخراج البيانات وتصنيفها",
      processing: "جاري تحليل البيانات...",
      processingDesc: "استخراج المورد، الرقم الضريبي، وتصنيف المصروف",
      uploadBtn: "ارفع صورة أو التقط صورة",
      scanTax: "تصوير فاتورة ضريبية",
      scanVisa: "تصوير إيصال الدفع (Visa/Card)",
      supportText: "ندعم: JPG, PNG • سيتم استخدام {curr} كعملة افتراضية",
      error: "عذراً، لم نتمكن من قراءة الفاتورة. تأكد أن الصورة واضحة وحاول مرة أخرى.",
      invalidImage: "الصورة المرفقة لا تبدو كفاتورة أو إيصال صالح. يرجى المحاولة مرة أخرى بصورة أوضح.",
      duplicateTitle: "تنبيه: فاتورة مكررة",
      duplicateMsg: "يبدو أن هذه الفاتورة (بنفس المورد، التاريخ، والمبلغ) مسجلة مسبقاً في النظام.",
      duplicateConfirm: "هذه الفاتورة مسجلة مسبقاً! هل أنت متأكد أنك تريد حفظها مرة أخرى؟"
    },
    settings: {
      title: "الإعدادات",
      tabGeneral: "عام والعملة",
      tabBudgets: "الموازنة الشهرية",
      defaultCurrency: "العملة الافتراضية",
      currencyDesc: "سيتم استخدام هذه العملة إذا لم يتمكن الذكاء الاصطناعي من اكتشاف العملة تلقائياً في الفاتورة.",
      budgetDesc: "حدد الحد الأقصى للمصروفات لكل بند لتلقي التنبيهات",
      saveBtn: "حفظ التغييرات",
      saveBudgetBtn: "حفظ الموازنة",
      budgetModalTitle: "إعداد الموازنة الشهرية",
      currencyUnit: "ر.ع"
    },
    budgetStatus: {
      title: "مراقبة الموازنة",
      monthly: "شهري",
      noBudgetTitle: "لا توجد موازنة محددة",
      noBudgetDesc: "اضغط على زر الإعدادات في الأعلى لتحديد سقف المصروفات.",
      overBudget: "تم تجاوز الميزانية المحددة!"
    },
    chat: {
      welcome: "مرحباً بك! 🧑‍💼 أنا مستشارك المالي الذكي. يمكنني تحليل فواتيرك، إخبارك أين تذهب أموالك، وكيف يمكنك التوفير. اسألني أي شيء!",
      advisor: "المستشار المالي",
      online: "متصل بقاعدة البيانات",
      placeholder: "اسأل عن فواتيرك...",
      disclaimer: "يعتمد الذكاء الاصطناعي على البيانات المدخلة وقد يخطئ أحياناً.",
      processing: "جاري التحليل...",
      error: "عذراً، حدث خطأ أثناء تحليل البيانات."
    },
    login: {
      selectType: "كيف تود استخدام فينيك؟",
      typeBusiness: "صاحب عمل / شركة",
      typeBusinessDesc: "لإدارة الفواتير الضريبية، التقارير، وتتبع المصروفات التشغيلية.",
      typeIndividual: "فرد / شخصي",
      typeIndividualDesc: "لتتبع المصاريف الشخصية، الميزانية المنزلية، والمدفوعات.",
      heroTitle: "إدارة مالية ذكية",
      heroDesc: "استخدم قوة الذكاء الاصطناعي لأتمتة إدخال الفواتير وتتبع المصروفات.",
      welcomeBack: "مرحباً بعودتك",
      subtitle: "أدخل بيانات الدخول للمتابعة",
      companyName: "اسم الشركة / المؤسسة",
      companyPlaceholder: "مثال: مؤسسة الأفق الحديثة",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signInBtn: "تسجيل الدخول",
      footerText: "تواجه مشكلة في الدخول؟",
      contactSupport: "تواصل مع الدعم الفني"
    },
    plans: {
        title: "خطط تناسب جميع الاحتياجات",
        subtitle: "اختر الباقة المناسبة. ابدأ مجاناً وقم بالترقية عند الحاجة.",
        monthly: "شهري",
        yearly: "سنوي",
        save: "توفير 20%",
        contactUs: "تواصل معنا",
        popularBadge: "الأكثر طلباً",
        choosePlan: "اختر الباقة",
        currentPlan: "باقتك الحالية",
        limitDesc: "حتى {limit} فاتورة شهرياً",
        unlimitedInvoices: "عدد فواتير غير محدود",
        mo: "شهر",
        yr: "سنة",
        free: {
            name: "مجانية",
            features: ["مسح ضوئي لـ 30 فاتورة شهرياً", "تقارير أساسية", "دعم عبر البريد الإلكتروني"]
        },
        standard: {
            name: "قياسية",
            features: ["مسح ضوئي لـ 70 فاتورة شهرياً", "تكلفة 100 بيسة للفواتير الإضافية", "تقارير Word و PDF", "مستشار الذكاء الاصطناعي"]
        },
        enterprise: {
            name: "شركات",
            features: ["عدد فواتير غير محدود", "ربط مع أنظمة ERP", "مدير حساب خاص", "دعم فني 24/7"]
        },
        limitReachedTitle: "وصلت للحد الأقصى",
        limitReachedDesc: "لقد استهلكت جميع الفواتير المتاحة في باقتك الحالية ({count}/{limit}).",
        upgradeBtn: "ترقية الباقة الآن"
    },
    archive: {
        title: "أرشيف الصور",
        subtitle: "جميع صور الفواتير والإيصالات المحفوظة",
        searchPlaceholder: "بحث عن فاتورة...",
        noImages: "لا توجد صور محفوظة حتى الآن"
    }
  },
  en: {
    heroTitle: <>Smart Financials<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Made Simple</span></>,
    heroSubtitle: "Fyniq AI is the ideal solution for SMEs. Scan your invoices, and let AI handle classification, VAT calculations, and reporting.",
    aiBadge: "AI-Powered Accounting",
    btnDashboard: "Dashboard",
    btnScan: "Start Scanning",
    step1Title: "1. Snap Invoice",
    step1Desc: "Take a photo of your paper invoice, and the system processes it instantly.",
    step2Title: "2. Smart Analysis",
    step2Desc: "Qwen-2.5 technology extracts data, categorizes expenses, and audits VAT.",
    step3Title: "3. Get Report",
    step3Desc: "Get ready-made financial and tax reports in Word and PDF formats.",
    dashboardTitle: "Overview",
    dashboardSubtitle: "Financial and tax performance summary",
    budgetAlertTitle: "Budget Alert:",
    quickActions: "Quick Actions",
    exportDesc: "Export current financial report for immediate processing.",
    reportsTitle: "Certified Reports Center",
    reportsSubtitle: "Download detailed financial reports compliant with Tax Authority requirements.",
    paymentsTitle: "Bank Payments Center",
    paymentsSubtitle: "Track all purchases made via business Visa and MasterCards.",
    reportWord: "Editable Word Report",
    reportWordDesc: "Suitable for accountants to edit and add",
    reportPdf: "Printable PDF Report",
    reportPdfDesc: "Final version for archiving and submission",
    reportTax: "VAT Return Helper",
    reportTaxDesc: "Map input expenses to Tax Authority Portal fields",
    fullHistory: "Full Invoice History",
    header: {
      appName: "Fyniq AI",
      poweredBy: "Powered by AI",
      home: "Home",
      dashboard: "Dashboard",
      reports: "Reports",
      payments: "Payments",
      archive: "Archive",
      addInvoice: "Add Invoice",
      settings: "Budget Settings",
      logout: "Logout"
    },
    stats: {
      totalSpend: "Total Expenses",
      totalVat: "Recoverable VAT",
      invoiceCount: "Recorded Invoices",
      currency: "OMR",
      invoiceUnit: "Invoices",
      active: "Active",
      tax5: "5% VAT",
      updated: "Updated"
    },
    charts: {
      expensesTitle: "Expense Distribution",
      expensesSubtitle: "Expense analysis by accounting category",
      noData: "Chart will appear here once data is added...",
      amount: "Amount",
      budgetTitle: "Budget Analysis",
      budgetSubtitle: "Actual vs Budgeted Expenses",
      actual: "Actual Spend",
      budget: "Budget Limit",
      noBudgetData: "Not enough data. Add invoices or set a budget to see analysis."
    },
    invoices: {
      title: "Recent Invoices",
      processedBy: "Processed by AI",
      date: "Date",
      vendor: "Vendor",
      phone: "Phone No.",
      category: "Category",
      original: "Original Amount",
      equivalent: "Equivalent (OMR)",
      status: "Status",
      emptyTitle: "No invoices added yet.",
      emptyDesc: "Click 'Add Invoice' to start.",
      statusCorrect: "Correct",
      statusMismatch: "Mismatch",
      statusExempt: "Exempt"
    },
    scanner: {
      title: "Add New Invoice",
      subtitle: "AI will extract data and classify it",
      processing: "Analyzing data...",
      processingDesc: "Extracting vendor, Tax ID, and category",
      uploadBtn: "Upload or Take Photo",
      scanTax: "Scan Tax Invoice",
      scanVisa: "Scan Payment Receipt (Visa/Card)",
      supportText: "Supports: JPG, PNG • {curr} will be used as default",
      error: "Sorry, we couldn't read the invoice. Ensure the image is clear and try again.",
      invalidImage: "The uploaded image does not appear to be a valid invoice or receipt. Please try again with a clearer image.",
      duplicateTitle: "Alert: Duplicate Invoice",
      duplicateMsg: "It seems this invoice (same vendor, date, and amount) is already recorded.",
      duplicateConfirm: "This invoice is already recorded! Are you sure you want to save it again?"
    },
    settings: {
      title: "Settings",
      tabGeneral: "General & Currency",
      tabBudgets: "Monthly Budget",
      defaultCurrency: "Default Currency",
      currencyDesc: "This currency will be used if AI cannot automatically detect the currency in the invoice.",
      budgetDesc: "Set the maximum expense limit for each category to receive alerts.",
      saveBtn: "Save Changes",
      saveBudgetBtn: "Save Budget",
      budgetModalTitle: "Monthly Budget Setup",
      currencyUnit: "OMR"
    },
    budgetStatus: {
      title: "Budget Monitor",
      monthly: "Monthly",
      noBudgetTitle: "No Budget Set",
      noBudgetDesc: "Click the settings button above to set expense limits.",
      overBudget: "Budget Exceeded!"
    },
    chat: {
      welcome: "Welcome! 🧑‍💼 I am your Smart Financial Advisor. I can analyze your invoices, tell you where your money goes, and how to save. Ask me anything!",
      advisor: "Financial Advisor",
      online: "Connected to Database",
      placeholder: "Ask about your invoices...",
      disclaimer: "AI is based on input data and may make mistakes.",
      processing: "Analyzing...",
      error: "Sorry, an error occurred while analyzing data."
    },
    login: {
      selectType: "How do you want to use Fyniq?",
      typeBusiness: "Business Owner",
      typeBusinessDesc: "For tax invoices, reporting, and operating expense tracking.",
      typeIndividual: "Individual",
      typeIndividualDesc: "For personal expenses, home budgeting, and payments.",
      heroTitle: "Smart Financial Management",
      heroDesc: "Leverage AI power to automate invoice entry, track expenses, and ensure tax compliance.",
      welcomeBack: "Welcome Back",
      subtitle: "Enter credentials to access dashboard",
      companyName: "Company / Establishment Name",
      companyPlaceholder: "Ex: Modern Horizon Est.",
      email: "Email Address",
      password: "Password",
      signInBtn: "Login",
      footerText: "Trouble signing in?",
      contactSupport: "Contact Support"
    },
    plans: {
        title: "Plans for every need",
        subtitle: "Choose the plan that fits. Start for free and upgrade when you need to.",
        monthly: "Monthly",
        yearly: "Yearly",
        save: "Save 20%",
        contactUs: "Contact Sales",
        popularBadge: "Most Popular",
        choosePlan: "Choose Plan",
        currentPlan: "Current Plan",
        limitDesc: "Up to {limit} invoices/month",
        unlimitedInvoices: "Unlimited Invoices",
        mo: "mo",
        yr: "yr",
        free: {
            name: "Free",
            features: ["Scan 30 invoices/month", "Basic Reports", "Email Support"]
        },
        standard: {
            name: "Standard",
            features: ["Scan 70 invoices/month", "100 Baisa for extra invoices", "Word & PDF Reports", "AI Advisor"]
        },
        enterprise: {
            name: "Enterprise",
            features: ["Unlimited Invoices", "ERP Integration", "Dedicated Account Manager", "24/7 Support"]
        },
        limitReachedTitle: "Limit Reached",
        limitReachedDesc: "You have used all available invoices in your plan ({count}/{limit}).",
        upgradeBtn: "Upgrade Now"
    },
    archive: {
        title: "Image Archive",
        subtitle: "All saved invoice and receipt images",
        searchPlaceholder: "Search invoice...",
        noImages: "No images saved yet"
    }
  }
};

const HomeView: React.FC<{ t: any, onScanClick: () => void, user: UserProfile }> = ({ t, onScanClick, user }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center space-y-8 animate-fadeIn">
      <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold animate-pulse">
              <BrainCircuit size={16} />
              <span>{t.aiBadge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight">
              {t.heroTitle}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
              {t.heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button 
                  onClick={onScanClick}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 transition-all hover:scale-105"
              >
                  <Camera size={20} />
                  {t.btnScan}
              </button>
          </div>
      </div>

      {/* Steps / Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
          {[
              { icon: ScanLine, title: t.step1Title, desc: t.step1Desc, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { icon: BrainCircuit, title: t.step2Title, desc: t.step2Desc, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
              { icon: FileDown, title: t.step3Title, desc: t.step3Desc, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
          ].map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                  <div className={`w-16 h-16 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <step.icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{step.desc}</p>
              </div>
          ))}
      </div>
  </div>
);

const DashboardView: React.FC<{ 
    t: any, 
    stats: DashboardStats, 
    chartData: ChartData[], 
    budgetComparisonData: any[], 
    budgetAlerts: string[], 
    spendingByCategory: Record<string, number>, 
    settings: AppSettings, 
    invoices: InvoiceData[], 
    language: string, 
    isDarkMode: boolean 
}> = ({ t, stats, chartData, budgetComparisonData, budgetAlerts, spendingByCategory, settings, invoices, language, isDarkMode }) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t.dashboardTitle}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t.dashboardSubtitle}</p>
            </div>
            {budgetAlerts.length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
                    <AlertTriangle size={16} />
                    <span>{t.budgetAlertTitle} {budgetAlerts.length}</span>
                </div>
            )}
        </div>

        <StatsCards stats={stats} translations={t} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <ExpensesChart data={chartData} translations={t} isDarkMode={isDarkMode} />
                <BudgetComparisonChart data={budgetComparisonData} translations={t} isDarkMode={isDarkMode} />
            </div>
            <div className="space-y-6">
                <div className="h-96">
                    <BudgetStatus 
                        budgets={settings.budgets} 
                        currentSpending={spendingByCategory} 
                        translations={t}
                        language={language}
                    />
                </div>
            </div>
        </div>

        <RecentInvoices invoices={invoices} translations={t} language={language} />
    </div>
);

const PaymentsView: React.FC<{ t: any, invoices: InvoiceData[], language: string }> = ({ t, invoices, language }) => {
    const cardInvoices = invoices.filter(inv => inv.paymentMethod === 'CARD');
    const totalCardSpend = cardInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-start space-y-2">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <CreditCard size={32} className="text-blue-500" />
                    {t.paymentsTitle}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">{t.paymentsSubtitle}</p>
            </div>

            {/* Card Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-125 transition-transform"></div>
                     <p className="text-blue-100 text-sm font-medium mb-1">إجمالي مشتريات البطاقة</p>
                     <h3 className="text-4xl font-black mb-4 font-mono">{totalCardSpend.toFixed(3)} <span className="text-lg opacity-70">ر.ع</span></h3>
                     <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs">
                        <ShoppingBag size={14} />
                        {cardInvoices.length} عملية بنكية
                     </div>
                </div>
            </div>

            {/* Custom Table for Visa Receipts */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white">سجل إيصالات نقاط البيع (POS)</h3>
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="بحث..." className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pr-10 pl-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-bold">التاريخ</th>
                                <th className="px-6 py-4 font-bold">اسم التاجر</th>
                                <th className="px-6 py-4 font-bold">تفاصيل البطاقة</th>
                                <th className="px-6 py-4 font-bold">رمز الموافقة (Auth)</th>
                                <th className="px-6 py-4 font-bold">المبلغ</th>
                                <th className="px-6 py-4 font-bold">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {cardInvoices.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400">لا يوجد سجلات مدفوعات بنكية حالياً</td></tr>
                            ) : (
                                cardInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{inv.vendorName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600">
                                                    <CreditCard size={14} />
                                                </div>
                                                <span className="font-mono text-xs">**** {inv.cardLast4 || 'Card'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{inv.authCode || 'N/A'}</td>
                                        <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400" dir="ltr">{inv.totalAmount.toFixed(3)}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold">APPROVED</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ReportsView: React.FC<{ t: any, onExportWord: () => void, onPrintPDF: () => void }> = ({ t, onExportWord, onPrintPDF }) => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t.reportsTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400">{t.reportsSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
                onClick={onExportWord}
                className="group relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-left hover:shadow-xl transition-all overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.reportWord}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t.reportWordDesc}</p>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
                        {t.quickActions} <Download size={16} />
                    </div>
                </div>
            </button>

            <button 
                onClick={onPrintPDF}
                className="group relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-left hover:shadow-xl transition-all overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-6">
                        <Printer size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.reportPdf}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t.reportPdfDesc}</p>
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
                        {t.quickActions} <ArrowLeft size={16} className="rtl:rotate-180" />
                    </div>
                </div>
            </button>
            
             <div className="md:col-span-2 group relative bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-lg text-white text-left overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                         <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                            <Landmark size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t.reportTax}</h3>
                        <p className="text-emerald-100 text-sm max-w-md">{t.reportTaxDesc}</p>
                    </div>
                    <button 
                         onClick={onExportWord} // Reusing Word export for tax return helper as per logic
                         className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
                    >
                         <Download size={18} />
                         <span>{t.quickActions}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  // User Authentication State
  const [user, setUser] = useState<UserProfile | null>(() => {
     try {
         const savedUser = localStorage.getItem('fyniq_user');
         return savedUser ? JSON.parse(savedUser) : null;
     } catch(e) { return null; }
  });

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_theme');
      if (saved) return saved as Theme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Language State
  const [language, setLanguage] = useState<Language>(() => {
     return (localStorage.getItem('app_language') as Language) || 'ar';
  });

  // Handle Theme Side Effects
  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle Language Side Effects
  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = TRANSLATIONS[language];
  const isDarkMode = theme === 'dark';
  
  // Initialize invoices from localStorage
  const [invoices, setInvoices] = useState<InvoiceData[]>(() => {
    try {
      const saved = localStorage.getItem('omani_accountant_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load invoices", e);
      return [];
    }
  });
  
  // Initialize Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('omani_accountant_settings');
      if (saved) {
          return JSON.parse(saved);
      }
      const legacyBudgets = localStorage.getItem('omani_accountant_budgets');
      return {
          defaultCurrency: 'OMR',
          budgets: legacyBudgets ? JSON.parse(legacyBudgets) : {}
      };
    } catch (e) {
      return { defaultCurrency: 'OMR', budgets: {} };
    }
  });

  // Save invoices when changed
  useEffect(() => {
    localStorage.setItem('omani_accountant_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('omani_accountant_settings', JSON.stringify(settings));
    localStorage.setItem('omani_accountant_budgets', JSON.stringify(settings.budgets));
  }, [settings]);

  // Handle User Login
  const handleLogin = (profile: Omit<UserProfile, 'subscription' | 'id' | 'role' | 'status'>) => {
      // Determine Role based on email for prototype
      const isAdmin = profile.email.toLowerCase().includes('admin@fyniq.om');
      
      // Initialize Default Subscription for new users
      const profileWithSub: UserProfile = {
          ...profile,
          id: crypto.randomUUID(),
          role: isAdmin ? 'ADMIN' : 'USER',
          status: 'ACTIVE',
          subscription: {
              plan: 'FREE',
              cycle: 'MONTHLY',
              usageCount: invoices.length, // Sync with existing invoice count logic for now
              limit: 30,
              renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
          }
      };
      
      setUser(profileWithSub);
      localStorage.setItem('fyniq_user', JSON.stringify(profileWithSub));
      
      if (!isAdmin) {
          setActiveView('dashboard');
      }
  };

  // Handle Profile Update
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    localStorage.setItem('fyniq_user', JSON.stringify(updatedProfile));
  };

  // Handle Plan Upgrade
  const handleUpgrade = (plan: PlanType, cycle: 'MONTHLY' | 'YEARLY') => {
      if (!user) return;

      const limits: Record<PlanType, number> = {
          'FREE': 30,
          'STANDARD': 70,
          'ENTERPRISE': -1
      };

      const updatedUser: UserProfile = {
          ...user,
          subscription: {
              ...user.subscription,
              plan: plan,
              cycle: cycle,
              limit: limits[plan],
              // In real app, reset usage on cycle change or keep it? Keeping for now.
          }
      };
      setUser(updatedUser);
      localStorage.setItem('fyniq_user', JSON.stringify(updatedUser));
      setIsSubscriptionModalOpen(false);
      alert(`Successfully upgraded to ${plan} Plan!`);
  };

  // Handle User Logout
  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('fyniq_user');
      setActiveView('home');
  };

  // Derived State
  const stats: DashboardStats = useMemo(() => {
    return invoices.reduce((acc, curr) => ({
      totalSpend: acc.totalSpend + curr.totalAmount,
      totalVat: acc.totalVat + curr.vatAmount,
      invoiceCount: acc.invoiceCount + 1
    }), { totalSpend: 0, totalVat: 0, invoiceCount: 0 });
  }, [invoices]);

  const spendingByCategory = useMemo(() => {
    return invoices.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.totalAmount;
      return acc;
    }, {} as Record<string, number>);
  }, [invoices]);

  // Helper to get translated category name
  const getCategoryName = (cat: string) => {
      return language === 'en' && CATEGORY_MAPPING[cat] ? CATEGORY_MAPPING[cat] : cat;
  };

  const chartData: ChartData[] = useMemo(() => {
    const colors: Record<string, string> = {
      [ExpenseCategory.COGS]: '#059669',
      [ExpenseCategory.OPERATING]: '#3b82f6',
      [ExpenseCategory.SALARY]: '#8b5cf6',
      [ExpenseCategory.MARKETING]: '#f59e0b',
      [ExpenseCategory.ADMIN]: '#64748b',
      [ExpenseCategory.ASSETS]: '#0ea5e9',
      [ExpenseCategory.UTILITIES]: '#ec4899',
    };

    return Object.entries(spendingByCategory).map(([name, value]) => ({
      name: getCategoryName(name), // Translate name
      value,
      fill: colors[name] || '#cbd5e1'
    }));
  }, [spendingByCategory, language]);

  const budgetComparisonData = useMemo(() => {
    return Object.values(ExpenseCategory).map(cat => ({
      name: getCategoryName(cat), // Translate name
      actual: spendingByCategory[cat] || 0,
      budget: settings.budgets[cat] || 0
    })).filter(item => item.actual > 0 || item.budget > 0);
  }, [spendingByCategory, settings.budgets, language]);

  const budgetAlerts = useMemo(() => {
    const alerts: string[] = [];
    Object.entries(settings.budgets).forEach(([cat, limit]) => {
        if (limit && spendingByCategory[cat] > limit) {
            const catName = getCategoryName(cat);
            const msg = language === 'ar' 
                ? `تنبيه: لقد تجاوزت موازنة "${catName}" المحددة (${limit} ر.ع)`
                : `Alert: You exceeded budget for "${catName}" (${limit} OMR)`;
            alerts.push(msg);
        }
    });
    return alerts;
  }, [settings.budgets, spendingByCategory, language]);

  const handleScanClick = () => {
    if (!user) return;
    
    // Check Limits
    const limit = user.subscription.limit;
    const current = user.subscription.usageCount;
    
    if (limit !== -1 && current >= limit) {
        setIsSubscriptionModalOpen(true);
        // Optional: show a specific alert inside modal or before opening
        return;
    }
    
    setIsScanning(true);
  };

  const handleInvoiceAdded = (newInvoiceData: Omit<InvoiceData, 'id'>) => {
    const newInvoice: InvoiceData = {
      ...newInvoiceData,
      id: crypto.randomUUID(),
    };
    setInvoices(prev => [newInvoice, ...prev]);
    
    // Increment Usage Logic
    if (user) {
        const updatedUser = {
            ...user,
            subscription: {
                ...user.subscription,
                usageCount: user.subscription.usageCount + 1
            }
        };
        setUser(updatedUser);
        localStorage.setItem('fyniq_user', JSON.stringify(updatedUser));
    }

    // Auto-navigate to payments if it's a card receipt
    if (newInvoiceData.paymentMethod === 'CARD') {
        setActiveView('payments');
    } else {
        setActiveView('dashboard');
    }
  };

  const handleExportWord = () => {
    generateVatReturnReport(invoices);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // If user is not logged in, show Login Screen
  if (!user) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 ${language === 'ar' ? 'rtl' : 'ltr'} transition-colors duration-300`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {/* Header minimal for Login */}
           <div className="fixed top-0 w-full p-4 flex justify-between items-center z-50">
               <div className="bg-slate-800/50 p-1 rounded-lg border border-white/10 flex items-center backdrop-blur-md">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => setLanguage('ar')}
                        className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'ar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        عربي
                    </button>
               </div>
               <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 bg-slate-800/50 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-white/10 backdrop-blur-md"
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
           </div>
          <LoginScreen onLogin={handleLogin} translations={t} language={language} />
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (user.role === 'ADMIN') {
      return (
          <AdminDashboard 
            adminUser={user} 
            onLogout={handleLogout} 
            language={language}
            isDarkMode={isDarkMode}
          />
      );
  }

  // --- STANDARD USER VIEW ---
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 ${language === 'ar' ? 'rtl' : 'ltr'} transition-colors duration-300`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header 
        onScanClick={handleScanClick}
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenBudgetSettings={() => setIsSettingsModalOpen(true)}
        language={language}
        onToggleLanguage={setLanguage}
        translations={t}
        theme={theme}
        onToggleTheme={(newTheme) => setTheme(newTheme)}
        user={user}
        onLogout={handleLogout}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
      />

      {/* Added pb-24 for mobile bottom nav spacing */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {activeView === 'home' && <HomeView t={t} onScanClick={handleScanClick} user={user} />}
        {activeView === 'dashboard' && (
            <DashboardView 
                t={t}
                stats={stats}
                chartData={chartData}
                budgetComparisonData={budgetComparisonData}
                budgetAlerts={budgetAlerts}
                spendingByCategory={spendingByCategory}
                settings={settings}
                invoices={invoices}
                language={language}
                isDarkMode={isDarkMode}
            />
        )}
        {activeView === 'archive' && (
            <ImageArchive 
                invoices={invoices}
                translations={t}
                language={language}
            />
        )}
        {activeView === 'reports' && user.accountType !== 'INDIVIDUAL' && (
            <ReportsView 
                t={t}
                onExportWord={handleExportWord}
                onPrintPDF={handlePrintPDF}
            />
        )}
        {activeView === 'payments' && (
            <PaymentsView 
                t={t}
                invoices={invoices}
                language={language}
            />
        )}
      </main>

      {isScanning && (
        <ScannerModal 
          onClose={() => setIsScanning(false)}
          onInvoiceAdded={handleInvoiceAdded}
          defaultCurrency={settings.defaultCurrency}
          translations={t}
          accountType={user?.accountType}
          invoices={invoices} // Passed to check for duplicates
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal 
          currentSettings={settings}
          userProfile={user}
          onSave={(newSettings) => setSettings(newSettings)}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setIsSettingsModalOpen(false)}
          translations={t}
          language={language}
        />
      )}

      {isSubscriptionModalOpen && user && (
          <SubscriptionModal 
            currentSubscription={user.subscription}
            onUpgrade={handleUpgrade}
            onClose={() => setIsSubscriptionModalOpen(false)}
            translations={t}
            language={language}
          />
      )}

      <ChatBot invoices={invoices} translations={t} />
    </div>
  );
};

export default App;
