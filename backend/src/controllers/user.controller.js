const userService = require('../services/user.service');
const { success } = require('../utils/response');

const userController = {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAll();
      return success(res, users);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      return success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      return success(res, user, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);
      return success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id, req.user.id);
      return success(res, { message: 'User deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { is_active } = req.body;
      const user = await userService.updateStatus(req.params.id, is_active);
      return success(res, user);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;
