import React, { useState } from 'react';
import { FaPlus, FaSearch, FaFolderOpen, FaEdit, FaTrashAlt, FaGripVertical } from 'react-icons/fa';

const Categories = () => {
  // Mock Data (Baad mein Database se fetch hoga)
  const [categories, setCategories] = useState([]);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Categories</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organize your menu into groups</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 flex items-center gap-2 hover:scale-105 transition-all">
          <FaPlus /> Add New Category
        </button>
      </div>

      {/* Categories Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase px-4">
            Total Categories: {categories.length}
        </div>
      </div>

      {/* Categories Grid/Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Sort</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Image</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category Name</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Count</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              // Empty State - Page 5 Style
              <tr>
                <td colSpan="5" className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <FaFolderOpen className="text-4xl text-gray-200" />
                    </div>
                    <h3 className="font-black text-gray-400 text-lg">No categories found</h3>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">
                      Create categories to group your menu items effectively
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all cursor-pointer">
                  <td className="px-6 py-4 text-gray-300">
                    <FaGripVertical />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border border-gray-50">
                       <img src={cat.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-gray-800 text-sm">{cat.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black">
                        {cat.itemCount} ITEMS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
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

export default Categories;