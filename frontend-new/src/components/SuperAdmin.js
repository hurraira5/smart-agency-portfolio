import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaStore, FaCog, FaUsers, FaChartPie, FaPalette, FaTag, 
  FaPowerOff, FaCopy, FaMapMarkerAlt, FaUtensils, 
  FaPlus, FaTrash, FaTicketAlt, FaImage, FaChevronRight, FaTimes, FaGlobe
} from 'react-icons/fa';

const SuperAdmin = () => {
  // --- States ---
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState({ total: 0, count: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('branch');
  
  // Data States
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [masterAreas, setMasterAreas] = useState([]); 
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [vouchers, setVouchers] = useState([]);
  
  // Form States
  const [newVoucher, setNewVoucher] = useState({ code: '', discount: '', min: '' });
  const [newCat, setNewCat] = useState('');
  const [menuData, setMenuData] = useState({ name: '', price: '', category: '', description: '', image_url: '' });
  const [newBrandData, setNewBrandData] = useState({ name: '' });
  const [newBranchData, setNewBranchData] = useState({
    restaurant_id: '', branch_name: '', manager_email: '', password: '', plan: 'Monthly'
  });

  const [config, setConfig] = useState({
    theme_color: '#b3001b', is_cod_enabled: true, is_online_enabled: false,
    delivery_fee: 0, tax_percentage: 0, status: 'active', discount_global: 0
  });

  const navigate = useNavigate();

  // --- Functions ---
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
      setRestaurants(res.data || []);
      const masterAreaRes = await axios.get("https://smart-agency-api.vercel.app/api/delivery-areas/master").catch(() => ({ data: [] }));
      setMasterAreas(masterAreaRes.data || []);
    } catch (err) { console.log("Fetch error"); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setConfig({ ...branch });
    try {
      axios.get(`https://smart-agency-api.vercel.app/api/orders/${branch.id}`).then(res => {
        const orders = res.data || [];
        setAnalytics({ total: orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0), count: orders.length });
      });
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branch.id}/delivery-areas`).then(res => setDeliveryAreas(res.data || []));
      axios.get(`https://smart-agency-api.vercel.app/api/menu/${branch.id}`).then(res => setMenuItems(res.data || []));
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branch.id}/categories`).then(res => setCategories(res.data || []));
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branch.id}/vouchers`).then(res => setVouchers(res.data || []));
    } catch (err) { console.error(err); }
  };

  const handleCreateBrand = async () => {
    await axios.post("https://smart-agency-api.vercel.app/api/restaurants", newBrandData);
    alert("Brand Created!"); setShowModal(false); fetchData();
  };

  const handleCreateBranch = async () => {
    await axios.post("https://smart-agency-api.vercel.app/api/branches", newBranchData);
    alert("Branch Created!"); setShowModal(false); fetchData();
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-left overflow-hidden relative">
      
      {/* 1. Sidebar */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-30">
        <div className="p-8">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-red-200">S</div>
             <h1 className="text-xl font-black text-gray-800 tracking-tighter">SMART PANEL</h1>
           </div>
        </div>

        <div className="px-6 space-y-4 overflow-y-auto flex-grow">
           <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none" 
              onChange={(e) => {
                const r = restaurants.find(res => res.id == e.target.value);
                if(r) { setSelectedRest(r); axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${r.id}/branches`).then(res => setBranches(res.data)); }
              }}>
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
      <div className="flex-grow overflow-y-auto p-10">
        {/* Absolute Buttons */}
        <div className="absolute top-10 right-10 flex gap-4">
          <button onClick={() => { setModalType('brand'); setShowModal(true); }} className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">+ New Brand</button>
          <button onClick={() => { setModalType('branch'); setShowModal(true); }} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">+ New Branch</button>
        </div>

        {selectedBranch ? (
          <div className="max-w-6xl mx-auto space-y-10">
            <h1 className="text-4xl font-black text-gray-800 uppercase italic">{selectedBranch.branch_name}</h1>
            
            <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100 w-fit">
               {['dashboard', 'config', 'delivery', 'menu', 'vouchers'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} 
                   className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}>
                   {tab}
                 </button>
               ))}
            </div>

            {/* Dashboard Stats */}
            {activeTab === 'dashboard' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase">Total Sales</p>
                     <h2 className="text-4xl font-black text-gray-800 mt-2">Rs. {analytics.total.toLocaleString()}</h2>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase">Orders</p>
                     <h2 className="text-4xl font-black text-gray-800 mt-2">{analytics.count}</h2>
                  </div>
               </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <FaStore className="text-9xl mb-4" />
            <h2 className="text-2xl font-black uppercase">Select a Branch</h2>
          </div>
        )}
      </div>

      {/* 3. Modal System */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-400"><FaTimes /></button>
            <h3 className="text-2xl font-black text-gray-800 mb-8 uppercase italic">{modalType === 'brand' ? 'Create Brand' : 'Onboard Branch'}</h3>
            
            {modalType === 'brand' ? (
              <div className="space-y-4">
                <input type="text" placeholder="Brand Name" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" onChange={(e) => setNewBrandData({name: e.target.value})} />
                <button onClick={handleCreateBrand} className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest">Register Brand</button>
              </div>
            ) : (
              <div className="space-y-4">
                <select className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" onChange={(e) => setNewBranchData({...newBranchData, restaurant_id: e.target.value})}>
                  <option value="">-- Select Parent Brand --</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <input type="text" placeholder="Branch Name" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" onChange={(e) => setNewBranchData({...newBranchData, branch_name: e.target.value})} />
                <input type="email" placeholder="Manager Email" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" onChange={(e) => setNewBranchData({...newBranchData, manager_email: e.target.value})} />
                <input type="password" placeholder="Password" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" onChange={(e) => setNewBranchData({...newBranchData, password: e.target.value})} />
                <button onClick={handleCreateBranch} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest">Create Branch</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;