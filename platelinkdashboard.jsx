import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Droplet, Layers, AlertTriangle, MapPin, Plus, Send, Bell, 
  Truck, UserPlus, TrendingUp, X, CheckSquare, Search, Clock, Loader2, Info 
} from 'lucide-react';

// --- Mock Data ---
const MOCK_INVENTORY = [
  { id: 'p1', hospital: 'City General Hospital', bloodType: 'A+', quantity: 10, expiry: '2025-11-07', lat: 34.0522, lon: -118.2437 },
  { id: 'p2', hospital: 'City General Hospital', bloodType: 'O-', quantity: 5, expiry: '2025-11-09', lat: 34.0522, lon: -118.2437 },
  { id: 'p3', hospital: 'St. Mary\'s Medical', bloodType: 'B+', quantity: 8, expiry: '2025-11-12', lat: 34.0612, lon: -118.2545 },
  { id: 'p4', hospital: 'Suburban Clinic', bloodType: 'AB-', quantity: 2, expiry: '2025-11-06', lat: 34.1520, lon: -118.3430 },
  { id: 'p5', hospital: 'City General Hospital', bloodType: 'A-', quantity: 7, expiry: '2025-11-10', lat: 34.0522, lon: -118.2437 },
  { id: 'p6', hospital: 'St. Mary\'s Medical', bloodType: 'O+', quantity: 15, expiry: '2025-11-08', lat: 34.0612, lon: -118.2545 },
];

const MOCK_USAGE_DATA = [15, 20, 18, 25, 22, 30, 28]; // Last 7 days
const MOCK_DEMAND_REGIONS = [
  { name: 'North', level: 'high' },
  { name: 'East', level: 'medium' },
  { name: 'South', level: 'low' },
  { name: 'West', level: 'critical' },
];

// --- Helper Functions ---
const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getExpiryStatus = (days) => {
  if (days <= 0) return 'critical'; // Changed to 0 or less for critical
  if (days <= 3) return 'warning';
  return 'stable';
};

const getStatusClasses = (status) => {
  switch (status) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: AlertTriangle,
        iconClasses: 'text-red-500'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: AlertTriangle,
        iconClasses: 'text-yellow-500'
      };
    default:
      return {
        bg: 'bg-emerald-50', // Changed to emerald for more medical feel
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckSquare,
        iconClasses: 'text-emerald-500'
      };
  }
};

// --- React Components ---

/**
 * Main Application Component
 */
export default function App() {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmergencyRequestModal, setShowEmergencyRequestModal] = useState(false);
  const [showTransferRequestModal, setShowTransferRequestModal] = useState(false);
  const [selectedTransferUnit, setSelectedTransferUnit] = useState(null);
  const [showAlertDonorsModal, setShowAlertDonorsModal] = useState(false);


  const analytics = useMemo(() => {
    const totalUnits = inventory.reduce((acc, unit) => acc + unit.quantity, 0);
    
    const expiringSoon = inventory
      .filter(unit => getDaysUntilExpiry(unit.expiry) <= 1)
      .reduce((acc, unit) => acc + unit.quantity, 0);
      
    const totalHospitals = new Set(inventory.map(unit => unit.hospital)).size;
    
    const wastageReduction = 15; // Assuming 15%
    
    return { totalUnits, expiringSoon, totalHospitals, wastageReduction };
  }, [inventory]);

  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: `p${Date.now()}-${Math.floor(Math.random() * 1000)}`, // More unique ID
      lat: 34.0522,
      lon: -118.2437,
      hospital: 'City General Hospital'
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const handleRequestTransfer = (unit) => {
    setSelectedTransferUnit(unit);
    setShowTransferRequestModal(true);
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 font-inter text-gray-800">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onEmergencyRequest={() => setShowEmergencyRequestModal(true)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          {currentPage === 'dashboard' && <DashboardView analytics={analytics} />}
          {currentPage === 'inventory' && (
            <InventoryView 
              inventory={inventory} 
              onShowAddModal={() => setShowAddModal(true)}
              onRequestTransfer={handleRequestTransfer}
            />
          )}
          {currentPage === 'donors' && (
            <DonorView 
              onAlertDonors={() => setShowAlertDonorsModal(true)}
            />
          )}
          {currentPage === 'logistics' && <LogisticsView />}
        </main>
      </div>

      {showAddModal && (
        <AddInventoryModal 
          onClose={() => setShowAddModal(false)} 
          onAddItem={addInventoryItem}
        />
      )}
      {showEmergencyRequestModal && (
        <ConfirmationModal
          title="Emergency Transfer Request"
          message="Are you sure you want to initiate an emergency platelet transfer request across the network?"
          confirmText="Send Request"
          onConfirm={() => {
            alert('Emergency request sent!'); // Mock action
            setShowEmergencyRequestModal(false);
          }}
          onCancel={() => setShowEmergencyRequestModal(false)}
        />
      )}
      {showTransferRequestModal && selectedTransferUnit && (
        <ConfirmationModal
          title="Confirm Platelet Transfer"
          message={`Request ${selectedTransferUnit.quantity} units of ${selectedTransferUnit.bloodType} from ${selectedTransferUnit.hospital}?`}
          confirmText="Confirm Request"
          onConfirm={() => {
            alert(`Transfer request for ${selectedTransferUnit.bloodType} sent!`); // Mock action
            setShowTransferRequestModal(false);
            setSelectedTransferUnit(null);
          }}
          onCancel={() => {
            setShowTransferRequestModal(false);
            setSelectedTransferUnit(null);
          }}
        />
      )}
      {showAlertDonorsModal && (
        <ConfirmationModal
          title="Alert Donors in Your Area"
          message="Send a push notification to registered donors in your vicinity about low A+ platelet supply?"
          confirmText="Send Alert"
          onConfirm={() => {
            alert('Donor alert sent!'); // Mock action
            setShowAlertDonorsModal(false);
          }}
          onCancel={() => setShowAlertDonorsModal(false)}
        />
      )}
    </div>
  );
}

/**
 * Header Component
 */
function Header({ currentPage }) {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Analytics Dashboard';
      case 'inventory':
        return 'Inventory Network';
      case 'donors':
        return 'Donor Management';
      case 'logistics':
        return 'Logistics & Tracking';
      default:
        return 'PlateLink Dashboard';
    }
  };

  return (
    <header className="flex items-center justify-between p-4 px-8 bg-white/90 backdrop-blur-sm shadow-md border-b border-gray-100">
      <h1 className="text-3xl font-bold text-teal-700">{getPageTitle()}</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors">
          <Bell size={20} />
        </button>
        <div className="flex items-center space-x-2 bg-gray-50 rounded-full pr-3 py-1">
          <img
            src="https://placehold.co/40x40/0284c7/e0f2f7?text=SC"
            alt="User Avatar"
            className="rounded-full w-10 h-10 border-2 border-teal-400"
          />
          <div className="hidden md:block">
            <div className="font-medium text-gray-700">Dr. Sarah Connor</div>
            <div className="text-sm text-gray-500">City General Hospital</div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Sidebar Navigation Component
 */
function Sidebar({ currentPage, setCurrentPage, onEmergencyRequest }) {
  const navItems = [
    { name: 'dashboard', label: 'Dashboard', icon: BarChart },
    { name: 'inventory', label: 'Inventory', icon: Layers },
    { name: 'donors', label: 'Donors', icon: UserPlus },
    { name: 'logistics', label: 'Logistics', icon: Truck },
  ];

  return (
    <nav className="flex flex-col w-64 bg-gradient-to-b from-teal-700 to-cyan-800 text-white shadow-lg relative z-10">
      <div className="flex items-center justify-center p-6 border-b border-teal-600">
        <Droplet className="text-white" size={32} />
        <span className="ml-2 text-2xl font-extrabold">PlateLink</span>
      </div>
      <ul className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <li key={item.name}>
            <button
              onClick={() => setCurrentPage(item.name)}
              className={`flex items-center w-full p-3 rounded-lg text-left transition-all duration-200
                ${currentPage === item.name 
                  ? 'bg-white bg-opacity-10 text-white font-semibold border-l-4 border-cyan-300 shadow-inner' 
                  : 'text-teal-100 hover:bg-white hover:bg-opacity-5 hover:text-white'
                }`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-teal-600">
        <div className="p-4 bg-red-700 bg-opacity-30 rounded-lg text-center border border-red-600 backdrop-blur-sm">
          <p className="text-sm font-medium text-red-100 mb-2">Critical Shortage?</p>
          <button 
            onClick={onEmergencyRequest}
            className="w-full bg-red-600 text-white p-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Request Emergency Transfer
          </button>
        </div>
      </div>
    </nav>
  );
}

/**
 * Dashboard View
 */
function DashboardView({ analytics }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Total Units Available"
          value={analytics.totalUnits}
          icon={Layers}
          iconColor="text-teal-600"
          bgColor="bg-teal-50"
        />
        <AnalyticsCard 
          title="Units Expiring Today"
          value={analytics.expiringSoon}
          icon={AlertTriangle}
          iconColor="text-red-500"
          bgColor="bg-red-50"
        />
        <AnalyticsCard 
          title="Partner Hospitals"
          value={analytics.totalHospitals}
          icon={MapPin}
          iconColor="text-blue-500"
          bgColor="bg-blue-50"
        />
        <AnalyticsCard 
          title="Wastage Reduction"
          value={`${analytics.wastageReduction}%`}
          icon={TrendingUp}
          iconColor="text-purple-500"
          bgColor="bg-purple-50"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage Trends (Last 7 Days)</h3>
          <UsageTrendsChart data={MOCK_USAGE_DATA} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Demand Hotspots</h3>
          <DemandHotspotsChart data={MOCK_DEMAND_REGIONS} />
        </div>
      </div>
    </div>
  );
}

/**
 * Mock Bar Chart for Usage Trends
 */
function UsageTrendsChart({ data }) {
  const max = Math.max(...data);
  const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <MockChartPlaceholder />;

  return (
    <div className="h-64 flex flex-col justify-end p-2 border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden">
      <div className="absolute top-2 left-2 right-2 flex justify-between text-xs text-gray-500">
        <span>Max: {max}</span>
        <span>Avg: {(data.reduce((a,b)=>a+b,0)/data.length).toFixed(0)}</span>
      </div>
      <div className="flex items-end h-full">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full justify-end px-1">
            <div 
              className="w-full bg-gradient-to-t from-teal-400 to-cyan-500 rounded-t-sm transition-all duration-700 ease-out transform hover:scale-y-105" 
              style={{ height: `${(value / max) * 100}%` }}
              title={`${labels[index]}: ${value} units`}
            ></div>
            <span className="text-xs text-gray-600 mt-1">{labels[index].replace('Day ', 'D')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mock Grid Chart for Demand Hotspots
 */
function DemandHotspotsChart({ data }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <MockChartPlaceholder />;

  const getDemandColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-400';
      case 'medium': return 'bg-yellow-300';
      case 'low': return 'bg-emerald-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="h-64 grid grid-cols-2 grid-rows-2 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      {data.map((region, index) => (
        <div 
          key={index} 
          className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-sm transition-all duration-300 ease-out 
                      ${getDemandColor(region.level)} text-white hover:scale-105 hover:shadow-md cursor-pointer`}
        >
          <MapPin size={24} className="mb-2" />
          <span className="font-semibold text-lg">{region.name}</span>
          <span className="text-sm opacity-90 capitalize">{region.level} Demand</span>
        </div>
      ))}
    </div>
  );
}


/**
 * Mock Chart Placeholder
 */
function MockChartPlaceholder() {
  return (
    <div className="h-64 bg-gray-50 flex flex-col items-center justify-center rounded-lg border border-gray-200 animate-pulse">
      <Loader2 size={32} className="text-gray-400 animate-spin" />
      <p className="text-gray-500 mt-3 text-sm">Loading data...</p>
    </div>
  );
}


/**
 * Analytics Card Component
 */
function AnalyticsCard({ title, value, icon: Icon, iconColor, bgColor }) {
  return (
    <div className={`relative p-6 rounded-xl shadow-md border border-gray-100 overflow-hidden ${bgColor} flex items-center justify-between transition-shadow hover:shadow-lg hover:scale-[1.02] duration-200`}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 100% 0%, ${iconColor.replace('text-', '')}33, transparent 70%)` }}></div>
      <div className="relative z-10">
        <div className="text-sm font-medium text-gray-600 uppercase mb-1">{title}</div>
        <div className="text-4xl font-extrabold text-gray-800">{value}</div>
      </div>
      <div className={`p-4 rounded-full ${bgColor} bg-opacity-70 border border-gray-200`}>
        <Icon size={32} className={iconColor} />
      </div>
    </div>
  );
}

/**
 * Inventory View
 */
function InventoryView({ inventory, onShowAddModal, onRequestTransfer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredInventory = useMemo(() => {
    return inventory
      .map(unit => ({
        ...unit,
        daysToExpiry: getDaysUntilExpiry(unit.expiry),
      }))
      .filter(unit => {
        const matchesSearch = 
          unit.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesFilter = filterType === 'all' || 
          (filterType === 'expiring' && unit.daysToExpiry <= 3) ||
          (filterType === 'my_hospital' && unit.hospital === 'City General Hospital');

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [inventory, searchTerm, filterType]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-semibold text-gray-800">Shared Inventory Network</h2>
        <button
          onClick={onShowAddModal}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={18} className="mr-2" />
          Add New Batch
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by hospital, blood type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by:</label>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors bg-white"
          >
            <option value="all">All Inventory</option>
            <option value="expiring">Expiring Soon</option>
            <option value="my_hospital">My Hospital's Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredInventory.length > 0 ? (
            filteredInventory.map(unit => (
              <InventoryItem key={unit.id} unit={unit} onRequestTransfer={onRequestTransfer} />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center py-12">
              <Info size={32} className="text-gray-300 mb-4" />
              <p className="text-lg">No inventory found matching your criteria.</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or adding a new batch.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inventory Item Component
 */
function InventoryItem({ unit, onRequestTransfer }) {
  const days = unit.daysToExpiry;
  const status = getExpiryStatus(days);
  const { bg, text, border, icon: StatusIcon, iconClasses } = getStatusClasses(status);

  let expiryText;
  if (days < 0) expiryText = 'Expired';
  else if (days === 0) expiryText = 'Expires Today';
  else if (days === 1) expiryText = 'Expires Tomorrow';
  else expiryText = `Expires in ${days} days`;

  return (
    <div className={`p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between ${bg} transition-all duration-150 hover:bg-opacity-80 hover:shadow-sm`}>
      <div className="flex items-start mb-3 lg:mb-0 flex-grow">
        <div className={`mr-4 p-3 rounded-full ${bg} border ${border} flex-shrink-0`}>
          <Droplet size={24} className={text} />
        </div>
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-baseline">
            <span className="font-bold text-2xl text-gray-800 mr-3">{unit.bloodType}</span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 mt-1 sm:mt-0">
              {unit.quantity} Units
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-2 flex items-center">
            <MapPin size={14} className="inline mr-1.5 flex-shrink-0" />
            {unit.hospital}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 flex-shrink-0">
        <div className="text-left lg:text-right">
          <div className={`flex items-center justify-start lg:justify-end font-semibold ${text}`}>
            <StatusIcon size={16} className={`mr-1.5 ${iconClasses} flex-shrink-0`} />
            {expiryText}
          </div>
          <div className="text-sm text-gray-500 mt-1 flex items-center justify-start lg:justify-end">
            <Clock size={14} className="inline mr-1.5 flex-shrink-0" />
            {new Date(unit.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button 
          onClick={() => onRequestTransfer(unit)}
          className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold shadow-md text-sm hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:-translate-y-0.5"
        >
          <Send size={16} className="mr-2" />
          Request Transfer
        </button>
      </div>
    </div>
  );
}

/**
 * Add Inventory Modal
 */
function AddInventoryModal({ onClose, onAddItem }) {
  const [bloodType, setBloodType] = useState('A+');
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expiry || quantity < 1) {
      alert('Please fill out all fields correctly.'); 
      return;
    }
    onAddItem({ bloodType, quantity: parseInt(quantity, 10), expiry });
    onClose();
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-semibold text-gray-800">Add New Platelet Batch</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <select
              id="bloodType"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors bg-white"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity (Units)</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              id="expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              min={today}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 mr-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all"
            >
              Add Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Confirmation Modal Component
 */
function ConfirmationModal({ title, message, confirmText, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-100 text-center">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder View for Donors
 */
function DonorView({ onAlertDonors }) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-800">Donor Integration</h2>
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <p className="text-gray-600 mb-4">
          This section will integrate with the donor registry. Based on real-time inventory levels, 
          the system can send targeted alerts to registered donors in areas with low supply.
        </p>
        <button 
          onClick={onAlertDonors}
          className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-red-700 transition-all transform hover:-translate-y-0.5"
        >
          <Bell size={18} className="mr-2" />
          Alert Nearby Donors (A+)
        </button>
        <div className="h-64 bg-gray-50 flex items-center justify-center rounded-lg mt-6 border border-gray-200">
          <p className="text-gray-500">[Mock Dashboard: Donor Activity Map / Stats]</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder View for Logistics
 */
function LogisticsView() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-800">Logistics & Tracking</h2>
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <p className="text-gray-600 mb-4">
          This section will track active transfers. It can integrate with GPS and temperature sensors 
          to ensure chain-of-custody and compliance during transport.
        </p>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 mt-4">
          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-semibold text-gray-800">Transfer #T-1024</span>
              <span className="text-sm text-gray-500 ml-2">(O- Unit)</span>
            </div>
            <div className="text-gray-600 text-sm my-2 sm:my-0">From: St. Mary's | To: Suburban Clinic</div>
            <div className="flex items-center text-teal-600 font-medium">
              <Truck size={18} className="mr-2 animate-pulse" />
              In Transit... (37°F)
            </div>
          </div>
          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:bg-gray-50 transition-colors">
            <div>
              <span className="font-semibold text-gray-800">Transfer #T-1023</span>
              <span className="text-sm text-gray-500 ml-2">(B+ Unit)</span>
            </div>
            <div className="text-gray-600 text-sm my-2 sm:my-0">From: City General | To: St. Mary's</div>
            <div className="flex items-center text-emerald-600 font-medium">
              <CheckSquare size={18} className="mr-2" />
              Delivered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
