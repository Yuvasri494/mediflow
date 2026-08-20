import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Common/Sidebar';
import Navbar from '../components/Common/Navbar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;