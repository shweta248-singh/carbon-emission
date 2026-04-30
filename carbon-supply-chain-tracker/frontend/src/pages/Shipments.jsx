import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Plus, Navigation, X, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

const Shipments = () => {
  const { t, i18n } = useTranslation();
  const [shipments, setShipments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    inventoryId: '', originCity: '', destinationCity: '', vehicleType: 'truck', distanceKm: ''
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [shipRes, invRes] = await Promise.all([
        api.get('/shipments'),
        api.get('/inventory')
      ]);
      setShipments(shipRes.data.data || []);
      setInventory(invRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <Badge type="success">{t('dashboard.status_delivered')}</Badge>;
      case 'in_transit':
      case 'in transit':
        return <Badge type="info">{t('dashboard.status_in_transit')}</Badge>;
      case 'pending':
        return <Badge type="warning">{t('dashboard.status_pending')}</Badge>;
      default:
        return <Badge type="default">{status || t('dashboard.status_unknown')}</Badge>;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/shipments/${id}/status`, { status });
      showNotification(`${t('shipments.status_updated_to')} ${status.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      console.error('Failed to update status', err);
      showNotification(t('shipments.status_error'), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/shipments', formData);
      await fetchData();
      setIsModalOpen(false);
      setFormData({ inventoryId: '', originCity: '', destinationCity: '', vehicleType: 'truck', distanceKm: '' });
      showNotification(t('shipments.create_success'));
    } catch (err) {
      console.error(err);
      showNotification(t('shipments.create_error'), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border animate-in slide-in-from-right duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('sidebar.shipments')}</h1>
          <p className="text-slate-400 mt-1">{t('shipments.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-emerald-400 text-dark px-4 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('dashboard.new_shipment')}
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">{t('shipments.active_shipments')}</h3>

        {loading ? (
          <LoadingSpinner message={t('common.loading')} />
        ) : shipments.length === 0 ? (
          <EmptyState 
            title={t('dashboard.no_shipments')} 
            description={t('shipments.empty_desc')}
            icon={Navigation}
            action={
              <button onClick={() => setIsModalOpen(true)} className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-primary/30 mt-2">
                {t('dashboard.new_shipment')}
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/20">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('dashboard.tracking_id')}</th>
                  <th className="px-6 py-4 font-medium">{t('inventory.product')}</th>
                  <th className="px-6 py-4 font-medium">{t('shipments.route')}</th>
                  <th className="px-6 py-4 font-medium">{t('shipments.vehicle')}</th>
                  <th className="px-6 py-4 font-medium">{t('dashboard.carbon_emissions')}</th>
                  <th className="px-6 py-4 font-medium">{t('dashboard.status')}</th>
                  <th className="px-6 py-4 font-medium text-right">{t('inventory.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {shipments.map((shipment) => (
                  <tr key={shipment._id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-white">{shipment._id.substring(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {shipment.inventoryId?.productName || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="font-medium">{shipment.origin}</span>
                        <Navigation className="w-3 h-3 text-slate-500 rotate-90" />
                        <span className="font-medium">{shipment.destination}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{shipment.distanceKm} km total distance</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-300">
                      {t(`vehicles.${shipment.vehicleType}`) || shipment.vehicleType}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-red-400">{shipment.carbonEmissionKg?.toFixed(1) || 0} kg CO2</span>
                        {shipment.recommendedVehicle && shipment.recommendedVehicle !== shipment.vehicleType && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {t('optimization.recommended')}: <span className="text-emerald-400 capitalize">{t(`vehicles.${shipment.recommendedVehicle}`) || shipment.recommendedVehicle}</span>
                          </div>
                        )}
                        {shipment.savingsKg > 0 && (
                          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">
                            {t('optimization.savings')}: {shipment.savingsKg?.toFixed(1)} kg
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(shipment.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {shipment.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(shipment._id, 'in_transit')}
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors title='Mark In Transit'"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                        {shipment.status === 'in_transit' && (
                          <button 
                            onClick={() => updateStatus(shipment._id, 'delivered')}
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors title='Mark Delivered'"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 relative border border-white/10 shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" /> {t('shipments.create_title')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">{t('shipments.select_item')}</label>
                <select
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 appearance-none"
                  value={formData.inventoryId} onChange={(e) => setFormData({...formData, inventoryId: e.target.value})}
                >
                  <option value="" disabled>{t('shipments.select_product_placeholder')}</option>
                  {inventory.map(item => (
                    <option key={item._id} value={item._id}>{item.productName} ({item.quantity} {t('inventory.in_stock')})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{t('shipments.origin_city')}</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    value={formData.originCity} onChange={(e) => setFormData({...formData, originCity: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{t('shipments.dest_city')}</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    value={formData.destinationCity} onChange={(e) => setFormData({...formData, destinationCity: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{t('shipments.vehicle_type')}</label>
                  <select
                    required
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 appearance-none"
                    value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  >
                    <option value="truck">{t('vehicles.truck')}</option>
                    <option value="van">{t('vehicles.van')}</option>
                    <option value="rail">{t('vehicles.rail')}</option>
                    <option value="ship">{t('vehicles.ship')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{t('shipments.distance')}</label>
                  <input
                    type="number" required min="1"
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    value={formData.distanceKm || ''} 
                    onChange={(e) => setFormData({...formData, distanceKm: e.target.value === '' ? '' : parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={formLoading} className="bg-primary hover:bg-emerald-400 text-dark px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50">
                  {formLoading ? t('shipments.creating') : t('shipments.create_button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;
