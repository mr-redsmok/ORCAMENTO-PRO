// ═══════════════════════════════════════════════════════════════
// RED Tech — Persistence
// ═══════════════════════════════════════════════════════════════

function saveState() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(state)); } catch(e) { console.error('Save failed:', e); }
}

function loadState() {
    try {
        const raw = localStorage.getItem(DB_KEY);
        if (raw) {
            const loaded = JSON.parse(raw);
            state = { ...state, ...loaded };
        }
    } catch(e) { console.error('Load failed:', e); }
}

function exportAllData() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redtech_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('💾 Dados exportados!');
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.jobs || data.settings) {
                state = { ...state, ...data };
                saveState();
                navigateTo(currentPage);
                toast('📂 Dados importados com sucesso!');
            } else {
                toast('⚠️ Formato de arquivo inválido', 'error');
            }
        } catch(err) {
            toast('⚠️ Erro ao ler arquivo', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function clearAllData() {
    if (!confirm('⚠️ ATENÇÃO: Isto irá apagar TODOS os dados (serviços, clientes, configurações). Esta ação não pode ser desfeita.\n\nTem certeza absoluta?')) return;
    if (!confirm('Última confirmação: Apagar tudo?')) return;
    localStorage.removeItem(DB_KEY);
    location.reload();
}
