const historyService = require('../services/history.service');
const { success, successWithPagination } = require('../utils/response');

const historyController = {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await historyService.getAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        user: req.user,
      });

      return successWithPagination(res, result.records, {
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
      const record = await historyService.getById(req.params.id, req.user);
      return success(res, record);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = historyController;
