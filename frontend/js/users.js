/**
 * Users Management Controller (Super Admin Only)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireSuperAdmin()) return;
  UsersPage.init();
});

const UsersPage = {
  users: [],

  async init() {
    this.setupEventListeners();
    await this.loadUsers();
  },

  setupEventListeners() {
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
      addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
    }

    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) {
      editUserForm.addEventListener('submit', (e) => this.handleEditUser(e));
    }
  },

  async loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-6">
            <span class="spinner"></span> Loading users...
          </td>
        </tr>
      `;
    }

    try {
      const response = await api.get('/users');
      this.users = response.data || response;
      this.renderUsersTable();
    } catch (err) {
      Toast.error(err.message || 'Failed to fetch users');
    }
  },

  renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (this.users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <div class="empty-state-icon"><i class="ph ph-users"></i></div>
              <div class="empty-state-title">No Users Found</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const currentUserId = Auth.getUser()?.id;

    let html = '';
    this.users.forEach(user => {
      const roleBadge = user.role === 'SUPER_ADMIN' 
        ? `<span class="badge badge-warning">Super Admin</span>` 
        : `<span class="badge badge-info">User</span>`;

      const statusBadge = user.is_active 
        ? `<span class="badge badge-success">Active</span>` 
        : `<span class="badge badge-danger">Disabled</span>`;

      const isSelf = user.id === currentUserId;
      const safeEmail = user.email.replace(/'/g, "\\'");

      html += `
        <tr>
          <td>
            <div class="flex items-center justify-between gap-2">
              <div>
                <span class="font-semibold text-primary">${user.name || 'Unnamed User'}</span> ${isSelf ? '<span class="text-xs text-accent">(You)</span>' : ''}
                <div class="text-xs text-tertiary">${user.email}</div>
              </div>
              <div class="flex items-center gap-1">
                ${roleBadge}
                ${statusBadge}
              </div>
            </div>
          </td>
          <td>${roleBadge}</td>
          <td>${statusBadge}</td>
          <td class="text-xs text-secondary">${new Date(user.created_at).toLocaleDateString()}</td>
          <td class="table-actions">
            <button type="button" class="action-btn" title="Manage Category Permissions" onclick="window.location.href='/pages/permissions.html?userId=${user.id}'"><i class="ph ph-key"></i> Access</button>
            <button type="button" class="action-btn" title="Edit User" onclick="UsersPage.openEditModal(${user.id})"><i class="ph ph-pencil-simple"></i> Edit</button>
            ${!isSelf ? `
              <button type="button" class="action-btn" title="${user.is_active ? 'Disable' : 'Enable'} User" onclick="UsersPage.toggleStatus(${user.id}, ${!user.is_active})">
                <i class="ph ${user.is_active ? 'ph-prohibit' : 'ph-check-circle'}"></i> ${user.is_active ? 'Disable' : 'Enable'}
              </button>
              <button type="button" class="action-btn danger" title="Delete User" onclick="UsersPage.confirmDelete(${user.id}, '${safeEmail}')"><i class="ph ph-trash"></i> Delete</button>
            ` : ''}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  async handleAddUser(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = form.querySelector('#add-user-name').value.trim();
    const email = form.querySelector('#add-user-email').value.trim();
    const password = form.querySelector('#add-user-password').value;
    const role = form.querySelector('#add-user-role').value;

    if (!email || !password) {
      Toast.error('Email and password are required');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
      await api.post('/users', { name, email, password, role });
      Toast.success('User created successfully!');
      Modal.close('add-user-modal');
      form.reset();
      this.loadUsers();
    } catch (err) {
      Toast.error(err.message || 'Failed to create user');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create User';
    }
  },

  openEditModal(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-name').value = user.name || '';
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-password').value = '';

    Modal.open('edit-user-modal');
  },

  async handleEditUser(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const id = document.getElementById('edit-user-id').value;

    const name = form.querySelector('#edit-user-name').value.trim();
    const role = form.querySelector('#edit-user-role').value;
    const password = form.querySelector('#edit-user-password').value;

    const payload = { name, role };
    if (password) payload.password = password;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
      await api.patch(`/users/${id}`, payload);
      Toast.success('User updated successfully!');
      Modal.close('edit-user-modal');
      this.loadUsers();
    } catch (err) {
      Toast.error(err.message || 'Failed to update user');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update User';
    }
  },

  async toggleStatus(id, newStatus) {
    try {
      await api.patch(`/users/${id}/status`, { is_active: newStatus });
      Toast.success(`User status changed to ${newStatus ? 'Active' : 'Disabled'}`);
      this.loadUsers();
    } catch (err) {
      Toast.error(err.message || 'Failed to change user status');
    }
  },

  confirmDelete(id, email) {
    Modal.confirm({
      title: 'Delete User Account',
      text: `Are you sure you want to delete user account "${email}"?`,
      confirmText: 'Delete User',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`);
          Toast.success(`User "${email}" deleted`);
          this.loadUsers();
        } catch (err) {
          Toast.error(err.message || 'Failed to delete user');
        }
      }
    });
  }
};

window.UsersPage = UsersPage;
