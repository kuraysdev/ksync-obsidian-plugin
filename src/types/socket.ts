export enum FrameOPCode {
    Create = "create",
    Rename = "rename",
    Synchronize = "synchronize",
    Delete = "delete"
}

export interface FrameData {
    [FrameOPCode.Create]: {
        type: "file" | "folder";
        path: string;
        data?: Uint8Array;
        createdAt: Date;
    };
    [FrameOPCode.Rename]: {
        oldPath: string;
        path: string;
    };
    [FrameOPCode.Synchronize]: {
        path: string;
        data: Uint8Array;
        updatedAt: Date;
    };
    [FrameOPCode.Delete]: string;
};

export type Frame = {
    opcode: FrameOPCode.Create;
    data: FrameData[FrameOPCode.Create];
} | {
    opcode: FrameOPCode.Rename;
    data: FrameData[FrameOPCode.Rename];
} | {
    opcode: FrameOPCode.Synchronize;
    data: FrameData[FrameOPCode.Synchronize];
} | {
    opcode: FrameOPCode.Delete;
    data: FrameData[FrameOPCode.Delete];
};