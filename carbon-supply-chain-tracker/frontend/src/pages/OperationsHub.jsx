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
  LayoutDashboard
} from 'lucide-react';

const VEHICLE_DATA = {
  truck: {
    label: 'Truck',
    icon: Truck,
    fuelType: 'Diesel',
    model: 'Tata Signa 5530',
    capacity: '30 Tons',
    emission: '0.12 kg/km',
    bestFor: 'Medium / Long Distance',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10'
  },
  van: {
    label: 'Van',
    icon: Activity,
    fuelType: 'Petrol / EV',
    model: 'Mahindra Supro',
    capacity: '1 Ton',
    emission: '0.08 kg/km',
    bestFor: 'Last Mile Delivery',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  rail: {
    label: 'Rail',
    icon: Train,
    fuelType: 'Electric / Diesel',
    model: 'Freight Rail Wagon',
    capacity: '60+ Tons',
    emission: '0.03 kg/km',
    bestFor: 'Bulk / Very Long Distance',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  ship: {
    label: 'Ship',
    icon: ShipIcon,
    fuelType: 'Marine Fuel',
    model: 'Cargo Vessel',
    capacity: '5000+ Tons',
    emission: '0.01 kg/km',
    bestFor: 'International / Massive Bulk',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10'
  }
};

const OperationsHub = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({ 
    productName: '', sku: '', quantity: 0, warehouseLocation: '', category: '' 
  });
  const [shipmentFormData, setShipmentFormData] = useState({
    inventoryId: '', originCity: '', destinationCity: '', distanceKm: '', vehicleType: 'truck'
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
      await api.post('/inventory', productFormData);
      await fetchData();
      setIsProductModalOpen(false);
      setProductFormData({ productName: '', sku: '', quantity: 0, warehouseLocation: '', category: '' });
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleShipmentSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const vehicleDetails = VEHICLE_DATA[shipmentFormData.vehicleType];
      await api.post('/shipments', { ...shipmentFormData, vehicleDetails });
      await fetchData();
      setIsShipmentModalOpen(false);
      setShipmentFormData({ inventoryId: '', originCity: '', destinationCity: '', distanceKm: '', vehicleType: 'truck' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setFormLoading(false);
    }
  };

  const exportCSV = (type) => {
    const data = type === 'inventory' ? inventory : shipments;
    if (data.length === 0) return;
    
    const headers = type === 'inventory' 
      ? ['Product Name', 'SKU', 'Quantity', 'Warehouse', 'Category']
      : ['Origin', 'Destination', 'Vehicle', 'Distance (km)', 'Emission (kg)', 'Status', 'Date'];
      
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const row = type === 'inventory'
        ? [item.productName, item.sku, item.quantity, item.warehouseLocation, item.category]
        : [item.origin, item.destination, item.vehicleType, item.distanceKm, item.carbonEmissionKg, item.status, new Date(item.createdAt).toLocaleDateString()];
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
    if (quantity === 0) return <Badge type="error">Out of Stock</Badge>;
    if (quantity < 50) return <Badge type="warning">Low Stock</Badge>;
    return <Badge type="success">In Stock</Badge>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered': return <Badge type="success">Delivered</Badge>;
      case 'in_transit': return <Badge type="warning">In Transit</Badge>;
      case 'cancelled': return <Badge type="error">Cancelled</Badge>;
      default: return <Badge type="info">Pending</Badge>;
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.productName?.toLowerCase().includes(search.toLowerCase()) ||
    item.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredShipments = shipments.filter(item => 
    item.origin?.toLowerCase().includes(search.toLowerCase()) ||
    item.destination?.toLowerCase().includes(search.toLowerCase()) ||
    item.vehicleType?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !summary) return <LoadingSpinner message="Loading Operations Hub..." />;

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-primary w-10 h-10" />
            Operations Hub
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Manage inventory, create shipments, and track cumulative sustainability impact.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all border border-slate-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
          <button 
            onClick={() => setIsShipmentModalOpen(true)}
            className="bg-primary hover:bg-emerald-400 text-dark px-5 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
          >
            <Truck className="w-5 h-5" />
            Create Shipment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={summary?.totalProducts || 0} icon={Box} color="primary" />
        <StatCard title="Total Shipments" value={summary?.totalShipments || 0} icon={Truck} color="blue" />
        <StatCard title="Total Distance" value={`${Math.round(summary?.totalDistance || 0)} km`} icon={MapPin} color="purple" />
        <StatCard title="Total Emissions" value={`${Math.round(summary?.totalEmission || 0)} kg`} icon={Leaf} color="orange" />
        <StatCard title="Total CO2 Saved" value={`${Math.round(summary?.totalSavings || 0)} kg`} icon={TrendingUp} color="emerald" />
        <StatCard title="Avg Emission" value={`${Math.round(summary?.avgEmission || 0)} kg/ship`} icon={Activity} color="cyan" />
        <StatCard title="Most Used Vehicle" value={summary?.mostUsedVehicle || 'N/A'} icon={BarChart3} color="indigo" uppercase />
        <StatCard title="Last Shipment" value={summary?.lastShipmentDate ? new Date(summary.lastShipmentDate).toLocaleDateString() : 'N/A'} icon={Calendar} color="slate" />
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
              Inventory Records
            </button>
            <button 
              onClick={() => setActiveTab('shipments')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'shipments' ? 'bg-primary text-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Truck className="w-4 h-4" />
              Shipment Records
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <button 
              onClick={() => exportCSV(activeTab)}
              className="p-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-primary/30 transition-all"
              title="Export CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-0">
          {activeTab === 'inventory' ? (
            <InventoryTable data={filteredInventory} getStockBadge={getStockBadge} />
          ) : (
            <ShipmentTable data={filteredShipments} getStatusBadge={getStatusBadge} />
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <Modal title="Add New Product" onClose={() => setIsProductModalOpen(false)}>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <FormField label="Product Name" required value={productFormData.productName} onChange={(v) => setProductFormData({...productFormData, productName: v})} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SKU" required value={productFormData.sku} onChange={(v) => setProductFormData({...productFormData, sku: v})} />
              <FormField label="Quantity" type="number" required value={productFormData.quantity} onChange={(v) => setProductFormData({...productFormData, quantity: v})} />
            </div>
            <FormField label="Warehouse Location" required value={productFormData.warehouseLocation} onChange={(v) => setProductFormData({...productFormData, warehouseLocation: v})} />
            <FormField label="Category" value={productFormData.category} onChange={(v) => setProductFormData({...productFormData, category: v})} />
            <div className="pt-6 flex gap-3">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">Cancel</button>
              <button type="submit" disabled={formLoading} className="flex-1 bg-primary hover:bg-emerald-400 text-dark py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                {formLoading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Shipment Modal */}
      {isShipmentModalOpen && (
        <Modal title="Create New Shipment" onClose={() => setIsShipmentModalOpen(false)} wide>
          <form onSubmit={handleShipmentSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-400">Select Product</label>
                <select 
                  required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                  value={shipmentFormData.inventoryId}
                  onChange={(e) => setShipmentFormData({...shipmentFormData, inventoryId: e.target.value})}
                >
                  <option value="">Choose a product...</option>
                  {inventory.map(item => (
                    <option key={item._id} value={item._id} disabled={item.quantity === 0}>
                      {item.productName} ({item.quantity} available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Origin City" required value={shipmentFormData.originCity} onChange={(v) => setShipmentFormData({...shipmentFormData, originCity: v})} />
                <FormField label="Destination City" required value={shipmentFormData.destinationCity} onChange={(v) => setShipmentFormData({...shipmentFormData, destinationCity: v})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Distance (km)" type="number" required value={shipmentFormData.distanceKm} onChange={(v) => setShipmentFormData({...shipmentFormData, distanceKm: v})} />
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-400">Vehicle Type</label>
                  <select 
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                    value={shipmentFormData.vehicleType}
                    onChange={(e) => setShipmentFormData({...shipmentFormData, vehicleType: e.target.value})}
                  >
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="rail">Rail</option>
                    <option value="ship">Ship</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={formLoading} className="w-full bg-primary hover:bg-emerald-400 text-dark py-4 rounded-xl font-bold text-lg mt-4 transition-all shadow-xl disabled:opacity-50">
                {formLoading ? 'Creating...' : 'Create Shipment'}
              </button>
            </div>

            {/* Vehicle Details Panel */}
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 rounded-2xl ${VEHICLE_DATA[shipmentFormData.vehicleType].bg}`}>
                    {React.createElement(VEHICLE_DATA[shipmentFormData.vehicleType].icon, { className: `w-8 h-8 ${VEHICLE_DATA[shipmentFormData.vehicleType].color}` })}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white capitalize">{shipmentFormData.vehicleType} Details</h4>
                    <p className="text-slate-400 text-sm">Automated transport profiling</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <DetailRow label="Model" value={VEHICLE_DATA[shipmentFormData.vehicleType].model} />
                  <DetailRow label="Fuel Type" value={VEHICLE_DATA[shipmentFormData.vehicleType].fuelType} />
                  <DetailRow label="Avg Capacity" value={VEHICLE_DATA[shipmentFormData.vehicleType].capacity} />
                  <DetailRow label="Avg Emission" value={VEHICLE_DATA[shipmentFormData.vehicleType].emission} />
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Best For</p>
                    <p className="text-primary font-medium">{VEHICLE_DATA[shipmentFormData.vehicleType].bestFor}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculations are based on the standard emission factors for {shipmentFormData.vehicleType} transport. Final values may vary based on terrain and load weight.
                </p>
              </div>
            </div>
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

const InventoryTable = ({ data, getStockBadge }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-800/40 text-slate-500 uppercase text-xs font-bold tracking-widest border-y border-white/5">
        <tr>
          <th className="px-6 py-4">Product Details</th>
          <th className="px-6 py-4">SKU</th>
          <th className="px-6 py-4">Stock Level</th>
          <th className="px-6 py-4">Location</th>
          <th className="px-6 py-4 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {data.length === 0 ? (
          <tr><td colSpan="5" className="py-20"><EmptyState title="No items found" description="Adjust your search or add a new product." /></td></tr>
        ) : data.map(item => (
          <tr key={item._id} className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary border border-white/5">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white">{item.productName}</div>
                  <div className="text-xs text-slate-500">{item.category || 'Standard'}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-5 font-mono text-xs text-slate-400">{item.sku}</td>
            <td className="px-6 py-5 text-white font-semibold">{item.quantity} units</td>
            <td className="px-6 py-5 text-slate-400 text-sm">{item.warehouseLocation}</td>
            <td className="px-6 py-5 text-right">{getStockBadge(item.quantity)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ShipmentTable = ({ data, getStatusBadge }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-800/40 text-slate-500 uppercase text-xs font-bold tracking-widest border-y border-white/5">
        <tr>
          <th className="px-6 py-4">Route</th>
          <th className="px-6 py-4">Vehicle</th>
          <th className="px-6 py-4">Distance</th>
          <th className="px-6 py-4">Carbon Footprint</th>
          <th className="px-6 py-4 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {data.length === 0 ? (
          <tr><td colSpan="5" className="py-20"><EmptyState title="No shipments found" description="Create your first shipment to start tracking." /></td></tr>
        ) : data.map(ship => (
          <tr key={ship._id} className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{ship.origin}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    {ship.destination}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-5">
              <div className="flex items-center gap-2">
                {React.createElement(VEHICLE_DATA[ship.vehicleType]?.icon || Truck, { className: "w-4 h-4 text-primary" })}
                <span className="text-white capitalize">{ship.vehicleType}</span>
              </div>
            </td>
            <td className="px-6 py-5 text-slate-300 font-medium">{ship.distanceKm} km</td>
            <td className="px-6 py-5">
              <div className="flex flex-col">
                <span className="text-orange-400 font-bold">{Math.round(ship.carbonEmissionKg)} kg CO2</span>
                <span className="text-[10px] text-emerald-400">Saved {Math.round(ship.savingsKg)} kg</span>
              </div>
            </td>
            <td className="px-6 py-5 text-right">{getStatusBadge(ship.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
    <div className={`glass-card rounded-[32px] w-full ${wide ? 'max-w-4xl' : 'max-w-md'} p-8 relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden`}>
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

const FormField = ({ label, type = 'text', required, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-400">{label}</label>
    <input
      type={type} required={required}
      className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
      value={value === 0 && type === 'number' ? '0' : value || ''}
      onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
    />
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm text-white font-semibold">{value}</span>
  </div>
);

export default OperationsHub;
