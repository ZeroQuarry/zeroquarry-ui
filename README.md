# zeroquarry-ui

The ZeroQuarry **design system**: a single source of truth for colour, type,
space and components, packaged so it can be reused across every ZeroQuarry
surface and iterated on independently of the application.

Inspired by the way [Elastic EUI](https://eui.elastic.co/) and the
[Vectara UI](https://vectara.github.io/vectara-ui/) libraries are structured —
but **framework-agnostic**, because ZeroQuarry's product UI is server-rendered
Jinja2 + vanilla JS, not React.

## Why a separate repo

The app grew a large, organically-extended stylesheet (`ZeroQuarry/static/style.css`,
~8.4k lines) with several competing token sources, dozens of raw hex values and
component styles re-implemented per page. A design system that lives *inside*
the app will always drift. Here it lives on its own, versioned, with its own
docs, so both the system and the app can evolve deliberately.

## Architecture

```
tokens/*.json  ──build──►  dist/tokens.css     (CSS custom properties)
                                   │
                                   ▼
                      src/css/*.css            component styles (reference tokens only)
                                   │
                                   ▼
                      dist/zeroquarry-ui.css   the consumable bundle
```

Layers, in order of stability:

1. **Tokens** — the atomic design decisions (colour, type scale, spacing,
   radius, elevation, motion). Authored as JSON, emitted as CSS custom
   properties. Everything else references these; **no component may hard-code a
   colour or a pixel value.**
2. **CSS components** — framework-agnostic component styles (button, card,
   badge/severity chip, table, tabs, notice, modal, form controls, pager,
   page header, …). Plain CSS so they drop into Jinja today and into anything
   else later.
3. **Behaviours** — small, dependency-free JS for the interactive parts
   (dialog, tabs, disclosure, popover, search), progressive enhancement only.
4. **Docs** — a living style guide (`docs/`) that renders the real tokens and
   components from the built CSS.

## Repository layout

```
zeroquarry-ui/
├── tokens/
│   ├── scale.json         theme-independent scales (space, radius, type, shadow, motion, z, breakpoints)
│   ├── theme.dark.json    semantic colour tokens — dark
│   └── theme.light.json   semantic colour tokens — light
├── scripts/
│   ├── build-tokens.mjs   tokens/*.json -> dist/tokens.css   (zero dependencies)
│   └── serve-docs.mjs     static server for docs/            (zero dependencies)
├── src/
│   ├── css/               component styles (increment 2+)
│   └── js/                behaviours (increment 3+)
├── docs/
│   └── index.html         living style guide (loads ../dist/tokens.css)
└── dist/                  build output (git-ignored)
```

## Token conventions

- Every custom property is namespaced `--zq-…` so the system can coexist with
  the app's existing `--bg-*` / `--text-*` variables during migration.
- Nested JSON keys become dash-joined names:
  `color.severity.critical.bg` → `--zq-color-severity-critical-bg`.
- `theme.dark.json` and `theme.light.json` must declare **the same keys**;
  only the values differ. Dark is the default (`:root`), light overrides under
  `[data-theme="light"]`, and `[data-theme="auto"]` follows the OS.
- Colour is **semantic, not literal**: `--zq-color-bg-surface`, not
  `--zq-color-grey-800`. A primitive palette layer can be introduced later
  without changing any consumer.

## Commands

```bash
npm run build   # regenerate dist/tokens.css from tokens/*.json
npm run docs    # serve the style guide at http://localhost:4173/docs/
```

No dependencies, no `node_modules`. Node ≥18 only. The docs page also opens
directly from disk (double-click `docs/index.html`).

## Components

All components are prefixed `.zq-` (so they can coexist with the app's existing
class names during migration) and reference tokens only — `npm run lint` fails
the build if a component hard-codes a colour or references an undefined token.

| Component | Class | Variants / parts |
|---|---|---|
| Button | `.zq-btn` | `--primary --danger --ghost --ghost-danger --sm --block`, `__icon` |
| Card | `.zq-card` | `__header __titles __title __subtitle __actions __body __footer`, `--interactive` |
| Badge / severity chip | `.zq-badge` | `--critical --high --medium --low --info --success --neutral` |
| Notice | `.zq-notice` | `--info --success --warning --danger`, `__icon __content __title __body __actions` |
| Page header | `.zq-page-header` | `__titles __title __subtitle __meta __actions` |
| Table | `.zq-table` | `--compact`, `__num __select __actions` (wrap in `.zq-table-wrap`) |
| Tabs | `.zq-tabs` | `--pills`, `.zq-tab` (driven by `aria-selected`) |
| Pager | `.zq-pager` | `__summary __pages __link __gap` |
| States | `.zq-empty`, `.zq-loading`, `.zq-error` | `__icon __title __body __actions`, `.zq-spinner` |
| Dialog | `.zq-dialog` | `__header __title __body __footer` (native `<dialog>`) |

## Behaviours

Dependency-free, progressive enhancement, shipped as `dist/zeroquarry-ui.js`.
Each behaviour is hooked off a `data-zq-*` attribute so it only touches markup
that opts in, and is idempotent (re-run `ZQ.init(root)` after swapping in
fetched content). Everything degrades gracefully if the script never loads.

| Behaviour | Hook | Notes |
|---|---|---|
| Dialog | `data-zq-dialog-open` / `data-zq-dialog-close` on a native `<dialog data-zq-dialog>` | top layer, focus trap and Esc come free from `<dialog>` |
| Tabs | `[data-zq-tabs]` with ARIA `tablist`/`tab`/`tabpanel` | roving tabindex + Arrow/Home/End; emits `zq:tabchange` |
| Disclosure | `data-zq-disclosure` + `aria-controls` | toggles `hidden` and `aria-expanded` |

```bash
npm run build   # tokens + css bundle + js bundle
npm run lint    # no raw colours, no undefined tokens, namespaced classes
```

## How ZeroQuarry consumes it (planned)

Build, then vendor the output into the app and reference it before the app's
own stylesheet, migrating one component at a time:

```bash
npm run build
cp dist/zeroquarry-ui.css ../ZeroQuarry/static/vendor/zeroquarry-ui/zeroquarry-ui.css
```

Migration is deliberately incremental: introduce tokens, then replace one
component's styles, verify, and move on — never a big-bang rewrite. The app's
`tests/test_css_tokens.py` guard (no `var()` may reference an undefined token)
keeps the app side honest while this lands.

## Roadmap

- [x] **Increment 1 — foundation**: repo, token pipeline, living style guide.
- [x] **Increment 2 — primitives**: button, card, badge/severity chip, notice,
      page header (CSS layer + docs + craft guard).
- [x] **Increment 3 — data display & behaviours**: table, tabs, pager,
      empty/loading/error states, dialog — plus the first dependency-free JS
      behaviours (dialog, tabs, disclosure).
- [ ] **Increment 4 — adoption**: vendor into ZeroQuarry and migrate page by
      page, deleting the corresponding rules from `static/style.css`.
