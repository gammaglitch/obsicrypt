export type SecretRef = {
	/** 0-based occurrence order of this block within its source note. */
	index: number;
	/** Raw envelope body from between the fence markers (no surrounding whitespace). */
	envelope: string;
};

const SECRET_BLOCK_RE = /```secret\s*\n([\s\S]*?)\n```/g;

export function scanFileForSecrets(content: string): SecretRef[] {
	const refs: SecretRef[] = [];
	let match: RegExpExecArray | null;
	SECRET_BLOCK_RE.lastIndex = 0;
	let i = 0;
	while ((match = SECRET_BLOCK_RE.exec(content)) !== null) {
		refs.push({ index: i, envelope: match[1].trim() });
		i += 1;
	}
	return refs;
}
