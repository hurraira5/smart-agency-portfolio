import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Shop from './components/Shop';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ManagerDashboard from './components/ManagerDashboard';
import Admin from './components/Admin'; 
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

  if (userRole === 'admin' || userRole === 'superadmin') return children;
  
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
          <Route path="/" element={<Shop />} />
          <Route path="/shop/:id" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
          
          <Route path="/super-admin" element={
            <ProtectedRoute roleRequired="admin">
              <SuperAdmin />
            </ProtectedRoute>
          } />

          <Route path="/manager" element={
            <ProtectedRoute roleRequired="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/boss-panel" element={
            <ProtectedRoute roleRequired="boss">
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;