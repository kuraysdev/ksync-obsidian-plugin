import { getIcon } from "obsidian";
import { LogItem, LogState, Logger } from "./util/Logger";
import match from "./util/match";

export class LogWindow {
    private log: HTMLElement;

    constructor(el: HTMLElement, logger: Logger) {
        this.log = el.createEl("div", { cls: "log-window" });
        this.log = this.log.createEl("ul", { cls: "log-list" });

        for (const item of logger.items) {
            this.addLine(item);
        }

        logger.onLog((item) => this.addLine(item));
    }

    addLine(item: LogItem) {
        let line = this.log.createEl("div", { cls: "log-item" });

        const iconId = match(item.state, [
            [LogState.Default, "circle"],
            [LogState.Information, "info"],
            [LogState.Warning, "alert-circle"],
            [LogState.Error, "x-circle"],
            [LogState.Fatal, "x-circle"]
        ])!

        const icon = getIcon(iconId)!;

        icon.setAttr("width", 14);
        icon.setAttr("height", 14);

        line.appendChild(icon);
        line.appendText(item.message)

        const stateClass = match(item.state, [
            [LogState.Default, "default-line"],
            [LogState.Information, "info-line"],
            [LogState.Warning, "warn-line"],
            [LogState.Error, "error-line"],
            [LogState.Fatal, "fatal-line"]
        ])!;

        line.addClass(stateClass);
    }
}