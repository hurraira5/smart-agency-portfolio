import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaStore, FaChevronRight, FaTimes, FaPlus, FaTrash, FaUtensils, FaTicketAlt, FaTruck
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
  const [menuItems, setMenuItems] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [orders, setOrders] = useState([]);

  const API_BASE = "https://smart-agency-api.vercel.app/api";

  // Form States
  const [newBrandData, setNewBrandData] = useState({ name: '' });
  const [newBranchData, setNewBranchData] = useState({
    restaurant_id: '', branch_name: '', manager_email: '', password: '', plan: 'Monthly'
  });

  const fetchInitialData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/restaurants`);
      setRestaurants(res.data || []);
    } catch (err) { console.log("Fetch error"); }
  }, []);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleBrandChange = async (restaurantId) => {
    setSelectedBranch(null); // Brand badalte hi purani branch selection khatam
    if (!restaurantId) {
      setBranches([]);
      return;
    }
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
      // Parallel API calls for speed
      const [orderRes, areaRes, menuRes, vouchRes] = await Promise.all([
        axios.get(`${API_BASE}/orders/${branch.id}`).catch(() => ({data: []})),
        axios.get(`${API_BASE}/branches/${branch.id}/delivery-areas`).catch(() => ({data: []})),
        axios.get(`${API_BASE}/menu/${branch.id}`).catch(() => ({data: []})),
        axios.get(`${API_BASE}/branches/${branch.id}/vouchers`).catch(() => ({data: []}))
      ]);

      setOrders(orderRes.data || []);
      setDeliveryAreas(areaRes.data || []);
      setMenuItems(menuRes.data || []);
      setVouchers(vouchRes.data || []);
      
      const total = (orderRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      setAnalytics({ total, count: (orderRes.data || []).length });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCreateBrand = async () => {
    if(!newBrandData.name) return alert("Enter brand name");
    try {
      await axios.post(`${API_BASE}/restaurants`, newBrandData);
      alert("Brand Registered!"); 
      setShowModal(false); 
      setNewBrandData({ name: '' });
      fetchInitialData(); 
    } catch (err) { alert("Error!"); }
  };

  const handleCreateBranch = async () => {
    try {
      await axios.post(`${API_BASE}/branches`, newBranchData);
      alert("Branch Onboarded!"); 
      setShowModal(false); 
      handleBrandChange(newBranchData.restaurant_id); 
    } catch (err) { alert("Check details or Email already exists!"); }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-left overflow-hidden">
      
      {/* 1. Sidebar */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-30">
        <div className="p-8 font-black text-xl italic tracking-tighter text-red-600">SMART PANEL</div>
        <div className="px-6 space-y-4 overflow-y-auto flex-grow">
          <label className="text-[10px] font-bold text-gray-400 uppercase px-2">Select Brand</label>
          <select 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none" 
            onChange={(e) => handleBrandChange(e.target.value)}
          >
            <option value="">-- Choose Brand --</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <div className="mt-8 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase px-2">Branches</label>
            {branches.length > 0 ? branches.map(b => (
              <button key={b.id} onClick={() => handleSelectBranch(b)} 
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${selectedBranch?.id === b.id ? 'bg-red-600 text-white shadow-xl' : 'bg-white text-gray-600 border border-gray-50 hover:bg-gray-50'}`}>
                <span className="font-black text-sm uppercase">{b.branch_name}</span>
                <FaChevronRight className="text-xs" />
              </button>
            )) : <p className="text-xs text-gray-400 p-4">No branches found.</p>}
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-grow overflow-y-auto p-10 relative">
        <div className="flex justify-end gap-4 mb-10">
          <button onClick={() => { setModalType('brand'); setShowModal(true); }} className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">+ Register Restaurant</button>
          <button onClick={() => { setModalType('branch'); setShowModal(true); }} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">+ Add Branch</button>
        </div>

        {selectedBranch ? (
          <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-red-600 font-bold text-sm uppercase tracking-widest">Active Station</p>
                    <h1 className="text-6xl font-black text-gray-800 uppercase italic tracking-tighter">{selectedBranch.branch_name}</h1>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-xs font-bold uppercase">Manager Access</p>
                    <p className="font-bold text-gray-700">{selectedBranch.manager_email}</p>
                </div>
            </div>
            
            <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 w-fit">
               {['dashboard', 'orders', 'menu', 'vouchers', 'delivery'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} 
                   className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                   {tab}
                 </button>
               ))}
            </div>

            {/* TAB CONTENT AREA */}
            <div className="min-h-[400px]">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-xl transition-all">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                            <h2 className="text-4xl font-black text-gray-800 mt-2 italic text-red-600">Rs. {analytics.total.toLocaleString()}</h2>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-xl transition-all">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders Handled</p>
                            <h2 className="text-4xl font-black text-gray-800 mt-2 italic">{analytics.count}</h2>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-xl transition-all">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Menu Items</p>
                            <h2 className="text-4xl font-black text-gray-800 mt-2 italic">{menuItems.length}</h2>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50">
                                    <th className="pb-4 px-4">Customer</th>
                                    <th className="pb-4">Items</th>
                                    <th className="pb-4">Total</th>
                                    <th className="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-bold text-gray-600">
                                {orders.map(o => (
                                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                                        <td className="py-6 px-4">{o.customer_name}</td>
                                        <td className="py-6">Details In JSON</td>
                                        <td className="py-6 text-red-600">Rs. {o.total_amount}</td>
                                        <td className="py-6 uppercase text-[10px]"><span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">{o.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">No orders found.</p>}
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.map(item => (
                            <div key={item.id} className="bg-white p-6 rounded-3xl flex items-center justify-between border border-gray-50 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><FaUtensils /></div>
                                    <div>
                                        <p className="font-black text-gray-800 uppercase text-sm">{item.name}</p>
                                        <p className="text-red-600 text-xs font-bold">Rs. {item.price}</p>
                                    </div>
                                </div>
                                <button className="text-gray-300 hover:text-red-600 transition-all"><FaTrash /></button>
                            </div>
                        ))}
                        {menuItems.length === 0 && <p className="text-gray-400 font-bold italic">Menu is empty.</p>}
                    </div>
                )}
                
                {activeTab === 'vouchers' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {vouchers.map(v => (
                            <div key={v.id} className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                                <FaTicketAlt className="text-red-600 mb-4 text-2xl"/>
                                <h4 className="font-black text-xl text-gray-800">{v.code}</h4>
                                <p className="text-red-600 font-black text-sm">{v.discount_percent}% OFF</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <FaStore size={150} />
            <h2 className="text-4xl font-black uppercase mt-4 italic tracking-tighter">Select a Station</h2>
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
                  <input type="text" value={newBrandData.name} placeholder="Brand Name (e.g. KFC)" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600 transition-all" onChange={(e) => setNewBrandData({name: e.target.value})} />
                  <button onClick={handleCreateBrand} className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl">Register Brand</button>
                </>
              ) : (
                <>
                  <select 
                    className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600 transition-all" 
                    value={newBranchData.restaurant_id}
                    onChange={(e) => setNewBranchData({...newBranchData, restaurant_id: e.target.value})}
                  >
                    <option value="">-- Select Parent Brand --</option>
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <input type="text" placeholder="Branch Name (e.g. DHA Phase 6)" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600 transition-all" onChange={(e) => setNewBranchData({...newBranchData, branch_name: e.target.value})} />
                  <input type="email" placeholder="Manager Email" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600 transition-all" onChange={(e) => setNewBranchData({...newBranchData, manager_email: e.target.value})} />
                  <input type="password" placeholder="System Password" className="w-full bg-gray-50 p-5 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-red-600 transition-all" onChange={(e) => setNewBranchData({...newBranchData, password: e.target.value})} />
                  <button onClick={handleCreateBranch} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">Confirm & Create</button>
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