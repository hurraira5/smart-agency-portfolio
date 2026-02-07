import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode'; // Isay install kar lena: npm install jsbarcode

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [branchInfo, setBranchInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [newArea, setNewArea] = useState({ area_name: '', fee: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFood, setEditingFood] = useState(null);
  const [foodData, setFoodData] = useState({ name: '', price: '', category: 'Burger', description: '' });
  
  const [tempTaxRate, setTempTaxRate] = useState(0);
  
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
    } catch (err) { alert("Action Failed"); }
  };

  const handleUpdateTax = async () => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}/tax`, { tax_rate: tempTaxRate });
      alert("Tax Rate Updated!");
      fetchData();
    } catch (err) { alert("Update Failed"); }
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    // Barcode Generate karne ke liye canvas ka jugad
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, order.id.toString(), {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: false
    });
    const barcodeImg = canvas.toDataURL("image/png");

    const taxAmt = (Number(order.subtotal || 0) * (branchInfo?.tax_rate || 0)) / 100;
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    const receiptContent = `
      <html>
        <head>
          <title>Receipt #${order.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; width: 280px; padding: 10px; font-size: 13px; color: #000; }
            .text-center { text-align: center; }
            .hr { border-bottom: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .barcode-container { margin: 10px 0; text-align: center; }
            .order-label { font-size: 18px; margin: 5px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h2 style="margin:0;">MAHANUR MOMOS</h2>
            <p style="margin:2px;">${branchInfo?.branch_name}</p>
            <p style="font-size:10px;">${new Date(order.created_at).toLocaleString()}</p>
          </div>

          <div class="barcode-container">
            <img src="${barcodeImg}" />
            <div class="order-label">#${order.id}</div>
          </div>

          <div class="hr"></div>
          <p><span class="bold">Customer:</span> ${order.customer_name}</p>
          <p><span class="bold">Phone:</span> ${order.customer_phone}</p>
          <p><span class="bold">Address:</span> ${order.customer_address}</p>
          <p><span class="bold">Payment:</span> Cash on Delivery</p>
          
          <div class="hr"></div>
          <table style="width: 100%;">
            ${items.map(it => `
              <tr>
                <td>${it.qty}x ${it.name}</td>
                <td style="text-align:right;">${it.price * it.qty}</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="hr"></div>
          <div class="flex"><span>Subtotal:</span><span>Rs. ${order.subtotal || 0}</span></div>
          <div class="flex"><span>Tax (${branchInfo?.tax_rate}%):</span><span>Rs. ${taxAmt.toFixed(2)}</span></div>
          <div class="flex"><span>Delivery Fee:</span><span>Rs. ${order.delivery_fee || 0}</span></div>
          <div class="flex bold" style="font-size:16px; margin-top:5px;">
            <span>TOTAL:</span><span>Rs. ${order.total_amount}</span>
          </div>
          
          <div class="hr"></div>
          <p class="text-center" style="margin-top:10px;">*** Thank you! ***</p>
          <p class="text-center" style="font-size:9px;">Order ID: ${order.id}</p>

          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const totalRevenue = orders.filter(o => o.status === 'Accepted').reduce((acc, curr) => acc + Number(curr.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'Received').length;

  return (
    <div className="container-fluid mt-4 pb-5 px-lg-5">
      {/* Upper Stats - Thora aur pyara kiya */}
      <div className="row g-3 mb-4 text-center">
        <div className="col-md-4">
          <div className="card bg-dark text-white p-3 rounded-4 border-0 shadow">
            <small className="opacity-75">Today's Revenue</small>
            <h3 className="fw-bold mb-0 text-warning">Rs. {totalRevenue}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white p-3 rounded-4 border-0 shadow">
            <small className="opacity-75">New Orders</small>
            <h3 className="fw-bold mb-0">{pendingOrders}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-white p-3 rounded-4 border-0 shadow-sm">
            <small className="text-muted">Branch Status</small>
            <h3 className={`fw-bold mb-0 ${branchInfo?.status === 'active' ? 'text-success' : 'text-danger'}`}>
              {branchInfo?.status?.toUpperCase()}
            </h3>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-0">Manager Command Center</h5>
            <span className="badge bg-light text-dark border">{branchInfo?.location}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={() => fetchData()} className="btn btn-light btn-sm rounded-pill border shadow-sm">Refresh 🔄</button>
            <button onClick={downloadPDF} className="btn btn-outline-dark btn-sm rounded-pill px-3 shadow-sm">Sales Report 📄</button>
            <div className="nav nav-pills bg-light p-1 rounded-pill shadow-inner">
              <button className={`nav-link rounded-pill ${activeTab === 'orders' ? 'active bg-danger' : 'text-dark'}`} onClick={() => setActiveTab('orders')}>Orders</button>
              <button className={`nav-link rounded-pill ${activeTab === 'menu' ? 'active bg-danger' : 'text-dark'}`} onClick={() => setActiveTab('menu')}>Menu</button>
              <button className={`nav-link rounded-pill ${activeTab === 'settings' ? 'active bg-danger' : 'text-dark'}`} onClick={() => setActiveTab('settings')}>Settings ⚙️</button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white fade-in">
          <div className="d-flex justify-content-between mb-3 align-items-center">
            <h6 className="fw-bold text-danger mb-0">Live Orders Streaming</h6>
            <input type="text" className="form-control form-control-sm w-25 rounded-pill border-danger" placeholder="Search Order ID..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light text-muted small">
                <tr><th>ID</th><th>Customer Details</th><th>Location</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.filter(o => o.id.toString().includes(searchTerm)).map(order => (
                  <tr key={order.id}>
                    <td className="fw-bold">#{order.id}</td>
                    <td>
                        <div className="fw-bold">{order.customer_name}</div>
                        <small className="text-muted">{order.customer_phone}</small>
                    </td>
                    <td className="small">{order.customer_address}</td>
                    <td className="text-danger fw-bold">Rs. {order.total_amount}</td>
                    <td>
                        <span className={`badge rounded-pill ${order.status === 'Accepted' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {order.status}
                        </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {order.status === 'Received' && (
                          <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-sm btn-success rounded-pill px-3 shadow-sm">Accept</button>
                        )}
                        <button onClick={() => printReceipt(order)} className="btn btn-sm btn-dark rounded-pill px-3 shadow-sm">Print 🖨️</button>
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
        <div className="row g-4 fade-in">
          <div className="col-md-4">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-light">
              <h6 className="fw-bold mb-3">Add to Menu</h6>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id });
                setFoodData({ name: '', price: '', category: 'Burger', description: '' });
                fetchData();
              }}>
                <div className="mb-2"><input type="text" className="form-control border-0 shadow-sm" placeholder="Item Name" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} required /></div>
                <div className="mb-2"><input type="number" className="form-control border-0 shadow-sm" placeholder="Price (Rs.)" value={foodData.price} onChange={(e) => setFoodData({...foodData, price: e.target.value})} required /></div>
                <select className="form-select border-0 shadow-sm mb-3" value={foodData.category} onChange={(e) => setFoodData({...foodData, category: e.target.value})}>
                  <option value="Burger">Burger</option><option value="Deal">Deal</option><option value="Drinks">Drinks</option>
                </select>
                <button className="btn btn-danger w-100 rounded-pill fw-bold shadow">Add Item</button>
              </form>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
              <h6 className="fw-bold mb-3">Menu Inventory</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                    <thead className="text-muted small"><tr><th>Name</th><th>Price</th><th>Category</th><th>Action</th></tr></thead>
                    <tbody>
                    {menuItems.map(item => (
                        <tr key={item.id}>
                        <td className="fw-bold">{item.name}</td>
                        <td>Rs. {item.price}</td>
                        <td><span className="badge bg-light text-dark">{item.category}</span></td>
                        <td><button onClick={() => setEditingFood(item)} className="btn btn-sm btn-outline-primary rounded-pill px-3 border-0">Edit</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings section remains similar but cleaner UI */}
      {activeTab === 'settings' && (
        <div className="row g-4 fade-in">
          <div className="col-md-4">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
              <h6 className="fw-bold mb-3">GST / Tax Management</h6>
              <div className="input-group mb-3 border rounded-pill overflow-hidden shadow-sm">
                <input type="number" className="form-control border-0 px-3" value={tempTaxRate} onChange={(e) => setTempTaxRate(e.target.value)} />
                <span className="input-group-text border-0 bg-light fw-bold">%</span>
              </div>
              <button onClick={handleUpdateTax} className="btn btn-success w-100 rounded-pill shadow-sm fw-bold">Update Tax</button>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-4 border-0 shadow-sm rounded-4 bg-white">
              <h6 className="fw-bold mb-3">Delivery Zones & Charges</h6>
              <div className="row g-2 mb-3">
                <div className="col-md-5"><input type="text" className="form-control rounded-pill" placeholder="Area Name" value={newArea.area_name} onChange={(e) => setNewArea({...newArea, area_name: e.target.value})} /></div>
                <div className="col-md-4"><input type="number" className="form-control rounded-pill" placeholder="Fee Rs." value={newArea.fee} onChange={(e) => setNewArea({...newArea, fee: e.target.value})} /></div>
                <div className="col-md-3"><button onClick={handleSaveDeliveryFee} className="btn btn-danger w-100 rounded-pill">Add Zone</button></div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                    <thead className="small"><tr><th>Area</th><th>Fee</th><th>Action</th></tr></thead>
                    <tbody>
                    {deliveryFees.map(f => (
                        <tr key={f.id}>
                        <td>{f.area_name}</td>
                        <td className="fw-bold">Rs. {f.fee}</td>
                        <td><button onClick={async () => {
                            await axios.delete(`https://smart-agency-api.vercel.app/api/delivery-fees/${f.id}`);
                            fetchData();
                        }} className="btn btn-sm text-danger"><i className="bi bi-trash"></i> Delete</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal stays same logic but clean styling */}
      {editingFood && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 rounded-4 shadow-lg border-0">
              <h5 className="fw-bold mb-3">Update Menu Item</h5>
              <label className="small text-muted mb-1">Item Name</label>
              <input type="text" className="form-control mb-2 rounded-3" value={editingFood.name} onChange={(e) => setEditingFood({...editingFood, name: e.target.value})} />
              <label className="small text-muted mb-1">Price (Rs.)</label>
              <input type="number" className="form-control mb-3 rounded-3" value={editingFood.price} onChange={(e) => setEditingFood({...editingFood, price: e.target.value})} />
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1 rounded-pill shadow" onClick={async () => {
                  await axios.put(`https://smart-agency-api.vercel.app/api/menu/${editingFood.id}`, editingFood);
                  setEditingFood(null); fetchData();
                }}>Save Changes</button>
                <button className="btn btn-light border flex-grow-1 rounded-pill" onClick={() => setEditingFood(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;