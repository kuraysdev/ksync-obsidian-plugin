export interface FileMeta {
    ctime: number;
    mtime: number;
}

export interface IFile {
    path: string;
    size: number;
    hash: string;
    ctime: number;
    mtime: number;
    deleted: boolean;
}