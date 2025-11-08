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
            tf.layers.dense({ units: 1000, activation: 'softmax' }) // Output layer
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
    const successfulData = trainingData.filter(data => 
        data.success === true && data.correctGuess && data.correctGuess.name
    );

    console.log(`✅ Using ${successfulData.length} successful predictions for training`);

    if (successfulData.length < MIN_TRAINING_EXAMPLES) {
        console.warn(`⚠️  Not enough successful predictions (${successfulData.length} < ${MIN_TRAINING_EXAMPLES})`);
        process.exit(0);
    }

    // Build name index
    const nameIndexMap = {};
    successfulData.forEach(data => {
        if (data.correctGuess && data.correctGuess.name) {
            getNameIndex(data.correctGuess.name, nameIndexMap);
        }
    });

    console.log(`📝 Found ${Object.keys(nameIndexMap).length} unique names`);

    // Prepare features and labels
    const features = [];
    const labels = [];

    for (const data of successfulData) {
        if (data.answers && data.correctGuess && data.correctGuess.name) {
            features.push(encodeAnswers(data.answers));
            
            // Create one-hot encoded label
            const label = new Array(1000).fill(0);
            const nameIndex = getNameIndex(data.correctGuess.name, nameIndexMap);
            if (nameIndex < 1000) {
                label[nameIndex] = 1;
            }
            labels.push(label);
        }
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

