import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaStore, FaChartPie, FaUtensils, FaChevronRight, FaTimes, FaSync, 
  FaPlus, FaTrash, FaMapMarkerAlt, FaTicketAlt, FaTag, FaCheckCircle
} from 'react-icons/fa';

const SuperAdmin = () => {
  // --- States ---
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState({ total: 0, count: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('branch');
  const [loading, setLoading] = useState(false);

  // Data States
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [vouchers, setVouchers] = useState([]);
  const [orders, setOrders] = useState([]);

  const API_BASE = "https://smart-agency-api.vercel.app/api";

  // Form States
  const [newBrandData, setNewBrandData] = useState({ name: '' });
  const [newBranchData, setNewBranchData] = useState({
    restaurant_id: '', branch_name: '', manager_email: '', password: '', plan: 'Monthly'
  });

  // --- Fetch Initial Data ---
  const fetchInitialData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/restaurants`);
      setRestaurants(res.data || []);
    } catch (err) { console.log("Fetch error"); }
  }, []);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  // Handle Brand Change (Dropdown)
  const handleBrandChange = async (restaurantId) => {
    if (!restaurantId) {
      setBranches([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/restaurants/${restaurantId}/branches`);
      setBranches(res.data || []);
      setNewBranchData(prev => ({ ...prev, restaurant_id: restaurantId })); // Modal ke liye auto-select
    } catch (err) { console.error("Branches load fail"); }
  };

  // Handle Branch Selection
  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    try {
      const [orderRes, areaRes, menuRes, catRes, vouchRes] = await Promise.all([
        axios.get(`${API_BASE}/orders/${branch.id}`),
        axios.get(`${API_BASE}/branches/${branch.id}/delivery-areas`),
        axios.get(`${API_BASE}/menu/${branch.id}`),
        axios.get(`${API_BASE}/branches/${branch.id}/categories`),
        axios.get(`${API_BASE}/branches/${branch.id}/vouchers`)
      ]);

      setOrders(orderRes.data || []);
      setDeliveryAreas(areaRes.data || []);
      setMenuItems(menuRes.data || []);
      setCategories(catRes.data || []);
      setVouchers(vouchRes.data || []);
      
      const total = (orderRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      setAnalytics({ total, count: (orderRes.data || []).length });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // --- Manager Functions ---
  const updateOrderStatus = async (id, status) => {
    await axios.put(`${API_BASE}/orders/${id}`, { status });
    handleSelectBranch(selectedBranch);
  };

  // --- Creation Functions ---
  const handleCreateBrand = async () => {
    try {
      await axios.post(`${API_BASE}/restaurants`, newBrandData);
      alert("Brand Created!"); 
      setShowModal(false); 
      setNewBrandData({ name: '' });
      fetchInitialData(); // Dropdown foran update ho jayega
    } catch (err) { alert("Error creating brand!"); }
  };

  const handleCreateBranch = async () => {
    try {
      await axios.post(`${API_BASE}/branches`, newBranchData);
      alert("Branch Created!"); 
      setShowModal(false); 
      handleBrandChange(newBranchData.restaurant_id); // Branch list foran update hogi
    } catch (err) { alert("Error creating branch!"); }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-left overflow-hidden relative">
      
      {/* 1. Sidebar */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-30">
        <div className="p-8 font-black text-xl italic tracking-tighter text-red-600">SMART PANEL</div>
        <div className="px-6 space-y-4 overflow-y-auto flex-grow">
          <select 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none" 
            onChange={(e) => handleBrandChange(e.target.value)}
          >
            <option value="">-- Choose Brand --</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="mt-8 space-y-2">
            {branches.map(b => (
              <button key={b.id} onClick={() => handleSelectBranch(b)} 
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${selectedBranch?.id === b.id ? 'bg-red-600 text-white shadow-xl' : 'bg-white text-gray-600 border border-gray-50'}`}>
                <span className="font-black text-sm uppercase">{b.branch_name}</span>
                <FaChevronRight className="text-xs" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-grow overflow-y-auto p-10 relative">
        <div className="absolute top-10 right-10 flex gap-4">
          <button onClick={() => { setModalType('brand'); setShowModal(true); }} className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform">+ New Brand</button>
          <button onClick={() => { setModalType('branch'); setShowModal(true); }} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform">+ New Branch</button>
        </div>

        {selectedBranch ? (
          <div className="max-w-6xl mx-auto space-y-10">
            <h1 className="text-5xl font-black text-gray-800 uppercase italic tracking-tighter">{selectedBranch.branch_name}</h1>
            
            <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100 w-fit">
               {['dashboard', 'orders', 'menu', 'vouchers', 'delivery'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} 
                   className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}>
                   {tab}
                 </button>
               ))}
            </div>

            {/* TAB Content (Aapka logic bilkul wahi hai) */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</p>
                  <h2 className="text-4xl font-black text-gray-800 mt-2 italic">Rs. {analytics.total.toLocaleString()}</h2>
                </div>
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p>
                  <h2 className="text-4xl font-black text-gray-800 mt-2 italic">{analytics.count}</h2>
                </div>
              </div>
            )}

            {/* Baaki tabs bhi active rahenge... */}

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 animate-pulse">
            <FaStore size={120} />
            <h2 className="text-2xl font-black uppercase mt-4 italic">Select a Station</h2>
          </div>
        )}
      </div>

      {/* 3. Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-600 transition-all"><FaTimes /></button>
            <h3 className="text-2xl font-black text-gray-800 mb-8 uppercase italic">{modalType === 'brand' ? 'Register Brand' : 'Onboard Branch'}</h3>
            <div className="space-y-4">
              {modalType === 'brand' ? (
                <>
                  <input type="text" placeholder="Brand Name" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-red-600" onChange={(e) => setNewBrandData({name: e.target.value})} />
                  <button onClick={handleCreateBrand} className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest">Register Brand</button>
                </>
              ) : (
                <>
                  <select 
                    className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-red-600" 
                    value={newBranchData.restaurant_id}
                    onChange={(e) => setNewBranchData({...newBranchData, restaurant_id: e.target.value})}
                  >
                    <option value="">-- Parent Brand --</option>
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <input type="text" placeholder="Branch Name" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-red-600" onChange={(e) => setNewBranchData({...newBranchData, branch_name: e.target.value})} />
                  <input type="email" placeholder="Manager Email" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-red-600" onChange={(e) => setNewBranchData({...newBranchData, manager_email: e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-red-600" onChange={(e) => setNewBranchData({...newBranchData, password: e.target.value})} />
                  <button onClick={handleCreateBranch} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest">Onboard Branch</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;