// Inline secrets may carry an optional cleartext label on the code-block fence,
// e.g. ```secret name="STRIPE_KEY". The label is deliberately NOT encrypted so
// the dashboard stays scannable while the vault is locked — see docs/log.md.

const LABEL_RE = /name="([^"]*)"/;

/**
 * Extract the optional label from a secret fence's info string — the text on
 * the opening fence line, with or without the leading ```/`secret` (anything
 * containing `name="..."` works). Returns null when absent or empty.
 */
export function parseSecretLabel(infoString: string): string | null {
	const match = LABEL_RE.exec(infoString);
	if (!match) return null;
	const label = match[1].trim();
	return label.length > 0 ? label : null;
}

/**
 * Build the fence info string for a secret block, with an optional label.
 * Returns `secret` when there is no label, or `secret name="..."` otherwise.
 * Double quotes and newlines are stripped so the fence stays well-formed.
 */
export function formatSecretFence(label?: string | null): string {
	const clean = label?.replace(/["\r\n]/g, '').trim();
	return clean ? `secret name="${clean}"` : 'secret';
}
