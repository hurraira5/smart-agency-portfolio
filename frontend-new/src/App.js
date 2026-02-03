import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Trash2, PlusCircle, ShoppingBag, LayoutDashboard, Globe, Palette, Smartphone, Award } from 'lucide-react';

function App() {
  const [services, setServices] = useState([]);
  const [view, setView] = useState('customer'); 
  const [newService, setNewService] = useState({ title: '', description: '' });

  const fetchData = async () => {
    try {
      const sRes = await fetch('http://localhost:5000/api/services');
      const sData = await sRes.json();
      setServices(sData);
    } catch (e) { console.log("Data fetch error"); }
  };

  useEffect(() => { fetchData(); }, [view]);

  const handleAddService = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/services/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newService)
    });
    setNewService({ title: '', description: '' });
    fetchData();
    alert("Portfolio Item Added! ✅");
  };

  const deleteService = async (id) => {
    if(window.confirm("Remove this from portfolio?")) {
      await fetch(`http://localhost:5000/api/services/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="bg-white min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark sticky-top shadow">
        <div className="container">
          <span className="navbar-brand fw-bold text-success d-flex align-items-center">
            <ShoppingBag className="me-2" /> SMART AGENCY
          </span>
          <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={() => setView(view === 'customer' ? 'admin' : 'customer')}>
            {view === 'customer' ? <><LayoutDashboard size={18} className="me-1"/> Manage Portfolio</> : 'View Live Site'}
          </button>
        </div>
      </nav>

      {view === 'customer' ? (
        <>
          {/* Hero Section */}
          <header className="bg-dark text-white py-5 text-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a4d1a 100%)' }}>
            <div className="container py-5">
              <h1 className="display-3 fw-bold mb-3">Expert Digital Solutions</h1>
              <p className="lead opacity-75 mb-4">Showcasing our premium work and expertise in Pakistan.</p>
              <div className="d-flex justify-content-center gap-3">
                <a href="#portfolio" className="btn btn-success btn-lg px-5 rounded-pill fw-bold shadow">View Work</a>
                <button className="btn btn-outline-light btn-lg px-5 rounded-pill fw-bold">Contact Us</button>
              </div>
            </div>
          </header>

          <div className="container py-5" id="portfolio">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark display-5">What We Do</h2>
              <div className="bg-success mx-auto" style={{height: '4px', width: '60px'}}></div>
            </div>
            
            <div className="row g-4 justify-content-center">
              {services.map(s => (
                <div className="col-md-4" key={s._id}>
                  <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center bg-light transition-all border-hover">
                    <div className="card-body">
                      <div className="text-success mb-4">
                        {s.title.toLowerCase().includes('web') ? <Globe size={48}/> : 
                         s.title.toLowerCase().includes('design') ? <Palette size={48}/> : 
                         s.title.toLowerCase().includes('app') ? <Smartphone size={48}/> : <Award size={48}/>}
                      </div>
                      <h4 className="fw-bold text-dark mb-3">{s.title}</h4>
                      <p className="text-muted mb-0">{s.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Admin View */
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="card shadow-sm border-0 rounded-4 p-4 sticky-top" style={{top: '100px'}}>
                <h4 className="fw-bold mb-4 text-success"><PlusCircle className="me-2"/> New Project</h4>
                <form onSubmit={handleAddService}>
                  <div className="mb-3">
                    <label className="small fw-bold mb-1">Project/Service Title</label>
                    <input type="text" placeholder="e.g. Logo Design" className="form-control" value={newService.title} onChange={(e) => setNewService({...newService, title: e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="small fw-bold mb-1">Description</label>
                    <textarea placeholder="Describe the service..." className="form-control" rows="4" value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} required />
                  </div>
                  <button className="btn btn-success w-100 fw-bold shadow">Add to Portfolio</button>
                </form>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card shadow-sm border-0 rounded-4 p-4">
                <h4 className="fw-bold mb-4">Current Portfolio Items</h4>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light"><tr><th>Work Title</th><th className="text-end">Action</th></tr></thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s._id}>
                          <td className="fw-bold">{s.title}</td>
                          <td className="text-end">
                            <button onClick={() => deleteService(s._id)} className="btn btn-outline-danger btn-sm border-0"><Trash2 size={20}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;