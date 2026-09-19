/**
 * Main Application Framework Script
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  init() {
    this.initTheme();
    this.initSidebar();
    this.initUserMenu();
    this.initTransitions();
    this.animatePageLoad();
  },

  initTransitions() {
    if (this._transitionsInit) return;
    this._transitionsInit = true;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('/pages/')) {
        // Prevent other handlers (inline onclick, duplicate listeners) from triggering navigation twice
        e.stopImmediatePropagation();
        e.preventDefault();

        if (link.dataset.navigating === '1') return;
        link.dataset.navigating = '1';
        setTimeout(() => { delete link.dataset.navigating; }, 1200);

        if (typeof anime !== 'undefined') {
          anime({
            targets: '.main-content',
            opacity: [1, 0],
            translateY: [0, -8],
            duration: 200,
            easing: 'easeInQuad',
            complete: () => {
              window.location.href = href;
            }
          });
        } else {
          window.location.href = href;
        }
      }
    }, {capture: true});
  },

  

  animatePageLoad() {
    if (typeof anime === 'undefined') return;

    // Ensure content starts visible
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.opacity = '1';
      mainContent.style.transform = 'none';
    }

    anime({
      targets: '.page-header',
      opacity: [0, 1],
      translateY: [-12, 0],
      duration: 500,
      easing: 'easeOutExpo'
    });

    anime({
      targets: '.stat-card',
      opacity: [0, 1],
      translateY: [12, 0],
      delay: anime.stagger(80, {start: 100}),
      duration: 500,
      easing: 'easeOutExpo'
    });

    anime({
      targets: '.card',
      opacity: [0, 1],
      translateY: [12, 0],
      delay: anime.stagger(80, {start: 200}),
      duration: 500,
      easing: 'easeOutExpo'
    });
  },

  /* ─── Theme Toggle ───────────────────────────────── */
  initTheme() {
    const savedTheme = localStorage.getItem('inventory_theme') || 'light';
    this.setTheme(savedTheme);

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
      });
    });
  },

  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('inventory_theme', theme);

    // Update all theme toggle icons
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(iconEl => {
      iconEl.innerHTML = theme === 'dark'
        ? '<i class="ph ph-sun"></i>'
        : '<i class="ph ph-moon"></i>';
    });

    // Sync settings page radio buttons if present
    const darkRadio = document.getElementById('theme-dark');
    const lightRadio = document.getElementById('theme-light');
    if (darkRadio && lightRadio) {
      if (theme === 'dark') darkRadio.checked = true;
      else lightRadio.checked = true;
    }
  },

  /* ─── Sidebar + Mobile Drawer ───────────────────── */
  initSidebar() {
    const user = Auth.getUser();
    if (!user) return;

    // Set user info
    const nameEl = document.querySelector('.sidebar-user-name');
    const roleEl = document.querySelector('.sidebar-user-role');
    const avatarEl = document.querySelector('.sidebar-user-avatar');

    if (nameEl) nameEl.textContent = user.name || user.email;
    if (roleEl) roleEl.textContent = user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Member';
    if (avatarEl) avatarEl.textContent = (user.name || user.email).charAt(0).toUpperCase();

    // Hide admin-only sections for normal users
    if (user.role !== 'SUPER_ADMIN') {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // Mark current page active
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && currentPath.endsWith(href)) {
        link.classList.add('active');
      } else if (href && currentPath === '/' && href.includes('dashboard.html')) {
        link.classList.add('active');
      }
    });

    // Mobile drawer setup (listeners attached once)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    let overlay = document.querySelector('.sidebar-overlay');

    if (mobileBtn && sidebar && !this._sidebarListenersInit) {
      this._sidebarListenersInit = true;

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
      }

      const openSidebar = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      };

      const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      };

      mobileBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('active')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });

      overlay.addEventListener('click', closeSidebar);

      // Close sidebar when clicking a nav link (mobile)
      document.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link');
        if (link && window.innerWidth <= 768) closeSidebar();
      });

      // Close sidebar on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
          closeSidebar();
        }
      });
    }
  },

  /* ─── User Menu / Logout ─────────────────────────── */
  initUserMenu() {
    if (this._userMenuInit) return;
    this._userMenuInit = true;

    document.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('.logout-btn');
      if (logoutBtn) {
        e.preventDefault();
        Auth.logout();
        return;
      }

      const dropdownToggle = e.target.closest('[data-dropdown]');
      if (dropdownToggle) {
        const targetId = dropdownToggle.getAttribute('data-dropdown');
        const menu = document.getElementById(targetId);
        if (menu) {
          menu.classList.toggle('active');
        }
      } else {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
          if (!menu.contains(e.target)) {
            menu.classList.remove('active');
          }
        });
      }
    });
  }
};

window.App = App;
