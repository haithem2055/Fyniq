import React, { useState } from 'react';
import { 
    Users, Search, Shield, MoreVertical, CreditCard, 
    TrendingUp, Ban, CheckCircle, Crown, LogOut, Filter,
    Building2, Mail, Calendar, Settings, Edit, X, Save, Check, DollarSign
} from 'lucide-react';
import { UserProfile, PlanType, AccountStatus } from '../types';

interface AdminDashboardProps {
    adminUser: UserProfile;
    onLogout: () => void;
    language: 'ar' | 'en';
    isDarkMode: boolean;
}

// Pricing constants matching the app logic (SubscriptionModal)
const PRICING = {
    FREE: { MONTHLY: 0, YEARLY: 0 },
    STANDARD: { MONTHLY: 4, YEARLY: 40 },
    ENTERPRISE: { MONTHLY: 50, YEARLY: 500 } // Estimated base for Enterprise
};

// Mock Data for Clients
const MOCK_CLIENTS: UserProfile[] = [
    {
        id: 'c1',
        role: 'USER',
        status: 'ACTIVE',
        accountType: 'BUSINESS',
        companyName: 'مؤسسة الأفق الحديثة',
        email: 'contact@horizon.om',
        crNumber: '102030',
        vatNumber: 'OM12345678',
        subscription: { plan: 'STANDARD', cycle: 'YEARLY', usageCount: 45, limit: 70, renewalDate: '2025-12-01' }
    },
    {
        id: 'c2',
        role: 'USER',
        status: 'ACTIVE',
        accountType: 'BUSINESS',
        companyName: 'شركة مسقط للتجارة',
        email: 'sales@muscat-trade.com',
        crNumber: '554433',
        vatNumber: 'OM87654321',
        subscription: { plan: 'ENTERPRISE', cycle: 'MONTHLY', usageCount: 1200, limit: -1, renewalDate: '2024-11-15' }
    },
    {
        id: 'c3',
        role: 'USER',
        status: 'SUSPENDED',
        accountType: 'BUSINESS',
        companyName: 'ورشة السلام',
        email: 'info@alsalam-workshop.com',
        crNumber: '998877',
        subscription: { plan: 'FREE', cycle: 'MONTHLY', usageCount: 30, limit: 30, renewalDate: '2024-10-30' }
    },
    {
        id: 'c4',
        role: 'USER',
        status: 'ACTIVE',
        accountType: 'BUSINESS',
        companyName: 'مطعم البيت العماني',
        email: 'food@omanihouse.com',
        crNumber: '112233',
        subscription: { plan: 'STANDARD', cycle: 'MONTHLY', usageCount: 12, limit: 70, renewalDate: '2024-11-20' }
    }
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout, language, isDarkMode }) => {
    const [clients, setClients] = useState<UserProfile[]>(MOCK_CLIENTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState<PlanType | 'ALL'>('ALL');
    const [editingClient, setEditingClient] = useState<UserProfile | null>(null);

    const isAr = language === 'ar';

    // Derived Stats
    const totalClients = clients.length;
    
    // Calculate Monthly Recurring Revenue (MRR)
    const monthlyRevenue = clients.reduce((acc, client) => {
        if (client.status === 'SUSPENDED') return acc; // Don't count suspended accounts in projected revenue
        const { plan, cycle } = client.subscription;
        const price = PRICING[plan][cycle];
        // Normalize Yearly to Monthly
        return acc + (cycle === 'YEARLY' ? price / 12 : price);
    }, 0);

    const activeSubs = clients.filter(c => c.status === 'ACTIVE').length;

    const filteredClients = clients.filter(client => {
        const matchesSearch = 
            client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = filterPlan === 'ALL' || client.subscription.plan === filterPlan;
        return matchesSearch && matchesPlan;
    });

    const handleStatusToggle = (id: string) => {
        setClients(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, status: c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
            }
            return c;
        }));
    };

    const handlePlanChange = (id: string, newPlan: PlanType) => {
        setClients(prev => prev.map(c => {
            if (c.id === id) {
                const limit = newPlan === 'FREE' ? 30 : newPlan === 'STANDARD' ? 70 : -1;
                // Reset cycle to Monthly on plan change for simplicity, or keep existing
                return { 
                    ...c, 
                    subscription: { ...c.subscription, plan: newPlan, limit } 
                };
            }
            return c;
        }));
    };

    const openEditModal = (client: UserProfile) => {
        setEditingClient(JSON.parse(JSON.stringify(client))); // Deep copy
    };

    const handleSaveEdit = () => {
        if (!editingClient) return;
        setClients(prev => prev.map(c => c.id === editingClient.id ? editingClient : c));
        setEditingClient(null);
    };

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                            <Shield size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">لوحة الإدارة</h1>
                            <p className="text-xs text-slate-400">فينيك الذكي</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-emerald-400 rounded-xl font-medium">
                        <Users size={20} />
                        <span>العملاء والشركات</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium">
                        <CreditCard size={20} />
                        <span>إدارة الاشتراكات</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium">
                        <Settings size={20} />
                        <span>إعدادات النظام</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                            AD
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{adminUser.companyName}</p>
                            <p className="text-xs text-slate-500 truncate">{adminUser.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-colors text-sm font-bold"
                    >
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center sticky top-0 z-20">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">نظرة عامة</h2>
                    <div className="md:hidden flex items-center gap-2">
                         <button onClick={onLogout} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <LogOut size={20} className="text-slate-600 dark:text-slate-300" />
                         </button>
                    </div>
                </header>

                <div className="p-6 md:p-8 space-y-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                    <Users size={24} />
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% هذا الشهر</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">إجمالي العملاء</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{totalClients}</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">الإيرادات الشهرية المتوقعة (MRR)</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{monthlyRevenue.toFixed(3)} <span className="text-sm font-normal text-slate-400">ر.ع</span></h3>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                                    <Crown size={24} />
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">اشتراكات نشطة</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{activeSubs}</h3>
                        </div>
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="بحث عن شركة، بريد إلكتروني..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter size={18} className="text-slate-400" />
                            <select 
                                value={filterPlan} 
                                onChange={(e) => setFilterPlan(e.target.value as PlanType | 'ALL')}
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
                            >
                                <option value="ALL">جميع الباقات</option>
                                <option value="FREE">مجانية</option>
                                <option value="STANDARD">قياسية</option>
                                <option value="ENTERPRISE">شركات (Enterprise)</option>
                            </select>
                        </div>
                    </div>

                    {/* Clients Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">الشركة / العميل</th>
                                        <th className="px-6 py-4 font-bold">الباقة الحالية</th>
                                        <th className="px-6 py-4 font-bold">قيمة الاشتراك</th>
                                        <th className="px-6 py-4 font-bold">الاستهلاك</th>
                                        <th className="px-6 py-4 font-bold">تاريخ التجديد</th>
                                        <th className="px-6 py-4 font-bold">الحالة</th>
                                        <th className="px-6 py-4 font-bold">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredClients.map(client => {
                                        const price = PRICING[client.subscription.plan][client.subscription.cycle];
                                        return (
                                        <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{client.companyName}</p>
                                                        <p className="text-xs text-slate-500">{client.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                                    client.subscription.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                                                    client.subscription.plan === 'STANDARD' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {client.subscription.plan === 'ENTERPRISE' && <Crown size={12} />}
                                                    {client.subscription.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                                {price === 0 ? 'مجاني' : `${price} ر.ع`}
                                                <span className="text-xs text-slate-400 block">
                                                    {client.subscription.cycle === 'MONTHLY' ? '/ شهري' : '/ سنوي'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                                                {client.subscription.limit === -1 
                                                    ? <span className="text-xs">غير محدود</span> 
                                                    : `${client.subscription.usageCount} / ${client.subscription.limit}`
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {client.subscription.renewalDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                 <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                    client.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-50/50' : 'text-rose-500 bg-rose-50/50'
                                                }`}>
                                                    {client.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative group">
                                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        {/* Dropdown Menu */}
                                                        <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:block z-50">
                                                            <div className="p-1">
                                                                <button 
                                                                    onClick={() => openEditModal(client)}
                                                                    className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                                                >
                                                                    <Edit size={14} />
                                                                    تعديل التفاصيل
                                                                </button>
                                                                <hr className="my-1 border-slate-100 dark:border-slate-700" />
                                                                <button 
                                                                    onClick={() => handlePlanChange(client.id, 'ENTERPRISE')}
                                                                    className="w-full text-right px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                                                                >
                                                                    ترقية لـ Enterprise
                                                                </button>
                                                                <button 
                                                                    onClick={() => handlePlanChange(client.id, 'STANDARD')}
                                                                    className="w-full text-right px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                                                >
                                                                    تغيير لـ Standard
                                                                </button>
                                                                <button 
                                                                    onClick={() => handlePlanChange(client.id, 'FREE')}
                                                                    className="w-full text-right px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                                                                >
                                                                    تغيير لـ Free
                                                                </button>
                                                                <hr className="my-1 border-slate-100 dark:border-slate-700" />
                                                                <button 
                                                                    onClick={() => handleStatusToggle(client.id)}
                                                                    className={`w-full text-right px-4 py-2 text-sm rounded-lg ${
                                                                        client.status === 'ACTIVE' 
                                                                        ? 'text-rose-600 hover:bg-rose-50' 
                                                                        : 'text-emerald-600 hover:bg-emerald-50'
                                                                    }`}
                                                                >
                                                                    {client.status === 'ACTIVE' ? 'إيقاف الحساب' : 'تنشيط الحساب'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Edit Client Modal */}
                {editingClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                            <button 
                                onClick={() => setEditingClient(null)}
                                className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Edit size={20} className="text-emerald-500" />
                                تعديل اشتراك العميل
                            </h3>

                            <div className="space-y-6">
                                {/* Company Info */}
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">{editingClient.companyName}</p>
                                        <p className="text-sm text-slate-500">{editingClient.email}</p>
                                    </div>
                                </div>

                                {/* Plan Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نوع الباقة</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['FREE', 'STANDARD', 'ENTERPRISE'] as PlanType[]).map((plan) => (
                                            <button
                                                key={plan}
                                                onClick={() => {
                                                    const limit = plan === 'FREE' ? 30 : plan === 'STANDARD' ? 70 : -1;
                                                    setEditingClient({
                                                        ...editingClient,
                                                        subscription: { ...editingClient.subscription, plan, limit }
                                                    })
                                                }}
                                                className={`py-2 px-3 rounded-xl text-sm font-bold border-2 transition-all ${
                                                    editingClient.subscription.plan === plan
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                {plan}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Cycle Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">دورة الدفع</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setEditingClient({
                                                ...editingClient,
                                                subscription: { ...editingClient.subscription, cycle: 'MONTHLY' }
                                            })}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold border-2 transition-all ${
                                                editingClient.subscription.cycle === 'MONTHLY'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            شهري
                                        </button>
                                        <button
                                            onClick={() => setEditingClient({
                                                ...editingClient,
                                                subscription: { ...editingClient.subscription, cycle: 'YEARLY' }
                                            })}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold border-2 transition-all ${
                                                editingClient.subscription.cycle === 'YEARLY'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            سنوي
                                        </button>
                                    </div>
                                </div>

                                {/* Limit Override */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        الحد الأقصى للفواتير (شهرياً)
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <input 
                                            type="number" 
                                            value={editingClient.subscription.limit}
                                            disabled={editingClient.subscription.limit === -1}
                                            onChange={(e) => setEditingClient({
                                                ...editingClient,
                                                subscription: { ...editingClient.subscription, limit: parseInt(e.target.value) || 0 }
                                            })}
                                            className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 text-slate-800 dark:text-white font-mono"
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input 
                                                type="checkbox"
                                                checked={editingClient.subscription.limit === -1}
                                                onChange={(e) => {
                                                    setEditingClient({
                                                        ...editingClient,
                                                        subscription: { 
                                                            ...editingClient.subscription, 
                                                            limit: e.target.checked ? -1 : (editingClient.subscription.plan === 'FREE' ? 30 : 70) 
                                                        }
                                                    })
                                                }}
                                                className="w-5 h-5 accent-emerald-500 rounded-md"
                                            />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">غير محدود</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        * القيمة -1 تعني غير محدود. يمكنك تحديد رقم مخصص لزيادة الحد لهذه الشركة تحديداً.
                                    </p>
                                </div>

                                <button 
                                    onClick={handleSaveEdit}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    <span>حفظ التغييرات</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;