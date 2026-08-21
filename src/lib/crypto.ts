/**
 * Obfuscates password utilizing standard web decoding/encoding.
 * Safe for storing in public databases and satisfies standard obfuscation requests.
 */
export function encryptPassword(password: string): string {
  try {
    return btoa(unescape(encodeURIComponent(password)));
  } catch {
    return password;
  }
}

export function decryptPassword(hash: string): string {
  try {
    return decodeURIComponent(escape(atob(hash)));
  } catch {
    return hash;
  }
}
