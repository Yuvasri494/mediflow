# 🏥 MediFlow — Hospital Management System

MediFlow is a full-stack hospital management platform that connects **Patients**, **Doctors**, and **Admins** on a single system — enabling appointment booking, digital prescriptions, live consultation queues, and department/staff management.

---

## ✨ Features

### 👤 Patient Portal
- **Multi-step appointment booking** — select department → choose doctor → pick date & dynamic time slot → confirm
- **Live queue tracking** — real-time "X patients ahead of you" updates via Socket.io while waiting
- **PDF prescription download** — export official prescriptions with hospital letterhead, dosage tables, and doctor details (via `html2pdf.js`)
- **Lab report uploads** — attach and view diagnostic PDF/image reports per appointment
- **Real-time notifications** — instant toast alerts when an appointment status changes

### 🩺 Doctor Portal
- **Consultation desk** — view daily patient queue, update status (Scheduled → In-Progress → Completed/Cancelled)
- **Digital prescriptions** — issue medicines, dosage, frequency, and treatment notes per consultation
- **Patient medical history** — view a patient's past appointments and prescriptions before consultation

### 🛠️ Admin Dashboard
- **Doctor management** — register new doctors, assign departments, toggle active status
- **Department management** — create, edit, and manage hospital departments
- **Patient directory** — view all registered patients
- **Appointment oversight** — view all appointments across the system
- **Analytics dashboard** — visual charts (Chart.js) for registrations, department allocation, and more

---

## 🧰 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios
- Socket.io-client
- html2pdf.js

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time updates)
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing

---

## 📁 Project Structure

```
MediFlow/
├── mediflow-backend/
│   ├── config/          # Database connection config
│   ├── controllers/     # Route logic (auth, appointments, doctor, admin)
│   ├── middleware/       # Auth middleware, error handling
│   ├── models/           # Mongoose schemas (User, Doctor, Patient, Appointment, Department, Prescription)
│   ├── routes/            # Express route definitions
│   ├── utils/             # Helpers (token generation, async handler, email)
│   ├── seed.js             # Database seeding script
│   └── server.js           # App entry point
│
└── src/
    ├── components/       # Shared components (Navbar, Sidebar, Modals, Notifications)
    ├── context/            # React Context (Auth, Toast)
    ├── layouts/             # Dashboard layout wrapper
    ├── pages/
    │   ├── Admin/           # Admin dashboard pages
    │   ├── Auth/             # Login, Register, Password Reset
    │   ├── Doctor/           # Doctor dashboard & medical records
    │   └── Patient/          # Patient booking, appointments, prescriptions
    └── services/             # API service layer (axios calls per module)
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local instance or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Yuvasri494/mediflow.git
cd mediflow
```

### 2. Backend Setup
```bash
cd mediflow-backend
npm install
```

Create a `.env` file in `mediflow-backend/` with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

Seed the database with initial data (creates admin, doctor, patient accounts + departments):
```bash
node seed.js
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd MediFlow
npm install
```

Create a `.env` file in the project root with:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Default Seeded Accounts

After running `node seed.js`, use these credentials to log in:

| Role    | Email                  | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@mediflow.com     | Admin@123    |
| Doctor  | doctor@mediflow.com    | Doctor@123   |
| Patient | patient@mediflow.com   | Patient@123  |

> ⚠️ Re-running `seed.js` wipes and recreates all data. If you're logged in, log out and back in afterward, as old sessions become invalid.

---

## 🔌 Real-Time Features (Socket.io)

MediFlow uses Socket.io for two live features:
1. **Appointment status notifications** — patients get instant toast alerts when their appointment status changes or a prescription is added
2. **Live queue position** — patients see a live "X patients ahead of you" indicator that updates automatically as the doctor works through the day's appointments

Each logged-in user joins a private room (keyed by their user ID) so updates are delivered only to the relevant patient.

---

## 🗺️ API Overview

| Module        | Base Route          |
|---------------|----------------------|
| Auth          | `/api/auth`          |
| Appointments  | `/api/appointments`  |
| Doctor        | `/api/doctor`         |
| Admin         | `/api/admin`           |
| Departments   | `/api/departments`     |

All protected routes require a `Bearer <token>` in the `Authorization` header, obtained via `/api/auth/login`.

---

## 🚧 Roadmap / Planned Enhancements

- [ ] Doctor slot & schedule manager (custom weekly availability)
- [ ] Automated email reminders via `node-cron` (24hrs before appointment)
- [ ] System audit logs for admin actions

---

## 📄 License

This project is for educational/portfolio purposes.

---

## 🙋 Author

Built as a personal full-stack project to demonstrate real-world patterns: JWT authentication, role-based access control, real-time updates with WebSockets, PDF generation, and multi-portal application architecture.
