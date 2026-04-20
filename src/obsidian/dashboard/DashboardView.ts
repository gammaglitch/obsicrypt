import { ItemView, Plugin, WorkspaceLeaf } from 'obsidian';
import { createElement, render } from 'preact';

import { Dashboard } from '../../components/dashboard/Dashboard';
import {
	DASHBOARD_VIEW_ICON,
	DASHBOARD_VIEW_NAME,
	DASHBOARD_VIEW_TYPE,
} from '../constants';

export class DashboardView extends ItemView {
	private plugin: Plugin;

	constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return DASHBOARD_VIEW_TYPE;
	}

	getDisplayText(): string {
		return DASHBOARD_VIEW_NAME;
	}

	getIcon(): string {
		return DASHBOARD_VIEW_ICON;
	}

	async onOpen(): Promise<void> {
		render(
			createElement(Dashboard, { plugin: this.plugin }),
			this.contentEl
		);
	}

	async onClose(): Promise<void> {
		render(null, this.contentEl);
	}
}
