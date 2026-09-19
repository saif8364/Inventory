/**
 * Category Permissions Matrix Controller (Super Admin Only)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireSuperAdmin()) return;
  PermissionsPage.init();
});

const PermissionsPage = {
  users: [],
  categories: [],
  selectedUserId: null,
  userPermissionsMap: {},

  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
  },

  setupEventListeners() {
    const userSelect = document.getElementById('user-selector');
    if (userSelect) {
      userSelect.addEventListener('change', (e) => {
        this.selectedUserId = e.target.value ? parseInt(e.target.value, 10) : null;
        if (this.selectedUserId) {
          this.loadUserPermissions(this.selectedUserId);
        } else {
          this.renderMatrix();
        }
      });
    }
  },

  async loadInitialData() {
    try {
      const [usersRes, catRes] = await Promise.all([
        api.get('/users'),
        api.get('/categories')
      ]);

      this.users = usersRes.data || usersRes;
      this.categories = catRes.data || catRes;

      this.populateUserDropdown();

      const urlParams = new URLSearchParams(window.location.search);
      const userIdParam = urlParams.get('userId');

      if (userIdParam) {
        const userSelect = document.getElementById('user-selector');
        if (userSelect) {
          userSelect.value = userIdParam;
          this.selectedUserId = parseInt(userIdParam, 10);
          await this.loadUserPermissions(this.selectedUserId);
        }
      } else if (this.users.length > 0) {
        const normalUser = this.users.find(u => u.role !== 'SUPER_ADMIN') || this.users[0];
        const userSelect = document.getElementById('user-selector');
        if (userSelect && normalUser) {
          userSelect.value = normalUser.id;
          this.selectedUserId = normalUser.id;
          await this.loadUserPermissions(normalUser.id);
        }
      }
    } catch (err) {
      Toast.error('Failed to load initial permission data');
    }
  },

  populateUserDropdown() {
    const userSelect = document.getElementById('user-selector');
    if (!userSelect) return;

    let options = '<option value="">Select a user...</option>';
    this.users.forEach(user => {
      const roleTag = user.role === 'SUPER_ADMIN' ? ' [Super Admin]' : '';
      options += `<option value="${user.id}">${user.name || user.email}${roleTag}</option>`;
    });

    userSelect.innerHTML = options;
  },

  async loadUserPermissions(userId) {
    const targetUser = this.users.find(u => u.id === userId);
    const infoBox = document.getElementById('selected-user-info');

    if (infoBox && targetUser) {
      if (targetUser.role === 'SUPER_ADMIN') {
        infoBox.innerHTML = `
          <div class="badge badge-info" style="padding: 8px 12px; display: inline-block;">
            <strong>Notice:</strong> Super Admin users have full bypass access to all categories regardless of explicit permission rows.
          </div>
        `;
      } else {
        infoBox.innerHTML = `
          <div class="text-sm text-secondary">
            Managing category permissions for <strong>${targetUser.name || targetUser.email}</strong>
          </div>
        `;
      }
    }

    try {
      const res = await api.get(`/permissions/${userId}/permissions`);
      const permissionsList = res.data || res;

      this.userPermissionsMap = {};
      permissionsList.forEach(p => {
        this.userPermissionsMap[p.category_id] = p.permission;
      });

      this.renderMatrix();
    } catch (err) {
      Toast.error('Failed to fetch user permissions');
    }
  },

  renderMatrix() {
    const tbody = document.getElementById('permissions-table-body');
    if (!tbody) return;

    if (!this.selectedUserId) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center py-6 text-secondary">
            Please select a user to configure category access.
          </td>
        </tr>
      `;
      return;
    }

    if (this.categories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center py-6">
            No categories created yet.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    this.categories.forEach(cat => {
      const currentPerm = this.userPermissionsMap[cat.id] || 'NONE';

      html += `
        <tr>
          <td>
            <div class="font-semibold text-primary">${cat.name}</div>
            <div class="text-xs text-secondary">${cat.description || ''}</div>
          </td>
          <td>
            <select class="form-select permission-select" onchange="PermissionsPage.handlePermissionChange(${cat.id}, this.value)">
              <option value="NONE" ${currentPerm === 'NONE' ? 'selected' : ''}>🚫 NONE (No Access)</option>
              <option value="VIEW" ${currentPerm === 'VIEW' ? 'selected' : ''}>👁️ VIEW (Read Only)</option>
              <option value="EDIT" ${currentPerm === 'EDIT' ? 'selected' : ''}>✏️ EDIT (Read & Write)</option>
            </select>
          </td>
          <td>
            <span class="badge ${currentPerm === 'EDIT' ? 'badge-success' : currentPerm === 'VIEW' ? 'badge-info' : 'badge-neutral'}">
              ${currentPerm}
            </span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  async handlePermissionChange(categoryId, newPermission) {
    if (!this.selectedUserId) return;

    try {
      await api.post(`/permissions/${this.selectedUserId}/permissions`, {
        category_id: categoryId,
        permission: newPermission
      });

      this.userPermissionsMap[categoryId] = newPermission;
      Toast.success('Permission saved!');
      this.renderMatrix();
    } catch (err) {
      Toast.error(err.message || 'Failed to update permission');
      this.renderMatrix();
    }
  }
};

window.PermissionsPage = PermissionsPage;
