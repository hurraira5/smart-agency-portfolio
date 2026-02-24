import React, { useState } from 'react';
import { FaClock, FaFire, FaHistory, FaCheckDouble } from 'react-icons/fa';

const KitchenDisplay = () => {
  // Mock Active Orders (Baad mein ye live socket se connect honge)
  const [activeOrders, setActiveOrders] = useState([]);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Kitchen Display</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Kitchen Preparation Tracker</p>
        </div>
        
        {/* Status Filters - PDF Page 3 Style */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            Active Orders
          </button>
          <button className="px-6 py-2 text-gray-400 hover:text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            History
          </button>
        </div>
      </div>

      {/* Priority Filters Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-red-200 transition-all">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Avg. Prep Time: 0m</span>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm cursor-pointer">
          <FaClock className="text-orange-500" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Late (0)</span>
        </div>

        <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm cursor-pointer">
          <FaFire className="text-red-500" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">By Priority</span>
        </div>
      </div>

      {/* Main Grid for Order Cards */}
      {activeOrders.length === 0 ? (
        // Empty State - PDF Page 3 Style
        <div className="bg-white rounded-[3rem] p-20 border border-dashed border-gray-200 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FaCheckDouble className="text-4xl text-gray-200" />
            </div>
            <h2 className="text-xl font-black text-gray-400">No active orders</h2>
            <p className="text-xs font-bold text-gray-300 uppercase mt-2 tracking-widest">Orders will appear here once customers start ordering</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Order Card Example (Jab orders honge tab ye map hoga) */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden border-t-4 border-t-orange-500">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                <span className="font-black text-sm text-gray-800">#ORD-5542</span>
                <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-lg">12 MINS AGO</span>
            </div>
            <div className="p-5 space-y-3">
                <div className="flex justify-between font-bold text-sm">
                    <span>1x Zinger Burger</span>
                    <span className="text-gray-400">Extra Cheese</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                    <span>2x Pepsi 345ml</span>
                </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-2">
                <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100">
                    Mark Ready
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;