const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { encryptPayload, decryptPayload, isEnvelope } = require('../scripts/lib/training-crypto');

const KEY = crypto.randomBytes(32).toString('hex');
const PAYLOAD = JSON.stringify({
    timestamp: 1731110000000,
    realName: 'Charlotte',
    answers: { gender: 'F', decade: 1990 }
});

test('round-trips exactly', () => {
    assert.strictEqual(decryptPayload(encryptPayload(PAYLOAD, KEY), KEY), PAYLOAD);
});

// The whole point: these envelopes sit in a public repository.
test('the envelope reveals nothing about the payload', () => {
    const serialized = JSON.stringify(encryptPayload(PAYLOAD, KEY));
    assert.ok(!serialized.includes('Charlotte'));
    assert.ok(!serialized.includes('1990'));
});

test('a different key cannot read it', () => {
    const envelope = encryptPayload(PAYLOAD, KEY);
    const otherKey = crypto.randomBytes(32).toString('hex');
    assert.throws(() => decryptPayload(envelope, otherKey));
});

// GCM's reason for being here: a modified payload must fail loudly rather than
// decrypt into garbage the trainer would learn from.
test('tampering is detected', () => {
    const envelope = encryptPayload(PAYLOAD, KEY);
    const bytes = Buffer.from(envelope.data, 'base64');
    bytes[0] ^= 0xff;
    assert.throws(() => decryptPayload({ ...envelope, data: bytes.toString('base64') }));
});

test('each encryption uses a fresh nonce', () => {
    const a = encryptPayload(PAYLOAD, KEY);
    const b = encryptPayload(PAYLOAD, KEY);
    assert.notStrictEqual(a.iv, b.iv, 'reusing a nonce with the same key breaks GCM');
    assert.notStrictEqual(a.data, b.data);
});

test('malformed keys are rejected rather than padded', () => {
    assert.throws(() => encryptPayload(PAYLOAD, 'tooshort'));
    assert.throws(() => encryptPayload(PAYLOAD, ''));
    assert.throws(() => encryptPayload(PAYLOAD, undefined));
});

test('isEnvelope distinguishes encrypted from legacy plaintext', () => {
    assert.ok(isEnvelope(encryptPayload(PAYLOAD, KEY)));
    assert.ok(!isEnvelope({ timestamp: 1, answers: {} }));
    assert.ok(!isEnvelope(null));
});
