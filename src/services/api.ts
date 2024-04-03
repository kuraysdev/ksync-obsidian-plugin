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
            timeout: 10000,
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
            this.plugin.logger.fatal("Отсутствует подключение к серверу. Пожалуйста, проверьте введенный адрес KSync и попробуйте заново.");
        } else {
            this.status = true;
            this.plugin.logger.info("Подключение к серверу произведено успешно!");
        }

    }
}