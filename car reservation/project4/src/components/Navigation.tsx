import React from 'react';
import { 
  LayoutDashboard, 
  User, 
  History, 
  Car,
  LogOut,
  PersonStandingIcon,
  Map
} from 'lucide-react';
import api from '../api/axios';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'trips', label: 'Trip History', icon: History },
    { id: 'RidesAvailable', label:'Rides Available',icon:PersonStandingIcon},
    {id:'DriverMap',label:'DriverMap',icon:Map},
    { id:'logout', label: 'Log Out', icon: LogOut}
  ];
  const handleLogout = async() => {
    try{
      const response = await api.get('/logout');
      alert("Logged out");
      window.location.href = "http://localhost:5173";
    }
    catch(err){
      console.error("logout error");
    }
    
  };
  return (
    <div className="bg-white shadow-lg border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DriveHub</h1>
            <p className="text-sm text-gray-500">Driver Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if(item.id==='logout'){
                  handleLogout();
                }
                else{
                  onTabChange(item.id)
                }
              }}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;