import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaMapMarkerAlt, FaPhoneAlt, FaUser, FaTicketAlt, 
  FaCreditCard, FaMoneyBillWave, FaShoppingBag, FaStore 
} from 'react-icons/fa';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Framework Logic: Extracting Data with Fallbacks
  const { cart, branchId } = useMemo(() => 
    location.state || { cart: [], branchId: localStorage.getItem('last_branch_id') }, 
  [location.state]);

  const [branchConfig, setBranchConfig] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherData, setVoucherData] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', address: '', landmark: '', paymentMethod: 'COD'
  });

  // Framework Service: Fetching Branch Data
  useEffect(() => {
    if (branchId) {
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branchId}`)
        .then(res => {
          setBranchConfig(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      navigate('/');
    }
  }, [branchId, navigate]);

  // Framework Logic: Calculation Module
  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = branchConfig ? Math.round(subtotal * (branchConfig.tax_percentage / 100)) : 0;
    const delivery = branchConfig?.delivery_fee || 0;
    const discount = voucherData ? voucherData.discount_amount : 0;
    return { subtotal, tax, delivery, discount, total: subtotal + tax + delivery - discount };
  }, [cart, branchConfig, voucherData]);

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setIsApplying(true);
    try {
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/vouchers/${branchId}/${voucherCode}`);
      if (res.data && totals.subtotal >= res.data.min_order) {
        setVoucherData(res.data);
      } else {
        alert("Conditions not met or invalid code!");
      }
    } catch (err) { alert("Voucher error"); }
    finally { setIsApplying(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty");

    const orderData = {
      branch_id: branchId,
      customer_name: formData.fullName,
      customer_phone: formData.mobile,
      customer_address: `${formData.address}${formData.landmark ? ', Ref: ' + formData.landmark : ''}`,
      items: cart,
      total_amount: totals.total,
      payment_method: formData.paymentMethod
    };

    try {
      const res = await axios.post('https://smart-agency-api.vercel.app/api/orders', orderData);
      navigate('/thank-you', { state: { order: res.data } });
    } catch (err) { alert("Order submission failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-red-600">PREPARING CHECKOUT...</div>;
  if (!branchConfig) return <div className="p-10 text-center font-bold">Branch Session Expired. Please reload.</div>;

  const primaryColor = branchConfig.theme_color || '#b3001b';

  return (
    <div className="bg-[#f4f7f6] min-h-screen font-sans">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md px-4 py-4 md:px-10 border-b flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all shadow-sm">
          <FaArrowLeft className="text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Checkout</h1>
          <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{branchConfig.branch_name}</span>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Form Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-gray-50 text-gray-800" style={{ color: primaryColor }}><FaMapMarkerAlt /></span>
                Delivery Info
              </h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Full Name</label>
                    <input 
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-800"
                      placeholder="e.g. Hammad Ali" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Mobile Number</label>
                    <input 
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-800"
                      placeholder="03xx-xxxxxxx" 
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Street Address</label>
                  <textarea 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-800"
                    placeholder="House No, Street, Area Name" 
                    rows="3"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
               <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-gray-50 text-gray-800" style={{ color: primaryColor }}><FaMoneyBillWave /></span>
                Payment Method
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
                    className={`relative p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'bg-red-50 border-red-500' : 'bg-white border-gray-100'}`}
                  >
                    <FaMoneyBillWave className={`text-2xl mb-2 ${formData.paymentMethod === 'COD' ? 'text-red-500' : 'text-gray-300'}`} />
                    <div className="font-black text-gray-800">Cash on Delivery</div>
                    <div className="text-[10px] font-bold text-gray-400">Pay when food arrives</div>
                    {formData.paymentMethod === 'COD' && <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>}
                  </div>

                  {branchConfig.is_online_enabled && (
                    <div 
                      onClick={() => setFormData({...formData, paymentMethod: 'Online'})}
                      className={`relative p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all ${formData.paymentMethod === 'Online' ? 'bg-red-50 border-red-500' : 'bg-white border-gray-100'}`}
                    >
                      <FaCreditCard className={`text-2xl mb-2 ${formData.paymentMethod === 'Online' ? 'text-red-500' : 'text-gray-300'}`} />
                      <div className="font-black text-gray-800">Card Payment</div>
                      <div className="text-[10px] font-bold text-gray-400">Visa, Mastercard, PayPak</div>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Responsive Sticky) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 sticky top-24">
               <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                 <FaShoppingBag className="text-gray-400" />
                 Review Items
               </h3>
               
               <div className="max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50 last:border-0">
                      <div className="flex gap-4 items-center">
                         <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-xs">
                           {item.qty}x
                         </div>
                         <div>
                            <div className="font-black text-gray-800 text-sm">{item.name}</div>
                            <div className="text-[10px] font-bold text-gray-400">Rs. {item.price} each</div>
                         </div>
                      </div>
                      <div className="font-black text-gray-900">Rs. {item.price * item.qty}</div>
                    </div>
                  ))}
               </div>

               {/* Voucher Section */}
               <div className="p-2 bg-gray-50 rounded-2xl flex items-center gap-2 mb-8">
                  <div className="pl-4 text-gray-400"><FaTicketAlt /></div>
                  <input 
                    className="bg-transparent flex-grow py-3 px-2 outline-none font-bold text-sm"
                    placeholder="Have a voucher?"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value)}
                  />
                  <button 
                    onClick={handleApplyVoucher}
                    disabled={isApplying}
                    className="bg-black text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isApplying ? '...' : 'APPLY'}
                  </button>
               </div>

               {/* Pricing Breakdown */}
               <div className="space-y-3 px-2">
                  <div className="flex justify-between text-gray-500 text-sm font-bold"><span>Subtotal</span><span>Rs. {totals.subtotal}</span></div>
                  <div className="flex justify-between text-gray-500 text-sm font-bold"><span>Service Tax</span><span>Rs. {totals.tax}</span></div>
                  <div className="flex justify-between text-gray-500 text-sm font-bold"><span>Delivery Fee</span><span>Rs. {totals.delivery}</span></div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm font-black italic">
                      <span>Discount Saved</span><span>- Rs. {totals.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-black pt-4 border-t-2 border-gray-100">
                    <span className="tracking-tighter">Grand Total</span>
                    <span style={{ color: primaryColor }}>Rs. {totals.total}</span>
                  </div>
               </div>

               {/* Desktop Submit Button (Hidden on Mobile) */}
               <button 
                onClick={handleSubmit}
                className="hidden lg:block w-full py-5 rounded-3xl mt-8 text-white font-black text-xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
                style={{ backgroundColor: primaryColor, boxShadow: `0 15px 30px -10px ${primaryColor}66` }}
               >
                 PLACE ORDER 🚀
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Fixed Action Bar (App Style) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t-2 border-gray-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-[110]">
         <div className="flex items-center justify-between gap-4">
            <div>
               <div className="text-[10px] font-black uppercase text-gray-400">Total to Pay</div>
               <div className="text-xl font-black leading-none" style={{ color: primaryColor }}>Rs. {totals.total}</div>
            </div>
            <button 
              onClick={handleSubmit}
              className="flex-grow py-4 rounded-2xl text-white font-black text-lg shadow-lg active:scale-95 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              ORDER NOW 🍔
            </button>
         </div>
      </div>
    </div>
  );
};

export default Checkout;