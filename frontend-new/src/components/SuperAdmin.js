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
  const [restType, setRestType] = useState('chain');
  const [branchData, setBranchData] = useState({ branch_name: '', location: '' });
  const [editingBranch, setEditingBranch] = useState(null);

  const navigate = useNavigate();

  // Sabse pehle Restaurants fetch karne ka function
  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
      setRestaurants(res.data || []);
    } catch (err) { console.error("Restaurant fetch error", err); }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  // Brand Register karne ka function (FIXED)
  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    if (!restName.trim()) return alert("Please enter a Brand Name");
    try {
      // API call to register brand
      const res = await axios.post("https://smart-agency-api.vercel.app/api/restaurants", { 
        name: restName, 
        type: restType 
      });
      
      if (res.status === 200 || res.status === 201) {
        alert("Brand Registered! 🍔");
        setRestName(''); 
        fetchRestaurants(); // Refresh list to show new brand
      }
    } catch (err) { 
      console.error(err);
      alert("Failed to register brand"); 
    }
  };

  // Branch Add karne ka function (Working API)
  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!selectedRest) return alert("Please select a brand first!");
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/branches/register", { 
        ...branchData, 
        restaurant_id: selectedRest.id 
      });
      alert("Branch Added Successfully! ✅");
      setBranchData({ branch_name: '', location: '' });
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data || []);
    } catch (err) { alert("Error adding branch."); }
  };

  // Brand aur uski sari branches delete karna
  const handleDeleteBrand = async (id, name) => {
    if(window.confirm(`⚠️ DANGER: Delete entire brand "${name}"?`)) {
      try {
        await axios.delete(`https://smart-agency-api.vercel.app/api/restaurants/${id}`);
        alert("Brand Deleted!");
        setSelectedRest(null); fetchRestaurants();
      } catch (err) { alert("Error deleting brand"); }
    }
  };

  // Brand select karke uski branches load karna
  const handleSelectRestaurant = async (e) => {
    const restId = e.target.value;
    if (!restId) { setSelectedRest(null); setBranches([]); return; }
    const restaurant = restaurants.find(r => r.id === parseInt(restId));
    setSelectedRest(restaurant);
    try {
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${restId}/branches`);
      setBranches(res.data || []);
      setSelectedBranch(null);
    } catch (err) { console.error(err); }
  };

  // Branch manage karna (Live Orders fetch karna)
  const handleManageBranch = async (branch) => {
    setSelectedBranch(branch);
    try {
      const orderRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${branch.id}`);
      setBranchOrders(orderRes.data || []);
    } catch (err) { console.error(err); }
  };

  const handleDeleteBranch = async (id) => {
    if(window.confirm("Delete this branch?")) {
      try {
        await axios.delete(`https://smart-agency-api.vercel.app/api/branches/${id}`);
        setBranches(branches.filter(b => b.id !== id));
        setSelectedBranch(null);
        alert("Branch Deleted!");
      } catch (err) { alert("Deleted"); }
    }
  };

  const handleUpdateBranch = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${editingBranch.id}`, editingBranch);
      alert("Branch Updated!");
      setEditingBranch(null);
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data);
    } catch (err) { alert("Update failed"); }
  };

  const handleUpdateBranchStatus = async (branchId, status) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${branchId}/status`, { status });
      alert(`Branch status updated to ${status}!`);
      setSelectedBranch({ ...selectedBranch, status });
      setBranches(branches.map(b => b.id === branchId ? {...b, status} : b));
    } catch (err) { alert("Status update failed"); }
  };

  // --- ACCOUNT MANAGEMENT (BOSS & MANAGER) ---
  const handleIssueAccount = async (role, id, title) => {
    const email = prompt(`Enter ${title} Email:`);
    const pass = prompt(`Set Password:`);
    if(!email || !pass) return;
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/auth/register-manager", { 
        username: title, email, password: pass, role: role, branch_id: id 
      });
      alert(`${title} Key Issued! ✅`);
    } catch (err) { alert("Failed to issue key"); }
  };

  const handleResetPassword = async (role, id) => {
    const newPass = prompt(`Enter New Password for ${role}:`);
    if(!newPass) return;
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/auth/reset-password`, { id, newPass, role });
      alert("Password Reset Done! 🔐");
    } catch (err) { alert("Reset failed"); }
  };

  const handleDeleteUser = async (role, id) => {
    if(window.confirm(`Delete this ${role} account?`)) {
      try {
        await axios.delete(`https://smart-agency-api.vercel.app/api/auth/users/${id}/${role}`);
        alert("Account Deleted! 🗑️");
      } catch (err) { alert("Deletion failed"); }
    }
  };

  return (
    <div style={{ backgroundColor: '#F0F2F5', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <nav className="navbar navbar-expand-lg bg-white border-bottom px-4 py-3 sticky-top shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center" style={{ color: '#4e73df' }}>
            <div style={{ width: 12, height: 30, background: '#4e73df', marginRight: 12, borderRadius: 4 }}></div>
            SUPER ADMIN <span className="text-muted fw-normal ms-2">| Management Console</span>
          </span>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm btn-sm">Sign Out 🚪</button>
        </div>
      </nav>

      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4 mb-4 text-white">
          <div className="col-md-4"><div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: 'linear-gradient(45deg, #6f42c1, #4e73df)' }}><h6>TOTAL BRANDS</h6><h2 className="fw-bold mb-0">{restaurants.length}</h2></div></div>
          <div className="col-md-4"><div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}><h6>LIVE BRANCHES</h6><h2 className="fw-bold mb-0">{branches.length}</h2></div></div>
          <div className="col-md-4"><div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: 'linear-gradient(45deg, #f6c23e, #f39c12)' }}><h6>TOTAL ORDERS</h6><h2 className="fw-bold mb-0">{branchOrders.length}</h2></div></div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4 border-top border-primary border-4">
              <h6 className="fw-bold mb-3 text-primary">BRAND ONBOARDING</h6>
              <form onSubmit={handleAddRestaurant}>
                <input className="form-control mb-2 rounded-3 bg-light border-0 py-2" placeholder="Brand Name" value={restName} onChange={(e)=>setRestName(e.target.value)} required />
                <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow">Register Brand</button>
              </form>
            </div>

            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0">MASTER AUDIT</h6>
                {selectedRest && <button onClick={() => handleDeleteBrand(selectedRest.id, selectedRest.name)} className="btn btn-sm text-danger border-0 fw-bold">Delete Brand 🗑️</button>}
              </div>
              <select className="form-select mb-3 bg-light border-0 rounded-3 shadow-none" onChange={handleSelectRestaurant} value={selectedRest?.id || ""}>
                <option value="">-- Select Brand --</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <div className="list-group mb-3 shadow-none" style={{maxHeight: '300px', overflowY: 'auto'}}>
                {branches.map(b => (
                  <div key={b.id} className={`d-flex align-items-center mb-2 p-3 rounded-4 shadow-sm ${selectedBranch?.id === b.id ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                    <div className="flex-grow-1 fw-bold cursor-pointer" onClick={() => handleManageBranch(b)}>{b.branch_name}</div>
                    <div className="d-flex gap-2">
                      <button onClick={() => setEditingBranch(b)} className="btn btn-sm p-0 text-info">✏️</button>
                      <button onClick={() => handleDeleteBranch(b.id)} className="btn btn-sm p-0 text-danger">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              {selectedRest && (
                <div className="d-grid gap-2 border-top pt-3">
                  <button className="btn btn-outline-primary rounded-pill fw-bold btn-sm" onClick={() => setSelectedBranch(null)}>+ Establish New Branch</button>
                  <button onClick={() => handleIssueAccount('boss', selectedRest.id, 'Boss')} className="btn btn-warning rounded-pill fw-bold btn-sm">Issue Boss Key 👑</button>
                  <div className="d-flex gap-1 justify-content-center">
                    <button onClick={() => handleResetPassword('boss', selectedRest.id)} className="btn btn-link btn-xs text-dark p-0" style={{fontSize: '10px'}}>Reset Pass</button>
                    <button onClick={() => handleDeleteUser('boss', selectedRest.id)} className="btn btn-link btn-xs text-danger p-0" style={{fontSize: '10px'}}>Delete Boss Account</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            {selectedBranch ? (
               <div className="card p-4 shadow-sm border-0 rounded-4 bg-white fade-in">
                  <div className="d-flex justify-content-between mb-4 border-bottom pb-3">
                    <div><h4 className="fw-bold text-dark mb-0">{selectedBranch.branch_name}</h4><small className="text-muted">📍 {selectedBranch.location}</small></div>
                    <div className="text-end">
                      <div className="d-flex gap-2 mb-3 justify-content-end">
                        <button className={`btn btn-sm rounded-pill px-3 fw-bold ${selectedBranch.status === 'active' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => handleUpdateBranchStatus(selectedBranch.id, 'active')}>Active</button>
                        <button className={`btn btn-sm rounded-pill px-3 fw-bold ${selectedBranch.status === 'paused' ? 'btn-warning text-dark' : 'btn-outline-warning'}`} onClick={() => handleUpdateBranchStatus(selectedBranch.id, 'paused')}>Pause</button>
                        <button className={`btn btn-sm rounded-pill px-3 fw-bold ${selectedBranch.status === 'closed' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => handleUpdateBranchStatus(selectedBranch.id, 'closed')}>Close</button>
                      </div>
                      
                      <div className="bg-light p-2 rounded-3">
                        <small className="fw-bold d-block mb-1 text-muted">MANAGER CONTROLS</small>
                        <div className="d-flex gap-2 justify-content-end align-items-center">
                          <button onClick={() => handleIssueAccount('manager', selectedBranch.id, 'Manager')} className="btn btn-dark rounded-pill px-3 btn-sm fw-bold">Issue Key 🔑</button>
                          <button onClick={() => handleResetPassword('manager', selectedBranch.id)} className="btn btn-outline-dark btn-sm rounded-pill px-2" style={{fontSize: '11px'}}>Reset</button>
                          <button onClick={() => handleDeleteUser('manager', selectedBranch.id)} className="btn btn-outline-danger btn-sm rounded-pill px-2" style={{fontSize: '11px'}}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <h6 className="fw-bold text-muted small mb-3">LIVE TRANSACTION DATA</h6>
                    <table className="table table-hover align-middle">
                      <thead className="table-light"><tr className="small text-muted"><th>ID</th><th>TXN ID</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                      <tbody>{branchOrders.map(o => (<tr key={o.id}><td>#{o.id}</td><td><span className="badge bg-light text-primary border rounded-pill px-3 py-2 fw-bold">{o.transaction_id || 'N/A'}</span></td><td>{o.customer_name}</td><td className="fw-bold text-success">Rs. {o.total_amount}</td><td><span className={`badge rounded-pill px-3 py-2 ${o.status==='Accepted'?'bg-success':'bg-warning text-dark'}`}>{o.status}</span></td></tr>))}</tbody>
                    </table>
                  </div>
               </div>
            ) : selectedRest ? (
              <div className="card p-5 shadow-sm border-0 rounded-4 bg-white text-center">
                <div className="display-1 text-primary opacity-25 mb-3">🏢</div>
                <h4 className="fw-bold">Establish New Branch: {selectedRest.name}</h4>
                <form onSubmit={handleAddBranch} className="row g-3 mt-4 text-start">
                  <div className="col-md-6"><label className="small fw-bold">Branch Name</label><input className="form-control bg-light border-0 py-2 rounded-3" value={branchData.branch_name} onChange={e=>setBranchData({...branchData,branch_name:e.target.value})} required /></div>
                  <div className="col-md-6"><label className="small fw-bold">Location</label><input className="form-control bg-light border-0 py-2 rounded-3" value={branchData.location} onChange={e=>setBranchData({...branchData,location:e.target.value})} required /></div>
                  <div className="col-12 mt-4"><button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm">Confirm Establishment ✅</button></div>
                </form>
              </div>
            ) : (
              <div className="card p-5 text-center text-muted rounded-4 bg-white border-2 border-dashed h-100 d-flex align-items-center justify-content-center">
                <div><div className="display-1 opacity-25">🛡️</div><h4 className="fw-bold text-dark mt-3">Supervision Ready</h4><p>Select a brand from the panel to manage live networks.</p></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingBranch && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4 shadow-lg">
              <h5 className="fw-bold mb-4 text-primary">Edit Branch</h5>
              <div className="mb-3"><label className="small fw-bold">Name</label><input className="form-control rounded-3 bg-light border-0" value={editingBranch.branch_name} onChange={e => setEditingBranch({...editingBranch, branch_name: e.target.value})} /></div>
              <div className="mb-4"><label className="small fw-bold">Location</label><input className="form-control rounded-3 bg-light border-0" value={editingBranch.location} onChange={e => setEditingBranch({...editingBranch, location: e.target.value})} /></div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1 rounded-pill fw-bold" onClick={handleUpdateBranch}>Save Changes</button>
                <button className="btn btn-light flex-grow-1 rounded-pill fw-bold" onClick={() => setEditingBranch(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;