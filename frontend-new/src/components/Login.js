import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Backend API Call
      const res = await axios.post("https://smart-agency-api.vercel.app/api/auth/login", {
        email: identifier.trim(), 
        password: password.trim()
      });
      
      // Data ko LocalStorage mein pakka save karein
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const role = res.data.user.role.toLowerCase().trim();

      // LIVE FIX: window.location.href use kar rahe hain taaki 
      // browser refresh ho kar dashboard load kare aur flash na ho.
      if (role === 'admin') {
        window.location.href = '/super-admin';
      } else if (role === 'manager') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }

    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login Failed! Check credentials.");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4 fw-bold">Restaurant <span className="text-warning">Login</span></h3>
        <p className="text-center text-muted small">Enter your admin/manager credentials</p>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Email</label>
            <input 
              type="email" 
              className="form-control shadow-sm" 
              placeholder="admin@example.com" 
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Password</label>
            <input 
              type="password" 
              className="form-control shadow-sm" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm mt-2">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;