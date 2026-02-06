import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Shop = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error check karne ke liye

  // Default branch ID (Check karein ke aapne Manager dashboard mein isi ID par food add kiya hai)
  const branchId = 1; 

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${branchId}`);
      
      if (res.data && res.data.length > 0) {
        setMenuItems(res.data);
        // Unique categories nikalna
        const cats = ['All', ...new Set(res.data.map(item => item.category))];
        setCategories(cats);
        setError(null);
      } else {
        setError("No items found for this branch.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Menu load nahi hua", err);
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header / Navbar jaisa look */}
      <div className="bg-info text-white p-3 text-center sticky-top shadow-sm">
        <h4 className="fw-bold mb-0">🍔 BURGER O'CLOCK</h4>
      </div>

      {/* Categories Scrollable Bar (Mobile Friendly) */}
      <div className="d-flex overflow-auto p-3 bg-white border-bottom sticky-top" style={{ top: '56px', whiteSpace: 'nowrap', scrollbarWidth: 'none', zIndex: 10 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-sm me-2 rounded-pill px-4 fw-bold ${activeCategory === cat ? 'btn-info text-white' : 'btn-outline-secondary'}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="container py-4">
        {loading ? (
          <div className="text-center mt-5"><h5>Loading Menu...</h5></div>
        ) : error ? (
          <div className="text-center mt-5 py-5 bg-white rounded shadow-sm">
            <h5 className="text-muted">{error}</h5>
            <p className="small">Please check Manager Dashboard or Branch ID.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredItems.map(item => (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden" style={{ borderRadius: '15px' }}>
                  <div className="row g-0 h-100">
                    <div className="col-8 p-3 d-flex flex-column justify-content-between">
                      <div>
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <p className="small text-muted mb-2 text-truncate-2" style={{ fontSize: '0.85rem' }}>
                          {item.description || "Fresh and delicious food served hot!"}
                        </p>
                      </div>
                      <div>
                        <span className="badge bg-info-subtle text-info border border-info px-2 py-1 mb-2 rounded-pill">
                          Rs. {item.price}
                        </span>
                      </div>
                    </div>
                    
                    {/* Food Image Section */}
                    <div className="col-4 d-flex align-items-center justify-content-center bg-light">
                      <img 
                        src="https://via.placeholder.com/100?text=Food" 
                        alt={item.name} 
                        className="img-fluid rounded" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                      />
                      <button className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-2 rounded-circle shadow" style={{ width: '32px', height: '32px' }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile Typical) */}
      <div className="fixed-bottom p-3 d-md-none" style={{ bottom: '20px', zIndex: 100 }}>
        <button className="btn btn-dark w-100 py-3 rounded-pill shadow-lg d-flex justify-content-between px-4">
          <span className="fw-bold">View Basket</span>
          <span>Rs. 0</span>
        </button>
      </div>
    </div>
  );
};

export default Shop;