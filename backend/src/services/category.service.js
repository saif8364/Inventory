const categoryRepository = require('../repositories/category.repository');

const categoryService = {
  async getAll() {
    return categoryRepository.findAll();
  },

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw { status: 404, message: 'Category not found.' };
    }
    return category;
  },

  async create({ name, description, created_by }) {
    if (!name) {
      throw { status: 400, message: 'Category name is required.' };
    }

    const existing = await categoryRepository.findByName(name);
    if (existing) {
      throw { status: 409, message: 'A category with this name already exists.' };
    }

    return categoryRepository.create({
      name,
      description: description || null,
      created_by,
    });
  },

  async update(id, data) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw { status: 404, message: 'Category not found.' };
    }

    if (data.name && data.name !== category.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing) {
        throw { status: 409, message: 'A category with this name already exists.' };
      }
    }

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    return categoryRepository.update(id, updateData);
  },

  async delete(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw { status: 404, message: 'Category not found.' };
    }

    if (category._count.items > 0) {
      throw { status: 400, message: `Cannot delete category. It contains ${category._count.items} item(s). Remove all items first.` };
    }

    if (category._count.subcategories > 0) {
      throw { status: 400, message: `Cannot delete category. It has ${category._count.subcategories} sub-categor(ies). Remove all sub-categories first.` };
    }

    return categoryRepository.delete(id);
  },

  async count() {
    return categoryRepository.count();
  },
};

module.exports = categoryService;
