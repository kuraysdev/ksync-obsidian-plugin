import { PluginSettingTab, Setting, ButtonComponent, App, TextAreaComponent, SearchComponent, TextComponent, requestUrl, SliderComponent } from "obsidian";
import { LogWindow } from "./log";
import KSyncPlugin from "./main";
import { inspect } from "util";
import possiblyHost from "./util/possiblyHost";
import { LoginModal } from "./modals/login";
import { Logger } from "./util/Logger";
import { DevicesModal } from "./modals/devices";
import { Account } from "./services/account";
import { VaultsModal } from "./modals/vaults";
import { humanFileSize } from "./util/FileUtil";

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
		
			// new Setting(container)
			// 	.setName("Выберите хранилище")
			// 	.addDropdown(dropdown => dropdown.addOptions({
			// 	"1": this.app.vault.getName(),
			// 	"2": "EgorAbramov"
			// 	})
			// 	.setDisabled(this.plugin.settings.vaultid === 0)
			// 	.onChange(async (callback) => {

			// 	})
			// )
			new Setting(container)
				.setName(`Хранилища (Выбрано: ${this.user.data.vaults.find(vault => vault.id === this.plugin.settings.vaultid)?.name})`)
				.setDesc("Выберите используемое хранилище")
				.addButton(button => button
					.setButtonText("Просмотреть")
					.onClick(async () => {
						new VaultsModal(this.app, this.plugin).open()
					})
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
			const all = Number(this.user.data.space)
			const used = await this.plugin.manager.getSize()
			new Setting(container)
				.setHeading()
				.setName(`Использование: ${humanFileSize(used)}/${humanFileSize(all)}`);

			const progressBarContainer = container.createEl("div", {cls: "space-progress-bar",});
			const progressBar = progressBarContainer.createEl("div", {cls: ""}).setCssStyles({width: `${used/all*100}%`});
		}
		
		
		if(this.plugin.settings.vaultid !== 0) {
			new Setting(container)
			.setName("Запустить KSync")
			.setDesc("Запуск процесса синхронизации")
			.addButton(button => button
				.setButtonText("Запуск")
				.setDisabled(true)
				.onClick(async (_) => {
					button.setDisabled(true);

				})
			);
		}
		

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