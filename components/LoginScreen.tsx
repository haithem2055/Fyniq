
import React, { useState } from 'react';
import { BrainCircuit, Building2, Lock, Mail, ArrowRight, Loader2, TrendingUp, PieChart, Receipt, Wallet, BarChart3, FileBadge, CheckCircle2, AlertCircle, User, ArrowLeft } from 'lucide-react';
import { UserProfile, Language, AccountType } from '../types';
import { loginUser, registerUser, verifyEmail, resendOtp } from '../services/authService';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  translations: any;
  language: Language;
}

type AuthView = 'SELECTION' | 'LOGIN' | 'REGISTER' | 'VERIFY';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, translations: t, language }) => {
  const [view, setView] = useState<AuthView>('SELECTION');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Verification State
  const [otp, setOtp] = useState(['', '', '', '']);
  const [pendingEmail, setPendingEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isAr = language === 'ar';

  const handleSelection = (type: AccountType) => {
      setAccountType(type);
      setView('LOGIN');
  };

  const handleBack = () => {
      if (view === 'LOGIN' || view === 'REGISTER') {
          setView('SELECTION');
          setAccountType(null);
          setError(null);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const result = await loginUser(email, password);
        
        if (result.success && result.user) {
            onLogin(result.user);
        } else if (result.message === 'account_not_verified' && result.user) {
            setPendingEmail(result.user.email);
            setView('VERIFY');
        } else {
            setError(result.message || 'فشل تسجيل الدخول');
        }
    } catch (err) {
        setError('حدث خطأ غير متوقع');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }

    if (!accountType) {
        setError('نوع الحساب غير محدد');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const result = await registerUser({
            email, password, accountType
        });

        if (result.success && result.user) {
            setPendingEmail(result.user.email);
            setView('VERIFY');
            setSuccessMsg(`تم إرسال رمز التحقق إلى ${result.user.email}`);
        } else {
            setError(result.message || 'فشل إنشاء الحساب');
        }
    } catch (err) {
        setError('حدث خطأ أثناء التسجيل');
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      const code = otp.join('');
      if (code.length !== 4) return;

      setIsLoading(true);
      setError(null);

      try {
          const result = await verifyEmail(pendingEmail, code);
          if (result.success && result.user) {
              // Login successful after verification
              onLogin(result.user);
          } else {
              setError(result.message || 'رمز التحقق خاطئ');
          }
      } catch (err) {
          setError('حدث خطأ في التحقق');
      } finally {
          setIsLoading(false);
      }
  };

  const handleResendOtp = async () => {
      await resendOtp(pendingEmail);
      setSuccessMsg('تم إعادة إرسال الرمز بنجاح');
      setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOtpChange = (index: number, value: string) => {
      if (value.length > 1) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next
      if (value && index < 3) {
          const nextInput = document.getElementById(`otp-${index + 1}`);
          nextInput?.focus();
      }
  };

  return (
    <div className={`min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        
        {/* Background Image & Overlay */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop')`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.15,
                filter: 'grayscale(100%)'
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-emerald-950/90 to-slate-900/95 z-0"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Decorative Icons */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
             <TrendingUp className="absolute top-10 right-10 text-white/5 w-48 h-48 rotate-12" strokeWidth={1} />
             <PieChart className="absolute bottom-20 left-10 text-white/5 w-32 h-32 -rotate-12" strokeWidth={1} />
        </div>
        
        {/* Content Card */}
        <div className="relative z-10 text-white max-w-lg backdrop-blur-sm bg-slate-900/30 p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 rounded-full text-sm font-semibold text-emerald-300 mb-8 shadow-lg shadow-emerald-900/20">
            <BrainCircuit size={16} />
            <span>{t.aiBadge}</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            {t.login.heroTitle}
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed font-light">
            {t.login.heroDesc}
          </p>
          
          <div className="mt-10 flex items-center gap-4 pt-8 border-t border-white/10">
             <div className="flex -space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-600 flex items-center justify-center text-xs font-bold">A</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-emerald-600 flex items-center justify-center text-xs font-bold">F</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-blue-600 flex items-center justify-center text-xs font-bold">M</div>
             </div>
             <div className="text-sm text-slate-400 leading-tight">
                <span className="block text-white font-bold text-base">2,500+</span>
                مؤسسة عمانية تثق بنا
             </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 h-screen overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto relative">
          
          {/* Back Button */}
          {(view === 'LOGIN' || view === 'REGISTER') && (
            <button 
                onClick={handleBack}
                className="absolute -top-12 start-0 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold"
            >
                <ArrowLeft size={16} className={isAr ? "rotate-180" : ""} />
                <span>{isAr ? "تغيير نوع الحساب" : "Change Account Type"}</span>
            </button>
          )}

          {/* Mobile Header Icon */}
          <div className="text-center lg:text-start">
             <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl mb-6 shadow-lg shadow-emerald-500/20 lg:hidden">
                <Wallet size={28} />
             </div>
             
             {view === 'SELECTION' && (
                 <>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t.login.selectType}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        {isAr ? "اختر نوع الحساب للمتابعة" : "Choose account type to proceed"}
                    </p>
                 </>
             )}
             
             {view !== 'SELECTION' && (
                 <>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {view === 'LOGIN' && t.login.welcomeBack}
                        {view === 'REGISTER' && (isAr ? "إنشاء حساب جديد" : "Create New Account")}
                        {view === 'VERIFY' && (isAr ? "تأكيد البريد الإلكتروني" : "Verify Email")}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        {view === 'LOGIN' && t.login.subtitle}
                        {view === 'REGISTER' && (isAr ? "سجل بريدك الإلكتروني للبدء" : "Enter your email to get started")}
                        {view === 'VERIFY' && (isAr ? `أدخل الرمز المرسل إلى ${pendingEmail}` : `Enter code sent to ${pendingEmail}`)}
                    </p>
                    {accountType && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
                            {accountType === 'BUSINESS' ? <Building2 size={12} /> : <User size={12} />}
                            <span>{accountType === 'BUSINESS' ? (isAr ? "حساب شركات" : "Business Account") : (isAr ? "حساب أفراد" : "Personal Account")}</span>
                        </div>
                    )}
                 </>
             )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-shake border border-red-100 dark:border-red-800">
                <AlertCircle size={18} />
                {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 size={18} />
                {successMsg}
            </div>
          )}

          {/* VIEW: SELECTION */}
          {view === 'SELECTION' && (
              <div className="grid gap-4 animate-fadeIn">
                  <button 
                    onClick={() => handleSelection('BUSINESS')}
                    className="group relative p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-start shadow-sm hover:shadow-md"
                  >
                      <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                              <Building2 size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800 dark:text-white text-lg">{t.login.typeBusiness}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.login.typeBusinessDesc}</p>
                          </div>
                      </div>
                  </button>

                  <button 
                    onClick={() => handleSelection('INDIVIDUAL')}
                    className="group relative p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-start shadow-sm hover:shadow-md"
                  >
                      <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                              <User size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800 dark:text-white text-lg">{t.login.typeIndividual}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.login.typeIndividualDesc}</p>
                          </div>
                      </div>
                  </button>
              </div>
          )}

          {/* VIEW: LOGIN */}
          {view === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fadeIn">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.login.email}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full ps-10 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent outline-none transition-all dark:text-white shadow-sm"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.login.password}</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full ps-10 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent outline-none transition-all dark:text-white shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>{t.login.signInBtn}</span>}
                </button>
                
                <div className="pt-4 text-center">
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"} 
                        <span onClick={() => { setView('REGISTER'); setError(null); }} className="text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer hover:underline mx-1">
                            {isAr ? "سجل الآن" : "Register Now"}
                        </span>
                     </p>
                </div>
            </form>
          )}

          {/* VIEW: REGISTER */}
          {view === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-6 animate-fadeIn">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.login.email}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full ps-10 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.login.password}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full ps-10 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98]"
                >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>{isAr ? "إنشاء الحساب" : "Create Account"}</span>}
                </button>
                
                <div className="pt-4 text-center">
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isAr ? 'لديك حساب بالفعل؟' : "Already have an account?"} 
                        <span onClick={() => { setView('LOGIN'); setError(null); }} className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline mx-1">
                            {isAr ? "سجل دخول" : "Login"}
                        </span>
                     </p>
                </div>
            </form>
          )}

          {/* VIEW: VERIFY OTP */}
          {view === 'VERIFY' && (
             <form onSubmit={handleVerify} className="space-y-8 animate-fadeIn text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 animate-pulse">
                        <Mail size={32} />
                    </div>
                </div>

                <div className="flex justify-center gap-3" dir="ltr">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            id={`otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            className="w-14 h-16 text-center text-2xl font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                        />
                    ))}
                </div>

                <p className="text-sm text-slate-500">
                    {isAr ? "رمز التحقق التجريبي هو: " : "Mock verification code is: "} 
                    <span className="font-mono font-bold text-slate-800 dark:text-white">1234</span>
                </p>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all"
                >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>{isAr ? "تحقق ودخول" : "Verify & Login"}</span>}
                </button>

                <div className="text-sm text-slate-500">
                    {isAr ? "لم يصلك الرمز؟" : "Didn't receive code?"}
                    <button type="button" onClick={handleResendOtp} className="text-emerald-600 font-bold hover:underline mx-2">
                        {isAr ? "إعادة إرسال" : "Resend"}
                    </button>
                </div>

                 <button type="button" onClick={() => setView('LOGIN')} className="text-xs text-slate-400 hover:text-slate-600">
                    {isAr ? "العودة لتسجيل الدخول" : "Back to Login"}
                </button>
             </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
