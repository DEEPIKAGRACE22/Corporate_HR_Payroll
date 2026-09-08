const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Manager and HR can log notes
router.post('/', authorize('Manager', 'HR Admin'), performanceController.logNote);

// Employee, Manager, HR can view notes for employee (if employee, can view own)
router.get('/:employeeId', (req, res, next) => {
  if (req.user.role === 'Employee' && req.user._id.toString() !== req.params.employeeId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own performance notes.',
      errorCode: 'FORBIDDEN'
    });
  }
  return performanceController.getByEmployee(req, res, next);
});

module.exports = router;
