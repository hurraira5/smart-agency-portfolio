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
      
      // Data ko LocalStorage mein save karein
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const role = res.data.user.role.toLowerCase().trim();

      // --- PROFESSIONAL ROLE-BASED REDIRECTION ---
      // window.location use kar rahe hain taaki session fresh load ho
      if (role === 'admin') {
        window.location.href = '/super-admin';
      } else if (role === 'boss') {
        window.location.href = '/boss-panel';
      } else if (role === 'manager') {
        window.location.href = '/manager'; // Manager ke liye ab /manager path hai
      } else {
        window.location.href = '/';
      }

    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login Failed! Check credentials.");
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>
      <div className="card border-0 shadow-lg rounded-4 p-5" style={{ maxWidth: '420px', width: '100%', background: '#ffffff' }}>
        <div className="text-center mb-4">
          {/* Professional Logo Placeholder */}
          <div style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #4e73df, #224abe)', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
            👑
          </div>
          <h3 className="fw-bold text-dark mb-1">Restaurant Management <span style={{ color: '#4e73df' }}>System</span></h3>
          <p className="text-muted small">Access your management dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Email Address</label>
            <input 
              type="email" 
              className="form-control rounded-pill bg-light border-0 px-4 py-2 shadow-sm" 
              placeholder="admin@example.com" 
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
              style={{ fontSize: '14px' }}
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Password</label>
            <input 
              type="password" 
              className="form-control rounded-pill bg-light border-0 px-4 py-2 shadow-sm" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ fontSize: '14px' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-md border-0 transition-all" style={{ background: 'linear-gradient(45deg, #4e73df, #224abe)', letterSpacing: '1px' }}>
            SIGN IN
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted x-small mb-0">Online Ordering System By Hurraira</p>
        </div>
      </div>
    </div>
  );
};

export default Login;