import React, { useState, useEffect } from 'react';
import { getAllAppointmentsApi } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAppointments = async () => {
    try {
      const res = await getAllAppointmentsApi();
      setAppointments(res?.data || res || []);
    } catch (err) {
      showToast('Failed to load system appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Master Appointments Registry</h1>
        <p className="text-sm text-slate-500">View and manage all patient-doctor bookings across departments</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading system appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500">No appointments recorded yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800">
                    {app.patientId?.userId?.name || app.patient?.userId?.name || 'N/A'}
                  </td>
                  <td className="p-4 text-slate-600">
                    Dr. {app.doctorId?.userId?.name || app.doctor?.userId?.name || 'N/A'}
                  </td>
                  <td className="p-4 text-slate-600">{app.department?.name || 'General'}</td>
                  <td className="p-4 text-slate-600">
                    {new Date(app.appointmentDate || app.date).toLocaleDateString()}
                    <span className="block text-xs text-slate-400">{app.timeSlot || app.time}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                        app.status === 'completed' || app.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'approved' || app.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'rejected' || app.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;