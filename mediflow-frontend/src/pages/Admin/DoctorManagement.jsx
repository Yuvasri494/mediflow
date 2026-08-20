import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  getAllDoctorsApi,
  createDoctorApi,
  toggleDoctorStatusApi,
  deleteDoctorApi
} from '../../services/adminService';
import API from '../../services/api';
// Default fallback list so dropdown is NEVER empty even if API is loading/empty
const DEFAULT_DEPARTMENTS = [
  { _id: 'Cardiology', name: 'Cardiology' },
  { _id: 'Neurology', name: 'Neurology' },
  { _id: 'General Medicine', name: 'General Medicine' },
  { _id: 'Pediatrics', name: 'Pediatrics' },
  { _id: 'Orthopedics', name: 'Orthopedics' }
];

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    specialization: 'General Physician',
    qualification: 'MBBS',
    experience: '1',
    fees: '500'
  });

  const [showPassword, setShowPassword] = useState(false);

  const { showToast } = useToast();

  // Bulletproof Token & Header Extractor
  /*
  const getHeaders = () => {
    try {
      const userStorage = localStorage.getItem('userInfo');
      if (!userStorage) return {};

      const user = JSON.parse(userStorage);
      // Support all token payload structures across login variations
      const token = user?.token || user?.data?.token || user?.accessToken;

      if (!token || token === 'undefined' || token === 'null') {
        return {};
      }

      return {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    } catch (err) {
      return {};
    }
  };
  */

 const fetchData = async () => {
  try {
    setLoading(true);

    const [docRes, deptRes] = await Promise.allSettled([
      getAllDoctorsApi(),
      API.get('/departments').then(res => res.data)
    ]);

    if (docRes.status === 'fulfilled') {
      const docList = Array.isArray(docRes.value?.data)
        ? docRes.value.data
        : Array.isArray(docRes.value)
        ? docRes.value
        : [];
      setDoctors(docList);
    } else {
      setDoctors([]);
    }

    if (deptRes.status === 'fulfilled') {
      const deptList = Array.isArray(deptRes.value?.data)
        ? deptRes.value.data
        : Array.isArray(deptRes.value)
        ? deptRes.value
        : [];

      if (deptList.length > 0) {
        setDepartments(deptList);
      }
    }
  } catch (err) {
    showToast('Error loading doctor management page', 'error');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone || '9876543210',
        department: formData.department || null,
        specialization: formData.specialization || 'General Physician',
        qualification: formData.qualification || 'MBBS',
        experience: Number(formData.experience) || 1,
        fees: Number(formData.fees) || 500
      };

     await createDoctorApi(payload);
      showToast('Doctor registered successfully!', 'success');
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        department: '',
        specialization: 'General Physician',
        qualification: 'MBBS',
        experience: '1',
        fees: '500'
      });
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create doctor account';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleDoctorStatusApi(id);
      showToast('Doctor status updated', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update doctor status', 'error');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await deleteDoctorApi(id);
      showToast('Doctor deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete doctor', 'error');
    }
  };

  const safeDoctorList = Array.isArray(doctors) ? doctors : [];
  const safeDeptList = departments.length > 0 ? departments : DEFAULT_DEPARTMENTS;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctor Directory</h1>
          <p className="text-sm text-slate-500">Manage clinical staff, access status, and credentials</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          + Add New Doctor
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading doctor directory...</div>
      ) : safeDoctorList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
          No doctor records found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
              <tr>
                <th className="p-4">Doctor</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Qualification</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {safeDoctorList.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800">
                    <div>Dr. {doc.userId?.name || 'N/A'}</div>
                    <div className="text-xs text-slate-400 font-normal">{doc.userId?.email}</div>
                  </td>
                  <td className="p-4 text-slate-600">
                    {doc.specialization || doc.department?.name || 'General'}
                  </td>
                  <td className="p-4 text-slate-600">{doc.qualification || 'MBBS'}</td>
                  <td className="p-4 text-slate-600">{doc.experience || 1} yrs</td>
                  <td className="p-4 text-slate-600">₹{doc.fees || 500}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                        doc.userId?.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {doc.userId?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(doc._id)}
                      className="px-2.5 py-1 border rounded text-xs hover:bg-slate-50 text-slate-700"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doc._id)}
                      className="px-2.5 py-1 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800">Register New Doctor Account</h2>

            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@mediflow.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2 pr-10 border rounded"
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
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Department (Optional)</option>
                    {safeDeptList.map((d) => (
                      <option key={d._id || d.name} value={d._id || d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiologist"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Qualification</label>
                  <input
                    type="text"
                    placeholder="MBBS, MD"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Experience (yrs)</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Fee (₹)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;