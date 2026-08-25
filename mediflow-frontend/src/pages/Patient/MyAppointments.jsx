import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointmentsApi, cancelAppointmentApi, getQueuePositionApi } from '../../services/appointmentService';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [file, setFile] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const { showToast } = useToast();

  const { user } = useAuth();
const [queueInfo, setQueueInfo] = useState({});

useEffect(() => {
  if (!user?._id) return;

  const socket = getSocket(user._id);

  socket.on('queue_position_update', (data) => {
    setQueueInfo((prev) => ({ ...prev, [data.appointmentId]: data }));
  });

  return () => {
    socket.off('queue_position_update');
  };
}, [user]);

const fetchAppointments = async () => {
  try {
    setLoading(true);
    const res = await getMyAppointmentsApi();

    const dataArray = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : [];

    setAppointments(dataArray);

    // Fetch initial queue position for each active appointment
    dataArray.forEach((app) => {
      if (app.status === 'Scheduled' || app.status === 'In-Progress') {
        getQueuePositionApi(app._id)
          .then((res) => {
            const { patientsAhead } = res.data;
            setQueueInfo((prev) => ({
              ...prev,
              [app._id]: {
                appointmentId: app._id,
                patientsAhead,
                message:
                  patientsAhead === 0
                    ? "You're next in the queue!"
                    : `${patientsAhead} patient${patientsAhead > 1 ? 's' : ''} ahead of you`
              }
            }));
          })
          .catch(() => {}); // silently skip if this one fails, don't block the page
      }
    });
  } catch (err) {
    showToast('Failed to load your appointments', 'error');
    setAppointments([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAppointments();
}, []);

  const handleCancel = async (id) => {
    try {
      await cancelAppointmentApi(id);
      showToast('Appointment cancelled successfully', 'success');
      fetchAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    }
  };

 const handleUploadReport = async (e) => {
  e.preventDefault();
  if (!file) {
    showToast('Please select a file to upload', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('report', file);
  formData.append('title', reportTitle);

  try {
    await API.post(`/appointments/${uploadingId}/lab-reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    showToast('Lab report uploaded successfully', 'success');
    setUploadingId(null);
    setFile(null);
    setReportTitle('');
    fetchAppointments();
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to upload lab report', 'error');
  }
};

  // Safe array fallback before mapping
  const safeList = Array.isArray(appointments) ? appointments : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Medical Appointments</h1>
        <p className="text-sm text-slate-500">Track consultation history, view status updates, and upload lab reports</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading appointments...</div>
      ) : safeList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
          No appointments found. Use the Doctor Directory to book a consultation.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeList.map((app) => (
            <div key={app._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Dr. {app.doctor?.userId?.name || app.doctorId?.userId?.name || 'Assigned Specialist'}
                  </h3>
                  <p className="text-xs text-slate-500">{app.department?.name || 'General Consultation'}</p>
                </div>
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
              </div>
              {(app.status === 'Scheduled' || app.status === 'In-Progress') && queueInfo[app._id] && (
  <p className="text-xs text-blue-600 font-semibold mt-1">
    🔔 {queueInfo[app._id].message}
  </p>
)}

              <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg">
                <p><span className="font-semibold text-slate-700">Date:</span> {new Date(app.appointmentDate || app.date).toLocaleDateString()}</p>
                <p><span className="font-semibold text-slate-700">Time Slot:</span> {app.timeSlot || app.time}</p>
                {app.reason && <p><span className="font-semibold text-slate-700">Reason:</span> {app.reason}</p>}
              </div>

              {/* Lab Reports Section */}
              {app.labReports && app.labReports.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Attached Lab Reports:</span>
                  <div className="flex flex-wrap gap-1">
                    {app.labReports.map((report, idx) => (
                      <a
                        key={idx}
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium hover:underline"
                      >
                        📄 {report.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t text-xs">
                {app.status !== 'Cancelled' && app.status !== 'completed' && app.status !== 'Completed' && (
                  <button
                    onClick={() => handleCancel(app._id)}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Cancel Booking
                  </button>
                )}

                <button
                  onClick={() => setUploadingId(app._id)}
                  className="text-blue-600 hover:underline font-semibold ml-auto"
                >
                  + Upload Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Upload Lab Report</h3>
            <form onSubmit={handleUploadReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Report Title</label>
                <input
                  type="text"
                  placeholder="e.g. Blood Test Results"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">File (PDF or Image)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-slate-600"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadingId(null)}
                  className="px-4 py-2 border rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;