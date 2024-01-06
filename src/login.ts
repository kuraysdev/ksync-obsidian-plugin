import { App, Modal } from "obsidian";

export class LoginModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText("Login")
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}