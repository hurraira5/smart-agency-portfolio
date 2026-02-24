import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrashAlt, FaEllipsisV, FaUtensils } from 'react-icons/fa';

const MenuItems = () => {
  // Mock Data (Baad mein Database se map hoga)
  const [items, setItems] = useState([]);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Menu Items</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage your restaurant menu and availability</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 flex items-center gap-2 hover:scale-105 transition-all">
          <FaPlus /> Add New Item
        </button>
      </div>

      {/* Stats for Menu (PDF Page 4 Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase">Total Items</p>
          <h2 className="text-2xl font-black text-gray-800">0</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase">Active</p>
          <h2 className="text-2xl font-black text-green-500">0</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase">Out of Stock</p>
          <h2 className="text-2xl font-black text-red-500">0</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase">Categories</p>
          <h2 className="text-2xl font-black text-blue-500">0</h2>
        </div>
      </div>

      {/* Search & Bulk Actions Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search items by name..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>
        
        <select className="bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-500 outline-none">
          <option>All Categories</option>
          <option>Fast Food</option>
          <option>Desi</option>
          <option>Beverages</option>
        </select>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {['Image', 'Item Name', 'Category', 'Price', 'Status', 'Actions'].map((head) => (
                <th key={head} className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan="6" className="py-20 text-center">
                   <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                        <FaUtensils className="text-3xl" />
                      </div>
                      <p className="font-black text-gray-400">No items found in your menu</p>
                      <p className="text-[10px] font-bold text-gray-300 uppercase mt-1 tracking-widest">Start by adding your first dish</p>
                   </div>
                </td>
              </tr>
            ) : (
              // Items will map here
              items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-800 text-sm">{item.name}</td>
                  <td className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">{item.category}</td>
                  <td className="px-6 py-4 font-black text-red-600">Rs. {item.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                       <span className="text-[10px] font-black uppercase text-gray-600">{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FaEdit /></button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><FaTrashAlt /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuItems;