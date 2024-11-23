import './style/index.css';

import { ItemView, Plugin, WorkspaceLeaf } from 'obsidian';
import { createElement,render } from 'preact';

import { ViewWrapper } from './ViewWrapper';

const VIEW_TYPE = 'task-manager';

class TaskManagerView extends ItemView {
	private obsidian: Plugin;

	constructor(leaf: WorkspaceLeaf, obsidian: ReactStarterPlugin) {
		super(leaf);
		this.obsidian = obsidian;
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Task-Manager';
	}

	getIcon(): string {
		return 'calendar-with-checkmark';
	}

	async onOpen(): Promise<void> {
		render(
			createElement(ViewWrapper, {
				obsidian: this.obsidian,
			}),
			this.contentEl
		);
	}
}

export default class ReactStarterPlugin extends Plugin {
	private view!: TaskManagerView;

	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
	}

	async onload(): Promise<void> {
		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (this.view = new TaskManagerView(leaf, this))
		);

		this.app.workspace.onLayoutReady(
			async () => await this.openFileTreeLeaf(true)
		);
	}

	async openFileTreeLeaf(showAfterAttach: boolean) {
		const leafs = this.app.workspace.getLeavesOfType(VIEW_TYPE);

		if (leafs.length === 0) {
			const leaf = this.app.workspace.getLeaf('tab');
			await leaf.setViewState({ type: VIEW_TYPE });

			if (showAfterAttach) {
				this.app.workspace.revealLeaf(leaf);
			}
		} else {
			leafs.forEach((leaf) => this.app.workspace.revealLeaf(leaf));
		}
	}

	onLayoutReady(): void {
		this.openFileTreeLeaf(true);
	}
}
