import './style/index.css';

import { Plugin } from 'obsidian';

import { registerSecretsCommands } from './obsidian/commands';
import { SecretsSettingTab } from './obsidian/SecretsSettingTab';
import { registerSecretProcessor } from './obsidian/secretProcessor';
import { initSecretsStore, setMasterPassword } from './obsidian/secretsStore';
import { maybeStartTestBridge, TestBridgeServer } from './obsidian/testBridge';

export default class ObsicryptPlugin extends Plugin {
	private testBridge: TestBridgeServer | null = null;

	onunload(): void {
		setMasterPassword(null);

		if (this.testBridge) {
			void this.testBridge.stop();
			this.testBridge = null;
		}
	}

	async onload(): Promise<void> {
		await initSecretsStore(this);

		this.addSettingTab(new SecretsSettingTab(this.app, this));
		registerSecretProcessor(this);
		registerSecretsCommands(this);

		try {
			this.testBridge = await maybeStartTestBridge(this);
		} catch (error) {
			console.error('[test-bridge] failed to start', error);
		}
	}
}
