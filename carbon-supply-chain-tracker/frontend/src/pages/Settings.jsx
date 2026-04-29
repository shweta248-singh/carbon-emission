import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { Save, User, Lock, Bell, Globe, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const { t, i18n } = useTranslation();
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
      theme: 'dark',
      defaultVehicle: 'truck',
      carbonUnit: 'kg',
      language: 'en'
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
        const preferences = data.preferences || userData.preferences;
        
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          company: data.company || '',
          preferences: preferences,
          notifications: data.notifications || userData.notifications
        });

        // Apply language from backend
        if (preferences.language && i18n.language !== preferences.language) {
          i18n.changeLanguage(preferences.language);
        }
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
      await api.put('/users/preferences', userData.preferences);
      
      // Apply language change immediately
      if (userData.preferences.language) {
        await i18n.changeLanguage(userData.preferences.language);
      }
      
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
      showMessage('Notification settings saved');
    } catch (err) {
      showMessage('Failed to save notification settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;

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
              <TabButton id="preferences" icon={Globe} label={t('settings.preferences')} />
            </nav>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          {activeTab === 'profile' && (
            <div className="glass-card p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">{t('settings.profile_info') || 'Profile Information'}</h3>
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
              <h3 className="text-xl font-bold text-white mb-6">{t('settings.security_settings') || 'Security Settings'}</h3>
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
              <h3 className="text-xl font-bold text-white mb-6">{t('settings.notification_prefs') || 'Notification Preferences'}</h3>
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                <div className="space-y-4">
                  {[
                    { id: 'emailAlerts', label: t('settings.notif_email') || 'Email Alerts', desc: t('settings.notif_email_desc') || 'Receive daily summary of emissions and logistics.' },
                    { id: 'lowStockAlerts', label: t('settings.notif_stock') || 'Low Stock Alerts', desc: t('settings.notif_stock_desc') || 'Get notified when inventory items fall below threshold.' },
                    { id: 'shipmentUpdates', label: t('settings.notif_shipment') || 'Shipment Updates', desc: t('settings.notif_shipment_desc') || 'Real-time status changes for your active shipments.' },
                    { id: 'carbonReportAlerts', label: t('settings.notif_carbon') || 'Carbon Reports', desc: t('settings.notif_carbon_desc') || 'Monthly sustainability and carbon footprint analysis.' },
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
                    Save Notification Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="glass-card p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">{t('settings.system_prefs') || 'System Preferences'}</h3>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.theme')}</label>
                    <select 
                      value={userData.preferences.theme}
                      onChange={(e) => setUserData({
                        ...userData, 
                        preferences: { ...userData.preferences, theme: e.target.value }
                      })}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="dark">Dark Mode (Default)</option>
                      <option value="light">Light Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.default_vehicle')}</label>
                    <select 
                      value={userData.preferences.defaultVehicle}
                      onChange={(e) => setUserData({
                        ...userData, 
                        preferences: { ...userData.preferences, defaultVehicle: e.target.value }
                      })}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="rail">Rail</option>
                      <option value="ship">Ship</option>
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
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ton">Metric Tons (t)</option>
                      <option value="lb">Pounds (lb)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400 ml-1">{t('settings.language')}</label>
                    <select 
                      value={userData.preferences.language}
                      onChange={(e) => setUserData({
                        ...userData, 
                        preferences: { ...userData.preferences, language: e.target.value }
                      })}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="es">Español (Spanish)</option>
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
