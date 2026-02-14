import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaMapMarkerAlt, FaSearch, FaPhoneAlt, FaChevronRight, FaShoppingCart, FaTimes, FaPlus, FaMinus, FaUtensils } from 'react-icons/fa';
import EntryModal from './EntryModal'; // Import Naya Fuse Style Modal

const Shop = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [branchStatus, setBranchStatus] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Fuse.pk Style States
  const [showEntryModal, setShowEntryModal] = useState(!localStorage.getItem('user_area'));
  const [restaurantTheme, setRestaurantTheme] = useState('#b3001b'); // Default Red
  const [restaurantInfo, setRestaurantInfo] = useState({ name: "FOODIE'S HUB" });

  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentBranch, setCurrentBranch] = useState(JSON.parse(localStorage.getItem('activeBranch')) || null);

  // Set Theme Variables
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', restaurantTheme);
  }, [restaurantTheme]);

  useEffect(() => {
    const branchIdToLoad = id || (currentBranch ? currentBranch.id : null);
    if (branchIdToLoad) fetchMenuAndStatus(branchIdToLoad);
  }, [id, currentBranch]);

  const fetchMenuAndStatus = async (branchId) => {
    try {
      setLoading(true);
      const branchRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${branchId}`);
      setBranchStatus(branchRes.data.status || 'active');
      setRestaurantTheme(branchRes.data.theme_color || '#b3001b'); // Dynamic Color
      setRestaurantInfo({ name: branchRes.data.restaurant_name || "FOODIE'S HUB" });
      
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${branchId}`);
      setMenuItems(res.data || []);
      setCategories(['All', ...new Set((res.data || []).map(item => item.category))]);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const handleEntryConfirm = (data) => {
    localStorage.setItem('user_area', data.location);
    localStorage.setItem('order_type', data.orderType);
    localStorage.setItem('user_phone', data.phone);
    setShowEntryModal(false);
  };

  const addToCart = (item) => {
    if (branchStatus !== 'active') return;
    setCart(prev => {
      const exist = prev.find(i => i.id === item.id);
      if (exist) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setSelectedItem(null);
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const exist = prev.find(i => i.id === item.id);
      if (exist.qty === 1) return prev.filter(i => i.id !== item.id);
      return prev.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const filteredItems = menuItems.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="shop-wrapper">
      
      {/* 🚀 FUSE ENTRY MODAL */}
      <EntryModal 
        isOpen={showEntryModal} 
        onConfirm={handleEntryConfirm} 
        brandName={restaurantInfo.name}
      />

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg sticky-top bg-white/80 backdrop-blur-md border-b">
        <div className="container px-4 py-2">
          <div className="d-flex align-items-center gap-3">
             <div className="brand-logo-small bg-primary-dynamic">
                <FaUtensils className="text-white" />
             </div>
             <h4 className="fw-black mb-0 tracking-tighter text-dark">{restaurantInfo.name}</h4>
          </div>

          <div className="mx-auto d-none d-lg-flex max-w-md w-full px-4">
             <div className="search-box-fuse">
                <FaSearch className="text-muted" />
                <input 
                  type="text" 
                  placeholder="What are you craving?" 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
             </div>
          </div>

          <div className="d-flex gap-3 align-items-center">
             <div onClick={() => setIsCartOpen(true)} className="cart-trigger">
                <FaShoppingCart />
                {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
             </div>
             <button className="btn-signin">SIGN IN</button>
          </div>
        </div>
      </nav>

      {/* CATEGORY BAR (Horizontal Scroll - Fuse Style) */}
      <div className="category-scroller sticky-top-after-nav">
        <div className="container px-4">
          <div className="d-flex gap-2 overflow-auto no-scrollbar py-3">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-4 px-4">
        <div className="row g-4">
          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-5">
              <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" width="120" className="opacity-20 mb-3" />
              <h5 className="text-muted fw-bold">No items found matching "{searchTerm}"</h5>
            </div>
          )}

          {filteredItems.map((item, index) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              key={item.id} 
              className="col-12 col-md-6 col-lg-4 col-xl-3"
            >
              <div className="fuse-card" onClick={() => setSelectedItem(item)}>
                <div className="fuse-card-img">
                  <img src={item.image_url || "https://via.placeholder.com/400x300"} alt={item.name} />
                  <div className="fuse-card-overlay">
                    <span className="price-tag">Rs. {item.price}</span>
                  </div>
                </div>
                <div className="fuse-card-body">
                  <h6 className="item-name">{item.name}</h6>
                  <p className="item-desc">{item.description?.substring(0, 60)}...</p>
                  <button className="btn-add-fuse">
                    <FaPlus /> Add to Tray
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ITEM DETAILS POPUP */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: 'spring', damping: 25 }}
              className="bottom-sheet"
            >
              <div className="sheet-header">
                <div className="drag-handle"></div>
                <button onClick={() => setSelectedItem(null)} className="btn-close-sheet"><FaTimes /></button>
              </div>
              <div className="sheet-content">
                <img src={selectedItem.image_url} className="sheet-img" alt={selectedItem.name} />
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h2 className="fw-black text-2xl">{selectedItem.name}</h2>
                    <span className="text-primary-dynamic fw-bold fs-4">Rs. {selectedItem.price}</span>
                  </div>
                  <p className="text-muted leading-relaxed">{selectedItem.description}</p>
                  
                  <div className="mt-5">
                    <button onClick={() => addToCart(selectedItem)} className="btn-checkout-large">
                       Confirm Addition — Rs. {selectedItem.price}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="modal-overlay" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fuse-drawer">
              <div className="drawer-header">
                <h5 className="fw-black mb-0">My Tray ({cart.length})</h5>
                <FaTimes onClick={() => setIsCartOpen(false)} className="cursor-pointer" />
              </div>
              
              <div className="drawer-body">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <img src="https://cdn-icons-png.flaticon.com/512/11329/11329073.png" width="80" className="opacity-20 mb-3" />
                    <p>Tray is empty. Time to feast! 😋</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item-fuse">
                      <img src={item.image_url} className="cart-item-img" alt={item.name} />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0 text-sm">{item.name}</h6>
                        <small className="text-primary-dynamic fw-bold">Rs. {item.price * item.qty}</small>
                      </div>
                      <div className="qty-control">
                        <FaMinus onClick={() => removeFromCart(item)} />
                        <span>{item.qty}</span>
                        <FaPlus onClick={() => addToCart(item)} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="drawer-footer">
                  <div className="d-flex justify-content-between mb-4">
                    <span className="fw-bold">Subtotal</span>
                    <span className="fw-black fs-5">Rs. {cart.reduce((t, i) => t + (i.price * i.qty), 0)}</span>
                  </div>
                  <button onClick={() => navigate('/checkout', { state: { cart, branchId: currentBranch?.id } })} className="btn-checkout-large shadow-glow">
                    Checkout Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Shop;