# Design Brief

## Direction

Terminal DePIN — a cyberpunk infrastructure console where SPR energy is the hero readout of a live machine.

## Tone

Hard-edged futuristic Cyberpunk executed with restraint: near-black surfaces, thin neon lines, and one dominant glow — precise, not garish.

## Differentiation

The balance is treated as a live instrument panel: an oversized monospace SPR figure inside a glowing circuit frame, with a terminal-style Status Log streaming every +10 / −1 event.

## Color Palette

| Token      | OKLCH         | Role                                       |
| ---------- | ------------- | ------------------------------------------ |
| background | 0.16 0.02 265 | #0b0e14 base, cool blue-cyan undertone      |
| foreground | 0.95 0.008 250 | primary text on dark                       |
| card       | 0.205 0.022 265 | elevated panels, log surface               |
| primary    | 0.78 0.2 152  | neon green — recharge, positive, success    |
| accent     | 0.78 0.13 205 | cyan — secondary actions, borders, links    |
| muted      | 0.26 0.026 265 | inactive chips, dividers, empty states      |
| destructive | 0.64 0.2 22  | errors, insufficient balance, disconnect    |

## Typography

- Display: Space Grotesk — headings, balance figure, wordmark (geometric, technical)
- Body: DM Sans — Spanish UI copy, labels, buttons, descriptions
- Mono: JetBrains Mono — wallet address, SPR amounts, log timestamps
- Scale: hero `text-6xl md:text-8xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Layered: background grid texture → `card` panels with 1px `border` + `shadow-panel` → hero balance card with `glow-primary` neon frame; depth comes from borders and glow, never heavy drop shadows.

## Structural Zones

| Zone    | Background            | Border        | Notes                                              |
| ------- | --------------------- | ------------- | -------------------------------------------------- |
| Header  | `bg-card/80` + blur    | `border-b`    | sticky; logo left, wallet chip + disconnect right |
| Content | `bg-background` + grid | —             | 2-col: balance/actions (~68%) + Status Log (~32%)  |
| Footer  | `bg-muted/40`          | `border-t`    | protocol status line, mono, muted                  |

## Spacing & Rhythm

`container` centered; section gaps `gap-6 md:gap-8`; card padding `p-6 md:p-8`; micro-spacing `space-y-3` in panels, `gap-2` in chip rows.

## Component Patterns

- Buttons: pill (`rounded-full`), primary = neon-green fill with dark text + `glow-primary` on hover; secondary = transparent with cyan `border`; disabled = `bg-muted` + "Conecta tu billetera" hint
- Cards: `rounded-2xl`, `bg-card`, 1px `border`, `shadow-panel`; hero card adds `glow-primary`
- Badges/chips: `rounded-full` pills for payment methods; active = green border+tint, inactive = muted border; status dot uses `animate-pulse-dot`

## Motion

- Entrance: staggered `animate-fade-up` (0.4s) on header, balance card, then log
- Hover: `transition-smooth` on buttons/chips — border brightens, glow intensifies
- Decorative: `animate-pulse-dot` on connection status; subtle `animate-scan` sheen on hero frame

## Constraints

- Dark mode is the primary and only required theme; light tokens exist but are not the target
- Spanish-language UI copy throughout
- Rounded corners everywhere (pills for actions, `rounded-2xl` for panels)
- Neon green + cyan only as accents — no rainbow, no purple gradients, no full-page gradients
- No real on-chain payment, wallet adapter integration, SPR rewards, or staking surfaces

## Signature Detail

The balance readout — an oversized JetBrains Mono SPR figure inside a thin neon-green circuit frame with a faint scanline — turns a number into the app's unmistakable instrument.
