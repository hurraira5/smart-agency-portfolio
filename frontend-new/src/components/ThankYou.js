import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaPrint, FaShoppingBag, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  if (!order) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h4 className="text-xl font-black text-gray-800">Order details not found.</h4>
        <button onClick={() => navigate('/')} className="mt-6 bg-red-600 text-white px-8 py-3 rounded-full font-black shadow-lg">GO BACK HOME</button>
      </div>
    );
  }

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-12 font-sans overflow-x-hidden">
      {/* Success Header */}
      <div className="bg-green-600 text-white pt-16 pb-24 px-6 text-center relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
        >
          <FaCheckCircle className="text-white text-5xl" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 relative z-10">ORDER SUCCESSFUL! 🎉</h1>
        <p className="font-bold opacity-90 relative z-10 text-sm md:text-base">Get ready! Your delicious food is being prepared.</p>
        
        {/* Background blobs for premium feel */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-16 -mb-16"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-2xl mx-auto px-6 -mt-12 relative z-20"
      >
        {/* Order ID Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex justify-between items-center mb-6">
           <div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Reference</span>
              <div className="text-2xl font-black text-gray-800">#{order.id}</div>
           </div>
           <div className="text-right">
              <span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black border border-orange-100 uppercase tracking-tight">
                 {order.status || 'Received'} 🟡
              </span>
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <FaPhoneAlt /> Customer
              </h4>
              <div className="font-bold text-gray-800">{order.customer_name}</div>
              <div className="text-sm text-gray-500 font-medium">{order.customer_phone}</div>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <FaCalendarAlt /> Time
              </h4>
              <div className="font-bold text-gray-800">{new Date(order.created_at).toLocaleDateString()}</div>
              <div className="text-sm text-gray-500 font-medium">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
           </div>
        </div>

        {/* Address Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
           <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaMapMarkerAlt /> Delivery To
           </h4>
           <div className="font-bold text-gray-800 leading-relaxed">{order.customer_address}</div>
        </div>

        {/* Summary Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
           <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FaShoppingBag /> Order Summary
           </h4>
           <div className="space-y-4 mb-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-xl font-black text-[10px]">{item.qty}x</span>
                      <span className="font-bold text-gray-700">{item.name}</span>
                   </div>
                   <span className="font-black text-gray-900">Rs. {item.price * item.qty}</span>
                </div>
              ))}
           </div>
           
           <div className="border-t border-dashed pt-6 space-y-3">
              <div className="flex justify-between text-gray-500 font-bold text-sm"><span>Subtotal</span><span>Rs. {order.total_amount - 100}</span></div>
              <div className="flex justify-between text-gray-500 font-bold text-sm"><span>Delivery Fee</span><span>Rs. 100</span></div>
              <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t mt-2">
                 <span>Grand Total</span>
                 <span className="text-red-600">Rs. {order.total_amount}</span>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
           <button onClick={() => window.print()} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3">
              <FaPrint /> PRINT RECEIPT
           </button>
           <button onClick={() => navigate('/')} className="w-full py-4 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black hover:bg-red-50 transition-all">
              PLACE ANOTHER ORDER
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYou;