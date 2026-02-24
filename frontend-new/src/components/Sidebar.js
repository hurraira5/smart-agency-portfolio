import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaThLarge, FaShoppingBag, FaTv, FaUtensils, 
  FaLayerGroup, FaUsers, FaTicketAlt, FaGlobe, 
  FaChartBar, FaCog, FaChevronLeft 
} from 'react-icons/fa';

const Sidebar = ({ userRole }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // PDF ke mutabiq Manager ki menu items
  const managerMenu = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/dashboard' },
    { name: 'Orders', icon: <FaShoppingBag />, path: '/orders' },
    { name: 'Kitchen Display', icon: <FaTv />, path: '/kitchen' },
    { name: 'Menu Items', icon: <FaUtensils />, path: '/items' },
    { name: 'Categories', icon: <FaLayerGroup />, path: '/categories' },
    { name: 'Customers', icon: <FaUsers />, path: '/customers' },
    { name: 'Coupons', icon: <FaTicketAlt />, path: '/coupons' },
    { name: 'Website Settings', icon: <FaGlobe />, path: '/website-settings' },
    { name: 'Reports', icon: <FaChartBar />, path: '/reports' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
  ];

  // SuperAdmin ke liye alag items (Agar userRole === 'superadmin' ho)
  const superAdminMenu = [
    { name: 'All Branches', icon: <FaLayerGroup />, path: '/admin/branches' },
    { name: 'Subscriptions', icon: <FaTicketAlt />, path: '/admin/plans' },
    { name: 'System Logs', icon: <FaCog />, path: '/admin/logs' },
  ];

  const menuItems = userRole === 'superadmin' ? superAdminMenu : managerMenu;

  return (
    <div className={`min-h-screen bg-white border-r transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col`}>
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-black text-red-600 tracking-tighter uppercase">Smart Agency</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaChevronLeft className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* WhatsApp Status (PDF Style) */}
      {!collapsed && (
        <div className="mx-4 mb-6 p-3 bg-green-50 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-green-700 uppercase">WhatsApp Connected</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group"
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse Trigger Footer */}
      <div className="p-4 border-t">
         <button className="flex items-center gap-4 px-4 py-2 text-gray-400 font-bold text-xs uppercase">
            <FaChevronLeft /> {!collapsed && "Collapse"}
         </button>
      </div>
    </div>
  );
};

export default Sidebar;