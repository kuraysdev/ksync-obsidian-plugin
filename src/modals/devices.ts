import { App, ButtonComponent, Modal, Setting } from "obsidian";
import KSyncPlugin from "src/main";
import { IDevice } from "src/types/user";

export class DevicesModal extends Modal {
	private login: string;
	private password: string;
	
	public plugin: KSyncPlugin;

	constructor(app: App, plugin: KSyncPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;

		new Setting(contentEl)
			.setHeading()
			.setName("Устройства");

		this.plugin.account.devices.forEach(async (device) => {
            new Setting(contentEl)
            .setName(device.name)
            .addButton(button => button.setButtonText("Выйти"))
        })
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}