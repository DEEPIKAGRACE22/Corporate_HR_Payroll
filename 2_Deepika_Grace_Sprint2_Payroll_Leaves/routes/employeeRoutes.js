const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const payrollController = require('../controllers/payrollController');
const { authenticate } = require('../middleware/auth');

// Self-service profile routes
router.get('/profile', authenticate, employeeController.getProfile);
router.put('/profile', authenticate, employeeController.updateProfile);
router.put('/profile/change-password', authenticate, employeeController.changePassword);

// Exact match for PDF sample endpoint: GET /api/employees/:id/payslips
router.get('/:id/payslips', authenticate, payrollController.getEmployeePayslips);

module.exports = router;
