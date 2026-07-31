const test = require('node:test');
const assert = require('node:assert');
const { matchesCriteria, getDecadePopularity, calculateNameScore } = require('../src/name-scoring');

const name = (over = {}) => ({
    name: 'Charlotte',
    gender: 'F',
    totalCount: 5000,
    languageOrigin: 'english',
    years: [{ year: 1990, count: 400 }, { year: 1995, count: 600 }],
    ...over
});

test('no answers filters nothing', () => {
    assert.strictEqual(matchesCriteria(name(), {}), true);
});

// Gender is a multi_select, so selectAnswer stores Array.from(selectedValues)
// -- an array even for one choice. The old comparison `nameInfo.gender !==
// answers.gender` compared a string to an array, was always true, and rejected
// every candidate as soon as gender was answered.
test('gender given as an array still matches', () => {
    assert.strictEqual(matchesCriteria(name({ gender: 'F' }), { gender: ['F'] }), true);
});

test('gender as a bare string also matches', () => {
    assert.strictEqual(matchesCriteria(name({ gender: 'F' }), { gender: 'F' }), true);
});

test('a non-matching gender is filtered out', () => {
    assert.strictEqual(matchesCriteria(name({ gender: 'M' }), { gender: ['F'] }), false);
});

test('selecting several genders keeps names from any of them', () => {
    const answers = { gender: ['F', 'M'] };
    assert.strictEqual(matchesCriteria(name({ gender: 'F' }), answers), true);
    assert.strictEqual(matchesCriteria(name({ gender: 'M' }), answers), true);
    assert.strictEqual(matchesCriteria(name({ gender: 'NB' }), answers), false);
});

// getCandidates() has already narrowed the pool for NB, so this filter defers.
test('NB does not filter on gender', () => {
    assert.strictEqual(matchesCriteria(name({ gender: 'F' }), { gender: ['NB'] }), true);
    assert.strictEqual(matchesCriteria(name({ gender: 'M' }), { gender: ['NB'] }), true);
});

test('PREFER_NOT_TO_SAY behaves as NB', () => {
    assert.strictEqual(matchesCriteria(name({ gender: 'M' }), { gender: ['PREFER_NOT_TO_SAY'] }), true);
});

test('length bands are inclusive at their edges', () => {
    const cases = [
        ['short', 'Ada', true], ['short', 'Chloe', false],
        ['medium', 'Chloe', true], ['medium', 'Ada', false], ['medium', 'Charlotte', false],
        ['long', 'Charlott', true], ['long', 'Chloe', false],
        ['extra_long', 'Charlottina', true], ['extra_long', 'Charlotte', false]
    ];
    for (const [band, candidate, expected] of cases) {
        assert.strictEqual(
            matchesCriteria(name({ name: candidate }), { length: band }), expected,
            `${candidate} (${candidate.length} chars) under "${band}"`
        );
    }
});

// Documented as scoring-only, not a filter -- the filtering version is
// commented out in the source. Pinned so it is not reintroduced by accident.
test('starts_with does not filter', () => {
    assert.strictEqual(matchesCriteria(name({ name: 'Ada' }), { starts_with: 'consonant' }), true);
});

// Returns a 0..1 share, not a raw count: the decade's usage as a fraction of
// the name's lifetime usage, scaled so 10% (an average decade out of ten) maps
// to 1.0 and anything above that clamps.
test('decade popularity is that decade\'s share of lifetime usage', () => {
    const info = name({
        totalCount: 10000,
        years: [
            { year: 1985, count: 100 },
            { year: 1990, count: 400 },
            { year: 1995, count: 600 },
            { year: 2001, count: 999 }
        ]
    });
    // 1000 of 10000 = 10% -> scaled by 10 -> 1.0
    assert.strictEqual(getDecadePopularity(info, 1990), 1);
});

test('a below-average decade scores proportionally lower', () => {
    const info = name({ totalCount: 10000, years: [{ year: 1995, count: 500 }] });
    // 5% of lifetime usage -> 0.5
    assert.strictEqual(getDecadePopularity(info, 1990), 0.5);
});

test('the score is clamped at 1', () => {
    const info = name({ totalCount: 1000, years: [{ year: 1995, count: 1000 }] });
    assert.strictEqual(getDecadePopularity(info, 1990), 1);
});

test('a name absent from a decade scores zero there', () => {
    const info = name({ totalCount: 10000, years: [{ year: 1985, count: 100 }] });
    assert.strictEqual(getDecadePopularity(info, 2010), 0);
});

// Without year data there is nothing decade-specific to measure, so it falls
// back to overall popularity bands.
test('missing year data falls back to total popularity bands', () => {
    assert.strictEqual(getDecadePopularity({ name: 'Ada', totalCount: 5000 }, 1990), 0.8);
    assert.strictEqual(getDecadePopularity({ name: 'Ada', totalCount: 50 }, 1990), 0.2);
});

test('scoring is deterministic and numeric', () => {
    const answers = { gender: ['F'], decade: 1990, popularity: 'popular' };
    const first = calculateNameScore(name(), answers);
    assert.strictEqual(typeof first, 'number');
    assert.ok(Number.isFinite(first));
    assert.strictEqual(first, calculateNameScore(name(), answers));
});

test('scoring tolerates missing fields on a name record', () => {
    assert.ok(Number.isFinite(calculateNameScore({ name: 'Ada', gender: 'F' }, { decade: 1990 })));
});
