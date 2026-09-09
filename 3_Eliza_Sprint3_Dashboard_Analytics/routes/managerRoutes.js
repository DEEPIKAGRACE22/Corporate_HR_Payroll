const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('Manager', 'HR Admin'));

router.get('/team', managerController.getTeamMembers);
router.get('/team-attendance', managerController.getTeamAttendanceToday);
router.get('/team-leaves', managerController.getTeamLeaves);

module.exports = router;
