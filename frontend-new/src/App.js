import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components Imports
import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';

// Protected Route Logic
const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Role check logic
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
        <Route path="/shop/:id" element={<Shop />} /> {/* Dynamic Branch Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Super Admin Route */}
        <Route path="/super-admin" element={
          <ProtectedRoute roleRequired="superadmin">
            <SuperAdmin />
          </ProtectedRoute>
        } />

        {/* Manager Dashboard Route */}
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