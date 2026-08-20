import React, { useState, useEffect } from 'react';
import { getMyPrescriptionsApi } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const { showToast } = useToast();

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getMyPrescriptionsApi();

      // Safely extract array payload across API response structures
      const dataList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setPrescriptions(dataList);
    } catch (err) {
      showToast('Failed to load your prescriptions', 'error');
      setPrescriptions([]); // Fallback to empty array on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Defensive array fallback before mapping
  const safePrescriptionList = Array.isArray(prescriptions) ? prescriptions : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Medical Prescriptions</h1>
        <p className="text-sm text-slate-500">Access treatment notes and prescribed medication records from your doctors</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading prescriptions...</div>
      ) : safePrescriptionList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
          No prescriptions found in your medical records.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safePrescriptionList.map((pres) => {
            const doctorObj = pres.doctorId || pres.doctor;
            const doctorName = doctorObj?.userId?.name || doctorObj?.name || 'Assigned Doctor';
            const specialization = doctorObj?.specialization || 'General Consultation';

            return (
              <div key={pres._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800">Dr. {doctorName}</h3>
                      <p className="text-xs text-blue-600 font-medium">{specialization}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(pres.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  {pres.treatmentNotes && (
                    <div className="text-xs bg-slate-50 p-3 rounded-lg text-slate-700">
                      <span className="font-semibold block mb-1 text-slate-800">Clinical Notes:</span>
                      <p className="line-clamp-2">{pres.treatmentNotes}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-2">Prescribed Medicines:</span>
                    <div className="space-y-1.5">
                      {pres.medicines && pres.medicines.length > 0 ? (
                        pres.medicines.map((med, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-blue-50/50 p-2 rounded text-xs border border-blue-100">
                            <span className="font-semibold text-slate-800">{med.name}</span>
                            <span className="text-slate-500 text-[11px]">{med.dosage} ({med.frequency})</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific medicines listed.</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPrescription(pres)}
                  className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition mt-2"
                >
                  View Full Prescription Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Prescription Details</h3>
                <p className="text-xs text-slate-500">
                  Issued by Dr. {selectedPrescription.doctorId?.userId?.name || selectedPrescription.doctor?.userId?.name || 'Doctor'}
                </p>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {selectedPrescription.treatmentNotes && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase">Treatment Notes</span>
                <p className="text-xs bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed border">
                  {selectedPrescription.treatmentNotes}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Medication Schedule</span>
              <div className="space-y-2">
                {selectedPrescription.medicines?.map((med, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-slate-50 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{med.name}</span>
                      <span className="text-blue-600">{med.dosage}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Frequency: {med.frequency}</span>
                      <span>Duration: {med.duration || 'As directed'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;