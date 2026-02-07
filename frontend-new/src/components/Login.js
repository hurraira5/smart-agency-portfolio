import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // APNI VERCEL API URL CHECK KAREIN
      const res = await axios.post("https://smart-agency-api.vercel.app/api/auth/login", {
        email: identifier.trim(), 
        password: password.trim()
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Standardizing Role Navigation
      const role = res.data.user.role;

      if (role === 'admin') {
        window.location.assign('/super-admin');
      } else if (role === 'manager') {
        window.location.assign('/admin');
      } else {
        window.location.assign('/');
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login Failed! Check credentials.");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4 fw-bold">Restaurant <span className="text-warning">Login</span></h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Email" 
              onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-warning w-100 fw-bold">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;