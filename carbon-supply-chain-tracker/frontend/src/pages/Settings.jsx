import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { Save, User, Lock, Bell, Settings as SettingsIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    preferences: {
      defaultVehicle: 'truck',
      carbonUnit: 'kg'
    },
    notifications: {
      emailAlerts: true,
      lowStockAlerts: true,
      shipmentUpdates: true,
      carbonReportAlerts: false
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      if (response.data.success) {
        const data = response.data.data;
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          company: data.company || '',
          preferences: data.preferences || userData.preferences,
          notifications: data.notifications || userData.notifications
        });
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      showMessage(t('settings.load_error') || 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { firstName, lastName, company, email } = userData;
      await api.put('/users/me', { firstName, lastName, company, email });
      showMessage(t('common.success'));
    } catch (err) {
      showMessage(err.response?.data?.message || t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showMessage(t('settings.password_mismatch'), 'error');
    }
    setSaving(true);
    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showMessage(t('settings.password_success'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage(err.response?.data?.message || t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Only update vehicle and carbon unit preferences
      const { defaultVehicle, carbonUnit } = userData.preferences;
      await api.put('/users/preferences', { defaultVehicle, carbonUnit });
      showMessage(t('common.success'));
    } catch (err) {
      showMessage(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/notifications', userData.notifications);
      showMessage(t('settings.notif_success'));
    } catch (err) {
      showMessage(t('settings.notif_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message={t('settings.loading')} />;

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${
        activeTab === id 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 fade-in pb-10">
      {message && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border animate-in slide-in-from-right duration-300 ${
          message.type === 'error' 
            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{t('settings.title')}</h1>
          <p className="text-slate-400">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="glass-card p-4 rounded-2xl sticky top-6">
            <nav className="flex flex-col gap-2">
              <TabButton id="profile" icon={User} label={t('settings.profile')} />
              <TabButton id="security" icon={Lock} label={t('settings.security')} />
              <TabButton id="notifications" icon={Bell} label={t('settings.notifications')} />
              <TabButton id="preferences" icon={SettingsIcon} label={t('settings.preferences')} />
            </nav>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          {activeTab === 'profile' && (
            <div className="glass-card p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">{t('settings.profile_info')}</h3>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.first_name')}</label>
                    <input 
                      type="text" 
                      value={userData.firstName}
                      onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.last_name')}</label>
                    <input 
                      type="text" 
                      value={userData.lastName}
                      onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.email')}</label>
                  <input 
                    type="email" 
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.company')}</label>
                  <input 
                    type="text" 
                    value={userData.company}
                    onChange={(e) => setUserData({...userData, company: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" 
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-emerald-400 text-dark px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {t('settings.save_profile')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">{t('settings.security_settings')}</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.current_password')}</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.new_password')}</label>
                    <input 
                      type="password" 
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.confirm_password')}</label>
                    <input 
                      type="password" 
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" 
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-emerald-400 text-dark px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                    {t('settings.update_password')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">{t('settings.notification_prefs')}</h3>
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                <div className="space-y-4">
                  {[
                    { id: 'emailAlerts', label: t('settings.notif_email'), desc: t('settings.notif_email_desc') },
                    { id: 'lowStockAlerts', label: t('settings.notif_stock'), desc: t('settings.notif_stock_desc') },
                    { id: 'shipmentUpdates', label: t('settings.notif_shipment'), desc: t('settings.notif_shipment_desc') },
                    { id: 'carbonReportAlerts', label: t('settings.notif_carbon'), desc: t('settings.notif_carbon_desc') },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-700/30">
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={userData.notifications[item.id]}
                          onChange={(e) => setUserData({
                            ...userData, 
                            notifications: { ...userData.notifications, [item.id]: e.target.checked }
                          })}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-emerald-400 text-dark px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {t('settings.save_notifications')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="glass-card p-8 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{t('settings.business_prefs')}</h3>
                <span className="text-xs text-slate-500 italic">{t('settings.navbar_managed_hint')}</span>
              </div>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.default_vehicle')}</label>
                    <select 
                      value={userData.preferences.defaultVehicle}
                      onChange={(e) => setUserData({
                        ...userData, 
                        preferences: { ...userData.preferences, defaultVehicle: e.target.value }
                      })}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all"
                    >
                      <option value="truck">{t('vehicles.truck')}</option>
                      <option value="van">{t('vehicles.van')}</option>
                      <option value="rail">{t('vehicles.rail')}</option>
                      <option value="ship">{t('vehicles.ship')}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.carbon_unit')}</label>
                    <select 
                      value={userData.preferences.carbonUnit}
                      onChange={(e) => setUserData({
                        ...userData, 
                        preferences: { ...userData.preferences, carbonUnit: e.target.value }
                      })}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-all"
                    >
                      <option value="kg">{t('settings.unit_kg')}</option>
                      <option value="ton">{t('settings.unit_ton')}</option>
                      <option value="lb">{t('settings.unit_lb')}</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-emerald-400 text-dark px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {t('settings.save_preferences')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
