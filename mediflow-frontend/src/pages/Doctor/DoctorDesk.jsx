import React, { useState, useEffect } from 'react';
import {
  getDoctorAppointmentsApi,
  updateAppointmentStatusApi,
  addPrescriptionApi,
  getPatientHistoryApi
} from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';

const DoctorDesk = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Patient history drawer/modal state
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Prescription Form State
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchQueue = async () => {
    try {
      const res = await getDoctorAppointmentsApi();
      setAppointments(res.data || res || []);
    } catch (err) {
      showToast('Failed to load doctor appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleOpenPrescription = (app) => {
    setSelectedApp(app);
    setTreatmentNotes('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointmentStatusApi(id, status);
      showToast(`Appointment status updated to ${status}`, 'success');
      fetchQueue();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleViewPatientHistory = async (patientId) => {
    setLoadingHistory(true);
    try {
      const res = await getPatientHistoryApi(patientId);
      setHistoryData(res.data || res);
    } catch (err) {
      showToast('Failed to fetch patient history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    const validMedicines = medicines.filter((m) => m.name.trim() !== '');
    if (validMedicines.length === 0) {
      showToast('Please add at least one medicine', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addPrescriptionApi({
        appointmentId: selectedApp._id,
        medicines: validMedicines,
        treatmentNotes
      });
      showToast('Prescription added & consultation marked completed!', 'success');
      setSelectedApp(null);
      fetchQueue();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit prescription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doctor Consultation Desk</h1>
        <p className="text-sm text-slate-500">Manage daily appointments, view patient history, and create prescriptions</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading appointment queue...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500">No scheduled appointments found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800">
                    {app.patientId?.userId?.name || 'Patient'}
                    <button
                      onClick={() => handleViewPatientHistory(app.patientId?._id)}
                      className="block text-xs text-blue-600 font-semibold hover:underline mt-0.5"
                    >
                      View Medical History
                    </button>
                  </td>
                  <td className="p-4 text-slate-600">
                    {app.date ? new Date(app.date).toLocaleDateString() : 'N/A'}
                    <span className="block text-xs text-slate-400">{app.time || ''}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                        app.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(app._id, 'approved')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app._id, 'rejected')}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status !== 'completed' && app.status !== 'rejected' && (
                      <button
                        onClick={() => handleOpenPrescription(app)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium"
                      >
                        + Add Prescription
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient History Modal */}
      {historyData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Medical History — {historyData.patient?.userId?.name}
              </h3>
              <button onClick={() => setHistoryData(null)} className="text-slate-400 text-lg hover:text-slate-600">✕</button>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Past Prescriptions ({historyData.prescriptions?.length || 0})</h4>
              {historyData.prescriptions?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No past prescriptions on record.</p>
              ) : (
                <div className="space-y-3">
                  {historyData.prescriptions.map((p) => (
                    <div key={p._id} className="p-3 border rounded-lg bg-slate-50 space-y-2 text-xs">
                      <p className="font-semibold text-slate-700">Notes: {p.treatmentNotes || 'N/A'}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.medicines?.map((m, i) => (
                          <span key={i} className="bg-white border px-2 py-0.5 rounded text-[11px] font-medium text-slate-800">
                            {m.name} ({m.dosage}) - {m.frequency}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl my-8">
            <h2 className="text-lg font-bold text-slate-800">
              New Prescription — {selectedApp.patientId?.userId?.name}
            </h2>

            <form onSubmit={handleSubmitPrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Treatment Notes</label>
                <textarea
                  rows={3}
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder="Enter clinical notes, diagnosis, or patient instructions..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Medicines</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    + Add Medicine
                  </button>
                </div>

                {medicines.map((med, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      className="col-span-4 px-2.5 py-1.5 border rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="col-span-3 px-2.5 py-1.5 border rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Freq (1-0-1)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="col-span-2 px-2.5 py-1.5 border rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Dur (5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      className="col-span-2 px-2.5 py-1.5 border rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicineRow(index)}
                      className="col-span-1 text-red-500 font-bold text-sm text-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  {submitting ? 'Saving...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDesk;