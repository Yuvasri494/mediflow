import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartmentsApi } from '../../services/departmentService';
import { getAvailableSlotsApi, bookAppointmentApi } from '../../services/appointmentService';
import { browseDoctorsApi } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load Departments
  useEffect(() => {
    getDepartmentsApi()
      .then((res) => setDepartments((res.data || res).filter((d) => d.status === 'Active')))
      .catch(() => showToast('Failed to load departments', 'error'));
  }, []);

  // Fetch doctors matching selected department
 const handleSelectDepartment = async (deptId) => {
  setSelectedDept(deptId);
  setLoading(true);
  try {
    const res = await browseDoctorsApi();
    const allDocs = res.data || res || [];
    const filteredDocs = allDocs.filter(
      (doc) => doc.department?._id === deptId || doc.department === deptId
    );
    setDoctors(filteredDocs);
    setStep(2);
  } catch (err) {
    showToast('Failed to fetch doctors for this department', 'error');
  } finally {
    setLoading(false);
  }
};

  // Fetch slots on date change
  const handleDateChange = async (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot('');
    if (!selectedDoc || !dateStr) return;
    setLoading(true);
    try {
      const res = await getAvailableSlotsApi(selectedDoc, dateStr);
      setSlots(res.availableSlots || res.data?.availableSlots || []);
    } catch (err) {
      showToast('Error loading available slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !reason.trim()) {
      showToast('Please select a slot and state your reason for visit', 'error');
      return;
    }

    setLoading(true);
    try {
      await bookAppointmentApi({
        departmentId: selectedDept,
        doctorId: selectedDoc,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reason
      });
      showToast('Appointment booked successfully!', 'success');
      navigate('/patient/appointments');
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Book an Appointment</h1>
        <p className="text-sm text-slate-500">Select department, doctor, and preferred time slot</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-8">
        {['1. Department', '2. Choose Doctor', '3. Select Slot & Confirm'].map((label, idx) => (
          <div
            key={idx}
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* STEP 1: Select Department */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              onClick={() => handleSelectDepartment(dept._id)}
              className="bg-white p-5 border rounded-xl hover:border-blue-500 cursor-pointer transition-all shadow-sm space-y-2"
            >
              <h3 className="font-bold text-slate-800">{dept.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{dept.description || 'Clinical specialty care'}</p>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2: Choose Doctor */}
      {step === 2 && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-xs text-blue-600 font-semibold mb-2">&larr; Change Department</button>
          {doctors.length === 0 ? (
            <div className="p-8 text-center bg-white border rounded-xl text-slate-500 text-sm">No doctors available in this department right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => { setSelectedDoc(doc._id); setStep(3); }}
                  className="bg-white p-4 border rounded-xl hover:border-blue-500 cursor-pointer flex items-center space-x-4 shadow-sm"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    Dr
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Dr. {doc.userId?.name}</h4>
                    <p className="text-xs text-slate-500">{doc.qualification} • Fee: ₹{doc.consultationFee}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Pick Date, Slot & Confirm */}
      {step === 3 && (
        <form onSubmit={handleConfirmBooking} className="bg-white p-6 rounded-xl border space-y-4 max-w-lg mx-auto shadow-sm">
          <button type="button" onClick={() => setStep(2)} className="text-xs text-blue-600 font-semibold mb-2">&larr; Back to Doctors</button>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Available Time Slots</label>
              {loading ? (
                <p className="text-xs text-slate-500">Checking slot availability...</p>
              ) : slots.length === 0 ? (
                <p className="text-xs text-red-500">No slots open on this date.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 text-xs border rounded-lg font-medium transition-colors ${
                        selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
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
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason for Consultation</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms (e.g., persistent fever, headache)..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedSlot}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Confirm & Book Appointment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookAppointment;