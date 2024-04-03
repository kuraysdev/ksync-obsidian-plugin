import KSyncPlugin from "src/main";
import { WarningModal } from "src/modals/warning";

export class Account {
    public plugin: KSyncPlugin;
    public data: IAccountData;
    public devices: Array<IDevice>

    constructor(plugin: KSyncPlugin) {
        this.plugin = plugin;
        //TODO(Kurays): For test
        this.devices = [{
			name: "My PC",
			type: 1
		},
		{
			name: "iPhone 15",
			type: 0
		}]
    }

    async getUser() {
        const user = await this.GetData();
        this.data = user;
    }

    async createVault(name: string) {
        const data = (await this.plugin.api.axios.post("/vault/create", {name: name}, {
            headers: { Authorization: this.plugin.settings.token },
        })).data
        return data
    }

    async login(email: string, password: string) {
        const data = (await this.plugin.api.axios.post("/user/login", {
            login: email, 
            password: password
        })).data
        if(!data) return new WarningModal(this.plugin.app, this.plugin, "Сервер не отвечает. Попробуйте позднее.").open();
        if(data.error) return new WarningModal(this.plugin.app, this.plugin, "Вы ввели неправильный логин или пароль. Пожалуйста, проверьте введенные данные на их правильность и попробуйте заново.").open();
        this.plugin.settings.token = data.token
        this.plugin.saveSettings()

        const user = await this.GetData();
        this.plugin.logger.info(`Входим в аккаунт ${user.email}`)
        this.data = user;
    }

    async GetData() {
        const data = (await this.plugin.api.axios.get("/user", {
            headers: { Authorization: this.plugin.settings.token }
        })).data
        return data
    }
}

export interface IAccountData {
    email: string;
    subscription: string;
    space: string;
    vaults: IVault[];
}

export interface IVault {
    id: number;
    name: string;
}

export interface IDevice {
    name: string;
    type: DeviceType;
}

enum DeviceType {
    PHONE,
    DESKTOP
}