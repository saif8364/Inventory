const authService = require('../services/auth.service');
const { success } = require('../utils/response');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      // JWT is stateless — logout is handled client-side by removing the token.
      return success(res, { message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return success(res, user);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
