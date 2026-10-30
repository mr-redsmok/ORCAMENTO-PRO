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

## Rolagem
- Só a lista de **Serviços** tem área rolável própria, com barra visível (`.jobs-grid`).
- O resto do sistema rola com a página, com a barra global discreta.

## Promoções
- Cadastro em **Configurações → Promoções**: nome, tipo (`percent` ou `fixed`), valor, validade, regulamento e estado ativo.
- Uma promoção por OS. Não é cumulativa.
- Cálculo: percentual sobre o subtotal, ou valor fixo limitado ao subtotal. O total nunca fica negativo.
- Aplicação: botão no recibo do Editor de OS e botão de etiqueta em cada card da aba Serviços.
- **O regulamento é obrigatório.** Sem ele, a promoção não pode ser aplicada. O aceite acontece no modal ("Li e concordo com o regulamento") e o texto sai impresso no recibo e na mensagem do WhatsApp.
- Promoções inativas ou vencidas não aparecem para aplicação.

## Regras
- Ícones são SVG (`icon()` em `js/helpers.js`), nunca emojis.
- Status é indicado por ponto colorido (`.status-dot`) com cor **e** rótulo textual.
- Na impressão (`print.css`), o texto é preto sobre branco. Regras com `color` explícito em tela precisam de equivalente em impressão.
