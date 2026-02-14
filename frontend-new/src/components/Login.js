import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSuccess = async (response) => {
    try {
      console.log("Google Token Received:", response.credential);
      const res = await axios.post("https://smart-agency-api.vercel.app/api/auth/google", {
        token: response.credential
      });
      
      localStorage.setItem('token', res.data.token || 'google-auth');
      localStorage.setItem('user', JSON.stringify(res.data.user));

      redirectUser(res.data.user.role);
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("Google Login Failed! Backend sync check karein.");
    }
  };

  const redirectUser = (userRole) => {
    const role = userRole.toLowerCase().trim();
    if (role === 'admin' || role === 'superadmin') {
      window.location.href = '/super-admin';
    } else if (role === 'boss') {
      window.location.href = '/boss-panel';
    } else if (role === 'manager') {
      window.location.href = '/manager';
    } else {
      window.location.href = '/';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://smart-agency-api.vercel.app/api/auth/login", {
        email: identifier.trim(), 
        password: password.trim()
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      redirectUser(res.data.user.role);
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login Failed! Check credentials.");
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>
      <div className="card border-0 shadow-lg rounded-4 p-5" style={{ maxWidth: '420px', width: '100%', background: '#ffffff' }}>
        <div className="text-center mb-4">
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
          
          <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-md border-0 transition-all mb-3" style={{ background: 'linear-gradient(45deg, #4e73df, #224abe)', letterSpacing: '1px' }}>
            SIGN IN
          </button>
        </form>

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted small">OR</span>
          <hr className="flex-grow-1" />
        </div>

        {/* --- FIXED GOOGLE LOGIN SECTION --- */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => console.log("Login Failed")}
            useOneTap
            theme="filled_blue"
            shape="pill"
            width="320"
          />
        </div>

        <div className="text-center mt-4">
          <p className="text-muted x-small mb-0">Online Ordering System By Hurraira</p>
        </div>
      </div>
    </div>
  );
};

export default Login;