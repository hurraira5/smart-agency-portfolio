import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaCog, FaChartLine, FaPalette, FaCreditCard } from 'react-icons/fa';

const SuperAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [branchOrders, setBranchOrders] = useState([]);
  const [restName, setRestName] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // orders, config
  const [branchData, setBranchData] = useState({ branch_name: '', location: '' });

  // Config States
  const [config, setConfig] = useState({
    theme_color: '#b3001b',
    is_cod_enabled: true,
    is_online_enabled: false,
    payment_api_key: '',
    delivery_fee: 0,
    tax_percentage: 0
  });

  const navigate = useNavigate();

  const fetchRestaurants = useCallback(async () => {
    const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
    setRestaurants(res.data || []);
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    await axios.post("https://smart-agency-api.vercel.app/api/restaurants", { name: restName, type: 'chain' });
    setRestName(''); fetchRestaurants();
  };

  const handleSelectRestaurant = async (e) => {
    const restId = e.target.value;
    if (!restId) return;
    const restaurant = restaurants.find(r => r.id === parseInt(restId));
    setSelectedRest(restaurant);
    const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${restId}/branches`);
    setBranches(res.data || []);
  };

  const handleManageBranch = async (branch) => {
    setSelectedBranch(branch);
    setConfig({
      theme_color: branch.theme_color || '#b3001b',
      is_cod_enabled: branch.is_cod_enabled ?? true,
      is_online_enabled: branch.is_online_enabled ?? false,
      payment_api_key: branch.payment_api_key || '',
      delivery_fee: branch.delivery_fee || 0,
      tax_percentage: branch.tax_percentage || 0
    });
    const orderRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${branch.id}`);
    setBranchOrders(orderRes.data || []);
  };

  const handleSaveConfig = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${selectedBranch.id}/config`, config);
      alert("Configuration Updated Successfully! 🔥");
    } catch (err) { alert("Error updating config"); }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    await axios.post("https://smart-agency-api.vercel.app/api/branches/register", { ...branchData, restaurant_id: selectedRest.id });
    setBranchData({ branch_name: '', location: '' });
    const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
    setBranches(res.data || []);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><FaStore /></div>
          <span className="text-xl font-black text-slate-800 tracking-tight">SUPER ADMIN</span>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-600 hover:text-white transition-all">Sign Out</button>
      </nav>

      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Brands & Branches */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Register Brand</h3>
              <form onSubmit={handleAddRestaurant} className="space-y-3">
                <input className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Brand Name" value={restName} onChange={(e)=>setRestName(e.target.value)} required />
                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Register</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Select Brand</h3>
              <select className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 mb-4 outline-none" onChange={handleSelectRestaurant}>
                <option value="">-- All Brands --</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              
              <div className="space-y-2">
                {branches.map(b => (
                  <button 
                    key={b.id} 
                    className={`w-full text-left p-4 rounded-2xl font-bold transition-all ${selectedBranch?.id === b.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`} 
                    onClick={() => handleManageBranch(b)}
                  >
                    {b.branch_name}
                  </button>
                ))}
              </div>
              {selectedRest && <button className="w-full mt-4 border-2 border-dashed border-slate-200 text-slate-400 font-bold py-3 rounded-2xl hover:border-blue-400 hover:text-blue-500 transition-all" onClick={() => setSelectedBranch(null)}>+ New Branch</button>}
            </div>
          </div>

          {/* RIGHT CONTENT: Orders or Config */}
          <div className="col-span-12 lg:col-span-9">
            {selectedBranch ? (
              <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-2xl font-black text-slate-800">{selectedBranch.branch_name}</h2>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Orders</button>
                    <button onClick={() => setActiveTab('config')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'config' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Configuration</button>
                  </div>
                </div>

                {activeTab === 'orders' ? (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {branchOrders.map(o => (
                          <tr key={o.id} className="hover:bg-slate-50 transition-all">
                            <td className="px-6 py-4 font-bold text-slate-800">#{o.id}</td>
                            <td className="px-6 py-4 font-mono text-sm text-blue-500">{o.transaction_id}</td>
                            <td className="px-6 py-4 font-medium text-slate-600">{o.customer_name}</td>
                            <td className="px-6 py-4 font-black text-slate-800">Rs. {o.total_amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme & Styling */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <FaPalette className="text-blue-500" />
                        <h3 className="text-lg font-black text-slate-800">Branding & Theme</h3>
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Primary Theme Color</label>
                        <div className="flex gap-4 items-center">
                          <input type="color" className="w-16 h-16 rounded-2xl cursor-pointer bg-transparent border-none" value={config.theme_color} onChange={(e)=>setConfig({...config, theme_color: e.target.value})} />
                          <input type="text" className="bg-slate-50 px-4 py-3 rounded-xl font-mono text-sm uppercase" value={config.theme_color} readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                         <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Delivery Fee</label>
                            <input type="number" className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none" value={config.delivery_fee} onChange={(e)=>setConfig({...config, delivery_fee: e.target.value})} />
                         </div>
                         <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Tax (%)</label>
                            <input type="number" className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none" value={config.tax_percentage} onChange={(e)=>setConfig({...config, tax_percentage: e.target.value})} />
                         </div>
                      </div>
                    </div>

                    {/* Payment Gateways */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <FaCreditCard className="text-blue-500" />
                        <h3 className="text-lg font-black text-slate-800">Payment Configuration</h3>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer">
                          <span className="font-bold text-slate-700">Cash on Delivery</span>
                          <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={config.is_cod_enabled} onChange={(e)=>setConfig({...config, is_cod_enabled: e.target.checked})} />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer">
                          <span className="font-bold text-slate-700">Online Payment (Direct API)</span>
                          <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={config.is_online_enabled} onChange={(e)=>setConfig({...config, is_online_enabled: e.target.checked})} />
                        </label>
                        {config.is_online_enabled && (
                          <div className="pt-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Merchant / API Key</label>
                            <input type="password" placeholder="Enter Gateway Key" className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" value={config.payment_api_key} onChange={(e)=>setConfig({...config, payment_api_key: e.target.value})} />
                            <p className="text-[10px] text-slate-400 mt-2 px-2 italic">* Payments will route directly to this restaurant's merchant account.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <button onClick={handleSaveConfig} className="w-full bg-slate-800 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-black transition-all transform hover:-translate-y-1">
                        SAVE ALL CONFIGURATIONS
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : selectedRest ? (
              <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 text-center max-w-2xl mx-auto mt-10">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <FaStore className="text-blue-600 text-3xl" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Create New Branch</h2>
                <p className="text-slate-500 mb-8 font-medium">Add a new physical location for <span className="text-blue-600">{selectedRest.name}</span></p>
                <form onSubmit={handleAddBranch} className="space-y-4 text-left">
                  <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Branch Name (e.g. DHA Phase 6)" value={branchData.branch_name} onChange={e=>setBranchData({...branchData,branch_name:e.target.value})} required />
                  <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Address / Location" value={branchData.location} onChange={e=>setBranchData({...branchData,location:e.target.value})} required />
                  <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all text-lg">Deploy Branch 🚀</button>
                </form>
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300">
                 <FaChartLine className="text-6xl mb-4 opacity-20" />
                 <p className="font-bold text-lg">Select a brand from the sidebar to manage data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SuperAdmin;