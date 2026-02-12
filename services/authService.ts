
import { UserProfile, PlanType, AccountType } from "../types";

// تحديث المفتاح ليطابق قاعدة البيانات الجديدة
const DB_KEY = 'fyniq_db_u794936001_Fyniq_DB_test'; 
const MOCK_OTP = '1234'; 
const DB_ASSIGNMENT = {
    server: "127.0.0.1:3306",
    database: "u794936001_Fyniq_DB_test",
    tables: {
        users: "wp_fyniq_users",
        settings: "wp_fyniq_options",
        invoices: "wp_fyniq_invoices"
    }
};

// سجل النشاط للمطور في المتصفح
console.info(`[SQL ENGINE] Database Context Shifted to: ${DB_ASSIGNMENT.database}`);
console.info(`[SERVER STATUS] Connection to ${DB_ASSIGNMENT.server} is simulated via local storage bridge.`);

// Helper to get users from LocalStorage (Simulated Tables)
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

export const registerUser = async (data: { email: string, password: string, accountType: AccountType }) => {
    return new Promise<{ success: boolean, message?: string, user?: UserProfile }>((resolve) => {
        setTimeout(() => {
            const users = getUsers();
            if (users.find(u => u.email === data.email)) {
                resolve({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً في قاعدة البيانات الجديدة' });
                return;
            }

            const newUser: UserProfile = {
                id: crypto.randomUUID(),
                role: data.email.includes('admin') ? 'ADMIN' : 'USER',
                accountType: data.accountType,
                status: 'PENDING_VERIFICATION',
                companyName: data.accountType === 'BUSINESS' ? 'مؤسسة جديدة' : 'مستخدم فردي', 
                email: data.email,
                password: data.password, 
                crNumber: '', 
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
            // محاكاة إرسال الاستعلام لقاعدة البيانات
            console.log(`[SQL EXEC] INSERT INTO \`${DB_ASSIGNMENT.database}\`.\`${DB_ASSIGNMENT.tables.users}\` (email, pass, role) VALUES ('${data.email}', '***', 'USER');`);
            console.info(`[MAIL SERVER] Sending One-Time-Password ${MOCK_OTP} to ${data.email}`);
            
            resolve({ success: true, user: newUser });
        }, 1500);
    });
};

export const loginUser = async (email: string, password: string) => {
    return new Promise<{ success: boolean, message?: string, user?: UserProfile }>((resolve) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                resolve({ success: false, message: 'خطأ في الدخول: لا يوجد سجل مطابق في قاعدة البيانات الحالية' });
                return;
            }

            if (!user.isVerified) {
                console.info(`[AUTH] Account ${email} requires OTP. Resending ${MOCK_OTP}`);
                resolve({ success: false, message: 'account_not_verified', user: user });
                return;
            }
            
            console.log(`[SQL EXEC] SELECT * FROM \`${DB_ASSIGNMENT.database}\`.\`${DB_ASSIGNMENT.tables.users}\` WHERE email = '${email}';`);
            resolve({ success: true, user });
        }, 1200);
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
                    console.log(`[SQL EXEC] UPDATE \`${DB_ASSIGNMENT.database}\`.\`${DB_ASSIGNMENT.tables.users}\` SET verified=1 WHERE email='${email}';`);
                    resolve({ success: true, user: updatedUser });
                } else {
                    resolve({ success: false, message: 'فشل التحقق: السجل غير موجود' });
                }
            } else {
                resolve({ success: false, message: 'رمز التحقق غير صحيح' });
            }
        }, 1000);
    });
};

export const resendOtp = async (email: string) => {
    return new Promise<boolean>((resolve) => {
        setTimeout(() => {
            console.log(`[MAIL SERVER] OTP Resent: ${MOCK_OTP} to ${email}`);
            resolve(true);
        }, 1000);
    });
};
