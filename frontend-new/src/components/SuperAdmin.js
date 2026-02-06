import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    branch_name: '',
    location: '',
    manager_name: '',
    contact_number: ''
  });

  // 1. Purani branches ko load karne ke liye
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await axios.get("https://smart-agency-api.vercel.app/api/branches");
      setBranches(res.data);
    } catch (err) {
      console.error("Error fetching branches", err);
    }
  };

  // 2. Form submit karne ke liye
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/branches/register", formData);
      alert("Branch Registered Successfully! 🍔");
      setFormData({ branch_name: '', location: '', manager_name: '', contact_number: '' });
      fetchBranches(); // List ko update karne ke liye
    } catch (err) {
      alert("Registration Failed!");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Super Admin <span className="text-warning">Dashboard</span></h2>
      
      {/* Branch Registration Form */}
      <div className="card p-4 shadow-sm mb-5 border-0 bg-light">
        <h4>Register New Branch</h4>
        <form onSubmit={handleSubmit} className="row g-3 mt-2">
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Branch Name" 
              value={formData.branch_name} onChange={(e) => setFormData({...formData, branch_name: e.target.value})} required />
          </div>
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Location" 
              value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Manager" 
              value={formData.manager_name} onChange={(e) => setFormData({...formData, manager_name: e.target.value})} />
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Contact" 
              value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-warning w-100 fw-bold">Add Branch</button>
          </div>
        </form>
      </div>

      {/* Branches List Table */}
      <h4>Active Branches</h4>
      <table className="table table-hover shadow-sm mt-3">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Manager</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>{branch.branch_name}</td>
              <td>{branch.location}</td>
              <td>{branch.manager_name}</td>
              <td>{branch.contact_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdminDashboard;