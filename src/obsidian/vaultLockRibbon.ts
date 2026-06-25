// A ribbon button that shows the vault lock state and toggles it. The icon and
// tooltip track whether the master password is currently held in memory.

import { Notice, Plugin, setIcon } from 'obsidian';

import { ensureUnlocked } from './ensureUnlocked';
import { isUnlocked, setMasterPassword, subscribe } from './secretsStore';

const ICON_LOCKED = 'lock';
const ICON_UNLOCKED = 'unlock';

export function registerVaultLockRibbon(plugin: Plugin): void {
	const ribbon = plugin.addRibbonIcon(ICON_LOCKED, 'Obsicrypt', () => {
		void (async () => {
			if (isUnlocked()) {
				setMasterPassword(null);
				new Notice('Obsicrypt vault locked.');
			} else {
				// Prompts for the master password (and verifies it) when needed.
				await ensureUnlocked(plugin);
			}
		})();
	});

	const render = (): void => {
		const unlocked = isUnlocked();
		setIcon(ribbon, unlocked ? ICON_UNLOCKED : ICON_LOCKED);
		ribbon.setAttribute(
			'aria-label',
			unlocked
				? 'Obsicrypt: vault unlocked — click to lock'
				: 'Obsicrypt: vault locked — click to unlock'
		);
	};

	render();
	// Keep the icon in sync when the lock state changes elsewhere (commands,
	// unlocking a note, etc.). Cleaned up on plugin unload.
	plugin.register(subscribe(render));
}
