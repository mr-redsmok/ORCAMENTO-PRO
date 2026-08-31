// ═══════════════════════════════════════════════════════════════
// RED Tech — Modals, Palette, Toast, WhatsApp
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════════════

function toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    container.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
    }, 2800);
}

// ═══════════════════════════════════════════════════════════════
// Modal
// ═══════════════════════════════════════════════════════════════

function openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

// ═══════════════════════════════════════════════════════════════
// Command Palette
// ═══════════════════════════════════════════════════════════════

const PALETTE_COMMANDS = [
    { icon: '📊', label: 'Ir para Dashboard',    action: () => navigateTo('dashboard'), group: 'Navegação' },
    { icon: '🔧', label: 'Ir para Serviços',     action: () => navigateTo('jobs'), group: 'Navegação' },
    { icon: '👥', label: 'Ir para Clientes',     action: () => navigateTo('clients'), group: 'Navegação' },
    { icon: '💰', label: 'Ir para Financeiro',   action: () => navigateTo('finance'), group: 'Navegação' },
    { icon: '⚙️', label: 'Ir para Configurações', action: () => navigateTo('settings'), group: 'Navegação' },
    { icon: '➕', label: 'Nova OS',              action: () => createNewJob(), group: 'Ações' },
    { icon: '💾', label: 'Exportar dados',        action: () => exportAllData(), group: 'Ações' },
    { icon: '📂', label: 'Importar dados',        action: () => document.getElementById('importFileInput').click(), group: 'Ações' },
    { icon: '🖨️', label: 'Imprimir página',      action: () => window.print(), group: 'Ações' },
];

let paletteSelectedIndex = 0;

function openPalette() {
    const overlay = document.getElementById('paletteOverlay');
    overlay.classList.add('open');
    const input = document.getElementById('paletteInput');
    input.value = '';
    input.focus();
    filterPalette('');
}

function closePalette() {
    document.getElementById('paletteOverlay').classList.remove('open');
}

function filterPalette(query) {
    const q = query.toLowerCase().trim();
    let commands = [...PALETTE_COMMANDS];

    // Always show recent jobs and clients when palette is open
    state.jobs.slice(-8).reverse().forEach(j => {
        commands.push({
            icon: '🔧',
            label: `${j.id} — ${j.clientName || 'Sem cliente'} (${j.equipment || ''})`,
            hint: formatCurrency(getJobTotal(j)),
            action: () => navigateTo('jobEditor', { jobId: j.id }),
            group: 'Serviços Recentes',
        });
    });

    // Also search jobs and clients
    if (q) {
        state.jobs.forEach(j => {
            if ((j.clientName || '').toLowerCase().includes(q) ||
                (j.equipment || '').toLowerCase().includes(q) ||
                j.id.toLowerCase().includes(q)) {
                commands.push({
                    icon: '🔧',
                    label: `${j.id} — ${j.clientName || 'Sem cliente'} (${j.equipment || ''})`,
                    hint: formatCurrency(getJobTotal(j)),
                    action: () => navigateTo('jobEditor', { jobId: j.id }),
                    group: 'Serviços',
                });
            }
        });

        state.clients.forEach(c => {
            if (c.name.toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q)) {
                commands.push({
                    icon: '👤',
                    label: c.name,
                    hint: c.phone || '',
                    action: () => navigateTo('clients'),
                    group: 'Clientes',
                });
            }
        });

        commands = commands.filter(c => c.label.toLowerCase().includes(q) || (c.hint || '').toLowerCase().includes(q));
    }

    paletteSelectedIndex = 0;
    renderPaletteResults(commands);
}

function renderPaletteResults(commands) {
    const container = document.getElementById('paletteResults');
    if (commands.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-4);font-size:12px;">Nenhum resultado encontrado</div>';
        return;
    }

    // Group commands
    const groups = {};
    commands.forEach(c => {
        const g = c.group || 'Outros';
        if (!groups[g]) groups[g] = [];
        groups[g].push(c);
    });

    let html = '';
    let globalIndex = 0;
    for (const [groupName, items] of Object.entries(groups)) {
        html += `<div class="palette-group-label">${groupName}</div>`;
        items.forEach(item => {
            const selected = globalIndex === paletteSelectedIndex ? ' selected' : '';
            html += `
                <div class="palette-item${selected}" data-index="${globalIndex}" onclick="executePaletteItem(${globalIndex})" onmouseenter="paletteSelectedIndex=${globalIndex};highlightPaletteItem()">
                    <span class="palette-item-icon">${item.icon}</span>
                    <span class="palette-item-label">${escHtml(item.label)}</span>
                    ${item.hint ? `<span class="palette-item-hint">${escHtml(item.hint)}</span>` : ''}
                </div>
            `;
            globalIndex++;
        });
    }

    container.innerHTML = html;
    container._commands = commands;
}

function executePaletteItem(index) {
    const container = document.getElementById('paletteResults');
    const commands = container._commands || [];
    if (commands[index]) {
        closePalette();
        commands[index].action();
    }
}

function highlightPaletteItem() {
    document.querySelectorAll('.palette-item').forEach((el, i) => {
        el.classList.toggle('selected', i === paletteSelectedIndex);
    });
}

// ═══════════════════════════════════════════════════════════════
// Client Modal
// ═══════════════════════════════════════════════════════════════

function openAddClientModal() {
    openModal(`
        <div class="modal-title">👤 Novo Cliente</div>
        <div class="form-group">
            <label class="form-label">Nome <span class="req">*</span></label>
            <input class="form-input" id="modal_clientName" placeholder="Nome completo">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Telefone</label>
                <input class="form-input" id="modal_clientPhone" placeholder="(11) 99999-9999">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input class="form-input" id="modal_clientEmail" placeholder="email@exemplo.com">
            </div>
        </div>
        <div class="modal-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="saveNewClient()">💾 Salvar</button>
        </div>
    `);
    setTimeout(() => document.getElementById('modal_clientName')?.focus(), 100);
}

function saveNewClient() {
    const name = (document.getElementById('modal_clientName')?.value || '').trim();
    const phone = (document.getElementById('modal_clientPhone')?.value || '').trim();
    const email = (document.getElementById('modal_clientEmail')?.value || '').trim();

    if (!name) {
        toast('⚠️ Informe o nome do cliente', 'error');
        return;
    }

    // Check for duplicate
    if (state.clients.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        toast('⚠️ Já existe um cliente com este nome', 'error');
        return;
    }

    const client = {
        id: genClientId(),
        name,
        phone,
        email,
        address: '',
        createdAt: new Date().toISOString(),
    };
    state.clients.push(client);
    saveState();
    closeModal();
    renderClients(document.getElementById('contentArea'));
    toast('✅ Cliente "' + name + '" adicionado!');
}

// ═══════════════════════════════════════════════════════════════
// WhatsApp Sharing
// ═══════════════════════════════════════════════════════════════

function shareWhatsApp(jobId) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;

    let msg = `*🖥️ ${state.settings.businessName || 'ASSISTÊNCIA TÉCNICA'}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*OS:* ${job.id}\n`;
    msg += `*Cliente:* ${job.clientName || 'Cliente'}\n`;
    msg += `*Equipamento:* ${job.equipment || 'Não informado'}\n`;
    msg += `*Data:* ${formatDate(job.createdAt)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (job.reportedIssue) {
        msg += `*📌 Problema Relatado:* ${job.reportedIssue}\n`;
    }
    if (job.technicalReport) {
        msg += `*🔧 Laudo Técnico:* ${job.technicalReport}\n`;
    }
    if (job.reportedIssue || job.technicalReport) {
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    }

    msg += `*🛠️ SERVIÇOS:*\n\n`;

    (job.services || []).forEach(s => {
        msg += `🔹 _${s.qty > 1 ? s.qty + 'x ' : ''}${s.name}_: ${formatCurrency(s.price * s.qty)}\n`;
    });
    (job.customItems || []).forEach(c => {
        msg += `📦 _${c.qty > 1 ? c.qty + 'x ' : ''}${c.name}_: ${formatCurrency(c.price * c.qty)}\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*💰 TOTAL: ${formatCurrency(getJobTotal(job))}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (state.settings.pixKey) {
        msg += `\n*🟢 PIX:* ${state.settings.pixKey}\n\n`;
    }

    msg += `Obrigado pela confiança! 🤝`;

    navigator.clipboard.writeText(msg).then(() => {
        toast('📋 Mensagem copiada! Abrindo WhatsApp...');
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    });
}
