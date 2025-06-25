import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin,
  Save,
  ArrowLeft,
  Upload,
  X,
  FileText,
  Car,
  Shield,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface DriverFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneno: string;
  vehicleno:string;
  vehicletype:string;
  address: AddressData;
  profilePhoto: File | null;
  licenseFile: File | null;
  vehicleInsurance: File | null;
  vehicleRCBook: File | null;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  phoneno?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  profilePhoto?: string;
  licenseFile?: string;
  vehicleInsurance?: string;
  vehicleRCBook?: string;
}

const AddDriver: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DriverFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneno: '',
    vehicleno:'',
    vehicletype:'',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    profilePhoto: null,
    licenseFile: null,
    vehicleInsurance: null,
    vehicleRCBook: null
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [dragActive, setDragActive] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
    if (errors.address?.[name as keyof AddressData]) {
      setErrors(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: undefined
        }
      }));
    }
  };

  const handleFileUpload = (file: File, fieldName: keyof Pick<DriverFormData, 'profilePhoto' | 'licenseFile' | 'vehicleInsurance' | 'vehicleRCBook'>) => {
    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = fieldName === 'profilePhoto' 
      ? ['image/jpeg', 'image/png', 'image/jpg']
      : ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: `Invalid file type. ${fieldName === 'profilePhoto' ? 'Only JPG, JPEG, PNG allowed' : 'Only PDF, JPG, JPEG, PNG allowed'}`
      }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));

    // Clear error
    setErrors(prev => ({
      ...prev,
      [fieldName]: undefined
    }));
  };

  const handleDrop = (e: React.DragEvent, fieldName: keyof Pick<DriverFormData, 'profilePhoto' | 'licenseFile' | 'vehicleInsurance' | 'vehicleRCBook'>) => {
    e.preventDefault();
    setDragActive(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], fieldName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault();
    setDragActive(fieldName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(null);
  };

  const removeFile = (fieldName: keyof Pick<DriverFormData, 'profilePhoto' | 'licenseFile' | 'vehicleInsurance' | 'vehicleRCBook'>) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Phone validation
    if (!formData.phoneno.trim()) {
      newErrors.phoneno = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneno)) {
      newErrors.phoneno = 'Invalid phone number format';
    }

    // Address validation
    const addressErrors: ValidationErrors['address'] = {};
    if (!formData.address.street.trim()) addressErrors.street = 'Street is required';
    if (!formData.address.city.trim()) addressErrors.city = 'City is required';
    if (!formData.address.state.trim()) addressErrors.state = 'State is required';
    if (!formData.address.postalCode.trim()) addressErrors.postalCode = 'Postal code is required';
    if (!formData.address.country.trim()) addressErrors.country = 'Country is required';

    if (Object.keys(addressErrors).length > 0) {
      newErrors.address = addressErrors;
    }

    // File validations
    if (!formData.profilePhoto) {
      newErrors.profilePhoto = 'Profile photo is required';
    }
    if (!formData.licenseFile) {
      newErrors.licenseFile = 'License file is required';
    }
    if (!formData.vehicleInsurance) {
      newErrors.vehicleInsurance = 'Vehicle insurance file is required';
    }
    if (!formData.vehicleRCBook) {
      newErrors.vehicleRCBook = 'Vehicle RC book file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields correctly before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Here you can access all form data through the formData variable
      const response = await api.post('/admin/registerdriver', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          },
      });

      console.log('Form Data:', formData);
      alert('Driver added successfully!');
      navigate('/admin/drivers');
    } catch (error) {
      console.error('Error adding driver:', error);
      alert('Error adding driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadArea: React.FC<{
    fieldName: keyof Pick<DriverFormData, 'profilePhoto' | 'licenseFile' | 'vehicleInsurance' | 'vehicleRCBook'>;
    label: string;
    icon: React.ReactNode;
    file: File | null;
    error?: string;
    accept: string;
  }> = ({ fieldName, label, icon, file, error, accept }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label} *</label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive === fieldName
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={(e) => handleDrop(e, fieldName)}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, fieldName)}
        onDragLeave={handleDragLeave}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {icon}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(fieldName)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4">{icon}</div>
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your file here, or{' '}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, fieldName);
                  }}
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              {fieldName === 'profilePhoto' ? 'JPG, JPEG, PNG up to 5MB' : 'PDF, JPG, JPEG, PNG up to 5MB'}
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/drivers')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Drivers
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
            <p className="mt-2 text-gray-600">Register a new driver with complete profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                  </div>
                  {errors.firstName && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.firstName}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                  </div>
                  {errors.lastName && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.lastName}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter username"
                    />
                  </div>
                  {errors.username && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.username}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                  </div>
                  {errors.password && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </div>
                  )}
                </div>
                  
                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneno" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      id="phoneno"
                      name="phoneno"
                      value={formData.phoneno}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phoneno ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phoneno && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phoneno}
                    </div>
                  )}
                </div>
                {/* Vehicle number */}
                <div>
                  <label htmlFor="vehicleno" className="block text-sm font-medium text-gray-700 mb-2">
                    vehicleno *
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      id="vehicleno"
                      name="vehicleno"
                      value={formData.vehicleno}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phoneno ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter Vehicle number"
                    />
                  </div>
                </div>
            <div>
                  <label htmlFor="vehicletype" className="block text-sm font-medium text-gray-700 mb-2">
                    vehicle type *
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      id="vehicletype"
                      name="vehicletype"
                      value={formData.vehicletype}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phoneno ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter Vehicle type"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            

            {/* Address Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Street */}
                <div className="md:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address?.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter street address"
                  />
                  {errors.address?.street && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address.street}
                    </div>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address?.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.address?.city && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address.city}
                    </div>
                  )}
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address?.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter state"
                  />
                  {errors.address?.state && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address.state}
                    </div>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.address.postalCode}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address?.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter postal code"
                  />
                  {errors.address?.postalCode && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address.postalCode}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.address.country}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address?.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter country"
                  />
                  {errors.address?.country && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address.country}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Document Uploads
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadArea
                  fieldName="profilePhoto"
                  label="Profile Photo"
                  icon={<Camera className="h-8 w-8 text-gray-400" />}
                  file={formData.profilePhoto}
                  error={errors.profilePhoto}
                  accept="image/jpeg,image/jpg,image/png"
                />

                <FileUploadArea
                  fieldName="licenseFile"
                  label="Driving License"
                  icon={<FileText className="h-8 w-8 text-gray-400" />}
                  file={formData.licenseFile}
                  error={errors.licenseFile}
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                />

                <FileUploadArea
                  fieldName="vehicleInsurance"
                  label="Vehicle Insurance"
                  icon={<Shield className="h-8 w-8 text-gray-400" />}
                  file={formData.vehicleInsurance}
                  error={errors.vehicleInsurance}
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                />

                <FileUploadArea
                  fieldName="vehicleRCBook"
                  label="Vehicle RC Book"
                  icon={<Car className="h-8 w-8 text-gray-400" />}
                  file={formData.vehicleRCBook}
                  error={errors.vehicleRCBook}
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                ) : (
                  <Save className="h-6 w-6 mr-3" />
                )}
                {loading ? 'Adding Driver...' : 'Add Driver'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/drivers')}
                className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDriver;