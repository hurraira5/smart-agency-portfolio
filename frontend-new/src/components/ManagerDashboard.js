import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const handleSaveDeliveryFee = async () => {
    await axios.post("https://smart-agency-api.vercel.app/api/delivery-fees", { ...newArea, branch_id: user.branch_id });
    setNewArea({ area_name: '', fee: '' });
    fetchData();
  };

  const handleUpdateTax = async (val) => {
    await axios.put(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}/tax`, { tax_rate: val });
    fetchData();
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    const taxAmt = (Number(order.subtotal || 0) * (branchInfo?.tax_rate || 0)) / 100;
    
    const receiptContent = `
      <html>
        <head>
          <title>Receipt #${order.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; width: 280px; padding: 5px; font-size: 13px; }
            .text-center { text-align: center; }
            .hr { border-bottom: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h3 style="margin:0;">BURGER O'CLOCK</h3>
            <p style="margin:2px;">${branchInfo?.branch_name}</p>
            <p style="font-size:10px;">${new Date().toLocaleString()}</p>
          </div>
          <div class="hr"></div>
          <p class="bold">Order ID: #${order.id}</p>
          <p>Payment: Cash on Delivery</p>
          <p>Cust: ${order.customer_name}</p>
          <p>Add: ${order.customer_address}</p>
          <div class="hr"></div>
          ${order.items.map(it => `<div class="flex"><span>${it.qty}x ${it.name}</span><span>${it.price * it.qty}</span></div>`).join('')}
          <div class="hr"></div>
          <div class="flex"><span>Tax (${branchInfo?.tax_rate}%):</span><span>${taxAmt.toFixed(2)}</span></div>
          <div class="flex"><span>Delivery:</span><span>${order.delivery_fee || 0}</span></div>
          <div class="flex bold" style="font-size:16px;"><span>TOTAL:</span><span>Rs. ${order.total_amount}</span></div>
          <div class="hr"></div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
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
      {/* Stats Bar */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-4"><div className="card bg-primary text-white p-3 rounded-4 border-0 shadow-sm">Revenue: Rs. {totalRevenue}</div></div>
        <div className="col-md-6 col-lg-4"><div className="card bg-warning text-dark p-3 rounded-4 border-0 shadow-sm">Pending: {pendingOrders}</div></div>
      </div>

      {/* Nav */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Manager Control</h5>
          <div className="nav nav-pills bg-light p-1 rounded-pill">
            <button className={`nav-link rounded-pill ${activeTab === 'orders' ? 'active bg-danger' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
            <button className={`nav-link rounded-pill ${activeTab === 'menu' ? 'active bg-danger' : ''}`} onClick={() => setActiveTab('menu')}>Menu</button>
            <button className={`nav-link rounded-pill ${activeTab === 'settings' ? 'active bg-danger' : ''}`} onClick={() => setActiveTab('settings')}>Settings ⚙️</button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <table className="table align-middle">
            <thead><tr className="small text-muted"><th>ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.filter(o => o.id.toString().includes(searchTerm)).map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name} <br/><small className="text-muted">{order.customer_phone}</small></td>
                  <td className="text-danger fw-bold">Rs. {order.total_amount}</td>
                  <td><span className={`badge rounded-pill ${order.status === 'Accepted' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.status}</span></td>
                  <td>
                    <div className="d-flex gap-2">
                      {order.status === 'Received' && <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-sm btn-success">Accept</button>}
                      <button onClick={() => printReceipt(order)} className="btn btn-sm btn-dark">Print 🖨️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <h6 className="fw-bold">Tax Percentage (%)</h6>
              <input type="number" className="form-control mb-2" value={branchInfo?.tax_rate || 0} onChange={(e) => handleUpdateTax(e.target.value)} />
              <small className="text-muted">GST/Tax har order par calculate hoga.</small>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <h6 className="fw-bold">Delivery Fee by Area</h6>
              <div className="d-flex gap-2 mb-3">
                <input type="text" className="form-control" placeholder="Area Name" value={newArea.area_name} onChange={(e) => setNewArea({...newArea, area_name: e.target.value})} />
                <input type="number" className="form-control" placeholder="Fee Rs." value={newArea.fee} onChange={(e) => setNewArea({...newArea, fee: e.target.value})} />
                <button onClick={handleSaveDeliveryFee} className="btn btn-danger">Add</button>
              </div>
              <table className="table table-sm small">
                <thead><tr><th>Area Name</th><th>Fee</th><th>Action</th></tr></thead>
                <tbody>
                  {deliveryFees.map(f => (
                    <tr key={f.id}><td>{f.area_name}</td><td>Rs. {f.fee}</td><td><button className="btn btn-sm text-danger border-0">Delete</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* ... Baki Menu Tab aur Edit Modal wahi rahenge jo pehle thay ... */}
    </div>
  );
};

export default ManagerDashboard;