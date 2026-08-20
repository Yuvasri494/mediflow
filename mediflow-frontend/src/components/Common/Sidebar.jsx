import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const linksByRole = {
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard' },
      { path: '/admin/doctors', label: 'Doctor Management' },
      { path: '/admin/patients', label: 'Patient Directory' },
      { path: '/admin/appointments', label: 'All Appointments' }
    ],
    doctor: [
      { path: '/doctor/dashboard', label: 'My Dashboard' },
      { path: '/doctor/medical-records', label: 'Patient Medical History' }
    ],
    patient: [
      { path: '/patient/dashboard', label: 'My Dashboard' },
      { path: '/patient/discover', label: 'Find & Book Doctors' },
      { path: '/patient/appointments', label: 'My Appointments' },
      { path: '/patient/prescriptions', label: 'My Prescriptions' }
    ]
  };

  const activeClass = "bg-blue-600 text-white font-medium shadow-sm";
  const inactiveClass = "text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors";

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">M</div>
        <span className="text-xl font-bold tracking-tight text-slate-800">MediFlow</span>
      </div>
      <nav className="p-4 flex-1 space-y-1">
        {linksByRole[user?.role]?.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm ${isActive ? activeClass : inactiveClass}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;