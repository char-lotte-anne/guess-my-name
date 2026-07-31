/**
 * Regression guard for the language-origin lookup.
 *
 * The lookup replaced 366 lines of sequential `if (list.includes(name))` checks
 * with a Map built once at load. 419 names appear in more than one group, so the
 * two are only equivalent if the Map is built first-wins in the original group
 * order. `fixtures-name-origins.json` records what the original implementation
 * returned for every name it knew about; these tests fail if the rewrite, or any
 * later reordering of the groups, changes a single answer.
 */

const test = require('node:test');
const assert = require('node:assert');
const {
    lookupLanguageOrigin, LANGUAGE_ORIGIN_GROUPS,
    LANGUAGE_ORIGIN_BY_NAME, DEFAULT_LANGUAGE_ORIGIN
} = require('../src/name-origins');
const expected = require('./fixtures-name-origins.json');

test('every known name resolves exactly as it did before the rewrite', () => {
    const mismatches = Object.entries(expected)
        .filter(([name, want]) => lookupLanguageOrigin(name) !== want)
        .map(([name, want]) => `${name}: expected ${want}, got ${lookupLanguageOrigin(name)}`);

    assert.deepStrictEqual(mismatches, [], `${mismatches.length} names changed origin`);
});

test('the fixture actually covers the table', () => {
    assert.ok(Object.keys(expected).length > 1500, 'fixture looks truncated');
});

// Where a name belongs to several traditions, the earlier group in the list
// wins. Rearranging LANGUAGE_ORIGIN_GROUPS would silently change results.
test('overlapping names resolve to the earliest matching group', () => {
    const origins = LANGUAGE_ORIGIN_GROUPS.map(g => g.origin);

    for (const [name, want] of Object.entries(expected)) {
        if (want === DEFAULT_LANGUAGE_ORIGIN) continue;
        const firstMatch = LANGUAGE_ORIGIN_GROUPS.find(g => g.names.includes(name.toLowerCase()));
        if (!firstMatch) continue;
        assert.strictEqual(firstMatch.origin, want,
            `${name} should resolve to the first group containing it`);
    }
    assert.strictEqual(new Set(origins).size, origins.length, 'duplicate origin group');
});

test('unknown names fall back to the default', () => {
    assert.strictEqual(lookupLanguageOrigin('Zzzqqx'), DEFAULT_LANGUAGE_ORIGIN);
});

test('lookup is case-insensitive', () => {
    assert.strictEqual(lookupLanguageOrigin('BENJAMIN'), lookupLanguageOrigin('benjamin'));
});

test('bad input returns the default instead of throwing', () => {
    for (const input of ['', null, undefined, 42, {}]) {
        assert.strictEqual(lookupLanguageOrigin(input), DEFAULT_LANGUAGE_ORIGIN);
    }
});

// The point of the rewrite: one Map, built once, instead of 39 array
// allocations and up to 2,189 string comparisons per call.
test('the table is prebuilt, not rebuilt per lookup', () => {
    assert.ok(LANGUAGE_ORIGIN_BY_NAME instanceof Map);
    assert.ok(LANGUAGE_ORIGIN_BY_NAME.size > 1500);
});
