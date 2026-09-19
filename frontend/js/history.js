/**
 * Inventory History & Audit Log Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  HistoryPage.init();
});

const HistoryPage = {
  currentPage: 1,
  limit: 15,
  actionFilter: '',

  async init() {
    this.setupEventListeners();
    await this.loadHistory();
  },

  setupEventListeners() {
    const actionSelect = document.getElementById('history-action-filter');
    if (actionSelect) {
      actionSelect.addEventListener('change', (e) => {
        this.actionFilter = e.target.value;
        this.currentPage = 1;
        this.loadHistory();
      });
    }
  },

  async loadHistory() {
    const tbody = document.getElementById('history-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-6">
            <span class="spinner"></span> Loading activity logs...
          </td>
        </tr>
      `;
    }

    try {
      const params = {
        page: this.currentPage,
        limit: this.limit
      };

      if (this.actionFilter) {
        params.action = this.actionFilter;
      }

      const res = await api.get('/history', params);
      const logs = res.data || [];
      const pagination = res.pagination || { page: 1, limit: 15, total: logs.length };

      this.renderTable(logs);
      this.renderPagination(pagination);
    } catch (err) {
      Toast.error(err.message || 'Failed to fetch history logs');
    }
  },

  renderTable(logs) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon"><i class="ph ph-scroll"></i></div>
              <div class="empty-state-title">No Audit Logs Found</div>
              <div class="empty-state-text">Actions like quantity updates, additions, and edits will be recorded here.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    logs.forEach(log => {
      const itemName = log.item ? log.item.name : (log.item_id ? `Deleted Item (#${log.item_id})` : 'Deleted Item');
      const userName = log.user ? (log.user.name || log.user.email) : 'System';
      
      const dateObj = new Date(log.created_at);
      const timeStr = dateObj.toLocaleDateString() + ' • ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let actionBadge = `<span class="badge badge-info">${log.action}</span>`;
      if (log.action === 'CREATE') actionBadge = `<span class="badge badge-success">CREATE</span>`;
      if (log.action === 'DELETE') actionBadge = `<span class="badge badge-danger">DELETE</span>`;
      if (log.action === 'QUANTITY_CHANGE') actionBadge = `<span class="badge badge-warning">QTY CHANGE</span>`;
      if (log.action === 'UPDATE') actionBadge = `<span class="badge badge-info">UPDATE</span>`;

      let transitionText = '';
      let diffBadge = '';

      if (log.action === 'CREATE') {
        const qty = log.new_quantity ?? log.old_quantity ?? 0;
        transitionText = `Initial Stock: <strong>${qty}</strong>`;
        diffBadge = `<span class="badge badge-success">+${qty}</span>`;
      } else if (log.action === 'DELETE') {
        const qty = log.old_quantity ?? 0;
        transitionText = `Removed (Was: <strong>${qty}</strong>)`;
        diffBadge = `<span class="badge badge-danger">-${qty}</span>`;
      } else {
        const oldQ = log.old_quantity;
        const newQ = log.new_quantity;

        if (oldQ !== null && newQ !== null) {
          const diff = newQ - oldQ;
          transitionText = `Stock: <strong>${oldQ} &rarr; ${newQ}</strong>`;
          if (diff > 0) diffBadge = `<span class="badge badge-success">+${diff}</span>`;
          else if (diff < 0) diffBadge = `<span class="badge badge-danger">${diff}</span>`;
          else diffBadge = `<span class="badge badge-neutral">0</span>`;
        } else {
          transitionText = `Item Updated`;
          diffBadge = '';
        }
      }

      html += `
        <tr>
          <td class="font-mono text-xs text-tertiary">#${log.id}</td>
          <td>
            <div class="font-semibold text-primary">${itemName}</div>
          </td>
          <td>${actionBadge}</td>
          <td>
            <span class="text-sm">${transitionText}</span>
          </td>
          <td>${diffBadge}</td>
          <td>
            <div class="text-xs text-primary font-medium">${userName}</div>
            <div class="text-xs text-tertiary">${timeStr}</div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  renderPagination(pagination) {
    const container = document.getElementById('history-pagination');
    if (!container) return;

    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    this.currentPage = pagination.page;

    let controlsHtml = `
      <div class="pagination-info">
        Page <strong>${this.currentPage}</strong> of <strong>${totalPages}</strong> (${pagination.total} entries)
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="HistoryPage.goToPage(${this.currentPage - 1})">&laquo;</button>
        <button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="HistoryPage.goToPage(${this.currentPage + 1})">&raquo;</button>
      </div>
    `;

    container.innerHTML = controlsHtml;
  },

  goToPage(page) {
    this.currentPage = page;
    this.loadHistory();
  }
};

window.HistoryPage = HistoryPage;
