const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/attendance/clockin - Employee clocks in (Can also be called directly with employeeId for API tests as in PDF)
router.post('/clockin', (req, res, next) => {
  // Optional auth header support; if Bearer token present, authenticate, else allow if employeeId provided in body
  if (req.headers.authorization) {
    return authenticate(req, res, () => attendanceController.clockIn(req, res, next));
  }
  return attendanceController.clockIn(req, res, next);
});

// POST /api/attendance/clockout - Employee clocks out
router.post('/clockout', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, () => attendanceController.clockOut(req, res, next));
  }
  return attendanceController.clockOut(req, res, next);
});

// GET /api/attendance/my - View personal attendance history
router.get('/my', authenticate, attendanceController.getMyAttendance);

// GET /api/attendance/today - View current status for today
router.get('/today', authenticate, attendanceController.getTodayStatus);

// GET /api/attendance/all - HR and Managers can view attendance
router.get('/all', authenticate, authorize('HR Admin', 'Manager'), attendanceController.getAll);

module.exports = router;
