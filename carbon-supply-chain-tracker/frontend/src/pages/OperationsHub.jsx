import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { 
  Plus, Search, Download, Box, Truck, BarChart3, 
  MapPin, Calendar, TrendingUp, Leaf, Activity,
  ChevronRight, Info, X, Filter, Trash2, Edit2, Train, Ship as ShipIcon,
  LayoutDashboard, Zap, User as UserIcon
} from 'lucide-react';

const VEHICLE_DATA = {
  truck: { label: 'Truck', icon: Truck, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  mini_truck: { label: 'Mini Truck', icon: Truck, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  van: { label: 'Van', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  pickup: { label: 'Pickup', icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  bike: { label: 'Bike', icon: Activity, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  electric_van: { label: 'Electric Van', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  rail: { label: 'Rail', icon: Train, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ship: { label: 'Ship', icon: ShipIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  air_cargo: { label: 'Air Cargo', icon: Activity, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  container_truck: { label: 'Container Truck', icon: Box, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  refrigerated_truck: { label: 'Refrigerated Truck', icon: Box, color: 'text-blue-300', bg: 'bg-blue-300/10' },
  ev_truck: { label: 'EV Truck', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
};

const FUEL_TYPES = ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid', 'Marine Fuel', 'Aviation Fuel'];

const OperationsHub = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState('');

  const VEHICLE_DATA = {
    truck: { label: t('vehicles.truck'), icon: Truck, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    mini_truck: { label: t('vehicles.mini_truck'), icon: Truck, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    van: { label: t('vehicles.van'), icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    pickup: { label: t('vehicles.pickup'), icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    bike: { label: t('vehicles.bike'), icon: Activity, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    electric_van: { label: t('vehicles.electric_van'), icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    rail: { label: t('vehicles.rail'), icon: Train, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ship: { label: t('vehicles.ship'), icon: ShipIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    air_cargo: { label: t('vehicles.air_cargo'), icon: Activity, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    container_truck: { label: t('vehicles.container_truck'), icon: Box, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    refrigerated_truck: { label: t('vehicles.refrigerated_truck'), icon: Box, color: 'text-blue-300', bg: 'bg-blue-300/10' },
    ev_truck: { label: t('vehicles.ev_truck'), icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  };

  const FUEL_TYPES = [
    t('operations.fuel_diesel') || 'Diesel', 
    t('operations.fuel_petrol') || 'Petrol', 
    t('operations.fuel_cng') || 'CNG', 
    t('operations.fuel_electric') || 'Electric', 
    t('operations.fuel_hybrid') || 'Hybrid', 
    t('operations.fuel_marine') || 'Marine Fuel', 
    t('operations.fuel_aviation') || 'Aviation Fuel'
  ];
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({ 
    productName: '', sku: '', quantity: '0', warehouseLocation: '', category: '' 
  });
  const [shipmentFormData, setShipmentFormData] = useState({
    inventoryId: '', originCity: '', destinationCity: '', distanceKm: '', vehicleType: 'truck',
    vehicleNumber: '', vehicleModel: '', fuelType: 'Diesel', loadCapacity: '', 
    averageMileage: '', emissionFactor: '', driverName: '', transportCompany: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, invRes, shipRes] = await Promise.all([
        api.get('/operations/summary'),
        api.get('/inventory'),
        api.get('/shipments')
      ]);
      setSummary(sumRes.data.data);
      setInventory(invRes.data.data || []);
      setShipments(shipRes.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/inventory', {
        ...productFormData,
        quantity: parseFloat(productFormData.quantity)
      });
      await fetchData();
      setIsProductModalOpen(false);
      setProductFormData({ productName: '', sku: '', quantity: '0', warehouseLocation: '', category: '' });
    } catch (err) {
      alert(t('operations.save_error') || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleShipmentSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...shipmentFormData,
        distanceKm: parseFloat(shipmentFormData.distanceKm),
        loadCapacity: shipmentFormData.loadCapacity ? parseFloat(shipmentFormData.loadCapacity) : undefined,
        averageMileage: shipmentFormData.averageMileage ? parseFloat(shipmentFormData.averageMileage) : undefined,
        emissionFactor: shipmentFormData.emissionFactor ? parseFloat(shipmentFormData.emissionFactor) : undefined,
      };
      
      await api.post('/shipments', payload);
      await fetchData();
      setIsShipmentModalOpen(false);
      setShipmentFormData({
        inventoryId: '', originCity: '', destinationCity: '', distanceKm: '', vehicleType: 'truck',
        vehicleNumber: '', vehicleModel: '', fuelType: 'Diesel', loadCapacity: '', 
        averageMileage: '', emissionFactor: '', driverName: '', transportCompany: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || t('shipments.create_error'));
    } finally {
      setFormLoading(false);
    }
  };

  const exportCSV = (type) => {
    const data = type === 'inventory' ? inventory : shipments;
    if (data.length === 0) return;
    
    const headers = type === 'inventory' 
      ? [t('operations.product_name'), t('operations.sku'), t('operations.quantity'), t('operations.warehouse_location'), t('operations.category')]
      : [t('dashboard.origin'), t('dashboard.destination'), t('operations.vehicle_type'), t('operations.vehicle_number'), t('operations.fuel_type'), t('operations.distance'), t('dashboard.carbon_emissions'), t('dashboard.status'), 'Date'];
      
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const row = type === 'inventory'
        ? [item.productName, item.sku, item.quantity, item.warehouseLocation, item.category]
        : [
            item.origin, item.destination, item.vehicleType, item.vehicleNumber, 
            item.fuelType, item.distanceKm, item.carbonEmissionKg, item.status, 
            new Date(item.createdAt).toLocaleDateString()
          ];
      csvRows.push(row.map(v => `"${v}"`).join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStockBadge = (quantity) => {
    if (quantity === 0) return <Badge type="error">{t('common.out_of_stock')}</Badge>;
    if (quantity < 50) return <Badge type="warning">{t('common.low_stock')}</Badge>;
    return <Badge type="success">{t('common.in_stock')}</Badge>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered': return <Badge type="success">{t('common.delivered')}</Badge>;
      case 'in_transit': return <Badge type="warning">{t('common.in_transit')}</Badge>;
      case 'cancelled': return <Badge type="error">{t('common.cancelled')}</Badge>;
      default: return <Badge type="info">{t('common.pending')}</Badge>;
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.productName?.toLowerCase().includes(search.toLowerCase()) ||
    item.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredShipments = shipments.filter(item => 
    item.origin?.toLowerCase().includes(search.toLowerCase()) ||
    item.destination?.toLowerCase().includes(search.toLowerCase()) ||
    item.vehicleType?.toLowerCase().includes(search.toLowerCase()) ||
    item.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !summary) return <LoadingSpinner message={t('operations.loading')} />;

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-primary w-10 h-10" />
            {t('operations.title')}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">{t('operations.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all border border-slate-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('operations.add_product')}
          </button>
          <button 
            onClick={() => setIsShipmentModalOpen(true)}
            className="bg-primary hover:bg-emerald-400 text-dark px-5 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
          >
            <Truck className="w-5 h-5" />
            {t('operations.create_shipment')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('operations.total_products')} value={summary?.totalProducts || 0} icon={Box} color="primary" />
        <StatCard title={t('operations.total_shipments')} value={summary?.totalShipments || 0} icon={Truck} color="blue" />
        <StatCard title={t('operations.total_distance')} value={`${Math.round(summary?.totalDistance || 0)} km`} icon={MapPin} color="purple" />
        <StatCard title={t('operations.total_emissions')} value={`${Math.round(summary?.totalEmission || 0)} kg`} icon={Leaf} color="orange" />
        <StatCard title={t('operations.total_savings')} value={`${Math.round(summary?.totalSavings || 0)} kg`} icon={TrendingUp} color="emerald" />
        <StatCard title={t('operations.avg_emission')} value={`${Math.round(summary?.avgEmission || 0)} kg/ship`} icon={Activity} color="cyan" />
        <StatCard title={t('operations.most_used_vehicle')} value={summary?.mostUsedVehicle ? (t(`vehicles.${summary.mostUsedVehicle}`) || summary.mostUsedVehicle) : 'N/A'} icon={BarChart3} color="indigo" uppercase />
        <StatCard title={t('operations.last_shipment')} value={summary?.lastShipmentDate ? new Date(summary.lastShipmentDate).toLocaleDateString() : 'N/A'} icon={Calendar} color="slate" />
      </div>

      {/* Main Content Area */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
        {/* Tabs & Search */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40">
          <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-primary text-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Box className="w-4 h-4" />
              {t('operations.inventory_records')}
            </button>
            <button 
              onClick={() => setActiveTab('shipments')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'shipments' ? 'bg-primary text-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Truck className="w-4 h-4" />
              {t('operations.shipment_records')}
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={t('operations.search_placeholder', { tab: activeTab === 'inventory' ? t('sidebar.inventory') : t('sidebar.shipments') })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <button 
              onClick={() => exportCSV(activeTab)}
              className="p-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-primary/30 transition-all"
              title={t('operations.export_csv')}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-0">
          {activeTab === 'inventory' ? (
            <InventoryTable t={t} data={filteredInventory} getStockBadge={getStockBadge} />
          ) : (
            <ShipmentTable t={t} VEHICLE_DATA={VEHICLE_DATA} data={filteredShipments} getStatusBadge={getStatusBadge} />
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <Modal title={t('operations.add_new_product')} onClose={() => setIsProductModalOpen(false)}>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <FormField label={t('operations.product_name')} required value={productFormData.productName} onChange={(v) => setProductFormData({...productFormData, productName: v})} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('operations.sku')} required value={productFormData.sku} onChange={(v) => setProductFormData({...productFormData, sku: v})} />
              <FormField label={t('operations.quantity')} type="number" required value={productFormData.quantity} onChange={(v) => setProductFormData({...productFormData, quantity: v})} />
            </div>
            <FormField label={t('operations.warehouse_location')} required value={productFormData.warehouseLocation} onChange={(v) => setProductFormData({...productFormData, warehouseLocation: v})} />
            <FormField label={t('operations.category')} value={productFormData.category} onChange={(v) => setProductFormData({...productFormData, category: v})} />
            <div className="pt-6 flex gap-3">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">{t('common.cancel')}</button>
              <button type="submit" disabled={formLoading} className="flex-1 bg-primary hover:bg-emerald-400 text-dark py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                {formLoading ? t('common.saving') : t('operations.save_product')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Shipment Modal */}
      {isShipmentModalOpen && (
        <Modal title={t('operations.create_new_shipment')} onClose={() => setIsShipmentModalOpen(false)} wide>
          <form onSubmit={handleShipmentSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Route & Product Section */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white border-l-4 border-primary pl-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {t('operations.route_product_details')}
                </h4>
                <div className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-400">{t('operations.select_product')}</label>
                    <select 
                      required
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                      value={shipmentFormData.inventoryId}
                      onChange={(e) => setShipmentFormData({...shipmentFormData, inventoryId: e.target.value})}
                    >
                      <option value="">{t('operations.choose_product')}</option>
                      {inventory.map(item => (
                        <option key={item._id} value={item._id} disabled={item.quantity === 0}>
                          {item.productName} ({item.quantity} {t('operations.available') || 'available'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t('operations.origin_city')} required value={shipmentFormData.originCity} onChange={(v) => setShipmentFormData({...shipmentFormData, originCity: v})} />
                    <FormField label={t('operations.dest_city')} required value={shipmentFormData.destinationCity} onChange={(v) => setShipmentFormData({...shipmentFormData, destinationCity: v})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t('operations.distance')} type="number" required value={shipmentFormData.distanceKm} onChange={(v) => setShipmentFormData({...shipmentFormData, distanceKm: v})} />
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-400">{t('operations.vehicle_type')}</label>
                      <select 
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 capitalize"
                        value={shipmentFormData.vehicleType}
                        onChange={(e) => setShipmentFormData({...shipmentFormData, vehicleType: e.target.value})}
                      >
                        {Object.keys(VEHICLE_DATA).map(key => (
                          <option key={key} value={key}>{VEHICLE_DATA[key].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Vehicle Details Section */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white border-l-4 border-orange-400 pl-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-400" />
                  {t('operations.manual_profiling')}
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
                  <FormField label={t('operations.vehicle_number')} placeholder="e.g. MH-12-AB-1234" value={shipmentFormData.vehicleNumber} onChange={(v) => setShipmentFormData({...shipmentFormData, vehicleNumber: v})} />
                  <FormField label={t('operations.vehicle_model')} placeholder="e.g. Tata Signa 5530" value={shipmentFormData.vehicleModel} onChange={(v) => setShipmentFormData({...shipmentFormData, vehicleModel: v})} />
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-400">{t('operations.fuel_type')}</label>
                    <select 
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                      value={shipmentFormData.fuelType}
                      onChange={(e) => setShipmentFormData({...shipmentFormData, fuelType: e.target.value})}
                    >
                      {FUEL_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <FormField label={t('operations.load_capacity')} type="number" value={shipmentFormData.loadCapacity} onChange={(v) => setShipmentFormData({...shipmentFormData, loadCapacity: v})} />
                  
                  <FormField label={t('operations.avg_mileage')} type="number" value={shipmentFormData.averageMileage} onChange={(v) => setShipmentFormData({...shipmentFormData, averageMileage: v})} />
                  <FormField label={t('operations.emission_factor')} type="number" value={shipmentFormData.emissionFactor} onChange={(v) => setShipmentFormData({...shipmentFormData, emissionFactor: v})} />
                  
                  <FormField label={t('operations.driver_name')} value={shipmentFormData.driverName} onChange={(v) => setShipmentFormData({...shipmentFormData, driverName: v})} />
                  <FormField label={t('operations.transport_company')} value={shipmentFormData.transportCompany} onChange={(v) => setShipmentFormData({...shipmentFormData, transportCompany: v})} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-primary/10 p-4 rounded-xl border border-primary/20">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: t('operations.emission_factor_hint') }}></p>
            </div>

            <button type="submit" disabled={formLoading} className="w-full bg-primary hover:bg-emerald-400 text-dark py-4 rounded-2xl font-bold text-xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {formLoading ? <LoadingSpinner size="sm" /> : <><Plus className="w-6 h-6" /> {t('operations.create_and_track')}</>}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({ title, value, icon: Icon, color, uppercase }) => {
  const colors = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    slate: 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-slate-600 group-hover:text-primary transition-colors">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className={`text-2xl font-bold text-white mt-1 ${uppercase ? 'capitalize' : ''}`}>{value}</h3>
      </div>
    </div>
  );
};

const InventoryTable = ({ t, data, getStockBadge }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-800/40 text-slate-500 uppercase text-xs font-bold tracking-widest border-y border-white/5">
        <tr>
          <th className="px-6 py-4">{t('operations.product_details')}</th>
          <th className="px-6 py-4">{t('operations.sku')}</th>
          <th className="px-6 py-4">{t('operations.stock_level')}</th>
          <th className="px-6 py-4">{t('operations.location')}</th>
          <th className="px-6 py-4 text-right">{t('operations.status')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {data.length === 0 ? (
          <tr><td colSpan="5" className="py-20"><EmptyState title={t('operations.no_items')} description={t('operations.no_items_desc')} /></td></tr>
        ) : data.map(item => (
          <tr key={item._id} className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary border border-white/5">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white">{item.productName}</div>
                  <div className="text-xs text-slate-500">{item.category || t('operations.standard')}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-5 font-mono text-xs text-slate-400">{item.sku}</td>
            <td className="px-6 py-5 text-white font-semibold">{item.quantity} {t('operations.units') || 'units'}</td>
            <td className="px-6 py-5 text-slate-400 text-sm">{item.warehouseLocation}</td>
            <td className="px-6 py-5 text-right">{getStockBadge(item.quantity)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ShipmentTable = ({ t, VEHICLE_DATA, data, getStatusBadge }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-800/40 text-slate-500 uppercase text-xs font-bold tracking-widest border-y border-white/5">
        <tr>
          <th className="px-6 py-4">{t('operations.route_info')}</th>
          <th className="px-6 py-4">{t('operations.vehicle_details')}</th>
          <th className="px-6 py-4">{t('operations.energy_fuel')}</th>
          <th className="px-6 py-4">{t('operations.sustainability')}</th>
          <th className="px-6 py-4 text-right">{t('operations.status')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {data.length === 0 ? (
          <tr><td colSpan="5" className="py-20"><EmptyState title={t('operations.no_shipments')} description={t('operations.no_shipments_desc')} /></td></tr>
        ) : data.map(ship => (
          <tr key={ship._id} className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-5">
              <div className="flex flex-col">
                <span className="font-bold text-white flex items-center gap-2">
                  {ship.origin} <ArrowRight className="w-3 h-3 text-primary" /> {ship.destination}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {ship.distanceKm} km
                </span>
              </div>
            </td>
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${VEHICLE_DATA[ship.vehicleType]?.bg || 'bg-slate-800'}`}>
                  {React.createElement(VEHICLE_DATA[ship.vehicleType]?.icon || Truck, { className: `w-4 h-4 ${VEHICLE_DATA[ship.vehicleType]?.color || 'text-slate-400'}` })}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold capitalize">{t(`vehicles.${ship.vehicleType}`) || ship.vehicleType?.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{ship.vehicleNumber || t('operations.no_id') || 'No ID'}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-5">
              <div className="flex flex-col">
                <span className="text-slate-300 text-sm font-medium">{t(`operations.fuel_${ship.fuelType?.toLowerCase()}`) || ship.fuelType}</span>
                <span className="text-[10px] text-slate-500 italic">{ship.vehicleModel || 'Model N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-5">
              <div className="flex flex-col">
                <span className="text-orange-400 font-bold">{Math.round(ship.carbonEmissionKg)} kg CO2</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> {t('optimization.savings')} {Math.round(ship.savingsKg)} kg
                </span>
              </div>
            </td>
            <td className="px-6 py-5 text-right">{getStatusBadge(ship.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
    <div className={`glass-card rounded-[32px] w-full ${wide ? 'max-w-4xl' : 'max-w-md'} p-8 relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] overflow-y-auto`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500"></div>
      <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
        <X className="w-6 h-6" />
      </button>
      <h3 className="text-2xl font-extrabold text-white mb-8 flex items-center gap-3">
        <div className="w-2 h-8 bg-primary rounded-full"></div>
        {title}
      </h3>
      {children}
    </div>
  </div>
);

const FormField = ({ label, type = 'text', required, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-400">{label}</label>
    <input
      type={type} required={required} placeholder={placeholder}
      className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default OperationsHub;
