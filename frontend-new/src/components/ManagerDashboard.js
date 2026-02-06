import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingFood, setEditingFood] = useState(null); // Food Edit State
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger', description: '' });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.branch_id) {
      fetchBranchData();
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [activeTab]);

  const fetchBranchData = async () => {
    try {
      const bRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}`);
      setBranchInfo(bRes.data);
      const mRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${user.branch_id}`);
      setMenuItems(mRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${user.branch_id}`);
      setOrders(oRes.data || []);
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) { alert("Status Update Failed"); }
  };

  const handleUpdateFood = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/menu/${editingFood.id}`, editingFood);
      setEditingFood(null);
      fetchBranchData();
      alert("Food Updated! ✅");
    } catch (err) { alert("Edit Failed"); }
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="card shadow-sm p-4 mb-4 border-0 bg-dark text-white rounded-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="fw-bold mb-0">Manager Panel</h2>
          <div className="btn-group">
            <button className={`btn btn-sm ${activeTab === 'orders' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('orders')}>Orders 📦</button>
            <button className={`btn btn-sm ${activeTab === 'menu' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('menu')}>Menu 🍔</button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="row g-3">
          {orders.map(order => (
            <div key={order.id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-3">
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold">Order #{order.id}</h6>
                  <span className={`badge ${order.status === 'Cancelled' ? 'bg-danger' : 'bg-success'}`}>{order.status}</span>
                </div>
                
                {/* BUTTONS LOGIC: Sirf tab dikhao jab status NOT 'Accepted' aur NOT 'Cancelled' ho */}
                {(order.status !== 'Accepted' && order.status !== 'Cancelled') ? (
                  <div className="d-flex gap-2 mt-3">
                    <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-success flex-grow-1">Accept</button>
                    <button onClick={() => handleStatusUpdate(order.id, 'Cancelled')} className="btn btn-danger flex-grow-1">Cancel</button>
                  </div>
                ) : (
                  <div className="mt-3 py-2 text-center bg-light rounded-pill small text-muted">
                    Order has been {order.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <h5 className="fw-bold mb-3">Menu Inventory</h5>
              <table className="table align-middle">
                <thead><tr><th>Item Name</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>Rs. {item.price}</td>
                      <td>
                        <button onClick={() => setEditingFood(item)} className="btn btn-sm btn-outline-primary me-2">Edit Food</button>
                        <button onClick={() => axios.delete(`https://smart-agency-api.vercel.app/api/menu/${item.id}`).then(fetchBranchData)} className="btn btn-sm btn-link text-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOOD EDIT MODAL */}
      {editingFood && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 rounded-4 border-0">
              <h5 className="fw-bold">Edit Food Item</h5>
              <input type="text" className="form-control mb-2" value={editingFood.name} onChange={(e)=>setEditingFood({...editingFood, name: e.target.value})} />
              <input type="number" className="form-control mb-3" value={editingFood.price} onChange={(e)=>setEditingFood({...editingFood, price: e.target.value})} />
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" onClick={handleUpdateFood}>Save</button>
                <button className="btn btn-light border flex-grow-1" onClick={() => setEditingFood(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;