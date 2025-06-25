import React, { useState } from 'react';
import { Home, User, Clock, MapPin, Menu, X, LogOut } from 'lucide-react';
import { ClientSection } from '../types';
import Dashboard from './Dashboard';
import Profile from './Profile';
import BookingHistory from './BookingHistory';
import api from '../api/axios';

const ClientLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ClientSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLogout = async () => {
  try {
    await api.get('/logout');
    alert("Client logged out");
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    window.location.href = "http://localhost:5173"; // Change to your actual login frontend
  }
};

  const navigationItems = [
    { id: 'dashboard' as ClientSection, icon: Home, label: 'Dashboard' },
    { id: 'book' as ClientSection, icon: MapPin, label: 'Book Now' },
    { id: 'history' as ClientSection, icon: Clock, label: 'Trip History' },
    { id: 'profile' as ClientSection, icon: User, label: 'Profile' },
    { id: 'logout' as ClientSection, icon: LogOut, label: 'LogOut'}
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'history':
        return <BookingHistory />;
      case 'book':
        window.location.href = 'http://localhost:5176/';
        return;
        
      case 'logout':
        handleLogout();
        return null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RideBook</h1>
              <p className="text-sm text-gray-500">Client Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">RideBook</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50">
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default ClientLayout;