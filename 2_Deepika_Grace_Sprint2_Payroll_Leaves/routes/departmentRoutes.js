const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

// All authenticated users can view departments
router.get('/', authenticate, departmentController.getAll);
router.get('/:id', authenticate, departmentController.getById);

// HR Admin only can create, update, delete departments
router.post('/', authenticate, authorize('HR Admin'), departmentController.create);
router.put('/:id', authenticate, authorize('HR Admin'), departmentController.update);
router.delete('/:id', authenticate, authorize('HR Admin'), departmentController.delete);

module.exports = router;
