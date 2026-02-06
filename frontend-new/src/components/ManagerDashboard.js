import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // Naya tab system
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger', description: '' });
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.branch_id) {
      fetchBranchData();
      fetchOrders();
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
      setOrders(oRes.data);
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) { alert("Fail to update status"); }
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${editingOrder.id}`, editingOrder);
      setEditingOrder(null);
      fetchOrders();
      alert("Order Updated!");
    } catch (err) { alert("Update failed"); }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id });
      setFoodData({ name: '', price: '', category: 'Burger', description: '' });
      fetchBranchData();
      alert("Item Added!");
    } catch (err) { alert("Error adding item"); }
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="card shadow-sm p-4 mb-4 border-0 bg-dark text-white rounded-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-0">Manager Panel</h2>
            {branchInfo && <span className="small opacity-75">{branchInfo.branch_name} | {branchInfo.location}</span>}
          </div>
          <div className="btn-group shadow-sm">
            <button className={`btn btn-sm ${activeTab === 'orders' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('orders')}>Orders 📦</button>
            <button className={`btn btn-sm ${activeTab === 'menu' ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setActiveTab('menu')}>Menu 🍔</button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="row g-3">
          {orders.map(order => (
            <div key={order.id} className="col-12 col-lg-6">
              <div className={`card border-0 shadow-sm rounded-4 border-start border-4 ${order.status === 'Received' ? 'border-info' : 'border-success'}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h6 className="fw-bold">Order #{order.id}</h6>
                    <span className="badge bg-light text-dark">{order.status}</span>
                  </div>
                  <p className="small mb-1"><strong>{order.customer_name}</strong> ({order.customer_phone})</p>
                  <p className="small text-muted mb-2">{order.customer_address}</p>
                  
                  <div className="bg-light p-2 rounded-3 mb-3">
                    {order.items.map((it, i) => <div key={i} className="small">{it.qty} x {it.name}</div>)}
                    <div className="text-end fw-bold text-danger mt-1">Rs. {order.total_amount}</div>
                  </div>

                  <div className="d-flex gap-2">
                    <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-sm btn-success flex-grow-1">Accept</button>
                    <button onClick={() => handleStatusUpdate(order.id, 'Cancelled')} className="btn btn-sm btn-outline-danger flex-grow-1">Cancel</button>
                    <button onClick={() => setEditingOrder(order)} className="btn btn-sm btn-light border">Edit Details</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-4">
            <div className="col-md-4">
               {/* Aapka Existing Add Item Form Yahan Hai */}
               <div className="card p-4 shadow-sm border-0 rounded-4">
                  <h5 className="fw-bold mb-3">Add Item</h5>
                  <form onSubmit={handleAddFood}>
                     <input type="text" className="form-control mb-2" placeholder="Item Name" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} required />
                     <input type="number" className="form-control mb-2" placeholder="Price" value={foodData.price} onChange={(e) => setFoodData({...foodData, price: e.target.value})} required />
                     <select className="form-select mb-2" value={foodData.category} onChange={(e) => setFoodData({...foodData, category: e.target.value})}>
                        <option value="Burger">Burger</option><option value="Deal">Deal</option><option value="Drinks">Drinks</option>
                     </select>
                     <textarea className="form-control mb-3" placeholder="Description" value={foodData.description} onChange={(e) => setFoodData({...foodData, description: e.target.value})} />
                     <button className="btn btn-primary w-100">Add Item</button>
                  </form>
               </div>
            </div>
            <div className="col-md-8">
               {/* Aapki Existing Menu Table Yahan Hai */}
               <div className="card p-4 shadow-sm border-0 rounded-4">
                  <h5 className="fw-bold mb-3">Current Menu</h5>
                  <table className="table small">
                     <thead><tr><th>Name</th><th>Price</th><th>Action</th></tr></thead>
                     <tbody>{menuItems.map(item => (
                        <tr key={item.id}><td>{item.name}</td><td>Rs. {item.price}</td><td><button onClick={() => axios.delete(`https://smart-agency-api.vercel.app/api/menu/${item.id}`).then(fetchBranchData)} className="btn btn-sm text-danger">Delete</button></td></tr>
                     ))}</tbody>
                  </table>
               </div>
            </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingOrder && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <h6 className="fw-bold mb-3">Edit Customer Details</h6>
              <input type="text" className="form-control mb-2" value={editingOrder.customer_name} onChange={(e) => setEditingOrder({...editingOrder, customer_name: e.target.value})} />
              <input type="text" className="form-control mb-2" value={editingOrder.customer_phone} onChange={(e) => setEditingOrder({...editingOrder, customer_phone: e.target.value})} />
              <textarea className="form-control mb-3" value={editingOrder.customer_address} onChange={(e) => setEditingOrder({...editingOrder, customer_address: e.target.value})} />
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" onClick={handleEditSave}>Save</button>
                <button className="btn btn-light border flex-grow-1" onClick={() => setEditingOrder(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;