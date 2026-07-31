/**
 * There is no bundler, so the browser files share one global scope and declare
 * their globals implicitly. That defeats most "undefined variable" checking
 * unless every cross-file global is listed, which is what the `globals` block
 * below is for -- it doubles as a written record of the module graph.
 *
 * Rules are deliberately few. This is a lint pass to catch real mistakes
 * (unused variables, accidental globals, unreachable code), not a style bot;
 * formatting arguments are not worth CI time on a solo project.
 */

const browserGlobals = {
    window: 'readonly', document: 'readonly', navigator: 'readonly',
    localStorage: 'readonly', location: 'readonly', history: 'readonly',
    fetch: 'readonly', console: 'readonly', alert: 'readonly',
    setTimeout: 'readonly', clearTimeout: 'readonly',
    setInterval: 'readonly', clearInterval: 'readonly',
    requestAnimationFrame: 'readonly', URLSearchParams: 'readonly',
    Image: 'readonly', Blob: 'readonly', FileReader: 'readonly',
    URL: 'readonly',
    XMLHttpRequest: 'readonly', DOMParser: 'readonly',
    HTMLElement: 'readonly', Element: 'readonly', Event: 'readonly',
    CustomEvent: 'readonly', getComputedStyle: 'readonly',
    performance: 'readonly', structuredClone: 'readonly'
};

// Globals each src file defines for the others. Loaded in the order given by
// the <script> tags in index.html; see tests/browser-wiring.test.js.
const projectGlobals = {
    log: 'readonly',
    SecurityUtils: 'readonly',
    FeatureEncoding: 'readonly',
    encodeAnswers: 'readonly',
    FEATURE_LENGTH: 'readonly',
    FEATURE_LAYOUT: 'readonly',
    FEATURE_LAYOUT_VERSION: 'readonly',
    NamePredictionML: 'readonly',
    NameScoring: 'readonly',
    CandidateRanking: 'readonly',
    NameOrigins: 'readonly',
    NameReferenceData: 'readonly',
    CONTINENT_TO_COUNTRIES: 'readonly',
    QUIZ_QUESTIONS: 'readonly',
    MysticalBackground: 'readonly',
    EnhancedNameDatabase: 'readonly',
    NameGuessingQuiz: 'readonly',
    showQuiz: 'readonly',
    tf: 'readonly',
    emailjs: 'readonly',
    module: 'writable'
};

const rules = {
    'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-unreachable': 'error',
    'no-dupe-keys': 'error',
    'no-dupe-args': 'error',
    'no-duplicate-case': 'error',
    'no-fallthrough': 'error',
    'no-const-assign': 'error',
    'no-self-compare': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
    'eqeqeq': ['warn', 'smart'],
    'no-var': 'warn'
};

module.exports = [
    { ignores: ['node_modules/**', 'model/**', 'data/**', 'names/**',
                'namesbystate/**', 'namesbyterritory/**', 'assets/**'] },
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: { ...browserGlobals, ...projectGlobals }
        },
        rules: {
            ...rules,
            // Each src file declares the global it publishes, and projectGlobals
            // lists it so the other files can use it. That is a redeclaration by
            // definition, and it is the intended arrangement.
            'no-redeclare': 'off',
            // Same reason: a file's own top-level declaration looks unused
            // because its consumers are separate files.
            'no-unused-vars': ['warn', {
                args: 'none',
                varsIgnorePattern: '^(_|[A-Z])',
                caughtErrors: 'none'
            }]
        }
    },
    {
        files: ['scripts/**/*.js', 'api/**/*.js', 'tests/**/*.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                require: 'readonly', module: 'writable', exports: 'writable',
                process: 'readonly', __dirname: 'readonly', __filename: 'readonly',
                console: 'readonly', Buffer: 'readonly', fetch: 'readonly',
                setTimeout: 'readonly', setInterval: 'readonly',
                clearTimeout: 'readonly', clearInterval: 'readonly',
                URL: 'readonly', URLSearchParams: 'readonly', global: 'writable'
            }
        },
        rules
    }
];
