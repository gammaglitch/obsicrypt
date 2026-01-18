This project is an Obsidian plugin that renders tasks from markdown files in a Todoist-like interface.

It uses Preact for UI, Jotai for state, Tailwind for styling, and Obsidian's vault and metadata cache APIs for file access.

## Setup

Install dependencies:

```bash
pnpm install
```

Run the plugin build in watch mode:

```bash
pnpm dev
```

Run the full build:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
pnpm test:tasks
```

## Core Task Pipeline

The task flow is intentionally small:

1. `src/main.ts` registers the custom Obsidian view.
2. `src/store/atoms/files.tsx` loads vault files and exposes derived state through Jotai atoms.
3. `src/helpers/files/util.ts` reads markdown files and list item cache data from Obsidian.
4. `src/helpers/tasks/util.ts` parses task lines into structured metadata.
5. `src/helpers/tasks/serialize.ts` converts structured task data back into a canonical markdown task line.
6. `src/helpers/tasks/transforms.ts` applies line-based content updates.
7. `src/hooks/useFileManager.tsx` writes those updates back to the vault.

## Invariants

- `originalText` is the source markdown line for a task.
- `displayText` excludes metadata markers such as `{due:...}`, `#tag`, and `@context`.
- Parser and serializer should round-trip without dropping metadata.
- File mutations are currently line-based, so stable task formatting matters.

## LLM Working Notes

If an LLM is editing this repo, these are the safest seams:

- Parsing: `src/helpers/tasks/util.ts`
- Serialization: `src/helpers/tasks/serialize.ts`
- Line transforms: `src/helpers/tasks/transforms.ts`
- Vault writes: `src/hooks/useFileManager.tsx`
- Derived task/file state: `src/store/atoms/files.tsx`

Avoid duplicating task-line construction in UI components. Use the shared serializer instead.

Representative task syntax examples live in `docs/task-format.md`.
