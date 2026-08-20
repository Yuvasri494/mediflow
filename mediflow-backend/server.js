const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
connectDB();

const app = express();

// Create HTTP Server & Initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Make 'io' instance globally accessible across controllers via req.app.get('io')
app.set('io', io);

// Handle Real-Time WebSocket Connections
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Patient/User joins their personal notification room using their User ID
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined notification channel`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Middlewares - Enhanced CORS for Authorization Headers
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

// Health Check
app.get('/health', (req, res) => res.status(200).send('MediFlow API Server Active'));

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`MediFlow Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});