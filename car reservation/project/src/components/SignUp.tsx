import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Car, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    fname:'',
    lname:'',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    const data ={
      username:formData.username,
      email:formData.email,
      phoneno:formData.phone,
      fname:formData.fname,
      lname:formData.lname,
      password:formData.password
    };
    try{
      const response = await api.post("/register",data);
      console.log("Successfully Registered");
      alert("Successfully Registered");
      navigate("/");
    }
    catch(err:any){
      console.error("Registration error",err);
      const serverMessage = err.response?.data?.message;
      if(serverMessage==="email already exists")
        alert("Email already registered");
      else
        alert("Error try again"+serverMessage);
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>

        {/* Sign Up Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-300">Join us and start your journey</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                }`}
                placeholder="Username"
                required
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                }`}
                placeholder="Email address"
                required
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                }`}
                placeholder="Phone number"
                required
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            {/* First Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="fname"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                }`}
                placeholder="First Name"
                required
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            {/* Last name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="lname"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                }`}
                placeholder="Last Name"
                required
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                }`}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>
            
            {/* Confirm Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                }`}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link
                to="/"
                className="text-green-400 hover:text-green-300 font-semibold transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

export default SignUp;