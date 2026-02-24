import React from 'react';
import { FaDollarSign, FaShoppingBag, FaUsers, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardHome = () => {
  // Mock Data (Ye baad mein API se connect hoga)
  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
  ];

  const pieData = [
    { name: 'Burgers', value: 400 },
    { name: 'Pizza', value: 300 },
    { name: 'Drinks', value: 200 },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#10b981'];

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
        <p className="text-gray-500 font-bold text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Onboarding Checklist (PDF Page 1 Style) */}
      <div className="bg-white p-6 rounded-[2rem] border border-dashed border-red-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-red-50 p-4 rounded-2xl text-red-600 text-2xl">
            <FaCheckCircle />
          </div>
          <div>
            <h3 className="font-black text-gray-800">Your onboarding checklist</h3>
            <p className="text-xs font-bold text-gray-400">Ask our team to set up your menu and website for free</p>
          </div>
        </div>
        <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 hover:scale-105 transition-all">
          Connect Your Domain
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FaDollarSign /></div>
            <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase">Total Revenue</p>
          <h2 className="text-3xl font-black text-gray-800">Rs. 0</h2>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><FaShoppingBag /></div>
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase">Total Orders</p>
          <h2 className="text-3xl font-black text-gray-800">0</h2>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><FaUsers /></div>
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase">Total Customers</p>
          <h2 className="text-3xl font-black text-gray-800">0</h2>
        </div>
      </div>

      {/* Charts Section (PDF Page 1 Lower Half) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Overview */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black mb-6 flex justify-between items-center">
            Revenue Overview <FaChevronRight className="text-xs text-gray-300" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="sales" fill="#ef4444" radius={[10, 10, 10, 10]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
          <h3 className="font-black mb-6 text-left">Sales by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                <span className="text-[10px] font-black text-gray-500 uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;