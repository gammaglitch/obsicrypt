# Log

## 2026-06-26 (release automation + v-less tags)

- Added a GitHub Action (`.github/workflows/release.yml`) that builds and publishes a release when a version tag is pushed. It sets `OBSIDIAN_PATH` to a throwaway dir (since `vite.config.ts` writes the bundle under `$OBSIDIAN_PATH/.obsidian/plugins/<id>`), runs `pnpm build`, and attaches `main.js` + `manifest.json` (and `styles.css` if a future build emits one) with auto-generated notes. Uses `pnpm install --no-frozen-lockfile` because the repo hit frozen-lockfile issues under pnpm 10.
- Added `scripts/bump-version.mjs` (`pnpm run bump <x.y.z>`) — updates `package.json`, `public/manifest.json`, and a new `versions.json` (plugin version → minAppVersion). `docs/releasing.md` documents the flow.
- Switched the tag convention to **no `v` prefix** (e.g. `0.2.0`) to match the Obsidian community-store requirement that the tag equal the manifest version exactly. The existing `v0.1.0` release predates this.

- Added a parallel whole-note encryption mode where the decrypted plaintext **never touches disk** — unlike the existing decrypt-to-disk `.md` flow. Gated behind `FEATURES.memoryNote` (off). New files under `src/obsidian/memoryNote/` + `src/components/secrets/MemoryNoteApp.tsx`.
- **How:** a dedicated `.ocnote` extension is registered to `MemoryNoteView` (a `TextFileView`). Obsidian hands the view the ciphertext envelope; the view decrypts into a private `plaintext` field and `getViewData()` only ever returns the ciphertext envelope, so autosave can never persist plaintext. Edits debounce (400ms) and re-encrypt with the cached key (`encryptWithKey`, fresh IV, same salt — no PBKDF2). The dedicated extension also keeps these files out of Obsidian's metadata cache / search index (so plaintext isn't indexed). Editor is a plain `<textarea>` (no live preview / links / backlinks — that's the prototype tradeoff). Deliberately **no `@codemirror`** import (a self-hosted CM6 editor is a possible future enhancement; never register an editor extension against Obsidian's CM — prior dual-instance crash).
- **Crypto:** promoted `deriveKey` to exported and added `encryptWithKey` / `decryptWithKey` / `createEncrypted` to `src/helpers/crypto/crypto.ts`; `encryptString`/`decryptString` now delegate (behavior unchanged, tests green). Key is derived once from the master password + the file's stable salt and cached per-file in a `SessionKeyCache` (cleared on unload; the view also relocks when the vault locks).
- **Commands:** "Create memory-only encrypted note" and "Convert current note to memory-only encrypted note" (leaves the plaintext original in place with a warning Notice — no auto-delete).
- **Residual leakage (honest):** plaintext still lives in RAM for the unlocked session (JS strings can't be zeroed; `<textarea>`/rendered DOM) and can spill via OS swap/hibernation/core dumps; the convert command leaves the original `.md` in plaintext (+ trash/history). The `.ocnote` extension mitigates the metadata-cache/search-index vector but that exclusion should be verified empirically (search for a plaintext sentinel — it should return nothing).
- **Read mode:** the view has an Edit ⇄ Read toggle (Edit is the default). Read mode renders the in-memory plaintext with `MarkdownRenderer.renderMarkdown(markdown, el, sourcePath, component)` — it takes the string directly, so nothing hits disk; a child `Component` (torn down on switch/lock/close) manages embedded renderers. It's a static reading render, not editable live-preview (that would need CodeMirror, which we avoid). `renderMarkdown` is deprecated in newer Obsidian but works at runtime and matches the pinned 0.14.8 types.
- **Gating moved to a setting:** replaced the compile-time `FEATURES.memoryNote` flag with a persisted `enableMemoryNotes` setting (default off) plus an "Experimental" toggle in the settings tab. It's read at `onload` to register the extension/view, so toggling needs a reload. The view's tab title no longer prefixes a 🔒 emoji (the view's `lock` icon already shows one), and the lock-screen `Shell` was hoisted to module scope to stop the password input losing focus on each keystroke.

## 2026-06-23 (drop CodeMirror — leaf swap instead of editor overlay)

- Replaced the CodeMirror 6 editor overlay with a leaf-swap approach, because importing `@codemirror/view` produced a second `@codemirror/state` instance at runtime (Obsidian shares its own), throwing "Unrecognized extension value … multiple instances of @codemirror/state" and breaking editor creation. Switching the bundle to CJS + externalizing the full `@codemirror` set did not reliably fix it, so the robust fix is to not import `@codemirror` at all.
- `src/obsidian/LockedNoteView.ts` — a plain `ItemView` (no CodeMirror) that renders the unlock UI for a whole-note-encrypted file. `src/obsidian/secretViewGuard.ts` listens for `file-open`, and when a markdown leaf shows a flagged note it swaps that leaf to the LockedNoteView. On unlock the view writes plaintext back (decrypt-to-disk) and swaps the leaf back to the markdown editor.
- The guard reads `vault.cachedRead` (disk-accurate, updated synchronously by `vault.modify`) rather than `metadataCache` (parsed async), so decrypt-to-disk doesn't momentarily re-trigger a lock. `Lock note` sets the ciphertext buffer, swaps to the locked view (passing the envelope so it doesn't race the disk write), then `vault.modify`s the ciphertext after the markdown view unloaded — so plaintext can't be saved back.
- Removed `encryptedNoteOverlay.ts`, `encryptedReadingCard.ts`, the `@codemirror/*` dev deps, and the CJS/externals changes to `vite.config.ts` (reverted to the original UMD build). Inline `` ```secret `` and the dashboard remain unchanged.

## 2026-06-23 (whole-note format change)

- Reworked whole-note encryption from a `` ```secret `` block to a **frontmatter flag + raw envelope body**: a locked note is `---\nobsicrypt: encrypted\n---\n<envelope>`. The note's entire original content (including its own frontmatter) is encrypted into the envelope; unlocking restores it verbatim. `src/helpers/wholeNote.ts` now exposes `buildEncryptedNote` / `readEncryptedNote` / `isWholeNoteEncrypted` / `parseFrontmatter` (lightweight flat-YAML reader for our controlled flag).
- Added a **CodeMirror 6 editor overlay** (`src/obsidian/encryptedNoteOverlay.ts`, registered via `registerEditorExtension`): when the open document carries the encrypted flag, a block `Decoration.replace` covers the whole doc with an unlock widget (`components/secrets/LockedNoteOverlay.tsx`) — so edit/live-preview never shows ciphertext. The widget embeds the password field inline (no modal) and adapts to vault state via `useSecretsStore` (password prompt when locked, one-click when already unlocked). On unlock it dispatches plaintext into the buffer → flag clears → overlay vanishes (**decrypt-to-disk**).
- Gating is purely on the frontmatter flag, so notes containing inline `` ```secret `` blocks are untouched — inline encryption, the reading-view processor, and the dashboard are unchanged.
- Reading view: `src/obsidian/encryptedReadingCard.ts` post-processor swaps the rendered envelope for a static "🔒 encrypted — edit to unlock" card (unlocking is an edit-mode action).
- Build: CodeMirror is provided by Obsidian at runtime — added `@codemirror/view` + `@codemirror/state` as dev deps (types) and to `vite.config.ts` rollup `external` + `output.globals`. `@codemirror/state` is type-only (erased); the bundle `require()`s `@codemirror/view`.

## 2026-06-23

- Added whole-note locking: `Obsicrypt: Lock note` encrypts the entire active note and replaces its body with a single `` ```secret `` block; `Obsicrypt: Unlock note` decrypts that block back to plaintext in the editor. Lock/unlock is an explicit, conscious user action — while unlocked the plaintext lives in the `.md` and edits in the real Obsidian editor (no custom view); re-lock when done.
- This is the whole-note counterpart to inline `Encrypt selection`. It reuses everything: `encryptString`/`decryptString`, the envelope `format`/`parse`, the master-password store, and `ensureUnlocked`. The produced block is the identical `` ```secret `` format, so the reading-view processor and the dashboard already render whole-note-locked files for free.
- New pure helper `src/helpers/wholeNote.ts` (+ Jest tests): `wrapSecretBlock`, `extractWholeNoteEnvelope`, `isWholeNoteLocked`. `extractWholeNoteEnvelope` only matches when the *entire* note is one secret block, so `Unlock note` never clobbers a note that merely contains an inline secret alongside other text.
- Originated as a separate plugin (`obsidian-secret-note`) but folded in here: every primitive already existed in obsicrypt, the on-disk format is identical, and one master password / unlock state is shared across inline + whole-note rather than split across two plugins.

## 2026-04-20

- Added a Secrets Dashboard view. Opens in a new tab via a left-sidebar ribbon icon (🔒). Drill-down layout: left pane lists notes that contain at least one `` ```secret `` block (with per-note count); right pane shows each secret as a row with Unlock / Show-Hide / Copy buttons. Plaintext is masked by default once the vault is unlocked. Vault events (`create` / `delete` / `rename` / `metadataCache:changed`) drive auto-refresh via a new module-level pub/sub in `src/obsidian/vaultSecrets.ts`. Pure `scanFileForSecrets` helper with Jest tests in `src/helpers/scanSecrets.ts`. Reuses `PasswordModal`, `secretsStore`, `decryptString`, and the envelope parser — no duplication.
- Copy path: `navigator.clipboard.writeText(plaintext)` with a `document.execCommand('copy')` fallback via a hidden textarea for environments where the Async Clipboard API is blocked. Result surfaced via an Obsidian `Notice`.

## 2026-04-20

- Rebranded from `obsikit` to `obsicrypt` across manifest, package name, plugin class, command IDs/names, user-facing notices, envelope version tag, verifier plaintext constant, docs, and e2e fixtures. Envelope format is now `obsicrypt:v1|…`; existing verifier-in-`data.json` from a prior `obsikit:v1`-era run would be invalidated on first load — acceptable since nothing has shipped externally.
- Removed the file-browser example feature (`ExampleView`, `ViewWrapper`, `VaultSync`, `events.ts`, `store/atoms/files.tsx`, `helpers/lines.*`, e2e `smoke.spec.ts`, `docs/boilerplate.md`). The plugin is now a focused encryption tool with no custom pane; UI surfaces only in reading view, the settings tab, and the command palette. The main.ts lifecycle no longer registers a view or opens one on layout-ready.
- Kept `src/helpers/files/util.ts`, `src/obsidian/constants.ts`, and `src/obsidian/view.ts` — these are imported by `src/obsidian/testBridge.ts` (dev-only HTTP bridge for MCP/e2e tooling) and are considered plugin infrastructure, not part of the example.

## 2026-04-20

- Added an encrypted-secrets feature: content inside a fenced `` ```secret `` block is encrypted with AES-GCM-256 and a key derived from a user-set master password via PBKDF2-SHA256 (600k iterations, 16-byte salt, 12-byte IV, all per-secret). Ciphertext is stored inline in the note so the note remains self-contained.
- Envelope format (inside the fenced block): `obsicrypt:v1|<saltB64>|<ivB64>|<ciphertextB64>`. Parser is in `src/helpers/crypto/envelope.ts`; the actual encrypt/decrypt lives in `src/helpers/crypto/crypto.ts`.
- Session model: master password is cached in memory in `src/obsidian/secretsStore.ts` (plain module-level ref + subscribe hook — Jotai v1 lacks a non-React store API) and cleared on `onunload` or the `Obsicrypt: Lock vault` command. Only a verifier (AES-GCM of a fixed plaintext `"obsicrypt-verify-v1"`) is persisted via `plugin.saveData`; the password itself is never written to disk.
- Reading view renders `secret` blocks via `registerMarkdownCodeBlockProcessor`, mounting a Preact `SecretBlock`. Selection → envelope via the `Obsicrypt: Encrypt selection` command.
- Known v1 caveats: (1) Live Preview shows the raw source (ciphertext, not plaintext) when the cursor enters a rendered block — acceptable, no plaintext leak. (2) `editor.replaceSelection` pushes the original plaintext onto CodeMirror's undo stack; users can undo back to cleartext until the note is closed. A hardened future version would use a CodeMirror decoration widget and wrap the replacement in an atomic transaction with history cleared.

## 2026-04-08

- Added `mcp/server.mjs`: unified MCP entry point that assembles tools from both the CLI and bridge backends based on availability at startup. Probes both, registers CLI-backed tools when CLI is available and bridge-only tools when the bridge is reachable. Fallback bridge tools registered for overlapping capabilities only when CLI is absent. `.mcp.json` now points here.
- Documented that several vault/file tools are still bridge-backed today even though the CLI has related commands; switching those tools to CLI-backed implementations is a future migration step that requires implementation and output validation first.
- Refactored `mcp/cli-server.mjs` to export `registerCliTools()` and `probeCli()` for use by the unified server. Standalone mode preserved.
- Added `mcp/cli-server.mjs`: a self-contained MCP server that wraps the official Obsidian CLI instead of the custom HTTP bridge. Exposes 15 tools covering the plugin development debug loop (reload, commands, errors, console, DOM, CSS, screenshots, eval).
- Validated all 15 CLI MCP tools against a running Obsidian instance (v1.12.7). Found that the CLI reports errors as stdout with exit code 0; added `isCliError()` detection so error responses use MCP-native `isError: true` instead of silently claiming success.
- Wrote `docs/cli-mcp-plan.md` defining the two-backend architecture: official CLI as preferred backend, bridge as fallback for Docker/CI. Plan follows a flat-first approach — shared abstractions deferred until real duplication between backends is visible.
- Added `docs/dev-cli.md` and updated `README.md` / `docs/dev-bridge.md` so the current unified MCP workflow, backend modes, and bridge-vs-CLI split are documented with concrete examples.

## 2026-04-05

- Added an MCP server (`mcp/bridge-server.mjs`) that wraps the bridge HTTP API so Claude Code can call vault operations as native tools. Configured in `.mcp.json`.
- Fixed Docker dev harness: replaced `--frozen-lockfile` with `--no-frozen-lockfile` for pnpm 10 compatibility, added `--no-sandbox` for headless Electron, and added `--remote-debugging-port=9222` for CDP access.

## 2026-03-21

- Added a test-bridge module that can expose a small localhost HTTP control surface from inside the plugin when `VITE_OBSIDIAN_DEBUG_BRIDGE=1`.
- Added a long-running Docker dev harness in `docker-compose.dev.yml` so Obsidian can stay up during interactive debug sessions while external tools connect through the bridge.
- Documented the bridge API, auth, and startup flow in `docs/dev-bridge.md`.

## 2026-03-07

- Added Dockerized Obsidian e2e scaffold with Playwright Electron support.
- Ported smoke test, vault fixture, and launch helpers from obsidian-ist.
- Added `data-testid` attributes to ExampleView for stable e2e selectors.

## 2026-02-08

- Replaced the task manager example with a minimal file browser + append-line demo.
- Stripped all task-specific helpers, components, atoms, hooks, and types.
- Simplified VaultSync to track files only (no task extraction).
- Slimmed tailwind.config.js to Obsidian theme colors only.
- Updated AGENTS.md, README, and boilerplate docs for the new structure.

## 2026-02-02

- Extracted generic Obsidian view and event helpers into `src/obsidian/` to separate the reusable plugin shell from the example feature.
- Replaced the old context-shaped event bootstrap with `VaultSync`, which makes the plugin lifecycle wiring explicit and avoids pretending there is shared context state when there is not.
- Added `docs/boilerplate.md` to define which files belong to the boilerplate core versus the current task-manager example.

## 2026-01-12

- Added a shared task serializer in `src/helpers/tasks/serialize.ts` so task markdown format has one canonical write path.
- Added round-trip tests for parser and serializer behavior to make future automated edits safer.
- Expanded repository documentation with an architecture map and explicit task-editing seams for LLM-assisted work.

## 2026-01-18

- Added `docs/task-format.md` with canonical task examples and edge cases for future automated edits.
- Moved completion and task-metadata rewrites onto parse/mutate/serialize helpers so task edits use the same formatting path.
- Cleaned up TypeScript config hygiene by moving `paths` into `compilerOptions`, enabling `skipLibCheck`, and adding local Jest global declarations to reduce verification noise.

## 2026-01-31

- Added a short task-change checklist to `AGENTS.md` covering docs, tests, type-checking, and implementation log updates.
- Renamed the file models from `FileType`/`Filey` to `ParsedFile`/`StoredFile` to make the parsed-vs-stored distinction explicit without changing behavior.
- Renamed the task models from `TaskType`/`Taskey` to `ParsedTask`/`StoredTask` and renamed the remaining `Taskey`-named helper methods for consistency.

## 2026-06-26

- Added optional cleartext labels to inline secrets via a fence param (```secret name="STRIPE_KEY"). The label is **intentionally not encrypted** so the dashboard (and the in-editor block header) stay scannable while the vault is locked — finding an env var should not require unlocking. The tradeoff: anyone reading the raw `.md` can see a secret's name and which note holds it, just not its value.
- Format lives in one place: `src/helpers/secretLabel.ts` (`parseSecretLabel` / `formatSecretFence`), shared by the vault scanner (`scanSecrets.ts`), the reading-mode processor (`secretProcessor.ts`, which recovers the fence line via `ctx.getSectionInfo`), and the `Encrypt selection` command (which now prompts for an optional label).
- The scanner regex requires a whitespace boundary after `secret` so languages like `secrets` are not matched as secret blocks.

## 2026-06-26 (dashboard toggle)

- Promoted the Secrets Dashboard from the hardcoded `FEATURES.dashboard` compile-time flag to a persisted `enableDashboard` setting with a toggle in the settings tab (under Behavior). Mirrors the `enableMemoryNotes` pattern: read once at plugin load to register the view + ribbon, so toggling needs a reload (noted in the UI).
- Removed `src/featureFlags.ts` — it only ever gated the dashboard, so it is now dead.
