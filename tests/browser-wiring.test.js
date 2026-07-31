/**
 * There is no bundler, so the browser's dependency graph is the order of
 * <script> tags in index.html and nothing checks it. These tests stand in for
 * the compile error a module system would have given us.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');
const allScripts = [...html.matchAll(/<script src="([^"?]+)/g)].map(m => m[1]);
const scripts = allScripts.filter(src => !src.startsWith('http'));

test('CDN dependencies are pinned, not floating', () => {
    for (const src of allScripts.filter(s => s.startsWith('http'))) {
        assert.ok(!src.includes('@latest'),
            `${src} floats on @latest; pin it so the build is reproducible`);
    }
});

test('every script tag points at a file that exists', () => {
    for (const src of scripts) {
        const file = path.join(__dirname, '..', 'src', src);
        assert.ok(fs.existsSync(file), `index.html loads ${src}, which does not exist`);
    }
});

test('every source file is actually loaded', () => {
    const loaded = new Set(scripts);
    const onDisk = fs.readdirSync(path.join(__dirname, '..', 'src'))
        .filter(f => f.endsWith('.js'));

    for (const file of onDisk) {
        assert.ok(loaded.has(file), `src/${file} exists but no <script> tag loads it`);
    }
});

/**
 * Classic scripts share one global lexical scope, so two files declaring the
 * same top-level `const` is a SyntaxError that takes the whole page down --
 * and it surfaces at load time in a browser, not in any Node test. Parsing the
 * concatenation is the cheapest way to catch it.
 */
test('the loaded scripts have no colliding top-level declarations', () => {
    const combined = scripts
        .map(src => fs.readFileSync(path.join(__dirname, '..', 'src', src), 'utf8'))
        .join('\n');

    assert.doesNotThrow(() => new (require('node:vm').Script)(combined),
        'concatenating the scripts fails to parse; likely a duplicate top-level const');
});

/**
 * NameGuessingQuiz is declared in quiz-core.js and completed by quiz-*.js files
 * that Object.assign onto its prototype. A mixin file that fails to load, or a
 * method defined in two of them, produces a quiz that is merely missing
 * behaviour at runtime rather than failing outright. Build the prototype the
 * way the browser does and check what ended up on it.
 */
test('the quiz prototype is assembled from every mixin', () => {
    const vm = require('node:vm');
    const mixins = scripts.filter(s => s.startsWith('quiz-'));
    const context = vm.createContext({ window: {}, document: {}, console });

    for (const file of mixins) {
        vm.runInContext(
            fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'),
            context, { filename: file }
        );
    }

    const proto = vm.runInContext('NameGuessingQuiz.prototype', context);
    const methods = Object.getOwnPropertyNames(proto);

    // Spot-check one method from each mixin so a silently dropped file fails.
    for (const method of ['showQuestion', 'createMultiSelect', 'loadEuropeWithRussia',
                          'calculateRuleBasedGuesses', 'generateShareableGraphic']) {
        assert.ok(methods.includes(method), `${method} is missing from the prototype`);
    }

    assert.ok(methods.length > 70, `only ${methods.length} methods on the prototype`);
});

// A method defined in two mixins would be silently overwritten by whichever
// loads last.
test('no method is defined by two mixins', () => {
    const seen = new Map();

    for (const file of scripts.filter(s => s.startsWith('quiz-'))) {
        const source = fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8');
        for (const match of source.matchAll(/^ {4}(?:async )?([a-zA-Z_$][\w$]*)\s*\(.*\)\s*\{\s*$/gm)) {
            const name = match[1];
            assert.ok(!seen.has(name),
                `${name} is defined in both ${seen.get(name)} and ${file}`);
            seen.set(name, file);
        }
    }
});

// Globals are read at call time, not load time, so order only matters for
// things touched while a script is still executing. Pinning the order anyway:
// it is the closest thing this project has to a dependency declaration.
test('shared globals load before their consumers', () => {
    const order = name => scripts.indexOf(name);
    const before = (a, b) => assert.ok(
        order(a) !== -1 && order(a) < order(b), `${a} must load before ${b}`
    );

    before('debug-log.js', 'script.js');
    before('feature-encoding.js', 'name-prediction-ml.js');
    before('quiz-data.js', 'quiz-core.js');
    before('name-scoring.js', 'quiz-guessing.js');
    before('security-utils.js', 'script.js');

    // The mixins call Object.assign(NameGuessingQuiz.prototype, ...) at load
    // time, so the class must already exist -- this order is load-bearing, not
    // stylistic. script.js constructs the quiz and must come last.
    for (const mixin of scripts.filter(s => s.startsWith('quiz-') && s !== 'quiz-core.js' && s !== 'quiz-data.js')) {
        before('quiz-core.js', mixin);
        before(mixin, 'script.js');
    }
});
