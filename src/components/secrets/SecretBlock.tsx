import { FunctionalComponent } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { decryptString } from '../../helpers/crypto/crypto';
import {
	EnvelopeError,
	EnvelopeParts,
	parse,
} from '../../helpers/crypto/envelope';
import { useSecretsStore } from '../../obsidian/secretsStore';

export type SecretBlockProps = {
	source: string;
	onRequestUnlock: () => void;
};

type ParseResult =
	| { ok: true; parts: EnvelopeParts }
	| { ok: false; error: string };

export const SecretBlock: FunctionalComponent<SecretBlockProps> = ({
	source,
	onRequestUnlock,
}) => {
	const parsed: ParseResult = useMemo(() => {
		try {
			return { ok: true, parts: parse(source) };
		} catch (err) {
			return {
				ok: false,
				error:
					err instanceof EnvelopeError
						? `Invalid secret block: ${err.message}`
						: 'Invalid secret block',
			};
		}
	}, [source]);

	const { masterPassword, isUnlocked, settings } = useSecretsStore();
	const [plaintext, setPlaintext] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	// When auto-reveal is off, the secret stays hidden until the user clicks Show.
	const [revealed, setRevealed] = useState(settings.autoRevealInline);

	useEffect(() => {
		if (!parsed.ok) {
			setPlaintext(null);
			setError(parsed.error);
			return;
		}
		if (!isUnlocked || masterPassword === null || !revealed) {
			setPlaintext(null);
			setError(null);
			return;
		}
		let cancelled = false;
		setError(null);
		void decryptString(parsed.parts, masterPassword).then(
			(text) => {
				if (!cancelled) setPlaintext(text);
			},
			() => {
				if (!cancelled)
					setError('Could not decrypt — wrong password or tampered content.');
			}
		);
		return () => {
			cancelled = true;
		};
	}, [parsed, isUnlocked, masterPassword, revealed]);

	if (!parsed.ok) {
		return (
			<div className="p-2 rounded border border-red-700 bg-obsidian-bg-secondary text-sm text-red-400">
				🔒 {parsed.error}
			</div>
		);
	}

	if (!isUnlocked) {
		return (
			<div className="flex items-center gap-2 p-2 rounded border border-obsidian-border bg-obsidian-bg-secondary text-sm text-obsidian-text-muted">
				<span>🔒 Encrypted content — locked</span>
				<button
					className="ml-auto px-2 py-0.5 rounded bg-obsidian-interactive text-obsidian-text text-xs hover:bg-obsidian-interactive-hover"
					onClick={onRequestUnlock}
				>
					Unlock
				</button>
			</div>
		);
	}

	// Unlocked but kept hidden (auto-reveal off, or user clicked Hide).
	if (!revealed) {
		return (
			<div className="flex items-center gap-2 p-2 rounded border border-obsidian-border bg-obsidian-bg-secondary text-sm text-obsidian-text-muted">
				<span>🔒 Encrypted content — hidden</span>
				<button
					className="ml-auto px-2 py-0.5 rounded bg-obsidian-interactive text-obsidian-text text-xs hover:bg-obsidian-interactive-hover"
					onClick={() => setRevealed(true)}
				>
					Show
				</button>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-2 rounded border border-red-700 bg-obsidian-bg-secondary text-sm text-red-400">
				🔒 {error}
			</div>
		);
	}

	if (plaintext === null) {
		return (
			<div className="p-2 rounded border border-obsidian-border bg-obsidian-bg-secondary text-sm text-obsidian-text-muted">
				🔓 Decrypting…
			</div>
		);
	}

	return (
		<div className="flex items-start gap-2 p-2 rounded border border-obsidian-border bg-obsidian-bg-secondary text-sm text-obsidian-text">
			<span className="pt-0.5">🔓</span>
			<pre className="flex-1 whitespace-pre-wrap break-all font-mono">
				{plaintext}
			</pre>
			<button
				className="px-2 py-0.5 rounded bg-obsidian-bg-secondary text-obsidian-text-muted text-xs hover:bg-obsidian-bg-hover"
				onClick={() => setRevealed(false)}
			>
				Hide
			</button>
		</div>
	);
};
