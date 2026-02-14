import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaMapMarkerAlt, FaSearch, FaPhoneAlt, FaChevronRight, FaShoppingCart, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';

const Shop = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [branchStatus, setBranchStatus] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // For Item Details Popup
  
  const [showPopup, setShowPopup] = useState(!localStorage.getItem('selectedArea'));
  const [selectedArea, setSelectedArea] = useState(localStorage.getItem('selectedArea') || '');
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(JSON.parse(localStorage.getItem('activeBranch')) || null);

  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch Data Logic
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/2/branches`);
        setBranches(res.data || []);
      } catch (err) { console.error("Error branches", err); }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const branchIdToLoad = id || (currentBranch ? currentBranch.id : null);
    if (branchIdToLoad) fetchMenuAndStatus(branchIdToLoad);
  }, [id, currentBranch]);

  const fetchMenuAndStatus = async (branchId) => {
    try {
      setLoading(true);
      const branchRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${branchId}`);
      setBranchStatus(branchRes.data.status || 'active');
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${branchId}`);
      setMenuItems(res.data || []);
      setCategories(['All', ...new Set((res.data || []).map(item => item.category))]);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const addToCart = (item) => {
    if (branchStatus !== 'active') return;
    setCart(prev => {
      const exist = prev.find(i => i.id === item.id);
      if (exist) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setSelectedItem(null); // Close popup after adding
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
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* 📍 LOCATION POPUP (Indolj Animation) */}
      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="location-modal shadow-lg border-0">
              <h3 className="fw-bold mb-4">Pehle Apka Area? 📍</h3>
              <div className="row g-3">
                {['Johar', 'Gulshan', 'DHA', 'Malir'].map(area => (
                  <div key={area} className="col-6">
                    <div className="city-card py-4 border rounded-4" onClick={() => { setSelectedArea(area); setShowPopup(false); }}>
                      <FaMapMarkerAlt className="text-danger mb-2" size={28} />
                      <span className="fw-bold d-block">{area}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className="navbar navbar-light bg-white shadow-sm py-3 px-lg-5 sticky-top">
        <div className="container-fluid">
          <motion.h2 whileHover={{ scale: 1.05 }} className="fw-bold text-danger mb-0 cursor-pointer">FOODIE'S HUB</motion.h2>
          
          <div className="d-none d-md-flex align-items-center flex-grow-1 mx-5">
            <div className="input-group bg-light rounded-pill px-3 py-1 border">
              <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted" /></span>
              <input type="text" className="form-control bg-transparent border-0 shadow-none" placeholder="Kya khayenge aaj?" onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div onClick={() => setIsCartOpen(true)} className="position-relative cursor-pointer bg-light p-3 rounded-circle border">
              <FaShoppingCart size={20} className="text-dark" />
              {cart.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{cart.length}</span>}
            </div>
            <button className="btn btn-danger rounded-pill px-4 fw-bold d-none d-sm-block">SIGN IN</button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="container-fluid px-lg-5 py-4">
        <div className="row g-4">
          
          {/* SIDEBAR */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '100px' }}>
              <div className="card border-0 rounded-4 shadow-sm p-4 mb-4">
                <div className="d-flex align-items-center mb-4 p-3 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-25">
                  <FaMapMarkerAlt className="text-danger fs-4 me-3" />
                  <div>
                    <small className="text-muted d-block">Delivering to</small>
                    <span className="fw-bold">{selectedArea || 'Select Area'}</span>
                  </div>
                </div>
                
                <h6 className="fw-bold text-muted mb-3">CATEGORIES</h6>
                <div className="list-group list-group-flush">
                  {categories.map((cat, i) => (
                    <div key={i} onClick={() => setActiveCategory(cat)} className={`list-group-item list-group-item-action border-0 px-2 d-flex justify-content-between align-items-center cursor-pointer py-3 rounded-3 mb-1 ${activeCategory === cat ? 'bg-danger text-white' : ''}`}>
                      <span className="fw-medium">{cat}</span>
                      <FaChevronRight size={12} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="col-lg-9">
            <div className="row g-4">
              {filteredItems.map((item, index) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={item.id} className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden product-card" onClick={() => setSelectedItem(item)}>
                    <div className="p-0 bg-white text-center position-relative">
                      <img src={item.image_url || "https://via.placeholder.com/300x200?text=Indolj+Food"} className="img-fluid" style={{ height: '220px', width: '100%', objectFit: 'cover' }} alt={item.name} />
                      <span className="position-absolute top-0 start-0 m-3 badge bg-danger rounded-pill px-3">BEST SELLER</span>
                    </div>
                    <div className="card-body p-3">
                      <h5 className="fw-bold mb-1 text-dark">{item.name}</h5>
                      <p className="text-muted small mb-3">{item.description?.substring(0, 50)}...</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5 text-danger">Rs. {item.price}</span>
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">+ Add</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ITEM DETAILS POPUP (Indolj Style) */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-white rounded-5 shadow-lg overflow-hidden" style={{ width: '450px', maxWidth: '95%' }}>
              <div className="position-relative">
                <img src={selectedItem.image_url || "https://via.placeholder.com/450x300"} className="w-100" />
                <button onClick={() => setSelectedItem(null)} className="btn btn-white rounded-circle position-absolute top-0 end-0 m-3 shadow"><FaTimes /></button>
              </div>
              <div className="p-4">
                <h3 className="fw-bold">{selectedItem.name}</h3>
                <p className="text-muted">{selectedItem.description || "Indulge in our finest flavors, made fresh just for you."}</p>
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <h4 className="fw-bold text-danger mb-0">Rs. {selectedItem.price}</h4>
                  <button onClick={() => addToCart(selectedItem)} className="btn btn-danger rounded-pill px-5 py-2 fw-bold shadow">Add to Tray</button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="modal-overlay" style={{ zIndex: 2500 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="cart-drawer d-flex flex-column">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-danger text-white">
                <h5 className="fw-bold mb-0">My Tray ({cart.length})</h5>
                <FaTimes onClick={() => setIsCartOpen(false)} className="cursor-pointer" />
              </div>
              
              <div className="flex-grow-1 overflow-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center mt-5">
                    <img src="https://cdn-icons-png.flaticon.com/512/11329/11329073.png" width="100" className="mb-3 opacity-25" />
                    <p className="text-muted">Tray is empty. Bhook lagi hai? 😋</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="d-flex align-items-center mb-4 bg-light p-3 rounded-4">
                      <img src={item.image_url} width="60" height="60" className="rounded-3 me-3 object-fit-cover" />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0">{item.name}</h6>
                        <small className="text-danger fw-bold">Rs. {item.price * item.qty}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2 border rounded-pill bg-white px-2 py-1">
                        <FaMinus size={10} className="cursor-pointer" onClick={() => removeFromCart(item)} />
                        <span className="fw-bold px-2">{item.qty}</span>
                        <FaPlus size={10} className="text-danger cursor-pointer" onClick={() => addToCart(item)} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-top">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-bold fs-5">Total</span>
                    <span className="fw-bold fs-5 text-danger">Rs. {cart.reduce((t, i) => t + (i.price * i.qty), 0)}</span>
                  </div>
                  <button onClick={() => navigate('/checkout', { state: { cart, branchId: currentBranch?.id } })} className="btn btn-danger w-100 rounded-pill py-3 fw-bold shadow-lg">Checkout Now</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING CART BUTTON (Mobile) */}
      {cart.length > 0 && !isCartOpen && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed-bottom p-3 d-lg-none" style={{ zIndex: 1000 }}>
          <button onClick={() => setIsCartOpen(true)} className="btn btn-danger w-100 rounded-pill py-3 shadow-lg d-flex justify-content-between px-4 align-items-center">
            <div className="d-flex align-items-center gap-3">
              <FaShoppingCart />
              <span className="fw-bold">View Tray ({cart.length})</span>
            </div>
            <span className="fw-bold">Rs. {cart.reduce((t, i) => t + (i.price * i.qty), 0)}</span>
          </button>
        </motion.div>
      )}

    </div>
  );
};

export default Shop;