import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allKarachiAreas, setAllKarachiAreas] = useState([]);
  const [selectedAreasWithFees, setSelectedAreasWithFees] = useState({});
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger', description: '', image_url: '' });
  const [tempTaxRate, setTempTaxRate] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
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
      setTempTaxRate(bRes.data.tax_rate || 0);
      if (bRes.data.delivery_areas_json) { setSelectedAreasWithFees(JSON.parse(bRes.data.delivery_areas_json)); }
      const mRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${user.branch_id}`);
      setMenuItems(mRes.data || []);
      const areaRes = await axios.get('https://smart-agency-api.vercel.app/api/karachi-areas');
      setAllKarachiAreas(areaRes.data || []);
      fetchOrders();
    } catch (err) { console.error("Data fetch error"); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await axios.get(`https://smart-agency-api.vercel.app/api/orders/${user.branch_id}`);
      setOrders(oRes.data || []);
    } catch (err) { console.error("Order fetch error"); }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id });
      alert("Food Item Added Successfully! 🍔");
      setFoodData({ name: '', price: '', category: 'Burger', description: '', image_url: '' });
      fetchData();
    } catch (err) { alert("Error adding food item."); }
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm("Remove this item?")) {
      await axios.delete(`https://smart-agency-api.vercel.app/api/menu/${id}`);
      fetchData();
    }
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const receiptContent = `<html><body style="font-family:sans-serif; width:280px; padding:10px;"><center><h2>${branchInfo?.branch_name}</h2><p>Order ID: #${order.id}</p></center><hr/>${items.map(it => `<p>${it.qty}x ${it.name} - Rs.${it.price * it.qty}</p>`).join('')}<hr/><p><b>Total: Rs. ${order.total_amount}</b></p><script>window.onload=()=>{window.print();window.close();}</script></body></html>`;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const revenue = orders.filter(o => o.status === 'Accepted').reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <nav className="navbar border-bottom bg-white px-lg-5 py-3 shadow-sm sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold text-dark">POS MANAGER | {branchInfo?.branch_name}</span>
          <button onClick={() => {localStorage.clear(); navigate('/login');}} className="btn btn-danger btn-sm rounded-pill px-4">Logout</button>
        </div>
      </nav>

      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4 mb-4">
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: '#4e73df' }}><h6>Revenue</h6><h3>Rs. {revenue}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: '#e74a3b' }}><h6>New Orders</h6><h3>{orders.filter(o => o.status === 'Received').length}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: '#f6c23e' }}><h6>Inventory</h6><h3>{menuItems.length}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: '#1cc88a' }}><h6>Tax Rate</h6><h3>{tempTaxRate}%</h3></div></div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-2 mb-4 bg-white d-flex flex-row gap-2">
            {['orders', 'menu', 'settings'].map(tab => (
              <button key={tab} className={`btn rounded-pill px-4 fw-bold ${activeTab === tab ? 'btn-primary' : 'btn-light'}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
        </div>

        {activeTab === 'orders' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-4">Live Transactions</h5>
            <table className="table align-middle">
              <thead><tr className="small text-muted"><th>ID</th><th>CUSTOMER</th><th>TOTAL</th><th>STATUS</th><th>ACTION</th></tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>Rs. {order.total_amount}</td>
                    <td><span className="badge bg-warning text-dark">{order.status}</span></td>
                    <td><button onClick={() => printReceipt(order)} className="btn btn-sm btn-outline-dark rounded-pill">Print</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-top border-primary border-4">
                <h6 className="fw-bold mb-4">Add Menu Item</h6>
                <form onSubmit={handleAddFood}>
                  <input className="form-control mb-3" placeholder="Food Name" value={foodData.name} onChange={e => setFoodData({...foodData, name: e.target.value})} required />
                  <input className="form-control mb-3" type="number" placeholder="Price" value={foodData.price} onChange={e => setFoodData({...foodData, price: e.target.value})} required />
                  <textarea className="form-control mb-3" placeholder="Description" value={foodData.description} onChange={e => setFoodData({...foodData, description: e.target.value})} />
                  <input className="form-control mb-3" placeholder="Image URL" value={foodData.image_url} onChange={e => setFoodData({...foodData, image_url: e.target.value})} />
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold">Add Item</button>
                </form>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <table className="table">
                  <thead><tr><th>ITEM NAME</th><th>PRICE</th><th>ACTION</th></tr></thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id}><td>{item.name}</td><td>Rs. {item.price}</td><td><button onClick={()=>handleDeleteFood(item.id)} className="btn text-danger">Remove</button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ManagerDashboard;