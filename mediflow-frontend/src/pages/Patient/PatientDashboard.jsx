import React, { useEffect, useState } from 'react';
import { getPatientProfileApi, updatePatientProfileApi } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ age: '', gender: 'Male', contactNumber: '', medicalHistory: '' });

  const { showToast } = useToast();

  const loadProfile = () => {
    getPatientProfileApi()
      .then((res) => {
        setPatient(res.data);
        setFormData({
          age: res.data?.age || '',
          gender: res.data?.gender || 'Male',
          contactNumber: res.data?.contactNumber || '',
          medicalHistory: res.data?.medicalHistory || ''
        });
      })
      .catch(() => showToast('Failed to load patient profile', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('age', formData.age);
    data.append('gender', formData.gender);
    data.append('contactNumber', formData.contactNumber);
    data.append('medicalHistory', formData.medicalHistory);
    if (file) data.append('profilePhoto', file);

    try {
      await updatePatientProfileApi(data);
      showToast('Profile updated successfully', 'success');
      loadProfile();
    } catch (err) {
      showToast('Error updating profile', 'error');
    }
  };

  if (loading) return <div className="text-slate-500">Loading Patient Overview...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Medical Profile</h1>
        <p className="text-sm text-slate-500">Keep your clinical details and medical history up to date</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img src={patient?.userId?.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Upload Photo (Cloudinary)</label>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-xs text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Age</label>
              <input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border rounded text-sm bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact Number</label>
            <input type="text" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className="w-full px-3 py-2 border rounded text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Medical History Notes</label>
            <textarea rows={4} value={formData.medicalHistory} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} className="w-full p-2 border rounded text-sm" placeholder="Allergies, chronic conditions, or prior surgeries..." />
          </div>

          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm">
            Save Profile Updates
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientDashboard;