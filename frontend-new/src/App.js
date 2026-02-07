import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components Imports
import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';

// PROTECTED ROUTE - NO FLASH VERSION
const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Agar token ya user nahi hai, to seedha login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Database se jo role aa raha hai usay clean karein
  const userRole = user.role.toLowerCase().trim();
  const requiredRole = roleRequired.toLowerCase().trim();

  // Agar role match nahi hota (e.g. user is 'admin' but page needs 'manager')
  if (userRole !== requiredRole) {
    console.error("Access Denied. User Role:", userRole, "Required:", requiredRole);
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/shop/:id" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        
        {/* SUPER ADMIN: DB Role must be 'admin' */}
        <Route path="/super-admin" element={
          <ProtectedRoute roleRequired="admin">
            <SuperAdmin />
          </ProtectedRoute>
        } />

        {/* MANAGER DASHBOARD: DB Role must be 'manager' */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;