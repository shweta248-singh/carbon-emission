import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { Leaf, LogOut, Bell, Search, User, Sun, Moon, Globe, ChevronDown, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [userName, setUserName] = useState('');
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [userPrefs, setUserPrefs] = useState({});
  const [message, setMessage] = useState(null);
  
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const applyTheme = (newTheme) => {
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        const user = response.data.data;
        if (user.firstName) {
          setUserName(`${user.firstName} ${user.lastName || ''}`);
        }
        if (user.preferences) {
          setUserPrefs(user.preferences);
          if (user.preferences.theme) setTheme(user.preferences.theme);
          if (user.preferences.language) setLang(user.preferences.language);
        }
      } catch (err) {
        console.error('Failed to fetch user in Navbar', err);
      }
    };
    fetchUser();
  }, []);

  const updatePreference = async (updates) => {
    try {
      const newPrefs = { ...userPrefs, ...updates };
      await api.put('/users/preferences', newPrefs);
      setUserPrefs(newPrefs);
      showMessage(t('navbar.preferences_saved'));
    } catch (err) {
      console.error('Failed to update preference', err);
      showMessage(err.response?.data?.message || t('common.error'), 'error');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    updatePreference({ theme: newTheme });
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
    updatePreference({ language: newLang });
    setIsLangOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const langLabels = {
    en: 'English',
    hi: 'हिन्दी',
    es: 'Español'
  };

  return (
    <nav className="h-[72px] fixed top-0 left-0 right-0 glass z-50 flex items-center justify-between px-4 md:px-8 border-b border-white/5 transition-colors duration-300">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link to="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="bg-primary/20 p-1.5 md:p-2 rounded-xl border border-primary/30 group-hover:bg-primary/30 transition-colors">
            <Leaf className="text-primary w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent tracking-tight">
            CarbonTrace
          </span>
        </Link>
      </div>
      
      <div className="flex-1 max-w-xl px-8 hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t('navbar.search_placeholder') || 'Search inventory, shipments...'} 
            className="w-full bg-slate-900/30 border border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          title={theme === 'dark' ? t('navbar.switch_light') : t('navbar.switch_dark')}
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Language Dropdown */}
        <div className="relative hidden xs:block">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 p-2 px-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all border border-transparent hover:border-white/5"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">{lang}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 glass-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {Object.entries(langLabels).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${
                    lang === code ? 'bg-primary/20 text-primary' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {label}
                  {lang === code && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full transition-all relative hidden sm:block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-darker"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-700/50 mx-1 md:mx-2 hidden sm:block"></div>
        
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 md:gap-3 hover:bg-slate-800/50 p-1 md:p-1.5 md:pr-4 rounded-full transition-all border border-transparent hover:border-slate-700/50"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-emerald-700 rounded-full flex items-center justify-center border border-emerald-400/30">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col items-start hidden lg:flex">
            <span className="text-sm font-medium text-white leading-none">{userName}</span>
            <span className="text-xs text-slate-500 mt-1 leading-none">{t('navbar.role') || 'Supply Chain'}</span>
          </div>
        </button>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
          title={t('navbar.logout') || 'Logout'}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
