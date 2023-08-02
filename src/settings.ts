import { PluginSettingTab, Setting, ButtonComponent, App, TextAreaComponent, SearchComponent, TextComponent } from "obsidian";
import { LogWindow } from "./log";
import KSyncPlugin from "./main";
import { Socket } from "./socket";

export class SampleSettingTab extends PluginSettingTab {
	plugin: KSyncPlugin;

	constructor(app: App, plugin: KSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl).setHeading().setName("Account")

		new Setting(containerEl)
			.setName('Login')
			.setDesc('KSync account login')
			.addText(text => text
				.setPlaceholder('Enter your login')
				.setValue(this.plugin.settings.login)
				.onChange(async (value) => {
					this.plugin.settings.login = value;
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
			.setName('Password')
			.setDesc('KSync account password')
			.addText(text => text
				.setPlaceholder('Enter your password')
				.setValue(this.plugin.settings.password)
				.onChange(async (value) => {
					this.plugin.settings.password = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl).setHeading().setName("Logs")
        let log = new LogWindow(containerEl)
		for (let i = 0; i < 100; i++) {
			log.addLine("[Sync]: log"+i)
		}
		
        new Setting(containerEl).setHeading().setName("Status")

		new Setting(containerEl)
		.setName("Start KSync")
		.setDesc("Sync process startup")
		.addToggle(toggle => toggle
			.setValue(this.plugin.socket?.connected || false)
			.onChange(async (value) => {
				if(value) {
					this.plugin.socket = new Socket(this.plugin.settings.server);
					this.plugin.socket.ws.onerror = function() {
						toggle.setValue(false);
					}
				} else {
					delete this.plugin.socket;
				}
			})
		)
		new Setting(containerEl)
		.setName('Server address')
		.setDesc('KSync server endpoint')
		.addText(text => text
			.setPlaceholder('Enter server address')
			.setValue(this.plugin.settings.server)
			.onChange(async (value) => {
				this.plugin.settings.server = value;
				await this.plugin.saveSettings();
			}));
	}
}