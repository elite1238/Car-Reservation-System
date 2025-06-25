// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import  Layout  from './components/Layout';
import Dashboard from './components/Dashboard';
import DriversList from './components/DriversList';
import DriverProfile from './components/DriverProfile';
import AddDriver from './components/AddDriver';
import ClientsList from './components/ClientsList';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import DriverRide from './components/DriverRides';
import ViewClient from './components/ViewClient';
import ClientRide from './components/ClientRide';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/admin" element={<ProtectedAdminRoute><Layout /></ProtectedAdminRoute>}>
          <Route index element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
          <Route path="drivers" element={<ProtectedAdminRoute><DriversList /></ProtectedAdminRoute>} />
          <Route path="add-driver" element={<ProtectedAdminRoute><AddDriver /></ProtectedAdminRoute>} />
          <Route path="clients" element={<ProtectedAdminRoute><ClientsList /></ProtectedAdminRoute>} />
          </Route>
        <Route path="drivers/:id" element={<ProtectedAdminRoute><DriverProfile /></ProtectedAdminRoute>} />
        <Route path="driverRide/:id" element={<ProtectedAdminRoute><DriverRide /></ProtectedAdminRoute>} />
        <Route path="ViewClient/:id" element={<ProtectedAdminRoute><ViewClient /></ProtectedAdminRoute>} />
        <Route path="ClientRide/:id" element={<ProtectedAdminRoute><ClientRide /></ProtectedAdminRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;