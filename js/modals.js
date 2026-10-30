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
    { icon: icon('layout-dashboard'), label: 'Ir para Dashboard',    action: () => navigateTo('dashboard'), group: 'Navegação' },
    { icon: icon('wrench'), label: 'Ir para Serviços',     action: () => navigateTo('jobs'), group: 'Navegação' },
    { icon: icon('users'), label: 'Ir para Clientes',     action: () => navigateTo('clients'), group: 'Navegação' },
    { icon: icon('wallet'), label: 'Ir para Financeiro',   action: () => navigateTo('finance'), group: 'Navegação' },
    { icon: icon('settings'), label: 'Ir para Configurações', action: () => navigateTo('settings'), group: 'Navegação' },
    { icon: icon('plus'), label: 'Nova OS',              action: () => createNewJob(), group: 'Ações' },
    { icon: icon('save'), label: 'Exportar dados',        action: () => exportAllData(), group: 'Ações' },
    { icon: icon('folder-open'), label: 'Importar dados',        action: () => document.getElementById('importFileInput').click(), group: 'Ações' },
    { icon: icon('printer'), label: 'Imprimir página',      action: () => window.print(), group: 'Ações' },
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
            icon: icon('wrench'),
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
                    icon: icon('wrench'),
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
                    icon: icon('user'),
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
        <div class="modal-title">${icon('user-plus')} Novo Cliente</div>
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
            <button class="btn-primary" onclick="saveNewClient()">${icon('save')} Salvar</button>
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
// Promoções
// ═══════════════════════════════════════════════════════════════

const PROMO_AVULSO = '__avulso__';

let promoModal = { jobId: null, selected: null, type: 'percent', value: 0, regulation: '', accepted: false };

function openPromotionModal(jobId) {
    promoModal = { jobId: jobId || null, selected: null, type: 'percent', value: 0, regulation: '', accepted: false };
    renderPromotionModal();
}

function currentPromoChoice() {
    if (promoModal.selected === PROMO_AVULSO) {
        return { name: 'Desconto avulso', type: promoModal.type, value: Number(promoModal.value) || 0, regulation: promoModal.regulation };
    }
    if (!promoModal.selected) return null;
    return state.promotions.find(p => p.id === promoModal.selected) || null;
}

function renderPromotionModal() {
    const job = promoModal.jobId ? state.jobs.find(j => j.id === promoModal.jobId) : null;
    const subtotal = job ? getJobSubtotal(job) : 0;
    const available = state.promotions.filter(isPromotionActive);
    const current = job ? job.promotion : null;
    const isAvulso = promoModal.selected === PROMO_AVULSO;
    const choice = currentPromoChoice();
    const canApply = !!choice && promoModal.accepted;

    openModal(`
        <div class="modal-title">${icon('percent')} Promoção</div>

        ${subtotal > 0 ? `<div class="promo-subtotal">Subtotal da OS <strong>${formatCurrency(subtotal)}</strong></div>` : ''}

        ${current ? `<div class="promo-current">Promoção aplicada: <strong>${escHtml(current.name)}</strong></div>` : ''}

        <div class="promo-list">
            ${available.map(p => `
                <label class="promo-option ${promoModal.selected === p.id ? 'selected' : ''}">
                    <input type="radio" name="promoPick" ${promoModal.selected === p.id ? 'checked' : ''} onchange="selectPromotion('${p.id}')">
                    <span class="promo-opt-name">${escHtml(p.name)}</span>
                    <span class="promo-opt-value">${promotionLabel(p)}</span>
                </label>
            `).join('')}
            <label class="promo-option ${isAvulso ? 'selected' : ''}">
                <input type="radio" name="promoPick" ${isAvulso ? 'checked' : ''} onchange="selectPromotion('${PROMO_AVULSO}')">
                <span class="promo-opt-name">Desconto avulso</span>
                <span class="promo-opt-value">definir agora</span>
            </label>
        </div>

        ${available.length === 0 ? '<div class="promo-hint">Nenhuma promoção cadastrada ou válida. Use o desconto avulso, ou cadastre promoções em Configurações.</div>' : ''}

        <div class="promo-detail">
            ${isAvulso ? `
                <div class="form-row-3">
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" onchange="setPromoType(this.value)">
                            <option value="percent" ${promoModal.type === 'percent' ? 'selected' : ''}>Percentual (%)</option>
                            <option value="fixed" ${promoModal.type === 'fixed' ? 'selected' : ''}>Valor fixo (R$)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">Valor</label>
                        <input class="form-input" id="promoValueInput" type="number" min="0" step="0.01" value="${promoModal.value || ''}" oninput="setPromoValue(this.value)">
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px;">
                    <label class="form-label">Regulamento <span class="req">*</span></label>
                    <textarea class="form-textarea" id="promoRegulationInput" placeholder="Regras da promoção..." oninput="setPromoRegulation(this.value)">${escHtml(promoModal.regulation)}</textarea>
                </div>
            ` : choice ? `
                <div class="promo-regulation">
                    <div class="promo-reg-title">Regulamento</div>
                    <div class="promo-reg-text">${escHtml(choice.regulation || 'Sem regulamento cadastrado para esta promoção.')}</div>
                </div>
            ` : '<div class="promo-hint">Selecione uma promoção para ver o regulamento.</div>'}
        </div>

        <div class="promo-preview" id="promoPreview"></div>

        <label class="promo-accept">
            <input type="checkbox" id="promoAccept" ${promoModal.accepted ? 'checked' : ''} onchange="togglePromoAccept()">
            <span>Li e concordo com o regulamento</span>
        </label>

        <div class="modal-actions">
            ${current ? '<button class="btn-danger" onclick="removePromotion()">Remover</button>' : ''}
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" id="promoApplyBtn" onclick="applyPromotion()" ${canApply ? '' : 'disabled'}>Aplicar</button>
        </div>
    `);

    updatePromoPreview();
}

function selectPromotion(id) {
    promoModal.selected = id;
    promoModal.accepted = false;
    if (id === PROMO_AVULSO) {
        promoModal.type = 'percent';
        promoModal.value = 0;
        promoModal.regulation = '';
    }
    renderPromotionModal();
}

function setPromoType(type) {
    promoModal.type = type;
    updatePromoPreview();
    updatePromoApplyBtn();
}

function setPromoValue(value) {
    promoModal.value = Number(value) || 0;
    updatePromoPreview();
    updatePromoApplyBtn();
}

function setPromoRegulation(text) {
    promoModal.regulation = text;
    updatePromoApplyBtn();
}

function togglePromoAccept() {
    promoModal.accepted = document.getElementById('promoAccept')?.checked || false;
    updatePromoApplyBtn();
}

function updatePromoApplyBtn() {
    const btn = document.getElementById('promoApplyBtn');
    if (!btn) return;
    const choice = currentPromoChoice();
    btn.disabled = !!(promoModal.accepted && (!choice || (choice.type === 'percent' && !choice.value)));
}

function updatePromoPreview() {
    const el = document.getElementById('promoPreview');
    if (!el) return;
    const job = promoModal.jobId ? state.jobs.find(j => j.id === promoModal.jobId) : null;
    const subtotal = job ? getJobSubtotal(job) : 0;
    const choice = currentPromoChoice();
    const discount = getPromotionDiscount(subtotal, choice);
    if (!choice || discount <= 0) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `Desconto <strong>−${formatCurrency(discount)}</strong> · Total <strong>${formatCurrency(Math.max(0, subtotal - discount))}</strong>`;
}

function applyPromotion() {
    const job = promoModal.jobId ? state.jobs.find(j => j.id === promoModal.jobId) : null;
    if (!job) {
        toast('⚠️ OS não encontrada', 'error');
        return;
    }
    if (!promoModal.accepted) {
        toast('⚠️ Aceite o regulamento para aplicar a promoção', 'error');
        return;
    }

    const choice = currentPromoChoice();
    if (!choice) {
        toast('⚠️ Selecione uma promoção', 'error');
        return;
    }
    if (!choice.value || choice.value <= 0) {
        toast('⚠️ Informe o valor do desconto', 'error');
        return;
    }
    if (!choice.regulation || !choice.regulation.trim()) {
        toast('⚠️ A promoção precisa de regulamento', 'error');
        return;
    }

    job.promotion = {
        id: choice.id || null,
        name: choice.name,
        type: choice.type,
        value: Number(choice.value),
        regulation: choice.regulation.trim(),
        appliedAt: new Date().toISOString(),
    };
    job.updatedAt = new Date().toISOString();
    saveState();
    closeModal();
    refreshCurrentPage();
    toast('✅ Promoção aplicada: ' + job.promotion.name);
}

function removePromotion() {
    const job = promoModal.jobId ? state.jobs.find(j => j.id === promoModal.jobId) : null;
    if (!job) return;
    delete job.promotion;
    job.updatedAt = new Date().toISOString();
    saveState();
    closeModal();
    refreshCurrentPage();
    toast('Promoção removida');
}

// ═══════════════════════════════════════════════════════════════
// Cadastro de promoções (Configurações)
// ═══════════════════════════════════════════════════════════════

let promoFormIndex = null;

function openPromotionSettingsModal(index) {
    promoFormIndex = (index === undefined || index === null) ? null : index;
    const p = promoFormIndex !== null ? state.promotions[promoFormIndex] : null;

    openModal(`
        <div class="modal-title">${icon('tag')} ${p ? 'Editar Promoção' : 'Nova Promoção'}</div>

        <div class="form-group">
            <label class="form-label">Nome da promoção <span class="req">*</span></label>
            <input class="form-input" id="pf_name" value="${escAttr(p ? p.name : '')}" placeholder="Ex: Promoção Pixels">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Tipo de desconto</label>
                <select class="form-select" id="pf_type">
                    <option value="percent" ${p && p.type === 'fixed' ? '' : 'selected'}>Percentual (%)</option>
                    <option value="fixed" ${p && p.type === 'fixed' ? 'selected' : ''}>Valor fixo (R$)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Valor <span class="req">*</span></label>
                <input class="form-input" id="pf_value" type="number" min="0" step="0.01" value="${p ? p.value : ''}" placeholder="10">
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Válido até</label>
            <input class="form-input" id="pf_validUntil" type="date" value="${p && p.validUntil ? p.validUntil : ''}">
        </div>

        <div class="form-group">
            <label class="form-label">Regulamento <span class="req">*</span></label>
            <textarea class="form-textarea" id="pf_regulation" placeholder="Regras da promoção...">${escHtml(p ? p.regulation : '')}</textarea>
        </div>

        <div class="form-group">
            <label class="promo-accept" style="margin:0;">
                <input type="checkbox" id="pf_active" ${!p || p.active !== false ? 'checked' : ''}>
                <span>Promoção ativa</span>
            </label>
        </div>

        <div class="modal-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="savePromotion()">${icon('save')} Salvar</button>
        </div>
    `);
    setTimeout(() => document.getElementById('pf_name')?.focus(), 100);
}

function savePromotion() {
    const name = (document.getElementById('pf_name')?.value || '').trim();
    const type = document.getElementById('pf_type')?.value || 'percent';
    const value = Number(document.getElementById('pf_value')?.value) || 0;
    const validUntil = document.getElementById('pf_validUntil')?.value || '';
    const regulation = (document.getElementById('pf_regulation')?.value || '').trim();
    const active = document.getElementById('pf_active')?.checked !== false;

    if (!name) { toast('⚠️ Informe o nome da promoção', 'error'); return; }
    if (value <= 0) { toast('⚠️ Informe o valor do desconto', 'error'); return; }
    if (!regulation) { toast('⚠️ Escreva o regulamento da promoção', 'error'); return; }

    const promo = { id: promoFormIndex !== null && state.promotions[promoFormIndex] ? state.promotions[promoFormIndex].id : genPromoId(), name, type, value, validUntil, regulation, active };

    if (promoFormIndex !== null && state.promotions[promoFormIndex]) {
        state.promotions[promoFormIndex] = promo;
    } else {
        state.promotions.push(promo);
    }

    saveState();
    closeModal();
    renderSettings(document.getElementById('contentArea'));
    toast('✅ Promoção "' + name + '" salva');
}

function togglePromotion(index) {
    const p = state.promotions[index];
    if (!p) return;
    p.active = p.active === false;
    saveState();
    renderSettings(document.getElementById('contentArea'));
}

function deletePromotion(index) {
    const p = state.promotions[index];
    if (!p) return;
    if (!confirm('Excluir a promoção "' + p.name + '"?')) return;
    state.promotions.splice(index, 1);
    saveState();
    renderSettings(document.getElementById('contentArea'));
    toast('Promoção excluída');
}

function genPromoId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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
    const discount = getJobDiscount(job);
    if (job.promotion && discount > 0) {
        msg += `*🎁 PROMOÇÃO:* ${job.promotion.name} (−${formatCurrency(discount)})\n`;
    }
    msg += `*💰 TOTAL: ${formatCurrency(getJobTotal(job))}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (state.settings.pixKey) {
        msg += `\n*🟢 PIX:* ${state.settings.pixKey}\n\n`;
    }

    if (job.promotion && job.promotion.regulation) {
        msg += `\n*📜 REGULAMENTO DA PROMOÇÃO:*\n`;
        msg += `_${job.promotion.regulation}_\n\n`;
    }

    msg += `Obrigado pela confiança! 🤝`;

    navigator.clipboard.writeText(msg).then(() => {
        toast('📋 Mensagem copiada! Abrindo WhatsApp...');
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    });
}
