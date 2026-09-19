const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateIdParam } = require('../middleware/validate.middleware');

// All history routes require authentication
router.use(authenticate);

// GET /api/history
router.get('/', historyController.getAll);

// GET /api/history/:id
router.get('/:id', validateIdParam, historyController.getById);

module.exports = router;
