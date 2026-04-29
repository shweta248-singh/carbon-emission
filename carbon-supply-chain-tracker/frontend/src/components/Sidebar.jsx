import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Box, Truck, Zap, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();
  const links = [
    { name: t('sidebar.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('sidebar.inventory'), path: '/inventory', icon: Box },
    { name: t('sidebar.shipments'), path: '/shipments', icon: Truck },
    { name: t('sidebar.optimization'), path: '/optimization', icon: Zap },
    { name: t('sidebar.analytics'), path: '/analytics', icon: BarChart3 },
    { name: t('sidebar.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] glass h-[calc(100vh-72px)] fixed top-[72px] left-0 z-40 p-5 border-r border-white/5 flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-2">Menu</div>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                isActive
                  ? 'text-primary bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_#10b981]"></div>
                )}
                <link.icon size={20} className={`relative z-10 ${isActive ? 'text-primary' : 'group-hover:text-white transition-colors'}`} />
                <span className="font-medium relative z-10">{link.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-900/20 border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-xl"></div>
        <h4 className="text-sm font-semibold text-white mb-1">{t('sidebar.need_help') || 'Need Help?'}</h4>
        <p className="text-xs text-slate-400 mb-3">{t('sidebar.help_desc') || 'Check our documentation or contact support.'}</p>
        <button className="w-full py-2 bg-primary hover:bg-emerald-400 text-dark font-medium rounded-lg text-xs transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]">
          {t('sidebar.help_docs')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
