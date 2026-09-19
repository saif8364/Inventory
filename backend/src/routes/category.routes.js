const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireSuperAdmin } = require('../middleware/role.middleware');
const { validateIdParam } = require('../middleware/validate.middleware');

// All category routes require authentication
router.use(authenticate);

// GET /api/categories
router.get('/', categoryController.getAll);

// GET /api/categories/:id
router.get('/:id', validateIdParam, categoryController.getById);

// POST /api/categories (SUPER_ADMIN only)
router.post('/', requireSuperAdmin, categoryController.create);

// PATCH /api/categories/:id (SUPER_ADMIN only)
router.patch('/:id', requireSuperAdmin, validateIdParam, categoryController.update);

// DELETE /api/categories/:id (SUPER_ADMIN only)
router.delete('/:id', requireSuperAdmin, validateIdParam, categoryController.delete);

module.exports = router;
