import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import JsBarcode from 'jsbarcode';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Delivery States
  const [allKarachiAreas, setAllKarachiAreas] = useState([]);
  const [selectedAreasWithFees, setSelectedAreasWithFees] = useState({}); // { "Johar": 100, "DHA": 250 }
  
  // Inventory & Settings States
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger' });
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

      // Branch ke saved areas aur fees load karein (Agar JSON format mein save hain)
      if (bRes.data.delivery_areas_json) {
        setSelectedAreasWithFees(JSON.parse(bRes.data.delivery_areas_json));
      } else if (bRes.data.delivery_areas) {
         // Fallback for simple string delivery areas
         const areas = bRes.data.delivery_areas.split(', ');
         const initialFees = {};
         areas.forEach(a => initialFees[a] = 0);
         setSelectedAreasWithFees(initialFees);
      }
      
      const mRes = await axios.get(`https://smart-agency-api.vercel.app/api/menu/${user.branch_id}`);
      setMenuItems(mRes.data || []);

      // Karachi ke saare areas database se uthao
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

  const handleUpdateDeliveryAreas = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}/delivery-settings`, { 
        delivery_areas_json: JSON.stringify(selectedAreasWithFees),
        delivery_areas: Object.keys(selectedAreasWithFees).join(', ')
      });
      alert("Delivery Areas & Fees Updated! 📍");
      fetchData();
    } catch (err) { alert("Failed to update delivery settings."); }
  };

  const toggleArea = (areaName) => {
    const updated = { ...selectedAreasWithFees };
    if (updated[areaName] !== undefined) {
      delete updated[areaName];
    } else {
      updated[areaName] = 0; // Default fee Rs. 0
    }
    setSelectedAreasWithFees(updated);
  };

  const handleFeeChange = (areaName, fee) => {
    setSelectedAreasWithFees(prev => ({
      ...prev,
      [areaName]: Number(fee)
    }));
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!foodData.name || !foodData.price) return alert("Please fill all fields!");
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id });
      alert("Food Item Added Successfully! 🍔");
      setFoodData({ name: '', price: '', category: 'Burger' });
      fetchData();
    } catch (err) { alert("Error adding food item."); }
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm("Remove this item from menu?")) {
      try {
        await axios.delete(`https://smart-agency-api.vercel.app/api/menu/${id}`);
        fetchData();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleUpdateTax = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}/tax`, { tax_rate: tempTaxRate });
      alert("Tax Rate Updated! ✅");
      fetchData();
    } catch (err) { alert("Failed to update tax."); }
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const receiptContent = `<html><body style="font-family:sans-serif; width:280px; padding:10px;"><center><h2>${branchInfo?.branch_name || 'POS'}</h2><p>Order ID: #${order.id}</p></center><hr/><table style="width:100%">${items.map(it => `<tr><td>${it.qty}x ${it.name}</td><td align="right">Rs.${it.price * it.qty}</td></tr>`).join('')}</table><hr/><p><b>Total: Rs. ${order.total_amount}</b></p><center><p>Thank You!</p></center><script>window.onload=()=>{window.print();window.close();}</script></body></html>`;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const revenue = orders.filter(o => o.status === 'Accepted').reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <nav className="navbar border-bottom bg-white px-lg-5 py-3 shadow-sm sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold text-dark d-flex align-items-center">
            <div style={{ width: '35px', height: '35px', background: 'linear-gradient(45deg, #6f42c1, #4e73df)', borderRadius: '10px', marginRight: '10px' }}></div>
            POS MANAGER | <span className="text-muted fw-normal ms-2 fs-6">{branchInfo?.branch_name}</span>
          </span>
          <button onClick={() => {localStorage.clear(); navigate('/login');}} className="btn btn-danger btn-sm rounded-pill px-4 fw-bold shadow-sm">Logout 🚪</button>
        </div>
      </nav>

      <div className="container-fluid py-4 px-lg-5">
        <div className="row g-4 mb-4">
          <div className="col-md-3"><div className="card border-0 shadow-lg rounded-4 p-4 text-white" style={{ background: 'linear-gradient(45deg, #4e73df, #224abe)' }}><h6>Revenue</h6><h3 className="fw-bold">Rs. {revenue.toLocaleString()}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-lg rounded-4 p-4 text-white" style={{ background: 'linear-gradient(45deg, #e74a3b, #c0392b)' }}><h6>New Orders</h6><h3 className="fw-bold">{orders.filter(o => o.status === 'Received').length}</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-lg rounded-4 p-4 text-white" style={{ background: 'linear-gradient(45deg, #f6c23e, #f39c12)' }}><h6>Inventory</h6><h3 className="fw-bold">{menuItems.length} Items</h3></div></div>
          <div className="col-md-3"><div className="card border-0 shadow-lg rounded-4 p-4 text-white" style={{ background: 'linear-gradient(45deg, #1cc88a, #138d75)' }}><h6>Tax Rate</h6><h3 className="fw-bold">{tempTaxRate}%</h3></div></div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-2 mb-4 bg-white">
          <div className="d-flex gap-2">
            {['orders', 'menu', 'settings'].map(tab => (
              <button key={tab} className={`btn rounded-pill px-4 fw-bold text-capitalize transition-all ${activeTab === tab ? 'btn-primary shadow-sm' : 'btn-light text-muted border-0'}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h5 className="fw-bold mb-0">Live Transactions</h5>
               <input type="text" className="form-control w-25 rounded-pill bg-light border-0 px-3" placeholder="Search Order ID..." onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light"><tr className="small text-muted"><th>ID</th><th>CUSTOMER</th><th>TOTAL</th><th>STATUS</th><th>ACTION</th></tr></thead>
                <tbody>
                  {orders.filter(o => o.id.toString().includes(searchTerm)).map(order => (
                    <tr key={order.id}>
                      <td className="fw-bold">#{order.id}</td>
                      <td>{order.customer_name} <br/><small className="text-muted">{order.customer_phone}</small></td>
                      <td className="fw-bold">Rs. {order.total_amount}</td>
                      <td><span className={`badge rounded-pill px-3 py-2 ${order.status==='Received'?'bg-warning text-dark':'bg-success'}`}>{order.status}</span></td>
                      <td>
                        <div className="d-flex gap-2">
                          {order.status === 'Received' && <button onClick={() => axios.put(`https://smart-agency-api.vercel.app/api/orders/${order.id}/status`, {status:'Accepted'}).then(fetchOrders)} className="btn btn-sm btn-primary rounded-pill">Accept</button>}
                          <button onClick={() => printReceipt(order)} className="btn btn-sm btn-outline-dark rounded-pill">Print 🖨️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-top border-primary border-4">
                <h6 className="fw-bold mb-4">Add Menu Item</h6>
                <form onSubmit={handleAddFood}>
                  <div className="mb-3"><label className="small fw-bold text-muted mb-1">Food Name</label><input className="form-control rounded-3 bg-light border-0 py-2" placeholder="e.g. Special Zinger" value={foodData.name} onChange={e => setFoodData({...foodData, name: e.target.value})} required /></div>
                  <div className="mb-3"><label className="small fw-bold text-muted mb-1">Price (Rs.)</label><input className="form-control rounded-3 bg-light border-0 py-2" type="number" placeholder="500" value={foodData.price} onChange={e => setFoodData({...foodData, price: e.target.value})} required /></div>
                  <div className="mb-4"><label className="small fw-bold text-muted mb-1">Category</label>
                    <select className="form-select rounded-3 bg-light border-0 py-2" value={foodData.category} onChange={e => setFoodData({...foodData, category: e.target.value})}>
                      <option value="Burger">Burger 🍔</option><option value="Pizza">Pizza 🍕</option><option value="Drinks">Drinks 🥤</option><option value="Sides">Sides 🍟</option><option value="Deals">Deals 🎁</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm border-0">Add Food Item ✅</button>
                </form>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h6 className="fw-bold mb-3">Live Menu Inventory</h6>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light"><tr className="small text-muted"><th>ITEM NAME</th><th>CATEGORY</th><th>PRICE</th><th>ACTION</th></tr></thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.id}>
                          <td className="fw-bold">{item.name}</td>
                          <td><span className="badge bg-light text-primary border rounded-pill px-3">{item.category}</span></td>
                          <td>Rs. {item.price}</td>
                          <td><button onClick={()=>handleDeleteFood(item.id)} className="btn btn-sm text-danger fw-bold border-0">Remove ✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="row g-4">
            {/* EXISTING TAX CONFIG */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-top border-success border-4 h-100">
                <h6 className="fw-bold mb-3">Tax Configuration</h6>
                <label className="small fw-bold text-muted mb-1">Tax Rate (%)</label>
                <div className="input-group mb-3">
                  <input type="number" className="form-control bg-light border-0 py-2" value={tempTaxRate} onChange={e => setTempTaxRate(e.target.value)} />
                  <button onClick={handleUpdateTax} className="btn btn-success px-4 fw-bold shadow-sm">Update</button>
                </div>
              </div>
            </div>

            {/* NEW DELIVERY AREA SETTINGS */}
            <div className="col-md-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-top border-warning border-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold mb-0">📍 Karachi Delivery Areas & Fees</h6>
                  <button onClick={handleUpdateDeliveryAreas} className="btn btn-warning btn-sm rounded-pill px-4 fw-bold">Save All Settings 💾</button>
                </div>
                <div className="row g-3" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                  {allKarachiAreas.map(area => {
                    const isSelected = selectedAreasWithFees[area.area_name] !== undefined;
                    return (
                      <div key={area.id} className="col-md-6">
                        <div className={`p-3 rounded-4 border transition-all ${isSelected ? 'border-warning bg-light shadow-sm' : 'bg-white'}`}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" checked={isSelected} onChange={() => toggleArea(area.area_name)} id={`check-${area.id}`} />
                              <label className={`form-check-label small fw-bold ${isSelected ? 'text-dark' : 'text-muted'}`} htmlFor={`check-${area.id}`}>
                                {area.area_name}
                              </label>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-white border-0 small">Fee: Rs.</span>
                              <input 
                                type="number" 
                                className="form-control border-0 bg-white" 
                                placeholder="0"
                                value={selectedAreasWithFees[area.area_name]} 
                                onChange={(e) => handleFeeChange(area.area_name, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;