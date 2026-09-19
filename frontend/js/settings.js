/**
 * Settings & User Profile Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  SettingsPage.init();
});

const SettingsPage = {
  init() {
    this.renderProfile();
    this.setupEventListeners();
  },

  renderProfile() {
    const user = Auth.getUser();
    if (!user) return;

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const roleEl = document.getElementById('profile-role');
    const inputName = document.getElementById('setting-name');

    if (nameEl) nameEl.textContent = user.name || 'Unnamed User';
    if (emailEl) emailEl.textContent = user.email;
    if (roleEl) roleEl.textContent = user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Member';
    if (inputName) inputName.value = user.name || '';
  },

  setupEventListeners() {
    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
    }

    const themeRadioDark = document.getElementById('theme-dark');
    const themeRadioLight = document.getElementById('theme-light');

    const currentTheme = localStorage.getItem('inventory_theme') || 'light';
    if (currentTheme === 'dark' && themeRadioDark) themeRadioDark.checked = true;
    if (currentTheme === 'light' && themeRadioLight) themeRadioLight.checked = true;

    if (themeRadioDark) {
      themeRadioDark.addEventListener('change', () => App.setTheme('dark'));
    }
    if (themeRadioLight) {
      themeRadioLight.addEventListener('change', () => App.setTheme('light'));
    }
  },

  async handleChangePassword(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const oldPassword = form.querySelector('#old-password').value;
    const newPassword = form.querySelector('#new-password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;

    if (!newPassword || !confirmPassword) {
      Toast.error('Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Toast.error('Password must be at least 6 characters');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
      const user = Auth.getUser();
      await api.patch(`/users/${user.id}`, { password: newPassword });
      Toast.success('Password updated successfully!');
      form.reset();
    } catch (err) {
      Toast.error(err.message || 'Failed to update password');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  }
};

window.SettingsPage = SettingsPage;
