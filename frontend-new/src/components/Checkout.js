import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Framework Logic: Getting state with absolute fallbacks
  const cart = useMemo(() => location.state?.cart || JSON.parse(localStorage.getItem('temp_cart')) || [], [location.state]);
  const initialBranchId = useMemo(() => location.state?.branchId || localStorage.getItem('last_branch_id'), [location.state]);

  const [branchConfig, setBranchConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', address: '', paymentMethod: 'COD'
  });

  // Save cart to localstorage just in case of accidental reload
  useEffect(() => {
    if (cart.length > 0) localStorage.setItem('temp_cart', JSON.stringify(cart));
  }, [cart]);

  // --- AUTO ASK FOR LOCATION (Fuse.pk Style) ---
  useEffect(() => {
    const askLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            setFormData(prev => ({ ...prev, address: res.data.display_name }));
          } catch (e) { console.log("Location fetch fail"); }
        }, (err) => { console.log("Location Denied"); });
      }
    };
    askLocation();
  }, []);

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

  const detectLocation = (e) => {
    if(e) e.preventDefault(); // Stop any bubble up
    setLocLoading(true);
    if (!navigator.geolocation) {
      alert("Browser not supported");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          setFormData(prev => ({ ...prev, address: res.data.display_name }));
        } catch (err) { alert("Address fetch failed"); }
        setLocLoading(false);
      }, () => {
        alert("Permission denied");
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

  const handleOrderSubmit = async (e) => {
    if(e) e.preventDefault(); // Safety stop

    if (!formData.fullName || !formData.mobile || !formData.address) {
        alert("Bhai, sari details bharna lazmi hain!");
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
      localStorage.removeItem('temp_cart'); // Clear cart on success
      navigate('/thank-you', { state: { order: res.data }, replace: true });
    } catch (err) { 
        alert("Order failed! Connection check karein."); 
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-black text-gray-400 text-xs tracking-widest uppercase">Initializing Checkout...</p>
        </div>
    </div>
  );

  const primaryColor = branchConfig?.theme_color || '#b3001b';

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-32 overflow-x-hidden text-left">
      <nav className="sticky top-0 z-[100] bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm">
        <button type="button" onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl"><FaArrowLeft /></button>
        <div className="text-center">
          <h1 className="text-lg font-black uppercase tracking-tight">Checkout</h1>
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
                    <FaUser /> Delivery Info
                  </h3>
                  <button 
                    type="button" 
                    onClick={detectLocation}
                    className="flex items-center gap-2 text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-xl transition-all active:scale-95"
                  >
                    <FaCrosshairs className={locLoading ? 'animate-spin' : ''} />
                    {locLoading ? 'SEARCHING...' : 'USE CURRENT'}
                  </button>
              </div>

              <div className="space-y-4">
                <input type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                <input type="tel" className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                <textarea className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl py-4 px-6 outline-none font-bold" placeholder="Full Address" rows="4" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
               <h3 className="text-xl font-black mb-8" style={{ color: primaryColor }}><FaMoneyBillWave /> Payment</h3>
               <div className="grid grid-cols-1 gap-4">
                  <div onClick={() => setFormData({...formData, paymentMethod: 'COD'})} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'bg-red-50 border-red-500' : 'bg-white'}`}>
                    <div className="flex items-center gap-4">
                        <FaMoneyBillWave className="text-2xl text-red-600" />
                        <div>
                            <div className="font-black text-sm uppercase text-gray-800">Cash On Delivery</div>
                            <div className="text-[10px] font-bold text-gray-400">Pay at your doorstep</div>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 sticky top-24">
               <h3 className="text-lg font-black mb-6">Summary</h3>
               <div className="space-y-4 mb-8">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-bold pb-2 border-b border-gray-50">
                      <span className="text-gray-600">{item.qty}x {item.name}</span>
                      <span>Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-100">
                  <div className="flex justify-between text-gray-500 font-bold text-xs uppercase"><span>Subtotal</span><span>Rs. {totals.subtotal}</span></div>
                  <div className="flex justify-between text-gray-500 font-bold text-xs uppercase"><span>Delivery</span><span>Rs. {totals.delivery}</span></div>
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-gray-100 mt-2" style={{ color: primaryColor }}>
                    <span>TOTAL</span><span>Rs. {totals.total}</span>
                  </div>
               </div>

               <button 
                  type="button" 
                  onClick={handleOrderSubmit} 
                  className="w-full py-5 rounded-[2rem] mt-8 text-white font-black text-xl shadow-2xl transition-all active:scale-95" 
                  style={{ backgroundColor: primaryColor }}
               >
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