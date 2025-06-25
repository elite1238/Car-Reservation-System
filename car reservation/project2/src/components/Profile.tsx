import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Edit3, Save, X, MapPin, Home } from 'lucide-react';
import { mockUser } from '../data/mockData';
import api from '../api/axios';



const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [id,setID] = useState("");
  const [formData, setFormData] = useState({
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    username: mockUser.username,
    email: mockUser.email,
    phoneno: mockUser.phoneno,
    address: {
      street: mockUser.address.street,
      city: mockUser.address.city,
      state: mockUser.address.state,
      postalCode: mockUser.address.postalCode,
      country: mockUser.address.country
    }
  });
  const [refresh, setRefresh] = useState(false);
  const [UserData, setUserData] = useState<typeof mockUser | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/client/clientAuth'); 
        const id = (res.data as { id: string }).id;
        setID((res.data as { id: string }).id);
        const userRes = await api.post('/client/getclientinfo', { id });
        const userData = userRes.data as typeof mockUser;
        setUserData(userRes.data as typeof mockUser);
        setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
        email: userData.email || "",
        phoneno: userData.phoneno || "",
        address: {
          street: userData.address.street || "",
          city: userData.address.city || "",
          state: userData.address.state || "",
          postalCode: userData.address.postalCode || "",
          country: userData.address.country || ""
        }
      });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [refresh]);

  const handleSave = async() => {
    try{
      const response = await api.post("/client/updateprofile",{
        id:id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phoneno: formData.phoneno,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          postalCode: formData.address.postalCode,
          country: formData.address.country
        }
      });
      setRefresh(prev=>!prev);
    }
    catch(err){
      console.error("Error updating profile");
    }
    finally{
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (UserData) {
      setFormData({
        firstName: UserData.firstName,
        lastName: UserData.lastName,
        username: UserData.username,
        email: UserData.email,
        phoneno: UserData.phoneno,
        address: {
          street: UserData.address.street,
          city: UserData.address.city,
          state: UserData.address.state,
          postalCode: UserData.address.postalCode,
          country: UserData.address.country
        }
      });
    }
    setIsEditing(false);
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={UserData?.profilePhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {UserData?.firstName} {UserData?.lastName}
              </h2>
              <p className="text-gray-600 mb-1">@{UserData?.username}</p>
              <p className="text-gray-500 mb-4">{UserData?.email}</p>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{UserData?.totalRides}</p>
                  <p className="text-sm text-gray-600">Total Rides</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {UserData && UserData.createdAt ? new Date().getFullYear() - new Date(UserData.createdAt).getFullYear() : 0}
                  </p>
                  <p className="text-sm text-gray-600">Years</p>
                </div>
              </div>

              {mockUser.isBlocked && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">Account Blocked</p>
                  <p className="text-xs text-red-600">Contact support for assistance</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    <span>First Name</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    <span>Last Name</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  <span>Username</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">@{formData.username}</p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                <p>{formData.email}</p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneno}
                    onChange={(e) => setFormData({ ...formData, phoneno: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.phoneno}</p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member Since</span>
                </label>
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {UserData && UserData.createdAt
                    ? new Date(UserData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Address Information</span>
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Street Address</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.address.street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.address.city}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.address.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Postal Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, postalCode: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.address.postalCode}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, country: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{formData.address.country}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;