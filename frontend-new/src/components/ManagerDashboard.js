import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUtensils, FaClipboardList, FaCheckCircle, FaClock, 
  FaMotorcycle, FaBox, FaPowerOff, FaStore 
} from 'react-icons/fa';

const ManagerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const user = JSON.parse(localStorage.getItem('user'));
  const branchId = user?.branch_id;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Har 30 sec baad refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const ordRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/branch/${branchId}`);
      const menuRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${branchId}`);
      setOrders(ordRes.data);
      setMenu(menuRes.data);
    } catch (err) {
      console.error("Data fetch error");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${orderId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const toggleItemAvailability = async (itemId, currentStatus) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/menu/toggle/${itemId}`, { 
        is_available: !currentStatus 
      });
      fetchData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    totalSales: orders.reduce((acc, o) => acc + (o.total_amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-24 md:w-64 bg-white border-r border-gray-100 flex flex-col items-center py-10 gap-8">
        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
          <FaStore size={24} />
        </div>
        <div className="flex flex-col gap-4 w-full px-4">
          <button onClick={() => setActiveTab('orders')} className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
            <FaClipboardList size={20} />
            <span className="hidden md:block font-black uppercase text-xs tracking-widest">Orders</span>
          </button>
          <button onClick={() => setActiveTab('menu')} className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'menu' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
            <FaUtensils size={20} />
            <span className="hidden md:block font-black uppercase text-xs tracking-widest">Kitchen Menu</span>
          </button>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="mt-auto p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all">
          <FaPowerOff size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-800">Branch Panel</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Managing Branch ID: #{branchId}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white p-4 px-6 rounded-[2rem] shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-orange-500 uppercase">Live Orders</p>
              <p className="text-xl font-black italic">{stats.pending + stats.preparing}</p>
            </div>
            <div className="bg-white p-4 px-6 rounded-[2rem] shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-green-600 uppercase">Today's Sale</p>
              <p className="text-xl font-black italic">Rs. {stats.totalSales}</p>
            </div>
          </div>
        </header>

        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col h-fit">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Order ID</span>
                    <h3 className="text-xl font-black italic">#{order.id.slice(-6)}</h3>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border ${
                    order.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    order.status === 'preparing' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {JSON.parse(order.items || '[]').map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-bold text-gray-600">
                      <span>{item.qty}x {item.name}</span>
                      <span className="text-gray-300 font-black italic">Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer & Address</p>
                  <p className="font-bold text-gray-800 text-sm">{order.customer_name} | {order.customer_phone}</p>
                  <p className="text-gray-500 text-xs mt-1">{order.customer_address}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                  {order.status === 'pending' && (
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100">Start Preparing</button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100">Out for Delivery</button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100">Mark Delivered</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between border border-gray-50">
                <div className="flex items-center gap-4">
                  <img src={item.image_url} className={`w-14 h-14 rounded-2xl object-cover ${!item.is_available && 'grayscale opacity-50'}`} />
                  <div>
                    <h4 className="font-black text-sm uppercase italic tracking-tighter">{item.name}</h4>
                    <p className={`text-[10px] font-bold ${item.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {item.is_available ? 'AVAILABLE' : 'OUT OF STOCK'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleItemAvailability(item.id, item.is_available)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${item.is_available ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                >
                  <FaBox />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;