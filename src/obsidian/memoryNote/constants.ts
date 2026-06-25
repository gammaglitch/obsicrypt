// A dedicated file extension so Obsidian opens these in our own view (not the
// markdown editor) and — crucially — does not parse them into the metadata
// cache / search index, keeping decrypted plaintext out of those stores.

export const MEMORY_NOTE_EXTENSION = 'ocnote';
export const MEMORY_NOTE_VIEW_TYPE = 'obsicrypt-memory-note-view';
export const MEMORY_NOTE_VIEW_ICON = 'lock';
