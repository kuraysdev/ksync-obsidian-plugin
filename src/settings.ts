import { PluginSettingTab, Setting, ButtonComponent, App, TextAreaComponent, SearchComponent, TextComponent, requestUrl, SliderComponent } from "obsidian";
import { LogWindow } from "./log";
import KSyncPlugin from "./main";
import { Socket, SocketState } from "./socket";
import { logger } from "./lib/constants";
import { inspect } from "util";
import possiblyHost from "./util/possiblyHost";

export class SampleSettingTab extends PluginSettingTab {
	plugin: KSyncPlugin;
	loggerWindow: LogWindow;

	constructor(app: App, plugin: KSyncPlugin) {
		super(app, plugin);

		this.plugin = plugin;
	}

	display(): void {
		const { containerEl: container } = this;

		container.empty();

		new Setting(container)
			.setHeading()
			.setName("Account");


		new Setting(container)
			.setName(`Account: ${"me@kurays.dev"}`)
			.setDesc("Subscription: Basic")
			.addButton(button => button
				.setButtonText("Logout")
				.onClick(async (_) => {
					logger.info("Using offical server")
					logger.log("Logged in: me@kurays.dev")
					logger.error("You are ran out of space!")
					logger.fatal("Cannot sync! Server error")
				})
			)


		// new Setting(container)
		// 	.setName("Login")
		// 	.setDesc("KSync account login")
		// 	.addText(text => text
		// 		.setPlaceholder("Enter your login")
		// 		.setValue(this.plugin.settings.login)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.login = value;

		// 			await this.plugin.saveSettings();
		// 		}));

		// new Setting(container)
		// 	.setName("Password")
		// 	.setDesc("KSync account password")
		// 	.addText(text => text
		// 		.setPlaceholder("Enter your password")
		// 		.setValue(this.plugin.settings.password)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.password = value;

		// 			await this.plugin.saveSettings();
		// 		}));

		new Setting(container)
			.setHeading()
			.setName("Status: 1/1GB used");

		const progressBarContainer = container.createEl("div", {cls: "space-progress-bar",});
		const progressBar = progressBarContainer.createEl("div", {cls: "no-space"}).setCssStyles({width: `100%`});
		

		new Setting(container)
			.setName("Start KSync")
			.setDesc("Synchronization process startup")
			.addButton(button => button
				.setButtonText("Start")
				.setDisabled(this.plugin.socket?.state == SocketState.Connected)
				.onClick(async (_) => {
					button.setDisabled(true);

					const { login, password, session, server } = this.plugin.settings;

					logger.info("Checking for session...");

					if (!session || session.trim() == String.empty) {
						logger.warning("Session does not exist! Creating...");

						const address = possiblyHost(server, "http");
						const response = await requestUrl({
							url: `${address}/sessions`,
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({ username: login, password }),
							method: "POST"
						});

						logger.info(response.status.toString());

						if (response.status == 200) {
							logger.info("Successfully created a session.");

							const { token }: { token: string } = response.json;

							this.plugin.settings.session = token;
						} else if (response.status == 404) {
							logger.error("User also does not exist!");

							// TODO (Aiving): Create user if does not exist and try to start a session again (ahah).
						}
					}

					const socket = new Socket(`${server}?session=${this.plugin.settings.session}`);

					logger.info("[Server] Connecting...");

					socket.on("open", () => {
						button.setDisabled(true);

						logger.info("[Server] Successfully conected!")
					});
					socket.on("message", (message) => logger.info(`[Server] ${message.data}`));
					socket.on("error", (event) => {
						logger.error(`[Server] ${event.name}: ${event.message}`);

						button.setDisabled(false)
					});
					socket.on("close", (event) => {
						logger.fatal(`[Server] Closed with code ${event.code}${typeof event.reason !== "undefined" && event.reason !== String.empty ? ` and reason: ${event.reason}` : String.empty}.`);

						button.setDisabled(false);
					});

					this.plugin.socket = socket;
				})
			);

		new Setting(container)
			.setName("Server address")
			.setDesc("KSync server address")
			.addText(text => text
				.setPlaceholder("localhost:8000")
				.setValue(this.plugin.settings.server)
				.onChange(async (value) => {
					this.plugin.settings.server = value;

					await this.plugin.saveSettings();
				}));

		new Setting(container)
			.setHeading()
			.setName("Logs");

		this.loggerWindow = new LogWindow(container);
	}
}