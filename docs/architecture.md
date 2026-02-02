# Architecture

## Overview

This repository now has two layers:

- A generic Obsidian plugin shell
- A task manager example feature

The goal is to keep the shell reusable while the task feature remains replaceable.

## Boilerplate Core

1. `src/main.ts` registers the custom view and mounts the Preact app.
2. `src/obsidian/constants.ts` holds view identifiers and display metadata.
3. `src/obsidian/view.ts` owns the "open or reveal" behavior for the custom view.
4. `src/obsidian/events.ts` registers vault and metadata listeners through the plugin lifecycle.
5. `src/obsidian/VaultSync.tsx` translates Obsidian events into Jotai store updates.
6. `src/store/atoms/files.tsx` stores the plugin reference and shared file/task maps.

## Example Feature Flow

1. `src/store/atoms/files.tsx` loads files and task data into Jotai atoms.
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

- Keep generic plugin-shell edits inside `src/main.ts`, `src/obsidian/*`, and shared store setup.
- Keep example-feature edits out of the plugin entry layer whenever possible.
- Prefer editing parser, serializer, or transforms in isolation rather than rebuilding task strings in UI code.
- Add or update tests under `src/helpers/tasks/*.test.ts` when changing task syntax behavior.
- Keep documentation in sync in `README.md` and `docs/log.md` when task format rules change.
