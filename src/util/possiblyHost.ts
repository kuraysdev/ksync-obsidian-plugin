export default function possiblyHost(address: string, protocol: "ws" | "http", secure: boolean = false): string {
    if (new RegExp(`^${protocol}s?:\/\/`).test(address)) return address;
    else return `${secure ? `${protocol}s` : protocol}://${address}`;
}
