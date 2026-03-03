
import React from 'react';
import { Wallet, Camera, LayoutDashboard, Home, FileText, Settings, Sparkles, Languages, Moon, Sun, LogOut, User, Crown, CreditCard, Images, Database } from 'lucide-react';
import { Language, Theme, UserProfile } from '../types';

interface HeaderProps {
  onScanClick: () => void;
  activeView: 'home' | 'dashboard' | 'reports' | 'payments' | 'archive';
  onNavigate: (view: 'home' | 'dashboard' | 'reports' | 'payments' | 'archive') => void;
  onOpenBudgetSettings: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  translations: any;
  theme: Theme;
  onToggleTheme: (theme: Theme) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenSubscription: () => void;
  dbConfig?: {
    server: string;
    database: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  };
}

const Header: React.FC<HeaderProps> = ({ 
  onScanClick, 
  activeView, 
  onNavigate, 
  onOpenBudgetSettings,
  language,
  onToggleLanguage,
  translations: t,
  theme,
  onToggleTheme,
  user,
  onLogout,
  onOpenSubscription,
  dbConfig
}) => {
  
  const getLinkClass = (view: string) => {
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium";
    return activeView === view 
      ? `${baseClass} bg-white/10 text-white shadow-inner backdrop-blur-sm border border-white/10` 
      : `${baseClass} text-emerald-100 hover:bg-white/5 hover:text-white`;
  };

  const getMobileLinkClass = (view: string) => {
    const isActive = activeView === view;
    return `flex flex-col items-center justify-center w-full h-full gap-1 ${
      isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
    }`;
  };

  const isAr = language === 'ar';
  const isDark = theme === 'dark';
  const showReports = user?.accountType !== 'INDIVIDUAL';
  const usageCount = user?.subscription?.usageCount || 0;
  const usageLimit = user?.subscription?.limit || 1;
  const isUnlimited = usageLimit === -1;
  const usagePercent = isUnlimited ? 0 : Math.min((usageCount / usageLimit) * 100, 100);

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 to-emerald-900 text-white shadow-xl sticky top-0 z-50 border-b border-white/10 transition-colors">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                <Wallet className="w-7 h-7 text-emerald-300" />
                <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="block">
              <h1 className="text-xl font-bold leading-tight tracking-wide">
                {t.header.appName}
              </h1>
              <div className="hidden sm:flex items-center gap-2">
                <p className="text-[10px] text-emerald-300 tracking-wider font-light flex items-center gap-1">
                  {t.header.poweredBy} <Sparkles size={8} />
                </p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex gap-1 text-sm">
            <button onClick={() => onNavigate('home')} className={getLinkClass('home')}>
              <Home size={18} />
              {t.header.home}
            </button>
            <button onClick={() => onNavigate('dashboard')} className={getLinkClass('dashboard')}>
              <LayoutDashboard size={18} />
              {t.header.dashboard}
            </button>
            <button onClick={() => onNavigate('payments')} className={getLinkClass('payments')}>
              <CreditCard size={18} />
              {t.header.payments}
            </button>
            <button onClick={() => onNavigate('archive')} className={getLinkClass('archive')}>
              <Images size={18} />
              {t.header.archive}
            </button>
            {showReports && (
              <button onClick={() => onNavigate('reports')} className={getLinkClass('reports')}>
                <FileText size={18} />
                {t.header.reports}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
             {user && (
               <button 
                 onClick={onOpenSubscription}
                 className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-2 md:px-3 py-1.5 rounded-lg transition-all group"
               >
                  <div className={`p-1.5 rounded-md ${user.subscription.plan === 'FREE' ? 'bg-slate-600' : 'bg-amber-500 text-white'}`}>
                      <Crown size={14} fill={user.subscription.plan !== 'FREE' ? "currentColor" : "none"} />
                  </div>
                  <div className="hidden lg:block text-start">
                      <div className="text-[10px] text-slate-300 leading-tight">
                          {isUnlimited ? 'Unlimited' : `${usageCount}/${usageLimit}`}
                      </div>
                      {!isUnlimited && (
                          <div className="w-16 h-1 bg-white/20 rounded-full mt-0.5 overflow-hidden">
                              <div 
                                  className={`h-full rounded-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-emerald-400'}`} 
                                  style={{ width: `${usagePercent}%` }}
                              ></div>
                          </div>
                      )}
                  </div>
               </button>
             )}
             
             <button
               onClick={() => onToggleTheme(isDark ? 'light' : 'dark')}
               className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-white/10"
             >
               {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             <button 
                onClick={() => onToggleLanguage(isAr ? 'en' : 'ar')}
                className="p-2 text-emerald-100 font-bold text-xs border border-white/10 rounded-lg"
             >
                {isAr ? 'EN' : 'عربي'}
             </button>

            <button
              onClick={onOpenBudgetSettings}
              className="p-2.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-white/10"
              title={t.header.settings}
            >
              <Settings size={20} />
            </button>
              
            {user && (
              <button
                  onClick={onLogout}
                  className="p-2.5 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-full transition-all border border-transparent hover:border-rose-500/30"
                  title={t.header.logout}
              >
                  <LogOut size={20} />
              </button>
            )}

            <button 
              onClick={onScanClick}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-400 hover:to-teal-400 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ring-1 ring-white/20"
            >
              <Camera size={18} strokeWidth={2.5} />
              <span className="hidden lg:inline">{t.header.addInvoice}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-16 relative px-2">
          <button onClick={() => onNavigate('home')} className={getMobileLinkClass('home')}>
            <Home size={20} />
            <span className="text-[10px] font-medium">{t.header.home}</span>
          </button>
          
          <button onClick={() => onNavigate('dashboard')} className={getMobileLinkClass('dashboard')}>
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-medium">{t.header.dashboard}</span>
          </button>
          
          <div className="relative -top-6">
            <button 
              onClick={onScanClick}
              className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 border-4 border-slate-50 dark:border-slate-950 transform active:scale-95 transition-transform"
            >
              <Camera size={24} />
            </button>
          </div>

          <button onClick={() => onNavigate('payments')} className={getMobileLinkClass('payments')}>
            <CreditCard size={20} />
            <span className="text-[10px] font-medium">{t.header.payments}</span>
          </button>

          <button onClick={() => onNavigate('archive')} className={getMobileLinkClass('archive')}>
            <Images size={20} />
            <span className="text-[10px] font-medium">{t.header.archive}</span>
          </button>
          
          {/* Note: If more items are needed, consider a 'More' menu or scrollable container */}
        </div>
      </div>
    </>
  );
};

export default Header;
