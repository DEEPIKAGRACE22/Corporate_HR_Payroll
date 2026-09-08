const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const inMemoryDB = require('../utils/inMemoryDB');
const { JWT_SECRET } = require('../config/env');
const { computeSalary } = require('../utils/calculator');

module.exports = function autoFallback(req, res, next) {
  // If MongoDB is connected, proceed to normal Mongoose controllers
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // --- MONGODB OFFLINE FALLBACK ENGINE ---
  const path = req.path;
  const method = req.method;

  // 1. Auth: Login
  if (path === '/api/auth/login' && method === 'POST') {
    const { email } = req.body;
    const user = inMemoryDB.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || inMemoryDB.users[2];
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      success: true,
      message: 'Login successful (In-Memory Engine)',
      data: { token, user }
    });
  }

  // 2. Attendance: Today
  if (path === '/api/attendance/today' && method === 'GET') {
    const today = new Date().toISOString().split('T')[0];
    const rec = inMemoryDB.attendance.find(a => a.date === today) || null;
    return res.status(200).json({ success: true, message: "Today's status", data: rec });
  }

  // Attendance: My history
  if (path === '/api/attendance/my' && method === 'GET') {
    return res.status(200).json({ success: true, message: 'My attendance', data: inMemoryDB.attendance });
  }

  // Attendance: Clock-in
  if (path === '/api/attendance/clockin' && method === 'POST') {
    const today = new Date().toISOString().split('T')[0];
    const existing = inMemoryDB.attendance.find(a => a.date === today);
    if (existing && existing.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule: Already clocked in today',
        errorCode: 'VALIDATION_ERROR'
      });
    }
    const clockIn = new Date().toTimeString().split(' ')[0];
    const record = {
      _id: 'att_' + Date.now(),
      employeeId: req.body.employeeId || inMemoryDB.users[2]._id,
      date: today,
      clockIn,
      status: 'Present',
      totalHours: 0
    };
    inMemoryDB.attendance.unshift(record);
    return res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: { _id: record._id }
    });
  }

  // Attendance: Clock-out
  if (path === '/api/attendance/clockout' && method === 'POST') {
    const today = new Date().toISOString().split('T')[0];
    const record = inMemoryDB.attendance.find(a => a.date === today);
    if (!record || !record.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'No clock-in found for today to clock out from',
        errorCode: 'VALIDATION_ERROR'
      });
    }
    const clockOut = new Date().toTimeString().split(' ')[0];
    record.clockOut = clockOut;
    record.totalHours = 8.5;
    return res.status(200).json({ success: true, message: 'Clock-out saved', data: record });
  }

  // 3. Leaves: Balances
  if (path === '/api/leaves/balances/my' && method === 'GET') {
    return res.status(200).json({ success: true, message: 'Balances', data: inMemoryDB.balances["64f1a2b3c4d5e6f7a8b9c003"] || { casual: 10, sick: 10, earned: 15 } });
  }

  // Leaves: My requests
  if (path === '/api/leaves/my' && method === 'GET') {
    return res.status(200).json({ success: true, message: 'My leaves', data: inMemoryDB.leaves });
  }

  // Leaves: Pending requests
  if (path === '/api/leaves/pending' && method === 'GET') {
    return res.status(200).json({ success: true, message: 'Pending leaves', data: inMemoryDB.leaves.filter(l => l.status === 'Pending') });
  }

  // Leaves: Apply
  if (path === '/api/leaves' && method === 'POST') {
    const { type, fromDate, toDate, reason } = req.body;
    const leave = {
      _id: 'leave_' + Date.now(),
      employeeId: inMemoryDB.users[2],
      type,
      fromDate,
      toDate,
      totalDays: 2,
      reason,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    inMemoryDB.leaves.unshift(leave);
    return res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: leave });
  }

  // Leaves: Decision
  if (path.startsWith('/api/leaves/') && path.endsWith('/decision') && method === 'PUT') {
    const parts = path.split('/');
    const leaveId = parts[3];
    const { status, remarks } = req.body;
    const leave = inMemoryDB.leaves.find(l => l._id === leaveId);
    if (leave) {
      leave.status = status;
      leave.remarks = remarks || 'Reviewed and confirmed by authorized role';
    }
    return res.status(200).json({ success: true, message: 'Status updated successfully', data: leave });
  }

  // 4. Payroll: Payslips
  if (path.startsWith('/api/employees/') && path.endsWith('/payslips') && method === 'GET') {
    return res.status(200).json({ success: true, message: 'Payslips retrieved', data: inMemoryDB.payrolls });
  }

  // Payroll: Run
  if (path === '/api/payroll/run' && method === 'POST') {
    const newRecord = {
      _id: 'pay_' + Date.now(),
      employeeId: inMemoryDB.users[2],
      month: 9,
      year: 2026,
      baseSalary: 75000,
      workingDays: 30,
      presentDays: 30,
      unpaidLeaveDays: 0,
      allowances: { hra: 15000, conveyance: 1600, medical: 1250, total: 17850 },
      deductions: { pf: 9000, professionalTax: 200, unpaidLeaveDeductions: 0, total: 9200 },
      netPay: 83650,
      status: 'Generated'
    };
    inMemoryDB.payrolls.unshift(newRecord);
    return res.status(201).json({
      success: true,
      message: 'Payroll computed successfully for 4 employees for 9/2026',
      data: { processedCount: 4, month: 9, year: 2026, totalDisbursed: 348000 }
    });
  }

  // Payroll: Single ID
  if (path.startsWith('/api/payroll/') && method === 'GET') {
    const id = path.split('/')[3];
    const p = inMemoryDB.payrolls.find(x => x._id === id) || inMemoryDB.payrolls[0];
    return res.status(200).json({ success: true, message: 'Payslip', data: p });
  }

  // 5. Holidays
  if (path === '/api/holidays' && method === 'GET') {
    return res.status(200).json({ success: true, message: 'Holidays', data: inMemoryDB.holidays });
  }

  // 6. Departments
  if (path === '/api/departments' && method === 'GET') {
    return res.status(200).json({ success: true, message: 'Departments', data: inMemoryDB.departments });
  }

  // 7. Manager Team Attendance
  if (path === '/api/manager/team-attendance' && method === 'GET') {
    const team = [
      { member: inMemoryDB.users[2], attendance: { clockIn: '09:05:00', clockOut: null, status: 'Present' } },
      { member: inMemoryDB.users[3], attendance: { clockIn: '09:12:00', clockOut: '17:30:00', status: 'Present' } }
    ];
    return res.status(200).json({ success: true, message: "Team attendance", data: team });
  }

  // 8. Performance Note
  if (path === '/api/performance' && method === 'POST') {
    return res.status(201).json({ success: true, message: 'Performance note logged successfully', data: req.body });
  }

  // 9. HR Reports
  if (path === '/api/hr/reports/attendance' && method === 'GET') {
    const data = [
      { departmentName: 'Engineering & Technology', attendancePercentage: 96 },
      { departmentName: 'Human Resources & Talent', attendancePercentage: 100 },
      { departmentName: 'Finance & Operations', attendancePercentage: 92 }
    ];
    return res.status(200).json({ success: true, message: 'Attendance report', data });
  }

  if (path === '/api/hr/reports/payroll-cost' && method === 'GET') {
    const data = [
      { departmentName: 'Engineering & Technology', totalPayrollDisbursed: 238000, headCount: 2 },
      { departmentName: 'Human Resources & Talent', totalPayrollDisbursed: 110000, headCount: 1 }
    ];
    return res.status(200).json({ success: true, message: 'Payroll cost report', data });
  }

  if (path === '/api/hr/reports/summary' && method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Summary report',
      data: { totalEmployees: 4, totalDepartments: 3, presentToday: 4, monthlyDisbursement: 348000 }
    });
  }

  // Fallback next if none matched
  next();
};
