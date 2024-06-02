export interface IAccountData {
    email: string;
    subscription: string;
    space: string;
    vaults: IVault[];
}

export interface IVault {
    id: string;
    name: string;
}

export interface IDevice {
    name: string;
    type: DeviceType;
}

enum DeviceType {
    PHONE,
    DESKTOP
}