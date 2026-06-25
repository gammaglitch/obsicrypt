# Obsicrypt

An Obsidian plugin that encrypts sensitive content — a selection, or a whole note — behind a single master password.

This plugin was built with Claude (Claude Code) across several iterations; see `docs/log.md` for the build log.

## Features

- **Inline secrets** — *Obsicrypt: Encrypt selection* wraps the selected text in a `` ```secret `` block and encrypts it. In reading view the block shows as locked; click **Unlock** to reveal the plaintext.
- **Whole-note encryption** — *Obsicrypt: Lock note* encrypts the entire note (flagged in frontmatter as `obsicrypt: encrypted`). Opening a locked note shows an unlock prompt instead of the editor; entering the password decrypts it back into the normal editor. *Obsicrypt: Unlock note* does the same from the command palette.
- **Master password** — set once in Settings → Obsicrypt and held in memory for the session. The ribbon button (🔒 / 🔓) shows whether the vault is currently locked and toggles it; *Obsicrypt: Lock vault* also clears it from memory.

> A **Secrets Dashboard** (a panel listing every note containing secrets) is implemented but currently disabled behind a feature flag (`src/featureFlags.ts`); a user-facing toggle will come later.

## How encryption works

- **AES-GCM-256**, with a per-secret random salt (16 B) and IV (12 B). The key is derived from your master password via **PBKDF2-SHA256, 600,000 iterations**.
- The envelope is `obsicrypt:v1|<salt>|<iv>|<ciphertext>` (base64 segments). Inline secrets store it in a `` ```secret `` block; whole-note encryption stores it as the note body under the `obsicrypt: encrypted` frontmatter flag. Either way the note stays self-contained.
- Only a **verifier** (AES-GCM of a fixed string) is persisted via `plugin.saveData` — your master password is never written to disk. A wrong password simply fails to decrypt (GCM authentication).

## Building

```bash
pnpm install
pnpm build
```

Set `OBSIDIAN_PATH` in `.env` to point at your dev vault and the build emits straight into `<vault>/.obsidian/plugins/obsicrypt/`.

```bash
pnpm test        # crypto, envelope, and whole-note unit tests
pnpm build:ts    # type check
```
