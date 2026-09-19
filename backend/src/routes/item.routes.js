const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateIdParam } = require('../middleware/validate.middleware');

// All item routes require authentication
router.use(authenticate);

// GET /api/dashboard
router.get('/dashboard', itemController.getDashboardStats);

// GET /api/items
router.get('/', itemController.getAll);

// GET /api/items/:id
router.get('/:id', validateIdParam, itemController.getById);

// POST /api/items
router.post('/', itemController.create);

// PATCH /api/items/:id
router.patch('/:id', validateIdParam, itemController.update);

// DELETE /api/items/:id
router.delete('/:id', validateIdParam, itemController.delete);

// PATCH /api/items/:id/quantity
router.patch('/:id/quantity', validateIdParam, itemController.updateQuantity);

module.exports = router;
