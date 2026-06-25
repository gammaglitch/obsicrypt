import { parseSecretLabel } from './secretLabel';

export type SecretRef = {
	/** 0-based occurrence order of this block within its source note. */
	index: number;
	/** Optional cleartext label from the fence info (`name="..."`); null when absent. */
	label: string | null;
	/** Raw envelope body from between the fence markers (no surrounding whitespace). */
	envelope: string;
};

// Group 1 captures the fence info after `secret` (e.g. ` name="X"`) so we can
// pull out the label; the leading `[ \t]` boundary keeps `secret` from matching
// other languages like `secrets`. Group 2 is the envelope body.
const SECRET_BLOCK_RE = /```secret([ \t][^\n]*)?\n([\s\S]*?)\n```/g;

export function scanFileForSecrets(content: string): SecretRef[] {
	const refs: SecretRef[] = [];
	let match: RegExpExecArray | null;
	SECRET_BLOCK_RE.lastIndex = 0;
	let i = 0;
	while ((match = SECRET_BLOCK_RE.exec(content)) !== null) {
		refs.push({
			index: i,
			label: parseSecretLabel(match[1] ?? ''),
			envelope: match[2].trim(),
		});
		i += 1;
	}
	return refs;
}
