import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // Tab switch system
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger', description: '' });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.branch_id) {
      fetchBranchData();
      fetchOrders();
    } else {
      navigate('/login'); // Agar user login nahi hai toh login par bheje
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchBranchData = async () => {
    try {
      const bRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}`);
      setBranchInfo(bRes.data);
      const mRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${user.branch_id}`);
      setMenuItems(mRes.data);
    } catch (err) { console.error("Menu load error", err); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${user.branch_id}`);
      setOrders(oRes.data || []); // Orders load karein
    } catch (err) { console.error("Orders load error", err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${id}/status`, { status });
      fetchOrders(); // Status update ke baad refresh
    } catch (err) { alert("Status update fail!"); }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id });
      setFoodData({ name: '', price: '', category: 'Burger', description: '' });
      fetchBranchData();
      alert("Item Added! 🚀");
    } catch (err) { alert("Error adding item"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await axios.delete(`https://smart-agency-api.vercel.app/api/menu/${id}`);
      fetchBranchData();
    }
  };

  return (
    <div className="container mt-4 pb-5">
      {/* Header Section */}
      <div className="card shadow-sm p-4 mb-4 border-0 bg-dark text-white rounded-4 shadow">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-0">Manager Panel</h2>
            {branchInfo && <span className="small opacity-75">{branchInfo.branch_name} | {branchInfo.location}</span>}
          </div>
          <div className="btn-group">
            <button className={`btn btn-sm ${activeTab === 'orders' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('orders')}>Orders 📦</button>
            <button className={`btn btn-sm ${activeTab === 'menu' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('menu')}>Menu 🍔</button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="row g-3">
          {orders.length > 0 ? orders.map(order => (
            <div key={order.id} className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-info h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 text-primary">Order #{order.id}</h6>
                    <span className={`badge ${order.status === 'Accepted' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.status}</span>
                  </div>
                  <div className="mb-2">
                    <div className="fw-bold small">{order.customer_name}</div>
                    <div className="text-muted small">{order.customer_phone}</div>
                    <div className="text-muted" style={{fontSize: '0.75rem'}}>{order.customer_address}</div>
                  </div>
                  <div className="bg-light p-2 rounded-3 mb-3">
                    {Array.isArray(order.items) && order.items.map((it, i) => (
                      <div key={i} className="d-flex justify-content-between small" style={{fontSize: '0.8rem'}}>
                        <span>{it.qty}x {it.name}</span>
                        <span>Rs. {it.price * it.qty}</span>
                      </div>
                    ))}
                    <hr className="my-1" />
                    <div className="text-end fw-bold text-danger">Total: Rs. {order.total_amount}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-sm btn-success flex-grow-1 rounded-pill">Accept</button>
                    <button onClick={() => handleStatusUpdate(order.id, 'Cancelled')} className="btn btn-sm btn-outline-danger flex-grow-1 rounded-pill">Cancel</button>
                    <button onClick={() => setEditingOrder(order)} className="btn btn-sm btn-light border rounded-circle">⚙️</button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12 text-center py-5">
              <h5 className="text-muted">No orders found for this branch.</h5>
            </div>
          )}
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card p-4 shadow-sm border-0 rounded-4">
              <h5 className="fw-bold mb-3">Add Menu Item</h5>
              <form onSubmit={handleAddFood}>
                <input type="text" className="form-control mb-2" placeholder="Item Name" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} required />
                <input type="number" className="form-control mb-2" placeholder="Price" value={foodData.price} onChange={(e) => setFoodData({...foodData, price: e.target.value})} required />
                <select className="form-select mb-2" value={foodData.category} onChange={(e) => setFoodData({...foodData, category: e.target.value})}>
                  <option value="Burger">Burger</option><option value="Deal">Deal</option><option value="Drinks">Drinks</option>
                </select>
                <textarea className="form-control mb-3" placeholder="Description" value={foodData.description} onChange={(e) => setFoodData({...foodData, description: e.target.value})} />
                <button className="btn btn-primary w-100 fw-bold">Add to Menu</button>
              </form>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-4 shadow-sm border-0 rounded-4">
              <h5 className="fw-bold mb-3 text-success">Current Menu Items</h5>
              <div className="table-responsive">
                <table className="table table-hover small">
                  <thead><tr><th>Name</th><th>Price</th><th>Action</th></tr></thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>Rs. {item.price}</td>
                        <td><button onClick={() => handleDelete(item.id)} className="btn btn-sm text-danger">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingOrder && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 shadow-lg">
              <h6 className="fw-bold mb-3 border-bottom pb-2">Edit Customer Details</h6>
              <div className="mb-2">
                <label className="extra-small text-muted">Customer Name</label>
                <input type="text" className="form-control form-control-sm" value={editingOrder.customer_name} onChange={(e) => setEditingOrder({...editingOrder, customer_name: e.target.value})} />
              </div>
              <div className="mb-2">
                <label className="extra-small text-muted">Phone Number</label>
                <input type="text" className="form-control form-control-sm" value={editingOrder.customer_phone} onChange={(e) => setEditingOrder({...editingOrder, customer_phone: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="extra-small text-muted">Delivery Address</label>
                <textarea className="form-control form-control-sm" value={editingOrder.customer_address} onChange={(e) => setEditingOrder({...editingOrder, customer_address: e.target.value})} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm flex-grow-1" onClick={async () => {
                   await axios.put(`https://smart-agency-api.vercel.app/api/orders/${editingOrder.id}`, editingOrder);
                   setEditingOrder(null);
                   fetchOrders();
                   alert("Order Details Updated! ✅");
                }}>Save</button>
                <button className="btn btn-light btn-sm border flex-grow-1" onClick={() => setEditingOrder(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;