/* admin-sidebar.js — shared sidebar + nav injected into every admin page */

function injectAdminShell(activePage) {
  const admin = JSON.parse(localStorage.getItem('gstake_admin') || '{}');
  const initials = (admin.fullName || 'Admin').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  /* ─── Top Nav ─── */
  document.getElementById('topNav').innerHTML = `
    <button class="icon-btn" id="sidebarToggle" title="Toggle sidebar">
      <svg data-lucide="menu"></svg>
    </button>
    <a href="index.html" class="logo">G<em>S</em>TAKE</a>
    <span class="admin-badge">Admin Panel</span>
    <div class="nav-spacer"></div>
    <div class="nav-admin-info">
      <span class="nav-avatar">${initials}</span>
      <div style="display:flex;flex-direction:column;line-height:1.2">
        <strong>${admin.fullName || 'Administrator'}</strong>
        <span style="font-size:.7rem">${admin.email || ''}</span>
      </div>
    </div>
    <div class="icon-btn" onclick="toggleTheme()" title="Toggle theme">
      <svg data-lucide="moon" id="themeIco"></svg>
    </div>
  `;

  /* ─── Sidebar ─── */
 const links = [
  { href:'index.html',                 icon:'layout-dashboard', label:'Dashboard',           section:'Overview'   },
  { href:'admin-users.html',           icon:'users',            label:'Users',               section:'Management' },
  { href:'admin-games.html',           icon:'calendar',         label:'Games & Odds',         section:'Management' },
  { href:'admin-settlement.html',      icon:'flag',             label:'Settlement & Results', section:'Management' },
  { href:'admin-transactions.html',    icon:'arrow-left-right', label:'Transactions',         section:'Management' },
  { href:'admin-bets.html',            icon:'ticket',           label:'Bet Slips',            section:'Management' },
  { href:'admin-booking-codes.html',   icon:'qr-code',          label:'Booking Codes',        section:'Management' }, // ← new
];

  let sidebarHTML = '';
  let lastSection = '';
  links.forEach(link => {
    if (link.section !== lastSection) {
      sidebarHTML += `<div class="sidebar-section-label">${link.section}</div>`;
      lastSection = link.section;
    }
    const active = link.href === activePage ? 'active' : '';
    sidebarHTML += `
      <a href="${link.href}" class="sidebar-link ${active}">
        <svg data-lucide="${link.icon}"></svg>
        <span>${link.label}</span>
      </a>`;
  });

  sidebarHTML += `
    <div class="sidebar-bottom">
      <button class="sidebar-logout" onclick="adminLogout()">
        <svg data-lucide="log-out"></svg>
        <span>Sign Out</span>
      </button>
    </div>`;

  document.getElementById('sidebar').innerHTML = sidebarHTML;

  /* ─── Overlay for mobile ─── */
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
  document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

  lucide.createIcons();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
  const ico = document.getElementById('themeIco');
  if (ico) { ico.setAttribute('data-lucide', dark ? 'sun' : 'moon'); lucide.createIcons(); }
}

function adminLogout() {
  localStorage.removeItem('gstake_admin_token');
  localStorage.removeItem('gstake_admin');
  window.location.href = 'admin-login.html';
}

/* Auth guard — redirect to login if no token */
function requireAuth() {
  if (!localStorage.getItem('gstake_admin_token')) {
    window.location.href = 'admin-login.html';
  }
}