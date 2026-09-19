const itemRepository = require('../repositories/item.repository');
const categoryRepository = require('../repositories/category.repository');
const subcategoryRepository = require('../repositories/subcategory.repository');
const historyService = require('./history.service');
const permissionService = require('./permission.service');

const itemService = {
  async getAll({ search, category, subCategory, page = 1, limit = 20, user }) {
    const where = {};
    const skip = (page - 1) * limit;

    // Filter by accessible categories for normal users
    if (user.role !== 'SUPER_ADMIN') {
      const accessibleIds = await permissionService.getAccessibleCategoryIds(user.id, 'VIEW');
      if (accessibleIds.length === 0) {
        return { items: [], total: 0, page, limit };
      }
      where.category_id = { in: accessibleIds };
    }

    // Apply filters
    if (category) {
      const catId = parseInt(category, 10);
      // For normal users, verify they have access
      if (user.role !== 'SUPER_ADMIN') {
        const hasAccess = await permissionService.hasCategoryAccess(user.id, catId, 'VIEW');
        if (!hasAccess) {
          return { items: [], total: 0, page, limit };
        }
      }
      where.category_id = catId;
    }

    if (subCategory) {
      where.sub_category_id = parseInt(subCategory, 10);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const { items, total } = await itemRepository.findAll({ where, skip, take: limit });

    return { items, total, page, limit };
  },

  async getById(id, user) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw { status: 404, message: 'Item not found.' };
    }

    // Check permission
    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await permissionService.hasCategoryAccess(user.id, item.category_id, 'VIEW');
      if (!hasAccess) {
        throw { status: 403, message: 'You do not have permission to view this item.' };
      }
    }

    return item;
  },

  async create({ name, category_id, sub_category_id, description, quantity = 0 }, user) {
    if (!name || !category_id) {
      throw { status: 400, message: 'Name and category are required.' };
    }

    // Check permission
    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await permissionService.hasCategoryAccess(user.id, category_id, 'EDIT');
      if (!hasAccess) {
        throw { status: 403, message: 'You do not have edit permission for this category.' };
      }
    }

    // Verify category exists
    const category = await categoryRepository.findById(category_id);
    if (!category) {
      throw { status: 404, message: 'Category not found.' };
    }

    // Verify sub-category if provided
    if (sub_category_id) {
      const subcat = await subcategoryRepository.findById(sub_category_id);
      if (!subcat) {
        throw { status: 404, message: 'Sub-category not found.' };
      }
      if (subcat.category_id !== category_id) {
        throw { status: 400, message: 'Sub-category does not belong to the specified category.' };
      }
    }

    const item = await itemRepository.create({
      name,
      category_id,
      sub_category_id: sub_category_id || null,
      description: description || null,
      quantity: parseInt(quantity, 10) || 0,
    });

    // Record history
    await historyService.record({
      item_id: item.id,
      user_id: user.id,
      action: 'CREATE',
      old_quantity: null,
      new_quantity: item.quantity,
    });

    return item;
  },

  async update(id, data, user) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw { status: 404, message: 'Item not found.' };
    }

    // Check permission
    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await permissionService.hasCategoryAccess(user.id, item.category_id, 'EDIT');
      if (!hasAccess) {
        throw { status: 403, message: 'You do not have edit permission for this category.' };
      }
    }

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sub_category_id !== undefined) {
      if (data.sub_category_id) {
        const subcat = await subcategoryRepository.findById(data.sub_category_id);
        if (!subcat) {
          throw { status: 404, message: 'Sub-category not found.' };
        }
        if (subcat.category_id !== item.category_id) {
          throw { status: 400, message: 'Sub-category does not belong to the item\'s category.' };
        }
      }
      updateData.sub_category_id = data.sub_category_id || null;
    }

    const updated = await itemRepository.update(id, updateData);

    // Record history
    await historyService.record({
      item_id: updated.id,
      user_id: user.id,
      action: 'UPDATE',
      old_quantity: item.quantity,
      new_quantity: updated.quantity,
    });

    return updated;
  },

  async updateQuantity(id, quantity, user) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw { status: 404, message: 'Item not found.' };
    }

    if (quantity === undefined || quantity === null) {
      throw { status: 400, message: 'Quantity is required.' };
    }

    const newQuantity = parseInt(quantity, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      throw { status: 400, message: 'Quantity must be a non-negative number.' };
    }

    // Check permission
    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await permissionService.hasCategoryAccess(user.id, item.category_id, 'EDIT');
      if (!hasAccess) {
        throw { status: 403, message: 'You do not have edit permission for this category.' };
      }
    }

    const updated = await itemRepository.update(id, { quantity: newQuantity });

    // Record history
    await historyService.record({
      item_id: updated.id,
      user_id: user.id,
      action: 'QUANTITY_CHANGE',
      old_quantity: item.quantity,
      new_quantity: newQuantity,
    });

    return updated;
  },

  async delete(id, user) {
    const item = await itemRepository.findById(id);
    if (!item) {
      throw { status: 404, message: 'Item not found.' };
    }

    // Check permission
    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await permissionService.hasCategoryAccess(user.id, item.category_id, 'EDIT');
      if (!hasAccess) {
        throw { status: 403, message: 'You do not have edit permission for this category.' };
      }
    }

    // Record history before deletion
    await historyService.record({
      item_id: item.id,
      user_id: user.id,
      action: 'DELETE',
      old_quantity: item.quantity,
      new_quantity: null,
    });

    return itemRepository.delete(id);
  },

  async getDashboardStats(user) {
    if (user.role === 'SUPER_ADMIN') {
      const [totalItems, totalCategories, lowStock, totalUsers] = await Promise.all([
        itemRepository.countAll(),
        require('../repositories/category.repository').count(),
        itemRepository.countLowStock(5),
        require('../repositories/user.repository').count(),
      ]);

      const recentItems = await itemRepository.findRecent(5);
      const recentHistory = await require('../repositories/history.repository').findRecent(10);

      return { totalItems, totalCategories, lowStock, totalUsers, recentItems, recentHistory };
    }

    // For normal users, only count what they can access
    const accessibleIds = await permissionService.getAccessibleCategoryIds(user.id, 'VIEW');

    if (accessibleIds.length === 0) {
      return { totalItems: 0, totalCategories: 0, lowStock: 0, totalUsers: null, recentItems: [], recentHistory: [] };
    }

    const where = { category_id: { in: accessibleIds } };

    const [totalItems, lowStock] = await Promise.all([
      require('../prisma/prisma').item.count({ where }),
      require('../prisma/prisma').item.count({ where: { ...where, quantity: { lte: 5 } } }),
    ]);

    const recentItems = await require('../prisma/prisma').item.findMany({
      where,
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    const recentHistory = await require('../repositories/history.repository').findRecent(10);

    return {
      totalItems,
      totalCategories: accessibleIds.length,
      lowStock,
      totalUsers: null,
      recentItems,
      recentHistory,
    };
  },
};

module.exports = itemService;
