import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManagerDashboard = () => {
  const [branchInfo, setBranchInfo] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        // Token se branch_id lekar details mangwana
        const res = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}`);
        setBranchInfo(res.data);
      } catch (err) {
        console.error("Error fetching branch data", err);
      }
    };
    if (user && user.branch_id) {
      fetchBranchData();
    }
  }, [user]);

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4 border-0 bg-light">
        <h2 className="text-primary fw-bold">Branch Manager Dashboard</h2>
        <hr />
        {branchInfo ? (
          <div>
            <h4>Welcome, <span className="text-success">{user.username}</span></h4>
            <p className="lead">You are managing: <strong>{branchInfo.branch_name}</strong></p>
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card p-3 bg-white shadow-sm border-start border-primary border-4">
                  <h6>Branch Location</h6>
                  <p>{branchInfo.location}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-3 bg-white shadow-sm border-start border-success border-4">
                  <h6>Contact Number</h6>
                  <p>{branchInfo.contact_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading branch information...</p>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;