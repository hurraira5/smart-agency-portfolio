import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`https://smart-agency-api.vercel.app/api/orders?branch_id=${user.branch_id}&role=${user.role}`);
        setOrders(res.data);
      } catch (err) { console.log("Error fetching orders"); }
    };
    fetchOrders();
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between">
        <h2>📋 {user?.role.toUpperCase()} Panel</h2>
        <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
      </div>
      <div className="alert alert-warning mt-3">
        Welcome, <strong>{user?.username}</strong>! Managing Branch ID: {user?.branch_id || "All"}
      </div>
      <table className="table mt-4 shadow-sm">
        <thead className="table-dark">
          <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}><td>#{o.id}</td><td>{o.customer_name}</td><td>Rs. {o.total_amount}</td><td>{o.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;