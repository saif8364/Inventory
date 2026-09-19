const permissionService = require('../services/permission.service');
const { success } = require('../utils/response');

const permissionController = {
  async getUserPermissions(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const permissions = await permissionService.getUserPermissions(userId);
      return success(res, permissions);
    } catch (err) {
      next(err);
    }
  },

  async setPermission(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { category_id, permission } = req.body;

      if (!category_id || !permission) {
        return res.status(400).json({ success: false, message: 'category_id and permission are required.' });
      }

      const result = await permissionService.setPermission(userId, parseInt(category_id, 10), permission);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async updatePermission(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const categoryId = parseInt(req.params.categoryId, 10);
      const { permission } = req.body;

      if (!permission) {
        return res.status(400).json({ success: false, message: 'permission is required.' });
      }

      const result = await permissionService.setPermission(userId, categoryId, permission);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async removePermission(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const categoryId = parseInt(req.params.categoryId, 10);
      await permissionService.removePermission(userId, categoryId);
      return success(res, { message: 'Permission removed successfully.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = permissionController;
