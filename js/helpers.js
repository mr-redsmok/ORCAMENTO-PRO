// ═══════════════════════════════════════════════════════════════
// RED Tech — Helpers
// ═══════════════════════════════════════════════════════════════

// ── ID Generators ──
function genJobId() { return `OS-${String(state.nextJobId++).padStart(4, '0')}`; }

function genClientId() { return 'C-' + Date.now().toString(36).toUpperCase(); }

// ── Formatters ──
function formatCurrency(v) {
    return 'R$ ' + Number(v).toFixed(2).replace('.', ',');
}

function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(d) {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ── Job Helpers ──
function getJobTotal(job) {
    let total = 0;
    (job.services || []).forEach(s => { total += s.price * s.qty; });
    (job.customItems || []).forEach(c => { total += c.price * c.qty; });
    return total;
}

function getStatusInfo(value) {
    return STATUS_LIST.find(s => s.value === value) || STATUS_LIST[0];
}

// ── Client Helpers ──
function findOrCreateClient(name, phone, email) {
    if (!name || !name.trim()) return null;
    name = name.trim();
    const existing = state.clients.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        if (phone && phone.trim()) existing.phone = phone.trim();
        if (email && email.trim()) existing.email = email.trim();
        return existing;
    }
    const client = {
        id: genClientId(),
        name,
        phone: (phone || '').trim(),
        email: (email || '').trim(),
        address: '',
        createdAt: new Date().toISOString(),
    };
    state.clients.push(client);
    return client;
}

// ── HTML Escape ──
const ICON_PATHS = {
    'layout-dashboard': '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'users': '<circle cx="9" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M2 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>',
    'user': '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>',
    'user-plus': '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
    'wallet': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14.5" r="1"/>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'settings': '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    'folder-open': '<path d="M6 14l1.5-2.5A2 2 0 0 1 9.2 10H20a2 2 0 0 1 2 2.5l-1.5 6A2 2 0 0 1 18.5 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v1"/>',
    'printer': '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
};

function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ''}</svg>`;
}

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Clipboard ──
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => toast('📋 Copiado!'));
}
