const crypto = window.crypto;

export async function hash(data: ArrayBuffer) {
    let hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function humanFileSize(bytes: number, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

export async function generateKey(password: string, vaultId: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const encodedPassword = encoder.encode(password+vaultId);
  const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encodedPassword,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
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
  return crypto.subtle.exportKey('raw', key);
}

export async function encrypt(data: ArrayBuffer, key: Buffer): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const algorithm = { name: 'AES-GCM', iv: iv };
  const keyObj = await crypto.subtle.importKey(
      'raw',
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

export async function decrypt(encryptedData: ArrayBuffer, key: Buffer): Promise<ArrayBuffer> {
    try {
      const data = new Uint8Array(encryptedData);
      const iv = data.subarray(0,12);
      let encrypted = data.subarray(12)

      const keyObj = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decryptedData = await crypto.subtle.decrypt({name: 'AES-GCM', iv: iv}, keyObj, encrypted);
      return decryptedData;
    } catch(e) {
      return e;
    }
}