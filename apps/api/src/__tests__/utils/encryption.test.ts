import { encrypt, decrypt } from '../../utils/encryption';

describe('Encryption Utility', () => {
  describe('encrypt', () => {
    it('should return encrypted string and iv', () => {
      const result = encrypt('my-secret-api-key');
      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(typeof result.encrypted).toBe('string');
      expect(typeof result.iv).toBe('string');
      expect(result.encrypted).not.toBe('my-secret-api-key');
    });

    it('should produce different ciphertexts for the same input (random IV)', () => {
      const a = encrypt('same-key');
      const b = encrypt('same-key');
      expect(a.encrypted).not.toBe(b.encrypted);
      expect(a.iv).not.toBe(b.iv);
    });

    it('should handle empty string', () => {
      const result = encrypt('');
      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
    });

    it('should handle long strings', () => {
      const longKey = 'sk-' + 'a'.repeat(500);
      const result = encrypt(longKey);
      expect(result.encrypted).toBeDefined();
    });

    it('should handle special characters', () => {
      const result = encrypt('key-with-$pecial/chars=+&!@#');
      expect(result.encrypted).toBeDefined();
    });
  });

  describe('decrypt', () => {
    it('should decrypt back to original text', () => {
      const original = 'sk-test-openai-key-12345';
      const { encrypted, iv } = encrypt(original);
      const decrypted = decrypt(encrypted, iv);
      expect(decrypted).toBe(original);
    });

    it('should roundtrip various API key formats', () => {
      const keys = [
        'sk-ant-api03-abc123',
        'fal-1234567890abcdef',
        'el_test_key_xyz',
        'hg-test-heygen-key',
        'sk-proj-openai-key',
      ];

      for (const key of keys) {
        const { encrypted, iv } = encrypt(key);
        expect(decrypt(encrypted, iv)).toBe(key);
      }
    });

    it('should throw on invalid encrypted data', () => {
      expect(() => decrypt('invalid-hex', 'a'.repeat(32))).toThrow();
    });

    it('should throw on wrong IV', () => {
      const { encrypted } = encrypt('test-key');
      const wrongIv = 'b'.repeat(32);
      expect(() => decrypt(encrypted, wrongIv)).toThrow();
    });
  });
});
