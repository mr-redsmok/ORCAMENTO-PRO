# RED Tech — Design System (MASTER)

Fonte da verdade visual. Os tokens reais estão em `css/design-system.css`.

## Estilo
- **Direção:** Cyberpunk UI — fundo escuro, ciano e magenta neon, estética de HUD/terminal.
- **Scanlines:** overlay sutil de linhas de CRT sobre toda a interface (`body::after`).
- **Cores de fundo:** gradientes radiais em ciano, magenta e roxo sobre `#07080F`.
- **Acessibilidade:** `prefers-reduced-motion` remove as animações e o overlay de scanlines; `prefers-reduced-transparency` torna o vidro opaco.

## Cores
| Papel | Valor | Token |
|---|---|---|
| Fundo | `#07080F` | `--bg-0` |
| Superfície (cards) | `#11141F` | `--bg-2` |
| Ciano neon (principal) | `#00F0FF` | `--accent` |
| Magenta neon | `#FF2A6D` | `--accent-2` |
| Verde neon (sucesso) | `#05FFA1` | `--green` |
| Amarelo neon | `#FCEE0A` | `--yellow` |
| Texto principal | `#E9F7FF` | `--text-1` |
| Divisória | `rgba(0,240,255,0.12)` | `--hairline` |

Sobre ciano e magenta, o texto é **escuro** (`#05070D`), nunca branco.

## Tipografia
- **Títulos, números e rótulos:** `var(--display)` — monoespaçada, caixa alta, com tracking largo.
- **Texto corrido:** pilha do sistema.

## Forma
- Raios pequenos e retos: 3px (xs), 4px (sm), 6px (md), 8px (lg).
- Cards de estatística e painéis têm canto chanfrado via `clip-path`.
- Brilho neon no lugar de sombra: `0 0 18px rgba(0,240,255,0.35)`.

## Regras
- Ícones são SVG (`icon()` em `js/helpers.js`), nunca emojis.
- Status é indicado por ponto colorido (`.status-dot`), com cor e texto — nunca só cor.
- Vidro translúcido apenas na navegação (barra lateral e barra superior).
