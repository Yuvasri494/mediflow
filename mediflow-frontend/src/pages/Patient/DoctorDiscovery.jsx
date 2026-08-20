import React, { useState, useEffect } from 'react';
import { browseDoctorsApi } from '../../services/patientService';
import { getAvailableSlotsApi, bookAppointmentApi } from '../../services/appointmentService';
import { useToast } from '../../context/ToastContext';

const DoctorDiscovery = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { showToast } = useToast();

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await browseDoctorsApi(search, specialization);
      
      // Safely extract array payload
      const dataList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setDoctors(dataList);
    } catch (err) {
      showToast('Failed to load doctor directory', 'error');
      setDoctors([]); // Always fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization]);

  // Fetch Available Slots when Date Changes
  useEffect(() => {
    if (!selectedDoctor || !appointmentDate) return;

   const fetchSlots = async () => {
  try {
    setLoadingSlots(true);
    const res = await getAvailableSlotsApi(selectedDoctor._id, appointmentDate);
    const slots = res?.data?.availableSlots || res?.availableSlots || [];
    setAvailableSlots(slots);
  } catch (err) {
    showToast('Failed to fetch available slots', 'error');
    setAvailableSlots([]);
  } finally {
    setLoadingSlots(false);
  }
};

    fetchSlots();
  }, [selectedDoctor, appointmentDate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!timeSlot) {
      showToast('Please select a time slot', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      await bookAppointmentApi({
        doctorId: selectedDoctor._id,
        departmentId: selectedDoctor.department?._id || selectedDoctor.department,
        appointmentDate,
        timeSlot,
        reason
      });

      showToast('Appointment booked successfully!', 'success');
      setSelectedDoctor(null);
      setAppointmentDate('');
      setTimeSlot('');
      setReason('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book appointment', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  // Safe array fallback before mapping
  const safeDoctorsList = Array.isArray(doctors) ? doctors : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doctor Directory</h1>
        <p className="text-sm text-slate-500">Find specialists, check availability, and book consultations</p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search doctor by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Filter by specialization (e.g., Cardiology)..."
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Doctor List Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading specialist directory...</div>
      ) : safeDoctorsList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
          No doctors found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeDoctorsList.map((doc) => (
            <div key={doc._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg overflow-hidden">
                    {doc.userId?.profilePhoto ? (
                      <img src={doc.userId.profilePhoto} alt={doc.userId?.name} className="w-full h-full object-cover" />
                    ) : (
                      doc.userId?.name?.charAt(0) || 'D'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Dr. {doc.userId?.name || 'Specialist'}</h3>
                    <p className="text-xs text-blue-600 font-medium">{doc.specialization || doc.department?.name || 'General Practitioner'}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600 border-t pt-3">
                  <p><span className="font-semibold text-slate-700">Experience:</span> {doc.experience || 5} Years</p>
                  <p><span className="font-semibold text-slate-700">Consultation Fee:</span> ₹{doc.fees || 500}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoctor(doc)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Book Consultation
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">
              Book Appointment with Dr. {selectedDoctor.userId?.name || 'Specialist'}
            </h2>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Select Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>

              {appointmentDate && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Available Time Slot</label>
                  {loadingSlots ? (
                    <p className="text-slate-400 italic">Checking slot availability...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-red-500 font-medium">No slots available on this date. Please pick another date.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {availableSlots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`p-2 border rounded text-xs font-medium text-center transition ${
                            timeSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Consultation Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe symptoms or reason for visit..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 border rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || !timeSlot}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDiscovery;