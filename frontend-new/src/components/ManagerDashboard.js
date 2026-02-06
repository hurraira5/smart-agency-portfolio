import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManagerDashboard = () => {
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger' });
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.branch_id) {
      fetchBranchAndMenu();
    }
  }, []);

  const fetchBranchAndMenu = async () => {
    try {
      // Branch ki details
      const bRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}`);
      setBranchInfo(bRes.data);
      
      // Menu items ki list
      const mRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${user.branch_id}`);
      setMenuItems(mRes.data);
    } catch (err) {
      console.error("Data load karne mein error", err);
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/menu", {
        ...foodData,
        branch_id: user.branch_id
      });
      alert("Food Item Added! 🍔");
      setFoodData({ name: '', price: '', category: 'Burger' });
      fetchBranchAndMenu(); // Table refresh karne ke liye
    } catch (err) {
      alert("Error adding food item");
    }
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="card shadow-sm p-4 mb-4 border-0 bg-primary text-white">
        <h2 className="fw-bold">Manager Dashboard</h2>
        {branchInfo && (
          <p className="mb-0">Managing: <strong>{branchInfo.branch_name}</strong> | {branchInfo.location}</p>
        )}
      </div>

      <div className="row g-4">
        {/* Form Section */}
        <div className="col-md-4">
          <div className="card p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3 text-primary">Add New Item</h5>
            <form onSubmit={handleAddFood}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Item Name</label>
                <input type="text" className="form-control" placeholder="e.g. Zinger Burger" 
                  value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Price (PKR)</label>
                <input type="number" className="form-control" placeholder="e.g. 450" 
                  value={foodData.price} onChange={(e) => setFoodData({...foodData, price: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Category</label>
                <select className="form-select" value={foodData.category} onChange={(e) => setFoodData({...foodData, category: e.target.value})}>
                  <option value="Burger">Burger</option>
                  <option value="Momos">Momos</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Sides">Sides</option>
                </select>
              </div>
              <button className="btn btn-primary w-100 fw-bold">Add to Menu</button>
            </form>
          </div>
        </div>

        {/* Menu Table Section */}
        <div className="col-md-8">
          <div className="card p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3 text-success">Current Menu</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.length > 0 ? menuItems.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.name}</td>
                      <td><span className="badge bg-info text-dark">{item.category}</span></td>
                      <td>Rs. {item.price}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-center text-muted italic">No items added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;