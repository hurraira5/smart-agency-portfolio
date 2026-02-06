import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Saari Imports
import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';

// IS HISSE KO UPDATE KIYA HAI
const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Console mein check karne ke liye
  console.log("Current User Role:", user?.role);

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Role check logic (Flexible update)
  if (roleRequired && user.role.toLowerCase() !== roleRequired.toLowerCase()) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        
        {/* Super Admin Route */}
        <Route path="/super-admin" element={
          <ProtectedRoute roleRequired="superadmin">
            <SuperAdmin />
          </ProtectedRoute>
        } />

        {/* Manager Dashboard Route (Yahan role admin hai) */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <ManagerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;