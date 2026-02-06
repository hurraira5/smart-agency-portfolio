import React from 'react';

const SuperAdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar (Chota sa simple) */}
        <nav className="col-md-2 d-none d-md-block bg-dark sidebar vh-100 p-3">
          <h4 className="text-warning mb-4">Burger O'Clock</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2"><a className="nav-link text-white active" href="#">Dashboard</a></li>
            <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Manage Branches</a></li>
            <li className="nav-item mb-2"><a className="nav-link text-white" href="#">Inventory</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="col-md-10 ms-sm-auto px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Super Admin Dashboard</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <span className="badge bg-warning text-dark p-2">Welcome, {user?.username}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 bg-primary text-white p-3 mb-3">
                <h5>Total Branches</h5>
                <h2>05</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 bg-success text-white p-3 mb-3">
                <h5>Active Staff</h5>
                <h2>42</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 bg-danger text-white p-3 mb-3">
                <h5>Pending Orders</h5>
                <h2>12</h2>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-5">
            <h3>Quick Actions</h3>
            <button className="btn btn-warning me-2 mt-2 fw-bold">+ Register New Branch</button>
            <button className="btn btn-outline-dark mt-2 fw-bold">View Reports</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;