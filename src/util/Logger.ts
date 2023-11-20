export interface LogItem {
    state: LogState,
    message: string
}

export enum LogState {
    Default,
    Information,
    Warning,
    Error,
    Fatal,
}

export type LogFunction = (item: LogItem) => void;

export class Logger {
    private logFunction: LogFunction;
    public items: LogItem[] = [];

    public onLog = (func: LogFunction) => {
        this.logFunction = (item) => {
            func(item);

            this.items.push(item);
        };
    };

    public _log = (state: LogState, message: string) => this.logFunction({ state, message });

    public log = (message: string) => this._log(LogState.Default, message);
    public info = (message: string) => this._log(LogState.Information, message);
    public warning = (message: string) => this._log(LogState.Warning, message);
    public error = (message: string) => this._log(LogState.Error, message);
    public fatal = (message: string) => this._log(LogState.Fatal, message);
}