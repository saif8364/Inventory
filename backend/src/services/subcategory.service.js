const subcategoryRepository = require('../repositories/subcategory.repository');
const categoryRepository = require('../repositories/category.repository');

const subcategoryService = {
  async getAll(filters = {}) {
    return subcategoryRepository.findAll(filters);
  },

  async getById(id) {
    const subcategory = await subcategoryRepository.findById(id);
    if (!subcategory) {
      throw { status: 404, message: 'Sub-category not found.' };
    }
    return subcategory;
  },

  async create({ name, description, category_id, created_by }) {
    if (!name || !category_id) {
      throw { status: 400, message: 'Name and category are required.' };
    }

    // Verify category exists
    const category = await categoryRepository.findById(category_id);
    if (!category) {
      throw { status: 404, message: 'Parent category not found.' };
    }

    // Check unique within category
    const existing = await subcategoryRepository.findByNameAndCategory(name, category_id);
    if (existing) {
      throw { status: 409, message: 'A sub-category with this name already exists in this category.' };
    }

    return subcategoryRepository.create({
      name,
      description: description || null,
      category_id,
      created_by,
    });
  },

  async update(id, data) {
    const subcategory = await subcategoryRepository.findById(id);
    if (!subcategory) {
      throw { status: 404, message: 'Sub-category not found.' };
    }

    const updateData = {};

    if (data.name && data.name !== subcategory.name) {
      const categoryId = data.category_id || subcategory.category_id;
      const existing = await subcategoryRepository.findByNameAndCategory(data.name, categoryId);
      if (existing && existing.id !== id) {
        throw { status: 409, message: 'A sub-category with this name already exists in this category.' };
      }
      updateData.name = data.name;
    }

    if (data.description !== undefined) updateData.description = data.description;

    return subcategoryRepository.update(id, updateData);
  },

  async delete(id) {
    const subcategory = await subcategoryRepository.findById(id);
    if (!subcategory) {
      throw { status: 404, message: 'Sub-category not found.' };
    }

    if (subcategory._count.items > 0) {
      throw { status: 400, message: `Cannot delete sub-category. It contains ${subcategory._count.items} item(s). Remove all items first.` };
    }

    return subcategoryRepository.delete(id);
  },
};

module.exports = subcategoryService;
