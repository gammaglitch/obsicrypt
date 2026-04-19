import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

export type PasswordPromptProps = {
	title: string;
	submitLabel?: string;
	confirm?: boolean;
	error?: string | null;
	onSubmit: (password: string) => void | Promise<void>;
	onCancel?: () => void;
};

export const PasswordPrompt: FunctionalComponent<PasswordPromptProps> = ({
	title,
	submitLabel = 'Unlock',
	confirm = false,
	error,
	onSubmit,
	onCancel,
}) => {
	const [pw, setPw] = useState('');
	const [confirmPw, setConfirmPw] = useState('');
	const [busy, setBusy] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (): Promise<void> => {
		if (!pw) {
			setLocalError('Password cannot be empty');
			return;
		}
		if (confirm && pw !== confirmPw) {
			setLocalError('Passwords do not match');
			return;
		}
		setLocalError(null);
		setBusy(true);
		try {
			await onSubmit(pw);
		} finally {
			setPw('');
			setConfirmPw('');
			setBusy(false);
		}
	};

	const shownError = localError ?? error ?? null;

	return (
		<div className="flex flex-col gap-3 p-2">
			<h3 className="text-base font-semibold text-obsidian-text">{title}</h3>
			<input
				type="password"
				autocomplete="new-password"
				spellcheck={false}
				className="px-2 py-1 rounded bg-obsidian-bg-secondary text-obsidian-text text-sm border border-obsidian-border"
				placeholder="Master password"
				value={pw}
				onInput={(e) =>
					setPw((e.target as HTMLInputElement).value)
				}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !confirm) void handleSubmit();
				}}
				disabled={busy}
			/>
			{confirm && (
				<input
					type="password"
					autocomplete="new-password"
					spellcheck={false}
					className="px-2 py-1 rounded bg-obsidian-bg-secondary text-obsidian-text text-sm border border-obsidian-border"
					placeholder="Confirm password"
					value={confirmPw}
					onInput={(e) =>
						setConfirmPw((e.target as HTMLInputElement).value)
					}
					onKeyDown={(e) => {
						if (e.key === 'Enter') void handleSubmit();
					}}
					disabled={busy}
				/>
			)}
			{shownError && (
				<div className="text-xs text-red-400">{shownError}</div>
			)}
			<div className="flex gap-2 justify-end">
				{onCancel && (
					<button
						className="px-3 py-1 rounded bg-obsidian-bg-secondary text-obsidian-text text-sm hover:bg-obsidian-bg-hover"
						onClick={onCancel}
						disabled={busy}
					>
						Cancel
					</button>
				)}
				<button
					className="px-3 py-1 rounded bg-obsidian-interactive text-obsidian-text text-sm hover:bg-obsidian-interactive-hover"
					onClick={() => void handleSubmit()}
					disabled={busy}
				>
					{submitLabel}
				</button>
			</div>
		</div>
	);
};
