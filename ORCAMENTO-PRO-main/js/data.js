// ═══════════════════════════════════════════════════════════════
// RED Tech — Data Store
// ═══════════════════════════════════════════════════════════════

const DB_KEY = 'redtech_data';

const DEFAULT_SERVICES = [
    { id: 's1',  name: 'Formatação',                        price: 100 },
    { id: 's2',  name: 'Formatação com Backup (até 50GB)',  price: 115 },
    { id: 's3',  name: 'Backup Extra (acima de 50GB)',       price: 40  },
    { id: 's4',  name: 'Limpeza Básica',                    price: 40  },
    { id: 's5',  name: 'Limpeza Completa',                  price: 60  },
    { id: 's6',  name: 'Limpeza Detalhada',                 price: 80  },
    { id: 's7',  name: 'Troca de Pasta Térmica',            price: 50  },
    { id: 's8',  name: 'Instalação de Programas',           price: 60  },
    { id: 's9',  name: 'Diagnóstico Completo',              price: 70  },
    { id: 's10', name: 'Recuperação de Dados',              price: 150 },
    { id: 's11', name: 'Reballing / Reflow GPU',            price: 200 },
    { id: 's12', name: 'Substituição de HD/SSD',            price: 80  },
    { id: 's13', name: 'Upgrade de Memória RAM',            price: 50  },
    { id: 's14', name: 'Instalação de Windows/Linux',       price: 90  },
    { id: 's15', name: 'Remoção de Vírus/Malware',          price: 80  },
    { id: 's16', name: 'Configuração de Rede/Wi-Fi',        price: 60  },
    { id: 's17', name: 'Manutenção Preventiva',             price: 70  },
    { id: 's18', name: 'Solda / Reparo de Placa',           price: 150 },
];

const STATUS_LIST = [
    { value: 'pendente',     label: 'Pendente',      icon: '🟡', color: 'yellow' },
    { value: 'em_andamento', label: 'Em Andamento',   icon: '🔵', color: 'blue'   },
    { value: 'aguardando',   label: 'Aguardando Peça', icon: '🟠', color: 'orange' },
    { value: 'concluido',    label: 'Concluído',       icon: '🟢', color: 'green'  },
    { value: 'entregue',     label: 'Entregue',        icon: '⚪', color: 'gray'   },
];

let state = {
    jobs: [],
    clients: [],
    services: DEFAULT_SERVICES,
    settings: {
        businessName: 'Assistência Técnica de Informática',
        ownerName: '',
        phone: '',
        email: '',
        pixKey: '',
        address: '',
        cnpj: '',
    },
    nextJobId: 1,
};

let currentPage = 'dashboard';
let currentJobId = null;
let jobFilter = 'todos';
