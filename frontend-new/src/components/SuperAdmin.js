import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { 
  FaStore, FaChevronRight, FaTimes, FaPlus, FaTrash, FaUtensils, 
  FaTicketAlt, FaTruck, FaSignOutAlt, FaEdit, FaPowerOff, FaUserShield, FaLock, FaEnvelope
} from 'react-icons/fa';

const SuperAdmin = () => {
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
  const [vouchers, setVouchers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  

  // URL bilkul exact yehi honi chahiye
  const API_BASE = "https://smart-agency-backend.vercel.app/api";

  // Form States
  const [newBrandData, setNewBrandData] = useState({ name: '', admin_email: '', admin_password: '' });
  const [newBranchData, setNewBranchData] = useState({
    restaurant_id: '', branch_name: '', manager_email: '', password: '', plan: 'Monthly'
  });

  // --- 1. LIVE PUSHER INTEGRATION ---
  useEffect(() => {
    const pusher = new Pusher('bcac1c75483080b47786', { cluster: 'mt1' });
    const channel = pusher.subscribe('orders-channel');
    channel.bind('new-order', (data) => {
      if (selectedBranch && data.branch_id === selectedBranch.id) {
        handleSelectBranch(selectedBranch);
      }
    });
    return () => pusher.unsubscribe('orders-channel');
  }, [selectedBranch]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = 'https://smart-agency-food-frontend-new.vercel.app/login';
  };

  const fetchInitialData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/restaurants`);
      setRestaurants(res.data || []);
    } catch (err) { console.log("Fetch error"); }
  }, []);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleBrandChange = async (restaurantId) => {
    setSelectedBranch(null); 
    if (!restaurantId) return setBranches([]);
    try {
      const res = await axios.get(`${API_BASE}/restaurants/${restaurantId}/branches`);
      setBranches(res.data || []);
      setNewBranchData(prev => ({ ...prev, restaurant_id: restaurantId }));
    } catch (err) { console.error("Branches load fail"); }
  };

  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    try {
      const [orderRes, menuRes, vouchRes] = await Promise.all([
        axios.get(`${API_BASE}/orders/${branch.id}`).catch(() => ({data: []})),
        axios.get(`${API_BASE}/menu/${branch.id}`).catch(() => ({data: []})),
        axios.get(`${API_BASE}/branches/${branch.id}/vouchers`).catch(() => ({data: []}))
      ]);
      setOrders(orderRes.data || []);
      setMenuItems(menuRes.data || []);
      setVouchers(vouchRes.data || []);
      const total = (orderRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      setAnalytics({ total, count: (orderRes.data || []).length });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // --- ACTIONS: EDIT, DELETE, STATUS, RESET ---
  const handleEditBranchName = async (id) => {
    const newName = prompt("Naya Branch Name likhein:");
    if(newName) {
      await axios.put(`${API_BASE}/branches/${id}`, { branch_name: newName });
      handleBrandChange(newBranchData.restaurant_id);
    }
  };

  const toggleBranchStatus = async (branchId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await axios.put(`${API_BASE}/branches/${branchId}/status`, { status: newStatus });
      alert(`Branch status is now: ${newStatus.toUpperCase()}`);
      handleBrandChange(newBranchData.restaurant_id);
    } catch (err) { alert("Status update failed"); }
  };

  const deleteBranch = async (id) => {
    if(window.confirm("Bhai, kya aap waqayi ye branch delete karna chahte hain?")) {
      await axios.delete(`${API_BASE}/branches/${id}`);
      handleBrandChange(newBranchData.restaurant_id);
    }
  };

  const updateCredentials = async (type, id) => {
    const newEmail = prompt(`Naya Email likhein (${type.toUpperCase()}):`);
    const newPass = prompt(`Naya Password likhein (${type.toUpperCase()}):`);
    if(newEmail && newPass) {
      await axios.put(`${API_BASE}/auth/reset-credentials`, { type, id, email: newEmail, password: newPass });
      alert("Credentials updated successfully! ✅");
      if(type === 'manager') handleSelectBranch({...selectedBranch, manager_email: newEmail});
    }
  };

  const handleCreateBrand = async () => {
    if(!newBrandData.name) return alert("Pura form bharein!");
    try {
      await axios.post(`${API_BASE}/restaurants`, newBrandData);
      alert("Brand & Boss Admin created! 🔥");
      setShowModal(false);
      fetchInitialData();
    } catch (err) { alert("Error creating brand!"); }
  };

  const handleCreateBranch = async () => {
    try {
      await axios.post(`${API_BASE}/branches`, newBranchData);
      alert("Branch & Manager onboarded! 🚀");
      setShowModal(false);
      handleBrandChange(newBranchData.restaurant_id);
    } catch (err) { alert("Error creating branch!"); }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-left overflow-hidden">
      
      {/* 1. Sidebar */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-30">
        <div className="p-8 font-black text-xl italic tracking-tighter text-red-600">SUPER ADMIN CONSOLE</div>
        <div className="px-6 space-y-4 overflow-y-auto flex-grow">
          <label className="text-[10px] font-bold text-gray-400 uppercase px-2">Select Brand</label>
          <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none" onChange={(e) => handleBrandChange(e.target.value)}>
            <option value="">-- Choose Brand --</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <div className="mt-8 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase px-2">Branches</label>
            {branches.map(b => (
              <div key={b.id} className="relative group">
                <button onClick={() => handleSelectBranch(b)} className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${selectedBranch?.id === b.id ? 'bg-red-600 text-white shadow-xl' : 'bg-white text-gray-600 border border-gray-50'}`}>
                  <span className={`font-black text-sm uppercase ${b.status === 'disabled' ? 'line-through opacity-50' : ''}`}>{b.branch_name}</span>
                  <FaChevronRight className="text-xs" />
                </button>
                <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                   <button onClick={() => handleEditBranchName(b.id)} className="p-2 bg-gray-800 text-white rounded-lg text-[8px]"><FaEdit /></button>
                   <button onClick={() => toggleBranchStatus(b.id, b.status)} className="p-2 bg-black text-white rounded-lg text-[8px]"><FaPowerOff /></button>
                   <button onClick={() => deleteBranch(b.id)} className="p-2 bg-red-500 text-white rounded-lg text-[8px]"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-grow overflow-y-auto p-10 relative">
        <div className="flex justify-end gap-4 mb-10">
          <button onClick={() => { setModalType('brand'); setShowModal(true); }} className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">+ Register Restaurant</button>
          <button onClick={() => { setModalType('branch'); setShowModal(true); }} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">+ Add Branch</button>
          <button onClick={handleLogout} className="bg-white text-red-600 border-2 border-red-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"><FaSignOutAlt /> Logout</button>
        </div>

        {selectedBranch ? (
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3">
                      <p className="text-red-600 font-bold text-sm uppercase tracking-widest">Active Station</p>
                      {selectedBranch.status === 'disabled' && <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-1 rounded-md uppercase">Ordering Stopped</span>}
                    </div>
                    <h1 className="text-6xl font-black text-gray-800 uppercase italic tracking-tighter">{selectedBranch.branch_name}</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => updateCredentials('boss', selectedBranch.restaurant_id)} className="bg-black text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 shadow-lg"><FaUserShield /> Reset Boss Access</button>
                    <button onClick={() => updateCredentials('manager', selectedBranch.id)} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 shadow-lg"><FaLock /> Reset Manager Access</button>
                </div>
            </div>
            
            <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 w-fit">
               {['dashboard', 'orders', 'menu', 'vouchers'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                   {tab}
                 </button>
               ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                            <h2 className="text-4xl font-black text-gray-800 mt-2 italic text-red-600">Rs. {analytics.total.toLocaleString()}</h2>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders Handled</p>
                            <h2 className="text-4xl font-black text-gray-800 mt-2 italic">{analytics.count}</h2>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Menu</p>
                            <h2 className="text-4xl font-black text-gray-800 mt-2 italic">{menuItems.length}</h2>
                        </div>
                    </div>
                )}

                {activeTab === 'vouchers' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {vouchers.map(v => (
                            <div key={v.id} className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                                <FaTicketAlt className="text-red-600 mb-4 text-2xl"/>
                                <h4 className="font-black text-xl text-gray-800 uppercase">{v.code}</h4>
                                <p className="text-red-600 font-black text-sm">{v.discount_amount} OFF</p>
                            </div>
                        ))}
                        {vouchers.length === 0 && <p className="text-gray-400 font-bold col-span-3 text-center py-10 italic">No vouchers active.</p>}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50">
                                    <th className="pb-4 px-4">Customer</th>
                                    <th className="pb-4">Total</th>
                                    <th className="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-bold text-gray-600">
                                {orders.map(o => (
                                    <tr key={o.id} className="border-b border-gray-50">
                                        <td className="py-6 px-4">{o.customer_name}</td>
                                        <td className="py-6 text-red-600 font-black italic">Rs. {o.total_amount}</td>
                                        <td className="py-6"><span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] uppercase font-black">{o.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <FaStore size={150} />
            <h2 className="text-4xl font-black uppercase mt-4 italic tracking-tighter">Select a Branch</h2>
          </div>
        )}
      </div>

      {/* 3. Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-gray-400 hover:text-red-600 transition-all text-xl"><FaTimes /></button>
            <h3 className="text-3xl font-black text-gray-800 mb-10 uppercase italic tracking-tighter">
                {modalType === 'brand' ? 'Register New Brand' : 'Onboard New Branch'}
            </h3>
            <div className="space-y-4">
              {modalType === 'brand' ? (
                <>
                  <input type="text" placeholder="Brand Name (e.g. KFC)" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600" onChange={(e) => setNewBrandData({...newBrandData, name: e.target.value})} />
                  <input type="email" placeholder="Boss/Admin Email" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600" onChange={(e) => setNewBrandData({...newBrandData, admin_email: e.target.value})} />
                  <input type="password" placeholder="Boss Password" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600" onChange={(e) => setNewBrandData({...newBrandData, admin_password: e.target.value})} />
                  <button onClick={handleCreateBrand} className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Register Brand & Boss</button>
                </>
              ) : (
                <>
                  <select className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600" value={newBranchData.restaurant_id} onChange={(e) => setNewBranchData({...newBranchData, restaurant_id: e.target.value})}>
                    <option value="">-- Select Parent Brand --</option>
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <input type="text" placeholder="Branch Name" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600" onChange={(e) => setNewBranchData({...newBranchData, branch_name: e.target.value})} />
                  <input type="email" placeholder="Manager Email" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600" onChange={(e) => setNewBranchData({...newBranchData, manager_email: e.target.value})} />
                  <input type="password" placeholder="Manager Password" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600" onChange={(e) => setNewBranchData({...newBranchData, password: e.target.value})} />
                  <button onClick={handleCreateBranch} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase shadow-xl">Confirm & Onboard</button>
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