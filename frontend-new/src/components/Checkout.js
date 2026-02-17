import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUser, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { cart, branchId } = useMemo(() => 
    location.state || { cart: [], branchId: localStorage.getItem('last_branch_id') || 1 }, 
  [location.state]);

  const [branchConfig, setBranchConfig] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherData, setVoucherData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', address: '', paymentMethod: 'COD'
  });

  useEffect(() => {
    if (branchId) {
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${branchId}`)
        .then(res => { setBranchConfig(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [branchId]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = branchConfig ? Math.round(subtotal * (branchConfig.tax_percentage / 100)) : 0;
    const delivery = branchConfig?.delivery_fee || 0;
    const discount = voucherData ? Number(voucherData.discount_amount) : 0;
    return { subtotal, tax, delivery, discount, total: subtotal + tax + delivery - discount };
  }, [cart, branchConfig, voucherData]);

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/vouchers/${branchId}/${voucherCode}`);
      if (res.data && totals.subtotal >= res.data.min_order) {
        setVoucherData(res.data);
        alert("Voucher Applied! 🎉");
      }
    } catch (err) { alert("Invalid Promo Code"); }
  };

  const handleOrderSubmit = async () => {
    if (!formData.fullName || !formData.mobile || !formData.address) {
        alert("Bhai, sari details fill karein!");
        return;
    }

    const orderData = {
      branch_id: branchId,
      customer_name: formData.fullName,
      customer_phone: formData.mobile,
      customer_address: formData.address,
      items: cart,
      total_amount: totals.total,
      payment_method: formData.paymentMethod
    };

    try {
      const res = await axios.post('https://smart-agency-api.vercel.app/api/orders', orderData);
      // Navigation is now purely client-side
      navigate('/thank-you', { state: { order: res.data } });
    } catch (err) { 
        alert("Order failed. Please check connection."); 
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-red-600 animate-pulse">LOADING...</div>;

  const primaryColor = branchConfig?.theme_color || '#b3001b';

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-32">
      <nav className="sticky top-0 z-[100] bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm">
        <button type="button" onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl"><FaArrowLeft /></button>
        <h1 className="text-lg font-black uppercase">Checkout</h1>
        <div className="w-10"></div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3" style={{ color: primaryColor }}><FaUser /> Delivery Info</h3>
              <div className="space-y-4 text-left">
                <input type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Name" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                <input type="tel" className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="WhatsApp" onChange={e => setFormData({...formData, mobile: e.target.value})} />
                <textarea className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Full Address" rows="3" onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
               <h3 className="text-xl font-black mb-8" style={{ color: primaryColor }}><FaMoneyBillWave /> Payment</h3>
               <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...formData, paymentMethod: 'COD'})} className={`p-6 rounded-[2rem] border-2 transition-all ${formData.paymentMethod === 'COD' ? 'bg-red-50 border-red-500 shadow-md' : 'bg-white border-gray-100'}`}>
                    <FaMoneyBillWave className="text-2xl mb-2 mx-auto" />
                    <div className="font-black text-xs uppercase">Cash</div>
                  </button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 sticky top-24">
               <h3 className="text-lg font-black mb-6">Order Summary</h3>
               <div className="space-y-4 mb-8">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-bold text-gray-700">
                      <span>{item.qty}x {item.name}</span>
                      <span>Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
               </div>

               <div className="flex bg-gray-100 p-2 rounded-2xl mb-8">
                  <input className="bg-transparent flex-grow px-4 outline-none font-bold text-xs" placeholder="PROMO?" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} />
                  <button type="button" onClick={handleApplyVoucher} className="bg-black text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase">Apply</button>
               </div>

               <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-100">
                  <div className="flex justify-between text-gray-500 font-bold text-xs uppercase"><span>Subtotal</span><span>Rs. {totals.subtotal}</span></div>
                  <div className="flex justify-between text-gray-500 font-bold text-xs uppercase"><span>Delivery</span><span>Rs. {totals.delivery}</span></div>
                  {totals.discount > 0 && <div className="flex justify-between text-green-600 font-black text-xs uppercase italic"><span>Discount</span><span>-Rs. {totals.discount}</span></div>}
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-gray-100 mt-2" style={{ color: primaryColor }}>
                    <span>TOTAL</span><span>Rs. {totals.total}</span>
                  </div>
               </div>

               <button type="button" onClick={handleOrderSubmit} className="hidden lg:block w-full py-5 rounded-[2rem] mt-8 text-white font-black text-xl shadow-2xl transition-all active:scale-95" style={{ backgroundColor: primaryColor }}>
                 PLACE ORDER 🚀
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-5 border-t shadow-2xl z-[110]">
         <button type="button" onClick={handleOrderSubmit} className="w-full py-4 rounded-2xl text-white font-black text-lg" style={{ backgroundColor: primaryColor }}>
            ORDER NOW (Rs. {totals.total})
         </button>
      </div>
    </div>
  );
};

export default Checkout;