const categoryService = require('../services/category.service');
const permissionService = require('../services/permission.service');
const { success } = require('../utils/response');

const categoryController = {
  async getAll(req, res, next) {
    try {
      let categories = await categoryService.getAll();

      // Filter by permission for normal users
      if (req.user.role !== 'SUPER_ADMIN') {
        const accessibleIds = await permissionService.getAccessibleCategoryIds(req.user.id, 'VIEW');
        categories = categories.filter((c) => accessibleIds.includes(c.id));
      }

      return success(res, categories);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      // Check permission
      if (req.user.role !== 'SUPER_ADMIN') {
        const hasAccess = await permissionService.hasCategoryAccess(req.user.id, req.params.id, 'VIEW');
        if (!hasAccess) {
          return res.status(403).json({ success: false, message: 'You do not have permission to view this category.' });
        }
      }

      const category = await categoryService.getById(req.params.id);
      return success(res, category);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const category = await categoryService.create({
        ...req.body,
        created_by: req.user.id,
      });
      return success(res, category, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      return success(res, category);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await categoryService.delete(req.params.id);
      return success(res, { message: 'Category deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = categoryController;
