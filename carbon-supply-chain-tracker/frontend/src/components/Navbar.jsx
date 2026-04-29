import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { Leaf, LogOut, Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        const user = response.data.data;
        if (user.firstName) {
          setUserName(`${user.firstName} ${user.lastName || ''}`);
        }
      } catch (err) {
        console.error('Failed to fetch user in Navbar', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="h-[72px] fixed top-0 left-0 right-0 glass z-50 flex items-center justify-between px-8 border-b border-white/5">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 group-hover:bg-primary/30 transition-colors">
          <Leaf className="text-primary w-6 h-6 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
          CarbonTrace
        </span>
      </Link>
      
      <div className="flex-1 max-w-xl px-8 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t('navbar.search_placeholder') || 'Search inventory, shipments...'} 
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#0f172a]"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-700/50 mx-2"></div>
        
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 hover:bg-slate-800/50 p-1.5 pr-4 rounded-full transition-all border border-transparent hover:border-slate-700/50"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-emerald-700 rounded-full flex items-center justify-center border border-emerald-400/30">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-sm font-medium text-white leading-none">{userName}</span>
            <span className="text-xs text-slate-500 mt-1 leading-none">{t('navbar.role') || 'Supply Chain'}</span>
          </div>
        </button>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all ml-2"
          title={t('navbar.logout') || 'Logout'}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
