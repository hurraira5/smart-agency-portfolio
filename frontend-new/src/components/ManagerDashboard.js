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
    // eslint-disable-next-line
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

  // --- NEW: Status Update Function ---
  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) { alert("Action Failed"); }
  };

  const handleSaveDeliveryFee = async () => {
    try {
      await axios.post("https://smart-agency-api.vercel.app/api/delivery-fees", { ...newArea, branch_id: user.branch_id });
      setNewArea({ area_name: '', fee: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleUpdateTax = async (val) => {
    try {
      await axios.put(`https://smart-agency-api.vercel.app/api/branches/${user.branch_id}/tax`, { tax_rate: val });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // --- NEW: Sales Report PDF Function ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${branchInfo?.branch_name || 'Branch'} Sales Report`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Revenue: Rs. ${totalRevenue}`, 14, 38);

    const tableColumn = ["Order ID", "Customer", "Total Amount", "Status"];
    const tableRows = orders.map(order => [
      `#${order.id}`,
      order.customer_name,
      `Rs. ${order.total_amount}`,
      order.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69] }
    });

    doc.save(`Sales_Report_${new Date().toLocaleDateString()}.pdf`);
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
          <div class="flex"><span>Subtotal:</span><span>Rs. ${order.subtotal || 0}</span></div>
          <div class="flex"><span>Tax (${branchInfo?.tax_rate}%):</span><span>Rs. ${taxAmt.toFixed(2)}</span></div>
          <div class="flex"><span>Delivery:</span><span>Rs. ${order.delivery_fee || 0}</span></div>
          <div class="flex bold" style="font-size:16px;"><span>TOTAL:</span><span>Rs. ${order.total_amount}</span></div>
          <div class="hr"></div>
          <p class="text-center">Thank you!</p>
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
        <div className="col-md-6 col-lg-4"><div className="card bg-warning text-dark p-3 rounded-4 border-0 shadow-sm">Pending Orders: {pendingOrders}</div></div>
      </div>

      {/* Nav */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-0">Manager Control Panel</h5>
            <small className="text-muted">{branchInfo?.branch_name}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={downloadPDF} className="btn btn-outline-dark btn-sm rounded-pill px-3 shadow-sm">Sales PDF 📄</button>
            <div className="nav nav-pills bg-light p-1 rounded-pill">
              <button className={`nav-link rounded-pill ${activeTab === 'orders' ? 'active bg-danger' : 'text-dark'}`} onClick={() => setActiveTab('orders')}>Orders</button>
              <button className={`nav-link rounded-pill ${activeTab === 'menu' ? 'active bg-danger' : 'text-dark'}`} onClick={() => setActiveTab('menu')}>Menu</button>
              <button className={`nav-link rounded-pill ${activeTab === 'settings' ? 'active bg-danger' : 'text-dark'}`} onClick={() => setActiveTab('settings')}>Settings ⚙️</button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex justify-content-between mb-3">
            <h6 className="fw-bold">Live Orders</h6>
            <input type="text" className="form-control form-control-sm w-25 rounded-pill" placeholder="Search ID..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="table-responsive">
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
                        {order.status === 'Received' && (
                          <>
                            <button onClick={() => handleStatusUpdate(order.id, 'Accepted')} className="btn btn-sm btn-success rounded-pill px-3">Accept</button>
                            <button onClick={() => handleStatusUpdate(order.id, 'Cancelled')} className="btn btn-sm btn-outline-danger rounded-pill px-3">Cancel</button>
                          </>
                        )}
                        <button onClick={() => printReceipt(order)} className="btn btn-sm btn-dark rounded-pill px-3">Print 🖨️</button>
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
          <div className="col-md-4">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <h6 className="fw-bold mb-3">Add Menu Item</h6>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await axios.post("https://smart-agency-api.vercel.app/api/menu", { ...foodData, branch_id: user.branch_id });
                setFoodData({ name: '', price: '', category: 'Burger', description: '' });
                fetchData();
              }}>
                <input type="text" className="form-control mb-2" placeholder="Name" value={foodData.name} onChange={(e) => setFoodData({...foodData, name: e.target.value})} required />
                <input type="number" className="form-control mb-2" placeholder="Price" value={foodData.price} onChange={(e) => setFoodData({...foodData, price: e.target.value})} required />
                <select className="form-select mb-3" value={foodData.category} onChange={(e) => setFoodData({...foodData, category: e.target.value})}>
                  <option value="Burger">Burger</option><option value="Deal">Deal</option><option value="Drinks">Drinks</option>
                </select>
                <button className="btn btn-primary w-100 rounded-pill">Add Item</button>
              </form>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-4 border-0 shadow-sm rounded-4 text-center">
              <h6 className="fw-bold mb-3 text-start">Current Menu</h6>
              <table className="table table-sm">
                <thead><tr><th>Name</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>Rs. {item.price}</td>
                      <td><button onClick={() => setEditingFood(item)} className="btn btn-sm btn-outline-primary border-0">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <h6 className="fw-bold">Tax Settings</h6>
              <div className="input-group mb-2">
                <input type="number" className="form-control" value={branchInfo?.tax_rate || 0} onChange={(e) => handleUpdateTax(e.target.value)} />
                <span className="input-group-text">%</span>
              </div>
              <small className="text-muted">Government Tax (GST).</small>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <h6 className="fw-bold mb-3">Delivery Fees by Area</h6>
              <div className="d-flex gap-2 mb-3">
                <input type="text" className="form-control" placeholder="Area Name" value={newArea.area_name} onChange={(e) => setNewArea({...newArea, area_name: e.target.value})} />
                <input type="number" className="form-control" placeholder="Fee Rs." value={newArea.fee} onChange={(e) => setNewArea({...newArea, fee: e.target.value})} />
                <button onClick={handleSaveDeliveryFee} className="btn btn-danger rounded-pill px-4">Add</button>
              </div>
              <table className="table table-sm small">
                <thead><tr><th>Area Name</th><th>Fee</th><th>Action</th></tr></thead>
                <tbody>
                  {deliveryFees.map(f => (
                    <tr key={f.id}>
                      <td>{f.area_name}</td>
                      <td className="fw-bold">Rs. {f.fee}</td>
                      <td><button onClick={async () => {
                        await axios.delete(`https://smart-agency-api.vercel.app/api/delivery-fees/${f.id}`);
                        fetchData();
                      }} className="btn btn-sm text-danger border-0">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {editingFood && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 rounded-4 shadow-lg border-0">
              <h5 className="fw-bold mb-3">Update Item</h5>
              <input type="text" className="form-control mb-2" value={editingFood.name} onChange={(e) => setEditingFood({...editingFood, name: e.target.value})} />
              <input type="number" className="form-control mb-3" value={editingFood.price} onChange={(e) => setEditingFood({...editingFood, price: e.target.value})} />
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1 rounded-pill" onClick={async () => {
                  await axios.put(`https://smart-agency-api.vercel.app/api/menu/${editingFood.id}`, editingFood);
                  setEditingFood(null); fetchData();
                }}>Save</button>
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