const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequired } = require('../middleware/validate.middleware');

// POST /api/auth/login
router.post('/login', validateRequired(['email', 'password']), authController.login);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.me);

module.exports = router;
