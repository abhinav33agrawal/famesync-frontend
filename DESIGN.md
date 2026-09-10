# FameSync design system

Single light theme. Aubergine is the brand, citrus is rationed, paper is the
ground. If a screen needs a colour, a radius or a shadow that isn't listed
here, it's wrong — reach for the token, not a new value.

## Palette

Semantic tokens only. **Never** use a raw Tailwind palette colour
(`green-500`, `amber-400`, `blue-600`, `text-white`, …) and **never** use a
`dark:` variant — there is no dark mode.

| Token | Role |
|---|---|
| `background` | warm paper — the page ground |
| `foreground` | near-black text |
| `card` | white — the only raised surface |
| `primary` | aubergine — the one brand colour; fills, active nav, feature cards |
| `secondary` | lilac tint — nav-active, avatar fallbacks, tinted cards |
| `accent` | citrus — **rationed**, see below |
| `muted` / `muted-foreground` | quiet fills and secondary text |
| `success` `warning` `destructive` | status only, always via `StatusBadge` where possible |
| `border` / `input` | one hairline value |

### The citrus rule

Citrus (`accent`) is the loudest thing on the page, so it appears **once per
screen**, and only as: the creator-facing CTA, a live/active dot, or a single
eyebrow label. Text never sits on citrus except `accent-foreground` at button
size. `rg "bg-accent" src/` should return at most one hit per route.

## Type

- `font-display` (Bricolage Grotesque) — `h1`–`h3`, card titles, and anything
  in the `.display` class. Tight tracking; it carries the personality.
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
- `wash` is the only decorative background in the product, and one panel per
  page is the budget.

## Components — reuse before you build

| Need | Use |
|---|---|
| a campaign, anywhere | `CampaignCard` (`@/components/CampaignCard`) |
| a creator, brand-side | `CreatorCard` |
| a dashboard metric | `Stat` — `tone="feature"` for the single aubergine block |
| any status string | `StatusBadge` — never a bespoke colour map or icon |
| an avatar / brand mark | `Avatar`, `BrandLogo` |
| money, reach, dates, deliverables | `@/lib/format` — `formatINR`, `formatCompact`, `daysLeftLabel`, `deliverableChips` |
| buttons | `Button` variants below |
| surfaces | `Card` intents below |

`Button` variants: `default` (pill, page-level action) · `accent` (creator CTA,
citrus rule applies) · `secondary` (outline pill) · `form` (inside cards,
dialogs, wizards — radius 12) · `outline` · `ghost` · `destructive` · `link`.

`Card` intents: `default` · `interactive` (adds `lift`) · `tinted` (lilac) ·
`feature` (aubergine) · `dashed` (empty states).

## Motion

`Rise` and `RiseGroup` are the only entrance animations; `listItemMotion` is
the only layout settle (filtered lists). Stagger at 60ms, three children max.

Nothing loops. `rg "repeat: Infinity" src/` should stay empty — no floating
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
