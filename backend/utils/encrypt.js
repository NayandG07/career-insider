import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Encrypt a plaintext string using AES-256-CBC.
 * Returns hex string: IV (32 hex chars) + ciphertext (hex).
 * @param {string} text - The plaintext to encrypt
 * @returns {string} Hex-encoded IV + ciphertext
 */
export function encrypt(text) {
  const key = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted;
}

/**
 * Decrypt a hex-encoded string (IV prepended) using AES-256-CBC.
 * @param {string} encryptedHex - Hex string: IV (32 chars) + ciphertext
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedHex) {
  const key = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex');
  const iv = Buffer.from(encryptedHex.slice(0, 32), 'hex');
  const encryptedText = encryptedHex.slice(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
