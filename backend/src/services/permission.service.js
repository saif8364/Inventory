const permissionRepository = require('../repositories/permission.repository');
const userRepository = require('../repositories/user.repository');
const categoryRepository = require('../repositories/category.repository');

const permissionService = {
  /**
   * Check if a user has the required permission level for a category.
   * SUPER_ADMIN always has access.
   */
  async hasCategoryAccess(userId, categoryId, requiredPermission = 'VIEW') {
    // Get user to check role
    const user = await userRepository.findById(userId);
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    const perm = await permissionRepository.findByUserAndCategory(userId, categoryId);
    if (!perm) return false;

    const levels = { NONE: 0, VIEW: 1, EDIT: 2 };
    return levels[perm.permission] >= levels[requiredPermission];
  },

  /**
   * Get all category IDs the user can access at the given permission level.
   */
  async getAccessibleCategoryIds(userId, minPermission = 'VIEW') {
    return permissionRepository.getAccessibleCategoryIds(userId, minPermission);
  },

  /**
   * Get all permissions for a user.
   */
  async getUserPermissions(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    return permissionRepository.findByUserId(userId);
  },

  /**
   * Set or create a permission for a user on a category.
   */
  async setPermission(userId, categoryId, permission) {
    const validPermissions = ['NONE', 'VIEW', 'EDIT'];
    if (!validPermissions.includes(permission)) {
      throw { status: 400, message: 'Invalid permission. Must be NONE, VIEW, or EDIT.' };
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    if (user.role === 'SUPER_ADMIN') {
      throw { status: 400, message: 'Cannot set permissions for a Super Admin. They have full access.' };
    }

    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw { status: 404, message: 'Category not found.' };
    }

    // If NONE, delete the permission record
    if (permission === 'NONE') {
      try {
        await permissionRepository.delete(userId, categoryId);
      } catch (e) {
        // Permission may not exist, that's fine
      }
      return { user_id: userId, category_id: categoryId, permission: 'NONE' };
    }

    return permissionRepository.upsert(userId, categoryId, permission);
  },

  /**
   * Remove a specific category permission for a user.
   */
  async removePermission(userId, categoryId) {
    try {
      await permissionRepository.delete(userId, categoryId);
    } catch (e) {
      throw { status: 404, message: 'Permission not found.' };
    }
  },
};

module.exports = permissionService;
