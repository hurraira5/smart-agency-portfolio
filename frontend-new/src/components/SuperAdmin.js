import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [branchMenu, setBranchMenu] = useState([]);
  const [branchOrders, setBranchOrders] = useState([]);
  const [branchTax, setBranchTax] = useState(0);

  const [restName, setRestName] = useState('');
  const [restType, setRestType] = useState('single');
  const [branchData, setBranchData] = useState({ 
    branch_name: '', 
    location: '', 
    manager_name: '', 
    contact_number: '' 
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    alert("Logged out successfully!");
    navigate('/login');
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
      setRestaurants(res.data || []);
    } catch (err) { 
      console.error("Restaurants load nahi huye", err); 
      setRestaurants([]);
    }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/restaurants", { 
        name: restName, 
        type: restType 
      });
      alert("New Brand Registered Successfully! 🍔");
      setRestName('');
      fetchRestaurants();
    } catch (err) { 
      alert(err.response?.data?.error || "Error adding restaurant.");
    }
  };

  const handleSelectRestaurant = async (e) => {
    const restId = e.target.value;
    if (!restId) {
      setSelectedRest(null);
      setBranches([]);
      setSelectedBranch(null);
      return;
    }
    const restaurant = restaurants.find(r => r.id === parseInt(restId));
    setSelectedRest(restaurant);
    try {
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${restId}/branches`);
      setBranches(res.data || []);
      setSelectedBranch(null);
    } catch (err) { console.error("Branches load nahi huin", err); }
  };

  // --- MASTER CONTROL: Load Branch Data (Menu, Tax, Orders, Status) ---
  const handleManageBranch = async (branch) => {
    setSelectedBranch(branch);
    try {
      // 1. Menu Load
      const menuRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${branch.id}`);
      setBranchMenu(menuRes.data || []);
      
      // 2. Orders Load (Live Stream)
      const orderRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${branch.id}`);
      setBranchOrders(orderRes.data || []);

      // 3. Tax Rate Load
      const branchDetails = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${branch.id}`);
      setBranchTax(branchDetails.data.tax_rate || 0);
    } catch (err) { console.error("Branch details fetch failed"); }
  };

  // Toggle Branch Status (Active/Inactive)
  const toggleBranchStatus = async () => {
    const newStatus = selectedBranch.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${selectedBranch.id}/status`, { status: newStatus });
      setSelectedBranch({...selectedBranch, status: newStatus});
      alert(`Branch status updated to ${newStatus.toUpperCase()}`);
      // Refresh list
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data || []);
    } catch (err) { alert("Status update failed."); }
  };

  const handleUpdateTax = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${selectedBranch.id}/tax`, { tax_rate: branchTax });
      alert("Tax Rate Updated Successfully!");
    } catch (err) { alert("Tax update failed."); }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/branches/register", {
        ...branchData,
        restaurant_id: selectedRest.id
      });
      alert("Branch added!");
      setBranchData({ branch_name: '', location: '', manager_name: '', contact_number: '' });
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data || []);
    } catch (err) { alert("Error adding branch."); }
  };

  const handleAddManager = async (branchId) => {
    const email = prompt("Manager Email:");
    const password = prompt("Manager Password:");
    if (!email || !password) return;
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/auth/register-manager", {
        username: 'Manager', email, password, branch_id: branchId
      });
      alert("Manager Login Created!");
    } catch (err) { alert("Manager creation failed."); }
  };

  // Analytics Calculation
  const totalRevenue = branchOrders
    .filter(o => o.status === 'Accepted' || o.status === 'Delivered')
    .reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  return (
    <div className="container-fluid mt-4 pb-5 px-lg-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-primary">Super Admin <span className="text-dark">Panel</span></h2>
        <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill px-4 fw-bold shadow-sm">Logout 🚪</button>
      </div>

      <div className="row g-4">
        {/* Left Panel: Selection */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 bg-dark text-white rounded-4 mb-4">
            <h6 className="text-warning mb-3 fw-bold text-uppercase">1. Register New Brand</h6>
            <form onSubmit={handleAddRestaurant} className="d-flex gap-2">
              <input type="text" className="form-control form-control-sm" placeholder="Enter Brand Name" value={restName} onChange={(e) => setRestName(e.target.value)} required />
              <button className="btn btn-warning btn-sm px-3 fw-bold">Register</button>
            </form>
          </div>

          <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
            <h6 className="fw-bold mb-3 text-uppercase">2. Select Branch to Manage</h6>
            <select className="form-select mb-3 border-primary shadow-sm" onChange={handleSelectRestaurant} value={selectedRest?.id || ""}>
              <option value="">-- Choose Brand --</option>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            <div className="list-group shadow-sm border-0">
              {branches.map(b => (
                <button key={b.id} onClick={() => handleManageBranch(b)} 
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-1 rounded-3 border-0 ${selectedBranch?.id === b.id ? 'active bg-primary' : 'bg-light'}`}>
                  <div>
                    <span className="fw-bold">{b.branch_name}</span>
                    <small className="d-block opacity-75">{b.location}</small>
                  </div>
                  <span className={`badge ${b.status === 'active' ? 'bg-success' : 'bg-danger'} rounded-pill`}>{b.status}</span>
                </button>
              ))}
            </div>

            {selectedRest && (
                <button className="btn btn-primary w-100 mt-4 rounded-pill fw-bold" onClick={() => setSelectedBranch(null)}>+ Add New Branch</button>
            )}
          </div>
        </div>

        {/* Right Panel: Analytics & Control */}
        <div className="col-lg-8">
          {selectedBranch ? (
            <div className="fade-in">
              {/* Branch Stats Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary text-white">
                    <small className="opacity-75">Branch Revenue</small>
                    <h3 className="fw-bold mb-0">Rs. {totalRevenue}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-success text-white">
                    <small className="opacity-75">Total Orders</small>
                    <h3 className="fw-bold mb-0">{branchOrders.length}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-dark text-white text-center">
                    <small className="opacity-75">Branch Status</small>
                    <h5 className="fw-bold mb-0 text-uppercase text-warning">{selectedBranch.status}</h5>
                  </div>
                </div>
              </div>

              {/* Master Control Bar */}
              <div className="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-primary mb-0">Control: {selectedBranch.branch_name}</h5>
                  <div className="d-flex gap-2">
                    <button onClick={toggleBranchStatus} className={`btn btn-sm ${selectedBranch.status === 'active' ? 'btn-danger' : 'btn-success'} rounded-pill px-4 fw-bold`}>
                        {selectedBranch.status === 'active' ? 'Disable Branch 🔒' : 'Enable Branch ✅'}
                    </button>
                    <button onClick={() => handleAddManager(selectedBranch.id)} className="btn btn-sm btn-dark rounded-pill px-3">Manager Login 🔑</button>
                  </div>
                </div>

                <div className="row g-3 border-top pt-3">
                   <div className="col-md-6 border-end">
                      <label className="small fw-bold text-muted">Branch Tax Rate (%)</label>
                      <div className="input-group input-group-sm">
                        <input type="number" className="form-control" value={branchTax} onChange={(e) => setBranchTax(e.target.value)} />
                        <button onClick={handleUpdateTax} className="btn btn-primary">Save Tax</button>
                      </div>
                   </div>
                   <div className="col-md-6 ps-3">
                      <label className="small fw-bold text-muted">Quick Actions</label>
                      <div className="d-flex gap-2">
                         <button className="btn btn-sm btn-outline-primary rounded-pill w-100">View Full Menu ({branchMenu.length})</button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Live Orders Stream */}
              <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
                <h6 className="fw-bold mb-3 text-danger d-flex align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm"></span> Live Order Stream
                </h6>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light">
                      <tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                      {branchOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>{o.customer_name}</td>
                          <td className="fw-bold text-danger">Rs. {o.total_amount}</td>
                          <td><span className={`badge rounded-pill ${o.status === 'Accepted' ? 'bg-success' : 'bg-warning text-dark'}`}>{o.status}</span></td>
                          <td>{new Date(o.created_at).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                      {branchOrders.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No orders found for this branch.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-100">
                {selectedRest ? (
                    /* Branch Adding Form (When no branch is selected to manage) */
                    <div className="card p-4 shadow-sm border-0 rounded-4 bg-white fade-in">
                        <h5 className="fw-bold mb-4 text-primary">Add New Branch for {selectedRest.name}</h5>
                        <form onSubmit={handleAddBranch} className="row g-3">
                            <div className="col-md-6"><input type="text" className="form-control" placeholder="Branch Name" value={branchData.branch_name} onChange={(e) => setBranchData({...branchData, branch_name: e.target.value})} required /></div>
                            <div className="col-md-6"><input type="text" className="form-control" placeholder="City/Location" value={branchData.location} onChange={(e) => setBranchData({...branchData, location: e.target.value})} required /></div>
                            <div className="col-md-6"><input type="text" className="form-control" placeholder="Manager Name" value={branchData.manager_name} onChange={(e) => setBranchData({...branchData, manager_name: e.target.value})} /></div>
                            <div className="col-md-6"><input type="text" className="form-control" placeholder="Contact Number" value={branchData.contact_number} onChange={(e) => setBranchData({...branchData, contact_number: e.target.value})} /></div>
                            <div className="col-12"><button className="btn btn-primary w-100 rounded-pill fw-bold">+ Register Branch</button></div>
                        </form>
                    </div>
                ) : (
                    <div className="card p-5 shadow-sm border-0 rounded-4 text-center text-muted bg-white h-100 d-flex align-items-center justify-content-center border-dashed">
                        <div>
                            <div className="display-4 mb-3">📊</div>
                            <h4 className="fw-bold text-dark">Super Admin Dashboard</h4>
                            <p>Select a brand and branch from the left to view sales and control operations.</p>
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;