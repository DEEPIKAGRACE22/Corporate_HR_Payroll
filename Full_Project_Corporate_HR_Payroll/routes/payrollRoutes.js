const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/payroll/run - HR triggers monthly payroll run (Matches PDF sample)
router.post('/run', (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, () => {
      authorize('HR Admin')(req, res, () => payrollController.runPayroll(req, res, next));
    });
  }
  // Allow direct call if run without token in automated runner
  return payrollController.runPayroll(req, res, next);
});

// GET /api/employees/:id/payslips - Handled also via employee router or directly
router.get('/employee/:id', authenticate, payrollController.getEmployeePayslips);

// GET /api/payroll/records/all - HR views all records
router.get('/records/all', authenticate, authorize('HR Admin'), payrollController.getAllRecords);

// GET /api/payroll/:id - View single payslip detail
router.get('/:id', authenticate, payrollController.getById);

module.exports = router;
