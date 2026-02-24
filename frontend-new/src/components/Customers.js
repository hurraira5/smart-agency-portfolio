import React, { useState } from 'react';
import { FaSearch, FaUsers, FaPhoneAlt, FaHistory, FaStar, FaDownload } from 'react-icons/fa';

const Customers = () => {
  // Mock Data (Real system mein backend se connect hoga)
  const [customers, setCustomers] = useState([]);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Customers</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Database of all your restaurant customers</p>
        </div>
        <button className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Customer Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase">Total Customers</p>
          <h2 className="text-3xl font-black text-gray-800">0</h2>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase">Repeat Customers</p>
          <h2 className="text-3xl font-black text-blue-600">0%</h2>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase">Average Spend</p>
          <h2 className="text-3xl font-black text-green-600">Rs. 0</h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 border border-gray-100">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search by name or phone number..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Customer Name', 'Phone', 'Orders', 'Total Spent', 'Last Order', 'Actions'].map((head) => (
                  <th key={head} className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                // Empty State Design
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <FaUsers className="text-4xl text-gray-200" />
                      </div>
                      <h3 className="font-black text-gray-400 text-lg">No customers found yet</h3>
                      <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">
                        Customer data will build up as you receive orders
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-all cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-black text-xs uppercase">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="font-black text-gray-800 text-sm">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                        <FaPhoneAlt className="text-[10px]" /> {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {customer.orderCount} Orders
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800">Rs. {customer.totalSpend}</td>
                    <td className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">{customer.lastOrderDate}</td>
                    <td className="px-6 py-4">
                      <button className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <FaHistory />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;