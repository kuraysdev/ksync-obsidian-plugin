import { App, Editor, MarkdownView, Modal, moment, Plugin } from 'obsidian';
import { SampleSettingTab } from './settings';
import { Socket } from './socket';

// Remember to rename these classes and interfaces!

interface KSyncSettings {
	login: string;
	password: string;

	server: string;

	encryption: string;
}

let test = "not work";

const DEFAULT_SETTINGS: KSyncSettings = {
	login: '',
	password: '',

	server: 'ws://localhost:3010',
	encryption: ''
}

export default class KSyncPlugin extends Plugin {
	settings: KSyncSettings;
	statusbar: HTMLElement;

	socket?: Socket;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('cloud', 'KSync', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new SampleModal(this.app).open();
		});

		//this.socket = new Socket("ws://localhost:3000");


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateStatusBar() {
		this.statusbar.setText(moment().format("H:mm:ss"));
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
		const files = this.app.vault.getMarkdownFiles()

		for (let i = 0; i < files.length; i++) {
			contentEl.appendText(files[i].path);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}


