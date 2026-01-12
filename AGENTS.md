This project is a plugin for the Obsidian Markdown editor. It uses Preact, Tailwind, Zustand and Jotai. Currently only Jotai is actively in use.

When you make changes, try to match the existing code pattern.

Reference docs/ for complicated implementations. When implementing something, which requires additional explanations, put a note in docs/log.md about it.

Safe edit seams for task-related work:

- `src/helpers/tasks/util.ts` for parsing markdown task lines into structured data
- `src/helpers/tasks/serialize.ts` for converting structured task data back to markdown
- `src/helpers/tasks/transforms.ts` for line-based content rewrites
- `src/hooks/useFileManager.tsx` for vault writes
- `src/store/atoms/*.tsx` for derived file and task state

Avoid duplicating task serialization logic inside UI components.
