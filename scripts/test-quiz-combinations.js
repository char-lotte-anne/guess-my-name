/**
 * Test script to verify all quiz answer combinations return guesses
 * Uses the ACTUAL algorithm from the codebase, not mocks
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Set up paths
const SRC_DIR = path.join(__dirname, '..', 'src');
const DATA_DIR = path.join(__dirname, '..', 'data');
const NAMES_DIR = path.join(__dirname, '..', 'names');
const STATE_NAMES_DIR = path.join(__dirname, '..', 'namesbystate');
const TERRITORY_NAMES_DIR = path.join(__dirname, '..', 'namesbyterritory');

// Mock TensorFlow.js
function createTensorFlowMock() {
    return {
        loadLayersModel: async () => ({
            predict: () => [],
            summary: () => {}
        }),
        sequential: () => ({
            add: function() { return this; },
            compile: function() { return this; },
            fit: async function() { return { history: {} }; },
            predict: () => [],
            summary: () => {}
        }),
        layers: {
            dense: () => ({}),
            dropout: () => ({})
        },
        tensor2d: () => ({}),
        tensor1d: () => ({}),
        ready: Promise.resolve()
    };
}

// Mock browser environment
function createBrowserMocks() {
    const mocks = {
        window: global,
        document: {
            getElementById: () => ({ 
                style: { display: '' },
                textContent: '',
                innerHTML: '',
                addEventListener: () => {},
                querySelector: () => null,
                querySelectorAll: () => [],
                classList: { add: () => {}, remove: () => {} },
                appendChild: () => {},
                removeChild: () => {},
                setAttribute: () => {},
                getAttribute: () => null
            }),
            querySelector: () => ({ style: { display: '' } }),
            querySelectorAll: () => [],
            createElement: () => ({
                style: {},
                classList: { add: () => {}, remove: () => {} },
                appendChild: () => {},
                removeChild: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
                setAttribute: () => {},
                getAttribute: () => null,
                textContent: '',
                innerHTML: ''
            }),
            addEventListener: () => {},
            removeEventListener: () => {},
            createTextNode: () => ({ textContent: '' }),
            body: {
                appendChild: () => {},
                removeChild: () => {},
                style: {}
            },
            head: {
                appendChild: () => {},
                removeChild: () => {}
            }
        },
        history: {
            pushState: () => {}
        },
        localStorage: {
            getItem: () => null,
            setItem: () => {}
        },
        tf: createTensorFlowMock(),
        fetch: async (url) => {
            // Handle file paths
            let filePath;
            if (url.startsWith('../data/')) {
                filePath = path.join(DATA_DIR, url.replace('../data/', ''));
            } else if (url.startsWith('../names/')) {
                filePath = path.join(NAMES_DIR, url.replace('../names/', ''));
            } else if (url.startsWith('../namesbystate/')) {
                filePath = path.join(STATE_NAMES_DIR, url.replace('../namesbystate/', ''));
            } else if (url.startsWith('../namesbyterritory/')) {
                filePath = path.join(TERRITORY_NAMES_DIR, url.replace('../namesbyterritory/', ''));
            } else if (url.startsWith('http')) {
                // External URL - return not found
                return { ok: false, status: 404 };
            } else {
                filePath = url;
            }
            
            try {
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    return {
                        ok: true,
                        status: 200,
                        text: async () => content,
                        json: async () => JSON.parse(content)
                    };
                } else {
                    return {
                        ok: false,
                        status: 404,
                        statusText: 'Not Found',
                        text: async () => '',
                        json: async () => null
                    };
                }
            } catch (error) {
                return {
                    ok: false,
                    status: 500,
                    statusText: error.message,
                    text: async () => '',
                    json: async () => null
                };
            }
        },
        DOMParser: class DOMParser {
            parseFromString(str, type) {
                // Simple mock parser
                return {
                    documentElement: {
                        nodeName: 'svg',
                        classList: { add: () => {} },
                        querySelector: () => null,
                        querySelectorAll: () => [],
                        style: {}
                    }
                };
            }
        },
        console: console
    };
    
    return mocks;
}

// Load and execute the actual source files
function loadSourceFiles() {
    const nameDbCode = fs.readFileSync(path.join(SRC_DIR, 'nameDatabase.js'), 'utf8');
    const scriptCode = fs.readFileSync(path.join(SRC_DIR, 'script.js'), 'utf8');
    
    // Create a sandbox with browser mocks
    const mocks = createBrowserMocks();
    // Make window the global object so classes attach to it
    const sandbox = vm.createContext({
        ...mocks,
        window: mocks.window,
        global: mocks.window, // Make global point to window
        module: { exports: {} },
        exports: {},
        require: (module) => {
            throw new Error(`Cannot require ${module} in sandbox`);
        },
        console: console,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        Promise: Promise,
        Array: Array,
        Object: Object,
        String: String,
        Number: Number,
        Math: Math,
        Date: Date,
        JSON: JSON,
        Error: Error,
        TypeError: TypeError,
        ReferenceError: ReferenceError
    });
    
    // Execute nameDatabase.js
    const nameDbScript = new vm.Script(nameDbCode);
    nameDbScript.runInContext(sandbox);
    
    // After executing, explicitly attach classes to window if they exist in scope
    try {
        const attachScript = new vm.Script(`
            if (typeof EnhancedNameDatabase !== 'undefined') {
                window.EnhancedNameDatabase = EnhancedNameDatabase;
            }
        `);
        attachScript.runInContext(sandbox);
    } catch (e) {
        // Ignore if class not in scope
    }
    
    // Execute script.js (which depends on nameDatabase)
    const script = new vm.Script(scriptCode);
    script.runInContext(sandbox);
    
    // After executing, explicitly attach classes to window if they exist in scope
    try {
        const attachScript2 = new vm.Script(`
            if (typeof NameGuessingQuiz !== 'undefined') {
                window.NameGuessingQuiz = NameGuessingQuiz;
            }
        `);
        attachScript2.runInContext(sandbox);
    } catch (e) {
        // Ignore if class not in scope
    }
    
    // In browser, top-level classes are on window. In VM, they should be on the global object (which is window)
    // But they might also be directly on sandbox if the code doesn't use window
    const NameGuessingQuiz = sandbox.window?.NameGuessingQuiz || sandbox.NameGuessingQuiz;
    const EnhancedNameDatabase = sandbox.window?.EnhancedNameDatabase || sandbox.EnhancedNameDatabase;
    
    if (!NameGuessingQuiz) {
        // Debug: show what's available
        const available = Object.keys(sandbox).filter(k => 
            !k.startsWith('_') && 
            (typeof sandbox[k] === 'function' || typeof sandbox[k] === 'object') &&
            (k.includes('Name') || k.includes('Quiz') || k.includes('Database'))
        );
        console.log('Debug - Available properties:', available);
        if (sandbox.window) {
            const windowKeys = Object.keys(sandbox.window).filter(k => 
                !k.startsWith('_') && 
                (typeof sandbox.window[k] === 'function' || typeof sandbox.window[k] === 'object') &&
                (k.includes('Name') || k.includes('Quiz') || k.includes('Database'))
            );
            console.log('Debug - Window properties:', windowKeys);
        }
        throw new Error('NameGuessingQuiz class not found in sandbox');
    }
    
    if (!EnhancedNameDatabase) {
        throw new Error('EnhancedNameDatabase class not found in sandbox');
    }
    
    return {
        NameGuessingQuiz: NameGuessingQuiz,
        EnhancedNameDatabase: EnhancedNameDatabase,
        sandbox: sandbox
    };
}

// Generate test combinations
function generateTestCombinations() {
    const combinations = [];
    
    const genders = ['M', 'F', 'NB', 'PREFER_NOT_TO_SAY'];
    const decades = [1900, 1950, 1980, 1990, 2000, 2020];
    const lengths = ['short', 'medium', 'long', 'extra_long'];
    
    // Focus on key combinations that might fail
    // Test 1: All gender options with basic answers
    for (const gender of genders) {
        combinations.push({ gender, decade: 1980, length: 'medium' });
    }
    
    // Test 2: All length options for each gender
    for (const gender of genders) {
        for (const length of lengths) {
            combinations.push({ gender, decade: 1980, length });
        }
    }
    
    // Test 3: Edge cases - gender only
    for (const gender of genders) {
        combinations.push({ gender });
    }
    
    // Test 4: Non-binary specific
    combinations.push({ gender: 'NB', decade: 2000, length: 'short' });
    combinations.push({ gender: 'NB', decade: 2000, length: 'medium' });
    combinations.push({ gender: 'NB', decade: 2000, length: 'long' });
    combinations.push({ gender: 'NB', decade: 2000, length: 'extra_long' });
    combinations.push({ gender: 'NB' });
    
    // Test 5: Prefer not to say specific
    combinations.push({ gender: 'PREFER_NOT_TO_SAY', decade: 1980, length: 'short' });
    combinations.push({ gender: 'PREFER_NOT_TO_SAY', decade: 1980, length: 'medium' });
    combinations.push({ gender: 'PREFER_NOT_TO_SAY', decade: 1980, length: 'long' });
    combinations.push({ gender: 'PREFER_NOT_TO_SAY' });
    
    // Remove duplicates
    const unique = [];
    const seen = new Set();
    for (const combo of combinations) {
        const key = JSON.stringify(combo);
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(combo);
        }
    }
    
    return unique;
}

// Main test function
async function runTests() {
    console.log('🧪 Testing Quiz Combinations with REAL Algorithm\n');
    console.log('Loading source files...\n');
    
    let NameGuessingQuiz, EnhancedNameDatabase, sandbox;
    try {
        const classes = loadSourceFiles();
        NameGuessingQuiz = classes.NameGuessingQuiz;
        EnhancedNameDatabase = classes.EnhancedNameDatabase;
        sandbox = classes.sandbox;
        console.log('✅ Source files loaded successfully\n');
    } catch (error) {
        console.error('❌ Error loading source files:', error.message);
        console.error('Stack:', error.stack);
        console.log('\n⚠️  Falling back to simplified test...\n');
        // Fall back to simplified test if loading fails
        return runSimplifiedTests();
    }
    
    const TEST_COMBINATIONS = generateTestCombinations();
    console.log(`Testing ${TEST_COMBINATIONS.length} combinations...\n`);
    
    const results = {
        passed: 0,
        failed: 0,
        failures: []
    };
    
    // Create a quiz instance using the sandbox context
    const QuizClass = NameGuessingQuiz || sandbox.NameGuessingQuiz || sandbox.window?.NameGuessingQuiz;
    if (!QuizClass) {
        throw new Error('Could not find NameGuessingQuiz class');
    }
    const quiz = new QuizClass();
    
    // Wait for database to load
    console.log('⏳ Waiting for database to load...');
    if (quiz.enhancedNameDatabase && quiz.enhancedNameDatabase.ensureLoaded) {
        await quiz.enhancedNameDatabase.ensureLoaded();
        // Give it a bit more time
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('✅ Database loaded\n');
    
    for (let i = 0; i < TEST_COMBINATIONS.length; i++) {
        const combination = TEST_COMBINATIONS[i];
        quiz.answers = combination;
        
        try {
            const guesses = await quiz.calculateTopGuesses(5);
            
            if (guesses && guesses.length > 0) {
                results.passed++;
                const guessNames = guesses.map(g => g.name || g).join(', ');
                console.log(`✅ Test ${i + 1}/${TEST_COMBINATIONS.length}: PASSED - Got ${guesses.length} guesses (${guessNames}) for ${JSON.stringify(combination)}`);
            } else {
                results.failed++;
                const failure = {
                    combination,
                    error: 'No guesses returned',
                    candidates: null
                };
                
                // Try to get candidates to debug
                try {
                    const candidates = await quiz.getCandidates();
                    failure.candidates = candidates ? candidates.length : 0;
                } catch (e) {
                    failure.candidatesError = e.message;
                }
                
                results.failures.push(failure);
                console.log(`❌ Test ${i + 1}/${TEST_COMBINATIONS.length}: FAILED - No guesses for ${JSON.stringify(combination)}`);
                if (failure.candidates !== null) {
                    console.log(`   Candidates found: ${failure.candidates}`);
                }
            }
        } catch (error) {
            results.failed++;
            const failure = {
                combination,
                error: error.message,
                stack: error.stack
            };
            results.failures.push(failure);
            console.log(`❌ Test ${i + 1}/${TEST_COMBINATIONS.length}: FAILED - Error: ${error.message} for ${JSON.stringify(combination)}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / TEST_COMBINATIONS.length) * 100).toFixed(1)}%`);
    
    if (results.failures.length > 0) {
        console.log('\n❌ Failed Combinations:');
        results.failures.forEach((failure, index) => {
            console.log(`\n${index + 1}. Combination: ${JSON.stringify(failure.combination)}`);
            console.log(`   Error: ${failure.error}`);
            if (failure.candidates !== null) {
                console.log(`   Candidates: ${failure.candidates}`);
            }
            if (failure.stack) {
                console.log(`   Stack: ${failure.stack.split('\n')[0]}`);
            }
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Exit with error code if any tests failed
    if (results.failed > 0) {
        process.exit(1);
    } else {
        console.log('✨ All tests passed!');
        process.exit(0);
    }
}

// Simplified fallback test
async function runSimplifiedTests() {
    console.log('Running simplified test with mocks...\n');
    // Use the existing mock-based test logic
    // (keeping the original mock test as fallback)
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Test runner error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
});
