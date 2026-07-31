/**
 * Guards against the failure that motivated src/feature-encoding.js.
 *
 * The browser and the trainer once had their own copies of encodeAnswers. They
 * drifted, and nothing caught it: a mismatched encoding produces no error, just
 * a model trained on inputs laid out differently from the ones it is later
 * asked to predict on. These tests fail if a second implementation reappears.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const CONSUMERS = ['src/name-prediction-ml.js', 'scripts/train-model.js'];

test('nothing reimplements the feature vector', () => {
    for (const file of CONSUMERS) {
        const source = read(file);
        assert.ok(
            !/new Array\(\s*50\s*\)/.test(source),
            `${file} builds a 50-slot vector itself; use src/feature-encoding.js`
        );
        assert.ok(
            !/const\s+genderMap\s*=/.test(source),
            `${file} defines its own gender mapping; use src/feature-encoding.js`
        );
    }
});

test('both consumers reach the shared encoder', () => {
    assert.match(read('src/name-prediction-ml.js'), /window\.FeatureEncoding\.encodeAnswers/);
    assert.match(read('scripts/train-model.js'), /require\(['"]\.\.\/src\/feature-encoding['"]\)/);
});

// The browser loads plain <script> tags with no bundler, so the encoder has to
// be on the page before script.js runs or window.FeatureEncoding is undefined.
test('the browser loads the encoder before script.js', () => {
    const html = read('src/index.html');
    const encoder = html.indexOf('feature-encoding.js');
    const script = html.indexOf('script.js?');
    assert.ok(encoder !== -1, 'index.html does not load feature-encoding.js');
    assert.ok(encoder < script, 'feature-encoding.js must be loaded before script.js');
});

// Nothing should hardcode the vector width independently of the encoder.
test('input shape is taken from the encoder', () => {
    assert.ok(
        !/inputShape:\s*\[\s*50\s*\]/.test(read('src/name-prediction-ml.js')),
        'src/name-prediction-ml.js hardcodes inputShape [50]; use FEATURE_LENGTH'
    );
    assert.ok(
        !/inputShape:\s*\[\s*50\s*\]/.test(read('scripts/train-model.js')),
        'scripts/train-model.js hardcodes inputShape [50]; use FEATURE_LENGTH'
    );
});
