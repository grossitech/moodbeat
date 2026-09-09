# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Moodbeat (working name; formerly called MindPulse — renamed to avoid App Store name collisions) is a static HTML/PWA prototype for an intraday emotional check-in mobile app. The screens were originally exported from Google Stitch and have since been hand-edited into a small installable Progressive Web App. There is no build system, package manager, or test suite. Each screen is a single self-contained `index.html` file (Tailwind CSS via the `cdn.tailwindcss.com` script, Google Fonts, Material Symbols) — no dev server, no `npm install`, no build step, no lint/test commands to run. This is now a git repository (initialized locally; see "Deployment" below for GitHub Pages status).

## Structure

`docs/` is the active, organized workspace — named `docs` (not `app`) specifically so GitHub Pages can serve it via Settings → Pages → "Deploy from branch: main /docs", with no extra config or Actions workflow needed:

- `index.html` — PWA entry point at the site root. Registers the service worker, then redirects via `localStorage['moodbeat_onboarded']` to either the onboarding flow (first visit) or straight to check-in (returning visits).
- `00-onboarding-boas-vindas/`, `01-onboarding-permissoes/` — first-run flow; their exit links set `localStorage['moodbeat_onboarded'] = '1'` before navigating to check-in.
- `02-check-in/`, `03-diario/`, `04-relatorios/`, `05-ajustes/` — the 4 main app screens, cross-linked via bottom nav.
- `manifest.json` — PWA manifest (name, icons, standalone display, terracotta theme color).
- `sw.js` — service worker; network-first with cache fallback over a hardcoded `APP_SHELL` file list (update this list if screens are added/renamed).
- `design-system/DESIGN.md` — the design system source of truth (color tokens, typography scale, spacing, elevation, component specs, and the rationale for the palette).
- `assets/icon-*.png`, `assets/apple-touch-icon.png` — generated PWA icons (resized from `assets/logo-conceito.png`, the original AI-generated heart-emblem concept art).
- `assets/avatar-conceito.png` — brand concept art, not referenced by any page. **The live pages still hotlink the header logo and profile avatar from a `lh3.googleusercontent.com` URL** (a Stitch/Google-hosted asset) rather than using the local PWA icons for in-app chrome — that external dependency is fragile (no ownership, could 404 anytime) and worth replacing with local assets.

`_arquivo_stitch_original/` is a frozen historical snapshot of the original Stitch export folder structure (with the old, accent-mangled folder names like `di_rio_timeline`, `relat_rios_humor`, and the old `code.html` filenames) from before `docs/` was carved out of it. Treat it as read-only reference/backup, not a place to make edits — all active work happens in `docs/`.

## Deployment

Git was initialized locally with one commit. There is no remote configured yet — GitHub Pages setup (create repo, add remote, push, enable Pages on branch `main` / folder `/docs`) is the next step, pending the user creating the GitHub repository (requires their account; not something to automate without their go-ahead). Once a remote exists, remember: `git` is installed at `C:\Program Files\Git\bin\git.exe` but is **not** on PATH in fresh shell sessions in this environment — prefix commands with `$env:Path += ';C:\Program Files\Git\bin'` (or call the full path) in every new PowerShell invocation that needs git.

## Architecture notes specific to this codebase

- **Each `index.html` is fully self-contained.** The `<head>` embeds the entire Tailwind config (`tailwind.config`) inline via `<script id="tailwind-config">`, duplicated verbatim across every file. There is no shared stylesheet or JS module — changing a design token (a color, a spacing value) means editing it in every `index.html` individually, plus `design-system/DESIGN.md` if the change should be reflected there (the doc is documentation only; the pages don't read it).
- **Colors follow Material Design 3 role names** (`primary`, `on-primary-container`, `surface-container-low`, etc.) defined as hex literals per file. The palette is intentionally terracotta-dominant (`primary: #a03b14`), with sage (`secondary`) and lavender (`tertiary`) as minor accents — see the "Note on palette intent" section in `DESIGN.md` before assuming a calm/wellness app should default to cool tones.
- **Cross-screen navigation is plain relative `<a href>`, not a router.** From inside a screen's folder, sibling screens are reached via `../<NN-folder-name>/index.html`; a screen's own bottom-nav item points to `index.html` (self). When adding a new screen, wire it into the bottom nav (and header avatar link) of every screen that should link to it, give the new folder a `NN-` numeric prefix matching its place in the flow, add its PWA head block (manifest link, theme-color, apple-touch-icon, service worker registration — copy from any existing screen, paths are all `../`), and add it to `sw.js`'s `APP_SHELL` list.
- **All interactivity is vanilla JS in an inline `<script>` at the end of `<body>`, scoped per file** (emotion chip selection, accordion toggles, day/frequency pickers, toggle switches, tag add/remove). Nothing is shared between files and no state persists across screens or reloads — every page starts from its hardcoded default markup on load. The one exception is the `moodbeat_onboarded` localStorage flag used by the root `index.html` and the onboarding screens.
- **`05-ajustes/index.html` uses an accordion pattern**: each settings section header is a `<button class="accordion-trigger" data-target="panel-id" aria-expanded="...">` that toggles a sibling `<div id="panel-id" class="accordion-panel">` via one shared click handler. "Janela Ativa" and "Frequência" default open; "Emoções & Tags" and "Notificações" default collapsed. Keep new settings sections consistent with this pattern rather than always-expanded blocks.
- **Empty states are demoed via a toggle button, not a separate screen.** `03-diario` and `04-relatorios` each have a `#btn-toggle-empty-demo` button that swaps visibility between a populated `id="...-populated"` container and an empty `id="...-empty"` container. This is a review/demo affordance for evaluating the design — a real app build would derive this from actual data state instead.
- **Energy level in `02-check-in` is intentionally optional and unselected by default** (badge reads "Não marcado", no battery icon pre-highlighted); clicking an already-active energy button deselects it. Emotion chips are the primary, larger-emphasis input on that screen — don't reintroduce a pre-selected default energy level or shrink the emotion chips back down without an explicit request, both were deliberate product decisions.
- **`04-relatorios/index.html` has its Tailwind config `<head>` block tripled** (a leftover Stitch export artifact — three near-identical copies of the same `<script id="tailwind-config">` and font links in a row). It's harmless (browsers tolerate the duplication) but means any manual `<head>` edit to that file needs `replace_all` or three passes, not one.
