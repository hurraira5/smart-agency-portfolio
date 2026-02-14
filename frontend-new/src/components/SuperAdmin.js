import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaCog, FaUsers, FaChartPie, FaPalette, FaTag, FaPowerOff, FaCopy, FaExternalLinkAlt, FaMapMarkerAlt, FaUtensils, FaPlus } from 'react-icons/fa';

const SuperAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({ total: 0, count: 0 });
  
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [masterAreas, setMasterAreas] = useState([]); 
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [newCat, setNewCat] = useState('');
  const [menuData, setMenuData] = useState({ name: '', price: '', category: '', description: '', image_url: '' });

  const [config, setConfig] = useState({
    theme_color: '#b3001b', is_cod_enabled: true, is_online_enabled: false,
    delivery_fee: 0, tax_percentage: 0, status: 'active', discount_global: 0
  });

  const navigate = useNavigate();

  // --- UPDATED fetchData (Safety added for 404) ---
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
      setRestaurants(res.data || []);
      
      const masterAreaRes = await axios.get("https://smart-agency-api.vercel.app/api/delivery-areas/master").catch(() => ({ data: [] }));
      setMasterAreas(masterAreaRes.data || []);
    } catch (err) {
      console.log("Initial fetch error - Check Backend");
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- UPDATED handleSelectBranch (Safety added for 404) ---
  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setConfig({
      theme_color: branch.theme_color || '#b3001b',
      is_cod_enabled: branch.is_cod_enabled ?? true,
      is_online_enabled: branch.is_online_enabled ?? false,
      delivery_fee: branch.delivery_fee || 0,
      tax_percentage: branch.tax_percentage || 0,
      status: branch.status || 'active',
      discount_global: branch.discount_global || 0
    });
    
    try {
      axios.get(`https://smart-agency-api.vercel.app/api/orders/${branch.id}`).then(res => {
        const orders = res.data || [];
        setAnalytics({ total: orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0), count: orders.length });
      }).catch(() => console.log("Orders 404"));

      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branch.id}/delivery-areas`).then(res => setDeliveryAreas(res.data || [])).catch(() => console.log("Areas 404"));
      axios.get(`https://smart-agency-api.vercel.app/api/menu/${branch.id}`).then(res => setMenuItems(res.data || [])).catch(() => console.log("Menu 404"));
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branch.id}/categories`).then(res => setCategories(res.data || [])).catch(() => console.log("Categories 404"));

    } catch (err) { console.error(err); }
  };

  const handleAddCategory = async () => {
    if (!newCat) return;
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/categories", { branch_id: selectedBranch.id, name: newCat });
      setNewCat('');
      const catRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${selectedBranch.id}/categories`);
      setCategories(catRes.data || []);
      alert("Category Created!");
    } catch (err) { alert("Category add failed - Check Database"); }
  };

  const handleUpdateAreaFee = async (areaName, fee) => {
    if(!areaName) return;
    try {
      await axios.post(`https://smart-agency-api.vercel.app/api/branches/delivery-areas/sync`, { 
        branch_id: selectedBranch.id, area_name: areaName, fee: fee 
      });
      const areaRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${selectedBranch.id}/delivery-areas`);
      setDeliveryAreas(areaRes.data || []);
    } catch (err) { alert("Area sync failed"); }
  };

  const handleSuperMenuAdd = async (e) => {
    e.preventDefault();
    if (!menuData.category) return alert("Bhai, Category pehle select ya create karo!");
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...menuData, branch_id: selectedBranch.id });
      setMenuData({ name: '', price: '', category: menuData.category, description: '', image_url: '' });
      const menuRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${selectedBranch.id}`);
      setMenuItems(menuRes.data || []);
      alert("Item Added!");
    } catch (err) { alert("Menu add failed"); }
  };

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${selectedBranch.id}/config`, config);
      alert("Configuration Saved!");
    } catch (err) { alert("Save failed"); }
    finally { setLoading(false); }
  };

  const copyShopLink = () => {
    const link = `${window.location.origin}/shop/${selectedBranch.id}`;
    navigator.clipboard.writeText(link);
    alert("Shop Link Copied!");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar: Same UI as your best code */}
      <div className="w-80 bg-white border-r flex flex-col shadow-xl z-30">
        <div className="p-8 border-b">
           <div className="text-2xl font-black text-slate-800 tracking-tighter">SMART.ADMIN</div>
           <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Enterprise Control Panel</p>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
           <select className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold outline-none" onChange={(e) => {
             const r = restaurants.find(res => res.id == e.target.value);
             if(!r) return;
             setSelectedRest(r);
             axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${r.id}/branches`).then(res => setBranches(res.data));
           }}>
             <option value="">-- Choose Brand --</option>
             {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
           </select>
           <div className="space-y-2">
             {branches.map(b => (
               <button key={b.id} onClick={() => handleSelectBranch(b)} className={`w-full p-4 rounded-2xl text-left font-black transition-all ${selectedBranch?.id === b.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                 {b.branch_name}
               </button>
             ))}
           </div>
        </div>
        <div className="p-6 border-t">
           <button onClick={() => {localStorage.clear(); navigate('/login');}} className="w-full py-3 text-red-500 font-black text-sm hover:bg-red-50 rounded-xl transition-all">SIGN OUT</button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto h-screen p-10">
        {selectedBranch ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
               <div>
                  <h1 className="text-4xl font-black text-slate-800">{selectedBranch.branch_name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                     <button onClick={copyShopLink} className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"><FaCopy/> Copy Shop URL</button>
                     <a href={`/shop/${selectedBranch.id}`} target="_blank" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-800"><FaExternalLinkAlt/> Preview Shop</a>
                  </div>
               </div>
               <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                  {['dashboard', 'config', 'delivery', 'menu'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl font-black text-sm capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>{tab}</button>
                  ))}
               </div>
            </div>

            {activeTab === 'dashboard' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                     <FaChartPie className="text-blue-500 text-2xl mb-4" />
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sales</div>
                     <div className="text-3xl font-black text-slate-800">Rs. {analytics.total.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                     <FaStore className="text-purple-500 text-2xl mb-4" />
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orders Count</div>
                     <div className="text-3xl font-black text-slate-800">{analytics.count}</div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-start">
                     <div>
                        <FaPowerOff className={`text-2xl mb-4 ${config.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Status</div>
                        <div className="text-3xl font-black text-slate-800 uppercase">{config.status}</div>
                     </div>
                     <button onClick={() => setConfig({...config, status: config.status === 'active' ? 'disabled' : 'active'})} className="bg-slate-100 p-2 rounded-lg text-[10px] font-black">TOGGLE</button>
                  </div>
               </div>
            )}

            {activeTab === 'delivery' && (
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="font-black text-xl mb-6 flex items-center gap-3"><FaMapMarkerAlt className="text-blue-600"/> Master Area Delivery Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                   <select className="p-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-blue-50" id="masterAreaSelect">
                      <option value="">-- Choose Area from DB --</option>
                      {masterAreas.map(a => <option key={a.id} value={a.area_name}>{a.area_name}</option>)}
                   </select>
                   <div className="flex gap-2">
                      <input type="number" id="masterFeeInput" className="flex-grow p-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-blue-50" placeholder="Fee (Rs.)" />
                      <button onClick={() => handleUpdateAreaFee(document.getElementById('masterAreaSelect').value, document.getElementById('masterFeeInput').value)} className="bg-blue-600 text-white px-8 rounded-2xl font-black shadow-lg">SYNC</button>
                   </div>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                  {deliveryAreas.map(area => (
                    <div key={area.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-black text-slate-800">{area.area_name}</span>
                      <span className="font-black text-blue-600">Rs. {area.fee}</span>
                    </div>
                  ))}
                  {deliveryAreas.length === 0 && <p className="text-center text-slate-400 py-10 font-bold">No area fees synced yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-800"><FaTag className="text-blue-600"/> 1. Add Category</h3>
                    <div className="flex gap-2">
                       <input className="flex-grow p-4 bg-slate-50 rounded-2xl font-black outline-none" placeholder="e.g. Burgers" value={newCat} onChange={(e)=>setNewCat(e.target.value)} />
                       <button onClick={handleAddCategory} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg"><FaPlus/></button>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-800"><FaUtensils className="text-blue-600"/> 2. Add Item</h3>
                    <form onSubmit={handleSuperMenuAdd} className="space-y-4">
                      <select className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-blue-50" value={menuData.category} onChange={(e) => setMenuData({...menuData, category: e.target.value})} required>
                         <option value="">-- SELECT CATEGORY --</option>
                         {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                      <input className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none" placeholder="Item Name" value={menuData.name} onChange={e => setMenuData({...menuData, name: e.target.value})} required />
                      <input className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none" placeholder="Price" value={menuData.price} onChange={e => setMenuData({...menuData, price: e.target.value})} required />
                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all">ADD TO BRANCH MENU</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 max-h-[650px] overflow-y-auto no-scrollbar">
                     {menuItems.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-2">
                          <div>
                            <span className="font-black text-slate-700 block">{item.name}</span>
                            <span className="text-[10px] font-black text-blue-500 uppercase">{item.category}</span>
                          </div>
                          <span className="font-black text-slate-800">Rs. {item.price}</span>
                       </div>
                     ))}
                </div>
              </div>
            )}
            
            {activeTab === 'config' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                     <h3 className="font-black text-xl flex items-center gap-3"><FaPalette className="text-blue-600"/> Branding</h3>
                     <input type="color" value={config.theme_color} onChange={(e) => setConfig({...config, theme_color: e.target.value})} className="w-full h-12 rounded-2xl cursor-pointer" />
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl font-black">
                           <label className="text-[9px] uppercase text-slate-400">Tax (%)</label>
                           <input type="number" className="w-full bg-transparent outline-none" value={config.tax_percentage} onChange={(e) => setConfig({...config, tax_percentage: e.target.value})} />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl font-black">
                           <label className="text-[9px] uppercase text-slate-400">Discount (%)</label>
                           <input type="number" className="w-full bg-transparent outline-none" value={config.discount_global} onChange={(e) => setConfig({...config, discount_global: e.target.value})} />
                        </div>
                     </div>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                     <div className="space-y-6">
                        <h3 className="font-black text-xl flex items-center gap-3"><FaTag className="text-blue-600"/> Store Config</h3>
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer font-bold">
                           <span>Cash On Delivery</span>
                           <input type="checkbox" className="w-6 h-6 accent-blue-600" checked={config.is_cod_enabled} onChange={(e) => setConfig({...config, is_cod_enabled: e.target.checked})} />
                        </label>
                     </div>
                     <button onClick={handleUpdateConfig} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl mt-8 transition-all hover:bg-blue-700">SAVE CONFIG 🔥</button>
                  </div>
               </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
             <FaStore className="text-9xl opacity-10" />
             <p className="font-bold text-lg">Select a Brand and Branch to begin Management</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;