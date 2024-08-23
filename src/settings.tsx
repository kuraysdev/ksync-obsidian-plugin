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
import { CryptoModal } from "./modals/crypto";
import { createContext, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

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
			.setName("Сервер недоступен, пожалуйста, повторите попытку.")
			.addButton(button => button
				.setButtonText("Переподключиться")
				.onClick(async (_) => {
					this.plugin.api.CheckApi();
				})
			)
		}

		new Setting(container)
			.setHeading()
			.setName("Взаимодействие с аккаунтом и хранилищем");

		//Проверка есть ли аккаунт и доступно ли API
		if(this.plugin.settings.token === "" || !this.plugin.api.status || !this.user) {
			new Setting(container)
			.setName(`Вы ещё не зашли в собственный аккаунт.`)
			.addButton(button => button
				.setButtonText("Войти")
				.onClick(async (_) => {
					new LoginModal(this.app, this.plugin).open()
					this.logger.info("Используем официальный сервер.")
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
				.setDesc("Создайте или выберите используемое хранилище для синхронизации")
				.addButton(button => button
					.setButtonText("Просмотреть")
					.onClick(async () => {
						new VaultsModal(this.app, this.plugin).open()
					})
				)
			

			new Setting(container)
				.setName(`Шифрование`)
				.setDesc(`Настройки безопастности для вашего хранилища`)
				.addButton(button => button
				.setButtonText("Просмотреть")
				.onClick(async () => {
					new CryptoModal(this.app, this.plugin).open()
				})
			)
				// TODO: Добавить в бета-тестирование только после того как будет реализован API
			/** new Setting(container)
				.setName("Устройства")
				.setDesc("Устройства привязанные к аккаунту")
				.addButton(button => button
					.setButtonText("Просмотреть")
					.onClick(async () => {
						new DevicesModal(this.app, this.plugin).open()
					})
				)
			*/

			const all = Number(this.user.data.space)
			const used = await this.plugin.manager.getSize()
			new Setting(container)
				.setHeading()
				.setName(`Использование: ${humanFileSize(used)}/${humanFileSize(all)}`);

			const progressBarContainer = container.createEl("div", {cls: "space-progress-bar",});
			progressBarContainer.createEl("div", {cls: ""}).setCssStyles({width: `${used/all*100}%`});
		}
		
		new Setting(container)
			.setHeading()
			.setName("Взаимодействие с сервером");

		if(this.plugin.settings.vaultid !== "") {
			new Setting(container)
			.setName("Запустить KSync")
			.setDesc("Запустить процесс синхронизации между клиентом и сервером")
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
			.setDesc("Укажите необходимый адрес сервера для синхронизации")
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
			.setName("Debug-режим");

		this.loggerWindow = new LogWindow(container, this.logger);
		
		new Setting(container)
		.setHeading()
		.setName("© KSync 2024 | Разработчик: Абрамов Егор")
	}
}


const PluginContext = createContext<{ plugin: KSyncPlugin; app: App } | null>(null);

const usePlugin = () => {
  const context = useContext(PluginContext);
  if (!context) throw new Error("usePlugin must be used within a PluginProvider");
  return context;
};

const SettingsTab: React.FC = () => {
  const { plugin, app } = usePlugin();
  const [serverAddress, setServerAddress] = useState(plugin.settings.server);
  const [isConnected, setIsConnected] = useState(plugin.api.status);
  const [spaceUsed, setSpaceUsed] = useState(0);
  const [totalSpace, setTotalSpace] = useState(0);

  useEffect(() => {
    const updateSpace = async () => {
      const used = await plugin.manager.getSize();
      setSpaceUsed(used);
      setTotalSpace(Number(plugin.account.data.space));
    };
    updateSpace();
  }, []);

  const saveSettings = async () => {
    plugin.settings.server = serverAddress;
    await plugin.saveSettings();
    plugin.api.CheckApi();
  };

  const NoConnectionError = () => (
    <div className="setting-item">
      <div className="setting-item-info">
        <div style={{color: "var(--color-red)"}} className="setting-item-name">Сервер недоступен, пожалуйста, повторите попытку.</div>
      </div>
      <div className="setting-item-control">
        <button>Переподключиться</button>
      </div>
    </div>
  )

  const AccountSection = () => (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-name">Аккаунт и хранилище</div>
        <div className="setting-item-description">
          {plugin.settings.token === "" || !isConnected || !plugin.account
            ? "Вы ещё не зашли в собственный аккаунт."
            : `Аккаунт: ${plugin.account.data.email}, Подписка: ${plugin.account.data.subscription}`}
        </div>
      </div>
      <div className="setting-item-control">
        <button
          className="mod-cta"
          onClick={() => {
            if (plugin.settings.token === "" || !isConnected || !plugin.account) {
              new LoginModal(app, plugin).open();
            } else {
              plugin.settings.token = "";
              plugin.saveSettings();
              setIsConnected(false);
            }
          }}
        >
          {plugin.settings.token === "" || !isConnected || !plugin.account ? "Войти" : "Выйти"}
        </button>
      </div>
    </div>
  );

  const VaultSection = () => (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-name">Хранилища</div>
        <div className="setting-item-description">
          {`Выбрано: ${ /*plugin.account.data.vaults.find((vault: any) => vault.id === plugin.settings.vaultid)?.name ||*/ "Не выбрано"}`}
        </div>
      </div>
      <div className="setting-item-control">
        <button className="mod-cta" onClick={() => new VaultsModal(app, plugin).open()}>
          Просмотреть
        </button>
      </div>
    </div>
  );

  const CryptoSection = () => (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-name">Шифрование</div>
        <div className="setting-item-description">Настройки безопасности для вашего хранилища</div>
      </div>
      <div className="setting-item-control">
        <button className="mod-cta" onClick={() => new CryptoModal(app, plugin).open()}>
          Просмотреть
        </button>
      </div>
    </div>
  );

  const SpaceUsageSection = () => (
    <>
      <div className="setting-item-name">
        {`Использование: ${humanFileSize(spaceUsed)}/${humanFileSize(100000000)}`/* Total Space */}
      </div>
      <div className="space-progress-bar">
        <div style={{ width: `${(spaceUsed / 100000000) * 100}%` }}></div>
      </div>
    </>
  );

  const ServerSection = () => (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-name">Адрес сервера KSync</div>
        <div className="setting-item-description">Укажите необходимый адрес сервера для синхронизации</div>
      </div>
      <div className="setting-item-control">
        <input
          type="text"
          placeholder="ksync.kurays.dev"
          value={serverAddress}
          onChange={(e) => setServerAddress(e.target.value)}
          className="w-full"
        />
        <button className="mod-warning" onClick={saveSettings}>Сменить</button>
      </div>
    </div>
  );

  const SyncSection = () => (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-name">Запустить KSync</div>
        <div className="setting-item-description">Запустить процесс синхронизации между клиентом и сервером</div>
      </div>
      <div className="setting-item-control">
        <button 
          className="mod-cta" 
          disabled={plugin.settings.vaultid === ""}
          onClick={() => plugin.manager.sync()}
        >
          Запуск
        </button>
      </div>
    </div>
  );

  return (
    <div className="ksync-settings">
      <NoConnectionError />
      <h2 className="setting-item-heading">Взаимодействие с аккаунтом и хранилищем</h2>
      <AccountSection />
      {plugin.settings.token && isConnected && plugin.account || true && (
        <>
          <VaultSection />
          <CryptoSection />
          <SpaceUsageSection />
        </>
      )}
      <h2 className="setting-item-heading">Взаимодействие с сервером</h2>
      <ServerSection />
      {plugin.settings.vaultid !== "" && <SyncSection />}
      <h2 className="setting-item-heading">Debug-режим</h2>
      {/*<LogWindow el={document.createElement('div')} logger={plugin.logger} />*/}
      <h2 className="setting-item-heading">© KSync 2024 | Разработчик: Абрамов Егор</h2>
    </div>
  );
};

export class ReactSettingsTab extends PluginSettingTab {
  plugin: KSyncPlugin;
  
  constructor(app: App, plugin: KSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    const root = createRoot(containerEl);
    root.render(
      <PluginContext.Provider value={{ plugin: this.plugin, app: this.app }}>
        <SettingsTab />
      </PluginContext.Provider>
    );
  }
}