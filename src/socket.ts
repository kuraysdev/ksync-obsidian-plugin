import { w3cwebsocket } from "websocket";

export class Socket {
    public ws: w3cwebsocket;
    public connected: boolean = false;

    constructor(address: string) {
        this.ws = new w3cwebsocket(address);
        this.ws.onopen = function() {
            this.connected = true;
        }
        this.ws.onerror = function() {
			console.log("ОШИБКА СОКЕТА");
		}
    }

    send(data: string) {
        this.ws.send(data)
    }
}