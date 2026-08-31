# RED Tech — Gestão de Assistência Técnica

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Descrição

Sistema completo de gestão para assistência técnica de informática. O **RED Tech** permite gerenciar ordens de serviço (OS), clientes, financeiro e gerar orçamentos/propostas para envio via WhatsApp — tudo de forma offline, direto no navegador.

## Funcionalidades

- **Dashboard** com métricas em tempo real (total de OS, receita, clientes)
- **Gestão de OS** com status (Pendente, Em Andamento, Aguardando Peça, Concluído, Entregue)
- **Catálogo de serviços** com preços configuráveis
- **Itens avulsos** — adicione peças ou itens customizados por OS
- **Base de dados de clientes** com histórico de serviços
- **Relatórios financeiros** com gráfico de receita mensal e top serviços
- **Paleta de comandos** (⌘K) para navegação rápida
- **Atalhos de teclado** (1-5 para navegar, ⌘N para nova OS)
- **Compartilhamento via WhatsApp** com mensagem formatada
- **Impressão / Exportação PDF** do orçamento/recibo
- **Chave PIX** — exibição e cópia rápida no recibo
- **Exportação / Importação** de dados em JSON
- **Persistência offline** — todos os dados ficam salvos no navegador (localStorage)
- **Design responsivo** — funciona em desktop e mobile

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | HTML + CSS + JavaScript |
| Storage | localStorage (offline) |
| Fontes | Google Fonts (Inter + JetBrains Mono) |

## Estrutura do projeto

```
ORCAMENTO-PRO-main/
├── assets/
│   └── favicon.ico
├── css/
│   ├── design-system.css   (variáveis, reset, animações)
│   ├── layout.css          (sidebar, topbar, área principal)
│   ├── pages.css           (estilos das páginas: dashboard, jobs, clientes, financeiro, config)
│   ├── components.css      (botões, formulários, cards, receipt)
│   ├── modal.css           (paleta de comandos, modal, toast)
│   └── print.css           (responsivo + estilos de impressão)
├── js/
│   ├── data.js             (estado global e dados padrão)
│   ├── helpers.js          (formatação, utilitários)
│   ├── storage.js          (persistência e import/export)
│   ├── pages.js            (renderização de todas as páginas)
│   ├── modals.js           (modais, paleta, toast, WhatsApp)
│   └── app.js              (navegação SPA e inicialização)
├── index.html
└── README.md
```

*RED Tech — Sistema de Gestão para Assistência Técnica*
