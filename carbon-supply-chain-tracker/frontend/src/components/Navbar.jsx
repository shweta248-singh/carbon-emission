import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { Leaf, LogOut, Bell, Search, User, Sun, Moon, Globe, ChevronDown, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [userName, setUserName] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userPrefs, setUserPrefs] = useState({});
  const [message, setMessage] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!user;

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

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await api.get('/notifications');
      const data = response.data.data;
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoggedIn) return;
      try {
        const response = await api.get('/users/me');
        const userData = response.data.data;
        if (userData.firstName) {
          setUserName(`${userData.firstName} ${userData.lastName || ''}`);
        }
        if (userData.preferences) {
          setUserPrefs(userData.preferences);
          if (userData.preferences.theme) {
            setTheme(userData.preferences.theme);
            applyTheme(userData.preferences.theme);
          }
          if (userData.preferences.language) {
            setLang(userData.preferences.language);
            i18n.changeLanguage(userData.preferences.language);
          }
        }
        fetchNotifications();
      } catch (err) {
        console.error('Failed to fetch user in Navbar', err);
      }
    };
    fetchUser();
    
    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [isLoggedIn, i18n]);

  const updatePreference = async (updates) => {
    if (!isLoggedIn) {
      if (updates.language) localStorage.setItem('i18nextLng', updates.language);
      if (updates.theme) localStorage.setItem('theme', updates.theme);
      return;
    }
    try {
      const newPrefs = { ...userPrefs, ...updates };
      await api.put('/users/preferences', newPrefs);
      setUserPrefs(newPrefs);
      showMessage(t('navbar.preferences_saved'));
    } catch (err) {
      console.error('Failed to update preference', err);
      console.warn('Failed to save preferences to cloud');
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

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout request failed', err);
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const langLabels = {
    en: 'EN',
    hi: 'HI'
  };

  return (
    <nav className="h-[72px] fixed top-0 left-0 right-0 glass z-50 flex items-center justify-between px-4 md:px-8 border-b border-white/5 transition-colors duration-300">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        {isLoggedIn && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="bg-primary/20 p-1.5 md:p-2 rounded-xl border border-primary/30 group-hover:bg-primary/30 transition-colors">
            <Leaf className="text-primary w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent tracking-tight">
            CarbonTrace
          </span>
        </Link>
      </div>
      
      {isLoggedIn && (
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
      )}

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
        <div className="relative block">
          <button 
            onClick={() => {
              setIsLangOpen(!isLangOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-2 px-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all border border-transparent hover:border-white/5"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">{lang}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 glass-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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

        {isLoggedIn ? (
          <>
            {/* Notification Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsLangOpen(false);
                }}
                className={`p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full transition-all relative ${isNotifOpen ? 'bg-slate-800/50 text-white' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-darker px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 glass-card rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-2 duration-300 border border-white/10">
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{t('navbar.notifications')}</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[10px] font-bold text-primary hover:text-emerald-400 uppercase tracking-wider transition-colors"
                      >
                        {t('navbar.mark_all_read')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto carbon-chat-scroll">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-20" />
                        <p className="text-xs text-slate-500">{t('navbar.no_notifications')}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {notifications.map((n) => (
                          <div 
                            key={n._id} 
                            className={`p-4 transition-colors hover:bg-white/5 relative ${!n.isRead ? 'bg-primary/5' : ''}`}
                          >
                            {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{t(`navbar.${n.title}`)}</span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-[1px] bg-slate-700/50 mx-1 md:mx-2 hidden sm:block"></div>
            
            <button 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 md:gap-3 hover:bg-slate-800/50 p-1 md:p-1.5 md:pr-4 rounded-full transition-all border border-transparent hover:border-slate-700/50"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-emerald-700 rounded-full flex items-center justify-center border border-emerald-400/30">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col items-start hidden lg:flex text-left">
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
          </>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl">
              {t('auth.sign_in') || 'Sign In'}
            </Link>
            <Link to="/register" className="text-xs font-bold text-dark bg-primary px-4 py-2 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-primary/20">
              {t('auth.sign_up') || 'Get Started'}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
