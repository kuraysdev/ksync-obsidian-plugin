import { App, ButtonComponent, Component, MarkdownRenderer, Modal, Setting } from "obsidian";
import KSyncPlugin from "src/main";
import { WarningModal } from "./warning";
import { generateKey } from "../util/FileUtil";

export class CryptoModal extends Modal {
    public plugin: KSyncPlugin;
	constructor(app: App, plugin: KSyncPlugin) {
		super(app);

		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;
		new Setting(contentEl)
			.setHeading()
			.setName("Настройки шифрования");
        new Setting(contentEl)
        .setName("Это ваш ключ. Красивый, правда?")
        .setDesc(this.plugin.settings.key ?? "Отсутствует")
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}

export class RetypePasswordModal extends Modal {
	private password: string;
    private vaultId: string;
	
	public plugin: KSyncPlugin;

	constructor(app: App, plugin: KSyncPlugin, vaultId: string) {
		super(app);
		this.plugin = plugin;
        this.vaultId = vaultId;
	}

	onOpen() {
		const {contentEl} = this;
		//contentEl.setText("Login into your KSync")


		new Setting(contentEl)
			.setHeading()
			.setName("Для установки хранилища введите пароль снова");

		new Setting(contentEl)
			.setName("Пароль")
			.addText(text => text
				.setPlaceholder("Password")
				.setValue(this.password)
			 	.onChange(async (value) => {
			 		this.password = value;
				})
				.inputEl.setAttr("type", "password")
				
				
			)

		new ButtonComponent(contentEl).setButtonText("Войти").onClick(async (_) => {
			const check = await this.plugin.account.login(this.plugin.account.data.email, this.password);
            if(check.error) return new WarningModal(this.plugin.app, this.plugin, "Вы ввели неправильный логин или пароль. Пожалуйста, проверьте введенные данные на их правильность и попробуйте заново.").open();

            const key = await generateKey(this.password, this.vaultId);
            if(!key) return new WarningModal(this.plugin.app, this.plugin, "Произошла ошибка при создании ключа.").open()

            const decoder = new TextDecoder()
            this.plugin.settings.key = decoder.decode(key);
            this.plugin.saveSettings();
            this.plugin.settings.vaultid = this.vaultId;
			this.plugin.saveSettings();

			this.close()
			this.plugin.settingsTab.display()
		})
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}