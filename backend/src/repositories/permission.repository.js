const prisma = require('../prisma/prisma');

const permissionRepository = {
  async findByUserId(userId) {
    return prisma.categoryPermission.findMany({
      where: { user_id: userId },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { category: { name: 'asc' } },
    });
  },

  async findByUserAndCategory(userId, categoryId) {
    return prisma.categoryPermission.findUnique({
      where: {
        user_id_category_id: {
          user_id: userId,
          category_id: categoryId,
        },
      },
    });
  },

  async upsert(userId, categoryId, permission) {
    return prisma.categoryPermission.upsert({
      where: {
        user_id_category_id: {
          user_id: userId,
          category_id: categoryId,
        },
      },
      update: { permission },
      create: {
        user_id: userId,
        category_id: categoryId,
        permission,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  },

  async delete(userId, categoryId) {
    return prisma.categoryPermission.delete({
      where: {
        user_id_category_id: {
          user_id: userId,
          category_id: categoryId,
        },
      },
    });
  },

  async deleteAllForUser(userId) {
    return prisma.categoryPermission.deleteMany({
      where: { user_id: userId },
    });
  },

  async getAccessibleCategoryIds(userId, minPermission = 'VIEW') {
    const permissions = ['VIEW', 'EDIT'];
    const validPermissions = minPermission === 'EDIT' ? ['EDIT'] : permissions;

    const records = await prisma.categoryPermission.findMany({
      where: {
        user_id: userId,
        permission: { in: validPermissions },
      },
      select: { category_id: true },
    });

    return records.map((r) => r.category_id);
  },
};

module.exports = permissionRepository;
