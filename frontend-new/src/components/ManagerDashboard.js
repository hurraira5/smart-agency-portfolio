import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingFood, setEditingFood] = useState(null); // Menu item edit state
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
    } catch (err) { console.error("Menu error", err); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${user.branch_id}`);
      setOrders(oRes.data || []);
    } catch (err) { console.error("Orders error", err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) { alert("Fail!"); }
  };

  const handleUpdateFood = async () => {
    try {
      // Backend route /api/menu/:id ko call karega
      await axios.put(`https://smart-agency-api.vercel.app/api/menu/${editingFood.id}`, editingFood);
      setEditingFood(null);
      fetchBranchData();
      alert("Food Item Updated! ✅");
    } catch (err) { alert("Update failed"); }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) || 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4 pb-5 px-4">
      <div className="card shadow-sm p-4 mb-4 border-0 bg-dark text-white rounded-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="fw-bold mb-0">Manager Panel</h2>
          <div className="btn-group">
            <button className={`btn ${activeTab === 'orders' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('orders')}>Orders 📦</button>
            <button className={`btn ${activeTab === 'menu' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('menu')}>Menu 🍔</button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <input type="text" className="form-control mb-4" placeholder="Search orders..." onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>ID</th><th>Customer</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td><span className={`badge ${order.status === 'Accepted' ? 'bg-success' : order.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'}`}>{order.status}</span></td>
                    <td>
                      {/* FIX: Buttons tabhi dikhen jab status sirf 'Received' ho */}
                      {order.status === 'Received' ? (
                        <div className="d-flex gap-2">
                          <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-sm btn-success">Accept</button>
                          <button onClick={() => handleStatusUpdate(order.id, 'Cancelled')} className="btn btn-sm btn-outline-danger">Cancel</button>
                        </div>
                      ) : (
                        <span className="text-muted small italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Menu Tab */
        <div className="row g-4">
          <div className="col-12">
            <div className="card p-4 shadow-sm border-0 rounded-4">
              <h5 className="fw-bold mb-3">Menu Inventory</h5>
              <table className="table align-middle">
                <thead><tr><th>Name</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>Rs. {item.price}</td>
                      <td>
                        <button onClick={() => setEditingFood(item)} className="btn btn-sm btn-outline-primary me-2">Edit</button>
                        <button onClick={() => axios.delete(`https://smart-agency-api.vercel.app/api/menu/${item.id}`).then(fetchBranchData)} className="btn btn-sm text-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MENU EDIT MODAL */}
      {editingFood && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 rounded-4 shadow-lg border-0">
              <h5 className="fw-bold mb-3">Edit Food Item</h5>
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