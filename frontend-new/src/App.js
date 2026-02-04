import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = "https://smart-agency-api.vercel.app";

function App() {
  const [menu, setMenu] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Fast Food'
  });

  // 1. Data Load Karna
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/menu`);
      setMenu(res.data);
    } catch (err) { console.error("Error fetching menu", err); }
  };

  // 2. Nayi Dish Add Karna
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/menu/add`, formData);
      alert("Dish Added! 🍔");
      setFormData({ name: '', description: '', price: '', category: 'Fast Food' });
      fetchMenu();
    } catch (err) { alert("Error adding dish"); }
  };

  // 3. Delete Karna
  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await axios.delete(`${API_BASE_URL}/api/menu/${id}`);
      fetchMenu();
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 text-danger fw-bold">🍔 My Restaurant Menu Admin</h1>
      
      {/* Form Section */}
      <div className="card p-4 shadow-sm mb-5">
        <h4>Add New Dish</h4>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <input type="text" placeholder="Dish Name" className="form-control" 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="col-md-2">
            <input type="number" placeholder="Price" className="form-control" 
              value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="Fast Food">Fast Food</option>
              <option value="Desi">Desi</option>
              <option value="Drinks">Drinks</option>
            </select>
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-danger w-100">Add to Menu</button>
          </div>
          <div className="col-12">
            <textarea placeholder="Description" className="form-control" 
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
        </form>
      </div>

      {/* Menu List */}
      <div className="row">
        {menu.map(item => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-danger">
              <div className="card-body">
                <span className="badge bg-warning text-dark mb-2">{item.category}</span>
                <h5 className="card-title fw-bold">{item.name}</h5>
                <p className="card-text text-muted small">{item.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 text-danger mb-0">Rs. {item.price}</span>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;