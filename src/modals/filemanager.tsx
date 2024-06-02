import { StrictMode, useState, useEffect } from "react";
import { Modal, App } from "obsidian";
import KSyncPlugin from "src/main";
import { Root, createRoot } from "react-dom/client";
import { humanFileSize } from "src/util/FileUtil";
import { hash } from "src/util/CryptoHelper";
import { IFile } from "src/types/file";

type FMState = {files:Array<IFile>, size:number}
const initState = {
	files: new Array<IFile>,
	size: 0
}

function FileManagerUI({plugin}: {plugin: KSyncPlugin}) {
	const [state, setState] = useState<FMState>(initState) 
	useEffect(() => {
		async function getData() {
			let files = await plugin.manager.getMetadata();
			let size = await plugin.manager.getSize();
			setState({files, size});
			setResults(files);
		}

		if(state === initState) getData();
	}, [])
	

	const [search, setSearch] = useState("");
 	const [results, setResults] = useState(new Array<IFile>);
	const handleSearch = (event: any) => {
		setSearch(event.target.value);
	};

	useEffect(() => {
		const results = state.files.filter((file: IFile) =>
		  file.path.toLowerCase().includes(search.toLowerCase())
		);
		setResults(results);
	  }, [search]);

	return(
		<>
		<div className="setting-item">
			<div className="setting-item-info">
				<div className="setting-item-name">{`${state.files.length} файлов.`}</div>
				<div className="setting-item-description">{`Занято: ${humanFileSize(state.size)}`}</div>
			</div>
			<div className="setting-item-control">
				<div className="search-input-container">
					<input enterKeyHint="search" type="search" spellCheck="false" value={search} onChange={handleSearch}/>
					<div className="search-input-clear-button"></div>
				</div>
			</div>
		</div>
		<div className="scroll">
			{results.map(file => (
				<div className="setting-item">
					<div className="setting-item-info">
						<div className="setting-item-name">{file.path}</div>
						<div className="setting-item-description"></div>
					</div>
					<div className="setting-item-control">
						<button className="mod-warning">Удалить</button>
					</div>
				</div>
			))}
		</div>
		</>
	);
}












export class FileManagerModal extends Modal {
	private root: Root | null = null;
	public plugin: KSyncPlugin;
	constructor(app: App, plugin: KSyncPlugin) {
		super(app);

		this.plugin = plugin;
	}

	// async onOpen() {
	// 	const { contentEl } = this;
	// 	let files = await this.plugin.manager.getMetadata();
	// 	let size = await this.plugin.manager.getSize();
    //     new Setting(contentEl)
    //         .setHeading()
    //         .setName("Файловый менеджер")
    //     new Setting(contentEl)
	// 		.setName(`${files.length} файлов.`)
	// 		.setDesc(`Занято: ${humanFileSize(size)}`)
	// 		.addSearch(search => search)

    //     for (let file of files) {
    //         new Setting(contentEl)
    //         .setName(file.path)
	// 		.addButton(button => button.setButtonText("Удалить").setWarning())
    //     }
	// }
	
	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<FileManagerUI plugin={this.plugin} />
			</StrictMode>
		);
	}

	onClose() {
		const { contentEl } = this;

		contentEl.empty();
	}
}


