import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaMapMarkerAlt, FaPhoneAlt, FaUser, FaTicketAlt, FaCheckCircle, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, branchId } = location.state || { cart: [], branchId: null };

  const [branchConfig, setBranchConfig] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherData, setVoucherData] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', address: '', landmark: '', paymentMethod: 'COD'
  });

  useEffect(() => {
    if (branchId) {
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branchId}`)
        .then(res => setBranchConfig(res.data));
    }
  }, [branchId]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = branchConfig ? Math.round(subtotal * (branchConfig.tax_percentage / 100)) : 0;
  const delivery = branchConfig?.delivery_fee || 0;
  const discount = voucherData ? voucherData.discount_amount : 0;
  const total = subtotal + tax + delivery - discount;

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setIsApplying(true);
    try {
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/vouchers/${branchId}/${voucherCode}`);
      if (res.data && subtotal >= res.data.min_order) {
        setVoucherData(res.data);
      } else {
        alert("Invalid code or minimum order not met!");
        setVoucherData(null);
      }
    } catch (err) { alert("Voucher Error"); }
    finally { setIsApplying(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderData = {
      branch_id: branchId,
      customer_name: formData.fullName,
      customer_phone: formData.mobile,
      customer_address: `${formData.address}, ${formData.landmark}`,
      items: cart,
      total_amount: total,
      payment_method: formData.paymentMethod
    };

    try {
      const res = await axios.post('https://smart-agency-api.vercel.app/api/orders', orderData);
      navigate('/thank-you', { state: { order: res.data } });
    } catch (err) { alert("Order Failed!"); }
  };

  if (!branchConfig) return <div className="h-screen flex items-center justify-center font-bold">Loading Checkout...</div>;

  const primaryColor = branchConfig.theme_color || '#b3001b';

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20 font-sans">
      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-black tracking-tight">Finalizing Your Order</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Forms */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}><FaUser size={12}/></div>
               Delivery Information
            </h3>
            <div className="space-y-4">
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--p-color)]" style={{"--p-color": primaryColor}} />
                <input 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[var(--p-color)] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold"
                  placeholder="Your Full Name" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  required 
                />
              </div>
              <div className="relative group">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[var(--p-color)] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold"
                  placeholder="Mobile Number (03xx...)" 
                  value={formData.mobile}
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  required 
                />
              </div>
              <div className="relative group">
                <FaMapMarkerAlt className="absolute left-4 top-6 text-gray-400" />
                <textarea 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[var(--p-color)] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold"
                  placeholder="Detailed Address (House, Street, Area)" 
                  rows="3"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  required 
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Method Fuse Style */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <h3 className="text-lg font-black mb-6">Payment Method</h3>
             <div className="grid grid-cols-2 gap-4">
               {branchConfig.is_cod_enabled && (
                 <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 font-black ${formData.paymentMethod === 'COD' ? 'bg-gray-50' : 'border-gray-100 opacity-50'}`}
                  style={{ borderColor: formData.paymentMethod === 'COD' ? primaryColor : 'transparent' }}
                 >
                   <FaMoneyBillWave size={24} style={{ color: primaryColor }} />
                   Cash
                 </button>
               )}
               {branchConfig.is_online_enabled && (
                 <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'Online'})}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 font-black ${formData.paymentMethod === 'Online' ? 'bg-gray-50' : 'border-gray-100 opacity-50'}`}
                  style={{ borderColor: formData.paymentMethod === 'Online' ? primaryColor : 'transparent' }}
                 >
                   <FaCreditCard size={24} style={{ color: primaryColor }} />
                   Card/API
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* Right Side: Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24">
             <h3 className="text-lg font-black mb-6">Order Summary</h3>
             <div className="space-y-4 mb-8 max-h-[300px] overflow-auto no-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                       <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-black">{item.qty}x</span>
                       <span className="font-bold text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-black">Rs. {item.price * item.qty}</span>
                  </div>
                ))}
             </div>

             {/* Voucher Box */}
             <div className="flex gap-2 mb-8 p-2 bg-gray-50 rounded-2xl">
                <input 
                  className="bg-transparent flex-grow px-4 outline-none font-bold text-sm"
                  placeholder="Promo Code"
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value)}
                />
                <button 
                  onClick={handleApplyVoucher}
                  className="px-6 py-3 rounded-xl text-white font-black text-xs shadow-lg transition-all active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isApplying ? '...' : 'APPLY'}
                </button>
             </div>

             <div className="space-y-3 border-t pt-6">
                <div className="flex justify-between text-gray-500 font-bold"><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                <div className="flex justify-between text-gray-500 font-bold"><span>Tax</span><span>Rs. {tax}</span></div>
                <div className="flex justify-between text-gray-500 font-bold"><span>Delivery</span><span>Rs. {delivery}</span></div>
                {voucherData && <div className="flex justify-between text-green-600 font-bold"><span>Discount</span><span>-Rs. {discount}</span></div>}
                <div className="flex justify-between text-xl font-black pt-2"><span>Total Amount</span><span style={{ color: primaryColor }}>Rs. {total}</span></div>
             </div>

             <button 
              onClick={handleSubmit}
              className="w-full py-5 rounded-3xl mt-8 text-white font-black text-xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
              style={{ backgroundColor: primaryColor, boxShadow: `0 20px 30px -10px ${primaryColor}66` }}
             >
               PLACE ORDER 🍔
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;