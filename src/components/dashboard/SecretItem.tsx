import { App, Notice } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { decryptString } from '../../helpers/crypto/crypto';
import { EnvelopeError, parse } from '../../helpers/crypto/envelope';
import { promptForPassword } from '../../obsidian/PasswordModal';
import {
	hasVerifier,
	setMasterPassword,
	useSecretsStore,
} from '../../obsidian/secretsStore';

export type SecretItemProps = {
	app: App;
	label: string;
	envelope: string;
};

async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		try {
			return document.execCommand('copy');
		} finally {
			document.body.removeChild(textarea);
		}
	}
}

export const SecretItem: FunctionalComponent<SecretItemProps> = ({
	app,
	label,
	envelope,
}) => {
	const parsed = useMemo(() => {
		try {
			return { ok: true as const, parts: parse(envelope) };
		} catch (err) {
			return {
				ok: false as const,
				error:
					err instanceof EnvelopeError
						? err.message
						: 'Invalid envelope',
			};
		}
	}, [envelope]);

	const { masterPassword, isUnlocked } = useSecretsStore();
	const [plaintext, setPlaintext] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [revealed, setRevealed] = useState(false);

	useEffect(() => {
		if (!parsed.ok) return;
		if (!isUnlocked || masterPassword === null) {
			setPlaintext(null);
			setError(null);
			setRevealed(false);
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
					setError(
						'Could not decrypt — wrong password or tampered content.'
					);
			}
		);
		return () => {
			cancelled = true;
		};
	}, [parsed, isUnlocked, masterPassword]);

	const handleUnlock = async (): Promise<void> => {
		if (!hasVerifier()) {
			new Notice(
				'Set a master password in Obsicrypt settings before unlocking secrets.'
			);
			return;
		}
		const pw = await promptForPassword(app, {
			title: 'Unlock Obsicrypt vault',
			submitLabel: 'Unlock',
			verify: true,
		});
		if (pw !== null) setMasterPassword(pw);
	};

	const handleCopy = async (): Promise<void> => {
		if (plaintext === null) return;
		const ok = await copyToClipboard(plaintext);
		new Notice(ok ? 'Secret copied to clipboard' : 'Copy failed');
	};

	if (!parsed.ok) {
		return (
			<div className="flex items-center gap-2 p-2 rounded border border-red-700 bg-obsidian-bg-secondary text-sm text-red-400">
				<span>🔒 {parsed.error}</span>
				<span className="ml-auto text-obsidian-text-faint text-xs">
					{label}
				</span>
			</div>
		);
	}

	if (!isUnlocked) {
		return (
			<div className="flex items-center gap-2 p-2 rounded border border-obsidian-border bg-obsidian-bg-secondary text-sm text-obsidian-text-muted">
				<span>🔒 {label}</span>
				<button
					className="ml-auto px-2 py-0.5 rounded bg-obsidian-interactive text-obsidian-text text-xs hover:bg-obsidian-interactive-hover"
					onClick={() => void handleUnlock()}
				>
					Unlock
				</button>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center gap-2 p-2 rounded border border-red-700 bg-obsidian-bg-secondary text-sm text-red-400">
				<span>🔒 {label}</span>
				<span className="ml-auto text-xs">{error}</span>
			</div>
		);
	}

	const isBusy = plaintext === null;

	return (
		<div className="flex items-center gap-2 p-2 rounded border border-obsidian-border bg-obsidian-bg-secondary text-sm text-obsidian-text">
			<span className="flex-shrink-0">🔓 {label}</span>
			<div className="flex-1 min-w-0 font-mono truncate">
				{isBusy ? (
					<span className="text-obsidian-text-muted italic">
						Decrypting…
					</span>
				) : revealed ? (
					<span>{plaintext}</span>
				) : (
					<span className="text-obsidian-text-muted">
						••••••••
					</span>
				)}
			</div>
			<button
				className="px-2 py-0.5 rounded bg-obsidian-bg-secondary text-obsidian-text-muted text-xs hover:bg-obsidian-bg-hover"
				onClick={() => setRevealed((r) => !r)}
				disabled={isBusy}
			>
				{revealed ? 'Hide' : 'Show'}
			</button>
			<button
				className="px-2 py-0.5 rounded bg-obsidian-interactive text-obsidian-text text-xs hover:bg-obsidian-interactive-hover"
				onClick={() => void handleCopy()}
				disabled={isBusy}
				title="Copy plaintext to clipboard"
			>
				Copy
			</button>
		</div>
	);
};
