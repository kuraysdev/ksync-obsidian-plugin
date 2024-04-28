import { Modal, App, MarkdownRenderer, Component } from "obsidian";
import KSyncPlugin from "src/main";
import { humanFileSize } from "src/util/FileUtil";
import { hash } from "src/util/CryptoHelper";

export class SampleModal extends Modal {
	public plugin: KSyncPlugin;
	constructor(app: App, plugin: KSyncPlugin) {
		super(app);

		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;
		let files = await this.plugin.manager.getMetadata();
        files = files.sort((a, b) => b.size - a.size)
        const size = files.reduce((accumulator, currentFile) => {return accumulator + currentFile.size}, 0);

		contentEl.setText(`There is ${files.length} files. Size: ${humanFileSize(size)}`);

		
		let test = ""
		for (const file of files) {
			test+=file.path+
			"\n Size: "+humanFileSize(file.size)+
			"\n Hash: "+file.hash.slice(0, 16)+
			"\n mtime: "+new Date(file.mtime).toLocaleString()+
			"\n"
		}

		MarkdownRenderer.render(this.app, "```html\n" + test + "\n```", contentEl, "", new Component());
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}