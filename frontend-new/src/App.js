import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components Imports
import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';
import Admin from './components/Admin'; // Ye aapka Boss Panel hai
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';

const ProtectedRoute = ({ children, roleRequired }) => {
  const [isReady, setIsReady] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return <div className="text-center mt-5"><h5>Verifying Session...</h5></div>;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase().trim();
  const requiredRole = roleRequired.toLowerCase().trim();

  // Agar user 'admin' (Super Admin) hai toh wo har jagah ja sakta hai
  // Warna uska role requiredRole se match hona chahiye
  if (userRole === 'admin') return children;
  
  if (userRole !== requiredRole) { 
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Face: localhost:3000/ per abhi Shop hai */}
        <Route path="/" element={<Shop />} />
        <Route path="/shop/:id" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        
        {/* 1. Super Admin (Aap ka Panel) */}
        <Route path="/super-admin" element={
          <ProtectedRoute roleRequired="admin">
            <SuperAdmin />
          </ProtectedRoute>
        } />

        {/* 2. Manager Dashboard (Branch Level) */}
        <Route path="/manager" element={
          <ProtectedRoute roleRequired="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* 3. Boss Panel (Brand Owner Level) - Admin.js use karega */}
        <Route path="/boss-panel" element={
          <ProtectedRoute roleRequired="boss">
            <Admin />
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;