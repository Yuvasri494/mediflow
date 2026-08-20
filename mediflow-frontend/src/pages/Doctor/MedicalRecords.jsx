import React, { useEffect, useState } from 'react';
import { getDoctorAppointmentsApi, getPatientHistoryApi } from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';

const MedicalRecords = () => {
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { showToast } = useToast();

   useEffect(() => {
    // Fetch doctor's appointments to extract unique assigned patients
    getDoctorAppointmentsApi()
      .then((res) => {
        const apps = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        const uniquePatientsMap = new Map();
        apps.forEach((app) => {
          if (app.patient) {
            uniquePatientsMap.set(app.patient._id, app.patient);
          }
        });
        const list = Array.from(uniquePatientsMap.values());
        setPatientsList(list);
        if (list.length > 0) {
          setSelectedPatientId(list[0]._id);
        }
      })
      .catch(() => showToast('Failed to load patient list', 'error'))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!selectedPatientId) return;
    setLoadingHistory(true);
    getPatientHistoryApi(selectedPatientId)
      .then((res) => setHistoryData(res.data))
      .catch(() => showToast('Failed to load patient history', 'error'))
      .finally(() => setLoadingHistory(false));
  }, [selectedPatientId]);

  if (loadingList) return <div className="text-slate-500">Loading Patient Records...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Medical History</h1>
        <p className="text-sm text-slate-500">Review complete clinical history, consultation notes, and prescriptions</p>
      </div>

      {patientsList.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
          No patients have booked appointments with you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Patient Selector List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Patient</h2>
            <div className="divide-y divide-slate-100">
              {patientsList.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedPatientId(p._id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                    selectedPatientId === p._id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <img src={p.userId?.profilePhoto || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.userId?.name || 'Patient'}</p>
                    <p className="text-xs text-slate-500">{p.age} Yrs • {p.gender}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Patient History Timeline */}
          <div className="md:col-span-2 space-y-6">
            {loadingHistory ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-500">Loading clinical records...</div>
            ) : historyData ? (
              <>
                {/* Patient Summary Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={historyData.patient?.userId?.profilePhoto} alt="" className="w-14 h-14 rounded-full object-cover border" />
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{historyData.patient?.userId?.name}</h2>
                      <p className="text-xs text-slate-500">{historyData.patient?.age} Yrs • {historyData.patient?.gender} • {historyData.patient?.contactNumber || 'No contact provided'}</p>
                      <p className="text-xs text-slate-600 mt-2 bg-amber-50 border border-amber-200 p-2 rounded">
                        <span className="font-semibold text-amber-800">Medical Notes:</span> {historyData.patient?.medicalHistory || 'None reported'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Past Appointments */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-md font-bold text-slate-800">Appointment History ({historyData.appointments?.length || 0})</h3>
                  <div className="space-y-2">
                                       {historyData.appointments?.map((app) => (
                      <div key={app._id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : 'N/A'} at {app.timeSlot}</p>
                          <p className="text-slate-500">Reason: {app.reason}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full font-semibold ${
                          app.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'In-Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Prescriptions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-md font-bold text-slate-800">Prescriptions Issued ({historyData.prescriptions?.length || 0})</h3>
                  <div className="space-y-4">
                    {historyData.prescriptions?.map((p) => (
                      <div key={p._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-700">Issued Date: {new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700"><span className="font-semibold">Treatment Notes:</span> {p.treatmentNotes}</p>
                        <div>
                          <p className="font-semibold text-slate-700 mb-1">Prescribed Medicines:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {p.medicines?.map((m, idx) => (
                              <div key={idx} className="bg-white p-2 rounded border border-slate-200 text-slate-700">
                                <p className="font-bold text-slate-800">{m.name} ({m.dosage})</p>
                                <p className="text-slate-500">{m.duration} — {m.instructions}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;