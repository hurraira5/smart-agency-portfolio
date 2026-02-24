import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaStore, FaChartPie, FaUtensils, FaChevronRight, FaTimes, 
  FaSync, FaCheckCircle, FaTrash, FaMapMarkerAlt, FaPlus, FaPowerOff 
} from 'react-icons/fa';

const SuperAdmin = () => {
  // --- Core States ---
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  
  // --- Manager Resource States ---
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('brand');

  const API_BASE = "https://smart-agency-api.vercel.app/api";

  // --- Initial Data (Brands) ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/restaurants`);
      setRestaurants(res.data || []);
    } catch (err) { console.error("Initial Fetch Error", err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  // --- Fetch Everything for a Branch (Super Power) ---
  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    try {
      // Multiple requests aik saath (Orders, Menu, Delivery)
      const [orderRes, menuRes, areaRes] = await Promise.all([
        axios.get(`${API_BASE}/orders/${branch.id}`),
        axios.get(`${API_BASE}/menu/${branch.id}`),
        axios.get(`${API_BASE}/branches/${branch.id}/delivery-areas`)
      ]);

      setOrders(orderRes.data || []);
      setMenuItems(menuRes.data || []);
      setDeliveryAreas(areaRes.data || []);

      // Update Analytics
      const total = (orderRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      setAnalytics({ total, count: (orderRes.data || []).length });
    } catch (err) { console.error("Branch Data Error", err); }
    setLoading(false);
  };

  // --- MANAGER FUNCTIONS (Now in SuperAdmin) ---
  
  // 1. Order Status Update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/orders/${orderId}`, { status: newStatus });
      handleSelectBranch(selectedBranch); // Refresh
    } catch (err) { alert("Status update failed!"); }
  };

  // 2. Menu Availability Toggle
  const toggleMenuAvailability = async (itemId, currentStatus) => {
    try {
      await axios.put(`${API_BASE}/menu/toggle/${itemId}`, { is_available: !currentStatus });
      handleSelectBranch(selectedBranch); // Refresh
    } catch (err) { alert("Menu update failed!"); }
  };

  // 3. Delete Branch (Strictly Super Admin Only)
  const deleteBranch = async (id) => {
    if(window.confirm("Bhai, pakka branch khatam karni hai?")) {
      try {
        await axios.delete(`${API_BASE}/branches/${id}`);
        fetchInitialData();
        setSelectedBranch(null);
      } catch (err) { alert("Delete failed!"); }
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-left overflow-hidden">
      
      {/* 1. SIDEBAR (Brand & Branch Selection) */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-30">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-red-200">S</div>
          <h1 className="text-xl font-black text-gray-800 tracking-tighter">SMART PANEL</h1>
        </div>

        <div className="px-6 space-y-4 overflow-y-auto flex-grow">
          <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" 
            onChange={(e) => {
              const r = restaurants.find(res => res.id == e.target.value);
              if(r) axios.get(`${API_BASE}/restaurants/${r.id}/branches`).then(res => setBranches(res.data));
            }}>
            <option value="">-- Select Brand --</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <div className="mt-8 space-y-2">
            {branches.map(b => (
              <button key={b.id} onClick={() => handleSelectBranch(b)} 
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${selectedBranch?.id === b.id ? 'bg-red-600 text-white shadow-xl' : 'bg-white text-gray-600 border border-gray-50 hover:border-red-200'}`}>
                <span className="font-black text-xs uppercase">{b.branch_name}</span>
                <FaChevronRight className="text-xs" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-grow overflow-y-auto p-10 relative">
        
        {selectedBranch ? (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header with Branch Name & Delete */}
            <div className="flex justify-between items-center">
              <h1 className="text-5xl font-black text-gray-800 uppercase italic tracking-tighter">{selectedBranch.branch_name}</h1>
              <button onClick={() => deleteBranch(selectedBranch.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><FaTrash /></button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100 w-fit">
               {['dashboard', 'orders', 'menu', 'delivery'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} 
                   className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                   {tab}
                 </button>
               ))}
            </div>

            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</p>
                     <h2 className="text-4xl font-black text-gray-800 mt-2 italic text-green-600">Rs. {analytics.total.toLocaleString()}</h2>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                     <h2 className="text-4xl font-black text-gray-800 mt-2 italic text-blue-600">{analytics.count}</h2>
                  </div>
               </div>
            )}

            {/* TAB: ORDERS (Manager Functionality) */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-[2.5rem] flex items-center justify-between border border-gray-50 shadow-sm">
                    <div>
                      <h4 className="font-black text-lg text-gray-800 uppercase">#{order.id.toString().slice(-5)} - {order.customer_name}</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total: Rs. {order.total_amount}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-gray-100 border-none p-3 rounded-xl font-black text-[10px] uppercase outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: MENU (Manager Functionality) */}
            {activeTab === 'menu' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-gray-50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-xl text-gray-800 uppercase italic tracking-tighter leading-none mb-2">{item.name}</h4>
                      <p className="text-red-600 font-black text-sm mb-6 uppercase tracking-widest">Rs. {item.price}</p>
                    </div>
                    <button 
                      onClick={() => toggleMenuAvailability(item.id, item.is_available)}
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${item.is_available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                    >
                      {item.is_available ? 'Available' : 'Sold Out'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: DELIVERY (Manager Functionality) */}
            {activeTab === 'delivery' && (
              <div className="bg-white p-10 rounded-[3rem] border border-gray-50">
                <h3 className="font-black text-xl mb-6 uppercase italic">Active Delivery Areas</h3>
                <div className="flex flex-wrap gap-3">
                  {deliveryAreas.map(area => (
                    <div key={area.id} className="px-6 py-3 bg-gray-50 rounded-full font-bold text-gray-600 flex items-center gap-3 text-sm border border-gray-100">
                      <FaMapMarkerAlt className="text-red-600" /> {area.area_name}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <FaStore size={150} />
            <h2 className="text-3xl font-black uppercase tracking-tighter mt-4 italic">Station Selection Required</h2>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdmin;