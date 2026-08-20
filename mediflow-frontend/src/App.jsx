import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import RoleSelect from './pages/Auth/RoleSelect';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Common Layout & Protection
import ProtectedRoute from './components/Common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import DoctorManagement from './pages/Admin/DoctorManagement';
import PatientManagement from './pages/Admin/PatientManagement';
import AllAppointments from './pages/Admin/AllAppointments';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import MedicalRecords from './pages/Doctor/MedicalRecords';

// Patient Pages
import PatientDashboard from './pages/Patient/PatientDashboard';
import DoctorDiscovery from './pages/Patient/DoctorDiscovery';
import MyAppointments from './pages/Patient/MyAppointments';
import MyPrescriptions from './pages/Patient/MyPrescriptions';

import RealTimeNotifications from './components/RealTimeNotifications';

function App() {
  return (
    <Routes>
      {/* Landing Gateway Page */}
      <Route path="/" element={<RoleSelect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes Inside Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        {/* Admin Section */}
        <Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/doctors" element={<DoctorManagement />} />
<Route path="/admin/patients" element={<PatientManagement />} />
<Route path="/admin/appointments" element={<AllAppointments />} />

        {/* Doctor Section */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/medical-records" element={<MedicalRecords />} />
        </Route>

        {/* Patient Section */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/discover" element={<DoctorDiscovery />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
          <Route path="/patient/prescriptions" element={<MyPrescriptions />} />
        </Route>
      </Route>

      {/* Default Catch-All Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;