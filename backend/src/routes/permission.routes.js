const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireSuperAdmin } = require('../middleware/role.middleware');

// All permission routes require SUPER_ADMIN
router.use(authenticate, requireSuperAdmin);

// GET /api/users/:id/permissions
router.get('/:id/permissions', permissionController.getUserPermissions);

// POST /api/users/:id/permissions
router.post('/:id/permissions', permissionController.setPermission);

// PATCH /api/users/:id/permissions/:categoryId
router.patch('/:id/permissions/:categoryId', permissionController.updatePermission);

// DELETE /api/users/:id/permissions/:categoryId
router.delete('/:id/permissions/:categoryId', permissionController.removePermission);

module.exports = router;
