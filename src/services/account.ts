import KSyncPlugin from "src/main";

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
        this.plugin.logger.info("Используем аккаунт "+user.email)
        this.data = {
            email: user.email,
            subscription: user.sub,
            space: user.space
        }
    }

    async login(email: string, password: string) {
        const data = (await this.plugin.api.axios.post("/user/login", {
            login: email, 
            password: password
        })).data
        this.plugin.settings.token = data.token
        this.plugin.saveSettings()

        const user = await this.GetData();
        this.plugin.logger.info("Используем аккаунт "+user.email)
        this.data = {
            email: user.email,
            subscription: user.sub,
            space: user.space
        }
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
}

export interface IDevice {
    name: string;
    type: DeviceType;
}

enum DeviceType {
    PHONE,
    DESKTOP
}