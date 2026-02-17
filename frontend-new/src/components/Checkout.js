import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialBranchId = location.state?.branchId || localStorage.getItem('last_branch_id');
  const cart = location.state?.cart || [];

  const [branchConfig, setBranchConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', address: '', paymentMethod: 'COD'
  });

  useEffect(() => {
    if (initialBranchId) {
      localStorage.setItem('last_branch_id', initialBranchId);
      axios.get(`https://smart-agency-api.vercel.app/api/branches/${initialBranchId}`)
        .then(res => {
          setBranchConfig(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      navigate('/');
    }
  }, [initialBranchId, navigate]);

  // --- LOCATION DETECTION LOGIC ---
  const detectLocation = () => {
    setLocLoading(true);
    if (!navigator.geolocation) {
      alert("Bhai, aapka browser location support nahi karta.");
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse Geocoding (Convert Lat/Log to Address)
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const address = response.data.display_name;
          setFormData(prev => ({ ...prev, address: address }));
          alert("Location Detected! 📍");
        } catch (err) {
          alert("Address fetch karne mein masla hua, please manual likhein.");
        }
        setLocLoading(false);
      },
      (error) => {
        alert("Bhai, Location permission allow karein.");
        setLocLoading(false);
      }
    );
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = branchConfig ? Math.round(subtotal * (branchConfig.tax_percentage / 100)) : 0;
    const delivery = branchConfig?.delivery_fee || 0;
    return { subtotal, tax, delivery, total: subtotal + tax + delivery };
  }, [cart, branchConfig]);

  const handleOrderSubmit = async () => {
    if (!formData.fullName || !formData.mobile || !formData.address) {
        alert("Bhai, Details fill kerna lazmi hain!");
        return;
    }

    const orderData = {
      branch_id: initialBranchId,
      customer_name: formData.fullName,
      customer_phone: formData.mobile,
      customer_address: formData.address,
      items: cart,
      total_amount: totals.total,
      payment_method: formData.paymentMethod
    };

    try {
      const res = await axios.post('https://smart-agency-api.vercel.app/api/orders', orderData);
      navigate('/thank-you', { state: { order: res.data } });
    } catch (err) { alert("Order failed!"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-red-600 animate-pulse uppercase">Syncing...</div>;

  const primaryColor = branchConfig?.theme_color || '#b3001b';

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-32 overflow-x-hidden">
      <nav className="sticky top-0 z-[100] bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm">
        <button type="button" onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl"><FaArrowLeft /></button>
        <div className="text-center">
          <h1 className="text-lg font-black uppercase">Checkout</h1>
          <p className="text-[10px] font-bold text-gray-400 leading-none">{branchConfig?.branch_name}</p>
        </div>
        <div className="w-10"></div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black flex items-center gap-3" style={{ color: primaryColor }}>
                    <FaUser /> Delivery Address
                  </h3>
                  {/* DETECT LOCATION BUTTON */}
                  <button 
                    type="button"
                    onClick={detectLocation}
                    className="flex items-center gap-2 text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 transition-all active:scale-95"
                  >
                    <FaCrosshairs className={locLoading ? 'animate-spin' : ''} />
                    {locLoading ? 'DETECTING...' : 'USE MY LOCATION'}
                  </button>
              </div>

              <div className="space-y-4">
                <input type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Your Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                <input type="tel" className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                
                <div className="relative">
                  <textarea 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" 
                    placeholder="Complete House Address" 
                    rows="4" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                  <div className="absolute right-4 bottom-4 text-gray-300">
                    <FaMapMarkerAlt />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
               <h3 className="text-xl font-black mb-8" style={{ color: primaryColor }}><FaMoneyBillWave /> Payment</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => setFormData({...formData, paymentMethod: 'COD'})} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'bg-red-50 border-red-500 shadow-md' : 'bg-white border-gray-100 opacity-50'}`}>
                    <FaMoneyBillWave className="text-2xl mb-2 mx-auto text-red-600" />
                    <div className="font-black text-xs uppercase text-gray-800 text-center tracking-widest">Cash On Delivery</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 sticky top-24">
               <h3 className="text-lg font-black mb-6">Order Summary</h3>
               <div className="space-y-4 mb-8">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-bold border-b border-gray-50 pb-2">
                      <span className="text-gray-600">{item.qty}x {item.name}</span>
                      <span>Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-100">
                  <div className="flex justify-between text-gray-500 font-bold text-xs"><span>Subtotal</span><span>Rs. {totals.subtotal}</span></div>
                  <div className="flex justify-between text-gray-500 font-bold text-xs"><span>Delivery Fee</span><span>Rs. {totals.delivery}</span></div>
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-gray-100 mt-2" style={{ color: primaryColor }}>
                    <span>TOTAL</span><span>Rs. {totals.total}</span>
                  </div>
               </div>

               <button type="button" onClick={handleOrderSubmit} className="w-full py-5 rounded-[2rem] mt-8 text-white font-black text-xl shadow-2xl transition-all active:scale-95" style={{ backgroundColor: primaryColor, boxShadow: `0 20px 35px -10px ${primaryColor}88` }}>
                 PLACE ORDER 🍔
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;