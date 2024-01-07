import { App, Component, MarkdownRenderer, Modal, moment, Plugin, TFile, TFolder, Vault } from "obsidian";
import { SampleSettingTab as KSyncSettingTab } from "./settings";
import { Socket } from "./socket";
import "./prepare";
import { Frame, FrameData, FrameOPCode } from "./types/socket";
import { hash } from "./util/FileUtil";
import { LoginModal } from "./login";

interface KSyncSettings {
	login: string;
	password: string;
	
	session: string;

	server: string;
	encryption: string;
}

const DEFAULT_SETTINGS: KSyncSettings = {
	login: String.empty,
	password: String.empty,

	session: String.empty,

	server: "ws://localhost:8080",
	encryption: String.empty
}

export default class KSyncPlugin extends Plugin {
	settings: KSyncSettings;
	statusbar: HTMLElement;

	socket?: Socket<Frame>;

	async onload() {
		await this.loadSettings();

		this.registerEvents();

		this.addRibbonIcon("cloud", "KSync", (evt: MouseEvent) => new SampleModal(this.app).open());
		this.addSettingTab(new KSyncSettingTab(this.app, this));
		this.addCommand({
			id: "sync",
			name: "Sync Vault",
			callback: () => {
			  console.log("Hey, you!");
			},
		  });
		
		this.addCommand({
			id: "login",
			name: "Open Login Modal",
			callback: () => {
				new LoginModal(this.app).open()
			},
		});
	}

	registerEvents() {
		this.registerEvent(this.app.vault.on("create", async (file) => {
			const { path } = file;
			const createdAt = new Date((file as TFile).stat.ctime);
			const data: FrameData[FrameOPCode.Create] = { type: "file", path, createdAt };

			if (file instanceof TFile) data.data = new Uint8Array(await file.vault.readBinary(file as TFile));
			else if (file instanceof TFolder) data.type = "folder";

			this.socket?.send({ opcode: FrameOPCode.Create, data });
		}));

		this.registerEvent(this.app.vault.on("delete", async ({ path }) => this.socket?.send({ opcode: FrameOPCode.Delete, data: path })));

		this.registerEvent(this.app.vault.on("modify", async (file) => {
			const { path } = file;
			const data = new Uint8Array(await file.vault.readBinary(file as TFile));
			const updatedAt = new Date((file as TFile).stat.mtime);

			this.socket?.send({ opcode: FrameOPCode.Synchronize, data: { data, updatedAt, path } });
		}));

		this.registerEvent(this.app.vault.on("rename", ({ path }, oldPath) => this.socket?.send({ opcode: FrameOPCode.Rename, data: { oldPath, path } })));
	}

	onunload() { }

	loadSettings = async () => this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };

	saveSettings = async () => await this.saveData(this.settings);

	updateStatusBar = () => this.statusbar.setText(moment().format("H:mm:ss"));
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.setText("Woah!");

		const files = this.app.vault.getFiles()
		let test = ""
		for (let i = 0; i < files.length; i++) {
			test+=files[i].path+
			"\n Size:"+files[i].stat.size/1024/1024+"MB"+
			"\n Hash:"+await hash(await files[i].vault.read(files[i]))+
			"\n mtime:"+new Date(files[i].stat.mtime).toString()+
			"\n"
		}

		MarkdownRenderer.render(this.app, "```html\n" + test + "\n```", contentEl, "", new Component());
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}


