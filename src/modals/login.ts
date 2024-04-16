import { App, ButtonComponent, Modal, Setting, setIcon, setTooltip } from "obsidian";
import KSyncPlugin from "src/main";
import { WarningModal } from "./warning";
import { generateKey } from "crypto";

export class LoginModal extends Modal {
	private login: string;
	private password: string;
	
	public plugin: KSyncPlugin;

	constructor(app: App, plugin: KSyncPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;
		//contentEl.setText("Login into your KSync")


		new Setting(contentEl)
			.setHeading()
			.setName("Авторизация");

		new Setting(contentEl)
			.setName("Логин")
			.addText(text => text
				.setPlaceholder("mail@example.com")
				.setValue(this.login)
			 	.onChange(async (value) => {
			 		this.login = value;
				})
			)

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
			const data = await this.plugin.account.login(this.login, this.password);
			if(!data) return new WarningModal(this.plugin.app, this.plugin, "Сервер не отвечает. Попробуйте позднее.").open();
        	if(data.error) return new WarningModal(this.plugin.app, this.plugin, "Вы ввели неправильный логин или пароль. Пожалуйста, проверьте введенные данные на их правильность и попробуйте заново.").open();
			this.plugin.settings.token = data.token

			this.plugin.logger.info(`Входим в аккаунт ${this.login}`)
        	this.plugin.saveSettings()
			this.close()
			this.plugin.settingsTab.display()
		})
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}