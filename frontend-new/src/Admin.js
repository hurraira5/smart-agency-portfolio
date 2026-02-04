import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = "https://smart-agency-api.vercel.app";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    axios.get(`${API_BASE_URL}/api/orders`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Orders load error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">
          <span className="text-warning">Burger</span> O'Clock Admin 🍟
        </h2>
        <Link to="/" className="btn btn-outline-dark rounded-pill">
          ← Back to Shop
        </Link>
      </div>

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
                <th>Customer</th>
                <th>Phone & Address</th>
                <th>Items</th>
                <th>Total Bill</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="text-muted small">#{order.id}</td>
                    <td><div className="fw-bold">{order.customer_name}</div></td>
                    <td>
                      <div className="small">{order.phone}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>{order.address}</div>
                    </td>
                    <td>
                      {JSON.parse(order.items || "[]").map((item, index) => (
                        <span key={index} className="badge bg-light text-dark border me-1">
                          {item.name}
                        </span>
                      ))}
                    </td>
                    <td className="fw-bold text-success">Rs. {order.total_amount}</td>
                    <td>
                      <span className="badge bg-warning text-dark text-uppercase">
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No orders found yet! 🍔
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