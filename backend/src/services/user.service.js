const userRepository = require('../repositories/user.repository');
const permissionRepository = require('../repositories/permission.repository');
const { hashPassword } = require('../utils/password');

const userService = {
  async getAll() {
    return userRepository.findAll();
  },

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }
    return user;
  },

  async create({ name, email, password, role = 'USER' }) {
    if (!name || !email || !password) {
      throw { status: 400, message: 'Name, email, and password are required.' };
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw { status: 409, message: 'A user with this email already exists.' };
    }

    const validRoles = ['SUPER_ADMIN', 'USER'];
    if (!validRoles.includes(role)) {
      throw { status: 400, message: 'Invalid role. Must be SUPER_ADMIN or USER.' };
    }

    const password_hash = await hashPassword(password);

    return userRepository.create({
      name,
      email,
      password_hash,
      role,
    });
  },

  async update(id, data) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw { status: 409, message: 'A user with this email already exists.' };
      }
      updateData.email = data.email;
    }
    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
    }
    if (data.role) {
      const validRoles = ['SUPER_ADMIN', 'USER'];
      if (!validRoles.includes(data.role)) {
        throw { status: 400, message: 'Invalid role.' };
      }
      updateData.role = data.role;
    }

    return userRepository.update(id, updateData);
  },

  async updateStatus(id, is_active) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    if (user.role === 'SUPER_ADMIN') {
      throw { status: 403, message: 'Cannot change the status of a Super Admin.' };
    }

    return userRepository.update(id, { is_active });
  },

  async delete(id, requestingUserId) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    if (user.role === 'SUPER_ADMIN') {
      throw { status: 403, message: 'Cannot delete a Super Admin.' };
    }

    if (id === requestingUserId) {
      throw { status: 403, message: 'Cannot delete your own account.' };
    }

    // Delete permissions first
    await permissionRepository.deleteAllForUser(id);

    return userRepository.delete(id);
  },

  async count() {
    return userRepository.count();
  },
};

module.exports = userService;
