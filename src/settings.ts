import { PluginSettingTab, Setting, ButtonComponent, App, TextAreaComponent, SearchComponent, TextComponent, requestUrl, SliderComponent } from "obsidian";
import { LogWindow } from "./log";
import KSyncPlugin from "./main";
import { inspect } from "util";
import possiblyHost from "./util/possiblyHost";
import { LoginModal } from "./modals/login";
import { Logger } from "./util/Logger";
import { DevicesModal } from "./modals/devices";
import { Account } from "./services/account";

export class SampleSettingTab extends PluginSettingTab {
	plugin: KSyncPlugin;
	logger: Logger;
	loggerWindow: LogWindow;
	user: Account;

	constructor(app: App, plugin: KSyncPlugin) {
		super(app, plugin);

		this.plugin = plugin;
		this.logger = plugin.logger;
		this.user = this.plugin.account;
	}

	async display(): Promise<void> {
		const { containerEl: container } = this;

		container.empty();

		if(!this.plugin.api.status) {
			new Setting(container)
			.setName("Невозможно подключиться к серверу!")
			.addButton(button => button
				.setButtonText("Переподключиться")
				.onClick(async (_) => {
					this.plugin.api.CheckApi();
				})
			)
		}

		new Setting(container)
			.setHeading()
			.setName("Аккаунт");

		//Проверка есть ли аккаунт и доступно ли API
		if(this.plugin.settings.token === "" || !this.plugin.api.status) {
			new Setting(container)
			.setName(`Вы не вошли в аккаунт`)
			.addButton(button => button
				.setButtonText("Войти")
				.onClick(async (_) => {
					new LoginModal(this.app, this.plugin).open()
					this.logger.info("Используем официальный сервер")
				})
			)
		} else {

			new Setting(container)
			.setName(`Аккаунт: ${this.user.data.email}`)
			.setDesc(`Подписка: ${this.user.data.subscription}`)
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

			new Setting(container)
				.setName("Устройства")
				.setDesc("Устройства привязанные к аккаунту")
				.addButton(button => button
					.setButtonText("Просмотреть")
					.onClick(async () => {
						new DevicesModal(this.app, this.plugin).open()
					})
				)

			new Setting(container)
				.setHeading()
				.setName(`Использование: 5/${this.user.data.space}`);

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

					this.logger.info("Проверяем сессию...");

					if (!token || token === "") {
						this.logger.warning("Сессии не существует! Создание...");

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

					

					this.logger.info("[Server] Подключение...");

					
					
					//this.plugin.socket = socket;
				})
			);

		new Setting(container)
			.setName("Адрес сервера KSync")
			.setDesc("Укажите нужный вам адрес сервера")
			.addText(text => text
				.setPlaceholder("ksync.kurays.dev")
				.setValue(this.plugin.settings.server)
				.onChange(async (value) => {
					this.plugin.settings.server = value;

					await this.plugin.saveSettings();
				})
			).addButton(button => button
				.setButtonText("Сменить").setWarning()
			);

		new Setting(container)
			.setHeading()
			.setName("Логи");

		this.loggerWindow = new LogWindow(container, this.logger);
		
		new Setting(container)
		.setHeading()
		.setName("© KSync 2024 | Разработчик Абрамов Егор")
	}
}