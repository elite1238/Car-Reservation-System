import React, { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';//NavLink
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Car,
} from 'lucide-react';
import api from '../api/axios';


export interface ClientData {
  _id: string;
  email: string;
  username: string;
  firstName?:string;
  lastName?:string;
  address?: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  };
  profilePhoto:string;
  phoneno?: string;
  totalRides: number;
  createdAt: string;
}
const ViewClient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDriver = async () => {
      if (!id) return;
      
      try {
        const response = await api.post('/client/getclientinfo',{id});
        setDriver(response.data);
      } catch (error) {
        console.error('Error fetching driver:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Driver not found</p>
        <button
          onClick={() => navigate('/admin/drivers')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/clients')}
          className="flex items-center text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Clients
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {/* {driver.username.charAt(0).toUpperCase()} */}
            <img  src={driver.profilePhoto} alt={driver.username.charAt(0).toUpperCase()} className="w-24 h-24 rounded-full object-cover"></img>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{driver.username}</h1>
                <p className="text-gray-600 mt-1">{driver.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold text-gray-900">{driver.totalRides}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Member Since</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(driver.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{driver.email}</p>
              </div>
            </div>
            {driver.phoneno && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900">{driver.phoneno}</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4 ">
            {driver.address?.street && (
              <div className="flex items-center ">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div >
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-gray-900">{driver.address?.street +', '+driver.address?.city +'-'+driver.address?.postalCode}</p>
                  <p className="text-gray-900">{driver.address?.state}</p>
                  <p className="text-gray-900">{driver.address?.country}</p>
                </div>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Joined</p>
                <p className="text-gray-900">
                  {new Date(driver.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors" onClick={()=> navigate(`/ClientRide/${id}`)}>
            View Ride History
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default ViewClient;