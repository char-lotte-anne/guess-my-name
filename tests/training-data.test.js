const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const {
    parseIssueBody,
    getTrainingLabel,
    isUsableExample,
    buildNameIndex,
    dedupe
} = require('../scripts/lib/training-data');
const { encryptPayload } = require('../scripts/lib/training-crypto');

const KEY = crypto.randomBytes(32).toString('hex');
const ANSWERS = { gender: 'F', decade: 1990 };

const fence = obj => '```json\n' + JSON.stringify(obj, null, 2) + '\n```';

test('reads an encrypted issue', () => {
    const payload = { timestamp: 1, answers: ANSWERS, realName: 'Ada' };
    const body = fence(encryptPayload(JSON.stringify(payload), KEY));
    assert.deepStrictEqual(parseIssueBody(body, KEY), payload);
});

// Issues #1-#24 predate encryption. They are public and cannot be unpublished,
// so they stay in the dataset rather than being discarded.
test('still reads legacy plaintext issues', () => {
    const payload = { timestamp: 1, answers: ANSWERS, realName: 'Ada' };
    assert.deepStrictEqual(parseIssueBody(fence(payload), KEY), payload);
});

test('plaintext issues can be read without a key', () => {
    const payload = { timestamp: 1, answers: ANSWERS, realName: 'Ada' };
    assert.deepStrictEqual(parseIssueBody(fence(payload), undefined), payload);
});

test('an encrypted issue without a key throws rather than silently skipping', () => {
    const body = fence(encryptPayload(JSON.stringify({ timestamp: 1 }), KEY));
    assert.throws(() => parseIssueBody(body, undefined), /encrypted/);
});

test('a body with no payload is not an error', () => {
    assert.strictEqual(parseIssueBody('Just a person filing a bug report.', KEY), null);
    assert.strictEqual(parseIssueBody(undefined, KEY), null);
});

test('a malformed payload throws so it can be counted', () => {
    assert.throws(() => parseIssueBody('```json\n{ not json }\n```', KEY));
});

test('a user-supplied name is the label', () => {
    assert.strictEqual(getTrainingLabel({ realName: 'Ada' }), 'Ada');
    assert.strictEqual(getTrainingLabel({ realName: '  Ada  ' }), 'Ada');
});

// This is the change that took the dataset from 0 usable examples to 23: a
// wrong guess still tells us what the right answer was.
test('a failed guess with a name is still usable', () => {
    const submission = {
        timestamp: 1, answers: ANSWERS, success: false,
        guesses: [{ name: 'Emma' }], realName: 'Ada'
    };
    assert.strictEqual(getTrainingLabel(submission), 'Ada');
    assert.ok(isUsableExample(submission));
});

test('a confirmed correct guess is usable', () => {
    assert.strictEqual(
        getTrainingLabel({ success: true, correctGuess: { name: 'Ada' } }),
        'Ada'
    );
});

test('realName wins over correctGuess', () => {
    assert.strictEqual(
        getTrainingLabel({ realName: 'Ada', success: true, correctGuess: { name: 'Grace' } }),
        'Ada'
    );
});

// Negative-only information: we know three names it is not, which categorical
// crossentropy has no way to use.
test('a failed guess with no name has no label', () => {
    const submission = { timestamp: 1, answers: ANSWERS, success: false, guesses: [{ name: 'Emma' }] };
    assert.strictEqual(getTrainingLabel(submission), null);
    assert.ok(!isUsableExample(submission));
});

test('blank names are not labels', () => {
    assert.strictEqual(getTrainingLabel({ realName: '   ' }), null);
    assert.strictEqual(getTrainingLabel({ realName: '' }), null);
});

test('an example without answers is unusable', () => {
    assert.ok(!isUsableExample({ timestamp: 1, realName: 'Ada' }));
});

// The old implementation tested `if (!map[name])`, which is true for a name
// already stored at index 0, so the first name was reassigned on every lookup
// and its labels pointed at the wrong class.
test('the first name keeps index 0 across repeated lookups', () => {
    const index = buildNameIndex(['Ada', 'Grace', 'Ada', 'Ada']);
    assert.strictEqual(index.Ada, 0);
    assert.strictEqual(index.Grace, 1);
    assert.strictEqual(Object.keys(index).length, 2);
});

test('indices are contiguous from zero', () => {
    const names = ['Ada', 'Grace', 'Katherine', 'Dorothy'];
    const index = buildNameIndex(names);
    assert.deepStrictEqual(Object.values(index).sort((a, b) => a - b), [0, 1, 2, 3]);
});

test('exact resubmissions are dropped', () => {
    const one = { timestamp: 1, answers: ANSWERS };
    assert.strictEqual(dedupe([one, { ...one }]).length, 1);
});

// Two people can genuinely answer identically, so the timestamp is part of the
// identity of a submission.
test('identical answers at different times are both kept', () => {
    const submissions = [
        { timestamp: 1, answers: ANSWERS },
        { timestamp: 2, answers: ANSWERS }
    ];
    assert.strictEqual(dedupe(submissions).length, 2);
});
