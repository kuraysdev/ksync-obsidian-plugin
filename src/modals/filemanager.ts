import { Modal, App, MarkdownRenderer, Component, Setting } from "obsidian";
import KSyncPlugin from "src/main";
import { humanFileSize } from "src/util/FileUtil";
import { hash } from "src/util/CryptoHelper";

export class FileManagerModal extends Modal {
	public plugin: KSyncPlugin;
	constructor(app: App, plugin: KSyncPlugin) {
		super(app);

		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;
		let files = await this.plugin.manager.getMetadata();
		let size = await this.plugin.manager.getSize();
        new Setting(contentEl)
            .setHeading()
            .setName("Файловый менеджер")
        new Setting(contentEl)
			.setName(`${files.length} файлов.`)
			.setDesc(`Занято: ${humanFileSize(size)}`)
			.addSearch(search => search)

        for (let file of files) {
            new Setting(contentEl)
            .setName(file.path)
			.addButton(button => button.setButtonText("Удалить").setWarning())
        }
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}