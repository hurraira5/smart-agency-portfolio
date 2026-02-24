import React from 'react';
import { FaUserCircle, FaStore, FaLock, FaBell } from 'react-icons/fa';

const Settings = () => {
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      <h1 className="text-2xl font-black text-gray-800 mb-8">Account Settings</h1>

      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-4xl">
              <FaUserCircle />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800">Manager Profile</h3>
              <p className="text-xs font-bold text-gray-400 uppercase">Update your personal information</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Full Name</label>
              <input type="text" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 font-bold outline-none" placeholder="Enter name" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Email Address</label>
              <input type="email" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 font-bold outline-none" placeholder="manager@example.com" />
            </div>
          </div>
        </div>

        {/* Password Security */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2"><FaLock className="text-orange-500" /> Security</h3>
          <button className="bg-gray-800 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};