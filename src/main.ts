import { ItemView, Plugin, WorkspaceLeaf } from 'obsidian';
import { render, createElement } from 'preact';
import { ReactView } from './components/ReactView';

const VIEW_TYPE = 'react-view';

class MyReactView extends ItemView {
	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Dice Roller';
	}

	getIcon(): string {
		return 'calendar-with-checkmark';
	}

	async onOpen(): Promise<void> {
		render(createElement(ReactView, null), this.contentEl);
	}
}

export default class ReactStarterPlugin extends Plugin {
	private view: MyReactView;

	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
	}

	async onload(): Promise<void> {
		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (this.view = new MyReactView(leaf))
		);

		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
	}

	onLayoutReady(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE,
		});
	}
}
