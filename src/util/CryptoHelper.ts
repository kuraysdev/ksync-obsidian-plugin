const crypto = window.crypto;

export async function hash(data: ArrayBuffer) {
    let hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateKey(password: string, vaultId: string): Promise<JsonWebKey> {
    const encoder = new TextEncoder();
    const encodedPassword = encoder.encode(password+vaultId);
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encodedPassword,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    const salt = encoder.encode(vaultId);
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    return crypto.subtle.exportKey('jwk', key);
}

export async function encrypt(data: ArrayBuffer, key: JsonWebKey): Promise<ArrayBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const algorithm = { name: 'AES-GCM', iv: iv };
    const keyObj = await crypto.subtle.importKey(
        'jwk',
        key,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );
    const encryptedData = await crypto.subtle.encrypt(algorithm, keyObj, data);
    const buffer = new Uint8Array(iv.length + encryptedData.byteLength)
    buffer.set(iv, 0);
    buffer.set(new Uint8Array(encryptedData), iv.length)
    return buffer.buffer;
}
  
export async function decrypt(encryptedData: ArrayBuffer, key: JsonWebKey): Promise<ArrayBuffer> {
    const data = new Uint8Array(encryptedData);
    const iv = data.subarray(0,12);
    let encrypted = data.subarray(12, data.byteLength);

    console.log(data);
    console.log(iv);
    console.log(encrypted);

    const keyObj = await crypto.subtle.importKey(
        'jwk',
        key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    console.log(keyObj);

    const decryptedData = await crypto.subtle.decrypt({name: 'AES-GCM', iv: iv}, keyObj, encrypted);
    console.log(decryptedData);
    return decryptedData;
}
  

export function ArrayBuffer2String(data: ArrayBuffer): string {
    const arrayBuffer = new Uint8Array(data).buffer;
    const textDecoder = new TextDecoder('utf-8');
    const string = textDecoder.decode(arrayBuffer);
    return string
}

export function String2ArrayBuffer(data: string): ArrayBuffer {
    const textEncoder = new TextEncoder();
    const arrayBuffer = textEncoder.encode(data).buffer;
    return arrayBuffer
}