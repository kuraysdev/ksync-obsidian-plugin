export class LogWindow {
    private log: HTMLElement
    constructor(el: HTMLElement) {
        this.log = el.createEl("div", { cls: "log-window" });
        this.log = this.log.createEl("ul", { cls: "log-list" })
    }

    addLine(text: string) {
        this.log.createEl("li", { text: text })
    }
}