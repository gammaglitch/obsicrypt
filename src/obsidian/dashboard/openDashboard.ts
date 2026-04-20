import { Plugin } from 'obsidian';

import { DASHBOARD_VIEW_TYPE } from '../constants';

export async function openOrRevealDashboard(plugin: Plugin): Promise<void> {
	const existing = plugin.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
	if (existing.length > 0) {
		plugin.app.workspace.revealLeaf(existing[0]);
		return;
	}
	const leaf = plugin.app.workspace.getLeaf(true);
	await leaf.setViewState({ type: DASHBOARD_VIEW_TYPE, active: true });
	plugin.app.workspace.revealLeaf(leaf);
}
