/**
 * Creates an opaque client identifier without requiring a secure browser origin.
 *
 * `crypto.randomUUID()` is unavailable on plain-HTTP LAN URLs in some browsers,
 * while `crypto.getRandomValues()` remains available. These IDs identify local
 * sessions and feedback submissions; they are not authentication credentials.
 */
export function createClientId() {
  const webCrypto = globalThis.crypto;

  if (typeof webCrypto?.randomUUID === 'function') return webCrypto.randomUUID();

  if (typeof webCrypto?.getRandomValues === 'function') {
    const bytes = webCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
  }

  return `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}
