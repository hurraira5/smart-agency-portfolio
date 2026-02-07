import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components Imports
import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';

// Protected Route Logic
const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // standardizing role check
  const userRole = user.role.toLowerCase().trim();
  const requiredRole = roleRequired.toLowerCase().trim();

  if (userRole !== requiredRole) {
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
        <Route path="/shop/:id" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        
        {/* Super Admin Route - Role is 'admin' in DB */}
        <Route path="/super-admin" element={
          <ProtectedRoute roleRequired="admin">
            <SuperAdmin />
          </ProtectedRoute>
        } />

        {/* Manager Dashboard Route - Role is 'manager' in DB */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;