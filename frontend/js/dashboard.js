/**
 * Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  console.debug('dashboard: DOMContentLoaded');
  Dashboard.init();
});

const Dashboard = {
  async init() {
    console.debug('dashboard: init()');
    this.renderUserInfo();
    await this.loadStats();
  },

  renderUserInfo() {
    const user = Auth.getUser();
    const welcomeNameEl = document.getElementById('welcome-user-name');
    if (welcomeNameEl && user) {
      welcomeNameEl.textContent = user.name || user.email;
    }
  },

  async loadStats() {
    try {
      const response = await api.get('/dashboard');
      const stats = response.data || response;

      const totalItemsEl = document.getElementById('stat-total-items');
      const totalCatEl = document.getElementById('stat-total-categories');
      const lowStockEl = document.getElementById('stat-low-stock');
      const totalUsersEl = document.getElementById('stat-total-users');
      const usersCard = document.getElementById('users-stat-card');

      if (totalItemsEl) totalItemsEl.textContent = stats.totalItems ?? 0;
      if (totalCatEl) totalCatEl.textContent = stats.totalCategories ?? 0;
      if (lowStockEl) lowStockEl.textContent = stats.lowStock ?? 0;

      if (stats.totalUsers !== null && stats.totalUsers !== undefined && totalUsersEl) {
        totalUsersEl.textContent = stats.totalUsers;
      } else if (usersCard) {
        usersCard.style.display = 'none';
      }

      this.renderRecentItems(stats.recentItems || []);
      this.renderRecentHistory(stats.recentHistory || []);
    } catch (err) {
      Toast.error('Failed to load dashboard metrics');
    }
  },

  renderRecentItems(items) {
    const container = document.getElementById('recent-items-list');
    if (!container) return;
    console.debug('dashboard: renderRecentItems count=', items.length);

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-title">No Items Found</div>
          <div class="empty-state-text">Start adding items to your inventory to track them here.</div>
          <a href="/pages/inventory.html" class="btn btn-primary btn-sm">+ Add Item</a>
        </div>
      `;
      return;
    }

    let html = `<div class="grid grid-2 p-4">`;

    items.forEach(item => {
      const catName = item.category ? item.category.name : '-';
      const subName = item.subcategory ? item.subcategory.name : '-';
      let qtyClass = 'high';
      if (item.quantity <= 5) qtyClass = 'low';
      else if (item.quantity <= 15) qtyClass = 'medium';

      html += `
        <div class="item-mini-card">
          <div class="item-mini-card-left">
            <div class="item-mini-card-title">${item.name}</div>
            <div class="item-mini-card-subtitle">${catName} • ${subName}</div>
          </div>
          <div>
            <span class="qty-badge ${qtyClass}">${item.quantity}</span>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  renderRecentHistory(historyList) {
    const container = document.getElementById('recent-history-list');
    if (!container) return;

    if (historyList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⏱️</div>
          <div class="empty-state-title">No Recent Activity</div>
          <div class="empty-state-text">Actions like quantity adjustments and additions will appear here.</div>
        </div>
      `;
      return;
    }

    let html = `<div class="vertical-timeline">`;

    historyList.forEach(log => {
      const itemName = log.item ? log.item.name : `Item #${log.item_id}`;
      const userName = log.user ? (log.user.name || log.user.email) : 'System';
      
      const date = new Date(log.created_at);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString();

      let dotClass = 'info';
      let actionLabel = log.action;
      
      if (log.action === 'CREATE') { dotClass = 'success'; actionLabel = 'Created item'; }
      if (log.action === 'DELETE') { dotClass = 'danger'; actionLabel = 'Deleted item'; }
      if (log.action === 'QUANTITY_CHANGE') { dotClass = 'warning'; actionLabel = 'Updated quantity'; }

      let bodyText = `User <strong>${userName}</strong> performed this action.`;
      if (log.action === 'QUANTITY_CHANGE' && log.old_quantity !== null && log.new_quantity !== null) {
        bodyText = `Quantity changed from <strong>${log.old_quantity}</strong> to <strong>${log.new_quantity}</strong> by ${userName}.`;
      }

      html += `
        <div class="timeline-item">
          <div class="timeline-dot ${dotClass}"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div class="timeline-title">${itemName} <span class="badge badge-neutral" style="margin-left:8px">${actionLabel}</span></div>
              <div class="timeline-time">${timeStr}</div>
            </div>
            <div class="timeline-body">${bodyText}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }
};

window.Dashboard = Dashboard;
