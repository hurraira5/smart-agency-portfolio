import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [branchOrders, setBranchOrders] = useState([]);
  const [restName, setRestName] = useState('');
  const [branchData, setBranchData] = useState({ branch_name: '', location: '' });

  const navigate = useNavigate();

  const fetchRestaurants = useCallback(async () => {
    const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
    setRestaurants(res.data || []);
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    await axios.post("https://smart-agency-api.vercel.app/api/restaurants", { name: restName, type: 'chain' });
    setRestName(''); fetchRestaurants();
  };

  const handleSelectRestaurant = async (e) => {
    const restId = e.target.value;
    if (!restId) return;
    const restaurant = restaurants.find(r => r.id === parseInt(restId));
    setSelectedRest(restaurant);
    const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${restId}/branches`);
    setBranches(res.data || []);
  };

  const handleManageBranch = async (branch) => {
    setSelectedBranch(branch);
    const orderRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${branch.id}`);
    setBranchOrders(orderRes.data || []);
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    await axios.post("https://smart-agency-api.vercel.app/api/branches/register", { ...branchData, restaurant_id: selectedRest.id });
    setBranchData({ branch_name: '', location: '' });
    const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
    setBranches(res.data || []);
  };

  return (
    <div style={{ backgroundColor: '#F0F2F5', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <nav className="navbar bg-white border-bottom px-4 py-3 sticky-top shadow-sm">
        <span className="navbar-brand fw-bold" style={{ color: '#4e73df' }}>SUPER ADMIN PANEL</span>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-danger btn-sm rounded-pill">Sign Out</button>
      </nav>

      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4">
              <h6>Register Brand</h6>
              <form onSubmit={handleAddRestaurant}>
                <input className="form-control mb-2" placeholder="Brand Name" value={restName} onChange={(e)=>setRestName(e.target.value)} required />
                <button className="btn btn-primary w-100 rounded-pill">Register</button>
              </form>
            </div>

            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
              <h6>Select Brand</h6>
              <select className="form-select mb-3" onChange={handleSelectRestaurant}>
                <option value="">-- Brands --</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {branches.map(b => (
                <div key={b.id} className={`p-3 rounded-4 mb-2 cursor-pointer ${selectedBranch?.id === b.id ? 'bg-primary text-white' : 'bg-light'}`} onClick={() => handleManageBranch(b)}>
                  {b.branch_name}
                </div>
              ))}
              {selectedRest && <button className="btn btn-outline-primary w-100 rounded-pill mt-3" onClick={() => setSelectedBranch(null)}>+ New Branch</button>}
            </div>
          </div>

          <div className="col-lg-8">
            {selectedBranch ? (
              <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
                <h4 className="fw-bold">{selectedBranch.branch_name}</h4>
                <table className="table mt-4">
                  <thead><tr><th>ID</th><th>TXN</th><th>CUSTOMER</th><th>TOTAL</th></tr></thead>
                  <tbody>{branchOrders.map(o => (<tr key={o.id}><td>#{o.id}</td><td>{o.transaction_id}</td><td>{o.customer_name}</td><td>Rs. {o.total_amount}</td></tr>))}</tbody>
                </table>
              </div>
            ) : selectedRest ? (
              <div className="card p-5 shadow-sm border-0 rounded-4 bg-white">
                <h4>New Branch for {selectedRest.name}</h4>
                <form onSubmit={handleAddBranch} className="mt-4">
                  <input className="form-control mb-3" placeholder="Branch Name" value={branchData.branch_name} onChange={e=>setBranchData({...branchData,branch_name:e.target.value})} required />
                  <input className="form-control mb-3" placeholder="Location" value={branchData.location} onChange={e=>setBranchData({...branchData,location:e.target.value})} required />
                  <button className="btn btn-primary w-100 rounded-pill py-2">Create Branch</button>
                </form>
              </div>
            ) : <div className="p-5 text-center text-muted">Select a brand to start</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SuperAdmin;