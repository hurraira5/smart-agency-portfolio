import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMotorcycle, FaWalking, FaCarSide, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const EntryModal = ({ isOpen, onConfirm, brandName }) => {
  const [orderType, setOrderType] = useState('Delivery');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  // Ye locations database se bhi aa sakti hain, abhi dummy hain
  const locations = ['DHA Phase 6', 'Gulshan-e-Iqbal', 'Bahadurabad', 'North Nazimabad', 'Johar'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div 
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl w-full max-w-[450px]"
        >
          {/* Header Section - Fuse.pk Style */}
          <div className="text-center p-8 bg-[var(--primary-color,#b3001b)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute rotate-45 -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
             </div>
             
             <motion.div 
               initial={{ scale: 0, rotate: -20 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ delay: 0.2, type: 'spring' }}
               className="bg-white w-24 h-24 rounded-[2rem] mx-auto mb-4 flex items-center justify-center shadow-xl relative z-10"
             >
               <span className="text-5xl">🍔</span>
             </motion.div>
             
             <h2 className="text-white text-2xl font-black mb-1 relative z-10 tracking-tight">
               WELCOME TO {brandName?.toUpperCase() || 'OUR SHOP'}
             </h2>
             <p className="text-white/80 text-sm font-medium relative z-10">
               Please select your preferences to continue
             </p>
          </div>

          <div className="p-8">
            {/* Order Type Switcher - Custom Animated Tabs */}
            <div className="flex bg-gray-100 p-1.5 rounded-full mb-8 border border-gray-200 shadow-inner relative">
              {['Delivery', 'Pickup', 'Carhop'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`relative z-10 flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    orderType === type ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type === 'Delivery' && <FaMotorcycle />}
                  {type === 'Pickup' && <FaWalking />}
                  {type === 'Carhop' && <FaCarSide />}
                  {type}
                  {orderType === type && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[var(--primary-color,#b3001b)] rounded-full -z-10 shadow-lg"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Location Selector */}
            <div className="mb-6">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block ml-4 uppercase">Your Area</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--primary-color)]">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <select 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[var(--primary-color)] focus:bg-white rounded-[1.5rem] py-4 pl-12 pr-4 outline-none transition-all appearance-none font-bold text-gray-700 shadow-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">Select your area...</option>
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="mb-8">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block ml-4 uppercase">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhoneAlt className="text-gray-400 group-focus-within:text-[var(--primary-color)]" />
                </div>
                <input 
                  type="tel" 
                  placeholder="03xx-xxxxxxx" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[var(--primary-color)] focus:bg-white rounded-[1.5rem] py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 shadow-sm"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!location || phone.length < 11}
              onClick={() => onConfirm({ location, orderType, phone })}
              className={`w-full py-5 rounded-[1.5rem] font-black text-lg shadow-xl transition-all duration-300 ${
                (!location || phone.length < 11) 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-[var(--primary-color,#b3001b)] text-white hover:shadow-[var(--primary-color)]/30'
              }`}
            >
              START ORDERING 🚀
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EntryModal;