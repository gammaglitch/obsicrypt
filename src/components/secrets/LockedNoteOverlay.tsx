import { FunctionalComponent } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { checkVerifier, decryptString } from '../../helpers/crypto/crypto';
import { EnvelopeError, EnvelopeParts, parse } from '../../helpers/crypto/envelope';
import { setMasterPassword, useSecretsStore } from '../../obsidian/secretsStore';

export type LockedNoteOverlayProps = {
	envelope: string;
	// Called with the decrypted note content. The editor overlay uses this to
	// write plaintext back into the document (decrypt-to-disk).
	onDecrypted: (plaintext: string) => void;
};

type Parsed =
	| { ok: true; parts: EnvelopeParts }
	| { ok: false; error: string };

/**
 * Full-editor overlay shown when a whole-note-encrypted file is open. Embeds the
 * password field directly (no modal). Adapts to vault state: a password prompt
 * when the vault is locked, a one-click unlock when it's already unlocked.
 */
export const LockedNoteOverlay: FunctionalComponent<LockedNoteOverlayProps> = ({
	envelope,
	onDecrypted,
}) => {
	const { masterPassword, isUnlocked, hasVerifier, settings } = useSecretsStore();
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);

	const parsed: Parsed = useMemo(() => {
		try {
			return { ok: true, parts: parse(envelope) };
		} catch (err) {
			return {
				ok: false,
				error:
					err instanceof EnvelopeError
						? `Invalid encrypted note: ${err.message}`
						: 'Invalid encrypted note',
			};
		}
	}, [envelope]);

	const decryptAndEmit = async (pw: string): Promise<void> => {
		if (!parsed.ok) return;
		const plaintext = await decryptString(parsed.parts, pw);
		onDecrypted(plaintext);
	};

	const unlockWithEntered = async () => {
		if (!password || !settings.verifier) return;
		setBusy(true);
		setError('');
		try {
			const ok = await checkVerifier(settings.verifier, password);
			if (!ok) {
				setError('Incorrect master password.');
				return;
			}
			setMasterPassword(password);
			await decryptAndEmit(password);
		} catch {
			setError('Could not unlock — wrong password or tampered content.');
		} finally {
			setBusy(false);
		}
	};

	const unlockWithCached = async () => {
		if (masterPassword === null) return;
		setBusy(true);
		setError('');
		try {
			await decryptAndEmit(masterPassword);
		} catch {
			setError('Could not unlock — wrong password or tampered content.');
		} finally {
			setBusy(false);
		}
	};

	// Auto-open (decrypt-to-disk) when the setting is on and the vault is already
	// unlocked, instead of waiting for a click. Runs once.
	const autoOpened = useRef(false);
	useEffect(() => {
		if (
			parsed.ok &&
			isUnlocked &&
			settings.autoOpenWholeNote &&
			!autoOpened.current
		) {
			autoOpened.current = true;
			void unlockWithCached();
		}
	}, [parsed.ok, isUnlocked, settings.autoOpenWholeNote]);

	const Shell: FunctionalComponent = ({ children }) => (
		<div className="flex w-full h-full items-center justify-center p-6 bg-obsidian-bg">
			<div className="flex flex-col gap-3 w-80 p-6 rounded-lg bg-obsidian-bg-secondary border border-obsidian-border">
				{children}
			</div>
		</div>
	);

	if (!parsed.ok) {
		return (
			<Shell>
				<p className="text-sm text-red-400">🔒 {parsed.error}</p>
			</Shell>
		);
	}

	if (!hasVerifier) {
		return (
			<Shell>
				<p className="text-sm text-obsidian-text-muted">
					🔒 This note is encrypted, but no master password is set. Set one in
					Obsicrypt settings to unlock it.
				</p>
			</Shell>
		);
	}

	return (
		<Shell>
			<div className="flex flex-col items-center gap-1">
				<div className="text-2xl">🔒</div>
				<h3 className="text-base font-semibold text-obsidian-text">
					This note is locked
				</h3>
			</div>

			{isUnlocked ? (
				<button
					className="px-3 py-1 rounded bg-obsidian-interactive text-obsidian-text text-sm hover:bg-obsidian-interactive-hover disabled:opacity-50"
					disabled={busy}
					onClick={() => void unlockWithCached()}
				>
					{busy ? 'Unlocking…' : 'Unlock note'}
				</button>
			) : (
				<>
					<input
						type="password"
						autoFocus
						className="px-2 py-1 rounded bg-obsidian-bg text-obsidian-text text-sm border border-obsidian-border"
						placeholder="Master password"
						value={password}
						disabled={busy}
						onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') void unlockWithEntered();
						}}
					/>
					<button
						className="px-3 py-1 rounded bg-obsidian-interactive text-obsidian-text text-sm hover:bg-obsidian-interactive-hover disabled:opacity-50"
						disabled={busy || !password}
						onClick={() => void unlockWithEntered()}
					>
						{busy ? 'Unlocking…' : 'Unlock'}
					</button>
				</>
			)}

			{error && <p className="text-xs text-red-400">{error}</p>}
		</Shell>
	);
};

export default LockedNoteOverlay;
