# Task Format

This document shows the task syntax that the plugin is expected to parse, preserve, and write back in canonical form.

## Canonical Shape

Unchecked task:

```md
- [ ] Buy milk
```

Completed task:

```md
- [x] Buy milk {completedOn:2024-12-15}
```

Task with standard metadata:

```md
- [ ] Plan sprint {due:2024-12-20} {start:2024-12-10}
```

Task with tags and contexts:

```md
- [ ] Call Alex #work #finance @phone
```

Task with custom metadata:

```md
- [ ] Review draft {priority:2} {energy:high}
```

Task with mixed metadata:

```md
- [ ] Prepare retro {due:2024-12-20} {start:2024-12-18} {priority:1} #work @desk
```

## Parsing Rules

- `displayText` excludes `{key:value}`, `#tag`, and `@context` markers.
- Standard metadata keys are `due`, `start`, and `completedOn`.
- Custom metadata is stored using repeated `{key:value}` segments.
- Tags are unique by exact value.
- Contexts are unique case-insensitively.

## Canonical Write Rules

- New task lines should be written through `src/helpers/tasks/serialize.ts`.
- Metadata order is: `due`, `start`, `completedOn`, custom metadata, tags, contexts.
- Standard metadata keys are written in lowercase except `completedOn`, which keeps its camel-case field name.
- Rewriting a task line may normalize spacing and key casing.
- Updating a custom metadata key through structured helpers collapses that key to a single canonical value.

## Edge Cases

Input with irregular spacing:

```md
- [ ] Buy   milk   today
```

Display text becomes:

```txt
Buy milk today
```

Input with duplicate tags:

```md
- [ ] Task #work #work
```

Parsed tags become:

```txt
["work"]
```

Input with duplicate custom metadata:

```md
- [ ] Task {priority:1} {priority:2}
```

When that key is updated through `updateTaskLineMetadata`, this becomes:

```md
- [ ] Task {priority:2}
```
