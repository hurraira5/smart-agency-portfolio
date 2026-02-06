import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuperAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [branches, setBranches] = useState([]);
  
  // Restaurant Form States
  const [restName, setRestName] = useState('');
  const [restType, setRestType] = useState('single');

  // Branch Form States
  const [branchData, setBranchData] = useState({
    branch_name: '',
    location: '',
    manager_name: '',
    contact_number: ''
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("https://smart-agency-api.vercel.app/api/restaurants");
      setRestaurants(res.data);
    } catch (err) { console.error("Restaurants load nahi huye", err); }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/restaurants", { 
        name: restName, 
        type: restType 
      });
      alert("Restaurant Added Successfully! 🍔");
      setRestName('');
      fetchRestaurants();
    } catch (err) { alert("Error adding restaurant"); }
  };

  const handleSelectRestaurant = async (e) => {
    const restId = e.target.value;
    if (!restId) {
      setSelectedRest(null);
      setBranches([]);
      return;
    }
    
    const restaurant = restaurants.find(r => r.id === parseInt(restId));
    setSelectedRest(restaurant);

    try {
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${restId}/branches`);
      setBranches(res.data);
    } catch (err) { console.error("Branches load nahi huin", err); }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/branches/register", {
        ...branchData,
        restaurant_id: selectedRest.id
      });
      alert("Branch Added Successfully!");
      setBranchData({ branch_name: '', location: '', manager_name: '', contact_number: '' });
      // Refresh list
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data);
    } catch (err) { alert("Error adding branch"); }
  };

  const handleAddManager = async (branchId) => {
    const email = prompt("Manager Email:");
    const password = prompt("Manager Password:");
    if (!email || !password) return;
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/auth/register-manager", {
        username: 'Branch Manager',
        email,
        password,
        branch_id: branchId
      });
      alert("Manager Login Created! 🔑");
    } catch (err) { alert("Error: Email pehle se maujood ho sakta hai."); }
  };

  return (
    <div className="container mt-4 pb-5">
      <h2 className="fw-bold text-center mb-4 text-primary">Super Admin <span className="text-warning">Dashboard</span></h2>

      <div className="row g-4">
        {/* Step 1: Register Restaurant */}
        <div className="col-md-12">
          <div className="card p-4 shadow-sm border-0 bg-dark text-white">
            <h5 className="mb-3">1. Add New Restaurant / Brand</h5>
            <form onSubmit={handleAddRestaurant} className="row g-3">
              <div className="col-md-6">
                <input type="text" className="form-control" placeholder="Brand Name (e.g. Momo's Junction)" 
                  value={restName} onChange={(e) => setRestName(e.target.value)} required />
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-3 pt-1">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="rt" checked={restType === 'single'} onChange={() => setRestType('single')} />
                    <label className="form-check-label">Single Outlet</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="rt" checked={restType === 'multiple'} onChange={() => setRestType('multiple')} />
                    <label className="form-check-label">Multiple Branches</label>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <button className="btn btn-warning w-100 fw-bold">Register</button>
              </div>
            </form>
          </div>
        </div>

        {/* Step 2: Management Section */}
        <div className="col-md-12">
          <div className="card p-4 shadow-sm border-0">
            <h5 className="mb-3">2. Manage Branches & Managers</h5>
            <select className="form-select form-select-lg mb-4" onChange={handleSelectRestaurant}>
              <option value="">-- Select Brand to View --</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.type.toUpperCase()})</option>
              ))}
            </select>

            {selectedRest && (
              <div className="fade-in">
                {/* Branch Form - Single ho ya Multiple, Manager ke liye Branch banana zaroori hai */}
                <div className="bg-light p-3 rounded mb-4">
                  <h6 className="fw-bold mb-3">Add Branch / Outlet for {selectedRest.name}</h6>
                  <form onSubmit={handleAddBranch} className="row g-2">
                    <div className="col-md-3"><input type="text" className="form-control" placeholder="Branch Name" value={branchData.branch_name} onChange={(e) => setBranchData({...branchData, branch_name: e.target.value})} required /></div>
                    <div className="col-md-3"><input type="text" className="form-control" placeholder="Location" value={branchData.location} onChange={(e) => setBranchData({...branchData, location: e.target.value})} required /></div>
                    <div className="col-md-2"><input type="text" className="form-control" placeholder="Manager Name" value={branchData.manager_name} onChange={(e) => setBranchData({...branchData, manager_name: e.target.value})} /></div>
                    <div className="col-md-2"><input type="text" className="form-control" placeholder="Contact" value={branchData.contact_number} onChange={(e) => setBranchData({...branchData, contact_number: e.target.value})} /></div>
                    <div className="col-md-2"><button className="btn btn-primary w-100">+ Add Branch</button></div>
                  </form>
                </div>

                <h5 className="fw-bold mt-4">Active Branches</h5>
                <div className="table-responsive">
                  <table className="table table-hover mt-2 shadow-sm">
                    <thead className="table-dark">
                      <tr><th>Branch Name</th><th>Location</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {branches.length > 0 ? branches.map(b => (
                        <tr key={b.id}>
                          <td>{b.branch_name}</td>
                          <td>{b.location}</td>
                          <td>
                            <button onClick={() => handleAddManager(b.id)} className="btn btn-sm btn-success fw-bold">
                              Create Manager Login
                            </button>
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="text-center text-muted">No branches found. Please add a branch first to create a manager.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;