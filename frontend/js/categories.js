/**
 * Categories & Sub-Categories Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  CategoriesPage.init();
});

const CategoriesPage = {
  categories: [],
  subcategories: [],
  searchQuery: '',

  async init() {
    this.setupEventListeners();
    await this.loadData();
  },

  setupEventListeners() {
    const isSuperAdmin = Auth.isSuperAdmin();
    if (!isSuperAdmin) {
      const adminBtns = document.querySelectorAll('.admin-only');
      adminBtns.forEach(btn => btn.style.display = 'none');
    }

    const searchInput = document.getElementById('category-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderCategoriesGrid();
      });
    }

    const addCatForm = document.getElementById('add-category-form');
    if (addCatForm) {
      addCatForm.addEventListener('submit', (e) => this.handleAddCategory(e));
    }

    const editCatForm = document.getElementById('edit-category-form');
    if (editCatForm) {
      editCatForm.addEventListener('submit', (e) => this.handleEditCategory(e));
    }

    const addSubForm = document.getElementById('add-subcategory-form');
    if (addSubForm) {
      addSubForm.addEventListener('submit', (e) => this.handleAddSubCategory(e));
    }
  },

  async loadData() {
    const grid = document.getElementById('categories-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <span class="spinner"></span>
          <p class="text-secondary mt-2">Loading categories...</p>
        </div>
      `;
    }

    try {
      const [catRes, subRes] = await Promise.all([
        api.get('/categories'),
        api.get('/subcategories')
      ]);

      this.categories = catRes.data || catRes;
      this.subcategories = subRes.data || subRes;

      this.renderCategoriesGrid();
      this.populateCategorySelectOptions();
    } catch (err) {
      Toast.error(err.message || 'Failed to load categories');
    }
  },

  renderCategoriesGrid() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    let filteredCats = this.categories;
    if (this.searchQuery) {
      filteredCats = this.categories.filter(cat => {
        const catNameMatch = cat.name.toLowerCase().includes(this.searchQuery);
        const catDescMatch = (cat.description || '').toLowerCase().includes(this.searchQuery);
        const subMatch = this.subcategories.some(s => s.category_id === cat.id && s.name.toLowerCase().includes(this.searchQuery));
        return catNameMatch || catDescMatch || subMatch;
      });
    }

    if (filteredCats.length === 0) {
      grid.innerHTML = `
        <div class="empty-state col-span-full">
          <div class="empty-state-icon"><i class="ph ph-tag"></i></div>
          <div class="empty-state-title">No Categories Found</div>
          <div class="empty-state-text">${this.searchQuery ? 'No categories match your search term.' : 'Create categories to organize your hardware inventory.'}</div>
          ${Auth.isSuperAdmin() ? '<button class="btn btn-primary btn-sm" onclick="Modal.open(\'add-category-modal\')">+ Add Category</button>' : ''}
        </div>
      `;
      return;
    }

    const isSuperAdmin = Auth.isSuperAdmin();
    let html = '';

    filteredCats.forEach(cat => {
      const catSubs = this.subcategories.filter(s => s.category_id === cat.id);

      let subsHtml = '';
      if (catSubs.length === 0) {
        subsHtml = '<span class="text-xs text-tertiary">No sub-categories</span>';
      } else {
        catSubs.forEach(sub => {
          const safeSubName = sub.name.replace(/'/g, "\\'");
          subsHtml += `
            <span class="subcat-tag">
              ${sub.name}
              ${isSuperAdmin ? `<button type="button" class="subcat-del-btn" title="Delete Sub-Category" onclick="CategoriesPage.confirmDeleteSubCategory(${sub.id}, '${safeSubName}')"><i class="ph ph-x"></i></button>` : ''}
            </span>
          `;
        });
      }

      const safeCatName = cat.name.replace(/'/g, "\\'");

      html += `
        <div class="category-card">
          <div class="category-card-header-banner">
            <h3 class="category-card-name" title="${cat.name}">${cat.name}</h3>
            ${isSuperAdmin ? `
              <div class="category-card-actions">
                <button type="button" class="icon-button" title="Edit Category" aria-label="Edit Category" onclick="CategoriesPage.openEditModal(${cat.id})"><i class="ph ph-pencil-simple"></i></button>
                <button type="button" class="icon-button danger" title="Delete Category" aria-label="Delete Category" onclick="CategoriesPage.confirmDeleteCategory(${cat.id}, '${safeCatName}')"><i class="ph ph-trash"></i></button>
              </div>
            ` : ''}
          </div>

          <p class="category-card-desc">${cat.description || 'No description provided.'}</p>

          <div class="category-card-footer">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-secondary uppercase tracking-wider">Sub-Categories (${catSubs.length})</span>
              <button type="button" class="btn btn-ghost btn-xs text-accent" onclick="CategoriesPage.openAddSubModal(${cat.id})">+ Add Sub</button>
            </div>
            <div class="subcat-list">
              ${subsHtml}
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  },

  populateCategorySelectOptions() {
    const subCatSelect = document.getElementById('add-subcat-parent');
    if (!subCatSelect) return;

    let options = '<option value="">Select Parent Category</option>';
    this.categories.forEach(cat => {
      options += `<option value="${cat.id}">${cat.name}</option>`;
    });

    subCatSelect.innerHTML = options;
  },

  async handleAddCategory(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = form.querySelector('#add-cat-name').value.trim();
    const description = form.querySelector('#add-cat-desc').value.trim();

    if (!name) {
      Toast.error('Category name is required');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      await api.post('/categories', { name, description });
      Toast.success('Category created!');
      Modal.close('add-category-modal');
      form.reset();
      this.loadData();
    } catch (err) {
      Toast.error(err.message || 'Failed to create category');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Category';
    }
  },

  openEditModal(id) {
    const cat = this.categories.find(c => c.id === id);
    if (!cat) return;

    document.getElementById('edit-cat-id').value = cat.id;
    document.getElementById('edit-cat-name').value = cat.name;
    document.getElementById('edit-cat-desc').value = cat.description || '';

    Modal.open('edit-category-modal');
  },

  async handleEditCategory(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const id = document.getElementById('edit-cat-id').value;

    const name = form.querySelector('#edit-cat-name').value.trim();
    const description = form.querySelector('#edit-cat-desc').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
      await api.patch(`/categories/${id}`, { name, description });
      Toast.success('Category updated!');
      Modal.close('edit-category-modal');
      this.loadData();
    } catch (err) {
      Toast.error(err.message || 'Failed to update category');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Category';
    }
  },

  confirmDeleteCategory(id, name) {
    Modal.confirm({
      title: 'Delete Category',
      text: `Are you sure you want to delete category "${name}"? Items inside it must be moved first.`,
      confirmText: 'Delete Category',
      onConfirm: async () => {
        try {
          await api.delete(`/categories/${id}`);
          Toast.success(`Category "${name}" deleted`);
          this.loadData();
        } catch (err) {
          Toast.error(err.message || 'Failed to delete category');
        }
      }
    });
  },

  openAddSubModal(categoryId) {
    const subCatSelect = document.getElementById('add-subcat-parent');
    if (subCatSelect && categoryId) {
      subCatSelect.value = categoryId;
    }
    Modal.open('add-subcategory-modal');
  },

  async handleAddSubCategory(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const category_id = form.querySelector('#add-subcat-parent').value;
    const name = form.querySelector('#add-subcat-name').value.trim();
    const description = form.querySelector('#add-subcat-desc').value.trim();

    if (!category_id || !name) {
      Toast.error('Parent Category and Sub-category name are required');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      await api.post('/subcategories', {
        category_id: parseInt(category_id, 10),
        name,
        description
      });
      Toast.success('Sub-category created!');
      Modal.close('add-subcategory-modal');
      form.reset();
      this.loadData();
    } catch (err) {
      Toast.error(err.message || 'Failed to create sub-category');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Sub-Category';
    }
  },

  confirmDeleteSubCategory(id, name) {
    Modal.confirm({
      title: 'Delete Sub-Category',
      text: `Are you sure you want to delete sub-category "${name}"?`,
      confirmText: 'Delete Sub-Category',
      onConfirm: async () => {
        try {
          await api.delete(`/subcategories/${id}`);
          Toast.success(`Sub-category "${name}" deleted`);
          this.loadData();
        } catch (err) {
          Toast.error(err.message || 'Failed to delete sub-category');
        }
      }
    });
  }
};

window.CategoriesPage = CategoriesPage;
