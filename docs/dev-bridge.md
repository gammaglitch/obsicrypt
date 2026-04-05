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
- `listFolders`
- `readVaultFile`
- `writeVaultFile`
- `createFile`
- `deleteFile`
- `appendToFile`
- `searchVault`
- `getFileMetadata`
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
- launches Obsidian under Xvfb with `--no-sandbox` and `--remote-debugging-port=9222`
- dismisses the community-plugin trust dialog via CDP (`scripts/cdp-dismiss-trust.mjs`)
- exposes the bridge port to the host
- reports healthy once the bridge responds to `/health`

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

## MCP Server

An MCP server in `mcp/bridge-server.mjs` wraps the bridge so Claude Code (or any MCP-compatible agent) can call vault operations as native tools.

### Configuration

The project includes an `.mcp.json` that Claude Code picks up automatically:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["mcp/bridge-server.mjs"],
      "env": {
        "OBSIDIAN_BRIDGE_URL": "http://127.0.0.1:27124"
      }
    }
  }
}
```

Environment variables:

- `OBSIDIAN_BRIDGE_URL` — bridge base URL. Defaults to `http://127.0.0.1:27124`.
- `OBSIDIAN_BRIDGE_TOKEN` — optional bearer token, passed as `Authorization: Bearer <token>`.

### Available Tools

| Tool | Description |
|---|---|
| `obsidian_ping` | Check bridge connectivity |
| `obsidian_get_plugin_state` | Vault name, active file, open views, recent errors |
| `obsidian_list_files` | List all markdown files |
| `obsidian_list_folders` | List all folders |
| `obsidian_search` | Search by filename or content |
| `obsidian_read_file` | Read a vault file |
| `obsidian_create_file` | Create a new file |
| `obsidian_write_file` | Overwrite an existing file |
| `obsidian_append_to_file` | Append a line |
| `obsidian_delete_file` | Move to trash |
| `obsidian_get_metadata` | Frontmatter, tags, size, timestamps |
| `obsidian_get_active_file` | Currently active file |
| `obsidian_get_active_view` | Active view type, title, file |
| `obsidian_open_plugin_view` | Open/reveal plugin sidebar |
| `obsidian_get_errors` | Recent uncaught errors |

### Usage

1. Start the bridge (local dev or Docker harness).
2. Open a Claude Code session in this repo — the MCP server starts automatically.
3. The `obsidian_*` tools appear as callable tools in the conversation.
