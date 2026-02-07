import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components Imports
import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';

// --- PROTECTED ROUTE WITH LIVE SYNC ---
const ProtectedRoute = ({ children, roleRequired }) => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Thora sabar taaki localStorage read ho jaye
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (token && user) {
        const userRole = user.role.toLowerCase().trim();
        const requiredRole = roleRequired.toLowerCase().trim();

        if (userRole === requiredRole) {
          setIsAuthorized(true);
        }
      }
      setIsReady(true);
    };

    checkAuth();
  }, [roleRequired]);

  // Jab tak check ho raha hai, blank screen ya redirect nahi hoga
  if (!isReady) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', background: '#f8f9fa'}}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
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
        
        {/* SUPER ADMIN - DB Role: 'admin' */}
        <Route path="/super-admin" element={
          <ProtectedRoute roleRequired="admin">
            <SuperAdmin />
          </ProtectedRoute>
        } />

        {/* MANAGER DASHBOARD - DB Role: 'manager' */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;