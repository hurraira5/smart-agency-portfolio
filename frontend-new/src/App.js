import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import './App.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = "https://smart-agency-api.vercel.app";

function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [showLocation, setShowLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/menu`)
      .then(res => setMenu(res.data))
      .catch(err => console.error("Menu Load Error:", err));
  }, []);

  const addToCart = (item) => {
    setCart([...cart, item]);
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000
    });
    Toast.fire({ icon: 'success', title: 'Added to Cart!' });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const { value: formValues } = await Swal.fire({
      title: 'Order Details',
      html:
        '<input id="name" class="swal2-input" placeholder="Full Name">' +
        '<input id="phone" class="swal2-input" placeholder="Phone Number">' +
        '<textarea id="address" class="swal2-textarea" placeholder="Full Delivery Address"></textarea>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirm Order',
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        if (!name || !phone || !address) {
          Swal.showValidationMessage('Saari fields bharein!');
          return false;
        }
        return { customer_name: name, phone: phone, address: address };
      }
    });

    if (formValues) {
      setLoading(true);
      try {
        await axios.post(`${API_BASE_URL}/api/orders`, {
          ...formValues,
          items: cart,
          total_amount: cart.reduce((a, b) => a + parseInt(b.price || 0), 0),
          status: 'pending'
        });
        setCart([]);
        setLoading(false);
        Swal.fire('Ordered!', 'Order confirmed ho gaya hai!', 'success');
      } catch (error) {
        setLoading(false);
        Swal.fire('Error', 'Order nahi ho saka!', 'error');
      }
    }
  };

  return (
    <div className="bg-white min-vh-100">
      {showLocation && (
        <div className="modal-overlay">
          <div className="location-modal text-center p-5 shadow-lg">
             <img src="https://burgeroclock.com.pk/images/logo.png" width="120" alt="logo" className="mb-3"/>
             <h4 className="fw-bold">Welcome</h4>
             <div className="d-flex justify-content-around mt-4">
                <button className="btn btn-warning fw-bold px-5 py-2 rounded-pill" onClick={() => setShowLocation(false)}>Karachi</button>
                <button className="btn btn-warning fw-bold px-5 py-2 rounded-pill" onClick={() => setShowLocation(false)}>Lahore</button>
             </div>
          </div>
        </div>
      )}

      <nav className="navbar navbar-light bg-light shadow-sm p-3 sticky-top">
        <div className="container d-flex justify-content-between align-items-center">
          <h2 className="fw-bold m-0">BURGER <span className="text-warning">O'CLOCK</span></h2>
          <div className="h4 m-0">🛒 {cart.length}</div>
        </div>
      </nav>

      <div className="container mt-4 pb-5">
        <div className="row">
          <div className="col-md-8">
            <h3 className="fw-bold mb-4 border-bottom pb-2">Exclusive Deals</h3>
            <div className="row">
              {menu.map(item => (
                <div key={item.id} className="col-md-6 mb-4">
                  <div className="card shadow-sm border-0 food-card p-3">
                    <img src={item.image_url || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400"} className="card-img-top rounded" style={{height:'180px', objectFit:'cover'}} alt="food" />
                    <div className="card-body text-center">
                        <h5 className="fw-bold text-uppercase">{item.name}</h5>
                        <p className="price-tag mb-3">Rs. {item.price}</p>
                        <button className="add-btn w-100 border-0" onClick={() => addToCart(item)}>ADD TO CART</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-4">
            <div className="cart-sidebar shadow-sm p-4 sticky-top" style={{top:'100px'}}>
              <h4 className="fw-bold mb-4">Your Basket</h4>
              <div style={{maxHeight:'250px', overflowY:'auto'}}>
                {cart.map((c, i) => (
                  <div key={i} className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                    <span>{c.name}</span>
                    <b className="text-danger">Rs. {c.price}</b>
                  </div>
                ))}
              </div>
              <div className="h5 mt-4 d-flex justify-content-between fw-bold border-top pt-3">
                <span>Total Bill:</span>
                <span className="text-success">Rs. {cart.reduce((a, b) => a + parseInt(b.price || 0), 0)}</span>
              </div>
              <button 
                className="btn btn-warning w-100 fw-bold py-3 mt-3 rounded-pill shadow-sm" 
                onClick={handleCheckout} 
                disabled={loading || cart.length === 0}
              >
                {loading ? "Ordering..." : "CHECKOUT NOW"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;