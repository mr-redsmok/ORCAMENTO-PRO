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
