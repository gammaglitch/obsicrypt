# Dev Bridge

The plugin can expose a small localhost HTTP bridge for long-running development and agent debugging sessions.

The bridge is disabled by default. Enable it only in a dev or test build.

## Environment Variables

- `VITE_OBSIDIAN_DEBUG_BRIDGE=1` enables the bridge.
- `VITE_OBSIDIAN_DEBUG_BRIDGE_HOST` sets the listen host. Defaults to `127.0.0.1`.
- `VITE_OBSIDIAN_DEBUG_BRIDGE_PORT` sets the listen port. Defaults to `27124`.
- `VITE_OBSIDIAN_DEBUG_BRIDGE_TOKEN` sets an optional bearer or `x-obsidian-bridge-token` auth token.

## API

`GET /health`

- Returns bridge status, method list, and whether auth is required.

`POST /call`

- Accepts JSON shaped like `{ "method": "ping", "params": {} }`.

Methods:

- `ping`
- `describe`
- `getPluginState`
- `openPluginView`
- `listFiles`
- `readVaultFile`
- `writeVaultFile`
- `appendToFile`
- `getActiveFile`
- `getActiveViewInfo`
- `getRecentErrors`

## Local Dev

Add the bridge flags to your `.env` before rebuilding the plugin:

```bash
OBSIDIAN_PATH=/path/to/your/vault
VITE_OBSIDIAN_DEBUG_BRIDGE=1
VITE_OBSIDIAN_DEBUG_BRIDGE_HOST=127.0.0.1
VITE_OBSIDIAN_DEBUG_BRIDGE_PORT=27124
```

Then run:

```bash
pnpm dev
```

When Obsidian loads the rebuilt plugin, the bridge listens on `http://127.0.0.1:27124`.

## Docker Dev Harness

This repo also includes a long-running Docker harness for development:

```bash
OBSIDIAN_BINARY_PATH=/absolute/path/to/Obsidian.AppImage docker compose -f docker-compose.dev.yml up --build
```

That service:

- prepares the temporary vault under `.e2e/vault`
- builds the plugin with the bridge enabled
- launches Obsidian under Xvfb
- exposes the bridge port to the host

If you set `OBSIDIAN_DEBUG_BRIDGE_TOKEN`, send it with either:

- `Authorization: Bearer <token>`
- `x-obsidian-bridge-token: <token>`

## Example Calls

```bash
curl -s http://127.0.0.1:27124/health
```

```bash
curl -s \
  -X POST http://127.0.0.1:27124/call \
  -H 'content-type: application/json' \
  -d '{"method":"listFiles"}'
```

```bash
curl -s \
  -X POST http://127.0.0.1:27124/call \
  -H 'content-type: application/json' \
  -d '{"method":"appendToFile","params":{"path":"example.md","line":"from bridge"}}'
```
