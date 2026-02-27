import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Aapka bheja hua image link (Direct Link Version)
  const bgImage = "https://i.postimg.cc/TY8wgvjr/Login-Background-1-01.jpg";

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post("https://smart-agency-api.vercel.app/api/auth/google", {
        token: response.credential
      });
      localStorage.setItem('token', res.data.token || 'google-auth');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      redirectUser(res.data.user.role);
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("Google Login Failed!");
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
      alert(err.response?.data?.message || "Login Failed!");
    }
  };

  return (
    <div style={{
      // Background Image with a slight dark overlay for better text visibility
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('${bgImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end', // Card moves to right
      paddingRight: '8%', // Gap from right edge
      fontFamily: "'Poppins', sans-serif",
      overflow: 'hidden'
    }}>
     
      {/* Login Card */}
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        padding: '40px',
        borderRadius: '30px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: '1px solid rgba(220, 53, 69, 0.1)'
      }}>
       
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px', height: '60px',
            background: '#dc3545',
            borderRadius: '15px',
            margin: '0 auto 15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '24px',
            boxShadow: '0 10px 20px rgba(220, 53, 69, 0.3)'
          }}>
            🍔
          </div>
          <h3 style={{ fontWeight: '900', color: '#333', marginBottom: '5px', letterSpacing: '-1px' }}>
            RESTAURANT MANGEMNET <span style={{ color: '#dc3545' }}>SYSTEM</span>
          </h3>
          <p style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
            Login to Access Your Ordering System
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '8px', marginLeft: '5px' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="admin@smart.com"
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={{
                width: '100%', padding: '15px 20px', borderRadius: '15px', border: '1px solid #eee',
                backgroundColor: '#f9f9f9', fontSize: '14px', outline: 'none', transition: '0.3s'
              }}
            />
          </div>
         
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '8px', marginLeft: '5px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '15px 20px', borderRadius: '15px', border: '1px solid #eee',
                backgroundColor: '#f9f9f9', fontSize: '14px', outline: 'none'
              }}
            />
          </div>
         
          <button type="submit" style={{
            width: '100%', padding: '15px', borderRadius: '15px', border: 'none',
            backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold', fontSize: '14px',
            cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 15px rgba(220, 53, 69, 0.2)',
            textTransform: 'uppercase'
          }}>
            Sign In
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
          <span style={{ margin: '0 15px', color: '#aaa', fontSize: '10px', fontWeight: 'bold' }}>OR SIGN IN WITH</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Login Failed")}
            shape="pill"
            width="340"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#bbb', fontSize: '9px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
            Powered by Restaurant Management System 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
