const itemService = require('../services/item.service');
const { success, successWithPagination } = require('../utils/response');

const itemController = {
  async getAll(req, res, next) {
    try {
      const { search, category, subCategory, page = 1, limit = 20 } = req.query;

      const result = await itemService.getAll({
        search,
        category,
        subCategory,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        user: req.user,
      });

      return successWithPagination(res, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await itemService.getById(req.params.id, req.user);
      return success(res, item);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const item = await itemService.create(req.body, req.user);
      return success(res, item, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const item = await itemService.update(req.params.id, req.body, req.user);
      return success(res, item);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await itemService.delete(req.params.id, req.user);
      return success(res, { message: 'Item deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async updateQuantity(req, res, next) {
    try {
      const { quantity } = req.body;
      const item = await itemService.updateQuantity(req.params.id, quantity, req.user);
      return success(res, item);
    } catch (err) {
      next(err);
    }
  },

  async getDashboardStats(req, res, next) {
    try {
      const stats = await itemService.getDashboardStats(req.user);
      return success(res, stats);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = itemController;
