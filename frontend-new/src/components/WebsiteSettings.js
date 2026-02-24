import React, { useState } from 'react';
import { FaGlobe, FaSearch, FaFacebook, FaInstagram, FaYoutube, FaChartLine, FaSave, FaEye } from 'react-icons/fa';

const WebsiteSettings = () => {
  const [activeTab, setActiveTab] = useState('social'); // social, seo, tracking

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Website Settings</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configure your customer-facing restaurant website</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                <FaEye /> Preview
            </button>
            <button className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 flex items-center gap-2 hover:scale-105 transition-all">
                <FaSave /> Save Changes
            </button>
        </div>
      </div>

      {/* Settings Navigation Tabs (PDF Style) */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-3xl border border-gray-100 w-fit">
        {['General Info', 'Banners & Images', 'Social & SEO', 'Tracking & Analytics', 'Delivery Zones'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab.includes(tab.toLowerCase().split(' ')[0]) ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Social Media Links (PDF Page 26 Style) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
            <FaInstagram className="text-red-500" /> Social Media Links
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Instagram</label>
              <input type="text" placeholder="https://instagram.com/yourpage" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Facebook</label>
              <input type="text" placeholder="https://facebook.com/yourpage" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">YouTube</label>
              <input type="text" placeholder="https://youtube.com/@yourchannel" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100" />
            </div>
          </div>
        </div>

        {/* SEO Settings (PDF Page 26 Style) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
            <FaSearch className="text-blue-500" /> SEO Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Meta Title</label>
              <input type="text" placeholder="Your Restaurant - Best Food in City" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Meta Description</label>
              <textarea rows="3" placeholder="A brief description for search engines..." className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100 resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Tracking & Analytics (PDF Page 27 Style) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6 flex items-center gap-2">
            <FaChartLine className="text-green-500" /> Tracking & Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                        <p className="text-xs font-black text-gray-800">Enable Tracking</p>
                        <p className="text-[10px] font-bold text-gray-400">Master switch for all analytics</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-red-600" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Meta (Facebook) Pixel ID</label>
                  <input type="text" placeholder="123456789012345" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100" />
                </div>
            </div>
            <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Conversations API Access Token</label>
                  <textarea rows="4" placeholder="EAAB..." className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 mt-1 text-[10px] font-mono outline-none focus:ring-2 focus:ring-red-100 resize-none"></textarea>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WebsiteSettings;