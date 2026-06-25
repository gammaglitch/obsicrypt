# Obsicrypt

An Obsidian plugin that encrypts sensitive content — a selection, or a whole note — behind a single master password.

This plugin was built with Claude (Claude Code) across several iterations; see `docs/log.md` for the build log.

> ## ⚠️ Important: unlocking a whole note writes plaintext to disk
>
> Whole-note encryption uses a **decrypt-to-disk** model. Unlocking an encrypted note — via the unlock prompt, *Obsicrypt: Unlock note*, or the auto-open setting — **replaces the encrypted file with its plaintext on disk**, and it **stays plaintext until you explicitly run *Obsicrypt: Lock note* again**.
>
> While a note is unlocked it is an ordinary `.md` file, so the cleartext will be picked up by **Obsidian Sync, cloud backups, file indexers, and anything else watching your vault**. If Obsidian closes or crashes while a note is unlocked, it stays plaintext. **Re-lock notes when you're done**, and decide whether this model is acceptable before relying on it.
>
> This applies to the `.md` **whole-note** flow only. Inline `` ```secret `` blocks are decrypted **in memory** for display, and **memory-only notes** (below) keep plaintext off disk entirely — both leave the file on disk encrypted.

## Features

- **Inline secrets** — *Obsicrypt: Encrypt selection* wraps the selected text in a `` ```secret `` block and encrypts it. In reading view the block shows as locked; click **Unlock** to reveal the plaintext.
- **Whole-note encryption** — *Obsicrypt: Lock note* encrypts the entire note (flagged in frontmatter as `obsicrypt: encrypted`). Opening a locked note shows an unlock prompt instead of the editor; entering the password decrypts it back into the normal editor. *Obsicrypt: Unlock note* does the same from the command palette. (This is the decrypt-to-disk flow — see the warning above.)
- **Memory-only encrypted notes** _(experimental, opt-in)_ — *Obsicrypt: Create memory-only encrypted note* makes a `.ocnote` file whose decrypted content **never touches disk**. It opens in a custom view that keeps plaintext in memory and only ever saves the ciphertext envelope; an **Edit ⇄ Read** toggle renders the markdown (still in memory). The dedicated extension also keeps these notes out of Obsidian's search index. *Obsicrypt: Convert current note…* turns a `.md` into one. Enable under **Settings → Obsicrypt → Experimental** (reload to apply). Tradeoff: a plain textarea editor — no live preview or `[[links]]` while editing.
- **Master password** — set once in Settings → Obsicrypt and held in memory for the session. The ribbon button (🔒 / 🔓) shows whether the vault is currently locked and toggles it; *Obsicrypt: Lock vault* also clears it from memory.

When the vault is unlocked, two settings control how much opens automatically: **auto-reveal inline secrets** (on by default) and **auto-open encrypted notes** (off by default — they show a one-click unlock prompt instead of writing plaintext to disk on open).

> A **Secrets Dashboard** (a panel listing every note containing secrets) is implemented but currently disabled behind a feature flag (`src/featureFlags.ts`); a user-facing toggle will come later.

## How encryption works

- **AES-GCM-256**, with a per-secret random salt (16 B) and IV (12 B). The key is derived from your master password via **PBKDF2-SHA256, 600,000 iterations**.
- The envelope is `obsicrypt:v1|<salt>|<iv>|<ciphertext>` (base64 segments). Inline secrets store it in a `` ```secret `` block; whole-note encryption stores it as the note body under the `obsicrypt: encrypted` frontmatter flag; memory-only `.ocnote` files store it as the entire file. Either way the note stays self-contained.
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
