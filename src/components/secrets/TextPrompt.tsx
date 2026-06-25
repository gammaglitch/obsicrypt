import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

export type TextPromptProps = {
	title: string;
	description?: string;
	placeholder?: string;
	submitLabel?: string;
	/** Initial input value. */
	initialValue?: string;
	onSubmit: (value: string) => void | Promise<void>;
	onCancel?: () => void;
};

/**
 * A minimal single-line text prompt. Unlike PasswordPrompt, an empty value is a
 * valid submission (used for optional inputs such as a secret's label).
 */
export const TextPrompt: FunctionalComponent<TextPromptProps> = ({
	title,
	description,
	placeholder,
	submitLabel = 'OK',
	initialValue = '',
	onSubmit,
	onCancel,
}) => {
	const [value, setValue] = useState(initialValue);
	const [busy, setBusy] = useState(false);

	const handleSubmit = async (): Promise<void> => {
		setBusy(true);
		try {
			await onSubmit(value.trim());
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="flex flex-col gap-3 p-2">
			<h3 className="text-base font-semibold text-obsidian-text">{title}</h3>
			{description && (
				<div className="text-xs text-obsidian-text-muted">
					{description}
				</div>
			)}
			<input
				type="text"
				spellcheck={false}
				autofocus
				className="px-2 py-1 rounded bg-obsidian-bg-secondary text-obsidian-text text-sm border border-obsidian-border"
				placeholder={placeholder}
				value={value}
				onInput={(e) => setValue((e.target as HTMLInputElement).value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') void handleSubmit();
				}}
				disabled={busy}
			/>
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
