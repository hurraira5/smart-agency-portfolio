import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // URL se branch ID pakadne ke liye
  
  // Cart aur Total data handle karna
  const { cart, total } = location.state || { cart: [], total: 0 };
  const currentBranchId = id || 1; // Agar URL mein na ho toh default 1

  const [formData, setFormData] = useState({
    fullName: '', 
    mobile: '', 
    address: '', 
    landmark: '', 
    city: 'Karachi', 
    paymentMethod: 'Cash on Delivery'
  });

  const deliveryFee = 100;
  const grandTotal = total + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Order Data ko sahi sequence mein organize kiya
    const orderData = {
      branch_id: parseInt(currentBranchId), 
      customer_name: formData.fullName,
      customer_phone: formData.mobile,
      customer_address: `${formData.address}${formData.landmark ? ', ' + formData.landmark : ''}`,
      city: formData.city,
      items: cart,
      total_amount: grandTotal,
      payment_method: formData.paymentMethod
    };

    console.log("Attempting to send order:", orderData);

    try {
      // 2. API Call
      const res = await axios.post('https://smart-agency-api.vercel.app/api/orders', orderData);
      
      // 3. Status 200 ya 201 dono success hain
      if (res.status === 201 || res.status === 200) {
        navigate('/thank-you', { state: { order: res.data } });
      }
    } catch (err) {
      // 4. Console mein poori detail error ki
      console.error("Order Error Detail:", err.response?.data || err.message);
      
      // 5. Asli wajah screen par dikhayega (Debugging)
      const errorDetail = err.response?.data?.details || err.response?.data?.error || err.message;
      alert(`Order Failed: ${errorDetail}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-danger text-white p-3 shadow-sm d-flex align-items-center sticky-top">
        <button onClick={() => navigate(-1)} className="btn text-white me-2 p-0">←</button>
        <h5 className="mb-0 fw-bold">Checkout</h5>
      </div>

      <div className="container py-3">
        <form onSubmit={handleSubmit}>
          {/* Customer Info Card */}
          <div className="card border-0 shadow-sm p-3 mb-3 rounded-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Delivery Information 🛵</h6>
            <div className="mb-3">
              <label className="small fw-bold">Full Name *</label>
              <input type="text" className="form-control bg-light border-0" placeholder="Enter Full Name" required 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="small fw-bold">Mobile Number *</label>
              <input type="text" className="form-control bg-light border-0" placeholder="03xx-xxxxxxx" required 
                onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="small fw-bold">Delivery Address *</label>
              <textarea className="form-control bg-light border-0" rows="2" placeholder="House/Flat #, Street" required 
                onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="small fw-bold">Nearest Landmark</label>
              <input type="text" className="form-control bg-light border-0" placeholder="e.g Near Mosque" 
                onChange={(e) => setFormData({...formData, landmark: e.target.value})} />
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="card border-0 shadow-sm p-3 mb-4 rounded-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Your Order Summary</h6>
            {cart.length > 0 ? cart.map(item => (
              <div key={item.id} className="d-flex justify-content-between mb-2">
                <span className="small">{item.qty} x {item.name}</span>
                <span className="small fw-bold">Rs. {item.price * item.qty}</span>
              </div>
            )) : <p className="text-muted small">Your cart is empty</p>}
            
            <hr className="my-2" />
            <div className="d-flex justify-content-between small"><span>Subtotal</span><span>Rs. {total}</span></div>
            <div className="d-flex justify-content-between small"><span>Delivery Fee</span><span>Rs. {deliveryFee}</span></div>
            <div className="d-flex justify-content-between fw-bold mt-2 text-danger"><span>Grand Total</span><span>Rs. {grandTotal}</span></div>
          </div>

          <button type="submit" className="btn btn-danger w-100 py-3 rounded-pill shadow-lg fw-bold sticky-bottom mb-4">
            PLACE ORDER →
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;