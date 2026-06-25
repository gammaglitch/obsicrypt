import './style/index.css';

import { Plugin, WorkspaceLeaf } from 'obsidian';

import { registerSecretsCommands } from './obsidian/commands';
import {
	DASHBOARD_VIEW_ICON,
	DASHBOARD_VIEW_TYPE,
	LOCKED_NOTE_VIEW_TYPE,
} from './obsidian/constants';
import { DashboardView } from './obsidian/dashboard/DashboardView';
import { openOrRevealDashboard } from './obsidian/dashboard/openDashboard';
import { LockedNoteView } from './obsidian/LockedNoteView';
import { MEMORY_NOTE_VIEW_TYPE } from './obsidian/memoryNote/constants';
import { SessionKeyCache } from './obsidian/memoryNote/SessionKeyCache';
import { registerMemoryNotes } from './obsidian/memoryNote/setup';
import { registerSecretViewGuard } from './obsidian/secretViewGuard';
import { registerVaultLockRibbon } from './obsidian/vaultLockRibbon';
import { SecretsSettingTab } from './obsidian/SecretsSettingTab';
import { registerSecretProcessor } from './obsidian/secretProcessor';
import {
	getSettings,
	initSecretsStore,
	setMasterPassword,
} from './obsidian/secretsStore';
import { maybeStartTestBridge, TestBridgeServer } from './obsidian/testBridge';
import { initVaultSecrets } from './obsidian/vaultSecrets';

export default class ObsicryptPlugin extends Plugin {
	private testBridge: TestBridgeServer | null = null;
	private memoryNoteKeys = new SessionKeyCache();

	onunload(): void {
		setMasterPassword(null);
		this.memoryNoteKeys.clear();

		if (this.testBridge) {
			void this.testBridge.stop();
			this.testBridge = null;
		}

		this.app.workspace
			.getLeavesOfType(DASHBOARD_VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
		this.app.workspace
			.getLeavesOfType(LOCKED_NOTE_VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
		this.app.workspace
			.getLeavesOfType(MEMORY_NOTE_VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
	}

	async onload(): Promise<void> {
		await initSecretsStore(this);

		this.addSettingTab(new SecretsSettingTab(this.app, this));
		registerSecretProcessor(this);
		registerSecretsCommands(this);

		// Whole-note encryption: a locked file's leaf is swapped to this view,
		// which shows the unlock UI (no CodeMirror dependency).
		this.registerView(
			LOCKED_NOTE_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new LockedNoteView(leaf)
		);
		registerSecretViewGuard(this);

		// Ribbon button: shows vault lock state and toggles it.
		registerVaultLockRibbon(this);

		// Memory-only encrypted notes (.ocnote) — opt-in via settings. Read at
		// load to register the extension/view; toggling requires a reload.
		if (getSettings().enableMemoryNotes) {
			registerMemoryNotes(this, this.memoryNoteKeys);
		}

		// Secrets Dashboard — opt-in via settings. Read at load to register the
		// view/ribbon; toggling requires a reload.
		if (getSettings().enableDashboard) {
			this.registerView(
				DASHBOARD_VIEW_TYPE,
				(leaf: WorkspaceLeaf) => new DashboardView(leaf, this)
			);

			this.addRibbonIcon(
				DASHBOARD_VIEW_ICON,
				'Open Obsicrypt dashboard',
				() => {
					void openOrRevealDashboard(this);
				}
			);

			this.app.workspace.onLayoutReady(() => {
				void initVaultSecrets(this);
			});
		}

		try {
			this.testBridge = await maybeStartTestBridge(this);
		} catch (error) {
			console.error('[test-bridge] failed to start', error);
		}
	}
}
