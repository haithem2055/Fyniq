
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
  ArrowLeft, LayoutDashboard, AlertTriangle, BrainCircuit, FileDown, Camera, Sun, Moon, Landmark, CreditCard, ShoppingBag, Search, FileText, Languages
} from 'lucide-react';

type ViewState = 'home' | 'dashboard' | 'reports' | 'payments' | 'archive';

const DB_DETAILS = {
  server: "127.0.0.1:3306",
  database: "u794936001_Fyniq_DB_test"
};

const TRANSLATIONS = {
  ar: {
    heroTitle: <>نظم أموالك بذكاء<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">بدون تعقيد</span></>,
    heroSubtitle: "فينيك الذكي (Fyniq AI) هو الحل الأمثل للمشاريع الصغيرة والمتوسطة. صور فواتيرك، ودع الـ AI يتولى التصنيف وحساب الضريبة والتقارير.",
    aiBadge: "الذكاء الاصطناعي في خدمة المحاسبة",
    btnDashboard: "لوحة التحكم",
    btnScan: "بدء مسح الفواتير",
    changeLang: "English Interface",
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
      logout: "تسجيل الخروج",
      dbLabel: "قاعدة البيانات",
      dbStatus: "متصلة"
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
    bankReceipts: {
      title: "سجل الايصالات البنكية",
      bankName: "اسم البنك",
      companyName: "اسم الشركة",
      date: "التاريخ",
      totalAmount: "مبلغ الاجمالي",
      cardLast4: "اخر اربع ارقام من حساب البطاقة البنكية",
      paymentMethod: "وسيلة الدفع",
      emptyTitle: "لم يتم إضافة أي إيصالات بعد.",
      emptyDesc: "اضغط على \"إضافة فاتورة\" للبدء."
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
      budgetDesc: "حدد الحد الأقصى للمصروفات لكل بند لتلقي التنبيهات. يمكنك إضافة بنود خاصة.",
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
            name: "البداية",
            features: [
              "مسح ضوئي لـ 20 فاتورة شهرياً",
              "أرشيف الصور: متاح لآخر 30 يوماً فقط",
              "إضافة حتى 3 بنود موازنة مخصصة",
              "مركز المدفوعات: غير متاح",
              "مستشار كوين (AI): وصول محدود",
              "التقارير الضريبية: ملخص مبدئي فقط"
            ]
        },
        standard: {
            name: "النمو",
            features: [
              "مسح ضوئي لـ 100 فاتورة شهرياً",
              "أرشيف الصور: متاح بشكل دائم وآمن",
              "بنود موازنة مخصصة غير محدودة",
              "مركز المدفوعات: متاح (بطاقة واحدة)",
              "مستشار كوين (AI): وصول كامل وغير محدود",
              "التقارير الضريبية: تقارير تفصيلية جاهزة"
            ]
        },
        enterprise: {
            name: "السيادة",
            features: [
              "مسح ضوئي غير محدود للمستندات",
              "أرشيف الصور: متاح دائماً مع نسخ احتياطي",
              "إدارة كاملة ومخصصة للهيكل المالي",
              "مركز المدفوعات: ربط متعدد للبطاقات",
              "مستشار كوين (AI): نموذج مخصص ومدرب",
              "التقارير الضريبية: دعم تقني وضريبي متكامل"
            ]
        },
        limitReachedTitle: "وصلت للحد الأقصى",
        limitReachedDesc: "لقد استهلكت جميع الفواتير المتاحة في باقتك الحالية ({count}/{limit}).",
        upgradeBtn: "Upgrade Now"
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
    changeLang: "الواجهة العربية",
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
      logout: "Logout",
      dbLabel: "Database",
      dbStatus: "Connected"
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
    bankReceipts: {
      title: "Bank Receipts Log",
      bankName: "Bank Name",
      companyName: "Company Name",
      date: "Date",
      totalAmount: "Total Amount",
      cardLast4: "Card Last 4 Digits",
      paymentMethod: "Payment Method",
      emptyTitle: "No receipts added yet.",
      emptyDesc: "Click 'Add Invoice' to start."
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
      budgetDesc: "Set the maximum expense limit for each category to receive alerts. You can also add custom items.",
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
        limitDesc: "{limit} invoices/month",
        unlimitedInvoices: "Unlimited Invoices",
        mo: "mo",
        yr: "yr",
        free: {
            name: "Start",
            features: [
              "Scan 20 invoices/month",
              "Image Archive: 30 days only",
              "Up to 3 custom budget items",
              "Payments Center: N/A",
              "AI Advisor: Limited access",
              "Tax Reports: Basic summary"
            ]
        },
        standard: {
            name: "Growth",
            features: [
              "Scan 100 invoices/month",
              "Image Archive: Permanent & Secure",
              "Unlimited budget items",
              "Payments Center: 1 Card connection",
              "AI Advisor: Full & Unlimited",
              "Tax Reports: Detailed & Ready"
            ]
        },
        enterprise: {
            name: "Sovereignty",
            features: [
              "Unlimited document scanning",
              "Image Archive: Exportable backups",
              "Full financial structure management",
              "Payments Center: Multi-card connection",
              "AI Advisor: Sector-trained model",
              "Tax Reports: Expert support included"
            ]
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

const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const HomeView: React.FC<{ t: any, onScanClick: () => void, user: UserProfile, onToggleLanguage: (l: Language) => void, currentLang: Language }> = ({ t, onScanClick, user, onToggleLanguage, currentLang }) => (
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
              
              {/* Added language switcher to HomeView for visibility */}
              <button 
                  onClick={() => onToggleLanguage(currentLang === 'ar' ? 'en' : 'ar')}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-4 rounded-2xl font-bold shadow-md border border-slate-100 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                  <Languages size={20} className="text-emerald-500" />
                  {t.changeLang}
              </button>
          </div>
      </div>

      {/* Steps / Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
          {[
              { icon: BrainCircuit, title: t.step1Title, desc: t.step1Desc, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
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

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(() => {
     try {
         const savedUser = localStorage.getItem('fyniq_user');
         return savedUser ? JSON.parse(savedUser) : null;
     } catch(e) { return null; }
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_theme');
      if (saved) return saved as Theme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
     return (localStorage.getItem('app_language') as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = TRANSLATIONS[language];
  const isDarkMode = theme === 'dark';
  
  const [invoices, setInvoices] = useState<InvoiceData[]>(() => {
    try {
      const saved = localStorage.getItem('omani_accountant_invoices');
      const parsed = saved ? JSON.parse(saved) : [];
      // Ensure every invoice has an ID for React keys
      return parsed.map((inv: any) => ({
        ...inv,
        id: inv.id || crypto.randomUUID(),
        type: inv.type || (inv.bankName || inv.cardLast4 ? 'bank_receipt' : 'tax_invoice')
      }));
    } catch (e) {
      return [];
    }
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('omani_accountant_settings');
      if (saved) return JSON.parse(saved);
      return {
          defaultCurrency: 'OMR',
          budgets: {},
          dbConfig: {
              server: DB_DETAILS.server,
              database: DB_DETAILS.database,
              status: 'CONNECTED'
          }
      };
    } catch (e) {
      return { 
          defaultCurrency: 'OMR', budgets: {},
          dbConfig: { server: DB_DETAILS.server, database: DB_DETAILS.database, status: 'CONNECTED' }
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('omani_accountant_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('omani_accountant_settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogin = (profile: Omit<UserProfile, 'subscription' | 'id' | 'role' | 'status'>) => {
      const isAdmin = profile.email.toLowerCase().includes('admin@fyniq.om');
      const profileWithSub: UserProfile = {
          ...profile,
          id: crypto.randomUUID(),
          role: isAdmin ? 'ADMIN' : 'USER',
          status: 'ACTIVE',
          subscription: {
              plan: 'FREE',
              cycle: 'MONTHLY',
              usageCount: invoices.length,
              limit: 20, // Updated to 20 for Start Plan
              renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
          }
      };
      setUser(profileWithSub);
      localStorage.setItem('fyniq_user', JSON.stringify(profileWithSub));
      if (!isAdmin) setActiveView('dashboard');
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('fyniq_user');
      setActiveView('home');
  };

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

  const chartData: ChartData[] = useMemo(() => {
    const standardColors: Record<string, string> = {
      // Business
      [ExpenseCategory.COGS]: '#059669',
      [ExpenseCategory.OPERATING]: '#3b82f6',
      [ExpenseCategory.SALARY]: '#8b5cf6',
      [ExpenseCategory.MARKETING]: '#f59e0b',
      [ExpenseCategory.ADMIN]: '#64748b',
      [ExpenseCategory.ASSETS]: '#0ea5e9',
      [ExpenseCategory.UTILITIES]: '#ec4899',

      // Individual
      [ExpenseCategory.HOUSING]: '#3b82f6', // Blue
      [ExpenseCategory.GROCERIES]: '#10b981', // Emerald
      [ExpenseCategory.TRANSPORT]: '#f59e0b', // Amber
      [ExpenseCategory.HEALTH]: '#ef4444', // Red
      [ExpenseCategory.DEBT]: '#6366f1', // Indigo
      [ExpenseCategory.ENTERTAINMENT]: '#ec4899', // Pink
      [ExpenseCategory.SHOPPING]: '#8b5cf6', // Violet
      [ExpenseCategory.SAVINGS]: '#059669', // Dark Green
    };

    // Include both spending keys AND budget keys to ensure category appears in chart even if 0 spend
    const spendingKeys = Object.keys(spendingByCategory);
    const budgetKeys = Object.keys(settings.budgets);
    const uniqueKeys = Array.from(new Set([...spendingKeys, ...budgetKeys]));

    // Fix: Filter uniqueKeys before mapping to avoid "Type 'void' cannot be used as an index type" error.
    // The previous code mapped first and then filtered using an out-of-scope 'name' variable, which defaulted to global window.name (void type).
    return uniqueKeys
      .filter((key) => !(settings.hiddenCategories || []).includes(key))
      .filter((key) => (spendingByCategory[key] || 0) > 0 || (settings.budgets[key] && (settings.budgets[key] || 0) > 0))
      .map((key) => ({
        name: language === 'en' && CATEGORY_MAPPING[key] ? CATEGORY_MAPPING[key] : key,
        value: spendingByCategory[key] || 0,
        fill: standardColors[key] || stringToColor(key)
      }));
  }, [spendingByCategory, settings.budgets, language]);

  const budgetComparisonData = useMemo(() => {
    // Combine standard categories and any custom categories in settings.budgets
    const standardCats = Object.values(ExpenseCategory) as string[];
    const customCats = Object.keys(settings.budgets).filter(k => !standardCats.includes(k));
    const allCategories = [...standardCats, ...customCats];

    return allCategories
      .filter(cat => !(settings.hiddenCategories || []).includes(cat))
      .map(cat => ({
      name: language === 'en' && CATEGORY_MAPPING[cat] ? CATEGORY_MAPPING[cat] : cat,
      actual: spendingByCategory[cat] || 0,
      budget: settings.budgets[cat] || 0
    })).filter(item => item.actual > 0 || item.budget > 0);
  }, [spendingByCategory, settings.budgets, language]);

  const budgetAlerts = useMemo(() => {
    const alerts: string[] = [];
    Object.entries(settings.budgets).forEach(([cat, limit]) => {
        if (limit && spendingByCategory[cat] > limit) {
            alerts.push(cat);
        }
    });
    return alerts;
  }, [settings.budgets, spendingByCategory]);

  const customCategories = useMemo(() => {
      const standard = Object.values(ExpenseCategory) as string[];
      return Object.keys(settings.budgets).filter(k => !standard.includes(k));
  }, [settings.budgets]);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} translations={t} language={language} onToggleLanguage={setLanguage} />;
  }

  if (user.role === 'ADMIN') {
      return <AdminDashboard adminUser={user} onLogout={handleLogout} language={language} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header 
        onScanClick={() => setIsScanning(true)}
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenBudgetSettings={() => setIsSettingsModalOpen(true)}
        language={language}
        onToggleLanguage={setLanguage}
        translations={t}
        theme={theme}
        onToggleTheme={setTheme}
        user={user}
        onLogout={handleLogout}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        dbConfig={settings.dbConfig}
      />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {activeView === 'home' && <HomeView t={t} onScanClick={() => setIsScanning(true)} user={user} onToggleLanguage={setLanguage} currentLang={language} />}
        {activeView === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
                <StatsCards stats={stats} translations={t} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <ExpensesChart data={chartData} translations={t} isDarkMode={isDarkMode} />
                        <BudgetComparisonChart data={budgetComparisonData} translations={t} isDarkMode={isDarkMode} />
                    </div>
                    <div className="h-96">
                        <BudgetStatus budgets={settings.budgets} currentSpending={spendingByCategory} translations={t} language={language} hiddenCategories={settings.hiddenCategories} />
                    </div>
                </div>
                <RecentInvoices invoices={invoices.filter(inv => inv.type === 'tax_invoice')} translations={t} language={language} mode="invoices" />
            </div>
        )}
        {activeView === 'reports' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="text-blue-500" size={24} />
                  {t.reportsTitle}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.reportsSubtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.reportWord}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.reportWordDesc}</p>
                  <button 
                      onClick={() => generateVatReturnReport(invoices)} 
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                      <FileDown size={18} />
                      <span>{t.exportDesc}</span>
                  </button>
               </div>

               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                  <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.reportPdf}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.reportPdfDesc}</p>
                  <button 
                      onClick={() => window.print()} 
                      className="w-full py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                      <FileDown size={18} />
                      <span>طباعة / PDF</span>
                  </button>
               </div>

               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Landmark size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.reportTax}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.reportTaxDesc}</p>
                  <button 
                      onClick={() => generateVatReturnReport(invoices)} 
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                      <FileDown size={18} />
                      <span>{t.exportDesc}</span>
                  </button>
               </div>
            </div>

            <div id="printable-report">
                <div className="hidden print:block text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t.header.appName}</h1>
                    <p className="text-sm">{new Date().toLocaleDateString()}</p>
                </div>
                <RecentInvoices invoices={invoices} translations={t} language={language} mode="full_log" />
            </div>
          </div>
        )}
        {activeView === 'archive' && <ImageArchive invoices={invoices} translations={t} language={language} />}
        {activeView === 'payments' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-2"><CreditCard /> {t.paymentsTitle}</h2>
            <RecentInvoices invoices={invoices.filter(i => i.type === 'bank_receipt')} translations={t} language={language} mode="bank_receipts" />
          </div>
        )}
      </main>
      {isScanning && <ScannerModal onClose={() => setIsScanning(false)} onInvoiceAdded={(inv) => setInvoices([{ ...inv, id: crypto.randomUUID() } as any, ...invoices])} defaultCurrency={settings.defaultCurrency} translations={t} accountType={user.accountType} invoices={invoices} customCategories={customCategories} hiddenCategories={settings.hiddenCategories} />}
      {isSettingsModalOpen && <SettingsModal currentSettings={settings} userProfile={user} onSave={setSettings} onUpdateProfile={setUser} onClose={() => setIsSettingsModalOpen(false)} translations={t} language={language} />}
      {isSubscriptionModalOpen && <SubscriptionModal currentSubscription={user.subscription} onUpgrade={(p, c) => setUser({...user, subscription: {...user.subscription, plan: p, cycle: c}})} onClose={() => setIsSubscriptionModalOpen(false)} translations={t} language={language} />}
      <ChatBot invoices={invoices} translations={t} />
    </div>
  );
};

export default App;
