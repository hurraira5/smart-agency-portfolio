import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Shop = () => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    axios.get("https://smart-agency-api.vercel.app/api/menu")
      .then(res => setMenu(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="container mt-5 text-center">
      <h1 className="fw-bold text-warning">🍔 BURGER O'CLOCK</h1>
      <p className="lead">Select your favorite branch and order now!</p>
      <div className="row mt-5">
        {menu.map(item => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold">{item.name}</h5>
                <p className="card-text text-muted">Fresh & Hot</p>
                <h4 className="text-danger">Rs. {item.price}</h4>
                <button className="btn btn-warning w-100 mt-2 fw-bold">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;