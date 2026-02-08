import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Shop = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branchStatus, setBranchStatus] = useState('active'); // New State
  
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const currentBranchId = id || 1;

  useEffect(() => {
    fetchMenuAndStatus();
  }, [currentBranchId]);

  const fetchMenuAndStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Branch Info (Status check karne ke liye)
      const branchRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${currentBranchId}`);
      setBranchStatus(branchRes.data.status || 'active');

      // 2. Fetch Menu Items
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${currentBranchId}`);
      if (res.data && res.data.length > 0) {
        setMenuItems(res.data);
        const cats = ['All', ...new Set(res.data.map(item => item.category))];
        setCategories(cats);
      } else {
        setError(`Is branch mein abhi koi items nahi hain.`);
      }
      setLoading(false);
    } catch (err) {
      setError("Server connection failed.");
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    // Check if branch is offline
    if (branchStatus !== 'active') {
      alert("Maazrat! Ye branch abhi orders nahi le rahi.");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem.qty === 1) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map(item =>
        item.id === itemId ? { ...item, qty: item.qty - 1 } : item
      );
    });
  };

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const getCartCount = () => cart.reduce((total, item) => total + item.qty, 0);

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) return <div className="text-center mt-5"><h5>Loading Menu...</h5></div>;

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div className="bg-danger text-white p-3 text-center sticky-top shadow-sm">
        <h4 className="fw-bold mb-0">🍔 BURGER O'CLOCK</h4>
      </div>

      {/* BRANCH STATUS BANNER (If not active) */}
      {branchStatus !== 'active' && (
        <div className="bg-dark text-warning p-2 text-center fw-bold shadow-sm">
          ⚠️ Maazrat! Ye branch abhi band hai (Offline).
        </div>
      )}

      {/* Categories Bar */}
      <div className="d-flex overflow-auto p-2 bg-white border-bottom sticky-top" style={{ top: '56px', zIndex: 10, scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-sm me-2 rounded-pill px-4 fw-bold ${activeCategory === cat ? 'btn-danger text-white' : 'btn-outline-danger'}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="container py-3">
        {error && <div className="alert alert-warning text-center">{error}</div>}
        
        <div className="row g-3">
          {filteredItems.map(item => {
            const cartItem = cart.find(c => c.id === item.id);
            const isOffline = branchStatus !== 'active';

            return (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                <div className={`card border-0 shadow-sm h-100 rounded-4 overflow-hidden ${isOffline ? 'opacity-75' : ''}`}>
                  <div className="text-center p-2 bg-light">
                    <img src="https://via.placeholder.com/150?text=Burger" className="img-fluid rounded-3" style={{ height: '140px', objectFit: 'cover', filter: isOffline ? 'grayscale(100%)' : 'none' }} alt={item.name} />
                  </div>
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="text-muted small mb-2" style={{ fontSize: '0.75rem', height: '35px', overflow: 'hidden' }}>{item.description || "Tasty and fresh!"}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-danger">Rs. {item.price}</span>
                      
                      {!cartItem ? (
                        <button 
                          onClick={() => addToCart(item)} 
                          disabled={isOffline}
                          className={`btn btn-sm px-4 rounded-pill fw-bold ${isOffline ? 'btn-secondary' : 'btn-danger'}`}
                        >
                          {isOffline ? 'OFFLINE' : 'ADD'}
                        </button>
                      ) : (
                        <div className={`d-flex align-items-center border rounded-pill ${isOffline ? 'border-secondary text-secondary' : 'border-danger'}`}>
                          <button disabled={isOffline} onClick={() => removeFromCart(item.id)} className="btn btn-sm px-2">-</button>
                          <span className="px-2 fw-bold">{cartItem.qty}</span>
                          <button disabled={isOffline} onClick={() => addToCart(item)} className="btn btn-sm px-2">+</button>
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

      {/* STICKY CART BAR (Only shows if active and items in cart) */}
      {cart.length > 0 && branchStatus === 'active' && (
        <div className="fixed-bottom p-3">
          <button 
            onClick={() => navigate('/checkout', { state: { cart, total: getCartTotal(), branchId: currentBranchId } })}
            className="btn btn-danger w-100 py-3 rounded-4 shadow-lg d-flex justify-content-between px-4 align-items-center"
          >
            <div className="d-flex align-items-center">
              <span className="bg-white text-danger rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" style={{ width: '25px', height: '25px' }}>
                {getCartCount()}
              </span>
              <span className="fw-bold text-uppercase">View Cart</span>
            </div>
            <span className="fw-bold">Rs. {getCartTotal()}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;