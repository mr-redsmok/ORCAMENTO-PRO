# RED Tech — Design System (MASTER)

Fonte da verdade visual. Os tokens reais estão em `css/design-system.css`.

## Estilo
- **Direção:** Apple-inspired, minimalista, com material Liquid Glass só na navegação (barra lateral e barra superior).
- **Conteúdo:** fundo sólido, sem translucidez, para manter a leitura.
- **Modo:** claro.
- **Acessibilidade:** `prefers-reduced-motion` e `prefers-reduced-transparency` são respeitados (o vidro vira branco sólido).

## Cores
| Papel | Valor | Token |
|---|---|---|
| Fundo da página | `#F5F5F7` | `--bg-0` |
| Superfície (cards) | `#FFFFFF` | `--bg-1` |
| Destaque / ação | `#0071E3` | `--accent` |
| Texto principal | `#1D1D1F` | `--text-1` |
| Texto secundário | `#6E6E73` | `--text-3` (contraste ≥ 4.5:1 sobre branco) |
| Divisória | `rgba(0,0,0,0.08)` | `--glass-border` |
| Sucesso | `#248A3D` | `--green` |
| Erro | `#D70015` | `--red` |

## Tipografia
- **Texto:** pilha do sistema (`-apple-system`, `SF Pro Text`, `Segoe UI`, `Roboto`).
- **Números e valores:** `ui-monospace`, `SF Mono`, `Menlo`.

## Forma e movimento
- Raios: 8px (botões e campos), 12px (cards), 980px (chips e pílulas).
- Sombras: muito leves (`--sh-sm`, `--sh-md`).
- Transições: 0.15–0.3s, curva suave.

## Regras
- Ícones são SVG (`icon()` em `js/helpers.js`), não emojis.
- Emojis ficam só em mensagens (toast) e no texto do WhatsApp.
- Vidro (`backdrop-filter`) apenas em navegação, nunca em cards ou formulários.
