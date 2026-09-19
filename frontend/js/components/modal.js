/**
 * Reusable Modal Manager
 */

const Modal = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    modal.classList.add('active');

    // Setup close listeners
    const closeBtns = modal.querySelectorAll('[data-close-modal]');
    closeBtns.forEach(btn => {
      btn.onclick = () => Modal.close(modalId);
    });

    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          Modal.close(modalId);
        }
      };
    }
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  /**
   * Helper to trigger a confirmation modal
   */
  confirm({ title = 'Are you sure?', text = 'This action cannot be undone.', confirmText = 'Confirm', confirmClass = 'btn-danger', onConfirm }) {
    let confirmModal = document.getElementById('global-confirm-modal');

    if (!confirmModal) {
      confirmModal = document.createElement('div');
      confirmModal.id = 'global-confirm-modal';
      confirmModal.className = 'modal';
      document.body.appendChild(confirmModal);
    }

    confirmModal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-container modal-sm">
          <div class="confirm-dialog" style="padding: 24px; text-align: center;">
            <div class="confirm-dialog-icon danger" style="font-size: 2rem; margin-bottom: 12px;">⚠️</div>
            <h3 class="confirm-dialog-title" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">${title}</h3>
            <p class="confirm-dialog-text" style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 20px;">${text}</p>
            <div class="confirm-dialog-actions" style="display: flex; gap: 12px; justify-content: center;">
              <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
              <button type="button" class="btn ${confirmClass}" id="confirm-action-btn">${confirmText}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    Modal.open('global-confirm-modal');

    const actionBtn = confirmModal.querySelector('#confirm-action-btn');
    actionBtn.onclick = async () => {
      if (typeof onConfirm === 'function') {
        actionBtn.disabled = true;
        actionBtn.innerText = 'Processing...';
        try {
          await onConfirm();
        } finally {
          Modal.close('global-confirm-modal');
        }
      } else {
        Modal.close('global-confirm-modal');
      }
    };
  }
};

window.Modal = Modal;
