import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [newArea, setNewArea] = useState({ area_name: '', fee: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // FIX: Added Missing States
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger' });
  const [editingFood, setEditingFood] = useState(null);
  const [tempTaxRate, setTempTaxRate] = useState(0);
  const [passwords, setPasswords] = useState({ old: '', new: '' });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.branch_id) {
      fetchData();
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    } else {
      navigate('/login');
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const bRes = await axios.get(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}`);
      setBranchInfo(bRes.data);
      setTempTaxRate(bRes.data.tax_rate);
      const mRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${user.branch_id}`);
      setMenuItems(mRes.data);
      const dRes = await axios.get(`https://smart-agency-api.vercel.app/api/delivery-fees/${user.branch_id}`);
      setDeliveryFees(dRes.data);
      fetchOrders();
    } catch (err) { console.error("Data error"); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${user.branch_id}`);
      setOrders(oRes.data || []);
    } catch (err) { console.error("Order error"); }
  };

  // FIX: Added handleUpdateTax Function
  const handleUpdateTax = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}/tax`, { tax_rate: tempTaxRate });
      alert("Tax Rate Updated Successfully! ✅");
      fetchData();
    } catch (err) { alert("Failed to update tax"); }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.old || !passwords.new) return alert("Fill all fields");
    try {
      const res = await axios.put("https://smart-agency-api.vercel.app/api/auth/update-password", {
        userId: user.id,
        oldPassword: passwords.old,
        newPassword: passwords.new
      });
      alert(res.data.message);
      setPasswords({ old: '', new: '' });
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, order.id.toString(), { format: "CODE128", width: 2, height: 40, displayValue: false });
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    
    const receiptContent = `
      <html>
        <body style="font-family: 'Inter', sans-serif; width: 280px; padding: 10px; color: #333;">
          <center><h2 style="margin-bottom:0; color:#6f42c1;">MAHANUR MOMOS</h2><p style="margin-top:5px;">${branchInfo?.branch_name}</p></center>
          <center><img src="${canvas.toDataURL()}" /><h4>ID: #${order.id}</h4></center>
          <div style="border-top: 1px dashed #ccc; margin: 10px 0;"></div>
          <p><b>Cust:</b> ${order.customer_name}<br/><b>Add:</b> ${order.customer_address}</p>
          <div style="border-top: 1px dashed #ccc; margin: 10px 0;"></div>
          <table style="width:100%; font-size: 14px;">
            ${items.map(it => `<tr><td>${it.qty}x ${it.name}</td><td align="right">Rs.${it.price * it.qty}</td></tr>`).join('')}
          </table>
          <div style="border-top: 1px solid #333; margin: 10px 0;"></div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:16px;"><span>TOTAL:</span><span>Rs. ${order.total_amount}</span></div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const revenue = orders.filter(o => o.status === 'Accepted').reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Professional Header */}
      <nav className="navbar navbar-expand-lg border-bottom bg-white px-lg-5 py-3 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold text-dark d-flex align-items-center">
            <div style={{ width: '35px', height: '35px', background: '#6f42c1', borderRadius: '8px', marginRight: '10px' }}></div>
            Smart POS <span className="text-muted fw-normal ms-2 fs-6">| Manager</span>
          </span>
          <div className="d-flex align-items-center gap-3">
             <span className="badge bg-light text-primary border px-3 py-2 rounded-pill small">📍 {branchInfo?.location}</span>
             <button onClick={() => {localStorage.clear(); navigate('/login');}} className="btn btn-link text-danger text-decoration-none fw-bold small">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4 px-lg-5">
        
        {/* indoli style Stats Row */}
        <div className="row g-4 mb-4">
          {[
            { label: 'Visits', val: '61.1K', color: '#4e73df', icon: '👤' },
            { label: 'Orders', val: orders.length, color: '#e74a3b', icon: '🛒' },
            { label: 'Sales', val: `Rs. ${revenue.toLocaleString()}`, color: '#f6c23e', icon: '💰' },
            { label: 'Conv. Rate', val: '88.49%', color: '#1cc88a', icon: '📈' }
          ].map((s, i) => (
            <div className="col-md-3" key={i}>
              <div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: s.color }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 opacity-75 small fw-bold text-uppercase">{s.label}</p>
                    <h3 className="fw-bold mb-0">{s.val}</h3>
                  </div>
                  <span className="fs-4">{s.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 bg-light p-1 rounded-3">
              {['orders', 'menu', 'settings'].map(tab => (
                <button key={tab} 
                  className={`btn rounded-3 px-4 py-2 fw-bold text-capitalize transition-all ${activeTab === tab ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`} 
                  onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={() => fetchData()} className="btn btn-primary rounded-3 px-4 fw-bold shadow-sm">Refresh 🔄</button>
          </div>
        </div>

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white fade-in">
            <div className="d-flex justify-content-between mb-4">
               <h5 className="fw-bold mb-0 text-dark">Recent Transactions</h5>
               <input type="text" className="form-control form-control-sm w-25 rounded-pill bg-light border-0 px-3" placeholder="Search ID..." onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr className="text-muted small border-bottom">
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>TOTAL AMOUNT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.id.toString().includes(searchTerm)).map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                      <td className="fw-bold text-primary">#{order.id}</td>
                      <td>
                        <div className="fw-bold">{order.customer_name}</div>
                        <div className="small text-muted">{order.customer_phone}</div>
                      </td>
                      <td className="fw-bold text-dark">Rs. {order.total_amount}</td>
                      <td>
                         <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: order.status === 'Accepted' ? '#d4edda' : '#fff3cd', color: order.status === 'Accepted' ? '#155724' : '#856404' }}>
                            {order.status}
                         </span>
                      </td>
                      <td>
                         <div className="d-flex gap-2">
                           {order.status === 'Received' && (
                             <button onClick={() => axios.put(`https://smart-agency-api.vercel.app/api/orders/${order.id}/status`, { status: 'Accepted' }).then(fetchOrders)} className="btn btn-sm btn-success rounded-3 px-3 shadow-sm border-0">Accept</button>
                           )}
                           <button onClick={() => printReceipt(order)} className="btn btn-sm btn-outline-dark rounded-3 px-3 shadow-sm">Print 🖨️</button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Menu */}
        {activeTab === 'menu' && (
          <div className="row g-4 fade-in">
            <div className="col-md-4">
               <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                 <h6 className="fw-bold mb-4 text-dark">Inventory Management</h6>
                 <form onSubmit={async (e) => {
                    e.preventDefault();
                    await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id });
                    setFoodData({ name: '', price: '', category: 'Burger' });
                    fetchData();
                    alert("Added Successfully!");
                 }}>
                    <label className="small fw-bold text-muted mb-1">Item Name</label>
                    <input className="form-control mb-3 rounded-3 bg-light border-0 py-2" value={foodData.name} onChange={e => setFoodData({...foodData, name: e.target.value})} required />
                    
                    <label className="small fw-bold text-muted mb-1">Price (Rs.)</label>
                    <input className="form-control mb-3 rounded-3 bg-light border-0 py-2" type="number" value={foodData.price} onChange={e => setFoodData({...foodData, price: e.target.value})} required />
                    
                    <label className="small fw-bold text-muted mb-1">Category</label>
                    <select className="form-select mb-4 rounded-3 bg-light border-0 py-2" value={foodData.category} onChange={e => setFoodData({...foodData, category: e.target.value})}>
                      <option value="Burger">Burger 🍔</option>
                      <option value="Deal">Deal 🎁</option>
                      <option value="Drinks">Drinks 🥤</option>
                    </select>
                    
                    <button type="submit" className="btn btn-primary w-100 rounded-3 fw-bold py-2 shadow-sm border-0">Add Item</button>
                 </form>
               </div>
            </div>
            <div className="col-md-8">
               <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h6 className="fw-bold mb-3">Live Menu List</h6>
                  <div className="table-responsive">
                     <table className="table table-hover">
                        <thead className="small text-muted"><tr><th>NAME</th><th>PRICE</th><th>CATEGORY</th><th>ACTION</th></tr></thead>
                        <tbody>
                          {menuItems.map(item => (
                            <tr key={item.id}>
                              <td className="fw-bold text-dark">{item.name}</td>
                              <td>Rs. {item.price}</td>
                              <td><span className="badge bg-light text-dark border px-3 rounded-pill small">{item.category}</span></td>
                              <td><button onClick={() => setEditingFood(item)} className="btn btn-sm btn-link text-primary text-decoration-none p-0 fw-bold">Edit</button></td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === 'settings' && (
          <div className="row g-4 fade-in">
             <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                   <h6 className="fw-bold mb-4">Security Center 🔒</h6>
                   <div className="mb-3">
                      <label className="small text-muted mb-1">Current Password</label>
                      <input type="password" name="old" className="form-control rounded-3 bg-light border-0 py-2" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} />
                   </div>
                   <div className="mb-4">
                      <label className="small text-muted mb-1">New Password</label>
                      <input type="password" name="new" className="form-control rounded-3 bg-light border-0 py-2" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                   </div>
                   <button onClick={handlePasswordUpdate} className="btn btn-dark w-100 rounded-3 py-2 fw-bold shadow-sm">Update Password</button>
                </div>
             </div>
             <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                   <h6 className="fw-bold mb-4">Configurations</h6>
                   <label className="small text-muted mb-1">Tax Rate (%)</label>
                   <div className="input-group mb-4">
                      <input type="number" name="tax" className="form-control rounded-start-3 bg-light border-0 py-2" value={tempTaxRate} onChange={e => setTempTaxRate(e.target.value)} />
                      <button onClick={handleUpdateTax} className="btn btn-success px-4 rounded-end-3 border-0 fw-bold">Save</button>
                   </div>
                   <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-outline-danger w-100 rounded-3 py-2 fw-bold">Logout 🚪</button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFood && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 p-4 shadow-lg">
              <h5 className="fw-bold mb-4 text-primary">Edit Item Details</h5>
              <div className="mb-3">
                <label className="small fw-bold text-muted mb-1">Item Name</label>
                <input type="text" className="form-control rounded-3 py-2 bg-light border-0" value={editingFood.name} onChange={e => setEditingFood({...editingFood, name: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="small fw-bold text-muted mb-1">Price (Rs.)</label>
                <input type="number" className="form-control rounded-3 py-2 bg-light border-0" value={editingFood.price} onChange={e => setEditingFood({...editingFood, price: e.target.value})} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1 rounded-3 py-2 fw-bold shadow-sm border-0" onClick={async () => {
                  await axios.put(`https://smart-agency-api.vercel.app/api/menu/${editingFood.id}`, editingFood);
                  setEditingFood(null); fetchData(); alert("Updated!");
                }}>Save Changes</button>
                <button className="btn btn-light border flex-grow-1 rounded-3 py-2 fw-bold" onClick={() => setEditingFood(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;