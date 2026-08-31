// ═══════════════════════════════════════════════════════════════
// RED Tech — Pages
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// Page: Dashboard
// ═══════════════════════════════════════════════════════════════

function renderDashboard(el) {
    const totalJobs = state.jobs.length;
    const activeJobs = state.jobs.filter(j => ['pendente','em_andamento','aguardando'].includes(j.status)).length;
    const completedJobs = state.jobs.filter(j => j.status === 'concluido' || j.status === 'entregue').length;
    const totalRevenue = state.jobs.reduce((sum, j) => sum + getJobTotal(j), 0);
    const totalClients = state.clients.length;
    const avgTicket = totalJobs > 0 ? totalRevenue / totalJobs : 0;

    const recentJobs = [...state.jobs].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

    // Monthly revenue for chart (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({ label: d.toLocaleDateString('pt-BR', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), revenue: 0 });
    }
    state.jobs.forEach(j => {
        const jd = new Date(j.createdAt);
        const m = months.find(x => x.month === jd.getMonth() && x.year === jd.getFullYear());
        if (m) m.revenue += getJobTotal(j);
    });
    const maxRevenue = Math.max(...months.map(m => m.revenue), 1);

    el.innerHTML = `
        <div class="animate-in">
            <!-- Quick Actions -->
            <div class="quick-actions">
                <div class="quick-btn" onclick="createNewJob()">
                    <div class="quick-btn-icon">➕</div>
                    <div class="quick-btn-label">Nova OS</div>
                </div>
                <div class="quick-btn" onclick="navigateTo('clients')">
                    <div class="quick-btn-icon">👤</div>
                    <div class="quick-btn-label">Novo Cliente</div>
                </div>
                <div class="quick-btn" onclick="navigateTo('finance')">
                    <div class="quick-btn-icon">📈</div>
                    <div class="quick-btn-label">Relatórios</div>
                </div>
            </div>

            <!-- Stats -->
            <div class="dash-stats">
                <div class="stat-card animate-in animate-in-delay-1">
                    <div class="stat-icon green">🔧</div>
                    <div class="stat-value">${totalJobs}</div>
                    <div class="stat-label">Total de OS</div>
                </div>
                <div class="stat-card animate-in animate-in-delay-2">
                    <div class="stat-icon blue">⏳</div>
                    <div class="stat-value">${activeJobs}</div>
                    <div class="stat-label">Em Andamento</div>
                </div>
                <div class="stat-card animate-in animate-in-delay-3">
                    <div class="stat-icon purple">💰</div>
                    <div class="stat-value">${formatCurrency(totalRevenue)}</div>
                    <div class="stat-label">Receita Total</div>
                </div>
                <div class="stat-card animate-in animate-in-delay-4">
                    <div class="stat-icon orange">👥</div>
                    <div class="stat-value">${totalClients}</div>
                    <div class="stat-label">Clientes</div>
                </div>
            </div>

            <div class="dash-grid">
                <!-- Chart -->
                <div class="dash-panel animate-in animate-in-delay-2">
                    <div class="dash-panel-header">
                        <div class="dash-panel-title">Receita Mensal</div>
                    </div>
                    <div class="dash-panel-body">
                        <div class="chart-bar-container" style="margin-bottom:24px;">
                            ${months.map(m => `
                                <div class="chart-bar" style="height:${Math.max((m.revenue / maxRevenue) * 100, 2)}%">
                                    <span class="chart-bar-value">${m.revenue > 0 ? formatCurrency(m.revenue) : ''}</span>
                                    <span class="chart-bar-label">${m.label}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Recent Jobs -->
                <div class="dash-panel animate-in animate-in-delay-3">
                    <div class="dash-panel-header">
                        <div class="dash-panel-title">Serviços Recentes</div>
                        <div class="dash-panel-action" onclick="navigateTo('jobs')">Ver todos →</div>
                    </div>
                    <div class="dash-panel-body">
                        ${recentJobs.length === 0 ? `
                            <div class="empty-state" style="padding:30px 0;">
                                <div class="empty-state-icon">🔧</div>
                                <div class="empty-state-title">Nenhum serviço ainda</div>
                                <div class="empty-state-text">Clique em "Nova OS" para criar o primeiro orçamento</div>
                            </div>
                        ` : recentJobs.map(j => {
                            const si = getStatusInfo(j.status);
                            return `
                                <div class="job-row" onclick="navigateTo('jobEditor', {jobId:'${j.id}'})">
                                    <div class="job-status-dot ${j.status}"></div>
                                    <div class="job-info">
                                        <div class="job-client">${escHtml(j.clientName || 'Sem cliente')}</div>
                                        <div class="job-equip">${escHtml(j.equipment || 'Sem equipamento')}</div>
                                    </div>
                                    <div>
                                        <div class="job-amount">${formatCurrency(getJobTotal(j))}</div>
                                        <div class="job-date">${formatDate(j.createdAt)}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    updateNavBadges();
}

// ═══════════════════════════════════════════════════════════════
// Page: Jobs (List)
// ═══════════════════════════════════════════════════════════════

function renderJobs(el) {
    let filtered = [...state.jobs];
    if (jobFilter !== 'todos') {
        filtered = filtered.filter(j => j.status === jobFilter);
    }
    filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    const statusCounts = {};
    STATUS_LIST.forEach(s => { statusCounts[s.value] = state.jobs.filter(j => j.status === s.value).length; });

    el.innerHTML = `
        <div class="animate-in">
            <div class="page-header">
                <div class="page-title">Serviços</div>
                <button class="btn-primary" onclick="createNewJob()">➕ Nova OS</button>
            </div>

            <div class="filter-bar">
                <div class="filter-chip ${jobFilter === 'todos' ? 'active' : ''}" onclick="jobFilter='todos';renderJobs(document.getElementById('contentArea'))">Todos (${state.jobs.length})</div>
                ${STATUS_LIST.map(s => `
                    <div class="filter-chip ${jobFilter === s.value ? 'active' : ''}" onclick="jobFilter='${s.value}';renderJobs(document.getElementById('contentArea'))">${s.icon} ${s.label} (${statusCounts[s.value]})</div>
                `).join('')}
            </div>

            ${filtered.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">🔧</div>
                    <div class="empty-state-title">${jobFilter === 'todos' ? 'Nenhum serviço registrado' : 'Nenhum serviço com este status'}</div>
                    <div class="empty-state-text">Crie uma nova OS para começar</div>
                    <button class="btn-primary" onclick="createNewJob()">➕ Nova OS</button>
                </div>
            ` : `
                <div class="jobs-grid">
                    ${filtered.map(j => {
                        const si = getStatusInfo(j.status);
                        return `
                            <div class="job-card" onclick="navigateTo('jobEditor', {jobId:'${j.id}'})">
                                <div class="job-card-header">
                                    <div class="job-card-id">${j.id}</div>
                                    <div class="status-badge ${j.status}">${si.icon} ${si.label}</div>
                                </div>
                                <div class="job-card-client">${escHtml(j.clientName || 'Sem cliente')}</div>
                                <div class="job-card-equip">${escHtml(j.equipment || 'Sem equipamento')}</div>
                                <div class="job-card-services">
                                    ${(j.services || []).map(s => `<span class="service-tag">${escHtml(s.name)}</span>`).join('')}
                                    ${(j.customItems || []).map(c => `<span class="service-tag">${escHtml(c.name)}</span>`).join('')}
                                </div>
                                <div class="job-card-footer">
                                    <div class="job-card-total">${formatCurrency(getJobTotal(j))}</div>
                                    <div class="job-card-date">${formatDate(j.createdAt)}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;

    updateNavBadges();
}

// ═══════════════════════════════════════════════════════════════
// Page: Job Editor
// ═══════════════════════════════════════════════════════════════

function renderJobEditor(el) {
    const job = state.jobs.find(j => j.id === currentJobId);
    if (!job) {
        navigateTo('jobs');
        return;
    }

    const si = getStatusInfo(job.status);
    const total = getJobTotal(job);

    el.innerHTML = `
        <div class="animate-in">
            <div class="page-header">
                <div style="display:flex;align-items:center;gap:12px;">
                    <button class="btn-secondary" onclick="navigateTo('jobs')" style="padding:6px 10px;">← Voltar</button>
                    <div>
                        <div class="page-title" style="font-size:17px;">${job.id} — ${escHtml(job.clientName || 'Nova OS')}</div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <select class="form-select" style="width:auto;padding:6px 32px 6px 10px;font-size:12px;" onchange="updateJobStatus('${job.id}', this.value)">
                        ${STATUS_LIST.map(s => `<option value="${s.value}" ${job.status === s.value ? 'selected' : ''}>${s.icon} ${s.label}</option>`).join('')}
                    </select>
                    <button class="btn-danger btn-sm" onclick="deleteJob('${job.id}')">🗑️</button>
                </div>
            </div>

            <div class="editor-layout">
                <!-- Left: Form -->
                <div>
                    <!-- Client Info -->
                    <div class="form-section" style="margin-bottom:14px;">
                        <div class="form-section-title"><div class="dot"></div> Dados do Cliente</div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Nome do Cliente <span class="req">*</span></label>
                                <input class="form-input" id="je_clientName" value="${escAttr(job.clientName || '')}" oninput="updateJobField('${job.id}','clientName',this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Telefone</label>
                                <input class="form-input" id="je_phone" value="${escAttr(job.phone || '')}" oninput="updateJobField('${job.id}','phone',this.value)">
                            </div>
                        </div>
                    </div>

                    <!-- Equipment -->
                    <div class="form-section" style="margin-bottom:14px;">
                        <div class="form-section-title"><div class="dot"></div> Equipamento</div>
                        <div class="form-group">
                            <label class="form-label">Equipamento (Modelo / Marca) <span class="req">*</span></label>
                            <input class="form-input" id="je_equipment" value="${escAttr(job.equipment || '')}" placeholder="Ex: Notebook Dell Inspiron 15 / PC Gamer Ryzen 5" oninput="updateJobField('${job.id}','equipment',this.value)">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Problema Relatado</label>
                                <textarea class="form-textarea" id="je_reportedIssue" oninput="updateJobField('${job.id}','reportedIssue',this.value)">${escHtml(job.reportedIssue || '')}</textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Laudo Técnico</label>
                                <textarea class="form-textarea" id="je_technicalReport" oninput="updateJobField('${job.id}','technicalReport',this.value)">${escHtml(job.technicalReport || '')}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Services -->
                    <div class="form-section" style="margin-bottom:14px;">
                        <div class="form-section-title"><div class="dot"></div> Serviços</div>
                        <div class="svc-list" id="je_servicesList">
                            ${state.services.map(svc => {
                                const existing = (job.services || []).find(s => s.id === svc.id);
                                const checked = !!existing;
                                const qty = existing ? existing.qty : 1;
                                return `
                                    <div class="svc-item ${checked ? 'checked' : ''}" id="svc_${svc.id}">
                                        <input type="checkbox" class="svc-check" ${checked ? 'checked' : ''} onchange="toggleJobService('${job.id}','${svc.id}',this.checked)">
                                        <div class="svc-info">
                                            <div class="svc-name">${escHtml(svc.name)}</div>
                                            <div class="svc-price">${formatCurrency(svc.price)}</div>
                                        </div>
                                        <input type="number" class="svc-qty" value="${qty}" min="1" ${!checked ? 'disabled' : ''} onchange="updateJobServiceQty('${job.id}','${svc.id}',this.value)" id="svcQty_${svc.id}">
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Custom Items -->
                    <div class="form-section" style="margin-bottom:14px;">
                        <div class="form-section-title"><div class="dot"></div> Itens / Peças Avulsos</div>
                        <div class="form-row-3">
                            <div class="form-group" style="margin-bottom:0;">
                                <input class="form-input" id="je_customName" placeholder="Nome do item">
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <input class="form-input" id="je_customPrice" type="number" placeholder="Preço R$" min="0" step="0.01">
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <input class="form-input" id="je_customQty" type="number" placeholder="Qtd" min="1" value="1">
                            </div>
                            <button class="btn-primary btn-sm" onclick="addCustomItemToJob('${job.id}')" style="height:37px;">+ Add</button>
                        </div>
                        <div style="margin-top:8px;" id="je_customItemsList">
                            ${(job.customItems || []).map((c, i) => `
                                <div class="custom-item-row">
                                    <span class="ci-qty">${c.qty}x</span>
                                    <span class="ci-name">${escHtml(c.name)}</span>
                                    <span class="ci-price">${formatCurrency(c.price * c.qty)}</span>
                                    <button class="ci-delete" onclick="removeCustomItemFromJob('${job.id}',${i})">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="form-section">
                        <div class="form-section-title"><div class="dot"></div> Observações Internas</div>
                        <div class="form-group" style="margin-bottom:0;">
                            <textarea class="form-textarea" id="je_notes" placeholder="Notas internas (não aparecem no recibo)..." oninput="updateJobField('${job.id}','notes',this.value)">${escHtml(job.notes || '')}</textarea>
                        </div>
                    </div>
                </div>

                <!-- Right: Receipt Preview -->
                <div>
                    <div class="receipt" id="je_receipt">
                        <div class="receipt-header">
                            <div class="receipt-brand">${escHtml(state.settings.businessName || 'Assistência Técnica')}</div>
                            <div class="receipt-title">Orçamento / Recibo</div>
                            <div class="receipt-meta">${job.id} — ${formatDate(job.createdAt)}</div>
                        </div>

                        <div class="receipt-client-block">
                            <strong>Cliente:</strong> ${escHtml(job.clientName || 'Avulso')}<br>
                            <strong>Equipamento:</strong> ${escHtml(job.equipment || 'Não informado')}<br>
                            ${job.reportedIssue ? `<strong>Relatado:</strong> ${escHtml(job.reportedIssue)}<br>` : ''}
                            ${job.technicalReport ? `<strong>Laudo:</strong> ${escHtml(job.technicalReport)}` : ''}
                        </div>

                        <table class="receipt-table">
                            <thead><tr><th>Descrição</th><th>Valor</th></tr></thead>
                            <tbody id="je_receiptBody">
                                ${renderReceiptItems(job)}
                            </tbody>
                        </table>

                        <div class="receipt-total-bar">
                            <span class="receipt-total-label">Total</span>
                            <span class="receipt-total-value" id="je_receiptTotal">${formatCurrency(total)}</span>
                        </div>

                        <div class="receipt-pix ${state.settings.pixKey ? 'show' : ''}" id="je_receiptPix">
                            <div class="receipt-pix-title">💚 Pague com PIX</div>
                            <div class="receipt-pix-key" onclick="copyText('${escAttr(state.settings.pixKey)}')">${escHtml(state.settings.pixKey)}</div>
                        </div>

                        <div class="receipt-actions">
                            <button class="btn-whatsapp" onclick="shareWhatsApp('${job.id}')">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 1.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                WhatsApp
                            </button>
                            <button class="btn-print" onclick="window.print()">🖨️ PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderReceiptItems(job) {
    const items = [];
    (job.services || []).forEach(s => {
        items.push(`<tr><td>${s.qty > 1 ? s.qty + 'x ' : ''}${escHtml(s.name)}</td><td>${formatCurrency(s.price * s.qty)}</td></tr>`);
    });
    (job.customItems || []).forEach(c => {
        items.push(`<tr><td>${c.qty > 1 ? c.qty + 'x ' : ''}${escHtml(c.name)}</td><td>${formatCurrency(c.price * c.qty)}</td></tr>`);
    });
    return items.length > 0 ? items.join('') : '<tr><td colspan="2" class="receipt-empty">Nenhum item adicionado</td></tr>';
}

// ── Job CRUD ──

function createNewJob() {
    const job = {
        id: genJobId(),
        clientName: '',
        phone: '',
        email: '',
        equipment: '',
        reportedIssue: '',
        technicalReport: '',
        services: [],
        customItems: [],
        status: 'pendente',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    state.jobs.push(job);
    saveState();
    currentJobId = job.id;
    navigateTo('jobEditor', { jobId: job.id });
    toast('✅ Nova OS criada — ' + job.id);
}

function updateJobField(jobId, field, value) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;
    job[field] = value;
    job.updatedAt = new Date().toISOString();
    // Auto-register/update client when relevant fields change
    if (job.clientName && job.clientName.trim()) {
        if (field === 'clientName' || field === 'phone' || field === 'email') {
            findOrCreateClient(job.clientName, job.phone, job.email);
        }
    }
    saveState();
    updateReceiptPreview(job);
}

function updateJobStatus(jobId, status) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;
    job.status = status;
    job.updatedAt = new Date().toISOString();
    saveState();
    const si = getStatusInfo(status);
    toast(`${si.icon} Status alterado para "${si.label}"`);
}

function toggleJobService(jobId, serviceId, checked) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;
    const svcDef = state.services.find(s => s.id === serviceId);
    if (!svcDef) return;

    if (checked) {
        if (!job.services.find(s => s.id === serviceId)) {
            job.services.push({ id: serviceId, name: svcDef.name, price: svcDef.price, qty: 1 });
        }
    } else {
        job.services = job.services.filter(s => s.id !== serviceId);
    }

    job.updatedAt = new Date().toISOString();
    saveState();

    // Update UI
    const itemEl = document.getElementById('svc_' + serviceId);
    const qtyEl = document.getElementById('svcQty_' + serviceId);
    if (itemEl) itemEl.classList.toggle('checked', checked);
    if (qtyEl) qtyEl.disabled = !checked;

    updateReceiptPreview(job);
}

function updateJobServiceQty(jobId, serviceId, qty) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;
    const svc = job.services.find(s => s.id === serviceId);
    if (svc) {
        svc.qty = Math.max(1, parseInt(qty) || 1);
        job.updatedAt = new Date().toISOString();
        saveState();
        updateReceiptPreview(job);
    }
}

function addCustomItemToJob(jobId) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;

    const nameEl = document.getElementById('je_customName');
    const priceEl = document.getElementById('je_customPrice');
    const qtyEl = document.getElementById('je_customQty');

    const name = (nameEl.value || '').trim();
    const price = parseFloat(priceEl.value);
    const qty = parseInt(qtyEl.value) || 1;

    if (!name || isNaN(price) || price < 0) {
        toast('⚠️ Preencha nome e preço válidos', 'error');
        return;
    }

    if (!job.customItems) job.customItems = [];
    job.customItems.push({ name, price, qty });
    job.updatedAt = new Date().toISOString();
    saveState();

    nameEl.value = '';
    priceEl.value = '';
    qtyEl.value = '1';

    renderJobEditor(document.getElementById('contentArea'));
    toast('✅ Item adicionado');
}

function removeCustomItemFromJob(jobId, index) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job || !job.customItems) return;
    job.customItems.splice(index, 1);
    job.updatedAt = new Date().toISOString();
    saveState();
    renderJobEditor(document.getElementById('contentArea'));
}

function deleteJob(jobId) {
    if (!confirm('Tem certeza que deseja apagar esta OS? Esta ação não pode ser desfeita.')) return;
    state.jobs = state.jobs.filter(j => j.id !== jobId);
    saveState();
    navigateTo('jobs');
    toast('🗑️ OS apagada');
}

function updateReceiptPreview(job) {
    const totalEl = document.getElementById('je_receiptTotal');
    const bodyEl = document.getElementById('je_receiptBody');
    const clientBlock = document.querySelector('.receipt-client-block');
    if (totalEl) totalEl.textContent = formatCurrency(getJobTotal(job));
    if (bodyEl) bodyEl.innerHTML = renderReceiptItems(job);
    if (clientBlock) {
        clientBlock.innerHTML = `
            <strong>Cliente:</strong> ${escHtml(job.clientName || 'Avulso')}<br>
            <strong>Equipamento:</strong> ${escHtml(job.equipment || 'Não informado')}<br>
            ${job.reportedIssue ? `<strong>Relatado:</strong> ${escHtml(job.reportedIssue)}<br>` : ''}
            ${job.technicalReport ? `<strong>Laudo:</strong> ${escHtml(job.technicalReport)}` : ''}
        `;
    }
    // Update page title
    const titleEl = document.querySelector('.page-title');
    if (titleEl) titleEl.textContent = `${job.id} — ${escHtml(job.clientName || 'Nova OS')}`;
}

// ═══════════════════════════════════════════════════════════════
// Page: Clients
// ═══════════════════════════════════════════════════════════════

function renderClients(el) {
    const clients = [...state.clients].sort((a,b) => a.name.localeCompare(b.name));

    el.innerHTML = `
        <div class="animate-in">
            <div class="page-header">
                <div class="page-title">Clientes</div>
                <button class="btn-primary" onclick="openAddClientModal()">➕ Novo Cliente</button>
            </div>

            ${clients.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-title">Nenhum cliente registrado</div>
                    <div class="empty-state-text">Adicione um cliente manualmente ou ele será registado automaticamente ao criar uma OS</div>
                    <button class="btn-primary" onclick="openAddClientModal()">➕ Adicionar Cliente</button>
                </div>
            ` : `
                <div class="clients-table-wrap">
                    <table class="clients-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th>Serviços</th>
                                <th>Total Gasto</th>
                                <th>Desde</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clients.map((c, ci) => {
                                const clientJobs = state.jobs.filter(j => j.clientName && j.clientName.toLowerCase() === c.name.toLowerCase());
                                const totalSpent = clientJobs.reduce((sum, j) => sum + getJobTotal(j), 0);
                                return `
                                    <tr>
                                        <td>${escHtml(c.name)}</td>
                                        <td>${escHtml(c.phone || '—')}</td>
                                        <td>${escHtml(c.email || '—')}</td>
                                        <td><span class="client-jobs-count">${clientJobs.length}</span></td>
                                        <td style="font-family:'JetBrains Mono',monospace;color:var(--green);font-weight:700;">${formatCurrency(totalSpent)}</td>
                                        <td>${formatDate(c.createdAt)}</td>
                                        <td><button class="ci-delete" onclick="deleteClient('${c.id}')" title="Apagar cliente">✕</button></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    updateNavBadges();
}

function deleteClient(clientId) {
    const idx = state.clients.findIndex(c => c.id === clientId);
    if (idx === -1) return;
    const client = state.clients[idx];
    if (!confirm('Apagar o cliente "' + client.name + '"?')) return;
    state.clients.splice(idx, 1);
    saveState();
    renderClients(document.getElementById('contentArea'));
    toast('🗑️ Cliente apagado');
}

// ═══════════════════════════════════════════════════════════════
// Page: Finance
// ═══════════════════════════════════════════════════════════════

function renderFinance(el) {
    const totalRevenue = state.jobs.reduce((sum, j) => sum + getJobTotal(j), 0);
    const completedRevenue = state.jobs.filter(j => ['concluido','entregue'].includes(j.status)).reduce((sum, j) => sum + getJobTotal(j), 0);
    const pendingRevenue = state.jobs.filter(j => ['pendente','em_andamento','aguardando'].includes(j.status)).reduce((sum, j) => sum + getJobTotal(j), 0);
    const avgTicket = state.jobs.length > 0 ? totalRevenue / state.jobs.length : 0;

    // Monthly breakdown
    const months = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
            label: d.toLocaleDateString('pt-BR', { month: 'short' }),
            month: d.getMonth(),
            year: d.getFullYear(),
            revenue: 0,
            count: 0
        });
    }
    state.jobs.forEach(j => {
        const jd = new Date(j.createdAt);
        const m = months.find(x => x.month === jd.getMonth() && x.year === jd.getFullYear());
        if (m) { m.revenue += getJobTotal(j); m.count++; }
    });
    const maxRevenue = Math.max(...months.map(m => m.revenue), 1);

    // Top services
    const serviceCounts = {};
    state.jobs.forEach(j => {
        (j.services || []).forEach(s => {
            serviceCounts[s.name] = (serviceCounts[s.name] || 0) + 1;
        });
    });
    const topServices = Object.entries(serviceCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

    el.innerHTML = `
        <div class="animate-in">
            <div class="page-header">
                <div class="page-title">Financeiro</div>
            </div>

            <div class="finance-summary">
                <div class="finance-card animate-in animate-in-delay-1">
                    <div class="finance-card-value green">${formatCurrency(totalRevenue)}</div>
                    <div class="finance-card-label">Receita Total</div>
                </div>
                <div class="finance-card animate-in animate-in-delay-2">
                    <div class="finance-card-value yellow">${formatCurrency(pendingRevenue)}</div>
                    <div class="finance-card-label">Pendente</div>
                </div>
                <div class="finance-card animate-in animate-in-delay-3">
                    <div class="finance-card-value blue">${formatCurrency(avgTicket)}</div>
                    <div class="finance-card-label">Ticket Médio</div>
                </div>
            </div>

            <!-- Monthly Chart -->
            <div class="chart-placeholder animate-in animate-in-delay-2">
                <div style="font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:16px;">Receita Mensal (Últimos 12 meses)</div>
                <div class="chart-bar-container" style="margin-bottom:28px;">
                    ${months.map(m => `
                        <div class="chart-bar" style="height:${Math.max((m.revenue / maxRevenue) * 100, 2)}%">
                            <span class="chart-bar-value">${m.revenue > 0 ? formatCurrency(m.revenue) : ''}</span>
                            <span class="chart-bar-label">${m.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Top Services -->
            <div class="dash-panel animate-in animate-in-delay-3">
                <div class="dash-panel-header">
                    <div class="dash-panel-title">Serviços Mais Pedidos</div>
                </div>
                <div class="dash-panel-body">
                    ${topServices.length === 0 ? '<div style="color:var(--text-4);font-size:12px;padding:12px 0;">Sem dados ainda</div>' :
                        topServices.map(([name, count], i) => {
                            const maxCount = topServices[0][1];
                            const pct = (count / maxCount) * 100;
                            return `
                                <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--glass-border);">
                                    <span style="font-size:11px;color:var(--text-4);width:16px;font-weight:700;">#${i+1}</span>
                                    <div style="flex:1;">
                                        <div style="font-size:12px;font-weight:600;color:var(--text-1);margin-bottom:4px;">${escHtml(name)}</div>
                                        <div style="height:4px;background:var(--bg-4);border-radius:2px;overflow:hidden;">
                                            <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:2px;transition:width 0.5s;"></div>
                                        </div>
                                    </div>
                                    <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text-3);font-weight:700;">${count}x</span>
                                </div>
                            `;
                        }).join('')}
                </div>
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════
// Page: Settings
// ═══════════════════════════════════════════════════════════════

function renderSettings(el) {
    const s = state.settings;
    el.innerHTML = `
        <div class="animate-in">
            <div class="page-header">
                <div class="page-title">Configurações</div>
            </div>

            <div class="settings-grid">
                <!-- Business Info -->
                <div class="form-section">
                    <div class="form-section-title"><div class="dot"></div> Dados do Negócio</div>
                    <div class="form-group">
                        <label class="form-label">Nome do Negócio</label>
                        <input class="form-input" value="${escAttr(s.businessName)}" oninput="updateSetting('businessName',this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Responsável</label>
                        <input class="form-input" value="${escAttr(s.ownerName)}" oninput="updateSetting('ownerName',this.value)">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Telefone</label>
                            <input class="form-input" value="${escAttr(s.phone)}" oninput="updateSetting('phone',this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input class="form-input" value="${escAttr(s.email)}" oninput="updateSetting('email',this.value)">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Endereço</label>
                        <input class="form-input" value="${escAttr(s.address)}" oninput="updateSetting('address',this.value)">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">CNPJ</label>
                            <input class="form-input" value="${escAttr(s.cnpj)}" oninput="updateSetting('cnpj',this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chave PIX</label>
                            <input class="form-input" value="${escAttr(s.pixKey)}" oninput="updateSetting('pixKey',this.value)">
                        </div>
                    </div>
                </div>

                <!-- Services Management -->
                <div class="form-section">
                    <div class="form-section-title"><div class="dot"></div> Catálogo de Serviços</div>
                    <div style="max-height:400px;overflow-y:auto;">
                        ${state.services.map((svc, i) => `
                            <div class="custom-item-row" style="cursor:default;">
                                <span class="ci-name" style="flex:1;">${escHtml(svc.name)}</span>
                                <span class="ci-price">${formatCurrency(svc.price)}</span>
                                <button class="ci-delete" onclick="removeService(${i})">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top:12px;">
                        <div class="form-row-3">
                            <div class="form-group" style="margin-bottom:0;">
                                <input class="form-input" id="newSvcName" placeholder="Nome do serviço">
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <input class="form-input" id="newSvcPrice" type="number" placeholder="Preço R$" min="0" step="0.01">
                            </div>
                            <div></div>
                            <button class="btn-primary btn-sm" onclick="addService()" style="height:37px;">+ Add</button>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="form-section">
                    <div class="form-section-title"><div class="dot"></div> Dados</div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <button class="btn-secondary" onclick="exportAllData()" style="width:100%;justify-content:center;">💾 Exportar Todos os Dados (JSON)</button>
                        <button class="btn-secondary" onclick="document.getElementById('importFileInput').click()" style="width:100%;justify-content:center;">📂 Importar Dados (JSON)</button>
                        <button class="btn-danger" onclick="clearAllData()" style="width:100%;justify-content:center;">⚠️ Apagar Todos os Dados</button>
                    </div>
                    <div class="form-hint" style="margin-top:8px;">Exporte regularmente para manter um backup dos seus dados.</div>
                </div>

                <!-- About -->
                <div class="form-section">
                    <div class="form-section-title"><div class="dot"></div> Sobre</div>
                    <div style="font-size:12px;color:var(--text-2);line-height:1.8;">
                        <strong style="color:var(--text-1);">RED Tech</strong> — Sistema de Gestão para Assistência Técnica<br>
                        Versão 2.0 — Reimaginado por IA<br><br>
                        <strong style="color:var(--text-1);">Funcionalidades:</strong><br>
                        • Dashboard com métricas em tempo real<br>
                        • Gestão de múltiplos serviços (OS)<br>
                        • Base de dados de clientes<br>
                        • Relatórios financeiros<br>
                        • Paleta de comandos (⌘K)<br>
                        • Atalhos de teclado<br>
                        • Persistência offline (localStorage)<br>
                        • Exportação/Importação de dados<br>
                        • Design responsivo (mobile-first)<br>
                        • Geração de mensagens WhatsApp<br>
                        • Impressão / Exportação PDF
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateSetting(field, value) {
    state.settings[field] = value;
    saveState();
}

function addService() {
    const nameEl = document.getElementById('newSvcName');
    const priceEl = document.getElementById('newSvcPrice');
    const name = (nameEl.value || '').trim();
    const price = parseFloat(priceEl.value);

    if (!name || isNaN(price) || price < 0) {
        toast('⚠️ Preencha nome e preço válidos', 'error');
        return;
    }

    state.services.push({ id: 's' + Date.now(), name, price });
    saveState();
    renderSettings(document.getElementById('contentArea'));
    toast('✅ Serviço adicionado');
}

function removeService(index) {
    state.services.splice(index, 1);
    saveState();
    renderSettings(document.getElementById('contentArea'));
}
