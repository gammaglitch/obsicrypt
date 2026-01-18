# Log

## 2026-01-12

- Added a shared task serializer in `src/helpers/tasks/serialize.ts` so task markdown format has one canonical write path.
- Added round-trip tests for parser and serializer behavior to make future automated edits safer.
- Expanded repository documentation with an architecture map and explicit task-editing seams for LLM-assisted work.

## 2026-01-18

- Added `docs/task-format.md` with canonical task examples and edge cases for future automated edits.
- Moved completion and task-metadata rewrites onto parse/mutate/serialize helpers so task edits use the same formatting path.
- Cleaned up TypeScript config hygiene by moving `paths` into `compilerOptions`, enabling `skipLibCheck`, and adding local Jest global declarations to reduce verification noise.
