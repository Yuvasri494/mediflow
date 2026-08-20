import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

const PrescriptionModal = ({ appointment, onClose }) => {
  const printRef = useRef();

  const handleDownloadPDF = () => {
    const element = printRef.current;
    const opt = {
      margin: 10,
      filename: `MediFlow_Prescription_${appointment._id.slice(-6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const { prescription, doctor, department, appointmentDate } = appointment;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl overflow-y-auto max-h-[90vh]">
        
        {/* Printable Prescription Content */}
        <div ref={printRef} className="p-6 border rounded-lg bg-white space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-600">MediFlow Healthcare Center</h2>
              <p className="text-xs text-slate-500">123 Health Avenue, Medical Zone • Phone: +91 98765 43210</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">OFFICIAL PRESCRIPTION</span>
              <p className="text-xs text-slate-500 mt-1">Date: {new Date(appointmentDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Doctor & Department details */}
          <div className="grid grid-cols-2 text-sm border-b pb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Attending Doctor</p>
              <p className="font-bold">Dr. {doctor?.userId?.name}</p>
              <p className="text-xs text-slate-500">{department?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Diagnosis</p>
              <p className="font-semibold text-slate-800">{prescription?.diagnosis || 'General Checkup'}</p>
            </div>
          </div>

          {/* Medications Table */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Prescribed Medications</h4>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-xs text-slate-500">
                  <th className="p-2">Medicine Name</th>
                  <th className="p-2">Dosage</th>
                  <th className="p-2">Frequency</th>
                  <th className="p-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription?.medications?.map((med, idx) => (
                  <tr key={idx} className="border-b text-xs">
                    <td className="p-2 font-semibold">{med.name}</td>
                    <td className="p-2">{med.dosage}</td>
                    <td className="p-2">{med.frequency}</td>
                    <td className="p-2">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          {prescription?.instructions && (
            <div className="border-t pt-3">
              <p className="text-xs text-slate-400 uppercase font-semibold">Doctor Instructions</p>
              <p className="text-xs italic text-slate-600">{prescription.instructions}</p>
            </div>
          )}

          {/* Footer Signature */}
          <div className="pt-8 border-t flex justify-between items-end">
            <p className="text-[10px] text-slate-400">Generated digitally via MediFlow E-Health Record</p>
            <div className="text-center">
              <div className="font-italic text-sm font-semibold border-b border-slate-400 pb-1">Dr. {doctor?.userId?.name}</div>
              <p className="text-[10px] text-slate-400">Authorized Medical Signature</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium">Close</button>
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm">
            📥 Download PDF Prescription
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;