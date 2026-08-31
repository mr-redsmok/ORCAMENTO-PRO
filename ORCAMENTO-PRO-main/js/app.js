// ═══════════════════════════════════════════════════════════════
// RED Tech — App (Navigation + Init)
// ═══════════════════════════════════════════════════════════════

// ── Navigation / SPA Router ──

function navigateTo(page, opts) {
    currentPage = page;
    if (opts && opts.jobId) currentJobId = opts.jobId;

    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });

    // Update topbar title
    const titles = {
        dashboard: 'Dashboard',
        jobs: 'Serviços',
        jobEditor: 'Editor de OS',
        clients: 'Clientes',
        finance: 'Financeiro',
        settings: 'Configurações',
    };
    document.getElementById('topbarTitle').textContent = titles[page] || 'RED Tech';

    // Render page
    const content = document.getElementById('contentArea');
    content.scrollTop = 0;

    switch(page) {
        case 'dashboard':  renderDashboard(content); break;
        case 'jobs':       renderJobs(content); break;
        case 'jobEditor':  renderJobEditor(content); break;
        case 'clients':    renderClients(content); break;
        case 'finance':    renderFinance(content); break;
        case 'settings':   renderSettings(content); break;
    }

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function updateNavBadges() {
    document.getElementById('navJobCount').textContent = state.jobs.length;
    document.getElementById('navClientCount').textContent = state.clients.length;
}

// ═══════════════════════════════════════════════════════════════
// Keyboard Shortcuts
// ═══════════════════════════════════════════════════════════════

document.addEventListener('keydown', function(e) {
    const isPaletteOpen = document.getElementById('paletteOverlay').classList.contains('open');
    const isModalOpen = document.getElementById('modalOverlay').classList.contains('open');
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    // Command Palette: Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isPaletteOpen) {
            closePalette();
        } else {
            openPalette();
        }
        return;
    }

    // Escape
    if (e.key === 'Escape') {
        if (isPaletteOpen) { closePalette(); return; }
        if (isModalOpen) { closeModal(); return; }
    }

    // Palette navigation
    if (isPaletteOpen) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const container = document.getElementById('paletteResults');
            const max = (container._commands || []).length - 1;
            paletteSelectedIndex = Math.min(paletteSelectedIndex + 1, max);
            highlightPaletteItem();
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            paletteSelectedIndex = Math.max(paletteSelectedIndex - 1, 0);
            highlightPaletteItem();
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            executePaletteItem(paletteSelectedIndex);
            return;
        }
    }

    // Skip shortcuts when typing in inputs
    if (isInput || isPaletteOpen || isModalOpen) return;

    // Cmd/Ctrl + N: New Job
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewJob();
        return;
    }

    // Number keys: Quick navigation
    if (e.key === '1') { navigateTo('dashboard'); return; }
    if (e.key === '2') { navigateTo('jobs'); return; }
    if (e.key === '3') { navigateTo('clients'); return; }
    if (e.key === '4') { navigateTo('finance'); return; }
    if (e.key === '5') { navigateTo('settings'); return; }
});

// ═══════════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════════

loadState();
navigateTo('dashboard');
