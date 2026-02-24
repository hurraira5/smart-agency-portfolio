import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Saare Components ke Imports
import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';
import Admin from './components/Admin'; 
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';

// Protected Route Logic
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

  if (!isReady) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center font-black italic uppercase tracking-tighter animate-pulse text-red-600">
        Verifying Session...
      </div>
    </div>
  );

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase().trim();
  const requiredRole = roleRequired.toLowerCase().trim();

  // Superadmin bypass: Superadmin sab dekh sakta hai
  if (userRole === 'superadmin' || userRole === 'admin') return children;
  
  // Specific role check
  if (userRole !== requiredRole) { 
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const googleClientId = "79527190674-p698bufqamlc2vkbla2c702q6t71ain1.apps.googleusercontent.com"; 

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Shop />} />
          <Route path="/shop/:branchId" element={<Shop />} /> {/* branchId naming behtar hai */}
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
          
          {/* SUPER ADMIN: Poore system ka owner */}
          <Route path="/super-admin" element={
            <ProtectedRoute roleRequired="admin">
              <SuperAdmin />
            </ProtectedRoute>
          } />

          {/* MANAGER: Sirf apni branch ka manager (Yahan galti thi, ab theek hai) */}
          <Route path="/manager" element={
            <ProtectedRoute roleRequired="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />

          {/* BOSS/OWNER: Jo reports dekhta hai */}
          <Route path="/boss-panel" element={
            <ProtectedRoute roleRequired="boss">
              <Admin />
            </ProtectedRoute>
          } />

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;