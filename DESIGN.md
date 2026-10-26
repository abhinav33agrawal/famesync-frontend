# FameSync design system

Single light theme, with ink sections on the marketing pages (layout modelled
on izea.com). Violet is the brand, magenta is rationed, near-white is the
ground, ink is the dark band. If a screen needs a colour, a radius or a shadow that isn't listed
here, it's wrong — reach for the token, not a new value.

Run `node scripts/design-check.mjs` to check the mechanical rules below
(dead utilities, dark-mode variants, raw palette colours, looping animation).

## Palette

Semantic tokens only. **Never** use a raw Tailwind palette colour
(`green-500`, `amber-400`, `blue-600`, `text-white`, …) and **never** use a
`dark:` variant — there is no dark mode.

| Token | Role |
|---|---|
| `background` | near-white with a violet cast — the page ground |
| `foreground` | ink-black text |
| `card` | white — the only raised surface |
| `primary` | electric violet — the brand colour; fills, active nav, big numerals |
| `secondary` | lilac tint — nav-active, avatar fallbacks, tinted cards, the "How?" band |
| `accent` | magenta — **rationed**, see below |
| `ink` / `ink-foreground` / `ink-muted` / `ink-border` | the dark band: signed-out navbar, landing hero, facts block, footer, `feature` cards |
| `muted` / `muted-foreground` | quiet fills and secondary text |
| `success` `warning` `destructive` | status only, always via `StatusBadge` where possible |
| `border` / `input` | one hairline value |

### The magenta rule

Magenta (`accent`) is the loudest thing on the page, so it appears **once per
screen**, and only as: the creator-facing CTA, a live/active dot, or a single
eyebrow label. Text never sits on magenta except `accent-foreground` at button
size. On ink, a highlighted word or eyebrow uses `brand-gradient-text`, never
`text-accent`. `rg "bg-accent" src/` should return at most one hit per route.

## Type

- `font-display` (Montserrat 800/900, our stand-in for IZEA's Gotham Black) —
  `h1`–`h3`, card titles, and anything in the `.display` class. Tight
  tracking; hero and closing-banner headlines are uppercase.
- Body (Plus Jakarta Sans) — everything else, set on `body`.
- `.num` — budgets, follower counts, dates, stat values. Numerals should read
  as a claim, not as data slop.
- `.eyebrow` — the small-caps label above a section or card header.
- Sizes: `text-display-1` (hero), `text-display-2` (section), `text-display-3`
  (card/sub-section). Don't hand-roll a clamp.

## Shape and depth

- Radius: `rounded-sm` (6) chips and tags · `rounded-md` (9) · `rounded-lg`
  (12) inputs and in-card buttons · `rounded-xl` (18) cards · `rounded-2xl`
  (24) panels and CTA blocks.
- Elevation: `shadow-e1` resting, `shadow-e2` hover, `shadow-e3` for the one
  hero object. There is no glow. Ever.
- Interactive cards get `lift` (2px rise, e1 → e2), not a bespoke hover.
- Decorative backgrounds: `wash` (soft lilac panel) and `brand-gradient`
  (violet→magenta, the signature). One of each per page at most.
- `feature` cards are ink, so their text is `text-ink-foreground` /
  `text-primary-foreground` (both near-white).
- On ink, buttons are `inverse` (white pill) and `outline-inverse`.

## Components — reuse before you build

| Need | Use |
|---|---|
| a campaign, anywhere | `CampaignCard` (`@/components/CampaignCard`) |
| a creator, brand-side | `CreatorCard` |
| a dashboard metric | `Stat` — `tone="feature"` for the single ink block |
| any status string | `StatusBadge` — never a bespoke colour map or icon |
| an avatar / brand mark | `Avatar`, `BrandLogo` |
| money, reach, dates, deliverables | `@/lib/format` — `formatINR`, `formatCompact`, `daysLeftLabel`, `deliverableChips` |
| buttons | `Button` variants below |
| surfaces | `Card` intents below |

`Button` variants: `default` (pill, page-level action) · `accent` (creator CTA,
magenta rule applies) · `secondary` (outline pill) · `inverse` / `outline-inverse` (on ink) · `form` (inside cards,
dialogs, wizards — radius 12) · `outline` · `ghost` · `destructive` · `link`.

`Card` intents: `default` · `interactive` (adds `lift`) · `tinted` (lilac) ·
`feature` (ink) · `dashed` (empty states).

**A note on `accent` in the Radix primitives.** Stock shadcn treats `accent` as
a quiet neutral hover tint, but here `accent` is the loud magenta — so the
primitives in `components/ui/` were rewired to highlight with `secondary`
(the lilac selection surface, matching the Navbar's active pill). If you pull
in a new shadcn component, do the same to it, or its menu rows will hover magenta.

## Motion

`Rise` and `RiseGroup` are the only entrance animations; `listItemMotion` is
the only layout settle (filtered lists). Stagger at 60ms, three children max.

Nothing loops, with one exception: the `.marquee` niche ticker under the
landing hero (CSS, switched off under `prefers-reduced-motion`). `rg "repeat: Infinity" src/` should stay empty — no floating
orbs, no pulsing rings, no shimmer. `prefers-reduced-motion` is honoured
globally in `index.css`, so don't re-implement it.

## Layout

- `container` is centred, 1.5rem gutters, capped at 1240px. Page content lives
  in it; don't add competing max-widths.
- Navigation is the `Navbar` alone — there is no sidebar. Role links live in
  the navbar, account actions in its dropdown.
- Minimum 44px hit targets, including icon-only buttons and chip removals.
- Every screen works at 375px. Grids stack, filter rails become a sheet or a
  horizontal scroller, tables get their own `overflow-x-auto`.

## Data contract

The API is the authority, not the mock:

- Campaigns have **`post_date`** and **`deliverables_required`**. There is no
  `deadline` field and no `deliverables` field.
- Campaign status is `draft | active | paused | completed | cancelled`.
- `useAuth()` returns `{ user, login, logout, isAuthenticated, authSource, … }`.
  Role, credits and name are on `user` (`user.role`, `user.credits`,
  `user.first_name`) — there is no `profile` object on the context. Profile
  pictures come from `useInfluencerProfile` / `useBrandProfile`.
