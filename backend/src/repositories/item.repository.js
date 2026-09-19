const prisma = require('../prisma/prisma');

const itemRepository = {
  async findAll({ where = {}, skip = 0, take = 20, orderBy = { created_at: 'desc' } } = {}) {
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
        },
      }),
      prisma.item.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id) {
    return prisma.item.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
  },

  async create(data) {
    return prisma.item.create({
      data,
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
  },

  async update(id, data) {
    return prisma.item.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
  },

  async delete(id) {
    return prisma.item.delete({
      where: { id },
    });
  },

  async countAll() {
    return prisma.item.count();
  },

  async countLowStock(threshold = 5) {
    return prisma.item.count({
      where: { quantity: { lte: threshold } },
    });
  },

  async findRecent(limit = 5) {
    return prisma.item.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
  },
};

module.exports = itemRepository;
