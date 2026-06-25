# Releasing

Releases are built and published by `.github/workflows/release.yml`, which runs
when a **version tag is pushed**. You bump + tag locally; CI does the build and
publishes the GitHub release with `main.js` and `manifest.json` attached.

## Steps

```bash
# 1. Bump version (updates package.json, public/manifest.json, versions.json)
pnpm run bump 0.2.0

# 2. Commit + push to main
git commit -am "release: 0.2.0"
git push origin main

# 3. Tag and push the tag — NO "v" prefix
git tag 0.2.0
git push origin 0.2.0
```

Pushing the tag triggers the workflow: it installs, runs `pnpm build`, and
creates the `0.2.0` release with auto-generated notes. Edit the notes on the
release page afterwards if you want.

## Conventions

- **Tag = exactly the manifest version, no `v` prefix** (Obsidian community-store
  requirement). The legacy `v0.1.0` release predates this; tags from `0.2.0`
  onward drop the `v`.
- **`versions.json`** maps each plugin version to its `minAppVersion`; the bump
  script appends an entry. Bump `minAppVersion` in `public/manifest.json` first
  if a release needs a newer Obsidian.
- **CSS is inlined** into `main.js` (UMD build), so there's no `styles.css`
  asset. The workflow ships one automatically if a future build emits it.

## CI build note

`vite.config.ts` writes the bundle under `$OBSIDIAN_PATH/.obsidian/plugins/<id>`.
The workflow sets `OBSIDIAN_PATH` to a throwaway dir so the build works without a
real vault, then copies the assets from there.
