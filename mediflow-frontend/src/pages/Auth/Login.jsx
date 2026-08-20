import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginApi } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the selected role passed from RoleSelect gateway
  const selectedRole = location.state?.selectedRole;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      login(res.data);
      showToast('Login successful', 'success');
      
      const roleRedirects = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        patient: '/patient/dashboard'
      };
      navigate(roleRedirects[res.data.role] || '/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-xs font-semibold text-blue-600 hover:underline mb-2">
            ← Back to Portal Select
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">MediFlow Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to access your dashboard</p>

          {/* Dynamic Role Badge */}
          {selectedRole && (
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 font-semibold text-xs uppercase tracking-wider rounded-full border ${
                selectedRole === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                selectedRole === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                {selectedRole} Portal Login
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@mediflow.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Show Registration Link ONLY for Patients or Default Login */}
        {(!selectedRole || selectedRole === 'patient') && (
          <p className="text-xs text-center text-slate-500 mt-6">
            Need a patient account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;