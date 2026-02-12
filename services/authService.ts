
import { UserProfile, PlanType, AccountType } from "../types";

const DB_KEY = 'fyniq_users_db';
const MOCK_OTP = '1234'; // In production, this comes from backend

// Helper to get users from LocalStorage
const getUsers = (): UserProfile[] => {
    try {
        const users = localStorage.getItem(DB_KEY);
        return users ? JSON.parse(users) : [];
    } catch (e) {
        return [];
    }
};

// Helper to save users
const saveUser = (user: UserProfile) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(DB_KEY, JSON.stringify(users));
};

// Helper to update user
const updateUser = (updatedUser: UserProfile) => {
    const users = getUsers();
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem(DB_KEY, JSON.stringify(users));
    }
};

export const registerUser = async (data: { email: string, password: string, accountType: AccountType }) => {
    return new Promise<{ success: boolean, message?: string, user?: UserProfile }>((resolve) => {
        setTimeout(() => {
            const users = getUsers();
            if (users.find(u => u.email === data.email)) {
                resolve({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
                return;
            }

            const newUser: UserProfile = {
                id: crypto.randomUUID(),
                role: data.email.includes('admin') ? 'ADMIN' : 'USER',
                accountType: data.accountType,
                status: 'PENDING_VERIFICATION',
                companyName: data.accountType === 'BUSINESS' ? 'اسم الشركة' : 'الاسم الشخصي', // Default placeholder based on type
                email: data.email,
                password: data.password, // WARNING: In real app, never store plain text passwords
                crNumber: '', // Default empty
                vatNumber: '',
                isVerified: false,
                subscription: {
                    plan: 'FREE',
                    cycle: 'MONTHLY',
                    usageCount: 0,
                    limit: 30,
                    renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
                }
            };

            saveUser(newUser);
            // Simulate sending email
            console.log(`[Email Service] Sending OTP ${MOCK_OTP} to ${data.email}`);
            
            resolve({ success: true, user: newUser });
        }, 1000);
    });
};

export const loginUser = async (email: string, password: string) => {
    return new Promise<{ success: boolean, message?: string, user?: UserProfile }>((resolve) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                resolve({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
                return;
            }

            if (!user.isVerified) {
                resolve({ success: false, message: 'account_not_verified', user: user });
                return;
            }
            
            // Check status
            if (user.status === 'SUSPENDED') {
                 resolve({ success: false, message: 'تم إيقاف هذا الحساب. يرجى التواصل مع الإدارة.' });
                 return;
            }

            // Migration support for old users without accountType
            if (!user.accountType) {
                user.accountType = 'BUSINESS';
            }

            resolve({ success: true, user });
        }, 800);
    });
};

export const verifyEmail = async (email: string, code: string) => {
    return new Promise<{ success: boolean, message?: string, user?: UserProfile }>((resolve) => {
        setTimeout(() => {
            if (code === MOCK_OTP) {
                const users = getUsers();
                const userIndex = users.findIndex(u => u.email === email);
                
                if (userIndex !== -1) {
                    const updatedUser = { 
                        ...users[userIndex], 
                        isVerified: true, 
                        status: 'ACTIVE' as const 
                    };
                    users[userIndex] = updatedUser;
                    localStorage.setItem(DB_KEY, JSON.stringify(users));
                    resolve({ success: true, user: updatedUser });
                } else {
                    resolve({ success: false, message: 'مستخدم غير موجود' });
                }
            } else {
                resolve({ success: false, message: 'رمز التحقق غير صحيح' });
            }
        }, 800);
    });
};

export const resendOtp = async (email: string) => {
    console.log(`[Email Service] Re-sending OTP ${MOCK_OTP} to ${email}`);
    return true;
};
