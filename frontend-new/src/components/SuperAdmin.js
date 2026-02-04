import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [branch, setBranch] = useState({ name: '', location: '', boss_email: '' });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between">
        <h2 className="fw-bold text-danger">👑 Super Admin Panel</h2>
        <button onClick={handleLogout} className="btn btn-dark btn-sm">Logout</button>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-5">
          <div className="card p-4 shadow-sm border-0 bg-light">
            <h4 className="mb-3">Onboard New Branch</h4>
            <input type="text" className="form-control mb-2" placeholder="Branch Name (e.g. DHA Phase 6)" 
              onChange={(e) => setBranch({...branch, name: e.target.value})} />
            <input type="text" className="form-control mb-2" placeholder="Location" 
              onChange={(e) => setBranch({...branch, location: e.target.value})} />
            <input type="email" className="form-control mb-3" placeholder="Boss Email" 
              onChange={(e) => setBranch({...branch, boss_email: e.target.value})} />
            <button className="btn btn-danger w-100">Register Branch & Boss</button>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card p-4 shadow-sm border-0">
            <h4>System Overview</h4>
            <p className="text-muted">Branches aur Managers ka data yahan list hoga.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;