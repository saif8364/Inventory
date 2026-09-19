const prisma = require('../prisma/prisma');

const historyRepository = {
  async findAll({ where = {}, skip = 0, take = 20 } = {}) {
    const [records, total] = await Promise.all([
      prisma.inventoryHistory.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          item: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.inventoryHistory.count({ where }),
    ]);

    return { records, total };
  },

  async findById(id) {
    return prisma.inventoryHistory.findUnique({
      where: { id },
      include: {
        item: { select: { id: true, name: true, category_id: true } },
        user: { select: { id: true, name: true } },
      },
    });
  },

  async create(data) {
    return prisma.inventoryHistory.create({
      data,
      include: {
        item: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });
  },

  async findRecent(limit = 10) {
    return prisma.inventoryHistory.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        item: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });
  },
};

module.exports = historyRepository;
