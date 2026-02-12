
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Building2, Lock, Mail, ArrowRight, Loader2, TrendingUp, PieChart, Wallet, CheckCircle2, AlertCircle, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Verification State
  const [otp, setOtp] = useState(['', '', '', '']);
  const [pendingEmail, setPendingEmail] = useState('');
  const [timer, setTimer] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isAr = language === 'ar';

  // OTP Timer Logic
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validateEmail = (val: string) => {
    setEmail(val);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) setEmailError(isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required');
    else if (!regex.test(val)) setEmailError(isAr ? 'بريد إلكتروني غير صالح' : 'Invalid email format');
    else setEmailError('');
  };

  const validatePassword = (val: string) => {
    setPassword(val);
    if (!val) {
        setPasswordError(isAr ? 'كلمة المرور مطلوبة' : 'Password is required');
        return;
    }
    
    const errors = [];
    if (val.length < 8) errors.push(isAr ? '8 أحرف على الأقل' : 'min 8 chars');
    if (!/[A-Z]/.test(val)) errors.push(isAr ? 'حرف كبير' : 'uppercase');
    if (!/[0-9]/.test(val)) errors.push(isAr ? 'رقم' : 'number');
    if (!/[!@#$%^&*]/.test(val)) errors.push(isAr ? 'رمز خاص' : 'special char');

    if (errors.length > 0) {
        setPasswordError(`${isAr ? 'يجب أن تحتوي على:' : 'Must include:'} ${errors.join(', ')}`);
    } else {
        setPasswordError('');
    }
  };

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
    if (emailError || passwordError) return;
    
    setIsLoading(true);
    setError(null);

    try {
        const result = await loginUser(email, password);
        
        if (result.success && result.user) {
            onLogin(result.user);
        } else if (result.message === 'account_not_verified' && result.user) {
            setPendingEmail(result.user.email);
            setTimer(60);
            setView('VERIFY');
        } else {
            setError(result.message || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
        }
    } catch (err) {
        setError(isAr ? 'حدث خطأ غير متوقع' : 'Unexpected error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || passwordError || !email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
        const result = await registerUser({
            email, password, accountType: accountType || 'BUSINESS'
        });

        if (result.success && result.user) {
            setPendingEmail(result.user.email);
            setTimer(60);
            setView('VERIFY');
            setSuccessMsg(isAr ? `تم إرسال رمز التحقق إلى ${result.user.email}` : `OTP sent to ${result.user.email}`);
        } else {
            setError(result.message || (isAr ? 'فشل إنشاء الحساب' : 'Registration failed'));
        }
    } catch (err) {
        setError(isAr ? 'حدث خطأ أثناء التسجيل' : 'Registration error');
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
              onLogin(result.user);
          } else {
              setError(result.message || (isAr ? 'رمز التحقق خاطئ' : 'Incorrect OTP'));
          }
      } catch (err) {
          setError(isAr ? 'حدث خطأ في التحقق' : 'Verification error');
      } finally {
          setIsLoading(false);
      }
  };

  const handleResendOtp = async () => {
      if (timer > 0) return;
      await resendOtp(pendingEmail);
      setTimer(60);
      setSuccessMsg(isAr ? 'تم إعادة إرسال الرمز بنجاح' : 'Code resent successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOtpChange = (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 1) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
          const nextInput = document.getElementById(`otp-${index + 1}`);
          nextInput?.focus();
      }
  };

  const handleSocialLogin = (provider: string) => {
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          alert(isAr ? `جاري الاتصال بـ ${provider}...` : `Connecting to ${provider}...`);
      }, 1000);
  };

  return (
    <div className={`min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
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
        <div className="w-full max-w-md space-y-6 my-auto relative">
          
          {(view === 'LOGIN' || view === 'REGISTER') && (
            <button 
                onClick={handleBack}
                className="absolute -top-12 start-0 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold transition-all"
            >
                <ArrowLeft size={16} className={isAr ? "rotate-180" : ""} />
                <span>{isAr ? "رجوع" : "Back"}</span>
            </button>
          )}

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
                 </>
             )}
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-shake border border-rose-100 dark:border-rose-800">
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

          {(view === 'LOGIN' || view === 'REGISTER') && (
            <div className="space-y-6 animate-fadeIn">
                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleSocialLogin('Google')}
                        className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm group"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.72l3.41-3.41C17.9 1.19 15.17 0 12 0 7.31 0 3.25 2.67 1.19 6.6l3.88 3.01c1.07-3.23 4.09-5.57 6.93-5.57z"/>
                            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.89 3.01c2.27-2.1 3.53-5.2 3.53-8.83z"/>
                            <path fill="#FBBC05" d="M5.07 14.61c-.28-.84-.44-1.74-.44-2.61s.16-1.77.44-2.61L1.19 6.6C.43 8.15 0 9.94 0 12s.43 3.85 1.19 5.4l3.88-3.01z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.89-3.01c-1.11.75-2.53 1.19-4.07 1.19-2.84 0-5.26-1.92-6.12-4.51l-3.88 3.01C3.25 21.33 7.31 24 12 24z"/>
                        </svg>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Google</span>
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('Facebook')}
                        className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm group"
                    >
                        <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Facebook</span>
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-700"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-400">{isAr ? 'أو عبر البريد' : 'OR WITH EMAIL'}</span></div>
                </div>

                <form onSubmit={view === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
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
                                onChange={(e) => validateEmail(e.target.value)}
                                className={`block w-full ps-10 p-3.5 bg-white dark:bg-slate-900 border ${emailError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white shadow-sm`}
                                placeholder="name@example.com"
                            />
                        </div>
                        {emailError && <p className="mt-1 text-[10px] text-rose-500 font-bold">{emailError}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.login.password}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => validatePassword(e.target.value)}
                                className={`block w-full ps-10 pe-10 p-3.5 bg-white dark:bg-slate-900 border ${passwordError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white shadow-sm`}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordError && <p className="mt-1 text-[10px] text-rose-500 font-bold leading-relaxed">{passwordError}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || !!emailError || !!passwordError}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${view === 'LOGIN' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'} text-white mt-4`}
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>{view === 'LOGIN' ? t.login.signInBtn : (isAr ? "إنشاء حساب" : "Create Account")}</span>}
                    </button>
                </form>
                
                <div className="pt-4 text-center">
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        {view === 'LOGIN' ? (isAr ? 'ليس لديك حساب؟' : "Don't have an account?") : (isAr ? 'لديك حساب بالفعل؟' : "Already have an account?") } 
                        <span onClick={() => { setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(null); setEmailError(''); setPasswordError(''); }} className="text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer hover:underline mx-1">
                            {view === 'LOGIN' ? (isAr ? "سجل الآن" : "Register Now") : (isAr ? "سجل دخول" : "Login")}
                        </span>
                     </p>
                </div>
            </div>
          )}

          {view === 'VERIFY' && (
             <form onSubmit={handleVerify} className="space-y-8 animate-fadeIn text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 animate-pulse border-4 border-white dark:border-slate-800 shadow-xl">
                        <Mail size={32} />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? "تحقق من بريدك" : "Check your email"}</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">{isAr ? `لقد أرسلنا رمز التحقق المكون من 4 أرقام إلى ${pendingEmail}` : `We sent a 4-digit code to ${pendingEmail}`}</p>
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
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                                    document.getElementById(`otp-${idx - 1}`)?.focus();
                                }
                            }}
                            className="w-14 h-16 text-center text-3xl font-black border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all dark:text-white shadow-inner"
                        />
                    ))}
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading || otp.some(d => !d)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>{isAr ? "تحقق وتفعيل" : "Verify & Activate"}</span>}
                </button>

                <div className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    {isAr ? "لم يصلك الرمز؟" : "Didn't receive code?"}
                    <button 
                        type="button" 
                        onClick={handleResendOtp} 
                        disabled={timer > 0}
                        className={`font-bold mx-2 ${timer > 0 ? 'text-slate-400' : 'text-emerald-600 hover:underline'}`}
                    >
                        {isAr ? "إعادة إرسال" : "Resend"} {timer > 0 && `(${timer}s)`}
                    </button>
                </div>

                 <button type="button" onClick={() => setView('LOGIN')} className="text-xs text-slate-400 hover:text-emerald-500 font-medium transition-colors">
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
