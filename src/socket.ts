import { ICloseEvent, IMessageEvent, w3cwebsocket as WebSocket } from "websocket";
import { logger } from "./lib/constants";
import possiblyHost from "./util/possiblyHost";

export interface SocketEvents {
    open: [];
    message: [message: IMessageEvent];
    error: [event: Error];
    close: [event: ICloseEvent];
}

export enum SocketState {
    Connecting,
    Connected,
    Closing,
    Closed
}

export type Awaitable<T> = Promise<T> | T;
export type SocketListener<T extends keyof SocketEvents> = (...args: SocketEvents[T]) => Awaitable<any>;

export class Socket<T> {
    private connection: WebSocket;
    private _listeners: Partial<Record<keyof SocketEvents, SocketListener<keyof SocketEvents> | SocketListener<keyof SocketEvents>[]>>;

    public get state() {
        return this.connection.readyState as SocketState;
    }

    public constructor(address: string, secure?: boolean) {
        this._listeners = {};
        this.connection = new WebSocket(possiblyHost(address, "ws", secure));

        const applyListener = (listener: SocketListener<keyof SocketEvents> | SocketListener<keyof SocketEvents>[] | undefined, ...args: SocketEvents[keyof SocketEvents]) => {
            if (listener) {
                if (Array.isArray(listener)) listener.forEach(listener => listener(...args));
                else listener(...args);
            };
        };

        this.connection.onopen = () => applyListener(this._listeners.open);
        this.connection.onmessage = (message) => applyListener(this._listeners.message, message);
        this.connection.onerror = (error) => applyListener(this._listeners.error, error);
        this.connection.onclose = (event) => applyListener(this._listeners.close, event);
    }

    public on<K extends keyof SocketEvents>(event: K, listener: SocketListener<K>): this {
        if (this._listeners[event]) {
            if (Array.isArray(this._listeners[event])) (this._listeners[event] as SocketListener<K>[]).push(listener);
            else this._listeners[event] = [this._listeners[event] as SocketListener<K>, listener];
        } else this._listeners[event] = listener;

        return this;
    }

    public send = (data: T) => this.connection.send(data);
}