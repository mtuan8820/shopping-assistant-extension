# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension — a shopping assistant — built with Vue 3, TypeScript, and Vite. The extension follows the standard browser extension architecture with a popup UI and a content script that runs on web pages.

Current phase is MVP:
- Focus on the feature summary reviews on the current-opened Shoppee page.
- 
## Commands

```bash
# Install dependencies
npm install

# Start Vite dev server (for popup UI development)
npm run dev

# Type-check and build for production
npm run build

# Preview the production build
npm run preview
```

There is no test runner configured yet.

## Architecture

The extension is split into two distinct execution contexts that cannot share module state at runtime:

- **`src/sidepanel/`** — The browser extension popup UI. Entry point is `main.ts`, which mounts the Vue 3 app (`App.vue`). This runs in a sidepanel.
- **`src/content/`** — The content script (`index.ts`) injected directly into shopping pages. This has access to the page DOM but runs in a sandboxed context separate from the popup.
- **`src/shared/types.ts`** — Shared TypeScript types used by both the popup and the content script. Cross-context communication (popup ↔ content script) must go through the browser's message-passing API (`chrome.runtime.sendMessage` / `chrome.tabs.sendMessage`), not direct imports.

The `manifest.json` at the root defines the extension's permissions, entry points, and content script injection rules for the browser.

## Build Notes

- `npm run build` runs `vue-tsc -b` (full type-check across both `tsconfig.app.json` and `tsconfig.node.json`) before Vite bundles. Type errors will fail the build.
- TypeScript is configured strictly: `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are all enabled.
- The build output goes to `dist/`. To load the extension in Chrome/Edge, navigate to `chrome://extensions`, enable Developer Mode, and use "Load unpacked" pointing at `dist/`.
