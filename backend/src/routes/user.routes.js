const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireSuperAdmin } = require('../middleware/role.middleware');
const { validateIdParam } = require('../middleware/validate.middleware');

// All user routes require SUPER_ADMIN
router.use(authenticate, requireSuperAdmin);

// GET /api/users
router.get('/', userController.getAll);

// GET /api/users/:id
router.get('/:id', validateIdParam, userController.getById);

// POST /api/users
router.post('/', userController.create);

// PATCH /api/users/:id
router.patch('/:id', validateIdParam, userController.update);

// DELETE /api/users/:id
router.delete('/:id', validateIdParam, userController.delete);

// PATCH /api/users/:id/status
router.patch('/:id/status', validateIdParam, userController.updateStatus);

module.exports = router;
