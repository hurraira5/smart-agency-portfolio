import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [branchOrders, setBranchOrders] = useState([]);
  const [restName, setRestName] = useState('');
  const [restType, setRestType] = useState('chain');
  const [branchData, setBranchData] = useState({ branch_name: '', location: '', manager_name: '', contact_number: '' });

  const navigate = useNavigate();

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
      setRestaurants(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/restaurants", { name: restName, type: restType });
      alert(`Brand Registered as ${restType.toUpperCase()}! 🍔`);
      setRestName('');
      fetchRestaurants();
    } catch (err) { alert("Error adding brand"); }
  };

  const handleSelectRestaurant = async (e) => {
    const restId = e.target.value;
    if (!restId) return;
    const restaurant = restaurants.find(r => r.id === parseInt(restId));
    setSelectedRest(restaurant);
    try {
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${restId}/branches`);
      setBranches(res.data || []);
      setSelectedBranch(null);
      setBranchOrders([]); // Clear previous orders
    } catch (err) { console.error(err); }
  };

  const handleManageBranch = async (branch) => {
    setSelectedBranch(branch);
    try {
      const orderRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${branch.id}`);
      setBranchOrders(orderRes.data || []);
    } catch (err) { console.error(err); }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/branches/register", { ...branchData, restaurant_id: selectedRest.id });
      alert("Branch added successfully! ✅");
      setBranchData({ branch_name: '', location: '', manager_name: '', contact_number: '' });
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data || []);
    } catch (err) { alert("Error adding branch."); }
  };

  // --- NEW: Handle Create Boss Account ---
  const handleAddBoss = async () => {
    const email = prompt(`Enter Brand Boss Email for ${selectedRest.name}:`);
    const pass = prompt("Enter Password:");
    if (!email || !pass) return;

    try {
      await axios.post("https://smart-agency-api.vercel.app/api/auth/register-manager", {
        username: `${selectedRest.name} Boss`,
        email,
        password: pass,
        role: 'boss',
        branch_id: selectedRest.id // Boss ke liye restaurant ID hi as branch ID use hogi logic mein
      });
      alert("Brand Boss Account Created Successfully! 👑");
    } catch (err) { alert("Boss account creation failed"); }
  };

  const pendingActions = branchOrders.filter(o => o.status === 'Received').length;
  const acceptedOrders = branchOrders.filter(o => o.status === 'Accepted' || o.status === 'Delivered').length;
  const successRate = branchOrders.length > 0 ? ((acceptedOrders / branchOrders.length) * 100).toFixed(1) : "0";

  return (
    <div style={{ backgroundColor: '#F0F2F5', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <nav className="navbar navbar-expand-lg bg-white border-bottom px-4 py-3 sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center" style={{ color: '#4e73df' }}>
            <div style={{ width: 10, height: 25, background: '#4e73df', marginRight: 10, borderRadius: 5 }}></div>
            SUPER ADMIN <span className="text-muted fw-normal ms-2">| Management Console</span>
          </span>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-outline-danger rounded-pill px-4 fw-bold shadow-sm btn-sm">Sign Out</button>
        </div>
      </nav>

      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4 mb-4">
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3" style={{ borderLeft: '5px solid #4e73df' }}><small className="text-primary fw-bold text-uppercase">Registered Brands</small><h3 className="fw-bold mb-0 mt-1">{restaurants.length}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3" style={{ borderLeft: '5px solid #1cc88a' }}><small className="text-success fw-bold text-uppercase">Live Branches</small><h3 className="fw-bold mb-0 mt-1">{branches.length}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3" style={{ borderLeft: '5px solid #f6c23e' }}><small className="text-warning fw-bold text-uppercase">Pending Actions</small><h3 className="fw-bold mb-0 mt-1">{selectedBranch ? pendingActions : '--'}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-3" style={{ borderLeft: '5px solid #36b9cc' }}><small className="text-info fw-bold text-uppercase">Success Rate</small><h3 className="fw-bold mb-0 mt-1">{selectedBranch ? `${successRate}%` : '--'}</h3></div></div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card p-4 shadow-sm border-0 rounded-4 mb-4 bg-white">
              <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">RESTAURANT / BRAND ONBOARDING</h6>
              <form onSubmit={handleAddRestaurant}>
                <div className="mb-3"><label className="small text-muted mb-1">Brand Identity</label><input type="text" className="form-control rounded-3 border-0 bg-light" placeholder="Enter Name" value={restName} onChange={(e) => setRestName(e.target.value)} required /></div>
                <div className="d-flex gap-2 mb-3">
                  <button type="button" onClick={() => setRestType('single')} className={`btn btn-sm flex-grow-1 rounded-pill ${restType === 'single' ? 'btn-primary shadow-sm' : 'btn-light'}`}>Single Shop</button>
                  <button type="button" onClick={() => setRestType('chain')} className={`btn btn-sm flex-grow-1 rounded-pill ${restType === 'chain' ? 'btn-primary shadow-sm' : 'btn-light'}`}>Chain Store</button>
                </div>
                <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" style={{ background: '#4e73df' }}>Register</button>
              </form>
            </div>

            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
              <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">AUDIT SELECTION</h6>
              <select className="form-select mb-3 border-0 bg-light rounded-3 shadow-none" onChange={handleSelectRestaurant} value={selectedRest?.id || ""}>
                <option value="">-- Choose Brand --</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
              </select>
              <div className="list-group shadow-none border-0 mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {branches.map(b => (
                  <button key={b.id} onClick={() => handleManageBranch(b)} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 rounded-4 border-0 shadow-sm py-3 transition-all ${selectedBranch?.id === b.id ? 'bg-primary text-white' : 'bg-light'}`}>
                    <span className="fw-bold" style={{ fontSize: 13 }}>{b.branch_name}</span>
                    <span className={`badge rounded-pill ${b.status === 'active' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: 9 }}>{b.status}</span>
                  </button>
                ))}
              </div>
              {selectedRest && <button className="btn btn-outline-primary w-100 rounded-pill fw-bold btn-sm mt-2" onClick={() => setSelectedBranch(null)}>+ Establish New Branch</button>}
            </div>
          </div>

          <div className="col-lg-8">
            {selectedBranch ? (
              <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h4 className="fw-bold text-dark mb-0">{selectedBranch.branch_name}</h4>
                    <span className="badge bg-light text-muted border rounded-pill mt-1 small">📍 {selectedBranch.location}</span>
                  </div>
                  <div className="d-flex gap-2">
                    {/* NEW: CREATE BOSS KEY BUTTON */}
                    <button onClick={handleAddBoss} className="btn btn-warning rounded-pill px-3 shadow-sm btn-sm fw-bold">Issue Boss Key 👑</button>
                    <button onClick={() => {
                        const email = prompt("Manager Email:");
                        const pass = prompt("Manager Password:");
                        if(email && pass) axios.post("https://smart-agency-api.vercel.app/api/auth/register-manager", { username: 'Manager', email, password: pass, branch_id: selectedBranch.id }).then(() => alert("Access Granted! 🔑"));
                    }} className="btn btn-dark rounded-pill px-3 shadow-sm btn-sm">Issue Manager Key 🔑</button>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                   <div className="col-md-6"><div className="p-4 rounded-4 text-white shadow-sm" style={{ background: 'linear-gradient(45deg, #4e73df, #224abe)' }}><small className="opacity-75 d-block text-uppercase fw-bold" style={{fontSize: 10}}>Live Branch Sales</small><h2 className="mb-0 fw-bold">Rs. {branchOrders.reduce((a, b) => a + Number(b.total_amount), 0).toLocaleString()}</h2></div></div>
                   <div className="col-md-6"><div className="p-4 rounded-4 text-white shadow-sm" style={{ background: 'linear-gradient(45deg, #36b9cc, #258391)' }}><small className="opacity-75 d-block text-uppercase fw-bold" style={{fontSize: 10}}>Total Transactions</small><h2 className="mb-0 fw-bold">{branchOrders.length}</h2></div></div>
                </div>

                <h6 className="fw-bold text-muted mb-3 small text-uppercase text-center">Branch Transaction Log</h6>
                <div className="table-responsive">
                  <table className="table table-hover align-middle" style={{ fontSize: 12 }}>
                    <thead className="table-light"><tr className="text-muted"><th>ORDER ID</th><th>TXN ID</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {branchOrders.map(o => (
                        <tr key={o.id}>
                          <td className="fw-bold">#{o.id}</td>
                          <td><span className="badge bg-light text-primary border rounded-pill px-3 py-2 fw-bold">{o.transaction_id || 'N/A'}</span></td>
                          <td>{o.customer_name}</td>
                          <td className="fw-bold text-dark">Rs. {o.total_amount}</td>
                          <td><span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: o.status === 'Accepted' ? '#d1e7dd' : '#fff3cd', color: o.status === 'Accepted' ? '#0f5132' : '#664d03' }}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedRest ? (
              <div className="card p-5 shadow-sm border-0 rounded-4 bg-white">
                <div className="text-center mb-4">
                  <h4 className="fw-bold text-dark">Establish Sub-Branch</h4>
                  <p className="text-muted small">Adding operational unit to <span className="text-primary fw-bold">{selectedRest.name}</span></p>
                </div>
                <form onSubmit={handleAddBranch} className="row g-4">
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted mb-1">Branch Name</label>
                    <input type="text" className="form-control bg-light border-0 rounded-3 py-2" placeholder="e.g. DHA Phase 6" value={branchData.branch_name} onChange={(e) => setBranchData({...branchData, branch_name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted mb-1">Location City</label>
                    <input type="text" className="form-control bg-light border-0 rounded-3 py-2" placeholder="e.g. Lahore" value={branchData.location} onChange={(e) => setBranchData({...branchData, location: e.target.value})} required />
                  </div>
                  <div className="col-12 mt-4"><button className="btn btn-primary w-100 rounded-pill fw-bold py-3 shadow-sm border-0" style={{ background: '#4e73df' }}>Complete Branch Registration ✅</button></div>
                </form>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 text-center bg-white h-100 d-flex align-items-center justify-content-center p-5">
                <div><h4 className="fw-bold text-dark">Enterprise Overview</h4><p className="text-muted px-4 small">Select a restaurant brand from the left to manage live operations or analyze global transaction unique IDs.</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;