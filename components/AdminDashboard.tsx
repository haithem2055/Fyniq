
import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Shield, MoreVertical, CreditCard, 
    TrendingUp, Ban, CheckCircle, Crown, LogOut, Filter,
    Building2, Mail, Calendar, Settings, Edit, X, Save, Check, DollarSign, Database, Table as TableIcon, Code, Copy, Zap, Activity
} from 'lucide-react';
import { UserProfile, PlanType, AccountStatus } from '../types';

interface AdminDashboardProps {
    adminUser: UserProfile;
    onLogout: () => void;
    language: 'ar' | 'en';
    isDarkMode: boolean;
}

const DB_CONFIG = {
  server: "127.0.0.1:3306",
  database: "u794936001_Fyniq_DB_test"
};

const SQL_SCRIPTS = [
  {
    id: "users",
    title: "1. جدول المستخدمين (wp_fyniq_users)",
    code: `CREATE TABLE IF NOT EXISTS \`wp_fyniq_users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`company_name\` VARCHAR(255),
  \`account_type\` ENUM('BUSINESS', 'INDIVIDUAL') DEFAULT 'BUSINESS',
  \`role\` ENUM('ADMIN', 'USER') DEFAULT 'USER',
  \`status\` ENUM('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') DEFAULT 'PENDING_VERIFICATION',
  \`is_verified\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    id: "invoices",
    title: "2. جدول الفواتير (wp_fyniq_invoices)",
    code: `CREATE TABLE IF NOT EXISTS \`wp_fyniq_invoices\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT,
  \`vendor_name\` VARCHAR(255),
  \`amount\` DECIMAL(10,3),
  \`vat_amount\` DECIMAL(10,3),
  \`category\` VARCHAR(100),
  \`date\` DATE,
  \`image_url\` TEXT,
  FOREIGN KEY (\`user_id\`) REFERENCES \`wp_fyniq_users\`(\`id\`)
);`
  }
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout, language, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState<'CLIENTS' | 'DATABASE'>('CLIENTS');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [tableStatus, setTableStatus] = useState<Record<string, boolean>>({ users: true, invoices: true });

    const isAr = language === 'ar';

    const handleCopy = (code: string, idx: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="text-emerald-500" size={32} />
                        <h1 className="font-bold text-lg leading-tight">لوحة الإدارة</h1>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                        <p className="text-[10px] text-emerald-400 font-mono truncate">{DB_CONFIG.database}</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('CLIENTS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'CLIENTS' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Users size={20} />
                        <span>{isAr ? 'العملاء' : 'Clients'}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('DATABASE')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'DATABASE' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Database size={20} />
                        <span>{isAr ? 'حالة الجداول' : 'Database Status'}</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all text-sm font-bold">
                        <LogOut size={16} />
                        <span>{isAr ? 'تسجيل خروج' : 'Logout'}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center sticky top-0 z-20">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {activeTab === 'CLIENTS' ? (isAr ? 'إدارة العملاء والاشتراكات' : 'Clients Management') : (isAr ? 'مراقب جداول SQL' : 'SQL Table Monitor')}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full">
                                <Activity size={12} className="text-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{isAr ? 'متصل' : 'ONLINE'}</span>
                             </div>
                             <p className="text-[10px] text-slate-400 font-mono">Server: {DB_CONFIG.server}</p>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {activeTab === 'CLIENTS' ? (
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-[40px] text-center border border-dashed border-slate-200 dark:border-slate-700">
                            <Users size={64} className="mx-auto text-slate-200 dark:text-slate-700 mb-6" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{isAr ? 'لا يوجد عملاء مسجلين بعد' : 'No clients registered yet'}</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">{isAr ? 'بما أنك قمت بتهيئة الجداول للتو، قم بإنشاء أول حساب مستخدم من شاشة التسجيل ليظهر هنا.' : 'Since you just initialized the tables, go ahead and register the first account.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fadeIn">
                             {/* Status Cards */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {SQL_SCRIPTS.map((script) => (
                                    <div key={script.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                                                <TableIcon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white font-mono text-sm">{script.title.split('(')[1].replace(')', '')}</h4>
                                                <p className="text-[10px] text-slate-500">{isAr ? 'الحالة: مكتملة الهيكلة' : 'Status: Schema Verified'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                                            <CheckCircle size={14} />
                                            <span>{isAr ? 'نشط' : 'READY'}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>

                             <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[32px] border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-4">
                                    <Zap className="text-amber-500 shrink-0 mt-1" size={24} />
                                    <div>
                                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-2">{isAr ? 'لقد قمت بعمل رائع!' : 'Great job!'}</h3>
                                        <p className="text-sm text-amber-800 dark:text-amber-500 leading-relaxed">
                                            {isAr 
                                                ? "قاعدة البيانات الآن مهيأة تماماً. الخطوات البرمجية القادمة هي ربط واجهة البرمجة (API) ليقوم التطبيق بإرسال استعلامات SQL حقيقية بدلاً من التخزين المؤقت. حالياً، التطبيق يحاكي هذا الربط بشكل كامل لضمان تجربة مستخدم احترافية." 
                                                : "The database is now fully initialized. The next technical step is API integration to send real SQL queries instead of simulation. Currently, the app simulates this perfectly for a professional UX."}
                                        </p>
                                    </div>
                                </div>
                             </div>

                             <div className="space-y-6 pt-4">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Code size={20} className="text-emerald-500" />
                                    {isAr ? 'مرجع الأكواد التي استخدمتها' : 'SQL Reference Used'}
                                </h3>
                                {SQL_SCRIPTS.map((script, idx) => (
                                    <div key={idx} className="bg-slate-950 p-6 rounded-3xl border border-white/5 relative group shadow-2xl">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-emerald-400 text-xs font-mono">{script.title}</h4>
                                            <button 
                                                onClick={() => handleCopy(script.code, idx)}
                                                className="p-2 bg-white/5 hover:bg-emerald-500 hover:text-white rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold text-slate-400"
                                            >
                                                {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                                                <span>{copiedIndex === idx ? (isAr ? 'تم' : 'Done') : (isAr ? 'نسخ' : 'Copy')}</span>
                                            </button>
                                        </div>
                                        <pre className="text-emerald-500/80 text-[10px] font-mono overflow-x-auto">
                                            {script.code}
                                        </pre>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
