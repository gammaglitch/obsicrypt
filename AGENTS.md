This is an Obsidian plugin for encrypting sensitive content inside notes.

When you make changes, try to match the existing code pattern.

Reference docs/ for architecture details. When implementing something that requires additional explanation, add a note to docs/log.md.

## Feature layout

- `src/helpers/crypto/` — pure crypto and envelope helpers (AES-GCM, PBKDF2, base64, tests alongside).
- `src/components/secrets/` — Preact components for the secret block, password prompt, and settings UI.
- `src/obsidian/secretsStore.ts` — in-memory master password + persisted verifier.
- `src/obsidian/PasswordModal.ts` — prompt-for-password Obsidian modal.
- `src/obsidian/SecretsSettingTab.ts` — settings tab for set/change/remove master password.
- `src/obsidian/secretProcessor.ts` — `` ```secret `` markdown code block processor (inline secrets).
- `src/helpers/wholeNote.ts` — pure helpers for whole-note encryption (frontmatter flag + raw envelope body; tests alongside).
- `src/obsidian/LockedNoteView.ts` — a plain `ItemView` (no CodeMirror) that shows the unlock UI; a flagged note's leaf is swapped to it.
- `src/obsidian/secretViewGuard.ts` — listens for `file-open` and swaps a markdown leaf showing a whole-note-encrypted file to the LockedNoteView.
- `src/components/secrets/LockedNoteOverlay.tsx` — Preact unlock UI (inline password field, decrypt-to-disk) used by LockedNoteView.
- `src/obsidian/commands.ts` — `Obsicrypt: Encrypt selection`, `Obsicrypt: Lock note`, `Obsicrypt: Unlock note`, and `Obsicrypt: Lock vault` commands.

Whole-note (frontmatter flag) and inline (`` ```secret `` blocks) are independent paths; the view guard gates only on the flag so inline secrets are never affected. Do NOT import `@codemirror/*` — Obsidian shares a single instance and a second one breaks editor extensions ("multiple instances of @codemirror/state"); the leaf-swap approach avoids it.

## Plugin shell (modify with care)

- `src/main.ts` — plugin lifecycle.
- `src/obsidian/testBridge.ts` — optional dev-only HTTP control surface for MCP/e2e tooling.

## Checklist

- If helper logic changes, run `pnpm test`.
- If types change, run `pnpm build:ts`.
- If architecture changes non-obviously, add a note to `docs/log.md`.
