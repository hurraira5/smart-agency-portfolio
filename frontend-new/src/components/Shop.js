import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaMapMarkerAlt, FaSearch, FaPhoneAlt, FaChevronRight } from 'react-icons/fa';

const Shop = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branchStatus, setBranchStatus] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Location & Popup States
  const [showPopup, setShowPopup] = useState(!localStorage.getItem('selectedArea'));
  const [selectedArea, setSelectedArea] = useState(localStorage.getItem('selectedArea') || '');
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(JSON.parse(localStorage.getItem('activeBranch')) || null);

  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/2/branches`);
        setBranches(res.data || []);
      } catch (err) { console.error("Error loading branches", err); }
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
    } catch (err) { setError("Connection failed."); setLoading(false); }
  };

  const handleLocationConfirm = (area) => {
    const matchedBranch = branches.find(b => b.delivery_areas?.toLowerCase().includes(area.toLowerCase()));
    if (matchedBranch) {
      setSelectedArea(area);
      setCurrentBranch(matchedBranch);
      localStorage.setItem('selectedArea', area);
      localStorage.setItem('activeBranch', JSON.stringify(matchedBranch));
      setShowPopup(false);
      navigate(`/shop/${matchedBranch.id}`);
    } else {
      alert("Maazrat! No delivery in this area.");
    }
  };

  const addToCart = (item) => {
    if (branchStatus !== 'active') return;
    setCart(prev => {
      const exist = prev.find(i => i.id === item.id);
      return exist ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...item, qty: 1 }];
    });
  };

  const filteredItems = menuItems.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* 📍 POPUP MODAL */}
      {showPopup && (
        <div className="modal-overlay">
          <div className="location-modal shadow-lg border-0">
            <h4 className="fw-bold mb-3 mt-2">Delivering to. Karein 😋</h4>
            <div className="row g-3 px-2">
              {['Johar', 'Gulshan', 'DHA', 'Malir'].map(area => (
                <div key={area} className="col-6">
                  <div className="city-card py-3 border rounded-4" onClick={() => handleLocationConfirm(area)}>
                    <FaMapMarkerAlt className="text-danger mb-2" size={24} />
                    <span className="fw-bold d-block">{area}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVBAR (As per Screenshot) */}
      <nav className="navbar navbar-light bg-white shadow-sm py-3 px-lg-5 sticky-top">
        <div className="container-fluid">
          <h2 className="fw-bold text-success mb-0" style={{ letterSpacing: '1px' }}>FOODIE'S HUB</h2>
          
          <div className="d-none d-md-flex align-items-center flex-grow-1 mx-5">
            <div className="input-group bg-light rounded-pill px-3 py-1">
              <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted" /></span>
              <input type="text" className="form-control bg-transparent border-0 shadow-none" placeholder="Search your favorite food..." onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="d-flex align-items-center">
            <div className="me-3 text-end d-none d-sm-block">
              <small className="text-muted d-block">Call us for help</small>
              <span className="fw-bold"><FaPhoneAlt className="me-1" /> 021 3456789</span>
            </div>
            <button className="btn btn-outline-danger rounded-pill px-4 fw-bold">Sign In</button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-lg-5 py-4">
        <div className="row g-4">
          
          {/* SIDEBAR (As per Screenshot) */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="card border-0 rounded-4 shadow-sm p-4 mb-4">
              <div className="d-flex align-items-center mb-4 p-3 rounded-4 bg-light border border-danger border-opacity-10">
                <FaMapMarkerAlt className="text-danger fs-4 me-3" />
                <div>
                  <small className="text-muted d-block">Delivering to.</small>
                  <span className="fw-bold">{selectedArea || 'Select Area'}</span>
                </div>
              </div>
              
              <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">CATEGORIES</h6>
              <div className="list-group list-group-flush">
                {['Johar Area', 'DHA', 'Gulshan', 'Special Offers'].map((cat, i) => (
                  <div key={i} className="list-group-item list-group-item-action border-0 px-0 d-flex justify-content-between align-items-center cursor-pointer py-3">
                    <span className="fw-medium text-dark">{cat}</span>
                    <FaChevronRight className="text-muted" size={12} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN MENU SECTION */}
          <div className="col-lg-9">
            {/* Status & Categories Banner */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex gap-2">
                <span className={`badge rounded-pill px-4 py-2 ${branchStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                  {branchStatus === 'active' ? 'OPEN NOW' : 'CLOSED'}
                </span>
                <span className="badge bg-danger rounded-pill px-4 py-2">HOT DEALS</span>
              </div>
            </div>

            {/* Scrolling Category Bar */}
            <div className="d-flex overflow-auto mb-4 py-2 sticky-top bg-light" style={{ top: '80px', zIndex: 5, scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`btn me-2 rounded-pill px-4 fw-bold shadow-sm transition ${activeCategory === cat ? 'btn-success' : 'btn-white text-muted border'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="row g-4">
              {filteredItems.map(item => {
                const cartItem = cart.find(c => c.id === item.id);
                return (
                  <div key={item.id} className="col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden product-card">
                      <div className="p-3 bg-white text-center position-relative">
                        <img src="https://via.placeholder.com/300x200?text=Combo+Deal" className="img-fluid rounded-4" style={{ height: '180px', objectFit: 'contain' }} alt={item.name} />
                        <span className="position-absolute top-0 start-0 m-3 badge bg-danger rounded-pill px-3">BEST SELLER</span>
                      </div>
                      <div className="card-body p-4">
                        <h5 className="fw-bold mb-2 text-dark">{item.name}</h5>
                        <p className="text-muted small mb-4" style={{ height: '40px', overflow: 'hidden' }}>{item.description || "Fresh and hot deal just for you!"}</p>
                        <div className="d-flex justify-content-between align-items-center pt-2">
                          <div>
                            <small className="text-muted d-block">Price</small>
                            <span className="fw-bold fs-4 text-dark">Rs. {item.price}</span>
                          </div>
                          {!cartItem ? (
                            <button onClick={() => addToCart(item)} className="btn btn-danger rounded-3 px-4 fw-bold shadow py-2">ADD</button>
                          ) : (
                            <div className="d-flex align-items-center bg-danger rounded-3 text-white overflow-hidden shadow">
                              <button onClick={() => addToCart(item)} className="btn text-white px-2 py-2 shadow-none">+</button>
                              <span className="px-3 fw-bold">{cartItem.qty}</span>
                              <button onClick={() => addToCart(item)} className="btn text-white px-2 py-2 shadow-none">-</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STICKY FOOTER CART */}
      {cart.length > 0 && (
        <div className="fixed-bottom p-4 bg-white border-top shadow-lg d-flex justify-content-between align-items-center px-lg-5">
          <div className="d-none d-md-block">
            <h5 className="fw-bold mb-0 text-dark">Order Summary</h5>
            <small className="text-muted">{cart.length} items added to your tray</small>
          </div>
          <button onClick={() => navigate('/checkout', { state: { cart, branchId: currentBranch?.id } })} className="btn btn-danger rounded-pill px-5 py-3 fw-bold shadow-lg d-flex justify-content-between gap-5">
            <span className="text-uppercase">Proceed to Checkout</span>
            <span>Rs. {cart.reduce((t, i) => t + (i.price * i.qty), 0)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;