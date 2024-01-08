import { Modal, App, MarkdownRenderer, Component } from "obsidian";
import { hash, humanFileSize } from "src/util/FileUtil";

export class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;
        const files = await this.app.vault.getFiles().sort((a, b) => b.stat.size - a.stat.size)
        const size = files.reduce((accumulator, currentFile) => {return accumulator + currentFile.stat.size}, 0);

		contentEl.setText(`There is ${files.length} files. Size: ${humanFileSize(size)}`);

		
		let test = ""
		for (let i = 0; i < files.length; i++) {
			test+=files[i].path+
			"\n Size: "+humanFileSize(files[i].stat.size)+
			"\n Hash: "+await (await hash(await files[i].vault.read(files[i]))).slice(0, 16)+
			"\n mtime: "+new Date(files[i].stat.mtime).toLocaleString()+
			"\n"
		}

		MarkdownRenderer.render(this.app, "```html\n" + test + "\n```", contentEl, "", new Component());
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}