
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Users, Search, Shield, LogOut, Activity, DollarSign, FileText, 
    Settings, TrendingUp, Filter, CheckCircle, XCircle, Trash2, 
    MoreHorizontal, Save, Plus, AlertCircle, Database, LayoutDashboard,
    LifeBuoy, Globe, Bell, Lock, Unlock, CreditCard, PieChart as PieIcon
} from 'lucide-react';
import { UserProfile, InvoiceData, ExpenseCategory, PlanType } from '../types';
import { 
    getAdminStats, getAdminData, deleteUser, toggleUserStatus, 
    getSystemSettings, saveSystemSettings, SystemSettings, AdminStats,
    updateUserSubscription, toggleTicketStatus, SupportTicket,
    AuditLog, FinancialReport, getFinancialReports
} from '../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Cell, Pie } from 'recharts';

interface AdminDashboardProps {
    adminUser: UserProfile;
    onLogout: () => void;
    language: 'ar' | 'en';
    isDarkMode: boolean;
}

type Tab = 'OVERVIEW' | 'TRANSACTIONS' | 'REPORTS' | 'USERS' | 'SUPPORT' | 'SETTINGS' | 'SYSTEM' | 'LOGS';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout, language, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
    const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');

    const isAr = language === 'ar';

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setStats(getAdminStats());
        const data = getAdminData();
        setUsers(data.users);
        setInvoices(data.invoices);
        setTickets(data.tickets);
        setLogs(data.logs);
        setFinancialReports(getFinancialReports());
        setSettings(getSystemSettings());
    };

    const handleToggleUser = (email: string) => {
        if(window.confirm(isAr ? 'هل أنت متأكد من تغيير حالة المستخدم؟' : 'Toggle user status?')) {
            toggleUserStatus(email, adminUser.email);
            refreshData();
        }
    };

    const handleDeleteUser = (email: string) => {
        if(window.confirm(isAr ? 'حذف المستخدم نهائياً؟ لا يمكن التراجع.' : 'Delete user permanently?')) {
            deleteUser(email, adminUser.email);
            refreshData();
        }
    };

    const handleUpdatePlan = (email: string, plan: PlanType) => {
        updateUserSubscription(email, plan);
        refreshData();
    };

    const handleToggleTicket = (id: string) => {
        toggleTicketStatus(id);
        refreshData();
    };

    const handleSaveSystemSettings = (newSettings: SystemSettings) => {
        setSettings(newSettings);
        saveSystemSettings(newSettings, adminUser.email);
    };

    const handleAddCategory = () => {
        const newCat = prompt(isAr ? 'أدخل اسم التصنيف الجديد:' : 'Enter new category name:');
        if (newCat && !settings.categories.includes(newCat)) {
            const updated = { ...settings, categories: [...settings.categories, newCat] };
            handleSaveSystemSettings(updated);
        }
    };

    const handleRemoveCategory = (cat: string) => {
        if (window.confirm(isAr ? 'حذف هذا التصنيف؟' : 'Remove category?')) {
            const updated = { ...settings, categories: settings.categories.filter(c => c !== cat) };
            handleSaveSystemSettings(updated);
        }
    };

    // Filter Logic
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesSearch = inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  inv.totalAmount.toString().includes(searchQuery);
            const matchesCategory = categoryFilter === 'ALL' || inv.category === categoryFilter;
            // Simplified date filter logic
            const matchesDate = true; 

            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [invoices, searchQuery, categoryFilter]);

    // Chart Data Preparation
    const revenueData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => ({
            date: date.slice(5), // MM-DD
            amount: invoices.filter(inv => inv.date === date).reduce((sum, i) => sum + i.totalAmount, 0)
        }));
    }, [invoices]);

    const pieData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Free', value: stats.planDistribution['FREE'], color: '#94a3b8' },
            { name: 'Standard', value: stats.planDistribution['STANDARD'], color: '#8b5cf6' },
            { name: 'Enterprise', value: stats.planDistribution['ENTERPRISE'], color: '#10b981' },
        ];
    }, [stats]);

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Sidebar */}
            <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
                <div className="p-6 border-b border-white/10 flex items-center gap-3 justify-center lg:justify-start">
                    <div className="relative">
                        <Shield className="text-emerald-500" size={32} />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <h1 className="font-bold text-lg leading-tight hidden lg:block">Fyniq Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'OVERVIEW', icon: LayoutDashboard, label: isAr ? 'نظرة عامة' : 'Overview' },
                        { id: 'TRANSACTIONS', icon: FileText, label: isAr ? 'المعاملات' : 'Transactions' },
                        { id: 'REPORTS', icon: PieIcon, label: isAr ? 'التقارير' : 'Reports' },
                        { id: 'USERS', icon: Users, label: isAr ? 'المستخدمين' : 'Users' },
                        { id: 'SUPPORT', icon: LifeBuoy, label: isAr ? 'الدعم الفني' : 'Support' },
                        { id: 'SETTINGS', icon: Settings, label: isAr ? 'التصنيفات' : 'Categories' },
                        { id: 'SYSTEM', icon: Globe, label: isAr ? 'النظام' : 'System' },
                        { id: 'LOGS', icon: Database, label: isAr ? 'السجلات' : 'Logs' }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl font-medium transition-all group ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon size={22} className="shrink-0" />
                            <span className="hidden lg:block">{item.label}</span>
                            {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={onLogout} className="w-full flex items-center justify-center lg:justify-start gap-2 px-4 py-3 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all text-sm font-bold">
                        <LogOut size={20} />
                        <span className="hidden lg:block">{isAr ? 'خروج' : 'Logout'}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto">
                {/* Topbar */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md bg-opacity-80">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {activeTab === 'OVERVIEW' && (isAr ? 'لوحة القيادة' : 'Dashboard Overview')}
                            {activeTab === 'TRANSACTIONS' && (isAr ? 'سجل المعاملات' : 'Transaction History')}
                            {activeTab === 'REPORTS' && (isAr ? 'التقارير المالية' : 'Financial Reports')}
                            {activeTab === 'USERS' && (isAr ? 'إدارة المستخدمين' : 'User Management')}
                            {activeTab === 'SUPPORT' && (isAr ? 'تذاكر الدعم' : 'Support Tickets')}
                            {activeTab === 'SETTINGS' && (isAr ? 'إدارة التصنيفات' : 'Category Management')}
                            {activeTab === 'SYSTEM' && (isAr ? 'إعدادات النظام' : 'System Settings')}
                            {activeTab === 'LOGS' && (isAr ? 'سجل العمليات' : 'Audit Logs')}
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">
                            {isAr ? 'أهلاً بك،' : 'Welcome back,'} {adminUser.companyName}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">v2.4.0 Live</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 space-y-8">
                    {activeTab === 'OVERVIEW' && stats && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                                            <Users size={24} />
                                        </div>
                                        <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">+ {stats.recentGrowth}% <TrendingUp size={12} /></span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats.totalUsers}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                                            <DollarSign size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats.totalRevenue.toFixed(0)} <span className="text-base text-slate-400">OMR</span></h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'حجم المعاملات' : 'Total Revenue'}</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl">
                                            <FileText size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats.totalInvoices}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'الفواتير المعالجة' : 'Processed Invoices'}</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl">
                                            <Activity size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats.totalVat.toFixed(0)} <span className="text-base text-slate-400">OMR</span></h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'إجمالي الضريبة' : 'Total VAT'}</p>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-80">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">{isAr ? 'تحليل الإيرادات (آخر 7 أيام)' : 'Revenue Analytics (7 Days)'}</h3>
                                    <ResponsiveContainer width="100%" height="85%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-80">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">{isAr ? 'توزيع الاشتراكات' : 'Subscription Plans'}</h3>
                                    <ResponsiveContainer width="100%" height="85%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-2">
                                        {pieData.map(d => (
                                            <div key={d.name} className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                                                <span className="text-[10px] text-slate-500 font-bold">{d.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-emerald-900 text-white p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden lg:col-span-3">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                            <Database size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">{isAr ? 'صحة النظام' : 'System Health'}</h3>
                                        <p className="text-emerald-200 text-sm mb-6">{isAr ? 'قاعدة البيانات تعمل بكفاءة عالية. استجابة الـ API ممتازة.' : 'Database is running efficiently. API response time is optimal.'}</p>
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-sm mb-2 font-bold">
                                                <span>Storage</span>
                                                <span>24%</span>
                                            </div>
                                            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                                                <div className="bg-emerald-400 h-full w-[24%] rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'TRANSACTIONS' && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden animate-fadeIn">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type="text" 
                                        placeholder={isAr ? "بحث عن مورد، مبلغ..." : "Search vendor, amount..."}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold"
                                    >
                                        <option value="ALL">{isAr ? 'كل التصنيفات' : 'All Categories'}</option>
                                        {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left rtl:text-right">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">{isAr ? 'التاريخ' : 'Date'}</th>
                                            <th className="px-6 py-4">{isAr ? 'المورد' : 'Vendor'}</th>
                                            <th className="px-6 py-4">{isAr ? 'التصنيف' : 'Category'}</th>
                                            <th className="px-6 py-4">{isAr ? 'المبلغ' : 'Amount'}</th>
                                            <th className="px-6 py-4">{isAr ? 'الضريبة' : 'VAT'}</th>
                                            <th className="px-6 py-4">{isAr ? 'الحالة' : 'Status'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredInvoices.map((inv, idx) => (
                                            <tr key={inv.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-slate-500">{inv.date}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{inv.vendorName}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                                        {inv.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold font-mono text-slate-800 dark:text-white">{inv.totalAmount.toFixed(3)}</td>
                                                <td className="px-6 py-4 font-mono text-rose-500">{inv.vatAmount.toFixed(3)}</td>
                                                <td className="px-6 py-4">
                                                    {inv.vatStatus === 'مطابق' 
                                                        ? <CheckCircle size={16} className="text-emerald-500" /> 
                                                        : <AlertCircle size={16} className="text-amber-500" />
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredInvoices.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">
                                        {isAr ? 'لا توجد نتائج مطابقة' : 'No matching records found'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'REPORTS' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {financialReports.map((report, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <h4 className="font-bold text-slate-800 dark:text-white mb-4">{report.category}</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">{isAr ? 'إجمالي المبلغ' : 'Total Amount'}</span>
                                                <span className="font-bold">{report.totalAmount.toFixed(3)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">{isAr ? 'إجمالي الضريبة' : 'Total VAT'}</span>
                                                <span className="font-bold text-rose-500">{report.vatAmount.toFixed(3)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">{isAr ? 'عدد الفواتير' : 'Invoice Count'}</span>
                                                <span className="font-bold">{report.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-6">{isAr ? 'مقارنة الإنفاق حسب التصنيف' : 'Spending Comparison by Category'}</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={financialReports}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                                            <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none' }}
                                            />
                                            <Bar dataKey="totalAmount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'USERS' && (
                        <div className="space-y-6 animate-fadeIn">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {users.map(user => (
                                    <div key={user.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-300">
                                                    {user.companyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-white">{user.companyName}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                 <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                     user.status === 'ACTIVE' 
                                                     ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                                                     : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                                                 }`}>
                                                     {user.status}
                                                 </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">{user.role}</span>
                                            <select 
                                                value={user.subscription.plan}
                                                onChange={(e) => handleUpdatePlan(user.email, e.target.value as PlanType)}
                                                className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 px-2 py-1 rounded font-bold border-none outline-none cursor-pointer"
                                            >
                                                <option value="FREE">FREE</option>
                                                <option value="STANDARD">STANDARD</option>
                                                <option value="ENTERPRISE">ENTERPRISE</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-2 border-t border-slate-50 dark:border-slate-700 pt-4">
                                            <button 
                                                onClick={() => handleToggleUser(user.email)}
                                                className="flex-1 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                                            >
                                                {user.status === 'ACTIVE' ? (isAr ? 'تجميد' : 'Suspend') : (isAr ? 'تنشيط' : 'Activate')}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.email)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {activeTab === 'SUPPORT' && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden animate-fadeIn">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <LifeBuoy size={20} className="text-blue-500" />
                                    {isAr ? 'طلبات الدعم الفني' : 'Support Tickets'}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left rtl:text-right">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">{isAr ? 'المستخدم' : 'User'}</th>
                                            <th className="px-6 py-4">{isAr ? 'الموضوع' : 'Subject'}</th>
                                            <th className="px-6 py-4">{isAr ? 'الأولوية' : 'Priority'}</th>
                                            <th className="px-6 py-4">{isAr ? 'الحالة' : 'Status'}</th>
                                            <th className="px-6 py-4">{isAr ? 'الإجراء' : 'Action'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {tickets.map(ticket => (
                                            <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{ticket.userEmail}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{ticket.subject}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                        ticket.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' :
                                                        ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                        ticket.status === 'OPEN' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button 
                                                        onClick={() => handleToggleTicket(ticket.id)}
                                                        className="text-blue-500 hover:underline font-bold"
                                                    >
                                                        {ticket.status === 'OPEN' ? (isAr ? 'إغلاق' : 'Close') : (isAr ? 'فتح' : 'Reopen')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SETTINGS' && (
                         <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm max-w-2xl mx-auto animate-fadeIn">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Filter size={24} className="text-emerald-500" />
                                {isAr ? 'إدارة التصنيفات المالية' : 'Financial Categories Management'}
                            </h3>
                            
                            <div className="space-y-3 mb-8">
                                {settings.categories.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 group">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                                        <button 
                                            onClick={() => handleRemoveCategory(cat)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={handleAddCategory}
                                className="w-full py-4 border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all"
                            >
                                <Plus size={20} />
                                <span>{isAr ? 'إضافة تصنيف جديد' : 'Add New Category'}</span>
                            </button>
                         </div>
                    )}

                    {activeTab === 'SYSTEM' && (
                        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                        <Activity size={20} className="text-emerald-500" />
                                        {isAr ? 'حالة النظام' : 'System Status'}
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-700 dark:text-slate-200">{isAr ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
                                                <p className="text-xs text-slate-500">{isAr ? 'إيقاف دخول المستخدمين مؤقتاً' : 'Temporarily disable user access'}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleSaveSystemSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                                                className={`p-2 rounded-xl transition-all ${settings.maintenanceMode ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                {settings.maintenanceMode ? <Lock size={24} /> : <Unlock size={24} />}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-700 dark:text-slate-200">{isAr ? 'التسجيل الجديد' : 'New Registrations'}</p>
                                                <p className="text-xs text-slate-500">{isAr ? 'السماح بإنشاء حسابات جديدة' : 'Allow new account creation'}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleSaveSystemSettings({...settings, allowNewRegistrations: !settings.allowNewRegistrations})}
                                                className={`p-2 rounded-xl transition-all ${settings.allowNewRegistrations ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                {settings.allowNewRegistrations ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                        <Bell size={20} className="text-amber-500" />
                                        {isAr ? 'تنبيه النظام' : 'System Alert'}
                                    </h3>
                                    <textarea 
                                        value={settings.systemAlert}
                                        onChange={(e) => handleSaveSystemSettings({...settings, systemAlert: e.target.value})}
                                        placeholder={isAr ? "اكتب رسالة تظهر لجميع المستخدمين..." : "Write a message for all users..."}
                                        className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <CreditCard size={20} className="text-purple-500" />
                                        {isAr ? 'إعدادات الضرائب' : 'Tax Settings'}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 mb-2 block">{isAr ? 'نسبة ضريبة القيمة المضافة (%)' : 'VAT Rate (%)'}</label>
                                        <input 
                                            type="number" 
                                            value={settings.vatRate * 100}
                                            onChange={(e) => handleSaveSystemSettings({...settings, vatRate: parseFloat(e.target.value) / 100})}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                                        />
                                    </div>
                                    <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
                                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">{isAr ? 'المعدل الحالي' : 'Current Rate'}</p>
                                        <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{(settings.vatRate * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'LOGS' && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden animate-fadeIn">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Database size={20} className="text-slate-500" />
                                    {isAr ? 'سجل العمليات الإدارية' : 'Administrative Audit Logs'}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left rtl:text-right">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">{isAr ? 'الوقت' : 'Timestamp'}</th>
                                            <th className="px-6 py-4">{isAr ? 'المسؤول' : 'Admin'}</th>
                                            <th className="px-6 py-4">{isAr ? 'العملية' : 'Action'}</th>
                                            <th className="px-6 py-4">{isAr ? 'التفاصيل' : 'Details'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {logs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString(isAr ? 'ar-OM' : 'en-US')}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{log.user}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-bold">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
