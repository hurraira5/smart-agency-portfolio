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
  const [branchData, setBranchData] = useState({ branch_name: '', location: '' });
  const [editingBranch, setEditingBranch] = useState(null);

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
      alert("Brand Registered! 🍔");
      setRestName(''); fetchRestaurants();
    } catch (err) { alert("Failed"); }
  };

  // --- DELETE ENTIRE BRAND ---
  const handleDeleteBrand = async (id, name) => {
    if(window.confirm(`⚠️ DANGER: Delete entire brand "${name}" and ALL its branches?`)) {
      try {
        await axios.delete(`https://smart-agency-api.vercel.app/api/restaurants/${id}`);
        alert("Brand Deleted!");
        setSelectedRest(null); fetchRestaurants();
      } catch (err) { alert("Error deleting brand"); }
    }
  };

  // --- NEW: HANDLE CREATE BOSS ACCOUNT ---
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
        branch_id: selectedRest.id 
      });
      alert("Brand Boss Account Created Successfully! 👑");
    } catch (err) { alert("Boss account creation failed"); }
  };

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
          <div className="col-md-4">
            <div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: 'linear-gradient(45deg, #6f42c1, #4e73df)' }}>
              <div className="d-flex justify-content-between">
                <div><small className="fw-bold opacity-75">TOTAL BRANDS</small><h2 className="fw-bold mb-0">{restaurants.length}</h2></div>
                <div className="fs-1 opacity-25">🏢</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}>
              <div className="d-flex justify-content-between">
                <div><small className="fw-bold opacity-75">LIVE BRANCHES</small><h2 className="fw-bold mb-0">{branches.length}</h2></div>
                <div className="fs-1 opacity-25">📍</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: 'linear-gradient(45deg, #f6c23e, #f39c12)' }}>
              <div className="d-flex justify-content-between">
                <div><small className="fw-bold opacity-75">TOTAL ORDERS</small><h2 className="fw-bold mb-0">{branchOrders.length}</h2></div>
                <div className="fs-1 opacity-25">📊</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4 border-top border-primary border-4">
              <h6 className="fw-bold mb-3 text-primary">BRAND ONBOARDING</h6>
              <form onSubmit={handleAddRestaurant}>
                <input className="form-control mb-2 rounded-3 bg-light border-0 py-2" placeholder="Brand Name (e.g. Mahanur)" value={restName} onChange={(e)=>setRestName(e.target.value)} required />
                <div className="d-flex gap-2 mb-3">
                  <button type="button" onClick={()=>setRestType('single')} className={`btn btn-sm flex-grow-1 rounded-pill ${restType==='single'?'btn-primary shadow-sm':'btn-light'}`}>Single Shop</button>
                  <button type="button" onClick={()=>setRestType('chain')} className={`btn btn-sm flex-grow-1 rounded-pill ${restType==='chain'?'btn-primary shadow-sm':'btn-light'}`}>Chain Store</button>
                </div>
                <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow">Register Brand</button>
              </form>
            </div>

            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0">MASTER AUDIT</h6>
                {selectedRest && (
                  <button onClick={() => handleDeleteBrand(selectedRest.id, selectedRest.name)} className="btn btn-sm btn-outline-danger border-0 fw-bold">Delete Brand 🗑️</button>
                )}
              </div>
              <select className="form-select mb-3 bg-light border-0 rounded-3 shadow-none" onChange={handleSelectRestaurant} value={selectedRest?.id || ""}>
                <option value="">-- Select Brand --</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <div className="list-group shadow-none" style={{maxHeight: '300px', overflowY: 'auto'}}>
                {branches.map(b => (
                  <div key={b.id} className={`d-flex align-items-center mb-2 p-3 rounded-4 shadow-sm transition-all ${selectedBranch?.id === b.id ? 'bg-primary text-white scale-in' : 'bg-light text-dark'}`}>
                    <div className="flex-grow-1 fw-bold cursor-pointer" onClick={() => handleManageBranch(b)}>{b.branch_name}</div>
                    <div className="d-flex gap-2">
                      <button onClick={() => setEditingBranch(b)} className="btn btn-sm p-0 text-info">✏️</button>
                      <button onClick={() => handleDeleteBranch(b.id)} className="btn btn-sm p-0 text-danger">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              {selectedRest && <button className="btn btn-outline-primary w-100 rounded-pill fw-bold btn-sm mt-3" onClick={() => setSelectedBranch(null)}>+ Establish New Branch</button>}
            </div>
          </div>

          <div className="col-lg-8">
            {selectedBranch ? (
               <div className="card p-4 shadow-sm border-0 rounded-4 bg-white fade-in">
                  <div className="d-flex justify-content-between mb-4 border-bottom pb-3">
                    <div>
                        <h4 className="fw-bold text-dark mb-0">{selectedBranch.branch_name}</h4>
                        <small className="text-muted">📍 {selectedBranch.location}</small>
                    </div>
                    {/* FIXED: Added Issue Key Buttons here */}
                    <div className="d-flex gap-2 align-items-center">
                        <button onClick={handleAddBoss} className="btn btn-warning rounded-pill px-3 shadow-sm btn-sm fw-bold">Issue Boss Key 👑</button>
                        <button onClick={() => {
                            const email = prompt("Manager Email:");
                            const pass = prompt("Manager Password:");
                            if(email && pass) axios.post("https://smart-agency-api.vercel.app/api/auth/register-manager", { username: 'Manager', email, password: pass, branch_id: selectedBranch.id }).then(() => alert("Manager Key Issued! 🔑"));
                        }} className="btn btn-dark rounded-pill px-3 shadow-sm btn-sm">Issue Manager Key 🔑</button>
                    </div>
                  </div>
                  <div className="row g-3 mb-4 text-center">
                    <div className="col-md-6">
                        <div className="p-3 rounded-4 bg-light">
                            <h2 className="fw-bold text-primary mb-0">Rs. {branchOrders.reduce((a, b) => a + Number(b.total_amount), 0).toLocaleString()}</h2>
                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px'}}>Branch Sales</small>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="p-3 rounded-4 bg-light">
                            <h2 className="fw-bold text-dark mb-0">{branchOrders.length}</h2>
                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px'}}>Total Tickets</small>
                        </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light"><tr className="small text-muted"><th>ID</th><th>TXN ID</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                      <tbody>{branchOrders.map(o => (<tr key={o.id}><td>#{o.id}</td><td><span className="badge bg-light text-primary border rounded-pill px-3 py-2 fw-bold">{o.transaction_id || 'N/A'}</span></td><td>{o.customer_name}</td><td className="fw-bold">Rs. {o.total_amount}</td><td><span className={`badge rounded-pill px-3 py-2 ${o.status==='Accepted'?'bg-success':'bg-warning text-dark'}`}>{o.status}</span></td></tr>))}</tbody>
                    </table>
                  </div>
               </div>
            ) : selectedRest ? (
              <div className="card p-5 shadow-sm border-0 rounded-4 bg-white text-center">
                <div className="display-1 text-primary opacity-25 mb-3">🏢</div>
                <h4 className="fw-bold">New Branch Setup: {selectedRest.name}</h4>
                <p className="text-muted">Fill details below to expand this brand.</p>
                <form onSubmit={handleAddBranch} className="row g-3 mt-2">
                  <div className="col-md-6"><input className="form-control bg-light border-0 py-2 rounded-3" placeholder="Branch Name" value={branchData.branch_name} onChange={e=>setBranchData({...branchData,branch_name:e.target.value})} required /></div>
                  <div className="col-md-6"><input className="form-control bg-light border-0 py-2 rounded-3" placeholder="City Location" value={branchData.location} onChange={e=>setBranchData({...branchData,location:e.target.value})} required /></div>
                  <div className="col-12 mt-4"><button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm">Complete Establishment ✅</button></div>
                </form>
              </div>
            ) : (
              <div className="card p-5 text-center text-muted rounded-4 bg-white border-2 border-dashed h-100 d-flex align-items-center justify-content-center">
                <div><div className="display-1 opacity-25">🛡️</div><h4 className="fw-bold text-dark mt-3">Ready for Supervision</h4><p>Select a restaurant from the audit panel to begin management.</p></div>
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
              <h5 className="fw-bold mb-4 text-primary">Edit Branch Identity</h5>
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