# Log

## 2026-02-02

- Extracted generic Obsidian view and event helpers into `src/obsidian/` to separate the reusable plugin shell from the example feature.
- Replaced the old context-shaped event bootstrap with `VaultSync`, which makes the plugin lifecycle wiring explicit and avoids pretending there is shared context state when there is not.
- Added `docs/boilerplate.md` to define which files belong to the boilerplate core versus the current task-manager example.

## 2026-01-12

- Added a shared task serializer in `src/helpers/tasks/serialize.ts` so task markdown format has one canonical write path.
- Added round-trip tests for parser and serializer behavior to make future automated edits safer.
- Expanded repository documentation with an architecture map and explicit task-editing seams for LLM-assisted work.

## 2026-01-18

- Added `docs/task-format.md` with canonical task examples and edge cases for future automated edits.
- Moved completion and task-metadata rewrites onto parse/mutate/serialize helpers so task edits use the same formatting path.
- Cleaned up TypeScript config hygiene by moving `paths` into `compilerOptions`, enabling `skipLibCheck`, and adding local Jest global declarations to reduce verification noise.

## 2026-01-31

- Added a short task-change checklist to `AGENTS.md` covering docs, tests, type-checking, and implementation log updates.
- Renamed the file models from `FileType`/`Filey` to `ParsedFile`/`StoredFile` to make the parsed-vs-stored distinction explicit without changing behavior.
- Renamed the task models from `TaskType`/`Taskey` to `ParsedTask`/`StoredTask` and renamed the remaining `Taskey`-named helper methods for consistency.
