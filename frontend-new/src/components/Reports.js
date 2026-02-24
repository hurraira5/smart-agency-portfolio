import React from 'react';
import { FaChartPie, FaDownload, FaArrowUp, FaCalendarAlt } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const reportData = [
    { date: 'Mon', sales: 2400 }, { date: 'Tue', sales: 1398 },
    { date: 'Wed', sales: 9800 }, { date: 'Thu', sales: 3908 },
    { date: 'Fri', sales: 4800 }, { date: 'Sat', sales: 3800 },
    { date: 'Sun', sales: 4300 },
  ];

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Sales Reports</h1>
          <p className="text-xs font-bold text-gray-400 uppercase">Track your business growth</p>
        </div>
        <button className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2">
          <FaDownload /> Download PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><FaArrowUp /></div>
             <span className="text-[10px] font-black text-gray-400">LAST 7 DAYS</span>
          </div>
          <h2 className="text-4xl font-black text-gray-800">Rs. 0</h2>
          <p className="text-xs font-bold text-gray-400 uppercase mt-2">Total Sales Revenue</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><FaCalendarAlt /></div>
             <span className="text-[10px] font-black text-gray-400">MONTHLY TARGET</span>
          </div>
          <h2 className="text-4xl font-black text-gray-800">0%</h2>
          <p className="text-xs font-bold text-gray-400 uppercase mt-2">Completion Rate</p>
        </div>
      </div>

      {/* Sales Graph */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-96">
        <h3 className="font-black text-gray-800 mb-6">Revenue Growth</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={reportData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};