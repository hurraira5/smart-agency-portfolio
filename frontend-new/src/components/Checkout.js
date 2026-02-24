import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaChevronLeft, FaUser, FaPhoneAlt, FaMapMarkerAlt, 
  FaHome, FaCreditCard, FaTruck, FaReceipt, FaChevronRight 
} from 'react-icons/fa';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [branch, setBranch] = useState(null);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    area: '',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const savedBranch = JSON.parse(localStorage.getItem('currentBranch'));
    
    if (savedCart.length === 0 || !savedBranch) {
      navigate('/');
      return;
    }

    setCart(savedCart);
    setBranch(savedBranch);

    axios.get(`https://smart-agency-api.vercel.app/api/branches/${savedBranch.id}/delivery-areas`)
      .then(res => setDeliveryAreas(res.data))
      .catch(err => console.log("Areas load nahi huay"));
  }, [navigate]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const selectedAreaData = deliveryAreas.find(a => a.area_name === customer.area);
  const deliveryFee = selectedAreaData ? Number(selectedAreaData.delivery_fee) : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleConfirmOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address || !customer.area) {
      alert("Bhai, saari details bharna zaroori hain! 🙏");
      return;
    }

    setLoading(true);

    const orderPayload = {
      branch_id: branch.id,
      customer_details: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        area: customer.area
      },
      items: cart,
      payment_method: customer.paymentMethod,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      status: 'pending'
    };

    try {
      // 1. Order API par bhej rahe hain
      const response = await axios.post("https://smart-agency-api.vercel.app/api/orders", orderPayload);
      
      // 2. LocalStorage saaf kar rahe hain
      localStorage.removeItem('cart');

      // 3. IMPORTANT: ThankYou page ko data ke sath navigate kar rahe hain
      // Agar API poora order return karti hai toh response.data bhejien
      navigate('/thank-you', { 
        state: { 
          order: response.data.order || { 
            id: response.data.orderId || Math.floor(Math.random() * 100000), // Fallback ID
            ...orderPayload,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_address: customer.address,
            created_at: new Date()
          } 
        } 
      });

    } catch (err) {
      alert("Order failed! Internet check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans pb-10">
      {/* Top Header */}
      <div className="bg-white p-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all">
            <FaChevronLeft />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Checkout</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">{branch?.branch_name}</p>
          </div>
        </div>
        <FaReceipt className="text-gray-200" size={24} />
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* LEFT COLUMN: Customer Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-8 tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span> Delivery Information
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" placeholder="Your Name" className="w-full bg-gray-50 p-5 pl-16 rounded-[1.5rem] font-bold outline-none border-none focus:ring-2 focus:ring-red-50 transition-all" 
                  onChange={(e) => setCustomer({...customer, name: e.target.value})} />
              </div>

              <div className="relative">
                <FaPhoneAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" placeholder="Phone Number" className="w-full bg-gray-50 p-5 pl-16 rounded-[1.5rem] font-bold outline-none border-none focus:ring-2 focus:ring-red-50 transition-all" 
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
              </div>

              <div className="relative">
                <FaMapMarkerAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <select className="w-full bg-gray-50 p-5 pl-16 rounded-[1.5rem] font-bold outline-none border-none appearance-none cursor-pointer" 
                  onChange={(e) => setCustomer({...customer, area: e.target.value})}>
                  <option value="">Select Delivery Area</option>
                  {deliveryAreas.map(a => <option key={a.id} value={a.area_name}>{a.area_name} (Rs. {a.delivery_fee})</option>)}
                </select>
              </div>

              <div className="relative">
                <FaHome className="absolute left-6 top-6 text-gray-300" />
                <textarea rows="4" placeholder="Full Address..." className="w-full bg-gray-50 p-5 pl-16 rounded-[1.5rem] font-bold outline-none border-none focus:ring-2 focus:ring-red-50 transition-all"
                  onChange={(e) => setCustomer({...customer, address: e.target.value})}></textarea>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-[0.2em]">Payment</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCustomer({...customer, paymentMethod: 'COD'})} 
                className={`p-6 rounded-[2rem] border-2 font-black uppercase text-[10px] tracking-widest flex flex-col items-center gap-3 transition-all ${customer.paymentMethod === 'COD' ? 'border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-200' : 'border-gray-100 text-gray-400'}`}>
                <FaTruck size={20} /> Cash on Delivery
              </button>
              <button disabled className="p-6 rounded-[2rem] border-2 border-gray-50 text-gray-200 font-black uppercase text-[10px] tracking-widest flex flex-col items-center gap-3 cursor-not-allowed opacity-50">
                <FaCreditCard size={20} /> Online (Soon)
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-gray-900 text-white p-10 rounded-[3.5rem] shadow-2xl sticky top-28">
            <h3 className="text-xs font-black uppercase text-gray-500 mb-10 tracking-[0.3em]">Your Order</h3>
            
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 mb-10 no-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-[10px] text-gray-400 group-hover:bg-white/20 transition-all">
                      {item.qty}x
                    </div>
                    <p className="text-sm font-bold uppercase tracking-tighter">{item.name}</p>
                  </div>
                  <p className="text-sm font-black italic">Rs. {item.price * item.qty}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-8 space-y-4">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Items Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Delivery Charge</span>
                <span>Rs. {deliveryFee}</span>
              </div>
              <div className="flex justify-between items-end pt-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] mb-1">Total Payable</p>
                  <p className="text-4xl font-black italic tracking-tighter">Rs. {totalAmount}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleConfirmOrder} 
              disabled={loading}
              className={`w-full py-7 bg-red-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] mt-12 shadow-2xl shadow-red-900/40 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? 'Processing...' : 'Place Order Now'} <FaChevronRight />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;