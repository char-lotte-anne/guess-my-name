const test = require('node:test');
const assert = require('node:assert');
const {
    NEUTRAL_FALLBACK_NAMES, toGenderArray, includesNonBinary,
    fallbackFor, dedupeByName, rankCandidates
} = require('../src/candidate-ranking');

const candidate = (name, totalCount = 100) => ({ name, totalCount });

test('gender answers normalise from either shape', () => {
    assert.deepStrictEqual(toGenderArray(['F', 'NB']), ['F', 'NB']);
    assert.deepStrictEqual(toGenderArray('F'), ['F']);
    assert.deepStrictEqual(toGenderArray(undefined), []);
    assert.deepStrictEqual(toGenderArray(''), []);
});

test('PREFER_NOT_TO_SAY counts as non-binary for fallback purposes', () => {
    assert.ok(includesNonBinary(['PREFER_NOT_TO_SAY']));
    assert.ok(includesNonBinary(['F', 'NB']));
    assert.ok(!includesNonBinary(['F', 'M']));
    assert.ok(!includesNonBinary(undefined));
});

// An empty result is a legitimate outcome for a specific gender -- the filters
// excluded everything. Inventing neutral names there would misrepresent it.
test('the fallback list is only offered for non-binary or unstated answers', () => {
    assert.strictEqual(fallbackFor(['NB']).length, 5);
    assert.deepStrictEqual(fallbackFor(['F']), []);
    assert.deepStrictEqual(fallbackFor(undefined), []);
});

test('callers cannot mutate the shared fallback list', () => {
    const first = fallbackFor(['NB']);
    first.pop();
    assert.strictEqual(fallbackFor(['NB']).length, 5, 'fallback list was mutated by a caller');
    // Frozen objects swallow writes silently outside strict mode, so assert the
    // value rather than expecting a throw.
    NEUTRAL_FALLBACK_NAMES[0].name = 'Changed';
    assert.strictEqual(NEUTRAL_FALLBACK_NAMES[0].name, 'Alex');
});

test('duplicate names are dropped, first spelling wins', () => {
    const unique = dedupeByName([candidate('Alex'), candidate('alex'), candidate('Jordan')]);
    assert.deepStrictEqual(unique.map(c => c.name), ['Alex', 'Jordan']);
});

// The quiz queries the database once per selected gender, so the same name can
// legitimately arrive twice.
test('deduping tolerates junk entries', () => {
    assert.deepStrictEqual(dedupeByName([null, {}, candidate('Alex')]).map(c => c.name), ['Alex']);
    assert.deepStrictEqual(dedupeByName(undefined), []);
});

test('candidates are ranked by score, highest first', () => {
    const scores = { Ada: 10, Grace: 30, Mei: 20 };
    const ranked = rankCandidates(
        [candidate('Ada'), candidate('Grace'), candidate('Mei')],
        c => scores[c.name]
    );
    assert.deepStrictEqual(ranked.map(c => c.name), ['Grace', 'Mei', 'Ada']);
});

// When the answers cannot separate two names, the more historically common one
// is the better guess.
test('ties break on total usage', () => {
    const ranked = rankCandidates(
        [candidate('Ada', 100), candidate('Grace', 900)],
        () => 50
    );
    assert.deepStrictEqual(ranked.map(c => c.name), ['Grace', 'Ada']);
});

test('ranking respects the requested count', () => {
    const many = Array.from({ length: 20 }, (_, i) => candidate(`Name${i}`, i));
    assert.strictEqual(rankCandidates(many, c => c.totalCount, 5).length, 5);
    assert.strictEqual(rankCandidates(many, c => c.totalCount).length, 5, 'default should be 5');
});

test('ranking preserves the rest of each record', () => {
    const [top] = rankCandidates([{ name: 'Ada', gender: 'F', totalCount: 5 }], () => 1);
    assert.strictEqual(top.gender, 'F');
    assert.strictEqual(top.score, 1);
});

test('a non-array pool ranks to nothing rather than throwing', () => {
    assert.deepStrictEqual(rankCandidates(null, () => 1), []);
    assert.deepStrictEqual(rankCandidates(undefined, () => 1), []);
});
