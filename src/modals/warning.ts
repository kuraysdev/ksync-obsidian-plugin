import { App, Component, MarkdownRenderer, Modal } from "obsidian";
import KSyncPlugin from "src/main";

export class WarningModal extends Modal {
    public plugin: KSyncPlugin;
    public text: string;
	constructor(app: App, plugin: KSyncPlugin, text: string) {
		super(app);

		this.plugin = plugin;
        this.text = text;
	}

	async onOpen() {
		const { contentEl } = this;
		MarkdownRenderer.render(this.app, `# ${this.text}`, contentEl, "", new Component());
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}