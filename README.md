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

## How ZeroQuarry consumes it (planned)

Build, then vendor the output into the app and reference it before the app's
own stylesheet, migrating one component at a time:

```bash
npm run build
cp dist/tokens.css ../ZeroQuarry/static/vendor/zeroquarry-ui/tokens.css
```

Migration is deliberately incremental: introduce tokens, then replace one
component's styles, verify, and move on — never a big-bang rewrite. The app's
`tests/test_css_tokens.py` guard (no `var()` may reference an undefined token)
keeps the app side honest while this lands.

## Roadmap

- [x] **Increment 1 — foundation**: repo, token pipeline, living style guide.
- [ ] **Increment 2 — primitives**: button, card, badge/severity chip, notice,
      page header (CSS layer + docs).
- [ ] **Increment 3 — data display**: table, tabs, pager, empty/loading/error
      states + the first JS behaviours.
- [ ] **Increment 4 — adoption**: vendor into ZeroQuarry and migrate page by
      page, deleting the corresponding rules from `static/style.css`.
