
import { InvoiceData, UserProfile, ExpenseCategory, DashboardStats, AccountStatus } from "../types";

const DB_KEY_USERS = 'fyniq_db_u794936001_Fyniq_DB_test';
const DB_KEY_INVOICES = 'omani_accountant_invoices';
const DB_KEY_SETTINGS = 'fyniq_system_settings';

export interface AuditLog {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
}

export interface FinancialReport {
    category: string;
    totalAmount: number;
    vatAmount: number;
    count: number;
}

export interface SupportTicket {
    id: string;
    userEmail: string;
    subject: string;
    status: 'OPEN' | 'CLOSED';
    date: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AdminStats {
    totalRevenue: number;
    totalVat: number;
    totalUsers: number;
    activeUsers: number;
    totalInvoices: number;
    recentGrowth: number;
    planDistribution: Record<string, number>;
    pendingTickets: number;
}

export interface SystemSettings {
    categories: string[];
    vatRate: number;
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    systemAlert?: string;
}

const DB_KEY_TICKETS = 'fyniq_support_tickets';
const DB_KEY_LOGS = 'fyniq_audit_logs';

// Helper to simulate fetching all data from "Backend"
export const getAdminData = () => {
    const usersRaw = localStorage.getItem(DB_KEY_USERS);
    const invoicesRaw = localStorage.getItem(DB_KEY_INVOICES);
    const ticketsRaw = localStorage.getItem(DB_KEY_TICKETS);
    const logsRaw = localStorage.getItem(DB_KEY_LOGS);
    
    const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
    const invoices: InvoiceData[] = invoicesRaw ? JSON.parse(invoicesRaw) : [];
    const tickets: SupportTicket[] = ticketsRaw ? JSON.parse(ticketsRaw) : [
        { id: '1', userEmail: 'user1@example.com', subject: 'مشكلة في رفع الفاتورة', status: 'OPEN', date: '2024-02-25', priority: 'HIGH' },
        { id: '2', userEmail: 'test@fyniq.om', subject: 'طلب ترقية الحساب', status: 'CLOSED', date: '2024-02-24', priority: 'MEDIUM' }
    ];
    const logs: AuditLog[] = logsRaw ? JSON.parse(logsRaw) : [
        { id: '1', action: 'LOGIN', user: 'admin@fyniq.om', timestamp: new Date().toISOString(), details: 'Admin logged in' },
        { id: '2', action: 'UPDATE_SETTINGS', user: 'admin@fyniq.om', timestamp: new Date().toISOString(), details: 'VAT rate updated to 5%' }
    ];

    return { users, invoices, tickets, logs };
};

export const addAuditLog = (action: string, user: string, details: string) => {
    const { logs } = getAdminData();
    const newLog: AuditLog = {
        id: Math.random().toString(36).substr(2, 9),
        action,
        user,
        timestamp: new Date().toISOString(),
        details
    };
    localStorage.setItem(DB_KEY_LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
};

export const getAdminStats = (): AdminStats => {
    const { users, invoices, tickets } = getAdminData();
    
    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalVat = invoices.reduce((acc, inv) => acc + inv.vatAmount, 0);
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
    const pendingTickets = tickets.filter(t => t.status === 'OPEN').length;

    const planDistribution: Record<string, number> = {
        'FREE': users.filter(u => u.subscription.plan === 'FREE').length,
        'STANDARD': users.filter(u => u.subscription.plan === 'STANDARD').length,
        'ENTERPRISE': users.filter(u => u.subscription.plan === 'ENTERPRISE').length,
    };

    return {
        totalRevenue,
        totalVat,
        totalUsers: users.length,
        activeUsers,
        totalInvoices: invoices.length,
        recentGrowth: 12.5,
        planDistribution,
        pendingTickets
    };
};

export const getFinancialReports = (): FinancialReport[] => {
    const { invoices } = getAdminData();
    const reports: Record<string, FinancialReport> = {};

    invoices.forEach(inv => {
        if (!reports[inv.category]) {
            reports[inv.category] = { category: inv.category, totalAmount: 0, vatAmount: 0, count: 0 };
        }
        reports[inv.category].totalAmount += inv.totalAmount;
        reports[inv.category].vatAmount += inv.vatAmount;
        reports[inv.category].count += 1;
    });

    return Object.values(reports);
};

export const updateUserSubscription = (email: string, plan: 'FREE' | 'STANDARD' | 'ENTERPRISE') => {
    const { users } = getAdminData();
    const updatedUsers = users.map(u => {
        if (u.email === email) {
            return { 
                ...u, 
                subscription: { 
                    ...u.subscription, 
                    plan,
                    limit: plan === 'FREE' ? 20 : plan === 'STANDARD' ? 100 : 999999
                } 
            };
        }
        return u;
    });
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(updatedUsers));
    return updatedUsers;
};

export const toggleTicketStatus = (id: string) => {
    const { tickets } = getAdminData();
    const updated = tickets.map(t => t.id === id ? { ...t, status: t.status === 'OPEN' ? 'CLOSED' : 'OPEN' } : t);
    localStorage.setItem(DB_KEY_TICKETS, JSON.stringify(updated));
    return updated;
};

export const getSystemSettings = (): SystemSettings => {
    const settingsRaw = localStorage.getItem(DB_KEY_SETTINGS);
    if (settingsRaw) return JSON.parse(settingsRaw);

    // Default Settings
    return {
        categories: Object.values(ExpenseCategory),
        vatRate: 0.05,
        maintenanceMode: false,
        allowNewRegistrations: true,
        systemAlert: ''
    };
};

export const deleteUser = (email: string, adminEmail: string) => {
    const { users } = getAdminData();
    const newUsers = users.filter(u => u.email !== email);
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(newUsers));
    addAuditLog('DELETE_USER', adminEmail, `Deleted user: ${email}`);
    return newUsers;
};

export const toggleUserStatus = (email: string, adminEmail: string) => {
    const { users } = getAdminData();
    let newStatus = '';
    const updatedUsers = users.map(u => {
        if (u.email === email) {
            newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            return { ...u, status: newStatus as AccountStatus };
        }
        return u;
    });
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(updatedUsers));
    addAuditLog('TOGGLE_USER_STATUS', adminEmail, `Changed status of ${email} to ${newStatus}`);
    return updatedUsers;
};

export const saveSystemSettings = (settings: SystemSettings, adminEmail: string) => {
    localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(settings));
    addAuditLog('UPDATE_SETTINGS', adminEmail, 'System settings updated');
};
