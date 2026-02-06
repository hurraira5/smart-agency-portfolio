import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Search state
  const [editingOrder, setEditingOrder] = useState(null);
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
    } catch (err) { console.error("Menu load error", err); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${user.branch_id}`);
      setOrders(oRes.data || []);
    } catch (err) { console.error("Orders load error", err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) { alert("Status update fail!"); }
  };

  // Search Logic
  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) || 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.customer_phone.includes(searchTerm)
  );

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
    <div className="container-fluid mt-4 pb-5 px-4">
      {/* Header Section */}
      <div className="card shadow-sm p-4 mb-4 border-0 bg-dark text-white rounded-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-0">Manager Control Center</h2>
            {branchInfo && <span className="small opacity-75">{branchInfo.branch_name} | {branchInfo.location}</span>}
          </div>
          <div className="btn-group shadow">
            <button className={`btn ${activeTab === 'orders' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('orders')}>Orders 📦</button>
            <button className={`btn ${activeTab === 'menu' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('menu')}>Menu 🍔</button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h5 className="fw-bold mb-0 text-primary">Live Orders Data Grid</h5>
            <div className="input-group" style={{maxWidth: '350px'}}>
              <span className="input-group-text bg-white border-end-0"><small>🔍</small></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Search by ID, Name or Phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr className="small text-uppercase fw-bold">
                  <th>ID</th>
                  <th>Customer Info</th>
                  <th>Order Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="fw-bold">#{order.id}</td>
                    <td>
                      <div className="small fw-bold">{order.customer_name}</div>
                      <div className="extra-small text-muted">{order.customer_phone}</div>
                      <div className="extra-small text-muted text-truncate" style={{maxWidth: '150px'}}>{order.customer_address}</div>
                    </td>
                    <td>
                      <div className="bg-light p-2 rounded-3" style={{fontSize: '0.75rem', minWidth: '150px'}}>
                        {Array.isArray(order.items) && order.items.map((it, i) => (
                          <div key={i} className="d-flex justify-content-between">
                            <span>{it.qty}x {it.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td><span className="fw-bold text-danger">Rs. {order.total_amount}</span></td>
                    <td>
                      <span className={`badge rounded-pill px-3 ${
                        order.status === 'Accepted' ? 'bg-success' : 
                        order.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {order.status === 'Received' && (
                          <>
                            <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-sm btn-success rounded-pill px-3">Accept</button>
                            <button onClick={() => handleStatusUpdate(order.id, 'Cancelled')} className="btn btn-sm btn-outline-danger rounded-pill px-3">Cancel</button>
                          </>
                        )}
                        <button onClick={() => setEditingOrder(order)} className="btn btn-sm btn-light border rounded-circle" title="Edit Customer">⚙️</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted italic">No orders found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Add Menu Item Form */}
          <div className="col-lg-4">
            <div className="card p-4 shadow-sm border-0 rounded-4 h-100">
              <h5 className="fw-bold mb-3 text-primary border-bottom pb-2">Add Menu Item</h5>
              <form onSubmit={handleAddFood}>
                <div className="mb-3">
                  <label className="small fw-bold mb-1">Item Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Zinger Burger" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="small fw-bold mb-1">Price (PKR)</label>
                  <input type="number" className="form-control" placeholder="0.00" value={foodData.price} onChange={(e) => setFoodData({...foodData, price: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="small fw-bold mb-1">Category</label>
                  <select className="form-select" value={foodData.category} onChange={(e) => setFoodData({...foodData, category: e.target.value})}>
                    <option value="Burger">Burger</option>
                    <option value="Deal">Deal 🔥</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Momos">Momos</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="small fw-bold mb-1">Description</label>
                  <textarea className="form-control" rows="2" placeholder="Item details..." value={foodData.description} onChange={(e) => setFoodData({...foodData, description: e.target.value})} />
                </div>
                <button className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm">Add to Menu</button>
              </form>
            </div>
          </div>

          {/* Menu Table */}
          <div className="col-lg-8">
            <div className="card p-4 shadow-sm border-0 rounded-4">
              <h5 className="fw-bold mb-3 text-success border-bottom pb-2">Menu Inventory</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle small">
                  <thead className="table-light text-uppercase">
                    <tr>
                      <th>Item Details</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id}>
                        <td className="fw-bold">{item.name}</td>
                        <td><span className="badge bg-light text-dark">{item.category}</span></td>
                        <td>Rs. {item.price}</td>
                        <td className="text-center">
                          <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-outline-danger border-0">🗑️ Delete</button>
                        </td>
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
        <div className="modal d-block shadow-lg" style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Edit Details: Order #{editingOrder.id}</h5>
                <button className="btn-close" onClick={() => setEditingOrder(null)}></button>
              </div>
              <div className="mb-3">
                <label className="small fw-bold">Customer Name</label>
                <input type="text" className="form-control" value={editingOrder.customer_name} onChange={(e) => setEditingOrder({...editingOrder, customer_name: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="small fw-bold">Mobile Number</label>
                <input type="text" className="form-control" value={editingOrder.customer_phone} onChange={(e) => setEditingOrder({...editingOrder, customer_phone: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="small fw-bold">Delivery Address</label>
                <textarea className="form-control" rows="3" value={editingOrder.customer_address} onChange={(e) => setEditingOrder({...editingOrder, customer_address: e.target.value})} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1 rounded-pill py-2" onClick={async () => {
                   try {
                     await axios.put(`https://smart-agency-api.vercel.app/api/orders/${editingOrder.id}`, editingOrder);
                     setEditingOrder(null);
                     fetchOrders();
                     alert("Order Updated! ✅");
                   } catch (err) { alert("Error updating order"); }
                }}>Save Changes</button>
                <button className="btn btn-light border flex-grow-1 rounded-pill" onClick={() => setEditingOrder(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;