const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, holidayController.getAll);
router.post('/', authenticate, authorize('HR Admin'), holidayController.create);
router.delete('/:id', authenticate, authorize('HR Admin'), holidayController.delete);

module.exports = router;
