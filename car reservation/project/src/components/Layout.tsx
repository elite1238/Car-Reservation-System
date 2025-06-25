import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  UserPlus, 
  LogOut
} from 'lucide-react';
import api
 from '../api/axios';
const Layout: React.FC = () => {
  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/drivers', icon: Car, label: 'All Drivers' },
    { to: '/admin/add-driver', icon: UserPlus, label: 'Add Driver' },
    { to: '/admin/clients', icon: Users, label: 'View Clients' },
  ];
  const navigate = useNavigate();
  const handlelogout = async ()=>{
    try {
      await api.get('/logout'); 
      console.log('Logged out');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Car Reservation System</p>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors mt-1" onClick={handlelogout}>
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;