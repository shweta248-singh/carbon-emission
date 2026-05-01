import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Plus, Edit2, Trash2, Search, Filter, AlertTriangle, X } from 'lucide-react';

const Inventory = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ productName: '', sku: '', quantity: 0, warehouseLocation: '', category: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data.data || []);
    } catch (err) {
      setError(t('inventory.fetch_error') || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStockBadge = (quantity) => {
    if (quantity === 0) return <Badge type="error">{t('inventory.stock_out')}</Badge>;
    if (quantity < 50) return <Badge type="warning">{t('inventory.stock_low')}</Badge>;
    return <Badge type="success">{t('inventory.stock_in')}</Badge>;
  };

  const filteredInventory = inventory.filter(item => 
    item.productName?.toLowerCase().includes(search.toLowerCase()) ||
    item.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ productName: '', sku: '', quantity: 0, warehouseLocation: '', category: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ 
      productName: item.productName || '', 
      sku: item.sku || '', 
      quantity: item.quantity || 0, 
      warehouseLocation: item.warehouseLocation || '',
      category: item.category || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      await fetchInventory();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(t('common.error') || 'Failed to save item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete') || 'Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        await fetchInventory();
      } catch (err) {
        console.error(err);
        alert(t('common.error') || 'Failed to delete item');
      }
    }
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('inventory.title')}</h1>
          <p className="text-slate-400 mt-1">{t('inventory.subtitle')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-emerald-400 text-dark px-4 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('inventory.add_product')}
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={t('inventory.search_placeholder')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message={t('common.loading')} />
        ) : filteredInventory.length === 0 ? (
          <EmptyState 
            title={search ? t('common.no_results') : t('inventory.empty')} 
            description={search ? t('common.try_adjusting') : t('inventory.empty_desc')}
            action={
              !search && (
                <button onClick={openAddModal} className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-primary/30 mt-2">
                  {t('inventory.add_first')}
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/20">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('inventory.product')}</th>
                  <th className="px-6 py-4 font-medium">{t('inventory.sku')}</th>
                  <th className="px-6 py-4 font-medium">{t('inventory.quantity')}</th>
                  <th className="px-6 py-4 font-medium">{t('inventory.warehouse')}</th>
                  <th className="px-6 py-4 font-medium">{t('dashboard.status')}</th>
                  <th className="px-6 py-4 font-medium text-right">{t('inventory.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.productName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.category || t('inventory.category_general')}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{item.sku}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{item.quantity} units</td>
                    <td className="px-6 py-4 text-slate-400">
                      {item.warehouseLocation}
                    </td>
                    <td className="px-6 py-4">
                      {getStockBadge(item.quantity)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
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
            <h3 className="text-xl font-bold text-white mb-6">
              {editingItem ? t('inventory.edit_product') : t('inventory.add_product')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">{t('inventory.product_name')}</label>
                <input
                  type="text" required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{t('inventory.sku')}</label>
                  <input
                    type="text" required
                    placeholder={t('operations.sku_placeholder', 'e.g. PROD-001')}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{t('inventory.quantity')}</label>
                  <input
                    type="number" required min="0"
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    value={formData.quantity === 0 ? '0' : formData.quantity || ''} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value === '' ? '' : parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">{t('inventory.warehouse')}</label>
                <input
                  type="text" required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  value={formData.warehouseLocation} onChange={(e) => setFormData({...formData, warehouseLocation: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">{t('inventory.category')}</label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={formLoading} className="bg-primary hover:bg-emerald-400 text-dark px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50">
                  {formLoading ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
