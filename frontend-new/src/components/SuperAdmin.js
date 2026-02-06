import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuperAdminDashboard = () => {
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
    } catch (err) { console.error(err); }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/restaurants", { 
        name: restName, 
        type: restType 
      });
      alert("Restaurant Added Successfully!");
      setRestName('');
      fetchRestaurants();
    } catch (err) { alert("Error adding restaurant"); }
  };

  const handleSelectRestaurant = async (e) => {
    const restId = e.target.value;
    const restaurant = restaurants.find(r => r.id === parseInt(restId));
    setSelectedRest(restaurant);

    if (restaurant && restaurant.type === 'multiple') {
      try {
        const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${restId}/branches`);
        setBranches(res.data);
      } catch (err) { console.error(err); }
    } else {
      setBranches([]);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/branches/register", {
        ...branchData,
        restaurant_id: selectedRest.id
      });
      alert("Branch Added!");
      setBranchData({ branch_name: '', location: '', manager_name: '', contact_number: '' });
      // Refresh branch list
      const res = await axios.get(`https://smart-agency-api.vercel.app/api/restaurants/${selectedRest.id}/branches`);
      setBranches(res.data);
    } catch (err) { alert("Error adding branch"); }
  };

  return (
    <div className="container mt-4 pb-5">
      <h2 className="fw-bold text-center mb-4">Super Admin <span className="text-warning">Panel</span></h2>

      <div className="row g-4">
        {/* Step 1: Add Restaurant */}
        <div className="col-md-12">
          <div className="card p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">Step 1: Register New Restaurant / Brand</h5>
            <form onSubmit={handleAddRestaurant} className="row g-3 align-items-center">
              <div className="col-md-5">
                <input type="text" className="form-control" placeholder="Restaurant Name" 
                  value={restName} onChange={(e) => setRestName(e.target.value)} required />
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-3 mt-1">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="type" id="single" 
                      checked={restType === 'single'} onChange={() => setRestType('single')} />
                    <label className="form-check-label" htmlFor="single">Single Outlet</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="type" id="multiple" 
                      checked={restType === 'multiple'} onChange={() => setRestType('multiple')} />
                    <label className="form-check-label" htmlFor="multiple">Multiple Branches</label>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <button className="btn btn-dark w-100 fw-bold">Add Restaurant</button>
              </div>
            </form>
          </div>
        </div>

        {/* Step 2: Select & Manage */}
        <div className="col-md-12">
          <div className="card p-4 shadow-sm border-0 bg-light">
            <h5 className="fw-bold mb-3">Step 2: Manage Brands & Branches</h5>
            <select className="form-select form-select-lg mb-3" onChange={handleSelectRestaurant}>
              <option value="">-- Choose a Restaurant to view/add branches --</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.type.toUpperCase()})</option>
              ))}
            </select>

            {selectedRest && selectedRest.type === 'single' && (
              <div className="alert alert-info">
                Ye ek <strong>Single Outlet</strong> hai. Iske liye alag se branches ki zaroorat nahi.
              </div>
            )}

            {selectedRest && selectedRest.type === 'multiple' && (
              <div className="mt-4">
                <h6 className="fw-bold">Add New Branch for {selectedRest.name}</h6>
                <form onSubmit={handleAddBranch} className="row g-2 mb-4">
                  <div className="col-md-3"><input type="text" className="form-control" placeholder="Branch Name" value={branchData.branch_name} onChange={(e) => setBranchData({...branchData, branch_name: e.target.value})} required /></div>
                  <div className="col-md-3"><input type="text" className="form-control" placeholder="Location" value={branchData.location} onChange={(e) => setBranchData({...branchData, location: e.target.value})} required /></div>
                  <div className="col-md-2"><input type="text" className="form-control" placeholder="Manager" value={branchData.manager_name} onChange={(e) => setBranchData({...branchData, manager_name: e.target.value})} /></div>
                  <div className="col-md-2"><input type="text" className="form-control" placeholder="Contact" value={branchData.contact_number} onChange={(e) => setBranchData({...branchData, contact_number: e.target.value})} /></div>
                  <div className="col-md-2"><button className="btn btn-warning w-100 fw-bold">Add</button></div>
                </form>

                <h6 className="fw-bold">Active Branches list:</h6>
                <table className="table table-sm table-hover bg-white shadow-sm">
                  <thead className="table-dark">
                    <tr><th>Branch</th><th>Location</th><th>Manager</th><th>Contact</th></tr>
                  </thead>
                  <tbody>
                    {branches.length > 0 ? branches.map(b => (
                      <tr key={b.id}><td>{b.branch_name}</td><td>{b.location}</td><td>{b.manager_name}</td><td>{b.contact_number}</td></tr>
                    )) : <tr><td colSpan="4" className="text-center">No branches added yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;