import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Car, FileText, Camera,Edit3,Save,X} from 'lucide-react';
import { Driver } from '../types/driver';
import api from '../api/axios';

interface ProfileProps {
  driver: Driver;
  onUpdateDriver: (driver: Driver) => void;
}

const Profile: React.FC<ProfileProps> = ({ driver, onUpdateDriver }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDriver, setEditedDriver] = useState<Driver>(driver);
  const handleSave = async() => {
    const authDriver = await api.get('/driver/auth');
    const response = await api.post('/driver/updateProfile',{
      id:authDriver.data.id,
      firstName:editedDriver.firstName,
      lastName:editedDriver.lastName,
      username:editedDriver.username,
      phoneno:editedDriver.phoneno
    });
    onUpdateDriver(editedDriver);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDriver(driver);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string, nested?: string) => {
    if (nested) {
      setEditedDriver(prev => ({
        ...prev,
        [nested]: {
          ...((prev[nested as keyof Driver] as object) || {}),
          [field]: value
        }
      }));
    } else {
      setEditedDriver(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and vehicle details</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Photo */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {driver.profilePhoto ? (
                <img src={driver.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition-colors duration-200">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{driver.firstName} {driver.lastName}</h3>
            <p className="text-gray-600">@{driver.username}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {new Date(driver.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span>{driver.firstName}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span>{driver.lastName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span>{driver.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={editedDriver.phoneno}
                onChange={(e) => handleInputChange('phoneno', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span>{driver.phoneno}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.address.street}
                onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <span>{driver.address.street}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.address.city}
                onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">{driver.address.city}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.address.state}
                onChange={(e) => handleInputChange('state', e.target.value, 'address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">{driver.address.state}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.address.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value, 'address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">{driver.address.postalCode}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.address.country}
                onChange={(e) => handleInputChange('country', e.target.value, 'address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">{driver.address.country}</div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            {(
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Car className="h-5 w-5 text-gray-400 mr-3" />
                <span className="capitalize">{driver.vehicleInfo.Vtype}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
            {(
              <div className="p-3 bg-gray-50 rounded-lg font-mono">{driver.vehicleInfo.Vno}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><a href={driver.vehicleInfo.Vinsurance}>Insurance</a></label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><a href={driver.vehicleInfo.rc}>RC Number</a></label>
          </div>
        </div>
      </div>

      {/* License Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">License Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Document</label>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                <a href={driver.license.licenseLink} >View License Document</a>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="uppercase">{driver.license.fileType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;