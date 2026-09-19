const prisma = require('../prisma/prisma');

const subcategoryRepository = {
  async findAll(filters = {}) {
    const where = {};
    if (filters.category_id) {
      where.category_id = filters.category_id;
    }
    if (filters.categoryIds) {
      where.category_id = { in: filters.categoryIds };
    }

    return prisma.subCategory.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id) {
    return prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    });
  },

  async findByNameAndCategory(name, category_id) {
    return prisma.subCategory.findUnique({
      where: {
        name_category_id: { name, category_id },
      },
    });
  },

  async create(data) {
    return prisma.subCategory.create({
      data,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    });
  },

  async update(id, data) {
    return prisma.subCategory.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    });
  },

  async delete(id) {
    return prisma.subCategory.delete({
      where: { id },
    });
  },
};

module.exports = subcategoryRepository;
