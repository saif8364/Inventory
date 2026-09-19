const prisma = require('../prisma/prisma');

const categoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: {
            subcategories: true,
            items: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { items: true } },
          },
        },
        _count: {
          select: {
            subcategories: true,
            items: true,
          },
        },
      },
    });
  },

  async findByName(name) {
    return prisma.category.findUnique({
      where: { name },
    });
  },

  async create(data) {
    return prisma.category.create({
      data,
      include: {
        _count: {
          select: { subcategories: true, items: true },
        },
      },
    });
  },

  async update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { subcategories: true, items: true },
        },
      },
    });
  },

  async delete(id) {
    return prisma.category.delete({
      where: { id },
    });
  },

  async count() {
    return prisma.category.count();
  },
};

module.exports = categoryRepository;
