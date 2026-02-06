import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }} className="d-flex align-items-center">
      <div className="container">
        <div className="card border-0 shadow-lg p-4 text-center rounded-4">
          <div className="bg-success text-white p-4 rounded-4 mb-4">
            <div className="display-1 mb-2">✅</div>
            <h2 className="fw-bold">Order Received!</h2>
            <p className="mb-0 opacity-75">Thank you for choosing Burger O'Clock</p>
          </div>
          
          <div className="text-start bg-light p-3 rounded-3 mb-4 border border-dashed">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Order ID:</span>
              <span className="fw-bold">#{order?.id || 'ORD-782'}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted small">Estimated Time:</span>
              <span className="fw-bold text-success">35-45 Mins</span>
            </div>
          </div>

          <button onClick={() => navigate('/')} className="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow">
            BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;