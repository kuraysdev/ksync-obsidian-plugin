import axios, { Axios } from "axios";

export class API {
    public axios: Axios
    constructor(url: string) {
        this.axios = axios.create({
            baseURL: url,
            timeout: 1000,
            headers: {'Content-Type': 'application/json'}
        });
    }

    async CheckApi() {
        let data = await this.axios.get('/health').catch(function (error) {
            return false
        });;
        console.log(data);
        return data;
    }
}