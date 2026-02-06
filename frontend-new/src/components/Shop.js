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
  
  // Cart State
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const { id } = useParams();
  const currentBranchId = id || 1;

  useEffect(() => {
    fetchMenu();
  }, [currentBranchId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${currentBranchId}`);
      if (res.data && res.data.length > 0) {
        setMenuItems(res.data);
        const cats = ['All', ...new Set(res.data.map(item => item.category))];
        setCategories(cats);
      } else {
        setError(`Branch ${currentBranchId} mein items nahi hain.`);
      }
      setLoading(false);
    } catch (err) {
      setError("Server connection failed.");
      setLoading(false);
    }
  };

  // Add to Cart Logic
  const addToCart = (item) => {
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

  // Remove/Decrease from Cart
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

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="bg-danger text-white p-3 text-center sticky-top shadow-sm">
        <h4 className="fw-bold mb-0">🍔 BURGER O'CLOCK</h4>
      </div>

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
        <div className="row g-3">
          {filteredItems.map(item => {
            const cartItem = cart.find(c => c.id === item.id);
            return (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                  <div className="text-center p-2 bg-light">
                    <img src="https://via.placeholder.com/150?text=Burger" className="img-fluid rounded-3" style={{ height: '140px', objectFit: 'cover' }} alt={item.name} />
                  </div>
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="text-muted small mb-2" style={{ fontSize: '0.75rem', height: '35px', overflow: 'hidden' }}>{item.description || "Tasty and fresh!"}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-danger">Rs. {item.price}</span>
                      
                      {!cartItem ? (
                        <button onClick={() => addToCart(item)} className="btn btn-danger btn-sm px-4 rounded-pill fw-bold">ADD</button>
                      ) : (
                        <div className="d-flex align-items-center border border-danger rounded-pill">
                          <button onClick={() => removeFromCart(item.id)} className="btn btn-sm text-danger px-2">-</button>
                          <span className="px-2 fw-bold">{cartItem.qty}</span>
                          <button onClick={() => addToCart(item)} className="btn btn-sm text-danger px-2">+</button>
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

      {/* CALIFORNIA PIZZA STYLE STICKY CART BAR */}
      {cart.length > 0 && (
        <div className="fixed-bottom p-3">
          <button 
            onClick={() => navigate('/checkout', { state: { cart, total: getCartTotal() } })}
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