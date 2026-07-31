/**
 * Trains the global model from aggregated user submissions and writes it to
 * model/ for the workflow to publish as a release.
 *
 * Run by .github/workflows/train-model.yml. Reads the file produced by
 * collect-training-data.js.
 */

const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const {
    encodeAnswers,
    FEATURE_LENGTH,
    FEATURE_LAYOUT_VERSION
} = require('../src/feature-encoding');
const { getTrainingLabel, buildNameIndex } = require('./lib/training-data');

const TRAINING_DATA_FILE = process.env.TRAINING_DATA_FILE || 'data/training-data.json';
const MODEL_DIR = path.join(__dirname, '..', 'model');

const MIN_TRAINING_EXAMPLES = 10;

/**
 * A classifier that only knows a handful of names will confidently push those
 * same names at every visitor, which is worse than the rule-based guesser it
 * feeds into. Below this threshold we publish nothing and let the rules stand.
 */
const MIN_UNIQUE_NAMES = 10;

/** Validation on a tiny set measures noise. Below this, train on everything. */
const MIN_EXAMPLES_FOR_VALIDATION = 50;

/**
 * Output width tracks the number of names actually seen. The old fixed 1000
 * meant ~99% of the output layer was dead weight the optimiser still had to
 * push probability mass around.
 */
function createModel(outputClasses) {
    const model = tf.sequential({
        layers: [
            tf.layers.dense({ inputShape: [FEATURE_LENGTH], units: 64, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: outputClasses, activation: 'softmax' })
        ]
    });

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

/** Fisher-Yates, in place, on paired arrays. */
function shuffleTogether(a, b) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
        [b[i], b[j]] = [b[j], b[i]];
    }
}

function loadTrainingData() {
    if (!fs.existsSync(TRAINING_DATA_FILE)) {
        console.error(`Training data file not found: ${TRAINING_DATA_FILE}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(TRAINING_DATA_FILE, 'utf8'));
}

async function train() {
    const trainingData = loadTrainingData();
    console.log(`Loaded ${trainingData.length} submissions`);

    const labelled = trainingData
        .map(data => ({ data, name: getTrainingLabel(data) }))
        .filter(entry => entry.name && entry.data.answers);

    const fromRealName = labelled.filter(e => e.data.realName).length;
    console.log(`${labelled.length} labelled examples ` +
        `(${fromRealName} from user-supplied names, ${labelled.length - fromRealName} from confirmed guesses)`);

    if (labelled.length < MIN_TRAINING_EXAMPLES) {
        console.warn(`Need ${MIN_TRAINING_EXAMPLES} labelled examples, have ${labelled.length}. Nothing published.`);
        process.exit(0);
    }

    const nameIndex = buildNameIndex(labelled.map(e => e.name));
    const names = Object.keys(nameIndex);
    console.log(`${names.length} distinct names`);

    if (names.length < MIN_UNIQUE_NAMES) {
        console.warn(
            `Only ${names.length} distinct names (need ${MIN_UNIQUE_NAMES}). A model this narrow would ` +
            `recommend the same few names to everyone, so nothing is published and the rule-based ` +
            `guesser keeps running. This resolves itself as more people submit names.`
        );
        process.exit(0);
    }

    const features = labelled.map(e => encodeAnswers(e.data.answers));
    const labels = labelled.map(e => {
        const oneHot = new Array(names.length).fill(0);
        oneHot[nameIndex[e.name]] = 1;
        return oneHot;
    });

    // tfjs carves the validation set off the end of the array before it
    // shuffles, so without this the split is a contiguous block of the most
    // recent submissions -- which tend to share a name and produce a
    // meaningless val_acc of 1.0.
    shuffleTogether(features, labels);

    const useValidation = features.length >= MIN_EXAMPLES_FOR_VALIDATION;
    if (!useValidation) {
        console.log(`Training on all ${features.length} examples; too few to hold out a validation set.`);
    }

    const model = createModel(names.length);
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    const history = await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: useValidation ? 0.2 : 0,
        verbose: 0
    });

    xs.dispose();
    ys.dispose();

    const finalLoss = history.history.loss[history.history.loss.length - 1];
    const finalAcc = history.history.acc[history.history.acc.length - 1];
    console.log(`Trained. loss=${finalLoss.toFixed(4)} acc=${finalAcc.toFixed(4)}`);

    if (!useValidation) {
        console.log('No validation set: that accuracy is training accuracy and will look better than reality.');
    }

    fs.mkdirSync(MODEL_DIR, { recursive: true });
    await model.save(`file://${path.resolve(MODEL_DIR)}`);

    // names is ordered by index, so names[i] is the label for output i.
    // featureLayoutVersion lets a client refuse a model trained against a
    // feature layout it no longer produces.
    fs.writeFileSync(
        path.join(MODEL_DIR, 'name-index.json'),
        JSON.stringify({
            featureLayoutVersion: FEATURE_LAYOUT_VERSION,
            featureLength: FEATURE_LENGTH,
            trainedAt: new Date().toISOString(),
            exampleCount: features.length,
            names
        }, null, 2)
    );

    console.log(`Saved: ${fs.readdirSync(MODEL_DIR).join(', ')}`);
}

// Only train when run as a script, so tests can import the helpers above.
if (require.main === module) {
    train().catch(error => {
        console.error('Training failed:', error);
        process.exit(1);
    });
}

module.exports = { shuffleTogether };
