This is an Obsidian plugin for encrypting sensitive content inside notes.

When you make changes, try to match the existing code pattern.

Reference docs/ for architecture details. When implementing something that requires additional explanation, add a note to docs/log.md.

## Feature layout

- `src/helpers/crypto/` — pure crypto and envelope helpers (AES-GCM, PBKDF2, base64, tests alongside).
- `src/components/secrets/` — Preact components for the secret block, password prompt, and settings UI.
- `src/obsidian/secretsStore.ts` — in-memory master password + persisted verifier.
- `src/obsidian/PasswordModal.ts` — prompt-for-password Obsidian modal.
- `src/obsidian/SecretsSettingTab.ts` — settings tab for set/change/remove master password.
- `src/obsidian/secretProcessor.ts` — `` ```secret `` markdown code block processor.
- `src/obsidian/commands.ts` — `Obsicrypt: Encrypt selection` and `Obsicrypt: Lock vault` commands.

## Plugin shell (modify with care)

- `src/main.ts` — plugin lifecycle.
- `src/obsidian/testBridge.ts` — optional dev-only HTTP control surface for MCP/e2e tooling.

## Checklist

- If helper logic changes, run `pnpm test`.
- If types change, run `pnpm build:ts`.
- If architecture changes non-obviously, add a note to `docs/log.md`.
