import { FunctionalComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { checkVerifier } from '../../helpers/crypto/crypto';
import { setMasterPassword, useSecretsStore } from '../../obsidian/secretsStore';

export type MemoryNoteAppProps = {
	// Start in the editor (the view already decrypted via a cached session key).
	startUnlocked: boolean;
	startText: string;
	// Derive the key from the given master password, decrypt, cache the key, and
	// return the plaintext. Throws on failure. Crypto lives in the view.
	decrypt: (password: string) => Promise<string>;
	onChange: (text: string) => void;
	onLock: () => void;
	// Render markdown (in memory) into the given element. The view supplies this
	// using Obsidian's MarkdownRenderer — plaintext never reaches disk.
	renderPreview: (el: HTMLElement, markdown: string) => void;
};

type Mode = 'edit' | 'read';

// Module-level so its identity is stable across renders. Defining it inside the
// component remounts the subtree on every keystroke, stealing input focus.
const LockShell: FunctionalComponent<{ error: string }> = ({ error, children }) => (
	<div className="flex w-full h-full items-center justify-center p-6 bg-obsidian-bg">
		<div className="flex flex-col gap-3 w-80 p-6 rounded-lg bg-obsidian-bg-secondary border border-obsidian-border">
			<div className="flex flex-col items-center gap-1">
				<div className="text-2xl">🔒</div>
				<h3 className="text-base font-semibold text-obsidian-text">
					This note is locked
				</h3>
			</div>
			{children}
			{error && <p className="text-xs text-red-400">{error}</p>}
		</div>
	</div>
);

/**
 * Lock screen + plain-textarea editor for a memory-only (.ocnote) note. Adapts
 * to vault state like LockedNoteOverlay: password prompt when locked, one-click
 * unlock when the vault is already unlocked. Plaintext stays in component/view
 * memory and is handed to the view via onChange for re-encryption.
 */
export const MemoryNoteApp: FunctionalComponent<MemoryNoteAppProps> = ({
	startUnlocked,
	startText,
	decrypt,
	onChange,
	onLock,
	renderPreview,
}) => {
	const { masterPassword, isUnlocked, hasVerifier, settings } = useSecretsStore();
	const [unlocked, setUnlocked] = useState(startUnlocked);
	const [text, setText] = useState(startText);
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);
	const [mode, setMode] = useState<Mode>('edit');
	const previewRef = useRef<HTMLDivElement>(null);

	// Re-render the read-mode preview whenever it's shown or the text changes.
	useEffect(() => {
		if (unlocked && mode === 'read' && previewRef.current) {
			renderPreview(previewRef.current, text);
		}
	}, [unlocked, mode, text, renderPreview]);

	const openEditor = async (pw: string) => {
		const plaintext = await decrypt(pw);
		setText(plaintext);
		setUnlocked(true);
		setPassword('');
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
			await openEditor(password);
		} catch {
			setError('Could not unlock — wrong password or corrupted note.');
		} finally {
			setBusy(false);
		}
	};

	const unlockWithCached = async () => {
		if (masterPassword === null) return;
		setBusy(true);
		setError('');
		try {
			await openEditor(masterPassword);
		} catch {
			setError('Could not unlock — wrong password or corrupted note.');
		} finally {
			setBusy(false);
		}
	};

	const handleLock = () => {
		onLock();
		setText('');
		setPassword('');
		setError('');
		setUnlocked(false);
	};

	if (unlocked) {
		return (
			<div className="flex flex-col w-full h-full bg-obsidian-bg">
				<div className="flex items-center justify-between px-3 py-2 border-b border-obsidian-border">
					<span className="text-xs text-obsidian-text-muted">
						🔓 Unlocked — memory-only (not saved as plaintext)
					</span>
					<div className="flex items-center gap-1">
						<button
							className="px-2 py-0.5 rounded text-xs text-obsidian-text-muted hover:bg-obsidian-bg-hover"
							onClick={() => setMode((m) => (m === 'edit' ? 'read' : 'edit'))}
						>
							{mode === 'edit' ? 'Read' : 'Edit'}
						</button>
						<button
							className="px-2 py-0.5 rounded text-xs text-obsidian-text-muted hover:bg-obsidian-bg-hover"
							onClick={handleLock}
						>
							Lock
						</button>
					</div>
				</div>
				{mode === 'edit' ? (
					<textarea
						className="flex-1 w-full p-4 resize-none bg-obsidian-bg text-obsidian-text text-sm font-mono leading-relaxed outline-none"
						placeholder="Write your encrypted note…"
						value={text}
						onInput={(e) => {
							const next = (e.target as HTMLTextAreaElement).value;
							setText(next);
							onChange(next);
						}}
					/>
				) : (
					<div
						ref={previewRef}
						className="flex-1 w-full overflow-auto p-4 markdown-rendered"
					/>
				)}
			</div>
		);
	}

	if (!hasVerifier) {
		return (
			<LockShell error={error}>
				<p className="text-sm text-obsidian-text-muted text-center">
					No master password is set. Set one in Obsicrypt settings to unlock
					this note.
				</p>
			</LockShell>
		);
	}

	if (isUnlocked) {
		return (
			<LockShell error={error}>
				<button
					className="px-3 py-1 rounded bg-obsidian-interactive text-obsidian-text text-sm hover:bg-obsidian-interactive-hover disabled:opacity-50"
					disabled={busy}
					onClick={() => void unlockWithCached()}
				>
					{busy ? 'Unlocking…' : 'Unlock note'}
				</button>
			</LockShell>
		);
	}

	return (
		<LockShell error={error}>
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
		</LockShell>
	);
};

export default MemoryNoteApp;
