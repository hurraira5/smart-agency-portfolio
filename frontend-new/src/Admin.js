import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = "https://smart-agency-api.vercel.app";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data fetch karne ka function
  const fetchOrders = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/orders`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Load error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mt-5">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">
          <span className="text-warning">Burger</span> O'Clock Admin 📋
        </h2>
        <div className="d-flex gap-2">
          <button onClick={fetchOrders} className="btn btn-outline-primary rounded-pill">
            🔄 Refresh
          </button>
          <Link to="/" className="btn btn-dark rounded-pill shadow-sm">
            ← Back to Shop
          </Link>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="mt-2 text-muted">Fetching latest orders...</p>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded border bg-white p-3">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Phone & Address</th>
                <th>Items Ordered</th>
                <th>Total Bill</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  // Safe JSON Parsing: Agar data object hai ya string, dono handle honge
                  let orderItems = [];
                  try {
                    orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                  } catch (e) {
                    console.error("Parsing error for order:", order.id);
                    orderItems = [];
                  }

                  return (
                    <tr key={order.id}>
                      <td className="text-muted small">#{order.id}</td>
                      <td className="fw-bold">{order.customer_name}</td>
                      <td>
                        <div className="small fw-bold text-primary">{order.phone}</div>
                        <div className="text-muted" style={{ fontSize: '11px', maxWidth: '200px' }}>
                          {order.address}
                        </div>
                      </td>
                      <td>
                        {Array.isArray(orderItems) ? orderItems.map((item, i) => (
                          <span key={i} className="badge bg-warning text-dark me-1 mb-1">
                            {item.name}
                          </span>
                        )) : <span className="text-muted small">No items</span>}
                      </td>
                      <td className="fw-bold text-success">Rs. {order.total_amount}</td>
                      <td>
                        <span className="badge bg-info text-uppercase" style={{ fontSize: '10px' }}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Abhi tak koi order nahi aaya! 🍔
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;