import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
        MediFlow Clinical Portal
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src={user?.profilePhoto || 'https://via.placeholder.com/40'}
            alt="User profile"
            className="w-9 h-9 rounded-full border border-slate-200 object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize mt-1">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="ml-4 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;