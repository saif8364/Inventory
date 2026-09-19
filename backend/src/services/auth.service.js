const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const authService = {
  /**
   * Authenticate a user with email and password.
   * Returns a JWT token and user info.
   */
  async login(email, password) {
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required.' };
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    if (!user.is_active) {
      throw { status: 403, message: 'Your account has been deactivated. Contact an administrator.' };
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  /**
   * Get the current authenticated user's profile.
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }
    return user;
  },
};

module.exports = authService;
