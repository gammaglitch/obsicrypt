# Boilerplate Direction

## Goal

Turn this repository into an opinionated Obsidian plugin starter that keeps a strong default stack:

- Preact for UI
- Jotai for state
- Tailwind for styling
- Vite for local plugin builds

The current task manager should remain as the example feature until a smaller demonstration slice replaces it.

## Core vs Example

### Boilerplate core

These files should stay generic and reusable across plugin ideas:

- `src/main.ts`
- `src/ViewWrapper.tsx`
- `src/obsidian/constants.ts`
- `src/obsidian/view.ts`
- `src/obsidian/events.ts`
- `src/obsidian/VaultSync.tsx`
- `src/store/atoms/files.tsx`

### Example feature

These files are feature code and should be replaceable:

- `src/components/**`
- `src/helpers/tasks/**`
- `src/hooks/useFileManager.tsx`
- `src/store/atoms/tasks.tsx`
- `src/store/atoms/view.tsx`

## Near-Term Refactor Plan

1. Keep the plugin shell generic and move Obsidian integration behind small adapters.
2. Reduce naming that leaks task-manager assumptions into the plugin entry layer.
3. Replace the task manager with a smaller example feature once the shell is stable.
4. Add settings, command, and modal examples that are generic enough for most plugins.

## Rules For Future Work

- Keep direct `app.vault` and `app.workspace` access out of leaf UI components when possible.
- Prefer pure helper modules for markdown parsing and rewriting.
- Treat the task manager as an example slice, not the template architecture.
