import './style/index.css';

import { ItemView, Plugin, WorkspaceLeaf } from 'obsidian';
import { createElement, render } from 'preact';

import { ViewWrapper } from './ViewWrapper';
import {
	PLUGIN_VIEW_ICON,
	PLUGIN_VIEW_NAME,
	PLUGIN_VIEW_TYPE,
} from './obsidian/constants';
import { openOrRevealPluginView } from './obsidian/view';

class BoilerplateView extends ItemView {
	private plugin: Plugin;

	constructor(leaf: WorkspaceLeaf, plugin: BoilerplatePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return PLUGIN_VIEW_TYPE;
	}

	getDisplayText(): string {
		return PLUGIN_VIEW_NAME;
	}

	getIcon(): string {
		return PLUGIN_VIEW_ICON;
	}

	async onOpen(): Promise<void> {
		render(createElement(ViewWrapper, { plugin: this.plugin }), this.contentEl);
	}

	async onClose(): Promise<void> {
		render(null, this.contentEl);
	}
}

export default class BoilerplatePlugin extends Plugin {
	onunload(): void {
		this.app.workspace
			.getLeavesOfType(PLUGIN_VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
	}

	async onload(): Promise<void> {
		this.registerView(
			PLUGIN_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new BoilerplateView(leaf, this)
		);

		this.app.workspace.onLayoutReady(() => {
			void openOrRevealPluginView(this, { reveal: true });
		});
	}
}
