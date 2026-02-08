import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import JsBarcode from 'jsbarcode';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [newArea, setNewArea] = useState({ area_name: '', fee: '' });
  const [searchTerm, setSearchTerm] = useState('');
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
    } else { navigate('/login'); }
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

  const handleUpdateTax = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}/tax`, { tax_rate: tempTaxRate });
      alert("Tax Rate Updated! ✅");
      fetchData();
    } catch (err) { alert("Failed"); }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.old || !passwords.new) return alert("Fill all fields");
    try {
      const res = await axios.put("https://smart-agency-api.vercel.app/api/auth/update-password", { userId: user.id, oldPassword: passwords.old, newPassword: passwords.new });
      alert(res.data.message);
      setPasswords({ old: '', new: '' });
    } catch (err) { alert("Error"); }
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, order.id.toString(), { format: "CODE128", width: 2, height: 40, displayValue: false });
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const receiptContent = `<html><body style="font-family:'Inter';width:280px;padding:10px;"><h2>MAHANUR MOMOS</h2><p>${branchInfo?.branch_name}</p><center><img src="${canvas.toDataURL()}" /><h4>ID: #${order.id}</h4></center><hr/><table style="width:100%">${items.map(it=>`<tr><td>${it.qty}x ${it.name}</td><td align="right">${it.price*it.qty}</td></tr>`).join('')}</table><hr/><b>TOTAL: Rs. ${order.total_amount}</b><script>window.onload=()=>{window.print();window.close();}</script></body></html>`;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const revenue = orders.filter(o => o.status === 'Accepted').reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <nav className="navbar navbar-expand-lg border-bottom bg-white px-lg-5 py-3 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold text-dark d-flex align-items-center"><div style={{ width: '35px', height: '35px', background: '#6f42c1', borderRadius: '8px', marginRight: '10px' }}></div>Smart POS <span className="text-muted fw-normal ms-2 fs-6">| Manager</span></span>
          <div className="d-flex align-items-center gap-3"><span className="badge bg-light text-primary border px-3 py-2 rounded-pill small">📍 {branchInfo?.location}</span><button onClick={() => {localStorage.clear(); navigate('/login');}} className="btn btn-link text-danger text-decoration-none fw-bold small">Logout</button></div>
        </div>
      </nav>
      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4 mb-4">
          {[ { label: 'Revenue', val: `Rs. ${revenue.toLocaleString()}`, color: '#4e73df', icon: '💰' }, { label: 'New Orders', val: orders.filter(o=>o.status==='Received').length, color: '#e74a3b', icon: '🛒' }, { label: 'Total Items', val: menuItems.length, color: '#f6c23e', icon: '🍔' }, { label: 'Status', val: branchInfo?.status?.toUpperCase(), color: '#1cc88a', icon: '📈' } ].map((s, i) => (
            <div className="col-md-3" key={i}><div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: s.color }}><div className="d-flex justify-content-between align-items-start"><div><p className="mb-1 opacity-75 small fw-bold text-uppercase">{s.label}</p><h3 className="fw-bold mb-0">{s.val}</h3></div><span className="fs-4">{s.icon}</span></div></div></div>
          ))}
        </div>
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white"><div className="d-flex gap-2 bg-light p-1 rounded-3">{['orders', 'menu', 'settings'].map(tab => (<button key={tab} className={`btn rounded-3 px-4 py-2 fw-bold text-capitalize ${activeTab === tab ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`} onClick={() => setActiveTab(tab)}>{tab}</button>))}</div></div>
        {activeTab === 'orders' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr className="text-muted small border-bottom"><th>ORDER ID</th><th>CUSTOMER</th><th>TOTAL</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{orders.filter(o=>o.id.toString().includes(searchTerm)).map(order => (<tr key={order.id}><td className="fw-bold text-primary">#{order.id}</td><td><div className="fw-bold">{order.customer_name}</div></td><td className="fw-bold text-dark">Rs. {order.total_amount}</td><td><span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: order.status === 'Accepted' ? '#d4edda' : '#fff3cd', color: order.status === 'Accepted' ? '#155724' : '#856404' }}>{order.status}</span></td><td><div className="d-flex gap-2">{order.status === 'Received' && (<button onClick={() => axios.put(`https://smart-agency-api.vercel.app/api/orders/${order.id}/status`, { status: 'Accepted' }).then(fetchOrders)} className="btn btn-sm btn-success rounded-3 px-3 border-0">Accept</button>)}<button onClick={() => printReceipt(order)} className="btn btn-sm btn-outline-dark rounded-3 px-3">Print</button></div></td></tr>))}</tbody></table></div>
          </div>
        )}
        {activeTab === 'menu' && (
          <div className="row g-4">
            <div className="col-md-4"><div className="card border-0 shadow-sm rounded-4 p-4 bg-white"><h6 className="fw-bold mb-4 text-dark">Add Menu Item</h6><form onSubmit={async (e) => { e.preventDefault(); await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id }); setFoodData({ name: '', price: '', category: 'Burger' }); fetchData(); alert("Added!"); }}><input className="form-control mb-3 rounded-3 bg-light border-0 py-2" placeholder="Item Name" value={foodData.name} onChange={e => setFoodData({...foodData, name: e.target.value})} required /><input className="form-control mb-3 rounded-3 bg-light border-0 py-2" type="number" placeholder="Price" value={foodData.price} onChange={e => setFoodData({...foodData, price: e.target.value})} required /><select className="form-select mb-4 rounded-3 bg-light border-0 py-2" value={foodData.category} onChange={e => setFoodData({...foodData, category: e.target.value})}><option value="Burger">Burger</option><option value="Deal">Deal</option><option value="Drinks">Drinks</option></select><button type="submit" className="btn btn-primary w-100 rounded-3 fw-bold py-2 shadow-sm border-0">Add Item</button></form></div></div>
            <div className="col-md-8"><div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100"><table className="table"><thead><tr><th>NAME</th><th>PRICE</th><th>ACTION</th></tr></thead><tbody>{menuItems.map(item => (<tr key={item.id}><td>{item.name}</td><td>Rs. {item.price}</td><td><button onClick={() => setEditingFood(item)} className="btn btn-sm btn-link">Edit</button></td></tr>))}</tbody></table></div></div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="row g-4">
             <div className="col-md-6"><div className="card border-0 shadow-sm rounded-4 p-4 bg-white"><h6 className="fw-bold mb-4">Security Center 🔒</h6><input type="password" placeholder="Old" className="form-control mb-2 rounded-3 bg-light border-0 py-2" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} /><input type="password" placeholder="New" className="form-control mb-4 rounded-3 bg-light border-0 py-2" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} /><button onClick={handlePasswordUpdate} className="btn btn-dark w-100 rounded-3 py-2 fw-bold">Update Password</button></div></div>
             <div className="col-md-6"><div className="card border-0 shadow-sm rounded-4 p-4 bg-white"><h6 className="fw-bold mb-4">Taxation</h6><div className="input-group mb-4"><input type="number" className="form-control rounded-start-3 bg-light border-0 py-2" value={tempTaxRate} onChange={e => setTempTaxRate(e.target.value)} /><button onClick={handleUpdateTax} className="btn btn-success px-4 rounded-end-3 border-0">Save</button></div></div></div>
          </div>
        )}
      </div>
      {editingFood && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)'}}><div className="modal-dialog modal-dialog-centered"><div className="modal-content border-0 rounded-4 p-4 shadow-lg"><h5>Edit Item</h5><input type="text" className="form-control mb-3" value={editingFood.name} onChange={e => setEditingFood({...editingFood, name: e.target.value})} /><input type="number" className="form-control mb-4" value={editingFood.price} onChange={e => setEditingFood({...editingFood, price: e.target.value})} /><div className="d-flex gap-2"><button className="btn btn-primary flex-grow-1" onClick={async () => { await axios.put(`https://smart-agency-api.vercel.app/api/menu/${editingFood.id}`, editingFood); setEditingFood(null); fetchData(); }}>Save</button><button className="btn btn-light border flex-grow-1" onClick={() => setEditingFood(null)}>Cancel</button></div></div></div></div>
      )}
    </div>
  );
};
export default ManagerDashboard;