import React, { useState, useEffect } from 'react';
import { getAllPatientsApi } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await getAllPatientsApi();

      const dataList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setPatients(dataList);
    } catch (err) {
      showToast('Failed to load patient list. Ensure you are logged in as Admin.', 'error');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const safePatientsList = Array.isArray(patients) ? patients : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Registry</h1>
        <p className="text-sm text-slate-500">Manage all registered patient profiles and system activity</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading patient records...</div>
      ) : safePatientsList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
          No registered patients found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
              <tr>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Age / Gender</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safePatientsList.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800">
                    {p.userId?.name || 'N/A'}
                  </td>
                  <td className="p-4 text-slate-600">{p.userId?.email || 'N/A'}</td>
                  <td className="p-4 text-slate-600">
                    {p.age ? `${p.age} yrs` : 'N/A'} / {p.gender || 'N/A'}
                  </td>
                  <td className="p-4 text-slate-600">
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded text-xs">
                      {p.bloodGroup || 'O+'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{p.contactNumber || p.userId?.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;