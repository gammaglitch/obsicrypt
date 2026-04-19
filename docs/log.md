# Log

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
