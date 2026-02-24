import React, { useState } from 'react';
import { FaPlus, FaTicketAlt, FaSearch, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Coupons = () => {
  // Mock Coupons Data
  const [coupons, setCoupons] = useState([]);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Coupons & Vouchers</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Create discounts to boost your sales</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 flex items-center gap-2 hover:scale-105 transition-all">
          <FaPlus /> Create Coupon
        </button>
      </div>

      {/* Coupon Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 border-l-4 border-l-red-500">
          <p className="text-[10px] font-black text-gray-400 uppercase">Active Coupons</p>
          <h2 className="text-3xl font-black text-gray-800">0</h2>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-[10px] font-black text-gray-400 uppercase">Total Used</p>
          <h2 className="text-3xl font-black text-gray-800">0</h2>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-[10px] font-black text-gray-400 uppercase">Total Discounted</p>
          <h2 className="text-3xl font-black text-gray-800">Rs. 0</h2>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-gray-700">All Coupons</h3>
            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                <input type="text" placeholder="Search code..." className="bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none" />
            </div>
        </div>

        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {['Code', 'Type', 'Value', 'Usage', 'Expiry', 'Status', 'Action'].map((head) => (
                <th key={head} className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-red-50 text-red-200 rounded-full flex items-center justify-center mb-4">
                      <FaTicketAlt className="text-4xl" />
                    </div>
                    <p className="font-black text-gray-400">No active coupons</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-1 tracking-widest">Offer discounts to attract more customers</p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map((coupon, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4">
                    <span className="font-black text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-dashed border-red-200">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{coupon.type}</td>
                  <td className="px-6 py-4 font-black text-gray-800">{coupon.value}</td>
                  <td className="px-6 py-4 font-bold text-gray-400 text-xs">{coupon.used}/{coupon.limit}</td>
                  <td className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">{coupon.expiry}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${coupon.active ? 'text-green-500' : 'text-red-400'}`}>
                      {coupon.active ? <FaCheckCircle /> : <FaTimesCircle />}
                      {coupon.active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><FaTrashAlt /></button>
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

export default Coupons;