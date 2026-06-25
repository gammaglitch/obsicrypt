// Pure helpers for treating an entire note as a single encrypted unit.
//
// A whole-note-encrypted file has a frontmatter flag and a body that is just
// the raw envelope (no code fence):
//
//   ---
//   obsicrypt: encrypted
//   ---
//   obsicrypt:v1|<salt>|<iv>|<ciphertext>
//
// Locking encrypts the note's entire original content (including any original
// frontmatter) into the envelope, then writes this minimal flagged wrapper.
// Unlocking restores the original content verbatim.
//
// This is distinct from inline secrets, which stay as ```secret code blocks and
// are handled by secretProcessor.ts — the two never overlap.

export const ENCRYPTED_FRONTMATTER_KEY = 'obsicrypt';
export const ENCRYPTED_FRONTMATTER_VALUE = 'encrypted';

type Frontmatter = {
	map: Record<string, string>;
	body: string;
};

/**
 * Minimal YAML-frontmatter reader for the controlled flag format we write.
 * Returns null when there's no leading `---` block. Not a general YAML parser —
 * it only needs to read flat `key: value` lines.
 */
export function parseFrontmatter(content: string): Frontmatter | null {
	const lines = content.split('\n');
	if (lines[0]?.trim() !== '---') {
		return null;
	}

	let end = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === '---') {
			end = i;
			break;
		}
	}
	if (end === -1) {
		return null;
	}

	const map: Record<string, string> = {};
	for (let i = 1; i < end; i++) {
		const idx = lines[i].indexOf(':');
		if (idx === -1) {
			continue;
		}
		const key = lines[i].slice(0, idx).trim();
		map[key] = lines[i].slice(idx + 1).trim();
	}

	return { map, body: lines.slice(end + 1).join('\n') };
}

/** Build a fully-encrypted note: flag frontmatter + raw envelope body. */
export function buildEncryptedNote(envelope: string): string {
	return `---\n${ENCRYPTED_FRONTMATTER_KEY}: ${ENCRYPTED_FRONTMATTER_VALUE}\n---\n${envelope}\n`;
}

/**
 * Inspect a note. When it carries the encrypted flag, returns the envelope from
 * its body; otherwise `flagged` is false and `envelope` is null.
 */
export function readEncryptedNote(content: string): {
	flagged: boolean;
	envelope: string | null;
} {
	const fm = parseFrontmatter(content);
	if (!fm || fm.map[ENCRYPTED_FRONTMATTER_KEY] !== ENCRYPTED_FRONTMATTER_VALUE) {
		return { flagged: false, envelope: null };
	}
	const envelope = fm.body.trim();
	return { flagged: true, envelope: envelope.length > 0 ? envelope : null };
}

/** True when the note carries the whole-note encrypted flag. */
export function isWholeNoteEncrypted(content: string): boolean {
	return readEncryptedNote(content).flagged;
}
