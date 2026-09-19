/**
 * Inventory Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  Inventory.init();
});

const Inventory = {
  currentPage: 1,
  limit: 10,
  categories: [],
  subcategories: [],
  selectedCategory: '',
  selectedSubCategory: '',
  searchQuery: '',
  items: [],
  currentItem: null,

  async init() {
    this.setupEventListeners();
    await this.loadCategories();
    await this.loadItems();
  },

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.currentPage = 1;
          this.loadItems();
        }, 300);
      });
    }

    const catFilter = document.getElementById('category-filter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.selectedSubCategory = '';
        this.updateSubcategoryFilterOptions();
        this.currentPage = 1;
        this.loadItems();
      });
    }

    const subCatFilter = document.getElementById('subcategory-filter');
    if (subCatFilter) {
      subCatFilter.addEventListener('change', (e) => {
        this.selectedSubCategory = e.target.value;
        this.currentPage = 1;
        this.loadItems();
      });
    }

    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
      addItemForm.addEventListener('submit', (e) => this.handleAddItem(e));
    }

    const editItemForm = document.getElementById('edit-item-form');
    if (editItemForm) {
      editItemForm.addEventListener('submit', (e) => this.handleEditItem(e));
    }

    const addCatSelect = document.getElementById('add-item-category');
    if (addCatSelect) {
      addCatSelect.addEventListener('change', (e) => {
        this.populateSubcategorySelect('add-item-subcategory', e.target.value);
      });
    }

    const editCatSelect = document.getElementById('edit-item-category');
    if (editCatSelect) {
      editCatSelect.addEventListener('change', (e) => {
        this.populateSubcategorySelect('edit-item-subcategory', e.target.value);
      });
    }

    const qtyForm = document.getElementById('qty-update-form');
    if (qtyForm) {
      qtyForm.addEventListener('submit', (e) => this.handleQtyUpdate(e));
    }
  },

  async loadCategories() {
    try {
      const catRes = await api.get('/categories');
      this.categories = catRes.data || catRes;

      const subRes = await api.get('/subcategories');
      this.subcategories = subRes.data || subRes;

      this.populateCategoryFilters();
    } catch (err) {
      console.error('Failed to load category filters:', err);
    }
  },

  populateCategoryFilters() {
    const catFilter = document.getElementById('category-filter');
    const addCatSelect = document.getElementById('add-item-category');
    const editCatSelect = document.getElementById('edit-item-category');

    let options = '<option value="">All Categories</option>';
    let modalOptions = '<option value="">Select Category</option>';

    this.categories.forEach(cat => {
      options += `<option value="${cat.id}">${cat.name}</option>`;
      modalOptions += `<option value="${cat.id}">${cat.name}</option>`;
    });

    if (catFilter) catFilter.innerHTML = options;
    if (addCatSelect) addCatSelect.innerHTML = modalOptions;
    if (editCatSelect) editCatSelect.innerHTML = modalOptions;
  },

  updateSubcategoryFilterOptions() {
    const subCatFilter = document.getElementById('subcategory-filter');
    if (!subCatFilter) return;

    if (!this.selectedCategory) {
      subCatFilter.innerHTML = '<option value="">All Sub-Categories</option>';
      subCatFilter.disabled = true;
      return;
    }

    const catId = parseInt(this.selectedCategory, 10);
    const filteredSubs = this.subcategories.filter(s => s.category_id === catId);

    let options = '<option value="">All Sub-Categories</option>';
    filteredSubs.forEach(s => {
      options += `<option value="${s.id}">${s.name}</option>`;
    });

    subCatFilter.innerHTML = options;
    subCatFilter.disabled = false;
  },

  populateSubcategorySelect(selectId, catIdStr, selectedSubId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    if (!catIdStr) {
      select.innerHTML = '<option value="">Select Sub-Category (Optional)</option>';
      select.disabled = true;
      return;
    }

    const catId = parseInt(catIdStr, 10);
    const filtered = this.subcategories.filter(s => s.category_id === catId);

    let options = '<option value="">None / Optional</option>';
    filtered.forEach(s => {
      const isSel = selectedSubId && s.id === parseInt(selectedSubId, 10) ? 'selected' : '';
      options += `<option value="${s.id}" ${isSel}>${s.name}</option>`;
    });

    select.innerHTML = options;
    select.disabled = false;
  },

  async loadItems() {
    const tbody = document.getElementById('inventory-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-6">
            <div class="flex items-center justify-center gap-3">
              <span class="spinner"></span> Loading items...
            </div>
          </td>
        </tr>
      `;
    }

    try {
      const params = {
        page: this.currentPage,
        limit: this.limit,
        search: this.searchQuery,
        category: this.selectedCategory,
        subCategory: this.selectedSubCategory
      };

      const res = await api.get('/items', params);
      const itemsList = res.data || [];
      const pagination = res.pagination || { page: 1, limit: 10, total: itemsList.length };

      this.items = itemsList;
      this.renderTable(itemsList);
      this.renderPagination(pagination);
    } catch (err) {
      Toast.error(err.message || 'Failed to fetch inventory items');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-6 text-danger">
              Failed to load items. ${err.message}
            </td>
          </tr>
        `;
      }
    }
  },

  renderTable(items) {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon"><i class="ph ph-package"></i></div>
              <div class="empty-state-title">No Inventory Items Found</div>
              <div class="empty-state-text">No items match your search or filter parameters.</div>
              <button class="btn btn-primary btn-sm" onclick="Modal.open('add-item-modal')">+ Add First Item</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    items.forEach(item => {
      const catName = item.category ? item.category.name : '-';
      const subName = item.subcategory ? item.subcategory.name : '-';
      let qtyClass = 'high';
      if (item.quantity <= 5) qtyClass = 'low';
      else if (item.quantity <= 15) qtyClass = 'medium';

      const safeName = (item.name || '').replace(/'/g, "\\'");

      html += `
        <tr>
          <td>
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-primary">${item.name}</span>
              <span class="qty-badge ${qtyClass}">${item.quantity}</span>
            </div>
            <div class="text-xs text-secondary truncate" style="max-width: 280px;">${item.description || 'No description'}</div>
          </td>
          <td><span class="badge badge-neutral">${catName}</span></td>
          <td><span class="text-sm text-secondary">${subName}</span></td>
          <td>
            <div class="flex items-center gap-2">
              <span class="qty-badge ${qtyClass}">${item.quantity}</span>
              <button type="button" class="icon-button" aria-label="Adjust quantity for ${safeName}" title="Adjust Quantity" onclick="Inventory.openQtyModal(${item.id})">
                <i class="ph ph-plus-minus"></i>
              </button>
            </div>
          </td>
          <td class="text-xs text-secondary">${new Date(item.updated_at).toLocaleDateString()}</td>
          <td class="table-actions">
            <button type="button" class="icon-button" aria-label="Edit ${safeName}" title="Edit Item" onclick="Inventory.openEditModal(${item.id})">
              <i class="ph ph-pencil-simple"></i>
            </button>
            <button type="button" class="icon-button danger" aria-label="Delete ${safeName}" title="Delete Item" onclick="Inventory.confirmDelete(${item.id}, '${safeName}')">
              <i class="ph ph-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  renderPagination(pagination) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    this.currentPage = pagination.page;

    const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

    let controlsHtml = `
      <div class="pagination-info">
        Showing <strong>${startItem}-${endItem}</strong> of <strong>${pagination.total}</strong> items
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="Inventory.goToPage(${this.currentPage - 1})">&laquo;</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        controlsHtml += `
          <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="Inventory.goToPage(${i})">${i}</button>
        `;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        controlsHtml += `<span class="px-1 text-tertiary">...</span>`;
      }
    }

    controlsHtml += `
        <button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="Inventory.goToPage(${this.currentPage + 1})">&raquo;</button>
      </div>
    `;

    container.innerHTML = controlsHtml;
  },

  goToPage(page) {
    this.currentPage = page;
    this.loadItems();
  },

  async handleAddItem(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = form.querySelector('#add-item-name').value.trim();
    const category_id = form.querySelector('#add-item-category').value;
    const sub_category_id = form.querySelector('#add-item-subcategory').value || null;
    const quantity = parseInt(form.querySelector('#add-item-quantity').value, 10);
    const description = form.querySelector('#add-item-description').value.trim();

    if (!name || !category_id) {
      Toast.error('Item name and Category are required');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      await api.post('/items', {
        name,
        category_id: parseInt(category_id, 10),
        sub_category_id: sub_category_id ? parseInt(sub_category_id, 10) : null,
        quantity: isNaN(quantity) ? 0 : quantity,
        description
      });

      Toast.success('Item created successfully!');
      Modal.close('add-item-modal');
      form.reset();
      this.loadItems();
    } catch (err) {
      Toast.error(err.message || 'Failed to create item');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Item';
    }
  },

  openEditModal(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    this.currentItem = item;

    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-category').value = item.category_id;
    document.getElementById('edit-item-quantity').value = item.quantity;
    document.getElementById('edit-item-description').value = item.description || '';

    this.populateSubcategorySelect('edit-item-subcategory', item.category_id, item.sub_category_id);

    Modal.open('edit-item-modal');
  },

  async handleEditItem(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const id = document.getElementById('edit-item-id').value;

    const name = form.querySelector('#edit-item-name').value.trim();
    const category_id = form.querySelector('#edit-item-category').value;
    const sub_category_id = form.querySelector('#edit-item-subcategory').value || null;
    const quantity = parseInt(form.querySelector('#edit-item-quantity').value, 10);
    const description = form.querySelector('#edit-item-description').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
      await api.patch(`/items/${id}`, {
        name,
        category_id: parseInt(category_id, 10),
        sub_category_id: sub_category_id ? parseInt(sub_category_id, 10) : null,
        quantity: isNaN(quantity) ? 0 : quantity,
        description
      });

      Toast.success('Item updated successfully!');
      Modal.close('edit-item-modal');
      this.loadItems();
    } catch (err) {
      Toast.error(err.message || 'Failed to update item');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Item';
    }
  },

  openQtyModal(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    this.currentItem = item;
    document.getElementById('qty-item-id').value = item.id;
    document.getElementById('qty-item-name-display').textContent = item.name;
    document.getElementById('qty-current-value').value = item.quantity;

    Modal.open('qty-update-modal');
  },

  async handleQtyUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const id = document.getElementById('qty-item-id').value;
    const newQty = parseInt(document.getElementById('qty-current-value').value, 10);

    if (isNaN(newQty) || newQty < 0) {
      Toast.error('Quantity must be a valid non-negative number');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      await api.patch(`/items/${id}/quantity`, { quantity: newQty });
      Toast.success('Quantity updated!');
      Modal.close('qty-update-modal');
      this.loadItems();
    } catch (err) {
      Toast.error(err.message || 'Failed to update quantity');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  },

  confirmDelete(id, name) {
    Modal.confirm({
      title: `Delete Item`,
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Item',
      onConfirm: async () => {
        try {
          await api.delete(`/items/${id}`);
          Toast.success(`"${name}" deleted successfully`);
          this.loadItems();
        } catch (err) {
          Toast.error(err.message || 'Failed to delete item');
        }
      }
    });
  }
};

window.Inventory = Inventory;
