import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, total } = location.state || { cart: [], total: 0 };

  const [formData, setFormData] = useState({
    fullName: '', mobile: '', address: '', landmark: '', city: 'Karachi', paymentMethod: 'Cash on Delivery'
  });

  const deliveryFee = 100;
  const grandTotal = total + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        branch_id: 1, // Branch ID manual ya dynamic
        customer_name: formData.fullName,
        customer_phone: formData.mobile,
        customer_address: `${formData.address}, ${formData.landmark}`,
        city: formData.city,
        items: cart,
        total_amount: grandTotal,
        payment_method: formData.paymentMethod
      };

      const res = await axios.post('https://smart-agency-api.vercel.app/api/orders', orderData);
      if (res.status === 201) {
        navigate('/thank-you', { state: { order: res.data } });
      }
    } catch (err) {
      alert("Order failed! Please try again.");
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="bg-danger text-white p-3 shadow-sm d-flex align-items-center sticky-top">
        <button onClick={() => navigate(-1)} className="btn text-white me-2 p-0">←</button>
        <h5 className="mb-0 fw-bold">Checkout</h5>
      </div>

      <div className="container py-3">
        <form onSubmit={handleSubmit}>
          {/* Customer Info */}
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

          {/* Order Summary */}
          <div className="card border-0 shadow-sm p-3 mb-4 rounded-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Your Order Summary</h6>
            {cart.map(item => (
              <div key={item.id} className="d-flex justify-content-between mb-2">
                <span className="small">{item.qty} x {item.name}</span>
                <span className="small fw-bold">Rs. {item.price * item.qty}</span>
              </div>
            ))}
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