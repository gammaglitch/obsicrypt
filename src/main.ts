import './style/index.css';

import {
	CachedMetadata,
	ItemView,
	Plugin,
	TFile,
	WorkspaceLeaf,
	parseFrontMatterTags,
} from 'obsidian';
import { render, createElement } from 'preact';
import { ReactView } from './components/ReactView';

const VIEW_TYPE = 'react-view';

class MyReactView extends ItemView {
	private obsidian: Plugin;

	constructor(leaf: WorkspaceLeaf, obsidian: ReactStarterPlugin) {
		super(leaf);
		this.obsidian = obsidian;
	}

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
		render(
			createElement(ReactView, {
				obsidian: this.obsidian,
			}),
			this.contentEl
		);
	}
}

export default class ReactStarterPlugin extends Plugin {
	private view: MyReactView;

	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
	}

	async parseTags(metadata: CachedMetadata) {
		let tags: string[] = [];
		if (metadata) {
			// Get the tags from the frontmatter
			if (metadata?.frontmatter?.tags) {
				tags = parseFrontMatterTags(metadata.frontmatter);
			}
			// Also add the tags from the metadata object (these are present in document itself)
			if (metadata?.tags) {
				tags = tags.concat(metadata.tags.map((tag) => tag.tag));
			}
		}
		return tags;
	}

	async parseFile(file: TFile): Promise<any> {
		// Parse the metadata, tags & content of the file
		let metadata = this.app.metadataCache.getFileCache(file);
		let tags = await this.parseTags(metadata);
		let content = await this.app.vault.read(file);

		// Return a better formatted file for indexing
		return <any>{
			title: file.basename,
			path: file.path,
			content: content,
			created: file.stat.ctime,
			modified: file.stat.mtime,
			tags: tags,
		};
	}

	async indexFile(file: TFile) {
		const fileCache = this.app.metadataCache.getFileCache(file);
		const fileContent = await this.app.vault.cachedRead(file);
		const fileLines = fileContent.split('\n');
		const { listItems } = fileCache;
		const tasks = listItems.filter((item) => item.hasOwnProperty('task'));
	}

	async buildIndex() {
		const allFiles = await Promise.all(this.app.vault.getMarkdownFiles());

		for (const file of allFiles) {
			this.indexFile(file);
		}
	}

	async onload(): Promise<void> {
		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (this.view = new MyReactView(leaf, this))
		);
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		// this.app.workspace.onLayoutReady(() => {
		// 	this.onLayoutReady.bind(this);
		// 	this.buildIndex();
		// });
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
