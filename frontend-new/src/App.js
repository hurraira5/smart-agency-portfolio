import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Shop from './components/Shop';
import Admin from './components/Admin';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';

// Protected Route Logic
const ProtectedRoute = ({ children, roleRequired }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/super-admin" element={<ProtectedRoute roleRequired="superadmin"><SuperAdmin /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
export default App;