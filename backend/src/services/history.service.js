const historyRepository = require('../repositories/history.repository');
const permissionService = require('./permission.service');

const historyService = {
  /**
   * Record an inventory change in history.
   */
  async record({ item_id, user_id, action, old_quantity, new_quantity }) {
    return historyRepository.create({
      item_id,
      user_id,
      action,
      old_quantity,
      new_quantity,
    });
  },

  /**
   * Get paginated history.
   * SUPER_ADMIN sees all; normal users see only history for items they can access.
   */
  async getAll({ page = 1, limit = 20, user }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (user.role !== 'SUPER_ADMIN') {
      const accessibleIds = await permissionService.getAccessibleCategoryIds(user.id, 'VIEW');
      if (accessibleIds.length === 0) {
        return { records: [], total: 0, page, limit };
      }
      where.item = { category_id: { in: accessibleIds } };
    }

    const { records, total } = await historyRepository.findAll({ where, skip, take: limit });

    return { records, total, page, limit };
  },

  /**
   * Get a single history entry by ID.
   */
  async getById(id, user) {
    const record = await historyRepository.findById(id);
    if (!record) {
      throw { status: 404, message: 'History record not found.' };
    }

    // Permission check for non-admins
    if (user.role !== 'SUPER_ADMIN' && record.item) {
      const hasAccess = await permissionService.hasCategoryAccess(user.id, record.item.category_id, 'VIEW');
      if (!hasAccess) {
        throw { status: 403, message: 'You do not have permission to view this record.' };
      }
    }

    return record;
  },
};

module.exports = historyService;
