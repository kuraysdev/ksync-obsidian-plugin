import axios, { Axios } from "axios";
import KSyncPlugin from "src/main";

export class API {
    public plugin: KSyncPlugin;
    public axios: Axios;
    public status: boolean;
    constructor(plugin: KSyncPlugin, url: string) {
        this.plugin = plugin;
        this.axios = axios.create({
            baseURL: url,
            timeout: 1000,
            headers: {'Content-Type': 'application/json'}
        });
        this.status = true;
    }

    async CheckApi() {
        let data = await this.axios.get('/health').catch(function (error) {
            return false
        });;
        if(!data) { 
            this.status = false;
            this.plugin.logger.fatal("Сервер не отвечает!");
        } else {
            this.status = true;
            this.plugin.logger.info("Сервер онлайн!");
        }

    }
}