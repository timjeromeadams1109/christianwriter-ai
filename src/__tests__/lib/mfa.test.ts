/**
 * Tests for MFA utilities in src/lib/mfa.ts
 * Pure unit tests — no mocks needed (uses real Node crypto).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  encryptSecret,
  decryptSecret,
  generateTOTPSecret,
  generateTOTPUri,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
  findBackupCodeIndex,
} from '@/lib/mfa';

// The setup.ts sets MFA_ENCRYPTION_KEY — we rely on that.

describe('encryptSecret / decryptSecret', () => {
  it('round-trips plaintext through AES-256-GCM', () => {
    const plain = 'JBSWY3DPEHPK3PXP';
    const cipher = encryptSecret(plain);
    expect(cipher).not.toBe(plain);
    expect(decryptSecret(cipher)).toBe(plain);
  });

  it('produces different ciphertext on every call (random IV)', () => {
    const plain = 'JBSWY3DPEHPK3PXP';
    const c1 = encryptSecret(plain);
    const c2 = encryptSecret(plain);
    expect(c1).not.toBe(c2);
  });

  it('throws on invalid ciphertext format', () => {
    expect(() => decryptSecret('not:a:valid:format:extra')).toThrow();
    expect(() => decryptSecret('onlyone')).toThrow();
  });

  it('throws when auth tag is tampered (GCM integrity check)', () => {
    const cipher = encryptSecret('secret');
    // corrupt the auth tag segment
    const [iv, tag, data] = cipher.split(':');
    const tampered = `${iv}:${'00'.repeat(16)}:${data}`;
    expect(() => decryptSecret(tampered)).toThrow();
  });
});

describe('generateTOTPSecret', () => {
  it('returns a non-empty base32 string', () => {
    const secret = generateTOTPSecret();
    expect(secret).toBeTruthy();
    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThan(10);
  });

  it('generates unique secrets', () => {
    const s1 = generateTOTPSecret();
    const s2 = generateTOTPSecret();
    expect(s1).not.toBe(s2);
  });
});

describe('generateTOTPUri', () => {
  it('returns a valid otpauth:// URI', () => {
    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(secret, 'user@example.com');
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain('ChristianWriterAI');
  });
});

describe('verifyTOTP', () => {
  it('returns false for a clearly wrong code', () => {
    const secret = generateTOTPSecret();
    expect(verifyTOTP(secret, '000000')).toBe(false);
  });

  it('returns false for invalid base32 secret', () => {
    // Passing garbage secret — should not throw, should return false
    expect(verifyTOTP('!!!invalid!!!', '123456')).toBe(false);
  });
});

describe('generateBackupCodes', () => {
  let codes: ReturnType<typeof generateBackupCodes>;

  beforeAll(() => {
    codes = generateBackupCodes();
  });

  it('returns 10 plaintext codes', () => {
    expect(codes.plaintext).toHaveLength(10);
  });

  it('returns 10 hashed codes', () => {
    expect(codes.hashed).toHaveLength(10);
  });

  it('plaintext codes are 10 hex chars (5 bytes)', () => {
    for (const code of codes.plaintext) {
      expect(code).toMatch(/^[0-9A-F]{10}$/);
    }
  });

  it('all codes are unique', () => {
    const unique = new Set(codes.plaintext);
    expect(unique.size).toBe(10);
  });
});

describe('hashBackupCode', () => {
  it('produces deterministic SHA-256 hash', () => {
    const h1 = hashBackupCode('ABCDE12345');
    const h2 = hashBackupCode('ABCDE12345');
    expect(h1).toBe(h2);
  });

  it('is case-insensitive', () => {
    expect(hashBackupCode('abcde12345')).toBe(hashBackupCode('ABCDE12345'));
  });

  it('trims whitespace before hashing', () => {
    expect(hashBackupCode('  ABCDE12345  ')).toBe(hashBackupCode('ABCDE12345'));
  });
});

describe('findBackupCodeIndex', () => {
  it('finds the correct index of a matching code', () => {
    const { plaintext, hashed } = generateBackupCodes();
    const idx = findBackupCodeIndex(plaintext[3], hashed);
    expect(idx).toBe(3);
  });

  it('returns -1 for unknown code', () => {
    const { hashed } = generateBackupCodes();
    expect(findBackupCodeIndex('ZZZZZZZZZZ', hashed)).toBe(-1);
  });
});
