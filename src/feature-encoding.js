/**
 * Quiz answers -> fixed-width feature vector.
 *
 * WHY THIS FILE EXISTS
 * The browser and the training workflow must encode answers identically. If
 * they disagree by even one index, the model trains in one feature space and
 * predicts in another, and nothing fails loudly -- predictions just quietly get
 * worse. This used to be two copies (src/script.js and scripts/train-model.js)
 * which had already drifted apart. Keep it one copy.
 *
 * The file is loaded as a plain <script> in the browser (no build step) and
 * require()d in Node, hence the dual export at the bottom.
 *
 * CHANGING THE LAYOUT
 * Field offsets are positional: every slot below is reserved whether or not the
 * answer is present. Adding a value to an existing field is safe only if it
 * fits in that field's reserved width. Anything else -- new field, wider field,
 * reordering -- invalidates every model trained before the change, because old
 * weights are indexed by the old layout. Bump FEATURE_LAYOUT_VERSION when that
 * happens so stale releases can be rejected instead of silently misread.
 */

const FEATURE_LAYOUT_VERSION = 1;
const FEATURE_LENGTH = 50;

// width is what the layout reserves; it can exceed the number of values in use.
const FEATURE_LAYOUT = [
    { key: 'gender', width: 4, values: { M: 0, F: 1, NB: 2 } },
    { key: 'decade', width: 1, normalize: decade => (decade - 1900) / 120 },
    { key: 'length', width: 3, values: { short: 0, medium: 1, long: 2 } },
    { key: 'starts_with', width: 2, values: { vowel: 0, consonant: 1 } },
    { key: 'popularity', width: 3, values: { uncommon: 0, popular: 1, very_popular: 2 } },
    {
        key: 'political_values',
        width: 10,
        values: {
            traditional: 0, diverse: 1, community: 2, progressive: 3,
            justice: 4, security: 5, environment: 6, economic: 7,
            education: 8, cooperation: 9
        }
    },
    {
        key: 'language_preference',
        width: 23,
        values: {
            english_only: 0, spanish: 1, chinese: 2, filipino: 3,
            vietnamese: 4, korean: 5, japanese: 6, hindi: 7,
            arabic: 8, hebrew: 9, french: 10, german: 11,
            italian: 12, russian: 13, polish: 14, greek: 15,
            irish: 16, scandinavian: 17, yoruba: 18, amharic: 19,
            haitian_creole: 20, portuguese: 21, multilingual: 22
        }
    }
];

/**
 * PREFER_NOT_TO_SAY reaches the encoder from two directions: the quiz
 * normalizes it to NB before storing, but older stored submissions and the
 * training data may still carry the raw value. Treat them as the same thing
 * rather than letting one path fall through to index 0 ("M"), which is what
 * the old `|| 0` lookups did.
 */
const GENDER_ALIASES = { PREFER_NOT_TO_SAY: 'NB' };

function encodeAnswers(answers) {
    const features = new Array(FEATURE_LENGTH).fill(0);
    if (!answers) return features;

    let offset = 0;

    for (const field of FEATURE_LAYOUT) {
        const raw = answers[field.key];

        if (raw === undefined || raw === null || raw === '') {
            offset += field.width;
            continue;
        }

        if (field.normalize) {
            features[offset] = field.normalize(raw);
            offset += field.width;
            continue;
        }

        // Single values and multi-select answers share one path: a multi-hot
        // vector where a single value is just a one-hot.
        const selected = Array.isArray(raw) ? raw : [raw];

        for (const value of selected) {
            const canonical = field.key === 'gender'
                ? (GENDER_ALIASES[value] || value)
                : value;
            const slot = field.values[canonical];

            // Unknown values are dropped, not defaulted. A typo should mean
            // "no signal", never "the first category".
            if (slot !== undefined && slot < field.width) {
                features[offset + slot] = 1;
            }
        }

        offset += field.width;
    }

    return features;
}

const featureEncodingApi = { encodeAnswers, FEATURE_LENGTH, FEATURE_LAYOUT, FEATURE_LAYOUT_VERSION };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = featureEncodingApi;
}
if (typeof window !== 'undefined') {
    window.FeatureEncoding = featureEncodingApi;
}
