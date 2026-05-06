import { hashIp } from './hash-ip';

const ORIGINAL_SALT = process.env.CONSENT_IP_HASH_SALT;

afterEach(() => {
  process.env.CONSENT_IP_HASH_SALT = ORIGINAL_SALT;
});

describe('hashIp', () => {
  it('returns null for null input', () => {
    process.env.CONSENT_IP_HASH_SALT = 'test-salt-1';
    expect(hashIp(null)).toBeNull();
  });

  it('returns a 64-char lowercase hex string for a valid IP', () => {
    process.env.CONSENT_IP_HASH_SALT = 'test-salt-1';
    const hash = hashIp('1.2.3.4');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different hashes for the same IP with different salts', () => {
    process.env.CONSENT_IP_HASH_SALT = 'salt-a';
    const hashA = hashIp('1.2.3.4');
    process.env.CONSENT_IP_HASH_SALT = 'salt-b';
    const hashB = hashIp('1.2.3.4');
    expect(hashA).not.toBe(hashB);
  });

  it('produces identical hashes for the same IP with the same salt (reproducibility)', () => {
    process.env.CONSENT_IP_HASH_SALT = 'stable-salt';
    expect(hashIp('1.2.3.4')).toBe(hashIp('1.2.3.4'));
  });

  it('handles IPv6 addresses without normalization issues', () => {
    process.env.CONSENT_IP_HASH_SALT = 'salt-ipv6';
    const hash = hashIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('throws when CONSENT_IP_HASH_SALT is unset', () => {
    delete process.env.CONSENT_IP_HASH_SALT;
    expect(() => hashIp('1.2.3.4')).toThrow(/CONSENT_IP_HASH_SALT/);
  });
});
