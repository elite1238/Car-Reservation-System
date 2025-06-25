import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  Activity, 
  TrendingUp,
  UserPlus
} from 'lucide-react';
import  api  from '../api/axios';
import { DashboardStats } from '../types';
import { NavLink } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        api.get('/admin/dashboard').then(res=> setStats(res.data)).catch(err=>console.error('Error fetching dashboard stats: ', err));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error loading dashboard data</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      icon: Car,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Active Drivers',
      value: stats.activeDrivers,
      icon: Activity,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Rides',
      value: stats.totalRides,
      icon: TrendingUp,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your car reservation system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NavLink to = "drivers">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">View All Drivers</p>
                <p className="text-sm text-gray-500">Manage driver profiles</p>
              </div>
            </div>
          </button>
          </NavLink>

          <NavLink to = "add-driver">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Add New Driver</p>
                <p className="text-sm text-gray-500">Register new driver</p>
              </div>
            </div>
          </button>
          </NavLink>
          <NavLink to = "clients">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">View Clients</p>
                <p className="text-sm text-gray-500">Manage client accounts</p>
              </div>
            </div>
          </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;