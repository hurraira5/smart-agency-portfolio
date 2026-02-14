import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaClipboardList, FaCog, FaTag, FaPlus, FaTrash, FaPrint, FaPowerOff } from 'react-icons/fa';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burgers', description: '', image_url: '' });
  const [voucherForm, setVoucherForm] = useState({ code: '', discount: '', min: '' });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.branch_id) {
      fetchData();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    } else { navigate('/login'); }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const bRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}`);
      setBranchInfo(bRes.data);
      const mRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${user.branch_id}`);
      setMenuItems(mRes.data || []);
      fetchOrders();
    } catch (err) { console.error("Data fetch error"); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${user.branch_id}`);
      setOrders(oRes.data || []);
    } catch (err) { console.error("Order fetch error"); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // Standard update logic
    fetchOrders();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-24 md:w-64 bg-white border-r flex flex-col items-center md:items-start p-6 gap-8">
        <div className="text-2xl font-black text-red-600 hidden md:block tracking-tighter">POS.MANAGER</div>
        <div className="space-y-4 w-full">
           {[
             { id: 'orders', icon: <FaClipboardList/>, label: 'Live Orders' },
             { id: 'menu', icon: <FaUtensils/>, label: 'Menu Items' },
             { id: 'marketing', icon: <FaTag/>, label: 'Vouchers' },
             { id: 'settings', icon: <FaCog/>, label: 'Settings' }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>
                {tab.icon} <span className="hidden md:block font-bold">{tab.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-grow p-4 md:p-10">
         <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black capitalize">{activeTab} Panel</h2>
            <div className="bg-white px-6 py-2 rounded-full shadow-sm border flex items-center gap-4">
               <span className={`w-3 h-3 rounded-full ${branchInfo?.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
               <span className="font-bold text-sm uppercase tracking-widest">{branchInfo?.branch_name}</span>
            </div>
         </div>

         {activeTab === 'orders' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                   <div className="flex justify-between mb-4">
                      <span className="font-black text-gray-400 text-sm">#{order.id}</span>
                      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">{order.status}</span>
                   </div>
                   <h3 className="font-black text-xl mb-1">{order.customer_name}</h3>
                   <p className="text-xs text-gray-400 font-bold mb-4">{order.transaction_id}</p>
                   
                   <div className="bg-gray-50 p-4 rounded-2xl mb-4 space-y-2">
                      {JSON.parse(order.items).map(it => (
                        <div key={it.id} className="flex justify-between text-xs font-bold">
                           <span>{it.qty}x {it.name}</span>
                           <span>Rs.{it.price * it.qty}</span>
                        </div>
                      ))}
                   </div>
                   
                   <div className="flex justify-between items-center">
                      <span className="font-black text-lg">Total: Rs.{order.total_amount}</span>
                      <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"><FaPrint/></button>
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'menu' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm h-fit">
                 <h4 className="font-black text-xl mb-6">New Food Item</h4>
                 <form className="space-y-4">
                    <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-red-500" placeholder="Item Name" value={foodData.name} onChange={e => setFoodData({...foodData, name: e.target.value})} />
                    <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" type="number" placeholder="Price (PKR)" value={foodData.price} onChange={e => setFoodData({...foodData, price: e.target.value})} />
                    <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" placeholder="Image Link" value={foodData.image_url} onChange={e => setFoodData({...foodData, image_url: e.target.value})} />
                    <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200">ADD TO MENU</button>
                 </form>
              </div>
              <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm">
                 <div className="space-y-4">
                    {menuItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                         <div className="flex items-center gap-4">
                            <img src={item.image_url} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                               <div className="font-black">{item.name}</div>
                               <div className="text-xs font-bold text-red-600">Rs.{item.price}</div>
                            </div>
                         </div>
                         <button className="text-gray-300 hover:text-red-500 transition-all"><FaTrash/></button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default ManagerDashboard;