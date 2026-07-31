/**
 * Train global model on aggregated training data
 * This script runs in GitHub Actions to train the model periodically
 */

const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

// Configuration
const TRAINING_DATA_FILE = process.env.TRAINING_DATA_FILE || 'data/training-data.json';
const MODEL_DIR = path.join(__dirname, '..', 'model');
const MIN_TRAINING_EXAMPLES = 10;
// Size of the softmax output layer. Must match createModel() and the frontend.
const OUTPUT_CLASSES = 1000;

/**
 * Work out which name an example should teach the model to predict.
 *
 * Two sources, in priority order:
 *   1. realName -- the user typed their actual name in. Available on both
 *      "Name Only" submissions and on failed guesses where they told us anyway.
 *   2. correctGuess.name -- we guessed right and they confirmed it.
 *
 * Previously only source 2 was used, which meant a dataset of 24 submissions
 * produced exactly 0 usable examples and the model could never train.
 *
 * Failed guesses without a realName return null. They carry only negative
 * information ("not these three names"), which categorical crossentropy has no
 * way to consume. The records are still kept in the dataset for future use.
 */
function getTrainingLabel(data) {
    if (data.realName && typeof data.realName === 'string' && data.realName.trim()) {
        return data.realName.trim();
    }
    if (data.success === true && data.correctGuess && data.correctGuess.name) {
        return data.correctGuess.name;
    }
    return null;
}

// Ensure model directory exists
if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
}

/**
 * Create model architecture (must match frontend)
 */
function createModel() {
    const model = tf.sequential({
        layers: [
            tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.3 }),
            tf.layers.dense({ units: 64, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: 32, activation: 'relu' }),
            tf.layers.dense({ units: OUTPUT_CLASSES, activation: 'softmax' }) // Output layer
        ]
    });

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

/**
 * Encode answers to feature vector (must match frontend)
 */
function encodeAnswers(answers) {
    const features = new Array(50).fill(0);
    let featureIndex = 0;

    // Gender encoding
    if (answers.gender) {
        const genderMap = { 'M': 0, 'F': 1, 'NB': 2, 'PREFER_NOT_TO_SAY': 3 };
        const genderIndex = genderMap[answers.gender] || 0;
        features[featureIndex + genderIndex] = 1;
    }
    featureIndex += 4;

    // Decade encoding (normalized)
    if (answers.decade) {
        features[featureIndex] = (answers.decade - 1900) / 120;
    }
    featureIndex += 1;

    // Name length encoding
    if (answers.length) {
        const lengthMap = { 'short': 0, 'medium': 1, 'long': 2 };
        const lengthIndex = lengthMap[answers.length] || 0;
        features[featureIndex + lengthIndex] = 1;
    }
    featureIndex += 3;

    // Vowel/consonant start
    if (answers.starts_with) {
        features[featureIndex + (answers.starts_with === 'vowel' ? 0 : 1)] = 1;
    }
    featureIndex += 2;

    // Popularity
    if (answers.popularity) {
        const popMap = { 'uncommon': 0, 'popular': 1, 'very_popular': 2 };
        const popIndex = popMap[answers.popularity] || 0;
        features[featureIndex + popIndex] = 1;
    }
    featureIndex += 3;

    // Political values (multi-hot encoding)
    if (answers.political_values) {
        const politicalValues = Array.isArray(answers.political_values) 
            ? answers.political_values 
            : [answers.political_values];
        const politicalMap = {
            'traditional': 0, 'diverse': 1, 'community': 2, 'progressive': 3,
            'justice': 4, 'security': 5, 'environment': 6, 'economic': 7,
            'education': 8, 'cooperation': 9
        };
        politicalValues.forEach(value => {
            if (politicalMap[value] !== undefined) {
                features[featureIndex + politicalMap[value]] = 1;
            }
        });
    }
    featureIndex += 10;

    // Language preferences
    if (answers.language_preference) {
        const languageValues = Array.isArray(answers.language_preference) 
            ? answers.language_preference 
            : [answers.language_preference];
        const languageMap = {
            'english_only': 0, 'spanish': 1, 'chinese': 2, 'filipino': 3,
            'vietnamese': 4, 'korean': 5, 'japanese': 6, 'hindi': 7,
            'arabic': 8, 'hebrew': 9, 'french': 10, 'german': 11,
            'italian': 12, 'russian': 13, 'polish': 14, 'greek': 15,
            'irish': 16, 'scandinavian': 17, 'yoruba': 18, 'amharic': 19,
            'haitian_creole': 20, 'portuguese': 21, 'multilingual': 22
        };
        languageValues.forEach(value => {
            if (languageMap[value] !== undefined) {
                features[featureIndex + languageMap[value]] = 1;
            }
        });
    }
    featureIndex += 23;

    // Pad remaining features
    while (featureIndex < 50) {
        features[featureIndex] = 0;
        featureIndex++;
    }

    return features;
}

/**
 * Get name index for label encoding
 */
function getNameIndex(name, nameIndexMap) {
    if (!nameIndexMap[name]) {
        const index = Object.keys(nameIndexMap).length;
        nameIndexMap[name] = index;
    }
    return nameIndexMap[name];
}

/**
 * Main training function
 */
async function train() {
    console.log('🤖 Starting model training...');
    
    // Load training data
    if (!fs.existsSync(TRAINING_DATA_FILE)) {
        console.error(`❌ Training data file not found: ${TRAINING_DATA_FILE}`);
        process.exit(1);
    }

    const trainingData = JSON.parse(fs.readFileSync(TRAINING_DATA_FILE, 'utf8'));
    console.log(`📊 Loaded ${trainingData.length} training examples`);

    if (trainingData.length < MIN_TRAINING_EXAMPLES) {
        console.warn(`⚠️  Not enough training data (${trainingData.length} < ${MIN_TRAINING_EXAMPLES})`);
        console.warn('Skipping training. Collect more data first.');
        process.exit(0);
    }

    // Filter successful predictions only (for supervised learning)
    const labelledData = trainingData
        .map(data => ({ data, name: getTrainingLabel(data) }))
        .filter(entry => entry.name && entry.data.answers);

    const fromRealName = labelledData.filter(e => e.data.realName).length;
    const fromCorrectGuess = labelledData.length - fromRealName;
    const failuresUsed = labelledData.filter(e => e.data.success === false).length;

    console.log(`✅ Using ${labelledData.length} labelled examples for training`);
    console.log(`   ${fromRealName} labelled from user-supplied realName, ${fromCorrectGuess} from confirmed correct guesses`);
    console.log(`   (${failuresUsed} of these came from failed guesses where the user still told us their name)`);

    if (labelledData.length < MIN_TRAINING_EXAMPLES) {
        console.warn(`⚠️  Not enough labelled examples (${labelledData.length} < ${MIN_TRAINING_EXAMPLES})`);
        console.warn('Skipping training. Collect more data first.');
        process.exit(0);
    }

    // Build name index
    const nameIndexMap = {};
    labelledData.forEach(entry => getNameIndex(entry.name, nameIndexMap));

    const uniqueNames = Object.keys(nameIndexMap).length;
    console.log(`📝 Found ${uniqueNames} unique names`);

    if (uniqueNames > OUTPUT_CLASSES) {
        console.warn(`⚠️  ${uniqueNames} unique names exceeds the ${OUTPUT_CLASSES}-way output layer.`);
        console.warn('Names beyond the limit will be dropped. Increase OUTPUT_CLASSES and retrain.');
    }

    // A blunt but useful warning: this architecture has ~140k parameters and a
    // 1000-way softmax. A few dozen examples will fit it almost perfectly and
    // generalise poorly. Early accuracy numbers here are not meaningful.
    if (labelledData.length < 500) {
        console.warn(`⚠️  Only ${labelledData.length} examples against a ${OUTPUT_CLASSES}-way output layer.`);
        console.warn('   Expect heavy overfitting. Treat reported accuracy as noise, not signal.');
    }

    // Prepare features and labels
    const features = [];
    const labels = [];

    for (const entry of labelledData) {
        const nameIndex = getNameIndex(entry.name, nameIndexMap);
        if (nameIndex >= OUTPUT_CLASSES) continue;

        features.push(encodeAnswers(entry.data.answers));

        // Create one-hot encoded label
        const label = new Array(OUTPUT_CLASSES).fill(0);
        label[nameIndex] = 1;
        labels.push(label);
    }

    if (features.length === 0) {
        console.error('❌ No valid training examples after processing');
        process.exit(1);
    }

    console.log(`🎯 Prepared ${features.length} training examples`);

    // Create and train model
    const model = createModel();
    console.log('🧠 Model architecture created');

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    console.log('🏋️  Starting training...');
    const history = await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 1
    });

    // Log training results
    const finalLoss = history.history.loss[history.history.loss.length - 1];
    const finalAcc = history.history.acc ? history.history.acc[history.history.acc.length - 1] : 'N/A';
    console.log(`📈 Training complete! Final loss: ${finalLoss.toFixed(4)}, Accuracy: ${finalAcc}`);

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    // Save model
    console.log('💾 Saving model...');
    await model.save(`file://${path.resolve(MODEL_DIR)}`);
    
    // Save name index mapping for reference
    const nameIndexFile = path.join(MODEL_DIR, 'name-index.json');
    fs.writeFileSync(nameIndexFile, JSON.stringify(nameIndexMap, null, 2));
    
    console.log('✅ Model saved successfully!');
    console.log(`📁 Model location: ${MODEL_DIR}`);
    
    // List saved files
    const files = fs.readdirSync(MODEL_DIR);
    console.log(`📦 Saved files: ${files.join(', ')}`);
}

// Run training
train().catch(error => {
    console.error('❌ Training failed:', error);
    process.exit(1);
});

