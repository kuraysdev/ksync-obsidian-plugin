import { TAbstractFile, TFolder, Vault } from "obsidian"
import * as path from "path";
import * as fs from "fs/promises";
import KSyncPlugin from "src/main";
import { time } from "console";
import { hash } from "src/util/FileUtil";

export class VaultService {
    public tempBasePath = '.ksync'
    public vault: Vault

    constructor(plugin: KSyncPlugin) {
        this.vault = plugin.app.vault;
        
        this.checkTemp();
    }

    private async checkTemp() {
        const temp = await this.vault.adapter.exists(this.tempBasePath);

        if(!temp) {
            console.log("No temp folder");
            await this.vault.createFolder(this.tempBasePath)
            return console.log("Created");
        }
        console.log("Temp Folder Exists!");
    }

    async getMetadata() {
        const snapshot = Array<IFile>();
        const files = this.vault.getFiles();
        for (const file of files) {
            let hashed = await hash(await this.vault.read(file))
            snapshot.push({
                path: file.path,
                size: file.stat.size,
                hash: hashed,
                ctime: file.stat.ctime,
                mtime: file.stat.mtime,
                deleted: false
            });
        }
        
        return snapshot
    }

    async SaveToFile() {
        let files = await this.getMetadata();
        this.vault.adapter.write(this.tempBasePath+'/metadata.json', JSON.stringify(files))
    }


    onDelete(file: TAbstractFile) {
        console.log("File deleted");
        this.vault.adapter.copy(file.path, this.tempBasePath + file.path);
    }

}


interface IFile {
    path: string;
    size: number;
    hash: string;
    ctime: number;
    mtime: number;
    deleted: boolean;
}