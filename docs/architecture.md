# Architecture

## Overview

This plugin reads markdown tasks from the Obsidian vault, derives task views in memory, and writes updates back to the original files.

## Main Flow

1. `src/main.ts` registers and opens the custom Obsidian view.
2. `src/store/atoms/files.tsx` loads files and task data into Jotai atoms.
3. `src/helpers/files/util.ts` reads file contents and Obsidian list-item cache data.
4. `src/helpers/tasks/util.ts` parses markdown task lines into structured task objects.
5. `src/helpers/tasks/serialize.ts` emits canonical markdown task lines from structured task data.
6. `src/helpers/tasks/transforms.ts` applies line-based edits to file content.
7. `src/hooks/useFileManager.tsx` persists those edits back to the vault.

## Important Invariants

- `originalText` is the source markdown line and should be preserved for safe rewrites.
- `displayText` is metadata-free task text used for UI display.
- Metadata currently lives inline in task lines using `{key:value}`, `#tag`, and `@context`.
- The parser and serializer should round-trip without losing metadata.
- Most writes are line-based, so formatting changes should be deliberate and centralized.

## Guidance For Automated Edits

- Prefer editing parser, serializer, or transforms in isolation rather than rebuilding task strings in UI code.
- Add or update tests under `src/helpers/tasks/*.test.ts` when changing task syntax behavior.
- Keep documentation in sync in `README.md` and `docs/log.md` when task format rules change.
