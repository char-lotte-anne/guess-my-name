const test = require('node:test');
const assert = require('node:assert');
const {
    encodeAnswers,
    FEATURE_LENGTH,
    FEATURE_LAYOUT
} = require('../src/feature-encoding');

const ANSWERS = {
    gender: 'F',
    decade: 1990,
    length: 'long',
    starts_with: 'consonant',
    popularity: 'popular',
    political_values: ['progressive', 'justice'],
    language_preference: ['english_only']
};

/** Where each field's slots begin, derived the same way the encoder derives them. */
function offsetOf(key) {
    let offset = 0;
    for (const field of FEATURE_LAYOUT) {
        if (field.key === key) return offset;
        offset += field.width;
    }
    throw new Error(`no such field: ${key}`);
}

test('vector is always the width the model expects', () => {
    assert.strictEqual(encodeAnswers(ANSWERS).length, FEATURE_LENGTH);
    assert.strictEqual(encodeAnswers({}).length, FEATURE_LENGTH);
    assert.strictEqual(encodeAnswers(null).length, FEATURE_LENGTH);
});

test('reserved widths fit inside the vector', () => {
    const used = FEATURE_LAYOUT.reduce((sum, f) => sum + f.width, 0);
    assert.ok(used <= FEATURE_LENGTH, `layout needs ${used} slots, vector has ${FEATURE_LENGTH}`);
});

test('every value maps inside its own field', () => {
    for (const field of FEATURE_LAYOUT) {
        if (!field.values) continue;
        for (const [value, slot] of Object.entries(field.values)) {
            assert.ok(slot < field.width,
                `${field.key}.${value} at slot ${slot} overflows width ${field.width}`);
        }
    }
});

test('single-select sets exactly one slot', () => {
    const features = encodeAnswers({ gender: 'F' });
    assert.strictEqual(features[offsetOf('gender') + 1], 1);
    assert.strictEqual(features.reduce((a, b) => a + b, 0), 1);
});

test('multi-select sets one slot per value', () => {
    const features = encodeAnswers({ political_values: ['progressive', 'justice'] });
    const base = offsetOf('political_values');
    assert.strictEqual(features[base + 3], 1);
    assert.strictEqual(features[base + 4], 1);
    assert.strictEqual(features.reduce((a, b) => a + b, 0), 2);
});

// The quiz lets people pick more than one gender; the old encoder looked the
// array up as an object key, got undefined, and fell through to index 0 -- so
// every multi-select answer was silently encoded as "M".
test('multi-select gender is not collapsed to the first category', () => {
    const features = encodeAnswers({ gender: ['F', 'NB'] });
    const base = offsetOf('gender');
    assert.strictEqual(features[base + 0], 0, 'M must not be set');
    assert.strictEqual(features[base + 1], 1);
    assert.strictEqual(features[base + 2], 1);
});

// The quiz normalizes this to NB before storing, but older stored submissions
// still carry the raw value, and the training script reads those directly.
test('PREFER_NOT_TO_SAY encodes the same as NB', () => {
    assert.deepStrictEqual(
        encodeAnswers({ gender: 'PREFER_NOT_TO_SAY' }),
        encodeAnswers({ gender: 'NB' })
    );
});

// A typo must mean "no signal", never "the first category" -- that is the bug
// the old `|| 0` lookups had.
test('unknown values set nothing', () => {
    assert.deepStrictEqual(encodeAnswers({ gender: 'nonsense' }), encodeAnswers({}));
    assert.deepStrictEqual(encodeAnswers({ popularity: 'nonsense' }), encodeAnswers({}));
});

test('missing fields do not shift later fields', () => {
    const withGender = encodeAnswers({ gender: 'F', popularity: 'popular' });
    const withoutGender = encodeAnswers({ popularity: 'popular' });
    const base = offsetOf('popularity');
    assert.strictEqual(withGender[base + 1], 1);
    assert.strictEqual(withoutGender[base + 1], 1);
});

test('decade is normalized into roughly 0..1', () => {
    const base = offsetOf('decade');
    assert.strictEqual(encodeAnswers({ decade: 1900 })[base], 0);
    assert.ok(encodeAnswers({ decade: 2020 })[base] <= 1);
});

test('encoding is deterministic', () => {
    assert.deepStrictEqual(encodeAnswers(ANSWERS), encodeAnswers(ANSWERS));
});
