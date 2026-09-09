const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const autoFallback = require('./middleware/autoFallback');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(autoFallback);

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect Database
connectDB();

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Corporate HR & Payroll Management System API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes as specified in CIA-3 specification
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/profile', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/hr/reports', reportRoutes);

// Fallback to Angular frontend for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found`,
      errorCode: 'NOT_FOUND'
    });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Corporate HR & Payroll Management System (P04)`);
  console.log(` Server active on port: ${PORT}`);
  console.log(` Web UI: http://localhost:${PORT}`);
  console.log(` API Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
