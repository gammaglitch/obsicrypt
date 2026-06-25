import { App } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { checkVerifier, makeVerifier } from '../../helpers/crypto/crypto';
import {
	setMasterPassword,
	updateSettings,
	useSecretsStore,
} from '../../obsidian/secretsStore';
import { PasswordPrompt } from './PasswordPrompt';

export type SecretsSettingsProps = {
	app: App;
};

type Mode = 'view' | 'set' | 'change' | 'remove';

export const SecretsSettings: FunctionalComponent<SecretsSettingsProps> = () => {
	const { settings, isUnlocked, hasVerifier } = useSecretsStore();
	const [mode, setMode] = useState<Mode>('view');
	const [error, setError] = useState<string | null>(null);
	const [oldPassword, setOldPassword] = useState<string | null>(null);

	const handleSetNew = async (password: string): Promise<void> => {
		const verifier = await makeVerifier(password);
		await updateSettings({ ...settings, verifier });
		setMasterPassword(password);
		setMode('view');
		setError(null);
	};

	const handleVerifyOld = async (password: string): Promise<void> => {
		const ok =
			settings.verifier &&
			(await checkVerifier(settings.verifier, password));
		if (!ok) {
			setError('Incorrect master password.');
			return;
		}
		setError(null);
		setOldPassword(password);
	};

	const handleRemove = async (password: string): Promise<void> => {
		const ok =
			settings.verifier &&
			(await checkVerifier(settings.verifier, password));
		if (!ok) {
			setError('Incorrect master password.');
			return;
		}
		await updateSettings({ ...settings, verifier: null });
		setMasterPassword(null);
		setMode('view');
		setError(null);
	};

	if (mode === 'set') {
		return (
			<PasswordPrompt
				title="Set master password"
				submitLabel="Set"
				confirm
				error={error}
				onSubmit={handleSetNew}
				onCancel={() => {
					setMode('view');
					setError(null);
				}}
			/>
		);
	}

	if (mode === 'change') {
		if (oldPassword === null) {
			return (
				<PasswordPrompt
					title="Enter current master password"
					submitLabel="Continue"
					error={error}
					onSubmit={handleVerifyOld}
					onCancel={() => {
						setMode('view');
						setOldPassword(null);
						setError(null);
					}}
				/>
			);
		}
		return (
			<PasswordPrompt
				title="Choose new master password"
				submitLabel="Change"
				confirm
				error={error}
				onSubmit={async (pw) => {
					await handleSetNew(pw);
					setOldPassword(null);
				}}
				onCancel={() => {
					setMode('view');
					setOldPassword(null);
					setError(null);
				}}
			/>
		);
	}

	if (mode === 'remove') {
		return (
			<div className="flex flex-col gap-3">
				<div className="text-xs text-obsidian-text-muted">
					Removing the master password leaves any encrypted blocks in
					your notes unreadable until you set the same password again.
				</div>
				<PasswordPrompt
					title="Confirm with current master password"
					submitLabel="Remove"
					error={error}
					onSubmit={handleRemove}
					onCancel={() => {
						setMode('view');
						setError(null);
					}}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="text-sm text-obsidian-text">
				Master password:{' '}
				<strong>
					{hasVerifier
						? isUnlocked
							? 'set — vault unlocked'
							: 'set — vault locked'
						: 'not set'}
				</strong>
			</div>
			<div className="flex gap-2 flex-wrap">
				{!hasVerifier && (
					<button
						className="px-3 py-1 rounded bg-obsidian-interactive text-obsidian-text text-sm hover:bg-obsidian-interactive-hover"
						onClick={() => setMode('set')}
					>
						Set master password
					</button>
				)}
				{hasVerifier && (
					<>
						<button
							className="px-3 py-1 rounded bg-obsidian-interactive text-obsidian-text text-sm hover:bg-obsidian-interactive-hover"
							onClick={() => setMode('change')}
						>
							Change password
						</button>
						{isUnlocked ? (
							<button
								className="px-3 py-1 rounded bg-obsidian-bg-secondary text-obsidian-text text-sm hover:bg-obsidian-bg-hover"
								onClick={() => setMasterPassword(null)}
							>
								Lock vault
							</button>
						) : null}
						<button
							className="px-3 py-1 rounded bg-obsidian-bg-secondary text-obsidian-text text-sm hover:bg-obsidian-bg-hover"
							onClick={() => setMode('remove')}
						>
							Remove master password
						</button>
					</>
				)}
			</div>

			<div className="text-xs font-bold text-obsidian-text-faint uppercase mt-2">
				Behavior
			</div>
			<label className="flex items-center gap-2 text-sm text-obsidian-text">
				<input
					type="checkbox"
					checked={settings.autoRevealInline}
					onChange={(e) =>
						void updateSettings({
							...settings,
							autoRevealInline: (e.target as HTMLInputElement).checked,
						})
					}
				/>
				Auto-reveal inline secrets when the vault is unlocked
			</label>
			<label className="flex items-center gap-2 text-sm text-obsidian-text">
				<input
					type="checkbox"
					checked={settings.autoOpenWholeNote}
					onChange={(e) =>
						void updateSettings({
							...settings,
							autoOpenWholeNote: (e.target as HTMLInputElement).checked,
						})
					}
				/>
				Auto-open encrypted notes when the vault is unlocked
			</label>

			<label className="flex items-center gap-2 text-sm text-obsidian-text">
				<input
					type="checkbox"
					checked={settings.enableDashboard}
					onChange={(e) =>
						void updateSettings({
							...settings,
							enableDashboard: (e.target as HTMLInputElement).checked,
						})
					}
				/>
				Show the secrets dashboard (ribbon icon + view)
			</label>
			<p className="text-xs text-obsidian-text-muted">
				Browse every inline secret in your vault, grouped by note. Reload
				Obsidian (or disable/enable the plugin) to apply this change.
			</p>

			<div className="text-xs font-bold text-obsidian-text-faint uppercase mt-2">
				Experimental
			</div>
			<label className="flex items-center gap-2 text-sm text-obsidian-text">
				<input
					type="checkbox"
					checked={settings.enableMemoryNotes}
					onChange={(e) =>
						void updateSettings({
							...settings,
							enableMemoryNotes: (e.target as HTMLInputElement).checked,
						})
					}
				/>
				Enable memory-only encrypted notes (.ocnote)
			</label>
			<p className="text-xs text-obsidian-text-muted">
				Whole-note encryption that never writes plaintext to disk. Reload
				Obsidian (or disable/enable the plugin) to apply this change.
			</p>
		</div>
	);
};
