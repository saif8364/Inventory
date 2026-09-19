/**
 * Authentication & Session Management Module
 */

const Auth = {
  getToken() {
    return localStorage.getItem('inventory_token');
  },

  getUser() {
    const userStr = localStorage.getItem('inventory_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('inventory_token', token);
    localStorage.setItem('inventory_user', JSON.stringify(user));
  },

  updateUser(user) {
    localStorage.setItem('inventory_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('inventory_token');
    localStorage.removeItem('inventory_user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  isSuperAdmin() {
    const user = this.getUser();
    return user && user.role === 'SUPER_ADMIN';
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  requireSuperAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isSuperAdmin()) {
      if (typeof Toast !== 'undefined') {
        Toast.error('Access restricted to Super Admins only');
      }
      window.location.href = '/pages/dashboard.html';
      return false;
    }
    return true;
  },

  async logout() {
    try {
      if (typeof api !== 'undefined') {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.warn('Logout API call failed:', e);
    } finally {
      this.clearSession();
      window.location.href = '/login.html';
    }
  }
};

window.Auth = Auth;
