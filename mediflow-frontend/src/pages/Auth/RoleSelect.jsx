import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RoleSelect = () => {
  const navigate = useNavigate();

  const handleRoleChoice = (role) => {
    // Navigate to login with selected role as state/query
    navigate('/login', { state: { selectedRole: role } });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-6">
      <div className="max-w-4xl w-full text-center space-y-3 mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-2xl shadow-md">
          M
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome to MediFlow</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Enterprise Hospital Management System. Please select your clinical portal to continue.
        </p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <h2 className="text-lg font-bold text-slate-800">Administrator</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full system control: Manage doctor accounts, monitor overall hospital metrics, and manage patient records.
            </p>
          </div>
          <button
            onClick={() => handleRoleChoice('admin')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            Access Admin Portal
          </button>
        </div>

        {/* Doctor Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              👨‍⚕️
            </div>
            <h2 className="text-lg font-bold text-slate-800">Doctor Portal</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage weekly availability slots, review patient consultation requests, and issue digital prescriptions.
            </p>
          </div>
          <button
            onClick={() => handleRoleChoice('doctor')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            Access Doctor Portal
          </button>
        </div>

        {/* Patient Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              🏥
            </div>
            <h2 className="text-lg font-bold text-slate-800">Patient Portal</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Discover clinical specialists, book real-time appointments, and access your prescriptions and medical history.
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleRoleChoice('patient')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              Patient Login
            </button>
            <Link
              to="/register"
              className="block text-center text-xs font-semibold text-emerald-600 hover:underline pt-1"
            >
              New Patient? Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;