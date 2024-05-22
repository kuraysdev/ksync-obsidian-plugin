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

    async getVault(id: string) {
        const data = (await this.plugin.api.axios.get("/vault/"+id, {
            headers: { Authorization: this.plugin.settings.token },
        })).data
        return data
    }

    async login(email: string, password: string) {
        const data = (await this.plugin.api.axios.post("/user/login", {
            login: email, 
            password: password
        })).data
        await this.GetData();
        
        return data
    }

    async GetData() {
        const data = (await this.plugin.api.axios.get("/user", {
            headers: { Authorization: this.plugin.settings.token }
        })).data
        this.data = data;
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
    id: string;
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