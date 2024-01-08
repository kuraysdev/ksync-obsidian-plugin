import { App, Component, MarkdownRenderer, Modal, moment, Plugin, TFile, TFolder, Vault } from "obsidian";
import { SampleSettingTab as KSyncSettingTab } from "./settings";
import { Socket } from "./socket";
import "./prepare";
import { Frame, FrameData, FrameOPCode } from "./types/socket";
import { hash } from "./util/FileUtil";
import { LoginModal } from "./modals/login";
import { SampleModal } from "./modals/debug";

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

	server: "https://ksync.kurays.dev",
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
		// this.registerEvent(this.app.vault.on("create", async (file) => {
		// 	const { path } = file;
		// 	const createdAt = new Date((file as TFile).stat.ctime);
		// 	const data: FrameData[FrameOPCode.Create] = { type: "file", path, createdAt };

		// 	if (file instanceof TFile) data.data = new Uint8Array(await file.vault.readBinary(file as TFile));
		// 	else if (file instanceof TFolder) data.type = "folder";

		// 	this.socket?.send({ opcode: FrameOPCode.Create, data });
		// }));

		// this.registerEvent(this.app.vault.on("delete", async ({ path }) => this.socket?.send({ opcode: FrameOPCode.Delete, data: path })));

		// this.registerEvent(this.app.vault.on("modify", async (file) => {
		// 	const { path } = file;
		// 	const data = new Uint8Array(await file.vault.readBinary(file as TFile));
		// 	const updatedAt = new Date((file as TFile).stat.mtime);

		// 	this.socket?.send({ opcode: FrameOPCode.Synchronize, data: { data, updatedAt, path } });
		// }));

		// this.registerEvent(this.app.vault.on("rename", ({ path }, oldPath) => this.socket?.send({ opcode: FrameOPCode.Rename, data: { oldPath, path } })));
	}

	onunload() { }

	loadSettings = async () => this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };

	saveSettings = async () => await this.saveData(this.settings);

	updateStatusBar = () => this.statusbar.setText(moment().format("H:mm:ss"));
}


