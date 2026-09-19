const subcategoryService = require('../services/subcategory.service');
const permissionService = require('../services/permission.service');
const { success } = require('../utils/response');

const subcategoryController = {
  async getAll(req, res, next) {
    try {
      const filters = {};
      if (req.query.category_id) {
        filters.category_id = parseInt(req.query.category_id, 10);
      }

      // Filter by accessible categories for normal users
      if (req.user.role !== 'SUPER_ADMIN') {
        const accessibleIds = await permissionService.getAccessibleCategoryIds(req.user.id, 'VIEW');
        if (filters.category_id) {
          if (!accessibleIds.includes(filters.category_id)) {
            return success(res, []);
          }
        } else {
          filters.categoryIds = accessibleIds;
        }
      }

      const subcategories = await subcategoryService.getAll(filters);
      return success(res, subcategories);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const subcategory = await subcategoryService.getById(req.params.id);

      // Check permission
      if (req.user.role !== 'SUPER_ADMIN') {
        const hasAccess = await permissionService.hasCategoryAccess(req.user.id, subcategory.category_id, 'VIEW');
        if (!hasAccess) {
          return res.status(403).json({ success: false, message: 'You do not have permission to view this sub-category.' });
        }
      }

      return success(res, subcategory);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const categoryId = parseInt(req.body.category_id, 10);

      // Check EDIT permission on the parent category
      if (req.user.role !== 'SUPER_ADMIN') {
        const hasAccess = await permissionService.hasCategoryAccess(req.user.id, categoryId, 'EDIT');
        if (!hasAccess) {
          return res.status(403).json({ success: false, message: 'You do not have edit permission for this category.' });
        }
      }

      const subcategory = await subcategoryService.create({
        ...req.body,
        category_id: categoryId,
        created_by: req.user.id,
      });
      return success(res, subcategory, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const subcategory = await subcategoryService.getById(req.params.id);

      // Check EDIT permission on the parent category
      if (req.user.role !== 'SUPER_ADMIN') {
        const hasAccess = await permissionService.hasCategoryAccess(req.user.id, subcategory.category_id, 'EDIT');
        if (!hasAccess) {
          return res.status(403).json({ success: false, message: 'You do not have edit permission for this category.' });
        }
      }

      const updated = await subcategoryService.update(req.params.id, req.body);
      return success(res, updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const subcategory = await subcategoryService.getById(req.params.id);

      // Check EDIT permission on the parent category
      if (req.user.role !== 'SUPER_ADMIN') {
        const hasAccess = await permissionService.hasCategoryAccess(req.user.id, subcategory.category_id, 'EDIT');
        if (!hasAccess) {
          return res.status(403).json({ success: false, message: 'You do not have edit permission for this category.' });
        }
      }

      await subcategoryService.delete(req.params.id);
      return success(res, { message: 'Sub-category deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = subcategoryController;
