/**
 * MFA utilities — AES-256-GCM encryption, TOTP generation/verification,
 * and backup code management. All crypto uses Node's built-in `crypto`
 * module — no third-party crypto dependencies.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import * as OTPAuth from 'otpauth';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

// ── Encryption helpers ──────────────────────────────────────────────────────

function getEncryptionKey(): Buffer {
  const secret = process.env.MFA_ENCRYPTION_KEY;
  if (!secret) throw new Error('MFA_ENCRYPTION_KEY env var is required');
  // Hash to ensure exactly 32 bytes regardless of input length
  return createHash('sha256').update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv(hex):authTag(hex):ciphertext(hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSecret(ciphertext: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error('Invalid ciphertext format');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

// ── TOTP helpers ────────────────────────────────────────────────────────────

export function generateTOTPSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

export function generateTOTPUri(secret: string, email: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'ChristianWriterAI',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.toString();
}

/**
 * Verifies a 6-digit TOTP code. Accepts a ±1 window (one period before/after)
 * to account for clock skew between device and server.
 */
export function verifyTOTP(secret: string, code: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

// ── Backup codes ────────────────────────────────────────────────────────────

const BACKUP_CODE_COUNT = 10;

/**
 * Generates 10 single-use backup codes. Returns both the plaintext codes
 * (shown once to the user) and their SHA-256 hashes (stored in the DB).
 */
export function generateBackupCodes(): { plaintext: string[]; hashed: string[] } {
  const plaintext = Array.from({ length: BACKUP_CODE_COUNT }, () =>
    randomBytes(5).toString('hex').toUpperCase()
  );
  const hashed = plaintext.map(hashBackupCode);
  return { plaintext, hashed };
}

export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
}

/**
 * Checks if a supplied backup code matches any stored hash.
 * Returns the index of the matching code (for removal), or -1 if no match.
 */
export function findBackupCodeIndex(code: string, storedHashes: string[]): number {
  const incoming = hashBackupCode(code);
  return storedHashes.findIndex((h) => h === incoming);
}
