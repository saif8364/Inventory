const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategory.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateIdParam } = require('../middleware/validate.middleware');

// All sub-category routes require authentication
router.use(authenticate);

// GET /api/subcategories
router.get('/', subcategoryController.getAll);

// GET /api/subcategories/:id
router.get('/:id', validateIdParam, subcategoryController.getById);

// POST /api/subcategories
router.post('/', subcategoryController.create);

// PATCH /api/subcategories/:id
router.patch('/:id', validateIdParam, subcategoryController.update);

// DELETE /api/subcategories/:id
router.delete('/:id', validateIdParam, subcategoryController.delete);

module.exports = router;
