import { PluginSettingTab, Setting, ButtonComponent, App, TextAreaComponent, SearchComponent, TextComponent, requestUrl, SliderComponent } from "obsidian";
import { LogWindow } from "./log";
import KSyncPlugin from "./main";
import { logger } from "./lib/constants";
import { inspect } from "util";
import possiblyHost from "./util/possiblyHost";
import { LoginModal } from "./modals/login";

export class SampleSettingTab extends PluginSettingTab {
	plugin: KSyncPlugin;
	loggerWindow: LogWindow;

	constructor(app: App, plugin: KSyncPlugin) {
		super(app, plugin);

		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl: container } = this;

		container.empty();

		new Setting(container)
			.setHeading()
			.setName("Аккаунт");

		if(this.plugin.settings.token === "") {
			new Setting(container)
			.setName(`Вы не вошли в аккаунт`)
			.addButton(button => button
				.setButtonText("Войти")
				.onClick(async (_) => {
					new LoginModal(this.app, this.plugin).open()
					logger.info("Используем официальный сервер")
				})
			)
		} else {
			const data = await this.plugin.api.axios.get("/user", {
				headers: { Authorization: this.plugin.settings.token }
			})
			
			new Setting(container)
			.setName(`Аккаунт: ${data.data.email}`)
			.setDesc(`Подписка: ${data.data.sub}`)
			.addButton(button => button
				.setButtonText("Выйти")
				.onClick(async (_) => {
					this.plugin.settings.token = ""
					this.plugin.saveSettings()
					this.display()
				})
			)
		
			new Setting(container)
				.setName("Выберите хранилище")
				.addDropdown(dropdown => dropdown.addOptions({
				"1": this.app.vault.getName(),
				"2": "EgorAbramov"
				})
				.setDisabled(true)
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
			.setName(`Использование: 5/${data.data.space}`);

			const progressBarContainer = container.createEl("div", {cls: "space-progress-bar",});
			const progressBar = progressBarContainer.createEl("div", {cls: ""}).setCssStyles({width: `10%`});
		}
		
		

		new Setting(container)
			.setName("Запустить KSync")
			.setDesc("Запуск процесса синхронизации")
			.addButton(button => button
				.setButtonText("Запуск")
				.setDisabled(true)
				.onClick(async (_) => {
					button.setDisabled(true);

					const { token, server } = this.plugin.settings;

					logger.info("Проверяем сессию...");

					if (!token || token === "") {
						logger.warning("Сессии не существует! Создание...");

						const address = possiblyHost(server, "http");
						// const response = await requestUrl({
						// 	url: `${address}/sessions`,
						// 	headers: {
						// 		"Content-Type": "application/json"
						// 	},
						// 	body: JSON.stringify({ username: login, password }),
						// 	method: "POST"
						// });

						// logger.info(response.status.toString());

						// if (response.status == 200) {
						// 	logger.info("Сессия успешно создана.");

						// 	const { token }: { token: string } = response.json;

						// 	this.plugin.settings.session = token;
						// } else if (response.status == 404) {
						// 	logger.error("Пользователя не существует!");

						// 	// TODO (Aiving): Create user if does not exist and try to start a session again (ahah).
						// }
					}

					

					logger.info("[Server] Подключение...");

					
					
					//this.plugin.socket = socket;
				})
			);

		new Setting(container)
			.setName("Адрес сервера")
			.setDesc("Адрес сервера KSync")
			.addText(text => text
				.setPlaceholder("ksync.kurays.dev")
				.setValue(this.plugin.settings.server)
				.onChange(async (value) => {
					this.plugin.settings.server = value;

					await this.plugin.saveSettings();
				}));

		new Setting(container)
			.setHeading()
			.setName("Логи");

		this.loggerWindow = new LogWindow(container);
		
		new Setting(container)
		.setHeading()
		.setName("© KSync 2024 | Разработчик Абрамов Егор")
	}
}