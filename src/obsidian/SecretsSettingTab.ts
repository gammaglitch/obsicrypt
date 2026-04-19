import { App, Plugin, PluginSettingTab } from 'obsidian';
import { createElement, render } from 'preact';

import { SecretsSettings } from '../components/secrets/SecretsSettings';

export class SecretsSettingTab extends PluginSettingTab {
	constructor(app: App, plugin: Plugin) {
		super(app, plugin);
	}

	display(): void {
		this.containerEl.empty();
		const mount = this.containerEl.createDiv();
		render(createElement(SecretsSettings, { app: this.app }), mount);
	}

	hide(): void {
		render(null, this.containerEl);
	}
}
