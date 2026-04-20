import './style/index.css';

import { Plugin, WorkspaceLeaf } from 'obsidian';

import { registerSecretsCommands } from './obsidian/commands';
import {
	DASHBOARD_VIEW_ICON,
	DASHBOARD_VIEW_TYPE,
} from './obsidian/constants';
import { DashboardView } from './obsidian/dashboard/DashboardView';
import { openOrRevealDashboard } from './obsidian/dashboard/openDashboard';
import { SecretsSettingTab } from './obsidian/SecretsSettingTab';
import { registerSecretProcessor } from './obsidian/secretProcessor';
import { initSecretsStore, setMasterPassword } from './obsidian/secretsStore';
import { maybeStartTestBridge, TestBridgeServer } from './obsidian/testBridge';
import { initVaultSecrets } from './obsidian/vaultSecrets';

export default class ObsicryptPlugin extends Plugin {
	private testBridge: TestBridgeServer | null = null;

	onunload(): void {
		setMasterPassword(null);

		if (this.testBridge) {
			void this.testBridge.stop();
			this.testBridge = null;
		}

		this.app.workspace
			.getLeavesOfType(DASHBOARD_VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
	}

	async onload(): Promise<void> {
		await initSecretsStore(this);

		this.addSettingTab(new SecretsSettingTab(this.app, this));
		registerSecretProcessor(this);
		registerSecretsCommands(this);

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

		try {
			this.testBridge = await maybeStartTestBridge(this);
		} catch (error) {
			console.error('[test-bridge] failed to start', error);
		}
	}
}
