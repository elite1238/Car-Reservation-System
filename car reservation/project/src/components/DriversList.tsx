import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin,
  Eye,
  UserPlus
} from 'lucide-react';
import api from '../api/axios';
import { Driver } from '../types';

const DriversList: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'unavailable'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
         api.get('/admin/driverlist').then(res => setDrivers(res.data)).catch(err => console.error('Error fetching DriverList: ', err));
      } catch (error) {
        console.error('Error fetching drivers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'available' && driver.available) ||
                         (filterStatus === 'unavailable' && !driver.available);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Drivers</h1>
          <p className="mt-2 text-gray-600">Manage and view all registered drivers</p>
        </div>
        <button
          onClick={() => navigate('/admin/add-driver')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Driver
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search drivers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Drivers</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <div key={driver._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                   <img  src={driver.profilePhoto} alt={driver.username.charAt(0).toUpperCase()} className="w-24 h-14 rounded-full object-cover"></img>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{driver.username}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    driver.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {driver.email}
              </div>
              {driver.phoneno && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {driver.phoneno}
                </div>
              )}
              {driver.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {driver.address.street+" "+driver.address.city}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
              </div>
            </div>

            <button
              onClick={() => navigate(`/drivers/${driver._id}`)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </button>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No drivers found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default DriversList;