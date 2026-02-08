import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('all');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });

  useEffect(() => {
    if (!user || user.role !== 'boss') {
      navigate('/login');
      return;
    }
    fetchBossData();
  }, [user, selectedBranchId]);

  const fetchBossData = async () => {
    try {
      const branchRes = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${user.branch_id}/branches`);
      setBranches(branchRes.data);
      const url = selectedBranchId === 'all' 
        ? `https://smart-agency-api.vercel.app/api/boss/orders/${user.branch_id}` 
        : `https://smart-agency-api.vercel.app/api/orders/${selectedBranchId}`;
      const orderRes = await axios.get(url);
      const fetchedOrders = orderRes.data || [];
      setOrders(fetchedOrders);
      const revenue = fetchedOrders.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
      setStats({ totalRevenue: revenue, totalOrders: fetchedOrders.length });
    } catch (err) { console.log("Error fetching boss data"); }
  };

  return (
    <div style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', fontFamily: 'Poppins' }}>
      <nav className="navbar bg-white border-bottom px-4 py-3 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold text-primary">👑 BOSS PANEL <span className="text-muted fw-normal">| {user.username}</span></span>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-danger rounded-pill px-4">Logout</button>
        </div>
      </nav>

      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: 'linear-gradient(45deg, #6f42c1, #4e73df)' }}>
              <small className="text-uppercase fw-bold opacity-75">Brand Global Revenue</small>
              <h2 className="fw-bold mb-0">Rs. {stats.totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}>
              <small className="text-uppercase fw-bold opacity-75">Total Transactions</small>
              <h2 className="fw-bold mb-0">{stats.totalOrders}</h2>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Branch Reports</h5>
            <select className="form-select w-25 rounded-pill border-0 bg-light px-3 shadow-none" onChange={(e) => setSelectedBranchId(e.target.value)}>
              <option value="all">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
            </select>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr className="small text-muted"><th>ORDER ID</th><th>BRANCH</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="fw-bold text-dark">#{o.id}</td>
                    <td className="small">{branches.find(b => b.id === o.branch_id)?.branch_name || 'Branch'}</td>
                    <td>{o.customer_name}</td>
                    <td className="fw-bold text-danger">Rs. {o.total_amount}</td>
                    <td><span className="badge rounded-pill bg-light text-primary border">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Admin;