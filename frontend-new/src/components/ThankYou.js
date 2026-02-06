import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h4>No order details found.</h4>
        <button onClick={() => navigate('/')} className="btn btn-danger rounded-pill mt-3">Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '30px' }}>
      {/* Top Banner */}
      <div className="bg-success text-white text-center p-4 shadow-sm mb-4">
        <h2 className="fw-bold">Thank You! 🎉</h2>
        <p className="mb-0">Your order has been placed successfully</p>
      </div>

      <div className="container">
        {/* Order Status Card */}
        <div className="card border-0 shadow-sm p-3 mb-3 rounded-4">
          <div className="d-flex justify-content-between align-items-center">
             <div>
                <span className="text-muted small d-block">Order No:</span>
                <span className="fw-bold fs-5">#{order.id}</span>
             </div>
             <div className="text-end">
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Received 🔴</span>
             </div>
          </div>
        </div>

        {/* Customer & Delivery Information (From your screenshot 108756) */}
        <div className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
          <div className="bg-light p-2 px-3 border-bottom fw-bold small text-danger">👤 Customer Information</div>
          <div className="p-3">
             <div className="mb-2">
                <label className="text-muted small d-block">Customer Name</label>
                <span className="fw-bold">{order.customer_name}</span>
             </div>
             <div className="mb-2">
                <label className="text-muted small d-block">Mobile Number</label>
                <span className="fw-bold">{order.customer_phone}</span>
             </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
          <div className="bg-light p-2 px-3 border-bottom fw-bold small text-danger">🛵 Delivery Information</div>
          <div className="p-3">
             <div className="mb-2">
                <label className="text-muted small d-block">Delivery Address</label>
                <span className="fw-bold">{order.customer_address}, {order.city}</span>
             </div>
             <div className="mb-2">
                <label className="text-muted small d-block">Order Date & Time</label>
                <span className="fw-bold small">{new Date(order.created_at).toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Order Summary (From your screenshot 108757) */}
        <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
          <div className="bg-light p-2 px-3 border-bottom fw-bold small text-danger">🛒 Product Summary</div>
          <div className="p-3">
             {Array.isArray(order.items) && order.items.map((item, idx) => (
               <div key={idx} className="d-flex justify-content-between mb-2">
                  <span>{item.name} <small className="text-muted">x{item.qty}</small></span>
                  <span className="fw-bold">Rs. {item.price * item.qty}</span>
               </div>
             ))}
             <hr />
             <div className="d-flex justify-content-between small"><span>Total</span><span>Rs. {order.total_amount - 100}</span></div>
             <div className="d-flex justify-content-between small"><span>Delivery Fee</span><span>Rs. 100</span></div>
             <div className="d-flex justify-content-between fw-bold mt-2 fs-5"><span>Grand Total</span><span>Rs. {order.total_amount}</span></div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center px-2">
          <button onClick={() => window.print()} className="btn btn-outline-dark w-100 py-3 rounded-pill fw-bold mb-3 shadow-sm">
             Print Receipt 🖨️
          </button>
          <button onClick={() => navigate('/')} className="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow">
             Place another order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;