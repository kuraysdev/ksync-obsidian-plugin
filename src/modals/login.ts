import { App, ButtonComponent, Modal, Setting } from "obsidian";
import KSyncPlugin from "src/main";

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
			.setName("Login into your account");

		new Setting(contentEl)
			.setName("Login")
			.addText(text => text
				.setPlaceholder("mail@example.com")
				.setValue(this.login)
			 	.onChange(async (value) => {
			 		this.login = value;
				})
			)

		new Setting(contentEl)
			.setName("Password")
			.addText(text => text
				.setPlaceholder("Sussy password")
				.setValue(this.password)
			 	.onChange(async (value) => {
			 		this.password = value;
				})
			)

		new ButtonComponent(contentEl).setButtonText("Login").onClick(async (_) => {
			const data = await this.plugin.api.axios.post("/user/login", {
				login: this.login, 
				password: this.password
			})
		})
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}