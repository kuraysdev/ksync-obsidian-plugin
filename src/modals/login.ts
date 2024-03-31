import { App, ButtonComponent, Modal, Setting, setIcon, setTooltip } from "obsidian";
import KSyncPlugin from "src/main";
import { WarningModal } from "./warning";

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
			.setName("Вход в ваш аккаунт");

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
				.setPlaceholder("Sussy password")
				.setValue(this.password)
			 	.onChange(async (value) => {
			 		this.password = value;
				})
				.inputEl.setAttr("type", "password")
				
				
			)

		new ButtonComponent(contentEl).setButtonText("Войти").onClick(async (_) => {
			await this.plugin.account.login(this.login, this.password);
			this.close()
			this.plugin.settingsTab.display()
		})
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}