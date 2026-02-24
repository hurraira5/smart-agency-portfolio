import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Aapka direct image link
  const bgImage = "https://i.ibb.co/xS0d2rXw/image.jpg"; 

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post("https://smart-agency-api.vercel.app/api/auth/google", {
        token: response.credential
      });
      localStorage.setItem('token', res.data.token || 'google-auth');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      redirectUser(res.data.user.role);
    } catch (err) {
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
      backgroundImage: `url('${bgImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', // Default center for mobile
      fontFamily: "'Poppins', sans-serif",
      position: 'relative'
    }}>
      {/* CSS for Desktop Responsive - Isay aise hi rehne dena */}
      <style>{`
        @media (min-width: 768px) {
          .login-container {
            margin-right: 8%;
            margin-left: auto;
          }
        }
        @media (max-width: 767px) {
          .login-container {
            width: 90% !important;
            margin: 0 auto;
            padding: 30px !important;
          }
        }
      `}</style>
      
      {/* Login Card */}
      <div className="login-container" style={{ 
        maxWidth: '400px', 
        width: '100%', 
        backgroundColor: 'white', 
        padding: '40px',
        borderRadius: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        zIndex: 2
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ 
            width: '55px', height: '55px', 
            background: '#dc3545', 
            borderRadius: '15px', 
            margin: '0 auto 15px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#fff', fontSize: '22px'
          }}>
            🍔
          </div>
          <h3 style={{ fontWeight: '900', color: '#333', margin: 0 }}>
            SMART <span style={{ color: '#dc3545' }}>ADMIN</span>
          </h3>
          <p style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', marginTop: '5px' }}>
            SYSTEM ACCESS
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
              style={{ 
                width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #eee',
                backgroundColor: '#fdfdfd', fontSize: '14px', outline: 'none'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ 
                width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #eee',
                backgroundColor: '#fdfdfd', fontSize: '14px', outline: 'none'
              }}
            />
          </div>
          
          <button type="submit" style={{ 
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold', fontSize: '14px',
            cursor: 'pointer', boxShadow: '0 5px 15px rgba(220, 53, 69, 0.3)'
          }}>
            LOGIN
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
          <span style={{ margin: '0 10px', color: '#ccc', fontSize: '10px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => console.log("Login Failed")}
            width="100%"
          />
        </div>

      </div>
    </div>
  );
};

export default Login;