import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Aapka Vercel Backend URL
const API_BASE_URL = "https://smart-agency-api.vercel.app";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function: Orders load karne ke liye
  const fetchOrders = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/orders`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Orders fetching error:", err);
        setLoading(false);
      });
  };

  // Function: Order delete karne ke liye
  const deleteOrder = (id) => {
    if (window.confirm("Kya aap waqai ye order delete karna chahte hain?")) {
      axios.delete(`${API_BASE_URL}/api/orders/${id}`)
        .then(() => {
          alert("Order Delete Ho Gaya! ✅");
          fetchOrders(); // List ko refresh karne ke liye
        })
        .catch(err => {
          console.error("Delete error:", err);
          alert("Delete karne mein masla aaya. Shayad backend route update nahi hua.");
        });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mt-5 mb-5">
      {/* --- Header Section --- */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <h2 className="fw-bold text-dark m-0">
          <span className="text-warning">Burger</span> O'Clock Admin 📋
        </h2>
        <div className="d-flex gap-2">
          <button onClick={fetchOrders} className="btn btn-outline-primary rounded-pill">
            🔄 Refresh List
          </button>
          <Link to="/" className="btn btn-dark rounded-pill">
            ← Back to Shop
          </Link>
        </div>
      </div>

      {/* --- Main Content --- */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="mt-2 text-muted">Checking for new orders...</p>
        </div>
      ) : (
        <div className="table-responsive shadow rounded border bg-white p-3">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Customer Info</th>
                <th>Address</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  // Safe JSON Parsing logic
                  let orderItems = [];
                  try {
                    orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                  } catch (e) {
                    orderItems = [];
                  }

                  return (
                    <tr key={order.id}>
                      <td className="text-muted small">#{order.id}</td>
                      <td>
                        <div className="fw-bold">{order.customer_name}</div>
                        <div className="small text-primary">{order.phone}</div>
                      </td>
                      <td>
                        <div className="text-muted small" style={{ fontSize: '11px', maxWidth: '180px' }}>
                          {order.address}
                        </div>
                      </td>
                      <td>
                        {Array.isArray(orderItems) && orderItems.map((item, i) => (
                          <span key={i} className="badge bg-warning text-dark me-1 mb-1">
                            {item.name}
                          </span>
                        ))}
                      </td>
                      <td className="fw-bold text-success">Rs. {order.total_amount}</td>
                      <td>
                        <span className="badge bg-info text-uppercase" style={{fontSize: '10px'}}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => deleteOrder(order.id)} 
                          className="btn btn-danger btn-sm rounded-pill px-3"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    Koi orders nahi hain. Shop par ja kar test order karein! 🍔
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