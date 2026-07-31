const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { fetchTrainingIssues, toSubmissions } = require('../scripts/collect-training-data');
const { encryptPayload } = require('../scripts/lib/training-crypto');

const KEY = crypto.randomBytes(32).toString('hex');
const fence = obj => '```json\n' + JSON.stringify(obj) + '\n```';

const issue = (number, payload, { encrypt = false } = {}) => ({
    number,
    body: fence(encrypt ? encryptPayload(JSON.stringify(payload), KEY) : payload)
});

/** Serve pages of issues to the real fetchTrainingIssues, then dry up. */
function stubGitHub(pages) {
    let call = 0;
    return async () => {
        const batch = pages[call++] || [];
        return {
            ok: true,
            json: async () => batch,
            headers: { get: () => (call < pages.length ? '<next>; rel="next"' : null) }
        };
    };
}

test('reads encrypted and legacy issues together', () => {
    const result = toSubmissions([
        issue(1, { timestamp: 1, answers: {}, realName: 'Ada' }),
        issue(2, { timestamp: 2, answers: {}, realName: 'Grace' }, { encrypt: true })
    ], KEY);

    assert.strictEqual(result.submissions.length, 2);
    assert.strictEqual(result.plaintext, 1);
    assert.strictEqual(result.encrypted, 1);
    assert.strictEqual(result.unreadable, 0);
});

// One bad issue must not cost us the rest of the dataset.
test('an unreadable issue is counted, not fatal', () => {
    const result = toSubmissions([
        issue(1, { timestamp: 1, answers: {}, realName: 'Ada' }),
        { number: 2, body: '```json\n{ broken\n```' }
    ], KEY);

    assert.strictEqual(result.submissions.length, 1);
    assert.strictEqual(result.unreadable, 1);
});

test('issues with no payload are ignored silently', () => {
    const result = toSubmissions([{ number: 1, body: 'Hello, I found a bug.' }], KEY);
    assert.strictEqual(result.submissions.length, 0);
    assert.strictEqual(result.unreadable, 0);
});

test('paginates until GitHub stops offering a next page', async () => {
    global.fetch = stubGitHub([
        [issue(1, { timestamp: 1, answers: {} }), issue(2, { timestamp: 2, answers: {} })],
        [issue(3, { timestamp: 3, answers: {} })]
    ]);

    const issues = await fetchTrainingIssues({ owner: 'o', repo: 'r' });
    assert.strictEqual(issues.length, 3);
});

// The issues endpoint returns pull requests too; they are not submissions.
test('pull requests are excluded', async () => {
    global.fetch = stubGitHub([[
        issue(1, { timestamp: 1, answers: {} }),
        { number: 2, pull_request: {}, body: 'a PR' }
    ]]);

    const issues = await fetchTrainingIssues({ owner: 'o', repo: 'r' });
    assert.strictEqual(issues.length, 1);
});

// A rate-limited or failing API must not look like an empty dataset, which
// would train a model on nothing and publish it.
test('an API error is raised, not treated as no data', async () => {
    global.fetch = async () => ({ ok: false, status: 403, json: async () => ({}) });
    await assert.rejects(() => fetchTrainingIssues({ owner: 'o', repo: 'r' }), /403/);
});
