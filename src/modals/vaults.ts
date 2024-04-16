import { App, ButtonComponent, Modal, Setting } from "obsidian";
import KSyncPlugin from "src/main";
import { IDevice } from "src/services/account";
import { RetypePasswordModal } from "./crypto";

export class VaultsModal extends Modal {
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
			.setName("Ваши хранилища");

		this.plugin.account.data.vaults.forEach(async (vault) => {
            new Setting(contentEl)
            .setName(vault.name)
            .addButton(button => button.setButtonText("Подключить").onClick(async (_) => {
				const id = vault.id;
				new RetypePasswordModal(this.app, this.plugin, id).open();
				this.close();
			}).setDisabled(this.plugin.settings.vaultid === vault.id))
			.addButton(button => button.setButtonText("Удалить").setWarning())
        })

		new ButtonComponent(contentEl).setButtonText("Создать новое хранилище").onClick(async (_) => {
			new CreateVaultModal(this.app, this, this.plugin).open()
		})
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class CreateVaultModal extends Modal {
	public parent: VaultsModal;
	public plugin: KSyncPlugin;
	private vault: string;
	constructor(app: App, parent: VaultsModal, plugin: KSyncPlugin) {
		super(app);

		this.plugin = plugin;
		this.parent = parent;
	}

	async onOpen() {
		const { contentEl } = this;

		new Setting(contentEl)
			.setHeading()
			.setName("Создание хранилища");

		new Setting(contentEl)
			.setName("Название хранилища")
			.addText(text => text
				.setPlaceholder("Моё первое хранилище!")
				.setValue(this.vault)
			 	.onChange(async (value) => {
			 		this.vault = value;
				})
			)

		new ButtonComponent(contentEl).setButtonText("Создать").onClick(async (_) => {
			console.log("tes1t")
			const vault = await this.plugin.account.createVault(this.vault);
			console.log("test2332")
			console.log(vault)
			if(vault) {
				await this.plugin.account.getUser();
			}
			this.close()
			this.parent.close()
			new VaultsModal(this.app, this.plugin).open()
		})
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}