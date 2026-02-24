import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaShoppingBasket, FaPlus, FaMinus, FaSearch, 
  FaChevronRight, FaMapMarkerAlt, FaTimes 
} from 'react-icons/fa';

const Shop = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  
  const [branch, setBranch] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Branch aur Menu ka Data Fetching
    axios.get(`https://smart-agency-api.vercel.app/api/branches/${branchId}`).then(res => setBranch(res.data));
    axios.get(`https://smart-agency-api.vercel.app/api/menu/${branchId}`).then(res => setMenu(res.data));
    axios.get(`https://smart-agency-api.vercel.app/api/branches/${branchId}/categories`).then(res => setCategories(res.data));
  }, [branchId]);

  const addToCart = (item) => {
    const exist = cart.find(x => x.id === item.id);
    if (exist) {
      setCart(cart.map(x => x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const exist = cart.find(x => x.id === item.id);
    if (exist.qty === 1) {
      setCart(cart.filter(x => x.id !== item.id));
    } else {
      setCart(cart.map(x => x.id === item.id ? { ...exist, qty: exist.qty - 1 } : x));
    }
  };

  const totalPrice = cart.reduce((a, c) => a + c.price * c.qty, 0);

  // Naye Checkout Page par janay ka logic
  const goToCheckout = () => {
    if (cart.length === 0) {
      alert("Bhai, pehle kuch select toh kar lo! 🍔");
      return;
    }
    // Data save kar rahe hain taaki Checkout page utha sakay
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('currentBranch', JSON.stringify(branch));
    navigate('/checkout');
  };

  if (!branch) return (
    <div className="h-screen flex items-center justify-center font-black italic text-2xl animate-pulse text-red-600 tracking-tighter">
      SMART LOADING...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 p-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic" style={{ color: branch.theme_color }}>
            {branch.branch_name}
          </h1>
          <p className="text-[10px] font-black text-gray-400 flex items-center gap-1 uppercase tracking-widest mt-1">
            <FaMapMarkerAlt /> Open for Delivery
          </p>
        </div>
        <button onClick={() => setShowCart(true)} className="w-14 h-14 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-center relative shadow-xl active:scale-90 transition-all">
          <FaShoppingBasket size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white">
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {/* 2. SEARCH & CATEGORIES */}
      <div className="max-w-xl mx-auto p-6 space-y-8">
        <div className="relative">
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search your cravings..." 
            className="w-full p-6 pl-16 bg-white rounded-[2.5rem] shadow-sm outline-none font-bold text-sm border-none focus:ring-2 focus:ring-gray-100 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          <button 
            onClick={() => setActiveCat('All')} 
            className={`px-8 py-4 rounded-full font-black text-[10px] uppercase whitespace-nowrap transition-all ${activeCat === 'All' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCat(cat.name)} 
              className={`px-8 py-4 rounded-full font-black text-[10px] uppercase whitespace-nowrap transition-all ${activeCat === cat.name ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 3. MENU LIST */}
        <div className="grid grid-cols-1 gap-4">
          {menu
            .filter(item => (activeCat === 'All' || item.category === activeCat))
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:shadow-md transition-all border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-gray-100 rounded-[2rem] overflow-hidden shadow-inner flex-shrink-0">
                  <img src={item.image_url || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-gray-800 uppercase italic tracking-tighter text-lg leading-tight">{item.name}</h3>
                  <p className="text-xs font-bold text-red-600 mt-1">Rs. {item.price}</p>
                </div>
              </div>
              <button 
                onClick={() => addToCart(item)} 
                className="w-12 h-12 bg-gray-50 text-gray-800 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90"
              >
                <FaPlus />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. STICKY BOTTOM BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-gray-900 text-white p-6 rounded-[3rem] shadow-2xl flex justify-between items-center z-50 animate-in slide-in-from-bottom-10">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{cart.length} Items</p>
            <p className="text-2xl font-black italic">Rs. {totalPrice}</p>
          </div>
          <button 
            onClick={() => setShowCart(true)} 
            className="bg-white text-black px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-lg"
          >
            View Cart <FaChevronRight />
          </button>
        </div>
      )}

      {/* 5. CART DRAWER (Slide-over) */}
      {showCart && (
        <div className="fixed inset-0 z-[55] overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white rounded-l-[3.5rem] shadow-2xl p-10 flex flex-col animate-in slide-in-from-right-full duration-500">
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-gray-800 italic uppercase tracking-tighter leading-none">My Bag</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-300 hover:text-red-600 transition-all"><FaTimes size={24}/></button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-8 no-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 text-xs shadow-inner">
                      x{item.qty}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase italic tracking-tighter">{item.name}</h4>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Rs. {item.price * item.qty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(item)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-600 transition-all"><FaMinus /></button>
                    <button onClick={() => addToCart(item)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xs hover:bg-green-50 hover:text-green-600 transition-all"><FaPlus /></button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <p className="font-black text-gray-200 text-5xl uppercase italic tracking-tighter">Empty</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add something delicious!</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-10 border-t border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Payable Amount</p>
                  <p className="text-3xl font-black italic tracking-tighter">Rs. {totalPrice}</p>
                </div>
              </div>
              <button 
                onClick={goToCheckout} 
                className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-black"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;