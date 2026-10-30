# RED Tech — Design System (MASTER)

Fonte da verdade visual. Os tokens reais estão em `css/design-system.css`.

## Estilo
- **Direção:** All black — preto puro, monocromático, sem brilho.
- **Objetivo:** uso diário confortável. Nada de neon, glow, scanlines ou glitch.
- **Semântica mínima:** só as cores de status mantêm matiz, e desaturadas, porque precisam distinguir estados.
- **Acessibilidade:** `prefers-reduced-motion` e `prefers-reduced-transparency` são respeitados.

## Cores
| Papel | Valor | Token |
|---|---|---|
| Fundo | `#000000` | `--bg-0` |
| Superfície (cards) | `#0B0B0B` | `--bg-2` |
| Divisória | `rgba(255,255,255,0.10)` | `--hairline` |
| Principal (ações) | `#FFFFFF` | `--accent` |
| Texto principal | `#F2F2F2` | `--text-1` |
| Texto secundário | `#858585` | `--text-3` |

Sobre branco, o texto é sempre `#000`.

## Tipografia
- **Títulos, números e rótulos:** `var(--display)` — monoespaçada, caixa alta, tracking largo.
- **Texto corrido:** pilha do sistema.

## Forma e profundidade
- Raios retos: 3px, 4px, 6px, 8px.
- Sombras só para profundidade (`rgba(0,0,0,...)`), nunca como brilho.
- Cards de estatística e painéis mantêm o canto chanfrado via `clip-path`.

## Regras
- Ícones são SVG (`icon()` em `js/helpers.js`), nunca emojis.
- Status é indicado por ponto colorido (`.status-dot`) com cor **e** rótulo textual.
- A lista de Serviços rola dentro de `.jobs-grid`, com barra de rolagem própria e visível.
- Em telas de até 768px, a lista volta a rolar com a página.
