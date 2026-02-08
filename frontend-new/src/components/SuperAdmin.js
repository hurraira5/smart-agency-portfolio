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
      alert("Brand Registered!");
      setRestName(''); fetchRestaurants();
    } catch (err) { alert("Error"); }
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
      alert("Branch added!");
      setBranchData({ branch_name: '', location: '' });
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data);
    } catch (err) { alert("Error"); }
  };

  const handleDeleteBranch = async (id) => {
    if(window.confirm("Delete branch?")) {
      try {
        await axios.delete(`https://smart-agency-api.vercel.app/api/branches/${id}`);
        setBranches(branches.filter(b => b.id !== id));
      } catch (err) { alert("Error"); }
    }
  };

  const handleUpdateBranch = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${editingBranch.id}`, editingBranch);
      alert("Updated!");
      setEditingBranch(null);
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data);
    } catch (err) { alert("Error"); }
  };

  return (
    <div style={{ backgroundColor: '#F0F2F5', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <nav className="navbar navbar-expand-lg bg-white border-bottom px-4 py-3 sticky-top shadow-sm">
        <div className="container-fluid"><span className="navbar-brand fw-bold text-primary">SMART ADMIN</span><button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-outline-danger btn-sm rounded-pill fw-bold px-4">Sign Out</button></div>
      </nav>
      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4 mb-4">
          <div className="col-md-4"><div className="card border-0 shadow-sm rounded-4 p-3" style={{ borderLeft: '5px solid #4e73df' }}><small className="fw-bold">TOTAL BRANDS</small><h3 className="fw-bold">{restaurants.length}</h3></div></div>
          <div className="col-md-4"><div className="card border-0 shadow-sm rounded-4 p-3" style={{ borderLeft: '5px solid #1cc88a' }}><small className="fw-bold">TOTAL REVENUE (SELECTED)</small><h3 className="fw-bold">Rs. {branchOrders.reduce((a, b) => a + Number(b.total_amount), 0).toLocaleString()}</h3></div></div>
          <div className="col-md-4"><div className="card border-0 shadow-sm rounded-4 p-3" style={{ borderLeft: '5px solid #e74a3b' }}><small className="fw-bold">PENDING ORDERS</small><h3 className="fw-bold">{branchOrders.filter(o => o.status === 'Received').length}</h3></div></div>
        </div>
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white mb-4"><h6 className="fw-bold mb-3 border-bottom pb-2">CREATE BRAND</h6><form onSubmit={handleAddRestaurant}><input className="form-control mb-2 rounded-3" placeholder="Brand Name" value={restName} onChange={(e)=>setRestName(e.target.value)} required /><div className="d-flex gap-2 mb-3"><button type="button" onClick={()=>setRestType('single')} className={`btn btn-sm flex-grow-1 rounded-pill ${restType==='single'?'btn-primary':'btn-light'}`}>Single</button><button type="button" onClick={()=>setRestType('chain')} className={`btn btn-sm flex-grow-1 rounded-pill ${restType==='chain'?'btn-primary':'btn-light'}`}>Chain</button></div><button className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm">Register</button></form></div>
            <div className="card p-4 shadow-sm border-0 rounded-4 bg-white"><h6 className="fw-bold mb-3 border-bottom pb-2">AUDIT SELECTION</h6><select className="form-select mb-3" onChange={handleSelectRestaurant} value={selectedRest?.id || ""}><option value="">-- Choose Brand --</option>{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select><div className="list-group">{branches.map(b => (<div key={b.id} className={`d-flex align-items-center mb-2 p-2 rounded-3 shadow-sm ${selectedBranch?.id === b.id ? 'bg-primary text-white' : 'bg-light'}`}><div className="flex-grow-1 fw-bold cursor-pointer px-2" onClick={() => handleManageBranch(b)}>{b.branch_name}</div><button onClick={() => setEditingBranch(b)} className="btn btn-sm text-white">✏️</button><button onClick={() => handleDeleteBranch(b.id)} className="btn btn-sm text-white">🗑️</button></div>))}</div>{selectedRest && <button className="btn btn-outline-primary w-100 rounded-pill fw-bold btn-sm mt-2" onClick={() => setSelectedBranch(null)}>+ New Branch</button>}</div>
          </div>
          <div className="col-lg-8">
            {selectedBranch ? ( <div className="card p-4 shadow-sm rounded-4 bg-white"><h4>{selectedBranch.branch_name} Transactions</h4><div className="table-responsive"><table className="table table-hover mt-3"><thead><tr className="small text-muted"><th>ID</th><th>TXN ID</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{branchOrders.map(o => (<tr key={o.id}><td>#{o.id}</td><td><span className="badge bg-light text-primary border rounded-pill">{o.transaction_id || 'N/A'}</span></td><td>{o.customer_name}</td><td className="fw-bold text-danger">Rs. {o.total_amount}</td><td><span className="badge rounded-pill bg-warning text-dark">{o.status}</span></td></tr>))}</tbody></table></div></div> ) : selectedRest ? ( <div className="card p-5 shadow-sm rounded-4 bg-white"><h4>New Branch: {selectedRest.name}</h4><form onSubmit={handleAddBranch}><input className="form-control mb-3" placeholder="Branch Name" value={branchData.branch_name} onChange={e=>setBranchData({...branchData,branch_name:e.target.value})} /><input className="form-control mb-4" placeholder="Location" value={branchData.location} onChange={e=>setBranchData({...branchData,location:e.target.value})} /><button className="btn btn-primary w-100 rounded-pill">Create</button></form></div> ) : <div className="card p-5 text-center text-muted rounded-4 bg-white">Select a brand to manage.</div>}
          </div>
        </div>
      </div>
      {editingBranch && ( <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)'}}><div className="modal-dialog modal-dialog-centered"><div className="modal-content rounded-4 p-4 border-0"><h5>Edit Branch</h5><input className="form-control mb-2" value={editingBranch.branch_name} onChange={e => setEditingBranch({...editingBranch, branch_name: e.target.value})} /><input className="form-control mb-3" value={editingBranch.location} onChange={e => setEditingBranch({...editingBranch, location: e.target.value})} /><div className="d-flex gap-2"><button className="btn btn-primary flex-grow-1 rounded-pill" onClick={handleUpdateBranch}>Save</button><button className="btn btn-light flex-grow-1 rounded-pill" onClick={() => setEditingBranch(null)}>Cancel</button></div></div></div></div> )}
    </div>
  );
};
export default SuperAdmin;