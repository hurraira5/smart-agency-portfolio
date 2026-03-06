import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgImage = "https://i.postimg.cc/TY8wgvjr/Login-Background-1-01.jpg";
  const API_BASE = "https://smart-agency-backend.vercel.app/api";

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.post(`${API_BASE}/auth/google`, {
        token: response.credential
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        redirectUser(res.data.user.role);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.response?.data?.message || "Google Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (userRole) => {
    const role = userRole.toLowerCase().trim();
    
    if (role === 'superadmin') {
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
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login to:', `${API_BASE}/auth/login`);
      
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: identifier.trim(),
        password: password.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Login response:', res.data);
      
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        redirectUser(res.data.user.role);
      } else {
        setError('Invalid response from server');
      }
      
    } catch (err) {
      console.error("Login error details:", {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config
      });
      
      if (err.code === 'ECONNABORTED') {
        setError('Connection timeout. Please try again.');
      } else if (err.response) {
        // Server responded with error
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // Request made but no response
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('${bgImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '8%',
      fontFamily: "'Poppins', sans-serif",
      overflow: 'hidden'
    }}>
     
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
            RESTAURANT MANAGEMENT <span style={{ color: '#dc3545' }}>SYSTEM</span>
          </h3>
          <p style={{ color: '#777', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
            Login to Access Your Ordering System
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '8px', marginLeft: '5px' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="admin@burger.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%', padding: '15px 20px', borderRadius: '15px', border: '1px solid #eee',
                backgroundColor: loading ? '#f5f5f5' : '#f9f9f9', 
                fontSize: '14px', outline: 'none', transition: '0.3s',
                opacity: loading ? 0.7 : 1
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%', padding: '15px 20px', borderRadius: '15px', border: '1px solid #eee',
                backgroundColor: loading ? '#f5f5f5' : '#f9f9f9', 
                fontSize: '14px', outline: 'none',
                opacity: loading ? 0.7 : 1
              }}
            />
          </div>
         
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: '15px', border: 'none',
              backgroundColor: loading ? '#999' : '#dc3545', 
              color: 'white', fontWeight: 'bold', fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s ease', 
              boxShadow: '0 8px 15px rgba(220, 53, 69, 0.2)',
              textTransform: 'uppercase'
            }}>
            {loading ? 'LOGGING IN...' : 'Sign In'}
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
            onError={() => {
              console.log("Google Login Failed");
              setError("Google Login Failed");
            }}
            shape="pill"
            width="340"
            disabled={loading}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#bbb', fontSize: '9px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
            POWERED BY RESTAURANT MANAGEMENT SYSTEM 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;