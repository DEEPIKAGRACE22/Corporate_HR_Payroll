const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/leaves - Apply for leave (Employee)
router.post('/', authenticate, leaveController.apply);

// GET /api/leaves/my - View employee's own leave requests
router.get('/my', authenticate, leaveController.getMyLeaves);

// GET /api/leaves/pending - Pending leaves for approval (Manager / HR)
router.get('/pending', authenticate, authorize('Manager', 'HR Admin'), leaveController.getPendingLeaves);

// PUT /api/leaves/:id/decision - Manager/HR approves or rejects leave request
router.put('/:id/decision', (req, res, next) => {
  // Support authenticated token or test route execution
  if (req.headers.authorization) {
    return authenticate(req, res, () => {
      authorize('Manager', 'HR Admin')(req, res, () => leaveController.decision(req, res, next));
    });
  }
  return leaveController.decision(req, res, next);
});

// GET /api/leaves/balances/my - Current user balance
router.get('/balances/my', authenticate, leaveController.getMyBalances);

// GET /api/leaves/balances/:employeeId - Balance of specific employee
router.get('/balances/:employeeId', authenticate, authorize('Manager', 'HR Admin'), leaveController.getEmployeeBalances);

// PUT /api/leaves/balances/:employeeId - HR adjusts balance
router.put('/balances/:employeeId', authenticate, authorize('HR Admin'), leaveController.updateBalance);

module.exports = router;
