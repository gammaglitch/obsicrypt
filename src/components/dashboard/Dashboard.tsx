import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { useSecretsStore } from '../../obsidian/secretsStore';
import { useVaultSecrets } from '../../obsidian/vaultSecrets';
import { NoteRow } from './NoteRow';
import { SecretItem } from './SecretItem';

export type DashboardProps = {
	plugin: Plugin;
};

export const Dashboard: FunctionalComponent<DashboardProps> = ({ plugin }) => {
	const secrets = useVaultSecrets();
	const { isUnlocked, hasVerifier } = useSecretsStore();

	const sortedPaths = useMemo(
		() => [...secrets.keys()].sort((a, b) => a.localeCompare(b)),
		[secrets]
	);

	const [activePath, setActivePath] = useState<string | null>(null);

	useEffect(() => {
		if (activePath !== null && !secrets.has(activePath)) {
			setActivePath(null);
		}
	}, [activePath, secrets]);

	const activeRefs = activePath ? secrets.get(activePath) ?? [] : [];

	return (
		<div className="flex w-full h-full">
			<div className="flex-shrink-0 w-1/3 px-4 pt-4 overflow-auto bg-obsidian-bg-secondary">
				<h3 className="text-xs font-bold text-obsidian-text-faint uppercase mb-2">
					Notes with secrets
				</h3>
				{!hasVerifier && (
					<div className="mb-3 text-xs text-obsidian-text-muted italic">
						Set a master password in Obsicrypt settings to unlock
						secrets.
					</div>
				)}
				{sortedPaths.length === 0 ? (
					<p className="text-sm text-obsidian-text-muted italic">
						No secrets found in this vault.
					</p>
				) : (
					sortedPaths.map((path) => (
						<NoteRow
							key={path}
							path={path}
							count={secrets.get(path)?.length ?? 0}
							active={activePath === path}
							onSelect={setActivePath}
						/>
					))
				)}
			</div>

			<div className="flex-1 w-2/3 px-4 pt-4 overflow-auto bg-obsidian-bg">
				{activePath === null ? (
					<p className="text-sm text-obsidian-text-muted italic">
						Select a note to view its secrets.
					</p>
				) : (
					<div className="flex flex-col gap-3">
						<h2 className="text-lg font-semibold text-obsidian-text break-all">
							{activePath}
						</h2>
						{!isUnlocked && hasVerifier && (
							<div className="text-xs text-obsidian-text-muted">
								Vault is locked. Click Unlock on any secret to
								decrypt.
							</div>
						)}
						{activeRefs.map((ref) => (
							<SecretItem
								key={`${activePath}:${ref.index}`}
								app={plugin.app}
								label={`Secret ${ref.index + 1}`}
								envelope={ref.envelope}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
