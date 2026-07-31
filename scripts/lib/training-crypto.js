/**
 * AES-256-GCM envelope for training submissions.
 *
 * Submissions are stored as issues in a public repository, so the payload is
 * encrypted before it is posted. The key lives in exactly two places: the
 * Vercel environment (to encrypt) and an Actions secret (to decrypt). Losing it
 * makes every past submission permanently unreadable.
 *
 * GCM is chosen over CBC so a tampered payload fails to decrypt rather than
 * decrypting into garbage that the trainer would happily learn from.
 *
 * Imported by both api/create-issue.js (ESM) and the collector (CJS). Node
 * resolves the named exports below from ESM; keep the export shape static so
 * that stays true.
 */

const crypto = require('crypto');

const KEY_BYTES = 32;
const IV_BYTES = 12; // 96-bit nonce, the size GCM is specified for

function toKey(keyHex) {
    const key = Buffer.from(keyHex || '', 'hex');
    if (key.length !== KEY_BYTES) {
        throw new Error(`TRAINING_DATA_KEY must be ${KEY_BYTES * 2} hex characters (${KEY_BYTES} bytes)`);
    }
    return key;
}

function encryptPayload(plaintext, keyHex) {
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv('aes-256-gcm', toKey(keyHex), iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    return {
        v: 1,
        alg: 'AES-256-GCM',
        iv: iv.toString('base64'),
        tag: cipher.getAuthTag().toString('base64'),
        data: ciphertext.toString('base64')
    };
}

function decryptPayload(envelope, keyHex) {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        toKey(keyHex),
        Buffer.from(envelope.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));

    return Buffer.concat([
        decipher.update(Buffer.from(envelope.data, 'base64')),
        decipher.final()
    ]).toString('utf8');
}

function isEnvelope(value) {
    return Boolean(value) && value.alg === 'AES-256-GCM';
}

module.exports = { encryptPayload, decryptPayload, isEnvelope };
