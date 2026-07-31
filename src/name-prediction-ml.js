/**
 * The prediction model, in both its forms: a local model trained in this
 * browser on this person's own history, and the global model downloaded from
 * the latest GitHub release.
 *
 * See LEARNING_ARCHITECTURE.md for why there are two and how they differ.
 * Feature encoding lives in feature-encoding.js and is shared with training.
 */

// Simple Neural Network for Name Prediction
class NamePredictionML {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.featureNames = [];
        this.nameIndex = {};
        this.indexToName = {};
        this.globalModelLoaded = false;
        this.globalNames = null; // names[i] is the label for output i, from the release
        this.initializeModel();
    }
    
    /**
     * Load the latest model published by the training workflow.
     *
     * Every failure path here is non-fatal: the caller falls back to the local
     * model, and the rule-based guesser runs regardless. A missing release is
     * the normal state of a fresh deployment, not an error.
     */
    async loadGlobalModel() {
        const GITHUB_USERNAME = 'char-lotte-anne';
        const REPO_NAME = 'guess-my-name';

        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/releases/latest`
            );

            if (!response.ok) return false;

            const release = await response.json();
            const asset = name => release.assets.find(a => a.name === name);
            const modelJson = asset('model.json');
            const nameIndex = asset('name-index.json');
            const weights = release.assets.find(a => a.name.endsWith('.bin'));

            // name-index.json is what makes the output interpretable. Without
            // it the probabilities are indices into an unknown dictionary, so
            // there is nothing safe to do with them.
            if (!modelJson || !weights || !nameIndex) return false;

            const metadata = await (await fetch(nameIndex.browser_download_url)).json();

            // A model trained against a different feature layout expects its
            // inputs in positions this build no longer writes to.
            if (metadata.featureLayoutVersion !== window.FeatureEncoding.FEATURE_LAYOUT_VERSION) {
                log.debug('Global model was trained on an older feature layout; ignoring it.');
                return false;
            }

            if (!Array.isArray(metadata.names) || metadata.names.length === 0) return false;

            this.model = await tf.loadLayersModel(modelJson.browser_download_url);
            this.globalNames = metadata.names;
            this.isModelLoaded = true;
            this.globalModelLoaded = true;

            log.debug(`Loaded global model ${release.tag_name} (${metadata.names.length} names).`);
            return true;
        } catch (error) {
            log.debug('Could not load global model, using local:', error.message);
            return false;
        }
    }

    async initializeModel() {
        try {
            // Create a simple neural network
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({ inputShape: [window.FeatureEncoding.FEATURE_LENGTH], units: 128, activation: 'relu' }),
                    tf.layers.dropout({ rate: 0.3 }),
                    tf.layers.dense({ units: 64, activation: 'relu' }),
                    tf.layers.dropout({ rate: 0.2 }),
                    tf.layers.dense({ units: 32, activation: 'relu' }),
                    tf.layers.dense({ units: 1000, activation: 'softmax' }) // Output layer for name probabilities
                ]
            });

            // Compile the model
            this.model.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            this.isModelLoaded = true;
        } catch (error) {
            console.error('Error initializing neural network:', error);
            this.isModelLoaded = false;
        }
    }

    encodeAnswers(answers) {
        return window.FeatureEncoding.encodeAnswers(answers);
    }

    async predict(answers) {
        if (!this.isModelLoaded) {
            return null;
        }

        try {
            const features = this.encodeAnswers(answers);
            const input = tf.tensor2d([features]);
            
            const prediction = this.model.predict(input);
            const probabilities = await prediction.data();
            
            input.dispose();
            prediction.dispose();
            
            return probabilities;
        } catch (error) {
            console.error('Error making ML prediction:', error);
            return null;
        }
    }

    async train(trainingData) {
        log.debug(`🧠 train(): Called with ${trainingData.length} training examples`);
        log.debug(`🧠 train(): Model loaded: ${this.isModelLoaded}`);
        
        if (!this.isModelLoaded) {
            log.debug('⚠️ train(): Model not loaded, skipping training');
            return;
        }
        
        if (trainingData.length < 10) {
            log.debug(`⚠️ train(): Need at least 10 training examples, have ${trainingData.length}. Skipping training.`);
            return;
        }

        try {
            // Prepare training data
            const features = [];
            const labels = [];
            
            let validExamples = 0;
            for (const data of trainingData) {
                if (data.success && data.correctGuess) {
                    features.push(this.encodeAnswers(data.answers));
                    
                    // Create one-hot encoded label for the correct name
                    const label = new Array(1000).fill(0);
                    const nameIndex = this.getNameIndex(data.correctGuess.name);
                    if (nameIndex !== -1) {
                        label[nameIndex] = 1;
                        validExamples++;
                    }
                    labels.push(label);
                }
            }
            
            log.debug(`🧠 train(): Prepared ${validExamples} valid training examples from ${trainingData.length} total`);
            
            if (features.length === 0) {
                log.debug('⚠️ train(): No valid features extracted, skipping training');
                return;
            }
            
            log.debug(`🧠 train(): Starting model training with ${features.length} examples, 50 epochs...`);
            const xs = tf.tensor2d(features);
            const ys = tf.tensor2d(labels);
            
            // Train the model
            const history = await this.model.fit(xs, ys, {
                epochs: 50,
                batchSize: 32,
                validationSplit: 0.2,
                verbose: 0
            });
            
            log.debug(`✅ train(): Training complete! Final loss: ${history.history.loss[history.history.loss.length - 1].toFixed(4)}, Final accuracy: ${history.history.acc ? history.history.acc[history.history.acc.length - 1].toFixed(4) : 'N/A'}`);
            
            xs.dispose();
            ys.dispose();
        } catch (error) {
            console.error('❌ Error training neural network:', error);
        }
    }

    getNameIndex(name) {
        // `in` rather than a truthiness test: the first name is stored at index
        // 0, and `!this.nameIndex[name]` treats that as missing, reassigning it
        // a new index on every lookup.
        if (!(name in this.nameIndex)) {
            const index = Object.keys(this.nameIndex).length;
            this.nameIndex[name] = index;
            this.indexToName[index] = name;
        }
        return this.nameIndex[name];
    }

    /**
     * Map an output index back to the name it represents.
     *
     * Which dictionary applies depends on which model is loaded: the global
     * model's indices are defined by the name-index.json shipped alongside it,
     * the local model's by whatever this browser has trained on.
     *
     * Returns null for an index we cannot name. This used to return a name from
     * a hardcoded list of 20 (`fallbackNames[index % 20]`), so every ML
     * prediction resolved to an unrelated name and was fed into the results as
     * though it meant something.
     */
    getNameFromIndex(index) {
        const names = this.globalModelLoaded ? this.globalNames : this.indexToName;
        if (!names) return null;
        return names[index] || null;
    }
}
