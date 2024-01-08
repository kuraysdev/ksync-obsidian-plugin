import { App, ButtonComponent, Modal, Setting } from "obsidian";

export class LoginModal extends Modal {
	constructor(app: App) {
		super(app);
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
				.setPlaceholder("ksync@kurays.dev")
				)

		new Setting(contentEl)
			.setName("Password")
			.addText(text => text
				.setPlaceholder("Sussy password")
				)

		new ButtonComponent(contentEl).setButtonText("Login")
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}