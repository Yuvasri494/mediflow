import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getAdminAnalyticsApi } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalPatients: 124,
    totalDoctors: 18,
    totalDepartments: 6,
    totalAppointments: 342,
    departmentDistribution: {
      labels: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine'],
      counts: [4, 3, 3, 2, 3, 3]
    },
    appointmentStatuses: {
      labels: ['Completed', 'Scheduled', 'In-Progress', 'Cancelled'],
      counts: [180, 95, 42, 25]
    },
    monthlyTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      registrations: [12, 19, 25, 32, 48, 65]
    }
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

      useEffect(() => {
    setLoading(true);
    getAdminAnalyticsApi()
      .then((res) => {
        const payload = res?.data;
        if (payload && payload.departmentDistribution) {
          setAnalyticsData((prev) => ({ ...prev, ...payload }));
        }
      })
      .catch(() => {
        showToast('Using fallback analytics dataset', 'info');
      })
      .finally(() => setLoading(false));
  }, []);

  // Chart Config 1: Department Doctor Allocation (Bar Chart)
  const barChartData = {
    labels: analyticsData.departmentDistribution.labels,
    datasets: [
      {
        label: 'Assigned Doctors',
        data: analyticsData.departmentDistribution.counts,
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  // Chart Config 2: Appointment Status Distribution (Doughnut Chart)
  const doughnutChartData = {
    labels: analyticsData.appointmentStatuses.labels,
    datasets: [
      {
        data: analyticsData.appointmentStatuses.counts,
        backgroundColor: [
          '#10b981', // Completed (Emerald)
          '#3b82f6', // Scheduled (Blue)
          '#f59e0b', // In-Progress (Amber)
          '#ef4444'  // Cancelled (Red)
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Chart Config 3: Monthly Patient Registrations (Line Chart)
  const lineChartData = {
    labels: analyticsData.monthlyTrends.labels,
    datasets: [
      {
        label: 'New Patient Registrations',
        data: analyticsData.monthlyTrends.registrations,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#0891b2'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Analytics Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time clinical metrics, staff allocation, and patient volume trends</p>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Patients</span>
          <p className="text-2xl font-bold text-slate-800">{analyticsData.totalPatients}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Active Doctors</span>
          <p className="text-2xl font-bold text-blue-600">{analyticsData.totalDoctors}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Departments</span>
          <p className="text-2xl font-bold text-emerald-600">{analyticsData.totalDepartments}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Appointments</span>
          <p className="text-2xl font-bold text-amber-600">{analyticsData.totalAppointments}</p>
        </div>
      </div>

      {/* Charts Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Doctors per Department */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Doctor Allocation by Department</h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart: Appointment Status Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Appointment Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </div>
        </div>

        {/* Line Chart: Growth Trend */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Monthly Patient Acquisition Trend</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;