/**
 * Security utility functions for input sanitization and rate limiting
 * Prevents XSS attacks by escaping HTML special characters
 */
const SecurityUtils = {
    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} - Escaped text safe for HTML insertion
     */
    escapeHtml(text) {
        if (typeof text !== 'string') {
            return String(text);
        }
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    /**
     * Sanitizes user input by trimming and escaping
     * @param {string} input - User input to sanitize
     * @param {number} maxLength - Maximum allowed length (default: 100)
     * @returns {string} - Sanitized input
     */
    sanitizeInput(input, maxLength = 100) {
        if (typeof input !== 'string') {
            return '';
        }
        return this.escapeHtml(input.trim().substring(0, maxLength));
    },
    
    /**
     * Rate limiting utility for preventing abuse
     * Tracks submissions in localStorage with a time window
     * @param {string} key - Storage key for rate limiting
     * @param {number} maxAttempts - Maximum attempts allowed (default: 5)
     * @param {number} windowMs - Time window in milliseconds (default: 1 hour)
     * @returns {Object} - { allowed: boolean, remaining: number, resetAt: number }
     */
    checkRateLimit(key, maxAttempts = 5, windowMs = 60 * 60 * 1000) {
        try {
            const now = Date.now();
            const stored = localStorage.getItem(key);
            let attempts = [];
            
            if (stored) {
                try {
                    attempts = JSON.parse(stored);
                } catch (e) {
                    attempts = [];
                }
            }
            
            // Filter out attempts outside the time window
            attempts = attempts.filter(timestamp => (now - timestamp) < windowMs);
            
            if (attempts.length >= maxAttempts) {
                const oldestAttempt = Math.min(...attempts);
                const resetAt = oldestAttempt + windowMs;
                return {
                    allowed: false,
                    remaining: 0,
                    resetAt: resetAt,
                    retryAfter: Math.ceil((resetAt - now) / 1000) // seconds
                };
            }
            
            // Record this attempt
            attempts.push(now);
            localStorage.setItem(key, JSON.stringify(attempts));
            
            return {
                allowed: true,
                remaining: maxAttempts - attempts.length,
                resetAt: null
            };
        } catch (error) {
            console.error('Rate limit check error:', error);
            // On error, allow the request (fail open)
            return { allowed: true, remaining: maxAttempts, resetAt: null };
        }
    },
    
    /**
     * Formats time remaining for rate limit reset
     * @param {number} seconds - Seconds until reset
     * @returns {string} - Human-readable time string
     */
    formatTimeRemaining(seconds) {
        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else if (seconds < 3600) {
            const minutes = Math.ceil(seconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.ceil(seconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    }
};

// Simple Neural Network for Name Prediction
class NamePredictionML {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.featureNames = [];
        this.nameIndex = {};
        this.indexToName = {};
        this.globalModelLoaded = false;
        this.initializeModel();
    }
    
    /**
     * Load global model from GitHub Releases
     * This allows the model to benefit from aggregated learning across all users
     */
    async loadGlobalModel() {
        const GITHUB_USERNAME = 'char-lotte-anne';
        const REPO_NAME = 'guess-my-name';
        
        try {
            console.log('🔍 Checking for global model from GitHub Releases...');
            
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/releases/latest`
            );
            
            if (!response.ok) {
                console.log('ℹ️  No global model available (this is okay)');
                return false;
            }
            
            const release = await response.json();
            const modelJsonAsset = release.assets.find(a => a.name === 'model.json');
            const weightsAsset = release.assets.find(a => a.name.endsWith('.bin'));
            
            if (modelJsonAsset && weightsAsset) {
                console.log(`📥 Found global model: ${release.tag_name}`);
                const modelJsonUrl = modelJsonAsset.browser_download_url;
                
                // Load the model
                this.model = await tf.loadLayersModel(modelJsonUrl);
                this.isModelLoaded = true;
                this.globalModelLoaded = true;
                
                console.log('✅ Global model loaded successfully!');
                return true;
            } else {
                console.log('ℹ️  Release found but model files missing');
                return false;
            }
        } catch (error) {
            console.log('ℹ️  Could not load global model, will use local model:', error.message);
            return false;
        }
    }

    async initializeModel() {
        try {
            // Create a simple neural network
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
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
        // Convert quiz answers to numerical features for the neural network
        const features = new Array(50).fill(0);
        let featureIndex = 0;

        // Gender encoding (PREFER_NOT_TO_SAY is normalized to NB earlier)
        if (answers.gender) {
            const genderMap = { 'M': 0, 'F': 1, 'NB': 2 };
            features[featureIndex + (genderMap[answers.gender] || 0)] = 1;
        }
        featureIndex += 4;

        // Decade encoding (normalized)
        if (answers.decade) {
            features[featureIndex] = (answers.decade - 1900) / 120; // Normalize to 0-1
        }
        featureIndex += 1;

        // Name length encoding
        if (answers.length) {
            const lengthMap = { 'short': 0, 'medium': 1, 'long': 2 };
            features[featureIndex + (lengthMap[answers.length] || 0)] = 1;
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
            features[featureIndex + (popMap[answers.popularity] || 0)] = 1;
        }
        featureIndex += 3;

        // Political values (multi-hot encoding)
        if (answers.political_values) {
            const politicalValues = Array.isArray(answers.political_values) ? answers.political_values : [answers.political_values];
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
            const languageValues = Array.isArray(answers.language_preference) ? answers.language_preference : [answers.language_preference];
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

        // Add more features as needed...
        // For now, pad the remaining features with zeros
        while (featureIndex < 50) {
            features[featureIndex] = 0;
            featureIndex++;
        }

        return features;
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
        if (!this.isModelLoaded || trainingData.length < 10) {
            return;
        }

        try {
            // Prepare training data
            const features = [];
            const labels = [];
            
            for (const data of trainingData) {
                if (data.success && data.correctGuess) {
                    features.push(this.encodeAnswers(data.answers));
                    
                    // Create one-hot encoded label for the correct name
                    const label = new Array(1000).fill(0);
                    const nameIndex = this.getNameIndex(data.correctGuess.name);
                    if (nameIndex !== -1) {
                        label[nameIndex] = 1;
                    }
                    labels.push(label);
                }
            }
            
            if (features.length === 0) {
                return;
            }
            
            const xs = tf.tensor2d(features);
            const ys = tf.tensor2d(labels);
            
            // Train the model
            await this.model.fit(xs, ys, {
                epochs: 50,
                batchSize: 32,
                validationSplit: 0.2,
                verbose: 0
            });
            
            xs.dispose();
            ys.dispose();
        } catch (error) {
            console.error('Error training neural network:', error);
        }
    }

    getNameIndex(name) {
        // Simple hash-based name indexing
        if (!this.nameIndex[name]) {
            const index = Object.keys(this.nameIndex).length;
            this.nameIndex[name] = index;
            this.indexToName[index] = name;
        }
        return this.nameIndex[name];
    }

    getNameFromIndex(index) {
        // For now, return a simple name based on index
        // In a real implementation, this would map to actual names
        const fallbackNames = [
            'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Sam', 'Jamie', 'Avery', 'Riley', 'Quinn',
            'Dakota', 'Sage', 'River', 'Skyler', 'Phoenix', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley'
        ];
        return fallbackNames[index % fallbackNames.length] || 'Unknown';
    }
}

// Name Guessing Quiz Logic
class NameGuessingQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.realName = null; // Store user's real name for training
        this.selectedCountries = []; // Store selected countries for world map
        this.selectedContinents = []; // Store selected continents
        this.selectedState = null; // Store selected state
        // Comprehensive country-to-continent mapping based on world-map.svg
        // Using lowercase to match SVG IDs directly
        this.continentToCountries = {
            'north-america': ['us', 'ca', 'mx', 'gl'],
            'central-america': ['gt', 'bz', 'sv', 'hn', 'ni', 'cr', 'pa', 'cu', 'jm', 'ht', 'do', 'pr', 'bs', 'tt', 'bb', 'gd', 'lc', 'vc', 'ag', 'kn', 'dm', 'ms', 'tc', 'ky', 'aw', 'bq', 'cw', 'bl', 'mq', 'gp', 'vi', 'vg', 'ai', 'mf'],
            'south-america': ['ar', 'bo', 'br', 'cl', 'co', 'ec', 'fk', 'gf', 'gy', 'py', 'pe', 'sr', 'uy', 've'],
            'europe': ['ad', 'al', 'am', 'at', 'by', 'be', 'ba', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'ge', 'gr', 'hu', 'is', 'ie', 'it', 'xk', 'lv', 'li', 'lt', 'lu', 'mk', 'mt', 'md', 'mc', 'me', 'nl', 'no', 'pl', 'pt', 'ro', 'sm', 'rs', 'sk', 'si', 'es', 'se', 'ch', 'ua', 'gb', 'va'],
            'africa': ['dz', 'ao', 'bw', 'bi', 'cm', 'cv', 'cf', 'td', 'km', 'cg', 'cd', 'dj', 'eg', 'gq', 'er', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ci', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'rw', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'ss', 'sd', 'sz', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw', 'bf', 'bj', 'eh'],
            'asia': ['af', 'az', 'bh', 'bd', 'bt', 'bn', 'kh', 'cn', 'in', 'id', 'ir', 'iq', 'il', 'jp', 'jo', 'kz', 'kw', 'kg', 'la', 'lb', 'my', 'mv', 'mn', 'mm', 'np', 'kp', 'om', 'pk', 'ps', 'ph', 'qa', 'sa', 'sg', 'kr', 'lk', 'sy', 'tw', 'tj', 'th', 'tl', 'tr', 'tm', 'ae', 'uz', 'vn', 'ye', 'ru'],
            'oceania': ['au', 'fj', 'ki', 'mh', 'fm', 'nr', 'nz', 'pw', 'pg', 'ws', 'sb', 'to', 'tv', 'vu', 'nc']
        };
        this.enhancedNameDatabase = new EnhancedNameDatabase();
        this.mlModel = new NamePredictionML();
        this.questions = [
            {
                text: "What's your gender identity?",
                type: "multi_select",
                options: [
                    { text: "👨 Male", value: "M" },
                    { text: "👩 Female", value: "F" },
                    { text: "😎 Non-binary", value: "NB" },
                    { text: "🤐 Prefer not to say", value: "PREFER_NOT_TO_SAY" }
                ],
                key: "gender"
            },
            {
                text: "What decade were you born in?",
                type: "slider",
                min: 1900,
                max: 2020,
                step: 10,
                default: 1960,
                labels: ["📜 1900s", "🎵 1950s", "🌈 2000s", "✨ 2020s"],
                key: "decade"
            },
            {
                text: "What state were you born in?",
                type: "map",
                key: "state"
            },
            {
                text: "How many letters are in your first name?",
                type: "slider",
                min: 1,
                max: 4,
                step: 1,
                default: 2,
                labels: ["⚡ Short (2-4)", "💫 Medium (5-6)", "🌟 Long (7-9)", "✨ Extra Long (10+)"],
                key: "length"
            },
            {
                text: "Does your name start with a vowel?",
                options: [
                    { text: "✅ Yes (A, E, I, O, U)", value: "vowel" },
                    { text: "❌ No", value: "consonant" }
                ],
                key: "starts_with"
            },
            {
                text: "How popular is your name?",
                type: "slider",
                min: 1,
                max: 3,
                step: 1,
                default: 2,
                labels: ["✨ Uncommon/unique", "💫 Somewhat popular", "🔥 Very popular"],
                key: "popularity"
            },
            {
                text: "What political values matter most to you?",
                type: "multi_select",
                options: [
                    { text: "🏛️ Traditional values and heritage", value: "traditional" },
                    { text: "🌍 Diversity and inclusion", value: "diverse" },
                    { text: "🏡 Community and family", value: "community" },
                    { text: "🚀 Innovation and progress", value: "progressive" },
                    { text: "⚖️ Justice and equality", value: "justice" },
                    { text: "🛡️ Security and stability", value: "security" },
                    { text: "🌱 Environmental protection", value: "environment" },
                    { text: "💼 Economic opportunity", value: "economic" },
                    { text: "🎓 Education and learning", value: "education" },
                    { text: "🤝 Cooperation and unity", value: "cooperation" }
                ],
                key: "political_values"
            },
            {
                text: "What languages do you speak or value?",
                type: "multi_select",
                options: [
                    { text: "🇺🇸 English only", value: "english_only" },
                    { text: "🇪🇸 Spanish", value: "spanish" },
                    { text: "🇨🇳 Chinese (Mandarin/Cantonese)", value: "chinese" },
                    { text: "🇵🇭 Filipino/Tagalog", value: "filipino" },
                    { text: "🇻🇳 Vietnamese", value: "vietnamese" },
                    { text: "🇰🇷 Korean", value: "korean" },
                    { text: "🇯🇵 Japanese", value: "japanese" },
                    { text: "🇮🇳 Hindi/Urdu", value: "hindi" },
                    { text: "🇦🇪 Arabic", value: "arabic" },
                    { text: "🇮🇱 Hebrew", value: "hebrew" },
                    { text: "🇫🇷 French", value: "french" },
                    { text: "🇩🇪 German", value: "german" },
                    { text: "🇮🇹 Italian", value: "italian" },
                    { text: "🇷🇺 Russian/Slavic", value: "russian" },
                    { text: "🇵🇱 Polish", value: "polish" },
                    { text: "🇬🇷 Greek", value: "greek" },
                    { text: "🇮🇪 Irish/Gaelic", value: "irish" },
                    { text: "🇳🇴 Scandinavian/Norse", value: "scandinavian" },
                    { text: "🇳🇬 Nigerian/Yoruba", value: "yoruba" },
                    { text: "🇪🇹 Amharic", value: "amharic" },
                    { text: "🇭🇹 Haitian Creole", value: "haitian_creole" },
                    { text: "🇵🇷 Portuguese", value: "portuguese" },
                    { text: "🏳️ Other ", value: "other" },
                ],
                key: "language_preference"
            },
            {
                text: "What type of community do you prefer?",
                type: "multi_select",
                options: [
                    { text: "🏘️ Small town or rural", value: "rural" },
                    { text: "🏙️ Urban city center", value: "urban" },
                    { text: "🌳 Suburban neighborhood", value: "suburban" },
                    { text: "🏖️ Coastal community", value: "coastal" },
                    { text: "🏔️ Mountain region", value: "mountain" },
                    { text: "🌾 Agricultural area", value: "agricultural" },
                    { text: "🎓 College town", value: "college" },
                    { text: "🏭 Industrial city", value: "industrial" },
                    { text: "🎨 Arts district", value: "arts" },
                    { text: "🌍 International community", value: "international" },
                    { text: "🏡 Gated community", value: "gated" },
                    { text: "🚶‍♀️ Walkable downtown", value: "walkable" }
                ],
                key: "community_type"
            },
            {
                text: "Where did you grow up?",
                type: "multi_select",
                options: [
                    { text: "🏘️ Rural area or small town", value: "rural_grew_up" },
                    { text: "🏙️ Urban city", value: "urban_grew_up" },
                    { text: "🌳 Suburban area", value: "suburban_grew_up" },
                    { text: "🏖️ Coastal region", value: "coastal_grew_up" },
                    { text: "🏔️ Mountain region", value: "mountain_grew_up" },
                    { text: "🌾 Farm or agricultural area", value: "agricultural_grew_up" },
                    { text: "🎓 College town", value: "college_grew_up" },
                    { text: "🏭 Industrial city", value: "industrial_grew_up" },
                    { text: "🌍 International city", value: "international_grew_up" },
                    { text: "🏡 Gated community", value: "gated_grew_up" }
                ],
                key: "grew_up_location"
            },
            {
                text: "How important is family tradition to you?",
                type: "slider",
                min: 1,
                max: 3,
                step: 0.1,
                default: 2,
                labels: ["🆕 Create new traditions", "⚖️ Mix old and new", "🏛️ Honor family heritage"],
                key: "family_tradition"
            },
            {
                text: "How do you view cultural diversity?",
                type: "slider",
                min: 1,
                max: 3,
                step: 0.1,
                default: 2,
                labels: ["🏛️ Preserve traditions", "⚖️ Balance both", "🌍 Embrace diversity"],
                key: "diversity_attitude"
            },
            {
                text: "What type of name meaning appeals to you most?",
                type: "multi_select",
                options: [
                    { text: "👑 Royal or noble meaning", value: "royal" },
                    { text: "🌿 Nature-inspired", value: "nature" },
                    { text: "⚔️ Warrior or strength", value: "warrior" },
                    { text: "🌟 Light or brightness", value: "light" },
                    { text: "❤️ Love or compassion", value: "love" },
                    { text: "🧠 Wisdom or knowledge", value: "wisdom" },
                    { text: "🎵 Music or harmony", value: "music" },
                    { text: "🌊 Water or flow", value: "water" },
                    { text: "🔥 Fire or energy", value: "fire" },
                    { text: "🌙 Moon or night", value: "moon" },
                    { text: "☀️ Sun or day", value: "sun" },
                    { text: "🕊️ Peace or freedom", value: "peace" },
                    { text: "🎭 Creative or artistic", value: "creative" },
                    { text: "🤷 Sounds good", value: "sound" },
                ],
                key: "name_meaning_preference"
            },
            {
                text: "How do people typically perceive your name?",
                type: "multi_select",
                options: [
                    { text: "👑 Elegant and sophisticated", value: "elegant" },
                    { text: "💪 Strong and powerful", value: "strong" },
                    { text: "😊 Friendly and approachable", value: "friendly" },
                    { text: "🧠 Intelligent and scholarly", value: "intelligent" },
                    { text: "🎨 Creative and artistic", value: "creative_perceived" },
                    { text: "🌟 Unique and memorable", value: "unique" },
                    { text: "🏛️ Traditional and classic", value: "traditional_perceived" },
                    { text: "🚀 Modern and trendy", value: "modern" },
                    { text: "🌿 Natural and earthy", value: "natural" },
                    { text: "🤝 Trustworthy and reliable", value: "trustworthy" }
                ],
                key: "name_perception"
            },
            {
                text: "What impression do you want your name to give?",
                type: "multi_select",
                options: [
                    { text: "👑 Authority and leadership", value: "authority" },
                    { text: "💪 Strength and confidence", value: "strength_desired" },
                    { text: "😊 Warmth and kindness", value: "warmth" },
                    { text: "🧠 Intelligence and wisdom", value: "intelligence_desired" },
                    { text: "🎨 Creativity and expressiveness", value: "creativity_desired" },
                    { text: "🌟 Uniqueness and distinction", value: "uniqueness_desired" },
                    { text: "🏛️ Tradition and heritage", value: "tradition_desired" },
                    { text: "🌿 Connection to nature", value: "nature_connection" },
                ],
                key: "desired_impression"
            },
            {
                text: "How do people typically react when they hear your name?",
                type: "multi_select",
                options: [
                    { text: "😍 They love it and compliment it", value: "loved" },
                    { text: "🤔 They ask how to spell it", value: "spelling_questions" },
                    { text: "😊 They smile and remember it easily", value: "memorable" },
                    { text: "🤷 They're neutral about it", value: "neutral" },
                    { text: "😅 They make jokes or puns about it", value: "jokes" },
                    { text: "🤝 They find it trustworthy", value: "trustworthy_reaction" },
                    { text: "👵 They view it as old-fashioned", value: "old_fashioned" },
                    { text: "🎨 They comment on its uniqueness", value: "unique_reaction" },
                    { text: "🏛️ They recognize it as traditional", value: "traditional_reaction" },
                    { text: "🚀 They see it as modern/trendy", value: "modern_reaction" },
                    { text: "🌍 They ask about its origin", value: "origin_questions" },
                    { text: "💪 They find it strong/powerful", value: "strong_reaction" }
                ],
                key: "name_reactions"
            },
            {
                text: "What's your favorite letter of the alphabet?",
                options: [
                    { text: "A - First and foremost", value: "A" },
                    { text: "B - Bold and brave", value: "B" },
                    { text: "C - Creative and clever", value: "C" },
                    { text: "D - Determined and driven", value: "D" },
                    { text: "E - Energetic and exciting", value: "E" },
                    { text: "F - Friendly and fun", value: "F" },
                    { text: "G - Great and genuine", value: "G" },
                    { text: "H - Happy and helpful", value: "H" },
                    { text: "I - Intelligent and inspiring", value: "I" },
                    { text: "J - Joyful and just", value: "J" },
                    { text: "K - Kind and keen", value: "K" },
                    { text: "L - Loyal and loving", value: "L" },
                    { text: "M - Magnificent and mighty", value: "M" },
                    { text: "N - Noble and nice", value: "N" },
                    { text: "O - Outstanding and optimistic", value: "O" },
                    { text: "P - Positive and powerful", value: "P" },
                    { text: "Q - Quick and quirky", value: "Q" },
                    { text: "R - Reliable and radiant", value: "R" },
                    { text: "S - Smart and strong", value: "S" },
                    { text: "T - Talented and trustworthy", value: "T" },
                    { text: "U - Unique and understanding", value: "U" },
                    { text: "V - Vibrant and valuable", value: "V" },
                    { text: "W - Wise and wonderful", value: "W" },
                    { text: "X - eXtraordinary and eXceptional", value: "X" },
                    { text: "Y - Young and yearning", value: "Y" },
                    { text: "Z - Zealous and zesty", value: "Z" }
                ],
                key: "favorite_letter"
            },
            {
                text: "What career paths interest you?",
                type: "multi_select",
                options: [
                    { text: "⚖️ Law and justice", value: "legal" },
                    { text: "🏥 Medicine and healing", value: "medical" },
                    { text: "🎨 Arts and creativity", value: "arts" },
                    { text: "💼 Business and finance", value: "business" },
                    { text: "🔬 Science and research", value: "science" },
                    { text: "👨‍🏫 Education and teaching", value: "education" },
                    { text: "🎵 Music and entertainment", value: "entertainment" },
                    { text: "🌱 Environment and nature", value: "environment" },
                    { text: "💻 Technology and programming", value: "technology" },
                    { text: "🏗️ Engineering and construction", value: "engineering" },
                    { text: "👮‍♀️ Public service and safety", value: "public_service" },
                    { text: "🍳 Culinary and hospitality", value: "culinary" },
                    { text: "✈️ Travel and tourism", value: "travel" },
                    { text: "📚 Writing and journalism", value: "writing" },
                    { text: "🏃‍♀️ Sports and fitness", value: "sports" },
                    { text: "🎭 Theater and performance", value: "theater" },
                    { text: "🔧 Skilled trades and crafts", value: "trades" },
                    { text: "💡 Entrepreneurship and innovation", value: "entrepreneurship" },
                    { text: "🎬 Film and media", value: "film" },
                    { text: "🏠 Real estate", value: "real_estate" },
                    { text: "🎨 Design and fashion", value: "design" }
                ],
                key: "career_path"
            },
            {
                text: "What religious ceremonies were you part of as a child?",
                type: "multi_select",
                options: [
                    { text: "✝️ Christian baptism", value: "christian_baptized" },
                    { text: "✡️ Jewish naming ceremony", value: "jewish_naming" },
                    { text: "🕉️ Hindu naming ceremony", value: "hindu_naming" },
                    { text: "☪️ Islamic naming ceremony", value: "islamic_naming" },
                    { text: "☸️ Buddhist naming ceremony", value: "buddhist_naming" },
                    { text: "🕯️ Sikh naming ceremony", value: "sikh_naming" },
                    { text: "🌿 Other religious ceremony", value: "other_ceremony" },
                    { text: "❌ No religious ceremonies", value: "none" },
                    { text: "🤷 I'm not sure", value: "unsure" },
                    { text: "🚫 I prefer not to say", value: "prefer_not_to_say" }
                ],
                key: "baptism_status"
            },
            {
                text: "What religious or spiritual traditions does your family follow?",
                type: "multi_select",
                options: [
                    { text: "✝️ Christianity", value: "christianity" },
                    { text: "☪️ Islam", value: "islam" },
                    { text: "✡️ Judaism", value: "judaism" },
                    { text: "🕉️ Hinduism", value: "hinduism" },
                    { text: "☸️ Buddhism", value: "buddhism" },
                    { text: "🕯️ Sikhism", value: "sikhism" },
                    { text: "🏛️ Greek/Roman Mythology", value: "greek" },
                    { text: "⚡ Norse/Scandinavian", value: "norse" },
                    { text: "🍀 Celtic/Irish", value: "celtic" },
                    { text: "🌍 Other spiritual tradition", value: "other_spiritual" },
                    { text: "🚫 No religious affiliation", value: "none" },
                    { text: "🤐 Prefer not to say", value: "prefer_not_to_say" }
                ],
                key: "religious_tradition"
            },
            {
                text: "What continents does your family come from? (Select all that apply)",
                type: "continent_selection",
                key: "cultural_background"
            }
        ];
        
        this.nameData = {};
        this.loadNameData();
        this.initializeEventListeners();
    }

    async loadNameData() {
        try {
            // Use the enhanced name database
            this.nameData = await this.enhancedNameDatabase.loadEnhancedNameData();
        } catch (error) {
            console.error('Error loading enhanced name data:', error);
            // Fallback to a simple name list
            this.nameData = this.getFallbackNames();
        }
    }

    getFallbackNames() {
        return {
            'olivia_f': { name: 'Olivia', gender: 'F', totalCount: 1000, popularity: 'very_popular' },
            'emma_f': { name: 'Emma', gender: 'F', totalCount: 950, popularity: 'very_popular' },
            'charlotte_f': { name: 'Charlotte', gender: 'F', totalCount: 900, popularity: 'very_popular' },
            'amelia_f': { name: 'Amelia', gender: 'F', totalCount: 850, popularity: 'very_popular' },
            'sophia_f': { name: 'Sophia', gender: 'F', totalCount: 800, popularity: 'very_popular' },
            'mia_f': { name: 'Mia', gender: 'F', totalCount: 750, popularity: 'popular' },
            'isabella_f': { name: 'Isabella', gender: 'F', totalCount: 700, popularity: 'popular' },
            'evelyn_f': { name: 'Evelyn', gender: 'F', totalCount: 650, popularity: 'popular' },
            'ava_f': { name: 'Ava', gender: 'F', totalCount: 600, popularity: 'popular' },
            'luna_f': { name: 'Luna', gender: 'F', totalCount: 550, popularity: 'popular' },
            'liam_m': { name: 'Liam', gender: 'M', totalCount: 1000, popularity: 'very_popular' },
            'noah_m': { name: 'Noah', gender: 'M', totalCount: 950, popularity: 'very_popular' },
            'oliver_m': { name: 'Oliver', gender: 'M', totalCount: 900, popularity: 'very_popular' },
            'james_m': { name: 'James', gender: 'M', totalCount: 850, popularity: 'very_popular' },
            'elijah_m': { name: 'Elijah', gender: 'M', totalCount: 800, popularity: 'very_popular' },
            'william_m': { name: 'William', gender: 'M', totalCount: 750, popularity: 'popular' },
            'henry_m': { name: 'Henry', gender: 'M', totalCount: 700, popularity: 'popular' },
            'lucas_m': { name: 'Lucas', gender: 'M', totalCount: 650, popularity: 'popular' },
            'benjamin_m': { name: 'Benjamin', gender: 'M', totalCount: 600, popularity: 'popular' },
            'theodore_m': { name: 'Theodore', gender: 'M', totalCount: 550, popularity: 'popular' }
        };
    }

    initializeEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startQuiz());
        document.getElementById('correctBtn').addEventListener('click', () => this.handleCorrect());
        document.getElementById('wrongBtn').addEventListener('click', () => this.handleWrong());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetQuiz());
        document.getElementById('nameSubmitBtn').addEventListener('click', () => this.handleNameSubmit());
        
        // Allow Enter key to submit name
        document.getElementById('realNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameSubmit();
            }
        });
        
        // Add navigation event listeners
        document.querySelectorAll('.nav-link, .nav-brand-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href === '#home') {
                    this.showHome();
                } else if (href === '#how-it-works') {
                    this.showHowItWorks();
                } else if (href === '#about') {
                    this.showAbout();
                } else if (href === '#contact') {
                    this.showContact();
                }
            });
        });
    }

    startQuiz() {
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('quizSection').style.display = 'block';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        this.showQuestion();
        
        // Update browser history for first question
        history.pushState({page: 'quiz', question: 0}, '', '#quiz-0');
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        if (!question) {
            console.error('Question not found at index:', this.currentQuestion);
            return;
        }
        document.getElementById('questionText').textContent = question.text;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        // Hide map by default, will be shown if needed
        const isMapQuestion = question.type === 'map' || question.type === 'continent_selection' || question.type === 'world_map';
        if (!isMapQuestion) {
            this.hideMap();
        }
        
        if (question.type === 'slider') {
            this.createSlider(question, optionsContainer);
        } else if (question.type === 'map') {
            this.createMap();
        } else if (question.type === 'continent_selection') {
            this.createContinentSelection();
        } else if (question.type === 'world_map') {
            this.createWorldMap();
        } else if (question.type === 'multi_select') {
            this.createMultiSelect(question, optionsContainer);
        } else {
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option.text;
                button.addEventListener('click', () => this.selectAnswer(option.value));
                optionsContainer.appendChild(button);
            });
        }
        
        this.updateProgress();
    }

    createSlider(question, container) {
        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = question.min;
        slider.max = question.max;
        slider.step = question.step;
        slider.value = question.default;
        slider.className = 'slider';
        slider.id = `slider-${question.key}`;
        
        // Create value display
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = this.getSliderLabel(question, question.default);
        
        // Create labels container
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'slider-labels';
        
        // Use consistent absolute positioning for all sliders
        if (question.labels && question.labels.length > 0) {
            labelsContainer.style.position = 'relative';
            labelsContainer.style.minHeight = '30px';
            
            // Special handling for decade slider to align with actual years
            if (question.key === 'decade') {
                const decadeYears = [
                    { label: "🚂1900", year: 1900 },
                    { label: "🪖1930", year: 1930 },
                    { label: "🌈1960", year: 1960 },
                    { label: "🛹1990", year: 1990 },
                    { label: "📱2020", year: 2020 }
                ];
                decadeYears.forEach((item) => {
                    const labelElement = document.createElement('div');
                    labelElement.className = 'slider-label';
                    labelElement.textContent = item.label;
                    labelElement.style.position = 'absolute';
                    labelElement.style.transform = 'translateX(-50%)';
                    labelElement.style.whiteSpace = 'nowrap';
                    labelElement.style.textAlign = 'center';
                    
                    // Calculate position based on actual year values
                    const position = ((item.year - question.min) / (question.max - question.min)) * 100;
                    labelElement.style.left = `${position}%`;
                    labelElement.style.top = '0';
                    
                    labelsContainer.appendChild(labelElement);
                });
            } else {
                // Standard positioning for other sliders
                question.labels.forEach((label, index) => {
                    const labelElement = document.createElement('div');
                    labelElement.className = 'slider-label';
                    labelElement.textContent = label;
                    labelElement.style.position = 'absolute';
                    labelElement.style.transform = 'translateX(-50%)';
                    labelElement.style.whiteSpace = 'nowrap';
                    labelElement.style.textAlign = 'center';
                    
                    // Calculate position based on slider range
                    const position = (index / (question.labels.length - 1)) * 100;
                    labelElement.style.left = `${position}%`;
                    labelElement.style.top = '0';
                    
                    labelsContainer.appendChild(labelElement);
                });
            }
        }
        
        // Create continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'slider-continue-btn';
        continueBtn.textContent = 'Continue';
        continueBtn.addEventListener('click', () => {
            const value = this.getSliderValue(question, parseInt(slider.value));
            this.selectAnswer(value);
        });
        
        // Update value display when slider changes
        slider.addEventListener('input', () => {
            valueDisplay.textContent = this.getSliderLabel(question, parseInt(slider.value));
        });
        
        // Handle slider completion
        // Remove auto-advance on slider change - only allow Continue button
        
        // Remove auto-submit timer - let users control when to submit
        
        sliderContainer.appendChild(valueDisplay);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(labelsContainer);
        sliderContainer.appendChild(continueBtn);
        container.appendChild(sliderContainer);
    }

    getSliderLabel(question, value) {
        if (question.key === 'length') {
            if (value <= 1.5) return '⚡ Short (2-4 letters)';
            if (value <= 2.5) return '💫 Medium (5-6 letters)';
            if (value <= 3.5) return '🌟 Long (7-9 letters)';
            return '✨ Extra Long (10+ letters)';
        } else if (question.key === 'popularity') {
            return question.labels[value - 1];
        } else if (question.key === 'family_tradition' || question.key === 'diversity_attitude') {
            // Map value (1-3) to label index
            if (value <= 1.5) return question.labels[0];
            if (value <= 2.5) return question.labels[1];
            return question.labels[2];
        }
        return value;
    }

    getSliderValue(question, value) {
        if (question.key === 'length') {
            if (value <= 1.5) return 'short';
            if (value <= 2.5) return 'medium';
            if (value <= 3.5) return 'long';
            return 'extra_long';
        } else if (question.key === 'popularity') {
            const values = ['uncommon', 'popular', 'very_popular'];
            return values[value - 1];
        }
        return value;
    }

    createMultiSelect(question, container) {
        // Create multi-select container
        const multiSelectContainer = document.createElement('div');
        multiSelectContainer.className = 'multi-select-container';
        
        // Create instruction text
        const instructionText = document.createElement('p');
        instructionText.className = 'multi-select-instruction';
        instructionText.textContent = 'Select all that apply:';
        instructionText.style.cssText = `
            color: #FFD700;
            font-size: 16px;
            margin-bottom: 15px;
            text-align: center;
            font-weight: 600;
        `;
        multiSelectContainer.appendChild(instructionText);
        
        // Create options grid
        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'multi-select-grid';
        optionsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        `;
        
        // Store selected values
        const selectedValues = new Set();
        
        // Create option buttons
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'multi-select-option';
            button.textContent = option.text;
            button.dataset.value = option.value;
            button.style.cssText = `
                padding: 15px 20px;
                background: linear-gradient(145deg, #4A148C, #7B1FA2);
                border: 2px solid #FFD700;
                color: white;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Bohemian Typewriter', monospace;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.3s ease;
                text-align: center;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
            `;
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('selected')) {
                    button.style.background = 'linear-gradient(145deg, #7B1FA2, #9C27B0)';
                    button.style.borderColor = '#FFFFFF';
                    button.style.transform = 'scale(1.05)';
                    button.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (!button.classList.contains('selected')) {
                    button.style.background = 'linear-gradient(145deg, #4A148C, #7B1FA2)';
                    button.style.borderColor = '#FFD700';
                    button.style.transform = 'scale(1)';
                    button.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.3)';
                }
            });
            
            // Add click handler
            button.addEventListener('click', () => {
                if (button.classList.contains('selected')) {
                    // Deselect
                    button.classList.remove('selected');
                    button.style.background = 'linear-gradient(145deg, #4A148C, #7B1FA2)';
                    button.style.borderColor = '#FFD700';
                    button.style.transform = 'scale(1)';
                    button.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.3)';
                    button.style.filter = 'none';
                    selectedValues.delete(option.value);
                } else {
                    // Select
                    button.classList.add('selected');
                    button.style.background = 'linear-gradient(145deg, #FFD700, #FFA500)';
                    button.style.borderColor = '#FFFFFF';
                    button.style.transform = 'scale(1.05)';
                    button.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.8)';
                    button.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                    selectedValues.add(option.value);
                }
                
                // Update continue button visibility
                this.updateMultiSelectContinueButton(continueBtn, selectedValues.size > 0);
            });
            
            optionsGrid.appendChild(button);
        });
        
        // Create continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'multi-select-continue-btn';
        continueBtn.textContent = 'Continue';
        continueBtn.style.cssText = `
            padding: 12px 24px;
            background: linear-gradient(145deg, #1A0033, #4A148C);
            border: 2px solid #FFD700;
            color: #FFD700;
            border-radius: 25px;
            cursor: pointer;
            font-family: 'Great Warrior', sans-serif;
            font-size: 1rem;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: all 0.3s ease;
            margin: 20px auto 0;
            display: block;
            opacity: 0.5;
            pointer-events: none;
            box-shadow: 0 6px 15px rgba(138, 43, 226, 0.4);
        `;
        
        // Initially disabled
        this.updateMultiSelectContinueButton(continueBtn, false);
        
        // Add continue button click handler
        continueBtn.addEventListener('click', () => {
            if (selectedValues.size > 0) {
                this.selectAnswer(Array.from(selectedValues));
            }
        });
        
        multiSelectContainer.appendChild(optionsGrid);
        multiSelectContainer.appendChild(continueBtn);
        container.appendChild(multiSelectContainer);
    }
    
    updateMultiSelectContinueButton(button, enabled) {
        if (enabled) {
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            button.style.background = 'linear-gradient(145deg, #1A0033, #4A148C)';
            button.style.borderColor = '#FFD700';
            button.style.color = '#FFD700';
            button.style.boxShadow = '0 6px 15px rgba(138, 43, 226, 0.4)';
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.background = 'linear-gradient(145deg, #4A148C, #6A1B9A)';
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 8px 20px rgba(138, 43, 226, 0.6), 0 0 30px rgba(255, 215, 0, 0.5)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'linear-gradient(145deg, #1A0033, #4A148C)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 6px 15px rgba(138, 43, 226, 0.4)';
            });
        } else {
            button.style.opacity = '0.5';
            button.style.pointerEvents = 'none';
            button.style.background = 'linear-gradient(145deg, #0A001A, #2A0A4C)';
            button.style.borderColor = '#666';
            button.style.color = '#999';
            button.style.boxShadow = '0 2px 8px rgba(138, 43, 226, 0.1)';
            button.style.transform = 'translateY(0)';
        }
    }

    createMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
          console.error("Map container not found!");
          return;
        }
      
         mapContainer.style.display = 'block';
         mapContainer.innerHTML = '<div id="continueContainer"></div>';
      
        fetch('us.svg')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
          })
          .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
      
            svgElement.classList.add('us-map');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '800px';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
      
            svgElement.querySelectorAll('path').forEach(path => {
               path.classList.add('state-path');
               
               // Add golden styling
               path.style.fill = 'rgba(255, 215, 0, 0.1)';
               path.style.stroke = '#FFD700';
               path.style.strokeWidth = '1.5';
               path.style.cursor = 'pointer';
               path.style.transition = 'all 0.3s ease';
               
               // Add hover effects
               path.addEventListener('mouseenter', () => {
                 path.style.fill = 'rgba(255, 215, 0, 0.4)';
                 path.style.stroke = '#FFFFFF';
                 path.style.strokeWidth = '2.5';
                 path.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                 // Removed scale transform
               });
               
               path.addEventListener('mouseleave', () => {
                 if (!path.classList.contains('selected')) {
                   path.style.fill = 'rgba(255, 215, 0, 0.1)';
                   path.style.stroke = '#FFD700';
                   path.style.strokeWidth = '1.5';
                   path.style.filter = 'none';
                   // Removed scale transform
                 }
               });
               
               path.addEventListener('click', () => {
                 svgElement.querySelectorAll('.state-path').forEach(p => {
                   p.classList.remove('selected');
                   p.style.fill = 'rgba(255, 215, 0, 0.1)';
                   p.style.stroke = '#FFD700';
                   p.style.strokeWidth = '1.5';
                   p.style.filter = 'none';
                   // Removed scale transform
                 });
                 
                 path.classList.add('selected');
                 path.style.fill = 'rgba(255, 215, 0, 0.7)';
                 path.style.stroke = '#FFA500';
                 path.style.strokeWidth = '3';
                 path.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                 
                 const stateId = path.id || path.getAttribute('name');
                 
                 // Store the selected state
                 this.selectedState = stateId;
                 
                 // Show continue button using existing system
                 this.showMapContinueButton();
               });
             });
      
            mapContainer.appendChild(svgElement);
          })
          .catch(err => console.error("Error loading map:", err));
       }

    createWorldMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
          console.error("Map container not found!");
          return;
        }
      
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        // Initialize selected countries array
        this.selectedCountries = [];
      
        fetch('../assets/world-map/world-map.svg')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return response.text();
          })
          .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
      
            svgElement.classList.add('world-map');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '1000px';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
      
            svgElement.querySelectorAll('path').forEach(path => {
               path.classList.add('country-path');
               
               // Add golden styling
               path.style.fill = 'rgba(255, 215, 0, 0.1)';
               path.style.stroke = '#FFD700';
               path.style.strokeWidth = '1';
               path.style.cursor = 'pointer';
               path.style.transition = 'all 0.3s ease';
               
               // Add hover effects
               path.addEventListener('mouseenter', () => {
                 if (!path.classList.contains('selected')) {
                   path.style.fill = 'rgba(255, 215, 0, 0.4)';
                   path.style.stroke = '#FFFFFF';
                   path.style.strokeWidth = '2';
                   path.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))';
                 }
               });
               
               path.addEventListener('mouseleave', () => {
                 if (!path.classList.contains('selected')) {
                   path.style.fill = 'rgba(255, 215, 0, 0.1)';
                   path.style.stroke = '#FFD700';
                   path.style.strokeWidth = '1';
                   path.style.filter = 'none';
                 }
               });
               
               path.addEventListener('click', () => {
                 const countryId = path.id || path.getAttribute('name') || path.getAttribute('data-name');
                 
                 if (path.classList.contains('selected')) {
                   // Deselect country
                   path.classList.remove('selected');
                   path.style.fill = 'rgba(255, 215, 0, 0.1)';
                   path.style.stroke = '#FFD700';
                   path.style.strokeWidth = '1';
                   path.style.filter = 'none';
                   
                   // Remove from selected countries
                   this.selectedCountries = this.selectedCountries.filter(c => c !== countryId);
                 } else {
                   // Select country
                   path.classList.add('selected');
                   path.style.fill = 'rgba(255, 215, 0, 0.7)';
                   path.style.stroke = '#FFA500';
                   path.style.strokeWidth = '2.5';
                   path.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                   
                   // Add to selected countries
                   this.selectedCountries.push(countryId);
                 }
                 
                 // Show continue button if any countries are selected
                 if (this.selectedCountries.length > 0) {
                   this.showWorldMapContinueButton();
                 } else {
                   this.hideWorldMapContinueButton();
                 }
               });
             });
      
            mapContainer.appendChild(svgElement);
          })
          .catch(err => {
            console.error("Error loading world map:", err);
            // Show user-friendly error message
            const mapContainer = document.getElementById('mapContainer');
            if (mapContainer) {
              mapContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #FFD700;">
                  <h3>🗺️ World Map Loading Error</h3>
                  <p>Unable to load the world map. Please refresh the page and try again.</p>
                  <p style="font-size: 0.9em; color: #ccc;">Error: ${err.message}</p>
                </div>
              `;
            }
          });
       }

    showWorldMapContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer && !continueContainer.querySelector('.slider-continue-btn')) {
            // Use the same continue button system as sliders
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = `Continue (${this.selectedCountries.length} selected)`;
            continueBtn.addEventListener('click', () => {
                this.selectAnswer(this.selectedCountries);
            });
            continueContainer.appendChild(continueBtn);
        } else if (continueContainer && continueContainer.querySelector('.slider-continue-btn')) {
            // Update existing button text
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            existingBtn.textContent = `Continue (${this.selectedCountries.length} selected)`;
        }
    }

    hideWorldMapContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    }

    createContinentSelection() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error("Map container not found!");
            return;
        }
      
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        // Initialize selected continents array
        this.selectedContinents = [];
        this.continentSelectedCountries = {}; // Track which countries are selected per continent
        
        // Create skip button
        this.createSkipButton(mapContainer, () => {
            this.selectAnswer([]); // Skip continent selection
        });
        
        // Load world map for continent selection
        this.createWorldMapForContinentSelection();
    }
    
    getContinentFromCountry(countryId) {
        if (!countryId) return null;
        
        // Normalize country ID (lowercase to match SVG IDs)
        const normalizedId = countryId.toString().toLowerCase().trim();
        
        // Map country codes to continents
        for (const [continent, countries] of Object.entries(this.continentToCountries)) {
            // Check both exact match and if any country code is contained in the ID
            if (countries.includes(normalizedId) || 
                countries.some(code => normalizedId.includes(code) || code.includes(normalizedId))) {
                return continent;
            }
        }
        return null;
    }
    
    createWorldMapForContinentSelection() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            return;
        }
        
        // Don't add extra styling - let it match state map container styling
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        fetch('../assets/world-map/world-map.svg')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return response.text();
          })
          .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
      
            svgElement.classList.add('us-map', 'world-map-continent-selector'); // Use same class as state map + identifier
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '800px';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
      
            // Track which paths belong to which continents
            const continentPaths = {};
            Object.keys(this.continentToCountries).forEach(continent => {
                continentPaths[continent] = [];
            });
            
            // Track hover state to prevent flickering when moving between countries in same continent
            const continentHoverCount = {};
            Object.keys(this.continentToCountries).forEach(continent => {
                continentHoverCount[continent] = 0;
            });
      
            // First pass: collect all paths and their continents
            // Handle both direct path IDs and paths inside groups with country IDs
            const allPaths = [];
            const pathToContinent = new Map();
            
            // Get all groups with country IDs
            svgElement.querySelectorAll('g[id]').forEach(group => {
                const groupId = group.id.toUpperCase().trim();
                if (groupId && !groupId.startsWith('_')) {
                    const continent = this.getContinentFromCountry(groupId);
                    if (continent) {
                        // All paths in this group belong to this continent
                        group.querySelectorAll('path').forEach(path => {
                            allPaths.push(path);
                            pathToContinent.set(path, continent);
                        });
                    }
                }
            });
            
            // Get all paths with direct IDs (not in groups we already processed)
            svgElement.querySelectorAll('path[id]').forEach(path => {
                // Skip if already processed (in a group)
                if (!pathToContinent.has(path)) {
                    allPaths.push(path);
                    
                    let countryId = path.id;
                    
                    // Normalize country ID (uppercase, trim, remove any prefixes)
                    if (countryId) {
                        countryId = countryId.toString().toUpperCase().trim();
                        // Remove underscore prefix if present (e.g., "_somaliland" -> "SOMALILAND")
                        if (countryId.startsWith('_')) {
                            countryId = countryId.substring(1);
                        }
                    }
                    
                    const continent = countryId ? this.getContinentFromCountry(countryId) : null;
                    if (continent) {
                        pathToContinent.set(path, continent);
                    }
                }
            });
            
            // Remove attributes from all paths
            allPaths.forEach(path => {
               path.removeAttribute('fill');
               path.removeAttribute('stroke');
               path.removeAttribute('stroke-width');
               path.removeAttribute('fill-opacity');
               path.removeAttribute('stroke-opacity');
            });
            
            // Second pass: apply styling and event listeners
            allPaths.forEach(path => {
               const continent = pathToContinent.get(path);
               
               // Match state map styling exactly - use same approach as state map
               path.classList.add('state-path');
               
               // Apply exact same styling as state map (matching createMap function)
               // Don't use !important - let CSS handle it, but set inline styles
               path.style.fill = 'rgba(255, 215, 0, 0.1)';
               path.style.stroke = '#FFD700';
               path.style.strokeWidth = '1.5';
               path.style.cursor = continent ? 'pointer' : 'default';
               path.style.transition = 'all 0.3s ease';
               path.style.pointerEvents = 'auto'; // Ensure paths are clickable
               
               if (continent) {
                   path.dataset.continent = continent;
                   continentPaths[continent].push(path);
                   
                   // Add hover effects - highlight all countries in the continent (matching state map hover)
                   path.addEventListener('mouseenter', (e) => {
                     e.stopPropagation();
                     const hoverContinent = path.dataset.continent;
                     if (!this.selectedContinents.includes(hoverContinent)) {
                       // Increment hover count for this continent
                       continentHoverCount[hoverContinent]++;
                       
                       // Only highlight if this is the first country in the continent being hovered
                       if (continentHoverCount[hoverContinent] === 1) {
                         // Highlight all countries in this continent on hover
                         continentPaths[hoverContinent].forEach(p => {
                           if (!p.classList.contains('continent-selected')) {
                             // Use setProperty to ensure styles override CSS
                             p.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                             p.style.setProperty('stroke', '#FFFFFF', 'important');
                             p.style.setProperty('stroke-width', '2.5', 'important');
                             p.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                             p.style.setProperty('transform', 'scale(1.02)', 'important');
                           }
                         });
                       }
                     }
                   });
                   
                   path.addEventListener('mouseleave', (e) => {
                     e.stopPropagation();
                     const hoverContinent = path.dataset.continent;
                     if (!this.selectedContinents.includes(hoverContinent)) {
                       // Decrement hover count for this continent
                       continentHoverCount[hoverContinent] = Math.max(0, continentHoverCount[hoverContinent] - 1);
                       
                       // Only reset if no countries in this continent are being hovered
                       if (continentHoverCount[hoverContinent] === 0) {
                         // Reset all countries in this continent on mouse leave
                         continentPaths[hoverContinent].forEach(p => {
                           if (!p.classList.contains('continent-selected')) {
                             p.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                             p.style.setProperty('stroke', '#FFD700', 'important');
                             p.style.setProperty('stroke-width', '1.5', 'important');
                             p.style.setProperty('filter', 'none', 'important');
                             p.style.setProperty('transform', 'scale(1)', 'important');
                           }
                         });
                       }
                     }
                   });
                   
                   path.addEventListener('click', (e) => {
                     e.stopPropagation();
                     const clickedContinent = path.dataset.continent;
                     
                     if (this.selectedContinents.includes(clickedContinent)) {
                       // Deselect continent - unhighlight all countries in that continent
                       this.selectedContinents = this.selectedContinents.filter(c => c !== clickedContinent);
                       continentPaths[clickedContinent].forEach(p => {
                         p.classList.remove('continent-selected');
                         p.style.fill = 'rgba(255, 215, 0, 0.1)';
                         p.style.stroke = '#FFD700';
                         p.style.strokeWidth = '1.5';
                         p.style.filter = 'none';
                         // Removed scale transform
                       });
                     } else {
                       // Select continent - highlight all countries in that continent (matching state map selected style)
                       this.selectedContinents.push(clickedContinent);
                       continentPaths[clickedContinent].forEach(p => {
                         p.classList.add('continent-selected');
                         p.style.fill = 'rgba(255, 215, 0, 0.7)';
                         p.style.stroke = '#FFA500';
                         p.style.strokeWidth = '3';
                         p.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                       });
                     }
                     
                     // Show continue button if any continents are selected
                     if (this.selectedContinents.length > 0) {
                       this.showContinentSelectionContinueButton();
                     } else {
                       this.hideContinentSelectionContinueButton();
                     }
                   });
               }
             });
      
            mapContainer.appendChild(svgElement);
          })
          .catch(err => {
            console.error("Error loading world map:", err);
            const mapContainer = document.getElementById('mapContainer');
            if (mapContainer) {
              mapContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #FFD700;">
                  <h3>🗺️ World Map Loading Error</h3>
                  <p>Unable to load the world map. Please refresh the page and try again.</p>
                  <p style="font-size: 0.9em; color: #ccc;">Error: ${err.message}</p>
                </div>
              `;
            }
          });
    }
    
    showContinentSelectionContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) return;
        
        let existingBtn = continueContainer.querySelector('.continent-selection-continue-btn');
        if (!existingBtn) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn continent-selection-continue-btn';
            continueBtn.textContent = `Continue (${this.selectedContinents.length} continent${this.selectedContinents.length > 1 ? 's' : ''} selected)`;
            continueBtn.addEventListener('click', () => {
                this.showIndividualContinentQuestions();
            });
            continueContainer.appendChild(continueBtn);
        } else {
            existingBtn.textContent = `Continue (${this.selectedContinents.length} continent${this.selectedContinents.length > 1 ? 's' : ''} selected)`;
        }
    }
    
    hideContinentSelectionContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.continent-selection-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    }
    
    createSkipButton(container, skipCallback) {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) {
            const newContainer = document.createElement('div');
            newContainer.id = 'continueContainer';
            container.appendChild(newContainer);
        }
        
        // Remove existing skip button if any
        const existingSkip = continueContainer.querySelector('.skip-btn');
        if (existingSkip) {
            existingSkip.remove();
        }
        
        const skipBtn = document.createElement('button');
        skipBtn.className = 'slider-continue-btn skip-btn';
        skipBtn.style.marginTop = '10px';
        skipBtn.style.background = 'linear-gradient(145deg, #4A148C, #6A1B9A)';
        skipBtn.textContent = '⏭️ Skip';
        skipBtn.addEventListener('click', skipCallback);
        
        continueContainer.appendChild(skipBtn);
    }
    
    showIndividualContinentQuestions() {
        // Store continent selection
        this.answers.cultural_background = this.selectedContinents;
        
        // Show first continent question
        if (this.selectedContinents.length > 0) {
            this.currentContinentIndex = 0;
            this.showContinentCountryQuestion(this.selectedContinents[0]);
        } else {
            // No continents selected, move to next question
            this.hideMap();
            document.getElementById('characterThinking').style.display = 'block';
            setTimeout(() => {
                this.currentQuestion++;
                if (this.currentQuestion < this.questions.length) {
                    this.showQuestion();
                    history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                } else {
                    this.makeGuess();
                }
                document.getElementById('characterThinking').style.display = 'none';
            }, 800);
        }
    }
    
    showContinentCountryQuestion(continent) {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error('Map container not found!');
            return;
        }
        
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer" style="display: block; visibility: visible;"></div>';
        
        // Update question text
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.textContent = `🗺️ Which countries in ${this.getContinentDisplayName(continent)} does your family come from?`;
        }
        
        // Initialize selected countries for this continent
        this.selectedCountries = [];
        
        // Create skip button
        this.createSkipButton(mapContainer, () => {
            this.handleContinentCountrySkip(continent);
        });
        
        // Show continue button immediately (allows skipping by clicking continue with no selection)
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.showContinentCountryContinueButton(continent);
        }, 0);
        
        // Load the continent map
        this.loadContinentMapForSelection(continent);
    }
    
    handleContinentCountrySkip(continent) {
        // Store empty array for this continent
        if (!this.answers.country_selections) {
            this.answers.country_selections = {};
        }
        this.answers.country_selections[continent] = [];
        
        // Move to next continent or next question
        this.currentContinentIndex++;
        if (this.currentContinentIndex < this.selectedContinents.length) {
            this.showContinentCountryQuestion(this.selectedContinents[this.currentContinentIndex]);
        } else {
            // All continents processed, move to next quiz question
            this.hideMap();
            document.getElementById('characterThinking').style.display = 'block';
            setTimeout(() => {
                this.currentQuestion++;
                if (this.currentQuestion < this.questions.length) {
                    this.showQuestion();
                    history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                } else {
                    this.makeGuess();
                }
                document.getElementById('characterThinking').style.display = 'none';
            }, 800);
        }
    }
    
    loadContinentMapForSelection(continent) {
        const continentMapFiles = {
            'north-america': '../assets/north-america.svg',
            'central-america': '../assets/central-america.svg',
            'south-america': '../assets/south-america.svg',
            'europe': '../assets/europe.svg',
            'africa': '../assets/africa.svg',
            'asia': '../assets/asia.svg',
            'oceania': '../assets/Blank_Map_Oceania.svg'
        };

        const mapFile = continentMapFiles[continent];
        if (!mapFile) {
            console.error(`No map file found for continent: ${continent}`);
            return;
        }
        
        const mapContainer = document.getElementById('mapContainer');
        const continentMapDiv = document.createElement('div');
        continentMapDiv.className = 'continent-map-container';
        continentMapDiv.dataset.continent = continent; // Add data-continent attribute for CSS targeting
        continentMapDiv.style.width = '100%';
        continentMapDiv.style.maxWidth = '800px';
        continentMapDiv.style.margin = '0 auto';
        
        // All continent maps are now SVG files
        fetch(mapFile)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                let svgElement = svgDoc.documentElement;

                // Check for parsing errors
                if (!svgElement || svgElement.nodeName === 'parsererror') {
                    throw new Error('Failed to parse SVG file');
                }

                // Some SVGs have a wrapper element, get the actual SVG if needed
                if (svgElement.nodeName !== 'svg') {
                    svgElement = svgElement.querySelector('svg') || svgElement;
                }

                // Verify we have a valid SVG element
                if (!svgElement || typeof svgElement.classList === 'undefined') {
                    throw new Error('Invalid SVG element structure');
                }

                svgElement.classList.add('continent-map-svg');
                if (svgElement.dataset) {
                    svgElement.dataset.continent = continent; // Add data-continent attribute for CSS targeting
                } else {
                    svgElement.setAttribute('data-continent', continent);
                }
                // Let CSS handle sizing - remove inline styles that override CSS
                // Only set essential attributes
                svgElement.style.display = 'block';
                svgElement.style.margin = '0 auto';

                // Special handling for North America - group US states and Canadian provinces
                if (continent === 'north-america') {
                    this.loadNorthAmericaMapGrouped(svgElement, continent, continentMapDiv, mapContainer);
                } else {
                    // Regular country selection for other continents
                    this.loadContinentMapRegular(svgElement, continent, continentMapDiv, mapContainer);
                }
            })
            .catch(err => {
                console.error(`Error loading ${continent} map:`, err);
                continentMapDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #FFD700;">
                        <h3>🗺️ Map Loading Error</h3>
                        <p>Unable to load the ${this.getContinentDisplayName(continent)} map.</p>
                    </div>
                `;
                mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
            });
    }
    
    loadNorthAmericaMapGrouped(svgElement, continent, continentMapDiv, mapContainer) {
        // US state codes (50 states + DC)
        const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                         'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                         'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                         'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                         'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];
        
        // Canadian province/territory codes
        const canadaProvinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
        
        // Group paths by country
        const usPaths = [];
        const canadaPaths = [];
        const otherPaths = [];
        
        // Process both paths and circles (Mexico is a circle)
        const allElements = [...svgElement.querySelectorAll('path'), ...svgElement.querySelectorAll('circle')];
        allElements.forEach(path => {
            const pathId = (path.id || path.getAttribute('name') || path.getAttribute('class') || '').toUpperCase();
            
            // Remove any existing attributes
            path.removeAttribute('fill');
            path.removeAttribute('stroke');
            path.removeAttribute('stroke-width');
            
            path.classList.add('state-path');
            path.style.fill = 'rgba(255, 215, 0, 0.1)';
            path.style.stroke = '#FFD700';
            path.style.strokeWidth = '1.5';
            path.style.setProperty('vector-effect', 'non-scaling-stroke', 'important');
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.3s ease';
            
            if (usStates.includes(pathId)) {
                usPaths.push(path);
                path.dataset.country = 'US';
            } else if (canadaProvinces.includes(pathId)) {
                canadaPaths.push(path);
                path.dataset.country = 'CA';
            } else {
                otherPaths.push(path);
                const countryId = pathId || path.getAttribute('name') || path.getAttribute('data-name');
                path.dataset.country = countryId; // Use path ID as country code for other countries
            }
        });
        
        // Track hover state - use Set to track which paths are currently hovered
        const countryHoveredPaths = { US: new Set(), CA: new Set() };
        otherPaths.forEach(p => {
            countryHoveredPaths[p.dataset.country] = new Set();
        });
        
        // Add event listeners to all paths
        const allPaths = [...usPaths, ...canadaPaths, ...otherPaths];
        allPaths.forEach(path => {
            const country = path.dataset.country;
            const countryPaths = country === 'US' ? usPaths : (country === 'CA' ? canadaPaths : [path]);
            
            path.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                const wasEmpty = countryHoveredPaths[country].size === 0;
                countryHoveredPaths[country].add(path);
                
                // Only apply hover effect when first path in country is hovered
                if (wasEmpty) {
                    countryPaths.forEach(p => {
                        if (!p.classList.contains('selected')) {
                            p.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                            p.style.setProperty('stroke', '#FFFFFF', 'important');
                            p.style.setProperty('stroke-width', '2.5', 'important');
                            p.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                            p.style.setProperty('transform', 'scale(1.02)', 'important');
                        }
                    });
                }
            });
            
            path.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                countryHoveredPaths[country].delete(path);
                
                // Only remove hover effect when last path in country is left
                if (countryHoveredPaths[country].size === 0) {
                    countryPaths.forEach(p => {
                        if (!p.classList.contains('selected')) {
                            p.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                            p.style.setProperty('stroke', '#FFD700', 'important');
                            p.style.setProperty('stroke-width', '1.5', 'important');
                            p.style.setProperty('filter', 'none', 'important');
                            p.style.setProperty('transform', 'scale(1)', 'important');
                        }
                    });
                }
            });
            
            path.addEventListener('click', (e) => {
                e.stopPropagation();
                const country = path.dataset.country;
                const countryPaths = country === 'US' ? usPaths : (country === 'CA' ? canadaPaths : [path]);
                
                if (path.classList.contains('selected')) {
                    // Deselect all paths in this country
                    countryPaths.forEach(p => {
                        p.classList.remove('selected');
                        p.style.fill = 'rgba(255, 215, 0, 0.1)';
                        p.style.stroke = '#FFD700';
                        p.style.strokeWidth = '1.5';
                        p.style.filter = 'none';
                        // Removed scale transform
                    });
                    this.selectedCountries = this.selectedCountries.filter(c => c !== country);
                } else {
                    // Select all paths in this country
                    countryPaths.forEach(p => {
                        p.classList.add('selected');
                        p.style.fill = 'rgba(255, 215, 0, 0.7)';
                        p.style.stroke = '#FFA500';
                        p.style.strokeWidth = '3';
                        p.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                    });
                    if (!this.selectedCountries.includes(country)) {
                        this.selectedCountries.push(country);
                    }
                }
                
                this.showContinentCountryContinueButton(continent);
            });
        });
        
        continentMapDiv.appendChild(svgElement);
        mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
    }
    
    loadContinentMapRegular(svgElement, continent, continentMapDiv, mapContainer) {
        // Make SVG background transparent
        svgElement.style.background = 'transparent';
        svgElement.removeAttribute('fill');
        svgElement.removeAttribute('style');
        
        // Remove any background rectangles that might exist
        svgElement.querySelectorAll('rect').forEach(rect => {
            rect.remove();
        });
        
        // Remove fills from all groups
        svgElement.querySelectorAll('g').forEach(group => {
            group.removeAttribute('fill');
            group.removeAttribute('style');
        });
        
        // Collect all paths including those in groups (like some maps might have)
        const allPaths = [];
        const processedPaths = new Set();
        
        // Get paths in groups first
        svgElement.querySelectorAll('g[id]').forEach(group => {
            group.querySelectorAll('path').forEach(path => {
                if (!processedPaths.has(path)) {
                    allPaths.push(path);
                    processedPaths.add(path);
                }
            });
        });
        
        // Get direct paths (not in groups we already processed)
        svgElement.querySelectorAll('path').forEach(path => {
            if (!processedPaths.has(path)) {
                allPaths.push(path);
                processedPaths.add(path);
            }
        });
        
        // Apply golden styling like state map
        allPaths.forEach(path => {
            // FIRST: Remove ALL existing styling attributes and classes
            path.removeAttribute('fill');
            path.removeAttribute('stroke');
            path.removeAttribute('stroke-width');
            path.removeAttribute('fill-opacity');
            path.removeAttribute('stroke-opacity');
            path.removeAttribute('class');
            path.removeAttribute('style');
            
            // Clear any inline styles
            path.style.cssText = '';
            
            // Add our class
            path.classList.add('country-path');
            
            // THEN: Apply golden styling like state map - use setProperty to ensure it sticks
            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
            path.style.setProperty('stroke', '#FFD700', 'important');
            path.style.setProperty('stroke-width', '1.5', 'important');
            path.style.setProperty('vector-effect', 'non-scaling-stroke', 'important');
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.3s ease';
            
            // Add hover effects - use setProperty with !important to override CSS
            path.addEventListener('mouseenter', () => {
                if (!path.classList.contains('selected')) {
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                    path.style.setProperty('stroke', '#FFFFFF', 'important');
                    path.style.setProperty('stroke-width', '2.5', 'important');
                    path.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                    // Removed scale transform
                }
            });
            
            path.addEventListener('mouseleave', () => {
                if (!path.classList.contains('selected')) {
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                    path.style.setProperty('stroke', '#FFD700', 'important');
                    path.style.setProperty('stroke-width', '1.5', 'important');
                    path.style.setProperty('filter', 'none', 'important');
                    // Removed scale transform
                }
            });
            
            path.addEventListener('click', () => {
                // Try multiple ways to get country ID (case-insensitive)
                let countryId = path.id || 
                               path.getAttribute('name') || 
                               path.getAttribute('data-name') ||
                               path.getAttribute('data-id');
                
                // Normalize country ID (uppercase, trim)
                if (countryId) {
                    countryId = countryId.toString().toUpperCase().trim();
                }
                
                if (path.classList.contains('selected')) {
                    // Deselect country
                    path.classList.remove('selected');
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                    path.style.setProperty('stroke', '#FFD700', 'important');
                    path.style.setProperty('stroke-width', '1.5', 'important');
                    path.style.setProperty('filter', 'none', 'important');
                    // Removed scale transform
                    
                    this.selectedCountries = this.selectedCountries.filter(c => c !== countryId);
                } else {
                    // Select country
                    path.classList.add('selected');
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.7)', 'important');
                    path.style.setProperty('stroke', '#FFA500', 'important');
                    path.style.setProperty('stroke-width', '3', 'important');
                    path.style.setProperty('filter', 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))', 'important');
                    
                    this.selectedCountries.push(countryId);
                }
                
                // Show continue button
                this.showContinentCountryContinueButton(continent);
            });
        });

        continentMapDiv.appendChild(svgElement);
        mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
    }
    
    loadEuropeWithRussia(europeSvgElement, continent, continentMapDiv, mapContainer) {
        // First, set up the Europe map
        europeSvgElement.classList.add('continent-map-svg');
        europeSvgElement.style.width = '100%';
        europeSvgElement.style.height = 'auto';
        europeSvgElement.style.maxWidth = '100%';
        europeSvgElement.style.display = 'block';
        europeSvgElement.style.margin = '0 auto';
        europeSvgElement.style.overflow = 'visible';
        
        // Create a container for both maps
        const mapsWrapper = document.createElement('div');
        mapsWrapper.style.display = 'flex';
        mapsWrapper.style.flexDirection = 'column';
        mapsWrapper.style.gap = '20px';
        mapsWrapper.style.width = '100%';
        mapsWrapper.style.alignItems = 'center';
        
        // Add Europe map to wrapper
        mapsWrapper.appendChild(europeSvgElement);
        
        // Load Russia map
        fetch('../assets/ru-03/ru-03.svg')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const russiaSvgElement = svgDoc.documentElement;
                
                russiaSvgElement.classList.add('continent-map-svg');
                russiaSvgElement.style.width = '100%';
                russiaSvgElement.style.height = 'auto';
                russiaSvgElement.style.maxWidth = '100%';
                russiaSvgElement.style.display = 'block';
                russiaSvgElement.style.margin = '0 auto';
                russiaSvgElement.style.overflow = 'visible';
                
                // Process both maps together - collect all paths including those in groups
                const allPaths = [];
                const processedPaths = new Set();
                
                // Process Europe map paths (including those in groups)
                europeSvgElement.querySelectorAll('g[id]').forEach(group => {
                    group.querySelectorAll('path').forEach(path => {
                        if (!processedPaths.has(path)) {
                            allPaths.push(path);
                            processedPaths.add(path);
                        }
                    });
                });
                europeSvgElement.querySelectorAll('path').forEach(path => {
                    if (!processedPaths.has(path)) {
                        allPaths.push(path);
                        processedPaths.add(path);
                    }
                });
                
                // Process Russia map paths (including those in groups)
                russiaSvgElement.querySelectorAll('g[id]').forEach(group => {
                    group.querySelectorAll('path').forEach(path => {
                        if (!processedPaths.has(path)) {
                            allPaths.push(path);
                            processedPaths.add(path);
                        }
                    });
                });
                russiaSvgElement.querySelectorAll('path').forEach(path => {
                    if (!processedPaths.has(path)) {
                        allPaths.push(path);
                        processedPaths.add(path);
                    }
                });
                
                // Apply styling and event listeners to all paths
                allPaths.forEach(path => {
                    path.classList.add('country-path');
                    
                    // Remove any existing attributes
                    path.removeAttribute('fill');
                    path.removeAttribute('stroke');
                    path.removeAttribute('stroke-width');
                    
                    // Golden styling like state map - use setProperty to ensure it sticks
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                    path.style.setProperty('stroke', '#FFD700', 'important');
                    path.style.setProperty('stroke-width', '1.5', 'important');
                    path.style.cursor = 'pointer';
                    path.style.transition = 'all 0.3s ease';
                    
                    // Add hover effects - use setProperty with !important to override CSS
                    path.addEventListener('mouseenter', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                            path.style.setProperty('stroke', '#FFFFFF', 'important');
                            path.style.setProperty('stroke-width', '2.5', 'important');
                            path.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('mouseleave', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                            path.style.setProperty('stroke', '#FFD700', 'important');
                            path.style.setProperty('stroke-width', '1.5', 'important');
                            path.style.setProperty('filter', 'none', 'important');
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('click', () => {
                        // Try multiple ways to get country ID (case-insensitive)
                        let countryId = path.id || 
                                       path.getAttribute('name') || 
                                       path.getAttribute('data-name') ||
                                       path.getAttribute('data-id');
                        
                        // Normalize country ID (uppercase, trim)
                        if (countryId) {
                            countryId = countryId.toString().toUpperCase().trim();
                        }
                        
                        if (path.classList.contains('selected')) {
                            // Deselect country
                            path.classList.remove('selected');
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                            path.style.setProperty('stroke', '#FFD700', 'important');
                            path.style.setProperty('stroke-width', '1.5', 'important');
                            path.style.setProperty('filter', 'none', 'important');
                            // Removed scale transform
                            
                            this.selectedCountries = this.selectedCountries.filter(c => c !== countryId);
                        } else {
                            // Select country
                            path.classList.add('selected');
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.7)', 'important');
                            path.style.setProperty('stroke', '#FFA500', 'important');
                            path.style.setProperty('stroke-width', '3', 'important');
                            path.style.setProperty('filter', 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))', 'important');
                            
                            this.selectedCountries.push(countryId);
                        }
                        
                        // Show continue button
                        this.showContinentCountryContinueButton(continent);
                    });
                });
                
                // Add Russia map to wrapper
                mapsWrapper.appendChild(russiaSvgElement);
                
                // Add wrapper to container
                continentMapDiv.appendChild(mapsWrapper);
                mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
            })
            .catch(err => {
                console.error('Error loading Russia map:', err);
                // If Russia map fails to load, just show Europe map
                continentMapDiv.appendChild(europeSvgElement);
                mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
            });
    }
    
    showContinentCountryContinueButton(continent) {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) {
            console.error('Continue container not found in showContinentCountryContinueButton!');
            // Try to create it if it doesn't exist
            const mapContainer = document.getElementById('mapContainer');
            if (mapContainer) {
                const newContainer = document.createElement('div');
                newContainer.id = 'continueContainer';
                newContainer.style.display = 'block';
                newContainer.style.visibility = 'visible';
                mapContainer.appendChild(newContainer);
                return this.showContinentCountryContinueButton(continent); // Retry
            }
            return;
        }
        
        // Ensure container is visible
        continueContainer.style.display = 'block';
        continueContainer.style.visibility = 'visible';
        
        let existingBtn = continueContainer.querySelector('.continent-country-continue-btn');
        
        if (!existingBtn) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn continent-country-continue-btn';
            continueBtn.textContent = this.selectedCountries.length > 0 
                ? `Continue (${this.selectedCountries.length} selected)` 
                : 'Continue';
            continueBtn.style.display = 'block'; // Ensure button is visible
            continueBtn.style.visibility = 'visible';
            continueBtn.style.position = 'relative'; // Ensure it's in normal flow
            continueBtn.style.zIndex = '1000'; // Ensure it's on top
            continueBtn.addEventListener('click', () => {
                // Store selected countries for this continent
                if (!this.answers.country_selections) {
                    this.answers.country_selections = {};
                }
                this.answers.country_selections[continent] = Array.isArray(this.selectedCountries) ? this.selectedCountries : [];
                
                // Move to next continent or next question
                this.currentContinentIndex++;
                if (this.currentContinentIndex < this.selectedContinents.length) {
                    this.showContinentCountryQuestion(this.selectedContinents[this.currentContinentIndex]);
                } else {
                    // All continents processed, move to next quiz question
                    this.hideMap();
                    document.getElementById('characterThinking').style.display = 'block';
                    setTimeout(() => {
                        this.currentQuestion++;
                        if (this.currentQuestion < this.questions.length) {
                            this.showQuestion();
                            history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                        } else {
                            this.makeGuess();
                        }
                        document.getElementById('characterThinking').style.display = 'none';
                    }, 800);
                }
            });
            continueContainer.appendChild(continueBtn);
        } else {
            existingBtn.textContent = this.selectedCountries.length > 0 
                ? `Continue (${this.selectedCountries.length} selected)` 
                : 'Continue';
            existingBtn.style.display = 'block'; // Ensure button is visible
            existingBtn.style.visibility = 'visible';
        }
    }

    toggleContinent(continentId, buttonElement) {
        if (this.selectedContinents.includes(continentId)) {
            // Deselect continent
            this.selectedContinents = this.selectedContinents.filter(c => c !== continentId);
            buttonElement.classList.remove('selected');
        } else {
            // Select continent
            this.selectedContinents.push(continentId);
            buttonElement.classList.add('selected');
        }
        
        // Show continue button if any continents are selected
        if (this.selectedContinents.length > 0) {
            this.showContinentContinueButton();
        } else {
            this.hideContinentContinueButton();
        }
    }

    showContinentContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer && !continueContainer.querySelector('.slider-continue-btn')) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = `Continue to Country Selection (${this.selectedContinents.length} selected)`;
            continueBtn.addEventListener('click', () => {
                this.showCountryMapsForContinents();
            });
            continueContainer.appendChild(continueBtn);
        } else if (continueContainer && continueContainer.querySelector('.slider-continue-btn')) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            existingBtn.textContent = `Continue to Country Selection (${this.selectedContinents.length} selected)`;
        }
    }

    hideContinentContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    }

    showCountryMapsForContinents() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error("Map container not found!");
            return;
        }

        // Clear the container and show country maps for each selected continent
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        // Initialize selected countries as an array of objects with continent and countries
        this.selectedCountries = this.selectedContinents.map(continent => ({
            continent: continent,
            countries: []
        }));
        
        // Show continue button immediately (allows skipping by clicking continue with no selection)
        this.showCountryMapsContinueButton();
        
        // Create a container for all country maps
        const countryMapsContainer = document.createElement('div');
        countryMapsContainer.className = 'country-maps-container';
        
        // Show country maps for each selected continent
        this.selectedContinents.forEach((continent, index) => {
            const continentMapDiv = document.createElement('div');
            continentMapDiv.className = 'continent-map-section';
            continentMapDiv.innerHTML = `
                <h3 class="continent-map-title">Select countries in ${this.getContinentDisplayName(continent)}</h3>
                <div class="continent-map-${continent}" data-continent="${continent}"></div>
            `;
            countryMapsContainer.appendChild(continentMapDiv);
        });
        
        mapContainer.appendChild(countryMapsContainer);
        
        // Load country maps for each continent
        this.selectedContinents.forEach(continent => {
            this.loadContinentMap(continent);
        });
    }

    getContinentDisplayName(continentId) {
        const names = {
            'north-america': 'North America',
            'central-america': 'Central America',
            'south-america': 'South America', 
            'europe': 'Europe',
            'africa': 'Africa',
            'asia': 'Asia',
            'oceania': 'Oceania'
        };
        return names[continentId] || continentId;
    }

    loadContinentMap(continent) {
        const continentMapDiv = document.querySelector(`.continent-map-${continent}`);
        if (!continentMapDiv) {
            console.error(`Continent map div not found for ${continent}`);
            return;
        }

        // Map continent IDs to their SVG file names
        const continentMapFiles = {
            'north-america': '../assets/north-america.svg',
            'central-america': '../assets/central-america.svg',
            'south-america': '../assets/south-america.svg',
            'europe': '../assets/europe.svg',
            'africa': '../assets/africa.svg',
            'asia': '../assets/asia.svg',
            'oceania': '../assets/Blank_Map_Oceania.svg'
        };

        const mapFile = continentMapFiles[continent];
        if (!mapFile) {
            console.error(`No map file found for continent: ${continent}`);
            return;
        }

        // Handle PNG files differently
        if (mapFile.endsWith('.png')) {
            const img = document.createElement('img');
            img.src = mapFile;
            img.className = 'continent-map-image';
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.margin = '0 auto';
            img.style.overflow = 'visible';
            continentMapDiv.appendChild(img);
            return;
        }

        // Handle SVG files
        fetch(mapFile)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;

                svgElement.classList.add('continent-map-svg');
                svgElement.style.width = '100%';
                svgElement.style.height = 'auto';
                svgElement.style.maxWidth = '100%';
                svgElement.style.display = 'block';
                svgElement.style.margin = '0 auto';
                svgElement.style.overflow = 'visible';

                // Apply country selection styling to paths
                svgElement.querySelectorAll('path').forEach(path => {
                    path.classList.add('country-path');
                    
                    // Add golden styling similar to state map
                    path.style.fill = 'rgba(255, 255, 255, 0.08)';
                    path.style.stroke = '#FFD700';
                    path.style.strokeWidth = '1.5';
                    path.style.cursor = 'pointer';
                    path.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    path.style.filter = 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.2))';
                    
                    // Add hover effects
                    path.addEventListener('mouseenter', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.fill = 'rgba(255, 215, 0, 0.4)';
                            path.style.stroke = '#FFFFFF';
                            path.style.strokeWidth = '2.5';
                            path.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('mouseleave', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.fill = 'rgba(255, 255, 255, 0.08)';
                            path.style.stroke = '#FFD700';
                            path.style.strokeWidth = '1.5';
                            path.style.filter = 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.2))';
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('click', () => {
                        const countryId = path.id || path.getAttribute('name') || path.getAttribute('data-name');
                        
                        // Find the continent data for this map
                        const continentData = this.selectedCountries.find(c => c.continent === continent);
                        if (!continentData) {
                            console.error(`Continent data not found for ${continent}`);
                            return;
                        }
                        
                        if (path.classList.contains('selected')) {
                            // Deselect country
                            path.classList.remove('selected');
                            path.style.fill = 'rgba(255, 255, 255, 0.08)';
                            path.style.stroke = '#FFD700';
                            path.style.strokeWidth = '1.5';
                            path.style.filter = 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.2))';
                            
                            // Remove from selected countries for this continent
                            continentData.countries = continentData.countries.filter(c => c !== countryId);
                        } else {
                            // Select country
                            path.classList.add('selected');
                            path.style.fill = 'rgba(255, 215, 0, 0.7)';
                            path.style.stroke = '#FFA500';
                            path.style.strokeWidth = '3';
                            path.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                            path.style.animation = 'statePulse 2s ease-in-out infinite';
                            // Add to selected countries for this continent
                            if (!continentData.countries.includes(countryId)) {
                                continentData.countries.push(countryId);
                            }
                        }
                        
                        // Update continue button text (button should always be visible)
                        this.showCountryMapsContinueButton();
                    });
                });

                continentMapDiv.appendChild(svgElement);
            })
            .catch(err => {
                console.error(`Error loading ${continent} map:`, err);
                continentMapDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #FFD700;">
                        <h3>🗺️ Map Loading Error</h3>
                        <p>Unable to load the ${this.getContinentDisplayName(continent)} map.</p>
                    </div>
                `;
            });
    }

    showCountryMapsContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) {
            console.error('Continue container not found!');
            return;
        }
        
        // Calculate total selected countries across all continents
        let totalSelected = 0;
        if (Array.isArray(this.selectedCountries) && this.selectedCountries.length > 0) {
            // Check if it's the new format (array of objects) or old format (flat array)
            if (typeof this.selectedCountries[0] === 'object' && this.selectedCountries[0].continent) {
                // New format: array of objects with continent and countries
                this.selectedCountries.forEach(continentData => {
                    if (continentData.countries) {
                        totalSelected += continentData.countries.length;
                    }
                });
            } else {
                // Old format: flat array of country IDs
                totalSelected = this.selectedCountries.length;
            }
        }
        
        const buttonText = totalSelected > 0 
            ? `Continue (${totalSelected} countries selected)` 
            : 'Continue';
        
        let continueBtn = continueContainer.querySelector('.slider-continue-btn');
        if (!continueBtn) {
            continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = buttonText;
            continueBtn.style.display = 'block'; // Ensure button is visible
            continueBtn.style.visibility = 'visible';
            continueBtn.addEventListener('click', () => {
                // Store country selections for all continents
                if (!this.answers.country_selections) {
                    this.answers.country_selections = {};
                }
                
                // Store selections per continent
                if (Array.isArray(this.selectedCountries) && this.selectedCountries.length > 0) {
                    if (typeof this.selectedCountries[0] === 'object' && this.selectedCountries[0].continent) {
                        // New format: array of objects
                        this.selectedCountries.forEach(continentData => {
                            this.answers.country_selections[continentData.continent] = continentData.countries || [];
                        });
                    } else {
                        // Old format: flat array - store for all selected continents
                        this.selectedContinents.forEach(continent => {
                            this.answers.country_selections[continent] = [...this.selectedCountries];
                        });
                    }
                } else {
                    // No countries selected - store empty arrays
                    this.selectedContinents.forEach(continent => {
                        this.answers.country_selections[continent] = [];
                    });
                }
                
                // Move to next quiz question
                this.hideMap();
                document.getElementById('characterThinking').style.display = 'block';
                setTimeout(() => {
                    this.currentQuestion++;
                    if (this.currentQuestion < this.questions.length) {
                        this.showQuestion();
                        history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                    } else {
                        this.makeGuess();
                    }
                    document.getElementById('characterThinking').style.display = 'none';
                }, 800);
            });
            continueContainer.appendChild(continueBtn);
        } else {
            continueBtn.textContent = buttonText;
            continueBtn.style.display = 'block'; // Ensure button is visible
            continueBtn.style.visibility = 'visible';
        }
    }

    hideCountryMapsContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    }
       
    showMapContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer && !continueContainer.querySelector('.slider-continue-btn')) {
            // Use the same continue button system as sliders
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = 'Continue';
            continueBtn.addEventListener('click', () => {
                if (this.selectedState) {
                    this.selectAnswer(this.selectedState);
                }
            });
            continueContainer.appendChild(continueBtn);
        }
    }
    
    hideMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.style.display = 'none';
        }
    }
    
    createBasicMap(container) {
        
        // Create a simple list of major states
        const majorStates = [
            { code: 'CA', name: 'California' },
            { code: 'TX', name: 'Texas' },
            { code: 'FL', name: 'Florida' },
            { code: 'NY', name: 'New York' },
            { code: 'IL', name: 'Illinois' },
            { code: 'PA', name: 'Pennsylvania' },
            { code: 'OH', name: 'Ohio' },
            { code: 'GA', name: 'Georgia' },
            { code: 'NC', name: 'North Carolina' },
            { code: 'MI', name: 'Michigan' },
            { code: 'NJ', name: 'New Jersey' },
            { code: 'VA', name: 'Virginia' },
            { code: 'WA', name: 'Washington' },
            { code: 'AZ', name: 'Arizona' },
            { code: 'MA', name: 'Massachusetts' },
            { code: 'TN', name: 'Tennessee' },
            { code: 'IN', name: 'Indiana' },
            { code: 'MO', name: 'Missouri' },
            { code: 'MD', name: 'Maryland' },
            { code: 'WI', name: 'Wisconsin' }
        ];
        
        const stateList = document.createElement('div');
        stateList.className = 'state-list';
        stateList.style.cssText = `
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            padding: 20px; 
            background: linear-gradient(145deg, #1A0033, #4A148C);
            border-radius: 20px;
            box-shadow: 0 12px 35px rgba(138, 43, 226, 0.5);
            border: 2px solid rgba(255, 215, 0, 0.3);
            margin: 20px auto;
            max-width: 800px;
        `;
        
        majorStates.forEach(state => {
            const button = document.createElement('button');
            button.className = 'state-option';
            button.textContent = `${state.code} - ${state.name}`;
            button.style.cssText = `
                padding: 15px; 
                background: rgba(255, 215, 0, 0.1); 
                border: 2px solid #FFD700; 
                color: white; 
                border-radius: 8px; 
                cursor: pointer; 
                font-family: 'Bohemian Typewriter', monospace;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s ease;
                min-height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            `;
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(255, 215, 0, 0.3)';
                button.style.borderColor = '#FFFFFF';
                button.style.transform = 'scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(255, 215, 0, 0.1)';
                button.style.borderColor = '#FFD700';
                button.style.transform = 'scale(1)';
            });
            
            button.addEventListener('click', () => this.selectAnswer(state.code));
            stateList.appendChild(button);
        });
        
        container.appendChild(stateList);
        
        // Force a visual update and make sure it's visible
        stateList.style.display = 'grid';
        stateList.style.visibility = 'visible';
        stateList.style.opacity = '1';
        stateList.style.position = 'relative';
        stateList.style.zIndex = '10';
        
        // Also ensure the container is visible
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
    }
    
    createSimpleMap(container) {
        const mapGrid = document.createElement('div');
        mapGrid.className = 'map-grid';
        
        // All 50 US states in a simple grid format
        const states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ];
        
        // Create state buttons
        states.forEach(stateCode => {
            const button = document.createElement('button');
            button.className = 'state-button';
            button.setAttribute('data-state', stateCode);
            button.textContent = stateCode;
            button.title = this.getStateName(stateCode);
            button.addEventListener('click', () => this.selectAnswer(stateCode));
            mapGrid.appendChild(button);
        });
        container.appendChild(mapGrid);
    }
    
    getStateName(code) {
        const stateNames = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
            'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
            'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
            'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
            'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
            'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
            'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
            'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
        };
        return stateNames[code] || code;
    }

    selectAnswer(value) {
        const question = this.questions[this.currentQuestion];
        if (!question || !question.key) {
            console.error('❌ Question or question.key not found at index:', this.currentQuestion);
            return;
        }
        
        // Normalize "PREFER_NOT_TO_SAY" to "NB" for gender to simplify processing
        if (question.key === 'gender') {
            // Handle both array and string values
            if (Array.isArray(value)) {
                value = value.map(v => v === 'PREFER_NOT_TO_SAY' ? 'NB' : v);
                console.log('✅ Normalized PREFER_NOT_TO_SAY to NB in array for gender processing');
            } else if (value === 'PREFER_NOT_TO_SAY') {
                value = 'NB';
                console.log('✅ Normalized PREFER_NOT_TO_SAY to NB for gender processing');
            }
        }
        
        this.answers[question.key] = value;
        
        // Hide the map when moving away from state question
        this.hideMap();
        
        // Show thinking animation
        document.getElementById('characterThinking').style.display = 'block';
        
        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.showQuestion();
                // Update browser history for next question
                history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
            } else {
                this.makeGuess();
            }
            document.getElementById('characterThinking').style.display = 'none';
        }, 800);
    }

    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    async makeGuess() {
        console.log('🎯 makeGuess: Starting guess calculation...');
        console.log('📋 Current answers:', JSON.stringify(this.answers));
        
        // Train ML model with existing data before making prediction
        await this.trainMLModel();
        
        const topGuesses = await this.calculateTopGuesses(5);
        console.log(`🎯 makeGuess: Got ${topGuesses ? topGuesses.length : 0} top guesses`);
        
        // If we still have no guesses, use emergency fallback
        if (!topGuesses || topGuesses.length === 0) {
            console.error('❌ makeGuess: No guesses returned! Using emergency fallback...');
            const emergencyFallback = [
                { name: 'Alex', gender: this.answers.gender || 'NB', totalCount: 2000, score: 50, confidence: 50 },
                { name: 'Jordan', gender: this.answers.gender || 'NB', totalCount: 1800, score: 48, confidence: 48 },
                { name: 'Taylor', gender: this.answers.gender || 'NB', totalCount: 1600, score: 46, confidence: 46 },
                { name: 'Casey', gender: this.answers.gender || 'NB', totalCount: 1400, score: 44, confidence: 44 },
                { name: 'Morgan', gender: this.answers.gender || 'NB', totalCount: 1200, score: 42, confidence: 42 }
            ];
            this.displayTopGuesses(emergencyFallback);
            this.currentGuesses = emergencyFallback;
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'block';
            this.hideMap();
            history.pushState({page: 'result'}, '', '#result');
            return;
        }
        
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
        this.hideMap();
        
        // Display top 5 guesses
        this.displayTopGuesses(topGuesses);
        
        // Update browser history
        history.pushState({page: 'result'}, '', '#result');
        
        this.currentGuesses = topGuesses;
    }

    async trainMLModel() {
        try {
            // First, try to load global model from GitHub Releases
            const globalModelLoaded = await this.mlModel.loadGlobalModel();
            
            if (!globalModelLoaded) {
                // Fallback to local training if global model not available
                console.log('🏠 Training local model on user data...');
                const trainingData = this.getTrainingData();
                if (trainingData.length > 0) {
                    await this.mlModel.train(trainingData);
                } else {
                    console.log('ℹ️  No local training data available yet');
                }
            } else {
                console.log('🌍 Using global model trained on aggregated data');
            }
        } catch (error) {
            console.error('Error training ML model:', error);
        }
    }

    getTrainingData() {
        try {
            const data = localStorage.getItem('nameGuessingTrainingData');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading training data:', error);
            return [];
        }
    }

    async calculateGuess() {
        const candidates = await this.getCandidates();
        
        if (candidates.length === 0) {
            
            // Try with relaxed length criteria using efficient lookups
            let relaxedCandidates = [];
            
            if (this.answers.gender === 'NB') {
                // Ensure database is loaded before getting non-binary names
                if (this.enhancedNameDatabase.ensureLoaded) {
                    await this.enhancedNameDatabase.ensureLoaded();
                }
                // For non-binary or prefer not to say, use the existing method but with relaxed length
                const nonBinaryNames = await this.enhancedNameDatabase.getNonBinaryNames();
                if (nonBinaryNames && nonBinaryNames.length > 0) {
                    relaxedCandidates = nonBinaryNames.filter(nameInfo => {
                        if (this.answers.length === 'long') {
                            return nameInfo.name.length >= 6; // Relaxed: 6+ instead of 7+
                        } else if (this.answers.length === 'extra_long') {
                            return nameInfo.name.length >= 8; // Relaxed: 8+ instead of 10+
                        } else if (this.answers.length === 'medium') {
                            return nameInfo.name.length >= 4 && nameInfo.name.length <= 7; // Relaxed medium
                        } else if (this.answers.length === 'short') {
                            return nameInfo.name.length <= 5; // Relaxed short
                        }
                        return true;
                    });
                }
                // If still no candidates, will use fallback below
            } else {
                // Use efficient gender lookup, then filter with relaxed length
                const genderCandidates = this.enhancedNameDatabase.getNamesByGender(this.answers.gender);
                relaxedCandidates = genderCandidates.filter(nameInfo => {
                // Relax length: if they want long, accept 6+ letters; if extra_long, accept 8+ letters
                if (this.answers.length === 'long') {
                    const nameLength = nameInfo.name.length;
                    if (nameLength < 6) return false; // Still reject very short names
                }
                if (this.answers.length === 'extra_long') {
                    const nameLength = nameInfo.name.length;
                    if (nameLength < 8) return false; // Still reject very short names
                }
                
                // Keep vowel filter
                if (this.answers.starts_with) {
                    const firstLetter = nameInfo.name.charAt(0).toLowerCase();
                    const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
                    if (this.answers.starts_with === 'vowel' && !isVowel) return false;
                    if (this.answers.starts_with === 'consonant' && isVowel) return false;
                }
                
                return true;
                });
            }
            
            if (relaxedCandidates.length === 0) {
                // Fallback: find any long consonant names
                const longConsonantNames = Object.values(this.enhancedNameDatabase.nameData).filter(nameInfo => {
                    const nameLength = nameInfo.name.length;
                    const firstLetter = nameInfo.name.charAt(0).toLowerCase();
                    const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
                    return nameLength >= 6 && !isVowel;
                });
                
                if (longConsonantNames.length > 0) {
                    return longConsonantNames[0];
                }
                
                return { name: 'Alex', confidence: 25 };
            }
            
            // Use relaxed candidates
            const scoredCandidates = relaxedCandidates.map(candidate => ({
                ...candidate,
                score: this.calculateNameScore(candidate)
            }));
            
            scoredCandidates.sort((a, b) => b.score - a.score);
            return scoredCandidates[0];
        }
        
        // Score each candidate based on how well they match the responses
        const scoredCandidates = candidates.map(candidate => ({
            ...candidate,
            score: this.calculateNameScore(candidate)
        }));
        
        // Sort by score (highest first), then by popularity as tiebreaker
        scoredCandidates.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.totalCount - a.totalCount;
        });
        
        return scoredCandidates[0];
    }

    async calculateTopGuesses(count = 5) {
        try {
            // Handle both array and string values for gender
            const genderValue = Array.isArray(this.answers.gender) ? this.answers.gender[0] : this.answers.gender;
            console.log('🎯 calculateTopGuesses: Starting...');
            console.log('📋 Answers object:', JSON.stringify(this.answers));
            console.log('📋 Gender value:', genderValue, '(raw:', this.answers.gender, ')');
            
            // Get rule-based predictions
            let ruleBasedGuesses = [];
            try {
                console.log('🎯 calculateTopGuesses: About to call calculateRuleBasedGuesses...');
                const result = await this.calculateRuleBasedGuesses(count);
                console.log(`🎯 calculateTopGuesses: calculateRuleBasedGuesses returned:`, result);
                ruleBasedGuesses = result || [];
                console.log(`🎯 calculateTopGuesses: Got ${ruleBasedGuesses ? ruleBasedGuesses.length : 0} rule-based guesses`);
            } catch (error) {
                console.error('❌ calculateTopGuesses: Error in calculateRuleBasedGuesses:', error);
                console.error('Error message:', error.message);
                console.error('Stack:', error.stack);
                // If it's a non-binary gender, return fallback
                const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
                const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
                if (hasNonBinary) {
                    console.log('⚠️ Returning fallback for non-binary due to error');
                    ruleBasedGuesses = [
                        { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
                        { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
                        { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
                        { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
                        { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
                    ];
                } else {
                    ruleBasedGuesses = [];
                }
            }
            
            // If we have rule-based guesses, return them (ML is optional)
            if (ruleBasedGuesses && ruleBasedGuesses.length > 0) {
                // Get ML predictions (may fail due to CSP, that's okay)
                let mlPredictions = [];
                try {
                    mlPredictions = await this.mlModel.predict(this.answers);
                    console.log(`🤖 calculateTopGuesses: Got ${mlPredictions ? mlPredictions.length : 0} ML predictions`);
                } catch (error) {
                    console.log('⚠️ ML predictions failed (expected with CSP), using rule-based only:', error.message);
                    // ML failed, just return rule-based guesses
                    return ruleBasedGuesses;
                }
                
                // Combine both approaches if ML worked
                if (mlPredictions && mlPredictions.length > 0) {
                    const hybridGuesses = this.combinePredictions(ruleBasedGuesses, mlPredictions, count);
                    console.log(`✅ calculateTopGuesses: Returning ${hybridGuesses ? hybridGuesses.length : 0} hybrid guesses`);
                    if (hybridGuesses && hybridGuesses.length > 0) {
                        return hybridGuesses;
                    }
                }
                
                // Return rule-based guesses if hybrid didn't work
                console.log(`✅ calculateTopGuesses: Returning ${ruleBasedGuesses.length} rule-based guesses`);
                return ruleBasedGuesses;
            } else {
                console.error('❌ calculateTopGuesses: No rule-based guesses returned!');
                console.error('❌ Rule-based guesses value:', ruleBasedGuesses);
                console.error('❌ Gender value:', this.answers.gender);
                // Return fallback if any gender is non-binary - this should ALWAYS work
                const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
                const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
                if (hasNonBinary) {
                    console.log('⚠️ Returning fallback for non-binary - this should always work');
                    const fallback = [
                        { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
                        { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
                        { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
                        { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
                        { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
                    ];
                    console.log('✅ Returning fallback with', fallback.length, 'names');
                    return fallback;
                }
                console.error('❌ Gender is not NB, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('❌ calculateTopGuesses: Error occurred:', error);
            console.error('Stack:', error.stack);
            // Return fallback if any gender is non-binary
            const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
            const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
            if (hasNonBinary) {
                return [
                    { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
                    { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
                    { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
                    { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
                    { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
                ];
            }
            return [];
        }
    }

    async calculateRuleBasedGuesses(count = 5) {
        try {
            // Handle both array and string values for gender
            const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
            console.log(`🔍 calculateRuleBasedGuesses: Starting for genders=${JSON.stringify(genderArray)}, count=${count}`);
            console.log(`📋 Answers:`, JSON.stringify(this.answers));
            
            // If multiple genders selected, get candidates for each and combine
            let allCandidates = [];
            const seenNames = new Set(); // Track unique names to avoid duplicates
            
            for (const genderValue of genderArray) {
                console.log(`🔍 Processing gender: ${genderValue}`);
                
                // Temporarily set gender to current value for getCandidates
                const originalGender = this.answers.gender;
                this.answers.gender = genderValue;
                
                try {
                    const candidates = await this.getCandidates();
                    console.log(`🔍 Got ${candidates ? candidates.length : 0} candidates for gender=${genderValue}`);
                    
                    // Add candidates that we haven't seen yet
                    if (candidates && Array.isArray(candidates)) {
                        for (const candidate of candidates) {
                            const nameKey = candidate.name ? candidate.name.toLowerCase() : null;
                            if (nameKey && !seenNames.has(nameKey)) {
                                seenNames.add(nameKey);
                                allCandidates.push(candidate);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error getting candidates for gender ${genderValue}:`, error);
                } finally {
                    // Restore original gender value
                    this.answers.gender = originalGender;
                }
            }
            
            console.log(`🔍 calculateRuleBasedGuesses: Got ${allCandidates.length} total unique candidates across all genders`);
            
            let candidates = allCandidates;
            
            if (!candidates || !Array.isArray(candidates)) {
                console.error('❌ calculateRuleBasedGuesses: candidates is not an array:', candidates);
                // Return fallback if any gender is non-binary
                const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
                const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
                if (hasNonBinary) {
                    console.log('⚠️ Returning fallback for non-binary due to invalid candidates');
                    return [
                        { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
                        { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
                        { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
                        { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
                        { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
                    ];
                }
                return [];
            }
            
            let scoredCandidates = [];
            
            if (candidates.length === 0) {
                console.log('⚠️ No candidates found, trying relaxed criteria...');
                
                // Try with relaxed length criteria using efficient lookups
                let relaxedCandidates = [];
                
                const genderValue = Array.isArray(this.answers.gender) ? this.answers.gender[0] : this.answers.gender;
                if (genderValue === 'NB' || genderValue === 'PREFER_NOT_TO_SAY') {
                    // Ensure database is loaded before getting non-binary names
                    if (this.enhancedNameDatabase.ensureLoaded) {
                        await this.enhancedNameDatabase.ensureLoaded();
                    }
                    // For non-binary or prefer not to say, use the existing method but with relaxed length
                    const nonBinaryNames = await this.enhancedNameDatabase.getNonBinaryNames();
                    console.log(`📊 Found ${nonBinaryNames ? nonBinaryNames.length : 0} non-binary names`);
                    if (nonBinaryNames && nonBinaryNames.length > 0) {
                        if (this.answers.length) {
                            relaxedCandidates = nonBinaryNames.filter(nameInfo => {
                                if (this.answers.length === 'long') {
                                    return nameInfo.name.length >= 6; // Relaxed: 6+ instead of 7+
                                } else if (this.answers.length === 'extra_long') {
                                    return nameInfo.name.length >= 8; // Relaxed: 8+ instead of 10+
                                } else if (this.answers.length === 'medium') {
                                    return nameInfo.name.length >= 4 && nameInfo.name.length <= 7; // Relaxed medium
                                } else if (this.answers.length === 'short') {
                                    return nameInfo.name.length <= 5; // Relaxed short
                                }
                                return true;
                            });
                        } else {
                            // No length specified, use all non-binary names
                            relaxedCandidates = nonBinaryNames;
                        }
                        console.log(`✅ After relaxed filtering: ${relaxedCandidates.length} candidates`);
                    }
                    // If still no candidates, will use fallback below
                } else {
                    // Use efficient gender lookup, then filter with relaxed length
                    const genderCandidates = this.enhancedNameDatabase.getNamesByGender(this.answers.gender);
                    relaxedCandidates = genderCandidates.filter(nameInfo => {
                        // Relax length: if they want long, accept 6+ letters; if extra_long, accept 8+ letters
                        if (this.answers.length === 'long') {
                            const nameLength = nameInfo.name.length;
                            if (nameLength < 6) return false; // Still reject very short names
                        }
                        if (this.answers.length === 'extra_long') {
                            const nameLength = nameInfo.name.length;
                            if (nameLength < 8) return false; // Still reject very short names
                        }
                        
                        // Keep vowel filter
                        if (this.answers.starts_with) {
                            const firstLetter = nameInfo.name.charAt(0).toLowerCase();
                            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
                            if (this.answers.starts_with === 'vowel' && !isVowel) return false;
                            if (this.answers.starts_with === 'consonant' && isVowel) return false;
                        }
                        
                        return true;
                    });
                }
                
                if (relaxedCandidates.length === 0) {
                    // Create fallback names that respect gender and length preferences
                    const fallbackNames = [];
                    
                    // Add names based on gender preference
                    if (this.answers.gender === 'F' || !this.answers.gender) {
                        if (this.answers.length === 'long') {
                            fallbackNames.push(
                            { name: 'Elizabeth', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Victoria', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Isabella', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Gabrielle', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Stephanie', gender: 'F', totalCount: 1000, languageOrigin: 'english' }
                        );
                    } else                         if (this.answers.length === 'extra_long') {
                            fallbackNames.push(
                            { name: 'Alexandria', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Christina', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Katherine', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Stephanie', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Elizabeth', gender: 'F', totalCount: 1000, languageOrigin: 'english' }
                        );
                    } else                         if (this.answers.length === 'medium') {
                            fallbackNames.push(
                            { name: 'Sarah', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Emma', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Grace', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Faith', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Hope', gender: 'F', totalCount: 1000, languageOrigin: 'english' }
                        );
                    } else {
                            fallbackNames.push(
                            { name: 'Amy', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Eva', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Ivy', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Joy', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Zoe', gender: 'F', totalCount: 1000, languageOrigin: 'english' }
                        );
                        }
                    }
                    
                    if (this.answers.gender === 'M' || !this.answers.gender) {
                        if (this.answers.length === 'long') {
                            fallbackNames.push(
                            { name: 'Alexander', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Christopher', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Benjamin', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Nathaniel', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Sebastian', gender: 'M', totalCount: 1000, languageOrigin: 'english' }
                        );
                    } else                         if (this.answers.length === 'extra_long') {
                            fallbackNames.push(
                            { name: 'Alexander', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Christopher', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Nathaniel', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Sebastian', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Theodore', gender: 'M', totalCount: 1000, languageOrigin: 'english' }
                        );
                    } else                         if (this.answers.length === 'medium') {
                            fallbackNames.push(
                            { name: 'David', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'James', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Henry', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Peter', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Lucas', gender: 'M', totalCount: 1000, languageOrigin: 'english' }
                        );
                    } else {
                            fallbackNames.push(
                            { name: 'Alex', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'John', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Paul', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Mark', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Luke', gender: 'M', totalCount: 1000, languageOrigin: 'english' }
                        );
                        }
                    }
                    
                    // If no gender specified, add some neutral names
                    if (!this.answers.gender) {
                        if (this.answers.length === 'long') {
                            fallbackNames.push(
                            { name: 'Alexandra', gender: 'F', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Alexander', gender: 'M', totalCount: 1000, languageOrigin: 'english' }
                        );
                    } else {
                            fallbackNames.push(
                            { name: 'Alex', gender: 'M', totalCount: 1000, languageOrigin: 'english' },
                            { name: 'Emma', gender: 'F', totalCount: 1000, languageOrigin: 'english' }
                        );
                        }
                    }
                    
                    // Add non-binary fallback names if gender is non-binary or prefer not to say
                    if (this.answers.gender === 'NB') {
                        if (this.answers.length === 'long') {
                            fallbackNames.push(
                            { name: 'Alex', gender: 'NB', totalCount: 2000, maleCount: 1000, femaleCount: 1000, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Jordan', gender: 'NB', totalCount: 1800, maleCount: 900, femaleCount: 900, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Taylor', gender: 'NB', totalCount: 1600, maleCount: 800, femaleCount: 800, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Casey', gender: 'NB', totalCount: 1400, maleCount: 700, femaleCount: 700, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Morgan', gender: 'NB', totalCount: 1200, maleCount: 600, femaleCount: 600, genderBalance: 1.0, languageOrigin: 'english' }
                        );
                    } else                         if (this.answers.length === 'extra_long') {
                            fallbackNames.push(
                            { name: 'Alexandria', gender: 'NB', totalCount: 2000, maleCount: 1000, femaleCount: 1000, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Christopher', gender: 'NB', totalCount: 1800, maleCount: 900, femaleCount: 900, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Stephanie', gender: 'NB', totalCount: 1600, maleCount: 800, femaleCount: 800, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Nathaniel', gender: 'NB', totalCount: 1400, maleCount: 700, femaleCount: 700, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Gabrielle', gender: 'NB', totalCount: 1200, maleCount: 600, femaleCount: 600, genderBalance: 1.0, languageOrigin: 'english' }
                        );
                    } else                         if (this.answers.length === 'medium') {
                            fallbackNames.push(
                            { name: 'Alex', gender: 'NB', totalCount: 2000, maleCount: 1000, femaleCount: 1000, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Jordan', gender: 'NB', totalCount: 1800, maleCount: 900, femaleCount: 900, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Taylor', gender: 'NB', totalCount: 1600, maleCount: 800, femaleCount: 800, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Casey', gender: 'NB', totalCount: 1400, maleCount: 700, femaleCount: 700, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Morgan', gender: 'NB', totalCount: 1200, maleCount: 600, femaleCount: 600, genderBalance: 1.0, languageOrigin: 'english' }
                        );
                    } else {
                            fallbackNames.push(
                            { name: 'Alex', gender: 'NB', totalCount: 2000, maleCount: 1000, femaleCount: 1000, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Sam', gender: 'NB', totalCount: 1800, maleCount: 900, femaleCount: 900, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Jamie', gender: 'NB', totalCount: 1600, maleCount: 800, femaleCount: 800, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Avery', gender: 'NB', totalCount: 1400, maleCount: 700, femaleCount: 700, genderBalance: 1.0, languageOrigin: 'english' },
                            { name: 'Riley', gender: 'NB', totalCount: 1200, maleCount: 600, femaleCount: 600, genderBalance: 1.0, languageOrigin: 'english' }
                        );
                        }
                    }
                    
                    scoredCandidates = fallbackNames.map(name => ({
                        ...name,
                        score: this.calculateNameScore(name)
                    }));
                } else {
                    scoredCandidates = relaxedCandidates.map(candidate => ({
                        ...candidate,
                        score: this.calculateNameScore(candidate)
                    }));
                }
            } else {
                // Score each candidate based on how well they match the responses
                scoredCandidates = candidates.map(candidate => ({
                    ...candidate,
                    score: this.calculateNameScore(candidate)
                }));
            }
            
            // Sort by score (highest first), then by popularity as tiebreaker
            scoredCandidates.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return b.totalCount - a.totalCount;
            });
            
            const result = scoredCandidates.slice(0, count);
            console.log(`✅ calculateRuleBasedGuesses: Returning ${result.length} guesses after scoring`);
            console.log(`✅ calculateRuleBasedGuesses: scoredCandidates.length=${scoredCandidates.length}, result.length=${result.length}`);
            
            // If we still have no guesses, return fallback non-binary names
            if (!result || result.length === 0) {
                console.log(`⚠️ No guesses found after scoring. Gender: ${JSON.stringify(this.answers.gender)}`);
                console.log(`⚠️ scoredCandidates.length: ${scoredCandidates.length}`);
                const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
                const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
                if (hasNonBinary) {
                    console.log('⚠️ Using hardcoded fallback for non-binary - returning 5 names');
                    const fallback = [
                        { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
                        { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
                        { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
                        { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
                        { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
                    ];
                    console.log(`✅ calculateRuleBasedGuesses: Returning fallback with ${fallback.length} names`);
                    return fallback;
                }
                console.log(`⚠️ calculateRuleBasedGuesses: Returning empty array for gender=${this.answers.gender}`);
                return [];
            }
            
            console.log(`✅ calculateRuleBasedGuesses: Final result has ${result.length} guesses`);
            return result;
        } catch (error) {
            console.error('❌ calculateRuleBasedGuesses: Error occurred:', error);
            console.error('Stack:', error.stack);
            // Return fallback if any gender is non-binary
            const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
            const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
            if (hasNonBinary) {
                return [
                    { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
                    { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
                    { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
                    { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
                    { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
                ];
            }
            return [];
        }
    }

    combinePredictions(ruleBasedGuesses, mlPredictions, count) {
        // If no rule-based guesses, return empty array
        if (!ruleBasedGuesses || ruleBasedGuesses.length === 0) {
            console.log('⚠️ combinePredictions: No rule-based guesses to combine');
            return [];
        }
        
        const combinedScores = new Map();
        
        // Add rule-based scores
        ruleBasedGuesses.forEach((guess, index) => {
            const weight = 0.7; // Rule-based gets 70% weight
            const adjustedScore = guess.score * weight;
            combinedScores.set(guess.name, {
                ...guess,
                ruleScore: guess.score,
                mlScore: 0,
                combinedScore: adjustedScore,
                source: 'rule-based'
            });
        });
        
        // Add ML predictions if available AND we have rule-based candidates
        if (mlPredictions && mlPredictions.length > 0 && ruleBasedGuesses.length > 0) {
            
            // Get top ML predictions
            const mlTopIndices = Array.from({length: mlPredictions.length}, (_, i) => i)
                .sort((a, b) => mlPredictions[b] - mlPredictions[a])
                .slice(0, count);
            
            mlTopIndices.forEach((index, rank) => {
                const name = this.mlModel.getNameFromIndex(index);
                const mlScore = mlPredictions[index] * 100; // Convert to 0-100 scale
                const weight = 0.3; // ML gets 30% weight
                
                if (combinedScores.has(name)) {
                    // Combine with existing rule-based score
                    const existing = combinedScores.get(name);
                    existing.mlScore = mlScore;
                    existing.combinedScore = existing.ruleScore * 0.7 + mlScore * 0.3;
                    existing.source = 'hybrid';
                } else {
                    // Add new ML-only prediction
                    combinedScores.set(name, {
                        name: name,
                        gender: 'M', // Default, will be updated if found in database
                        totalCount: 100,
                        languageOrigin: 'unknown',
                        ruleScore: 0,
                        mlScore: mlScore,
                        combinedScore: mlScore * weight,
                        source: 'ml-only'
                    });
                }
            });
        } else if (ruleBasedGuesses.length === 0) {
        }
        
        // Sort by combined score and return top guesses
        const sortedGuesses = Array.from(combinedScores.values())
            .sort((a, b) => b.combinedScore - a.combinedScore)
            .slice(0, count);
        
        
        const finalGuesses = sortedGuesses.map((guess, index) => ({
            ...guess,
            score: guess.combinedScore,
            confidence: this.calculateConfidenceForGuess(guess, index + 1, sortedGuesses)
        }));
        
        
        return finalGuesses;
    }

    displayTopGuesses(guesses) {
        console.log(`📺 displayTopGuesses: Displaying ${guesses ? guesses.length : 0} guesses`);
        
        if (!guesses || guesses.length === 0) {
            console.error('❌ No guesses to display!');
            // Show error message or fallback
            for (let i = 1; i <= 5; i++) {
                const guessElement = document.getElementById(`guess${i}`);
                if (guessElement) {
                    guessElement.style.display = 'none';
                }
            }
            return;
        }
        
        for (let i = 0; i < 5; i++) {
            const guessElement = document.getElementById(`guess${i + 1}`);
            const nameElement = document.getElementById(`guessName${i + 1}`);
            const confidenceElement = document.getElementById(`confidence${i + 1}`);
            
            if (!guessElement || !nameElement || !confidenceElement) {
                console.error(`❌ Missing DOM elements for guess ${i + 1}`);
                continue;
            }
            
            if (i < guesses.length && guesses[i] && guesses[i].name) {
                const guess = guesses[i];
                let confidence = guess.confidence;
                
                // If confidence wasn't calculated, calculate it now
                if (confidence === undefined || confidence === null) {
                    confidence = this.calculateConfidenceForGuess(guess, i + 1, guesses);
                }
                
                // If we still don't have confidence, normalize score as fallback
                if (confidence === undefined || confidence === null) {
                    if (guess.score !== undefined && guess.score !== null) {
                        // Normalize score: find max score in all guesses to normalize against
                        const maxScore = guesses.length > 0 
                            ? Math.max(...guesses.map(g => g.score || 0))
                            : guess.score;
                        
                        if (maxScore > 0) {
                            // Normalize to 0-1, then scale to 40-95 range
                            const normalizedScore = guess.score / maxScore;
                            confidence = 40 + (normalizedScore * 55); // Range: 40-95%
                        } else {
                            confidence = 50; // Default
                        }
                        
                        // Apply rank penalty
                        confidence -= (i * 8);
                    } else {
                        // Last resort: simple rank-based confidence
                        confidence = 75 - (i * 8);
                    }
                }
                
                // Ensure confidence is in valid range
                confidence = Math.min(100, Math.max(20, Math.round(confidence)));
                
                nameElement.textContent = guess.name;
                confidenceElement.textContent = `${confidence}%`;
                guessElement.style.display = 'flex';
                console.log(`✅ Displaying guess ${i + 1}: ${guess.name} (${confidence}%)`);
            } else {
                guessElement.style.display = 'none';
            }
        }
    }

    calculateConfidenceForGuess(guess, rank, allGuesses = []) {
        // If confidence is already set, use it (but adjust for rank)
        if (guess.confidence !== undefined && guess.confidence !== null) {
            const rankPenalty = (rank - 1) * 5; // Smaller penalty if confidence already calculated
            return Math.max(20, Math.min(100, Math.round(guess.confidence - rankPenalty)));
        }
        
        // Calculate confidence based on score relative to other guesses
        let baseConfidence = 50; // Default base
        
        if (guess.score !== undefined && guess.score !== null) {
            // Normalize score to a percentage
            // Scores typically range from 0-200+, so we need to normalize
            // Use the max score in the list to normalize, or use a reasonable max
            const maxScore = allGuesses.length > 0 
                ? Math.max(...allGuesses.map(g => g.score || 0))
                : guess.score;
            
            if (maxScore > 0) {
                // Normalize to 0-1, then scale to 40-95 range
                const normalizedScore = guess.score / maxScore;
                baseConfidence = 40 + (normalizedScore * 55); // Range: 40-95%
            } else {
                baseConfidence = 50;
            }
        }
        
        // Reduce confidence for lower ranks
        const rankPenalty = (rank - 1) * 8;
        
        // Add small randomness to make it feel more natural (±3%)
        const randomFactor = (Math.random() - 0.5) * 6;
        
        const confidence = Math.round(Math.max(20, Math.min(95, baseConfidence - rankPenalty + randomFactor)));
        return confidence;
    }

    calculateNameScore(nameInfo) {
        let score = 0;
        
        
        // HIGHEST PRIORITY: Political/Cultural identity (60 points) - NPR research shows this is the strongest predictor
        if (this.answers.political_values) {
            const politicalSelections = Array.isArray(this.answers.political_values) 
                ? this.answers.political_values 
                : [this.answers.political_values];
            
            // Traditional/conservative values correlate with English names
            const traditionalValues = ['traditional', 'security', 'community'];
            const progressiveValues = ['diverse', 'progressive', 'justice', 'environment'];
            
            const hasTraditionalValues = politicalSelections.some(val => traditionalValues.includes(val));
            const hasProgressiveValues = politicalSelections.some(val => progressiveValues.includes(val));
            
            if (nameInfo.languageOrigin === 'english' && hasTraditionalValues) {
                score += 60; // Strong traditional + English name match
            } else if (nameInfo.languageOrigin !== 'english' && hasProgressiveValues) {
                score += 60; // Strong progressive + non-English name match
            } else if (nameInfo.languageOrigin === 'english' && hasProgressiveValues) {
                score += 30; // Partial match
            } else if (nameInfo.languageOrigin !== 'english' && hasTraditionalValues) {
                score += 20; // Weaker match
            }
        }
        
        // HIGH PRIORITY: Language preference (50 points) - 84% of blue state names are non-English
        if (this.answers.language_preference) {
            const languageSelections = Array.isArray(this.answers.language_preference) 
                ? this.answers.language_preference 
                : [this.answers.language_preference];
            
            if (languageSelections.includes('english_only') && nameInfo.languageOrigin === 'english') {
                score += 50; // Strong English-only preference match
            } else if (languageSelections.includes('multilingual') && nameInfo.languageOrigin !== 'english') {
                score += 50; // Multilingual preference + non-English name
            } else if (languageSelections.some(lang => lang === nameInfo.languageOrigin)) {
                score += 45; // Direct language match
            } else if (languageSelections.includes('english_only') && nameInfo.languageOrigin !== 'english') {
                score -= 20; // Penalty for mismatch
            }
        }
        
        // HIGH PRIORITY: Cultural/Religious factors (40-50 points) - Still very important
        if (this.answers.religious_tradition) {
            const religiousSelections = Array.isArray(this.answers.religious_tradition) 
                ? this.answers.religious_tradition 
                : [this.answers.religious_tradition];
            
            const validReligions = religiousSelections.filter(religion => 
                religion !== "prefer_not_to_say" && 
                religion !== "none" && 
                religion !== "other_spiritual"
            );
            
            if (validReligions.length > 0 && nameInfo.religions) {
                const hasReligiousMatch = validReligions.some(religion => 
                    nameInfo.religions.includes(religion)
                );
                if (hasReligiousMatch) {
                    score += 50; // Strong religious match
                } else if (nameInfo.crossReligious) {
                    score += 25; // Cross-religious compatibility
                }
            }
        }
        
        // HIGH PRIORITY: Cultural background (35-45 points) - Major socioeconomic determinant
        if (this.answers.cultural_background) {
            const culturalSelections = Array.isArray(this.answers.cultural_background) 
                ? this.answers.cultural_background 
                : [this.answers.cultural_background];
            
            const validCultures = culturalSelections.filter(culture => 
                culture !== "prefer_not_to_say" && 
                culture !== "mixed"
            );
            
            if (validCultures.length > 0 && nameInfo.culturalOrigins) {
                const hasCulturalMatch = validCultures.some(culture => 
                    nameInfo.culturalOrigins.includes(culture)
                );
                if (hasCulturalMatch) {
                    score += 45; // Strong cultural match
                }
            }
        }
        
        // HIGH: Name length (35 points) - Critical user preference that must be respected
        if (this.answers.length) {
            const nameLength = nameInfo.name.length;
            if (this.answers.length === 'short' && nameLength <= 4) score += 35;
            else if (this.answers.length === 'medium' && nameLength >= 5 && nameLength <= 6) score += 35;
            else if (this.answers.length === 'long' && nameLength >= 7) score += 35;
            else if (this.answers.length === 'short' && nameLength <= 5) score += 20; // partial match
            else if (this.answers.length === 'long' && nameLength >= 6) score += 20; // partial match
            else {
                // STRONG PENALTY for length mismatch - this is a critical user preference
                if (this.answers.length === 'long' && nameLength < 6) score -= 40; // Heavy penalty for long preference getting short name
                else if (this.answers.length === 'short' && nameLength > 5) score -= 30; // Penalty for short preference getting long name
                else if (this.answers.length === 'medium' && (nameLength < 4 || nameLength > 7)) score -= 25; // Penalty for medium preference mismatch
            }
        }
        
        // MEDIUM-HIGH: Gender (25 points) - Important demographic factor
        if (this.answers.gender && 
            this.answers.gender !== "NB" && 
            nameInfo.gender === this.answers.gender) {
            score += 25;
        }
        
        // MEDIUM: Popularity with generational trends (20 points) - Enhanced with decade analysis
        if (this.answers.popularity && this.answers.decade) {
            const isPopular = nameInfo.totalCount > 500;
            const isVeryPopular = nameInfo.totalCount > 800;
            
            // Check if name was popular in the specified decade
            const decadePopularity = this.getDecadePopularity(nameInfo, this.answers.decade);
            
            if (this.answers.popularity === 'very_popular' && isVeryPopular && decadePopularity > 0.7) score += 20;
            else if (this.answers.popularity === 'popular' && isPopular && decadePopularity > 0.5) score += 20;
            else if (this.answers.popularity === 'uncommon' && !isPopular && decadePopularity < 0.3) score += 20;
            else if (this.answers.popularity === 'very_popular' && isPopular && decadePopularity > 0.5) score += 15; // partial match
            else if (this.answers.popularity === 'uncommon' && nameInfo.totalCount < 1000 && decadePopularity < 0.5) score += 15; // partial match
        } else if (this.answers.popularity) {
            // Fallback to original popularity logic if no decade specified
            const isPopular = nameInfo.totalCount > 500;
            const isVeryPopular = nameInfo.totalCount > 800;
            
            if (this.answers.popularity === 'very_popular' && isVeryPopular) score += 20;
            else if (this.answers.popularity === 'popular' && isPopular && !isVeryPopular) score += 20;
            else if (this.answers.popularity === 'uncommon' && !isPopular) score += 20;
            else if (this.answers.popularity === 'very_popular' && isPopular) score += 10; // partial match
            else if (this.answers.popularity === 'uncommon' && nameInfo.totalCount < 1000) score += 10; // partial match
        }
        
        // MEDIUM: Vowel/consonant start (15 points) - Name letter effect
        if (this.answers.starts_with) {
            const firstLetter = nameInfo.name.charAt(0).toLowerCase();
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            if ((this.answers.starts_with === 'vowel' && isVowel) || 
                (this.answers.starts_with === 'consonant' && !isVowel)) {
                score += 15;
            }
        }
        
        // NEW: Name letter effect - preference for names starting with letters from their own name
        if (this.answers.favorite_letter) {
            const nameFirstLetter = nameInfo.name.charAt(0).toLowerCase();
            if (nameFirstLetter === this.answers.favorite_letter.toLowerCase()) {
                score += 20; // Strong name letter effect
            }
        }
        
        // NEW: Socioeconomic factors based on career/education interests
        if (this.answers.career_path && nameInfo.socioeconomicLevel) {
            const careerSelections = Array.isArray(this.answers.career_path) 
                ? this.answers.career_path 
                : [this.answers.career_path];
            
            // Higher education careers correlate with traditional/elite names
            const highEducationCareers = ['legal', 'medical', 'science', 'education', 'technology', 'engineering'];
            const hasHighEducationCareer = careerSelections.some(career => 
                highEducationCareers.includes(career)
            );
            
            if (hasHighEducationCareer && nameInfo.socioeconomicLevel === 'high') {
                score += 15;
            } else if (!hasHighEducationCareer && nameInfo.socioeconomicLevel === 'medium') {
                score += 10;
            }
        }
        
        // MEDIUM: Family tradition importance (20 points) - Predicts traditional vs modern names
        if (this.answers.family_tradition) {
            if (this.answers.family_tradition >= 2.5 && nameInfo.traditionalSignificance === 'high') {
                score += 20; // Strong traditional match
            } else if (this.answers.family_tradition <= 1.5 && nameInfo.traditionalSignificance === 'low') {
                score += 20; // Strong modern match
            } else if (this.answers.family_tradition >= 2.0 && nameInfo.traditionalSignificance === 'medium') {
                score += 15; // Partial traditional match
            } else if (this.answers.family_tradition <= 2.0 && nameInfo.traditionalSignificance === 'medium') {
                score += 15; // Partial modern match
            }
        }
        
        // MEDIUM: Diversity attitude (15 points) - Correlates with name origin diversity
        if (this.answers.diversity_attitude) {
            if (this.answers.diversity_attitude >= 2.5 && nameInfo.languageOrigin !== 'english') {
                score += 15; // High diversity preference + non-English name
            } else if (this.answers.diversity_attitude <= 1.5 && nameInfo.languageOrigin === 'english') {
                score += 15; // Low diversity preference + English name
            } else if (this.answers.diversity_attitude >= 2.0 && nameInfo.languageOrigin !== 'english') {
                score += 10; // Partial diversity match
            }
        }
        
        // MEDIUM: Name meaning preference (15 points) - Semantic matching
        if (this.answers.name_meaning_preference && nameInfo.nameMeaning) {
            const meaningSelections = Array.isArray(this.answers.name_meaning_preference) 
                ? this.answers.name_meaning_preference 
                : [this.answers.name_meaning_preference];
            
            const hasMeaningMatch = meaningSelections.some(meaning => 
                nameInfo.nameMeaning.includes(meaning)
            );
            if (hasMeaningMatch) {
                score += 15; // Name meaning match
            }
        }
        
        // CRITICAL: Rural/Urban factor (30 points) - Namerology research shows rural areas are LEAST traditional
        if (this.answers.grew_up_location) {
            const locationSelections = Array.isArray(this.answers.grew_up_location) 
                ? this.answers.grew_up_location 
                : [this.answers.grew_up_location];
            
            const isRuralGrewUp = locationSelections.some(loc => 
                ['rural_grew_up', 'agricultural_grew_up'].includes(loc)
            );
            const isUrbanGrewUp = locationSelections.some(loc => 
                ['urban_grew_up', 'international_grew_up'].includes(loc)
            );
            
            // Counterintuitive: Rural areas prefer NON-traditional names, urban areas prefer traditional names
            if (isRuralGrewUp && nameInfo.traditionalSignificance === 'low') {
                score += 30; // Rural + non-traditional name (research-backed)
            } else if (isUrbanGrewUp && nameInfo.traditionalSignificance === 'high') {
                score += 30; // Urban + traditional name (research-backed)
            } else if (isRuralGrewUp && nameInfo.traditionalSignificance === 'medium') {
                score += 20; // Rural + medium traditional
            } else if (isUrbanGrewUp && nameInfo.traditionalSignificance === 'medium') {
                score += 20; // Urban + medium traditional
            } else if (isRuralGrewUp && nameInfo.traditionalSignificance === 'high') {
                score -= 15; // Rural + traditional name (counter to research)
            } else if (isUrbanGrewUp && nameInfo.traditionalSignificance === 'low') {
                score -= 10; // Urban + non-traditional name (counter to research)
            }
        }
        
        // HIGH: Name perception matching (25 points) - How people perceive your name
        if (this.answers.name_perception && nameInfo.perceivedTraits) {
            const perceptionSelections = Array.isArray(this.answers.name_perception) 
                ? this.answers.name_perception 
                : [this.answers.name_perception];
            
            const hasPerceptionMatch = perceptionSelections.some(perception => 
                nameInfo.perceivedTraits.includes(perception)
            );
            if (hasPerceptionMatch) {
                score += 25; // Strong perception match
            }
        }
        
        // HIGH: Desired impression matching (25 points) - What impression you want to give
        if (this.answers.desired_impression && nameInfo.desiredTraits) {
            const impressionSelections = Array.isArray(this.answers.desired_impression) 
                ? this.answers.desired_impression 
                : [this.answers.desired_impression];
            
            const hasImpressionMatch = impressionSelections.some(impression => 
                nameInfo.desiredTraits.includes(impression)
            );
            if (hasImpressionMatch) {
                score += 25; // Strong desired impression match
            }
        }
        
        // HIGH: Name reactions matching (25 points) - How people react to your name
        if (this.answers.name_reactions && nameInfo.typicalReactions) {
            const reactionSelections = Array.isArray(this.answers.name_reactions) 
                ? this.answers.name_reactions 
                : [this.answers.name_reactions];
            
            const hasReactionMatch = reactionSelections.some(reaction => 
                nameInfo.typicalReactions.includes(reaction)
            );
            if (hasReactionMatch) {
                score += 25; // Strong reaction match
            }
        }
        
        // MEDIUM: Community type (15 points) - Geographic correlation
        if (this.answers.community_type && nameInfo.geographicPreference) {
            const communitySelections = Array.isArray(this.answers.community_type) 
                ? this.answers.community_type 
                : [this.answers.community_type];
            
            const hasCommunityMatch = communitySelections.some(community => 
                nameInfo.geographicPreference.includes(community)
            );
            if (hasCommunityMatch) {
                score += 15; // Community type match
            }
        }
        
        return score;
    }

    getDecadePopularity(nameInfo, decade) {
        const decadeRanges = {
            1900: [1900, 1909],
            1910: [1910, 1919],
            1920: [1920, 1929],
            1930: [1930, 1939],
            1940: [1940, 1949],
            1950: [1950, 1959],
            1960: [1960, 1969],
            1970: [1970, 1979],
            1980: [1980, 1989],
            1990: [1990, 1999],
            2000: [2000, 2009],
            2010: [2010, 2019],
            2020: [2020, 2029]
        };
        
        // If we have year-by-year data, calculate decade-specific popularity
        if (nameInfo.years && Array.isArray(nameInfo.years) && nameInfo.years.length > 0) {
            const [decadeStart, decadeEnd] = decadeRanges[decade] || [decade, decade + 9];
            let decadeCount = 0;
            let totalDecadeCount = 0;
            
            // Sum counts for this name in the specified decade
            nameInfo.years.forEach(yearData => {
                const year = parseInt(yearData.year);
                if (year >= decadeStart && year <= decadeEnd) {
                    decadeCount += yearData.count || 0;
                }
            });
            
            // Calculate what percentage of total usage this decade represents
            // Normalize to 0-1 scale where 1.0 = very popular in that decade
            if (nameInfo.totalCount > 0) {
                const decadeRatio = decadeCount / nameInfo.totalCount;
                // If the name was used a lot in this decade relative to its total usage, it's popular
                // Average decade would be ~10% of total (1/10 decades), so we scale accordingly
                return Math.min(1.0, decadeRatio * 10); // Scale so 10% = 1.0
            }
        }
        
        // Fallback: use total popularity as a proxy
        if (nameInfo.totalCount > 1000) return 0.8; // Very popular
        if (nameInfo.totalCount > 500) return 0.6;  // Popular
        if (nameInfo.totalCount > 100) return 0.4;  // Somewhat popular
        return 0.2; // Uncommon
    }

    async getCandidates() {
        
        // Ensure database is loaded
        if (this.enhancedNameDatabase.ensureLoaded) {
            await this.enhancedNameDatabase.ensureLoaded();
        } else {
            // Wait a bit for database to load
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Use comprehensive lookups based on all user preferences
        // For non-binary (PREFER_NOT_TO_SAY is normalized to NB earlier), use only non-binary names database
        // Handle both array and string values for gender
        const genderValue = Array.isArray(this.answers.gender) ? this.answers.gender[0] : this.answers.gender;
        if (genderValue === 'NB' || genderValue === 'PREFER_NOT_TO_SAY') {
            console.log(`🔍 getCandidates: Getting non-binary names for gender=${this.answers.gender}`);
            
            // Ensure database is loaded
            if (this.enhancedNameDatabase && this.enhancedNameDatabase.ensureLoaded) {
                await this.enhancedNameDatabase.ensureLoaded();
            }
            
            if (!this.enhancedNameDatabase || !this.enhancedNameDatabase.getNonBinaryNames) {
                console.error('❌ getCandidates: enhancedNameDatabase or getNonBinaryNames not available');
                return [];
            }
            
            const nonBinaryNames = await this.enhancedNameDatabase.getNonBinaryNames();
            console.log(`📊 getCandidates: Found ${nonBinaryNames ? nonBinaryNames.length : 0} non-binary names`);
            
            if (!nonBinaryNames || !Array.isArray(nonBinaryNames)) {
                console.error('❌ getCandidates: nonBinaryNames is not an array:', nonBinaryNames);
                return [];
            }
            
            // Filter by length if specified
            let candidates = nonBinaryNames;
            if (this.answers.length && candidates.length > 0) {
                const beforeFilter = candidates.length;
                candidates = candidates.filter(nameInfo => {
                    if (!nameInfo || !nameInfo.name) return false;
                    const nameLength = nameInfo.name.length;
                    if (this.answers.length === 'short' && nameLength <= 4) return true;
                    if (this.answers.length === 'medium' && nameLength >= 5 && nameLength <= 6) return true;
                    if (this.answers.length === 'long' && nameLength >= 7 && nameLength <= 9) return true;
                    if (this.answers.length === 'extra_long' && nameLength >= 10) return true;
                    return false;
                });
                console.log(`📏 getCandidates: Filtered from ${beforeFilter} to ${candidates.length} by length=${this.answers.length}`);
            } else {
                console.log(`✅ getCandidates: No length filter, returning all ${candidates.length} non-binary names`);
            }
            
            console.log(`✅ getCandidates: Returning ${candidates.length} candidates for non-binary`);
            return candidates;
        } else {
            // Use comprehensive lookup with all criteria
            const state = this.answers.state;
            const gender = this.answers.gender;
            const length = this.answers.length;
            const vowel = this.answers.starts_with;
            const popularity = this.answers.popularity;
            
            
            // Try comprehensive lookup first
            let candidates = [];
            if (this.enhancedNameDatabase.getNamesByAllCriteria) {
                candidates = this.enhancedNameDatabase.getNamesByAllCriteria(state, gender, length, vowel, popularity);
            } else if (this.enhancedNameDatabase.getNamesByGenderAndLength) {
                candidates = this.enhancedNameDatabase.getNamesByGenderAndLength(gender, length);
            } else {
                // Fallback to basic filtering
                const allNames = Object.values(this.enhancedNameDatabase.nameData || {});
                candidates = allNames.filter(nameInfo => {
                    return nameInfo.gender === gender && 
                           ((length === 'short' && nameInfo.name.length <= 4) ||
                            (length === 'medium' && nameInfo.name.length >= 5 && nameInfo.name.length <= 6) ||
                            (length === 'long' && nameInfo.name.length >= 7));
                });
            }
            
            if (candidates.length === 0 && this.enhancedNameDatabase.getNamesByStateGenderAndLength) {
                candidates = this.enhancedNameDatabase.getNamesByStateGenderAndLength(state, gender, length);
            }
            
            if (candidates.length === 0 && this.enhancedNameDatabase.getNamesByGenderAndLength) {
                candidates = this.enhancedNameDatabase.getNamesByGenderAndLength(gender, length);
            }
            
            if (candidates.length === 0 && this.enhancedNameDatabase.getNamesByGender) {
                candidates = this.enhancedNameDatabase.getNamesByGender(gender);
            }
            
            return candidates;
        }
    }

    basicCriteriaMatch(nameInfo) {
        // Only filter out names that absolutely don't match (like wrong gender)
        // Let the scoring system handle the rest
        
        // Check gender (include non-binary and prefer not to say as matching any gender)
        if (this.answers.gender && 
            this.answers.gender !== "NB" && 
            nameInfo.gender !== this.answers.gender) {
            return false;
        }
        
        // Only filter out if religious tradition is completely incompatible
        if (this.answers.religious_tradition) {
            const religiousSelections = Array.isArray(this.answers.religious_tradition) 
                ? this.answers.religious_tradition 
                : [this.answers.religious_tradition];
            
            const validReligions = religiousSelections.filter(religion => 
                religion !== "prefer_not_to_say" && 
                religion !== "none" && 
                religion !== "other_spiritual"
            );
            
            if (validReligions.length > 0 && nameInfo.religiousSignificance === 'incompatible') {
                return false;
            }
        }
        
        return true;
    }

    matchesCriteria(nameInfo) {
        
        // Check gender (PREFER_NOT_TO_SAY is normalized to NB earlier)
        if (this.answers.gender && 
            this.answers.gender !== "NB" && 
            nameInfo.gender !== this.answers.gender) {
            return false;
        }
        
        // For non-binary names, we already filtered in getCandidates(), so just pass through
        if (this.answers.gender === 'NB' && nameInfo.gender === 'NB') {
        }
        
        // Check name length - CRITICAL FILTER
        if (this.answers.length) {
            const nameLength = nameInfo.name.length;
            if (this.answers.length === 'short' && nameLength > 4) {
                return false;
            }
            if (this.answers.length === 'medium' && (nameLength < 5 || nameLength > 6)) {
                return false;
            }
            if (this.answers.length === 'long' && (nameLength < 7 || nameLength > 9)) {
                return false;
            }
            if (this.answers.length === 'extra_long' && nameLength < 10) {
                return false;
            }
        }
        
        // VOWEL/CONSONANT: Used for scoring only, not filtering
        // if (this.answers.starts_with) {
        //     const firstLetter = nameInfo.name.charAt(0).toLowerCase();
        //     const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
        //     if (this.answers.starts_with === 'vowel' && !isVowel) {
        //         return false;
        //     }
        //     if (this.answers.starts_with === 'consonant' && isVowel) {
        //         return false;
        //     }
        // }
        
        // POPULARITY: Used for scoring only, not filtering
        // if (this.answers.popularity) {
        //     const isPopular = nameInfo.totalCount > 500;
        //     const isVeryPopular = nameInfo.totalCount > 800;
        //     
        //     if (this.answers.popularity === 'very_popular' && !isVeryPopular) return false;
        //     if (this.answers.popularity === 'popular' && !isPopular) return false;
        //     if (this.answers.popularity === 'uncommon' && isPopular) return false;
        // }
        
        // RELIGIOUS TRADITION: Used for scoring only, not filtering
        // if (this.answers.religious_tradition) {
        //     const religiousSelections = Array.isArray(this.answers.religious_tradition) 
        //         ? this.answers.religious_tradition 
        //         : [this.answers.religious_tradition];
        //     
        //     // Filter out "prefer_not_to_say", "none", and "other_spiritual"
        //     const validReligions = religiousSelections.filter(religion => 
        //         religion !== "prefer_not_to_say" && 
        //         religion !== "none" && 
        //         religion !== "other_spiritual"
        //     );
        //     
        //     if (validReligions.length > 0) {
        //         const hasMatch = validReligions.some(religion => 
        //             nameInfo.religions && nameInfo.religions.includes(religion)
        //         );
        //         if (!hasMatch) {
        //             return false;
        //         }
        //     }
        // }
        
        // CULTURAL BACKGROUND: Used for scoring only, not filtering
        // if (this.answers.cultural_background) {
        //     const culturalSelections = Array.isArray(this.answers.cultural_background) 
        //         ? this.answers.cultural_background 
        //         : [this.answers.cultural_background];
        //     
        //     // Filter out "prefer_not_to_say" and "mixed"
        //     const validCultures = culturalSelections.filter(culture => 
        //         culture !== "prefer_not_to_say" && 
        //         culture !== "mixed"
        //     );
        //     
        //     if (validCultures.length > 0) {
        //         const hasMatch = validCultures.some(culture => 
        //             nameInfo.culturalOrigins && nameInfo.culturalOrigins.includes(culture)
        //         );
        //         if (!hasMatch) {
        //             return false;
        //         }
        //     }
        // }
        
        // BAPTISM/NAMING CEREMONIES: Used for scoring only, not filtering
        // if (this.answers.baptism_status) {
        //     const baptismSelections = Array.isArray(this.answers.baptism_status) 
        //         ? this.answers.baptism_status 
        //         : [this.answers.baptism_status];
        //     
        //     // Filter out "prefer_not_to_say", "unsure", and "none"
        //     const validCeremonies = baptismSelections.filter(ceremony => 
        //         ceremony !== "prefer_not_to_say" && 
        //         ceremony !== "unsure" && 
        //         ceremony !== "none"
        //     );
        //     
        //     if (validCeremonies.length > 0) {
        //         // Check for religious ceremony matches
        //         const hasReligiousMatch = validCeremonies.some(ceremony => {
        //             if (ceremony === "christian_baptized" && nameInfo.religions && nameInfo.religions.includes("christianity")) {
        //                 return true;
        //             }
        //             if (ceremony === "jewish_naming" && nameInfo.religions && nameInfo.religions.includes("judaism")) {
        //                 return true;
        //             }
        //             if (ceremony === "hindu_naming" && nameInfo.religions && nameInfo.religions.includes("hinduism")) {
        //                 return true;
        //             }
        //             if (ceremony === "islamic_naming" && nameInfo.religions && nameInfo.religions.includes("islam")) {
        //                 return true;
        //             }
        //             if (ceremony === "buddhist_naming" && nameInfo.religions && nameInfo.religions.includes("buddhism")) {
        //                 return true;
        //             }
        //             if (ceremony === "sikh_naming" && nameInfo.religions && nameInfo.religions.includes("sikhism")) {
        //                 return true;
        //             }
        //             return false;
        //         });
        //         
        //         if (hasReligiousMatch) {
        //             // Boost names that match religious ceremonies
        //             return true;
        //         }
        //     }
        // }
        
        // Check state (for now, just return true as we don't have state-specific data)
        if (this.answers.state) {
            // State filtering could be added here if we had state-specific name data
            // For now, we'll just use it as a general preference
        }
        
        return true;
    }

    async calculateConfidence() {
        const candidates = await this.getCandidates();
        if (candidates.length === 0) return 25; // Lower base confidence
        if (candidates.length === 1) return 95;
        
        // Base confidence on number of candidates
        let confidence = 50; // Lower base confidence
        if (candidates.length <= 2) confidence = 85;
        else if (candidates.length <= 5) confidence = 75;
        else if (candidates.length <= 10) confidence = 65;
        else if (candidates.length <= 20) confidence = 55;
        
        const topCandidate = candidates[0];
        
        // HIGHEST CONFIDENCE BOOST: Political/cultural identity matches (NPR research shows strongest predictor)
        let politicalCulturalBoost = 0;
        
        // Political values match boost
        if (this.answers.political_values) {
            const politicalSelections = Array.isArray(this.answers.political_values) 
                ? this.answers.political_values 
                : [this.answers.political_values];
            
            const traditionalValues = ['traditional', 'security', 'community'];
            const progressiveValues = ['diverse', 'progressive', 'justice', 'environment'];
            
            const hasTraditionalValues = politicalSelections.some(val => traditionalValues.includes(val));
            const hasProgressiveValues = politicalSelections.some(val => progressiveValues.includes(val));
            
            if (topCandidate.languageOrigin === 'english' && hasTraditionalValues) {
                politicalCulturalBoost += 25; // Strong traditional + English match
            } else if (topCandidate.languageOrigin !== 'english' && hasProgressiveValues) {
                politicalCulturalBoost += 25; // Strong progressive + non-English match
            }
        }
        
        // Language preference match boost
        if (this.answers.language_preference) {
            const languageSelections = Array.isArray(this.answers.language_preference) 
                ? this.answers.language_preference 
                : [this.answers.language_preference];
            
            if (languageSelections.includes('english_only') && topCandidate.languageOrigin === 'english') {
                politicalCulturalBoost += 20; // English-only preference match
            } else if (languageSelections.includes('multilingual') && topCandidate.languageOrigin !== 'english') {
                politicalCulturalBoost += 20; // Multilingual + non-English match
            }
        }
        
        // Religious match boost
        if (this.answers.religious_tradition) {
            const religiousSelections = Array.isArray(this.answers.religious_tradition) 
                ? this.answers.religious_tradition 
                : [this.answers.religious_tradition];
            
            const validReligions = religiousSelections.filter(religion => 
                religion !== "prefer_not_to_say" && 
                religion !== "none" && 
                religion !== "other_spiritual"
            );
            
            if (validReligions.length > 0 && topCandidate.religions) {
                const hasReligiousMatch = validReligions.some(religion => 
                    topCandidate.religions.includes(religion)
                );
                if (hasReligiousMatch) {
                    politicalCulturalBoost += 15; // Religious match
                }
            }
        }
        
        confidence += politicalCulturalBoost;
        
        // HIGH CONFIDENCE BOOST: Rural/Urban factor (Namerology research)
        let ruralUrbanBoost = 0;
        
        if (this.answers.grew_up_location) {
            const locationSelections = Array.isArray(this.answers.grew_up_location) 
                ? this.answers.grew_up_location 
                : [this.answers.grew_up_location];
            
            const isRuralGrewUp = locationSelections.some(loc => 
                ['rural_grew_up', 'agricultural_grew_up'].includes(loc)
            );
            const isUrbanGrewUp = locationSelections.some(loc => 
                ['urban_grew_up', 'international_grew_up'].includes(loc)
            );
            
            // Counterintuitive research finding: Rural = non-traditional, Urban = traditional
            if (isRuralGrewUp && topCandidate.traditionalSignificance === 'low') {
                ruralUrbanBoost += 20; // Strong rural + non-traditional match
            } else if (isUrbanGrewUp && topCandidate.traditionalSignificance === 'high') {
                ruralUrbanBoost += 20; // Strong urban + traditional match
            } else if (isRuralGrewUp && topCandidate.traditionalSignificance === 'medium') {
                ruralUrbanBoost += 12; // Partial rural match
            } else if (isUrbanGrewUp && topCandidate.traditionalSignificance === 'medium') {
                ruralUrbanBoost += 12; // Partial urban match
            }
        }
        
        confidence += ruralUrbanBoost;
        
        // MEDIUM CONFIDENCE BOOST: Name letter effect and socioeconomic factors
        let additionalBoost = 0;
        
        // Name letter effect boost
        if (this.answers.favorite_letter) {
            const nameFirstLetter = topCandidate.name.charAt(0).toLowerCase();
            if (nameFirstLetter === this.answers.favorite_letter.toLowerCase()) {
                additionalBoost += 10; // Name letter effect
            }
        }
        
        // Socioeconomic match boost
        if (this.answers.career_path && topCandidate.socioeconomicLevel) {
            const careerSelections = Array.isArray(this.answers.career_path) 
                ? this.answers.career_path 
                : [this.answers.career_path];
            
            const highEducationCareers = ['legal', 'medical', 'science', 'education', 'technology', 'engineering'];
            const hasHighEducationCareer = careerSelections.some(career => 
                highEducationCareers.includes(career)
            );
            
            if (hasHighEducationCareer && topCandidate.socioeconomicLevel === 'high') {
                additionalBoost += 8; // Socioeconomic match
            } else if (!hasHighEducationCareer && topCandidate.socioeconomicLevel === 'medium') {
                additionalBoost += 5;
            }
        }
        
        confidence += additionalBoost;
        
        // HIGH CONFIDENCE BOOST: Name perception factors
        let perceptionBoost = 0;
        
        // Name perception boost
        if (this.answers.name_perception && topCandidate.perceivedTraits) {
            const perceptionSelections = Array.isArray(this.answers.name_perception) 
                ? this.answers.name_perception 
                : [this.answers.name_perception];
            
            const hasPerceptionMatch = perceptionSelections.some(perception => 
                topCandidate.perceivedTraits.includes(perception)
            );
            if (hasPerceptionMatch) {
                perceptionBoost += 15; // Strong perception match
            }
        }
        
        // Desired impression boost
        if (this.answers.desired_impression && topCandidate.desiredTraits) {
            const impressionSelections = Array.isArray(this.answers.desired_impression) 
                ? this.answers.desired_impression 
                : [this.answers.desired_impression];
            
            const hasImpressionMatch = impressionSelections.some(impression => 
                topCandidate.desiredTraits.includes(impression)
            );
            if (hasImpressionMatch) {
                perceptionBoost += 15; // Strong desired impression match
            }
        }
        
        // Name reactions boost
        if (this.answers.name_reactions && topCandidate.typicalReactions) {
            const reactionSelections = Array.isArray(this.answers.name_reactions) 
                ? this.answers.name_reactions 
                : [this.answers.name_reactions];
            
            const hasReactionMatch = reactionSelections.some(reaction => 
                topCandidate.typicalReactions.includes(reaction)
            );
            if (hasReactionMatch) {
                perceptionBoost += 15; // Strong reaction match
            }
        }
        
        confidence += perceptionBoost;
        
        // LOWER CONFIDENCE BOOST: Other factors
        if (this.answers.length && topCandidate.name) {
            const nameLength = topCandidate.name.length;
            if ((this.answers.length === 'short' && nameLength <= 4) ||
                (this.answers.length === 'medium' && nameLength >= 5 && nameLength <= 6) ||
                (this.answers.length === 'long' && nameLength >= 7)) {
                confidence += 5; // Length match
            }
        }
        
        if (this.answers.starts_with && topCandidate.name) {
            const firstLetter = topCandidate.name.charAt(0).toLowerCase();
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            if ((this.answers.starts_with === 'vowel' && isVowel) || 
                (this.answers.starts_with === 'consonant' && !isVowel)) {
                confidence += 3; // Vowel/consonant match
            }
        }
        
        return Math.min(confidence, 95); // Cap at 95%
    }

    handleNameSubmit() {
        const realNameInput = document.getElementById('realNameInput');
        const realName = realNameInput ? realNameInput.value.trim() : '';
        
        if (realName) {
            // Sanitize the name to prevent XSS attacks
            const sanitizedName = SecurityUtils.sanitizeInput(realName, 50);
            
            // Store the sanitized name for training
            this.realName = sanitizedName;
            
            // If we have quiz answers, send training data to GitHub
            // This allows name-only submissions to contribute to global learning
            if (this.answers && Object.keys(this.answers).length > 0) {
                const trainingData = {
                    timestamp: Date.now(),
                    answers: this.answers,
                    realName: sanitizedName,
                    success: undefined // No success/failure feedback yet, just name provided
                };
                
                this.storeTrainingData(trainingData);
            }
            
            // Update the UI to show the name was submitted
            // Use textContent instead of innerHTML to prevent XSS
            const nameInputSection = document.getElementById('nameInputSection');
            if (nameInputSection) {
                nameInputSection.innerHTML = '';
                
                const prompt = document.createElement('p');
                prompt.className = 'name-input-prompt';
                prompt.textContent = `✨ Thank you! The spirits have learned from your name: `;
                
                const strong = document.createElement('strong');
                strong.textContent = sanitizedName;
                prompt.appendChild(strong);
                
                const note = document.createElement('p');
                note.className = 'name-input-note';
                note.textContent = 'This will help improve future predictions!';
                
                nameInputSection.appendChild(prompt);
                nameInputSection.appendChild(note);
            }
        }
    }

    handleCorrect() {
        // Log successful prediction for ML training
        this.logPredictionSuccess();
        
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'block';
        this.hideMap();
        
        document.getElementById('finalTitle').textContent = '🔮 The spirits have spoken! 🔮';
        document.getElementById('finalMessage').textContent = '✨ My crystal ball never lies! ✨';
        document.getElementById('finalMouth').className = 'mouth happy';
        
        // Update browser history
        history.pushState({page: 'final'}, '', '#final');
    }

    handleWrong() {
        // Log failed prediction for ML training
        this.logPredictionFailure();
        
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'block';
        this.hideMap();
        
        document.getElementById('finalTitle').textContent = '🌫️ The vision was unclear... 🌫️';
        document.getElementById('finalMessage').textContent = '🔮 The spirits are being mysterious today... 🔮';
        document.getElementById('finalMouth').className = 'mouth';
        
        // Update browser history
        history.pushState({page: 'final'}, '', '#final');
    }

    logPredictionSuccess() {
        // Store successful prediction data for ML training
        const trainingData = {
            timestamp: Date.now(),
            answers: this.answers,
            correctGuess: this.currentGuesses[0], // Top guess was correct
            realName: this.realName || null, // Include real name if provided
            success: true
        };
        
        this.storeTrainingData(trainingData);
    }

    logPredictionFailure() {
        // Store failed prediction data for ML training
        const trainingData = {
            timestamp: Date.now(),
            answers: this.answers,
            guesses: this.currentGuesses,
            realName: this.realName || null, // Include real name if provided
            success: false
        };
        
        this.storeTrainingData(trainingData);
    }

    storeTrainingData(data) {
        // Store training data in localStorage
        try {
            const existingData = JSON.parse(localStorage.getItem('nameGuessingTrainingData') || '[]');
            existingData.push(data);
            
            // Keep only last 1000 entries to prevent localStorage from getting too large
            if (existingData.length > 1000) {
                existingData.splice(0, existingData.length - 1000);
            }
            
            localStorage.setItem('nameGuessingTrainingData', JSON.stringify(existingData));
        } catch (error) {
            console.error('Error storing training data:', error);
        }
        
        // Also send training data to GitHub for global model training
        // This happens asynchronously and doesn't block the UI
        this.sendTrainingDataToGitHub(data).catch(error => {
            // Log error but don't break user experience if GitHub API is unavailable
            console.warn('⚠️ Could not send training data to GitHub:', error.message);
            console.warn('This is okay - your data is still stored locally for local learning.');
        });
    }
    
    /**
     * Send training data to GitHub for global model training
     * Uses a serverless function (Vercel) to authenticate with GitHub and create issues
     * 
     * Data is stored as GitHub Issues, then processed by GitHub Actions
     * Includes first names if users voluntarily provide them (for better model training)
     * Note: This data will be visible in public GitHub Issues
     */
    async sendTrainingDataToGitHub(data) {
        // Only send if user provided feedback (success or failure) or a name
        if (data.success === undefined && !data.realName) {
            return; // Skip if no meaningful feedback
        }
        
        // Create training data payload
        // Includes realName if provided (users voluntarily submit this for training)
        // Note: This data will be visible in public GitHub Issues
        const trainingData = {
            timestamp: data.timestamp || Date.now(),
            answers: data.answers,
            success: data.success,
            // Include realName if user provided it (voluntary submission for training)
            ...(data.realName ? { realName: data.realName } : {}),
            // Include correctGuess only if success is true
            ...(data.success === true && data.correctGuess ? { correctGuess: data.correctGuess } : {}),
            // Include guesses only if success is false
            ...(data.success === false && data.guesses ? { guesses: data.guesses } : {})
            // Note: Only first names are included (no last names, emails, or other identifying info)
        };
        
        // Create GitHub Issue with training data
        // Note: This data (including first names if provided) will be visible in public GitHub Issues
        const issueTitle = `Training Data: ${data.success !== undefined ? (data.success ? 'Success' : 'Failure') : 'Name Only'} - ${new Date(trainingData.timestamp).toISOString()}`;
        const issueBody = `<!-- Training Data for Global Model -->
\`\`\`json
${JSON.stringify(trainingData, null, 2)}
\`\`\`

*This issue was automatically created for model training. It will be processed and closed by GitHub Actions.*`;

        try {
            console.log('📤 Sending training data to GitHub via serverless function...', trainingData);
            
            // Determine API endpoint - use relative path if on same domain, or absolute if on different domain
            // This works for both Vercel deployments and local development
            const apiEndpoint = '/api/create-issue';
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: issueTitle,
                    body: issueBody,
                    labels: ['training-data', 'auto-generated']
                })
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || `Server error: ${response.status} ${response.statusText}`);
            }
            
            console.log('✅ Training data sent to GitHub successfully!', responseData.issue);
            return responseData.issue;
        } catch (error) {
            console.error('❌ Failed to send training data to GitHub:', error);
            // Re-throw to be caught by caller
            throw error;
        }
    }

    resetQuiz() {
        this.currentQuestion = 0;
        this.answers = {};
        this.realName = null; // Reset real name
        this.selectedCountries = []; // Reset selected countries
        this.selectedContinents = []; // Reset selected continents
        this.currentContinentIndex = 0; // Reset continent index
        this.selectedState = null; // Reset selected state
        
        document.getElementById('finalSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.querySelector('.hero').style.display = 'block';
        this.hideMap();
        
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('characterThinking').style.display = 'none';
        
        // Reset name input section
        // NOTE: Safe to use innerHTML here - this is static HTML with no user input
        const nameInputSection = document.getElementById('nameInputSection');
        if (nameInputSection) {
            nameInputSection.innerHTML = `
                <p class="name-input-prompt">✨ Help train the spirits by sharing your real name (optional):</p>
                <div class="name-input-container">
                    <input type="text" id="realNameInput" class="name-input" placeholder="Enter your first name..." maxlength="50">
                    <button class="name-submit-btn" id="nameSubmitBtn">✨ Submit ✨</button>
                </div>
                <p class="name-input-note">This helps the spirits learn and improve their predictions!</p>
            `;
        }
        
        // Re-add event listeners for the reset name input
        document.getElementById('nameSubmitBtn').addEventListener('click', () => this.handleNameSubmit());
        document.getElementById('realNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameSubmit();
            }
        });
        
        // Reset browser history
        history.pushState({page: 'home'}, '', '#');
    }

    showHome() {
        // Reset quiz state when navigating home
        this.resetQuiz();
        
        // Update browser history
        history.pushState({page: 'home'}, '', '#home');
    }

    showHowItWorks() {
        // Hide all sections
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('aboutSection').style.display = 'none';
        document.getElementById('contactSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        
        // Show How It Works section
        document.getElementById('howItWorksSection').style.display = 'block';
        this.hideMap();
        
        // Update browser history
        history.pushState({page: 'how-it-works'}, '', '#how-it-works');
    }

    showAbout() {
        // Hide all sections
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('howItWorksSection').style.display = 'none';
        document.getElementById('contactSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        
        // Show About section
        document.getElementById('aboutSection').style.display = 'block';
        this.hideMap();
        
        // Update browser history
        history.pushState({page: 'about'}, '', '#about');
    }

    showContact() {
        // Hide all sections
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('aboutSection').style.display = 'none';
        document.getElementById('howItWorksSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        
        // Show Contact section
        document.getElementById('contactSection').style.display = 'block';
        this.hideMap();
        
        // Update browser history
        history.pushState({page: 'contact'}, '', '#contact');
    }
}

// Mystical Background Graphics Manager
class MysticalBackground {
    constructor() {
        this.graphics = [
            '../assets/background-graphics/crystal_ball.png',
            '../assets/background-graphics/devil.png',
            '../assets/background-graphics/homer\'s_riddle.png',
            '../assets/background-graphics/illuminati.png',
            '../assets/background-graphics/mask.png',
            '../assets/background-graphics/medusa.png',
            '../assets/background-graphics/smoke.png',
            '../assets/background-graphics/vecteezy_cobra_36629722.svg',
            '../assets/background-graphics/vecteezy_egypt-sphinx_36659095.svg',
            '../assets/background-graphics/vecteezy_snake_36654696.svg'
        ];
        this.container = document.getElementById('mysticalBackground');
        if (!this.container) {
            console.error('Mystical background container not found!');
            return;
        }
        this.quadrants = [];
        this.activeGraphics = [];
        this.maxActive = 8;
        this.minActive = 5;
        this.initializeQuadrants();
        this.createGraphics();
        this.startAnimationCycle();
        
        // Handle window resize/zoom with debouncing
        this.resizeTimeout = null;
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Also handle zoom changes (visualViewport API)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 100);
            });
        }
    }
    
    handleResize() {
        // Recalculate quadrants on resize
        this.initializeQuadrants();
        
        // Update positions of all existing graphics
        const allGraphics = document.querySelectorAll('.mystical-graphic');
        allGraphics.forEach((graphic) => {
            const quadrantId = parseInt(graphic.dataset.quadrant);
            const quadrant = this.quadrants[quadrantId];
            if (quadrant) {
                // Get the stored size from the graphic or use default
                const size = graphic.dataset.size ? parseFloat(graphic.dataset.size) : (Math.random() * 40 + 80);
                
                // Recalculate position for this graphic
                const centerX = quadrant.x + (quadrant.width / 2);
                const centerY = quadrant.y + (quadrant.height / 2);
                const x = centerX - size / 2;
                const y = centerY - size / 2;
                
                graphic.style.left = `${x}px`;
                graphic.style.top = `${y}px`;
            }
        });
    }

    initializeQuadrants() {
        // Divide screen into 8 quadrants
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const quadrantWidth = screenWidth / 4;
        const quadrantHeight = screenHeight / 2;
        
        this.quadrants = [
            // Top row
            { x: 0, y: 0, width: quadrantWidth, height: quadrantHeight, id: 0 },
            { x: quadrantWidth, y: 0, width: quadrantWidth, height: quadrantHeight, id: 1 },
            { x: quadrantWidth * 2, y: 0, width: quadrantWidth, height: quadrantHeight, id: 2 },
            { x: quadrantWidth * 3, y: 0, width: quadrantWidth, height: quadrantHeight, id: 3 },
            // Bottom row
            { x: 0, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 4 },
            { x: quadrantWidth, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 5 },
            { x: quadrantWidth * 2, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 6 },
            { x: quadrantWidth * 3, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 7 }
        ];
    }

    createGraphics() {
        // Create 24 graphic containers (3 per quadrant for more density)
        for (let i = 0; i < 24; i++) {
            const graphic = document.createElement('div');
            graphic.className = 'mystical-graphic';
            graphic.dataset.quadrant = i % 8; // Distribute across 8 quadrants
            graphic.style.position = 'absolute';
            graphic.style.opacity = '0';
            this.container.appendChild(graphic);
        }
    }

    startAnimationCycle() {
        // Start gradual fade in/out cycle
        this.startGradualCycle();
    }

    startGradualCycle() {
        // Create wave effect across the screen
        this.createWaveEffect();
    }

    createWaveEffect() {
        const allGraphics = document.querySelectorAll('.mystical-graphic');
        
        // Create wave pattern - graphics appear in waves across the screen
        setInterval(() => {
            this.startWave();
        }, 8000); // New wave every 8 seconds
        
        // Start first wave immediately
        this.startWave();
    }

    startWave() {
        const allGraphics = document.querySelectorAll('.mystical-graphic');
        
        // Group graphics by quadrant
        const graphicsByQuadrant = {};
        allGraphics.forEach(graphic => {
            const quadrant = parseInt(graphic.dataset.quadrant);
            if (!graphicsByQuadrant[quadrant]) {
                graphicsByQuadrant[quadrant] = [];
            }
            graphicsByQuadrant[quadrant].push(graphic);
        });
        
        // Select one random graphic per quadrant to avoid duplicates
        const selectedGraphics = [];
        Object.keys(graphicsByQuadrant).forEach(quadrantId => {
            const quadrantGraphics = graphicsByQuadrant[quadrantId];
            const randomGraphic = quadrantGraphics[Math.floor(Math.random() * quadrantGraphics.length)];
            selectedGraphics.push({
                graphic: randomGraphic,
                quadrant: parseInt(quadrantId)
            });
        });
        
        // Sort by quadrant for wave effect
        selectedGraphics.sort((a, b) => a.quadrant - b.quadrant);
        
        // Wave timing - each graphic appears with a delay based on its position
        selectedGraphics.forEach((item, index) => {
            const waveDelay = index * 200; // 200ms between each graphic in the wave
            
            setTimeout(() => {
                this.fadeInGraphic(item.graphic);
                
                // Fade out after a random duration
                const visibleDuration = Math.random() * 3000 + 2000; // 2-5 seconds visible
                
                setTimeout(() => {
                    this.fadeOutGraphic(item.graphic);
                }, visibleDuration);
            }, waveDelay);
        });
    }


    fadeInGraphic(graphic) {
        // Update the graphic with new properties
        const quadrantId = parseInt(graphic.dataset.quadrant);
        const quadrant = this.quadrants[quadrantId];
        this.updateGraphic(graphic, quadrant);
        
        // Fade in
        graphic.style.opacity = '0';
        graphic.style.transition = 'opacity 1.5s ease-in-out';
        setTimeout(() => {
            graphic.style.opacity = '0.7';
        }, 50);
    }

    fadeOutGraphic(graphic) {
        // Fade out
        graphic.style.transition = 'opacity 1.5s ease-in-out';
        graphic.style.opacity = '0';
    }


    updateGraphic(graphic, quadrant) {
        // Clear existing content
        graphic.innerHTML = '';
        
        // Random size between 80px and 120px (smaller to prevent overlap)
        const size = Math.random() * 40 + 80;
        graphic.style.width = `${size}px`;
        graphic.style.height = `${size}px`;
        graphic.dataset.size = size; // Store size for resize calculations
        
        // Since we only show one graphic per quadrant, we can center it
        const centerX = quadrant.x + (quadrant.width / 2);
        const centerY = quadrant.y + (quadrant.height / 2);
        const x = centerX - size / 2;
        const y = centerY - size / 2;
        
        graphic.style.left = `${x}px`;
        graphic.style.top = `${y}px`;
        
        // Random graphic from the collection (using all 10 graphics)
        const graphicSrc = this.graphics[Math.floor(Math.random() * this.graphics.length)];
        const img = document.createElement('img');
        img.src = graphicSrc;
        img.alt = 'Mystical Symbol';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        // Random orientation: 0 degrees, horizontal flip, vertical flip, or both
        const orientations = [
            'rotate(0deg)',           // Normal
            'scaleX(-1)',             // Horizontal flip
            'scaleY(-1)',             // Vertical flip
            'scaleX(-1) scaleY(-1)'   // Both flips
        ];
        const orientation = orientations[Math.floor(Math.random() * orientations.length)];
        img.style.transform = orientation;
        
        // Handle image load errors
        img.onerror = () => {
            console.warn('Failed to load background graphic:', graphicSrc);
            graphic.style.opacity = '0';
        };
        
        img.onload = () => {
            graphic.style.opacity = '0.7';
        };
        
        graphic.appendChild(img);
    }
}

// Global function for the "Try the Crystal Ball" button
function showQuiz() {
    const quiz = window.quizInstance;
    if (quiz) {
        // Hide all sections
        document.getElementById('aboutSection').style.display = 'none';
        document.getElementById('howItWorksSection').style.display = 'none';
        document.getElementById('contactSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        
        // Show hero section
        document.querySelector('.hero').style.display = 'block';
        
        // Hide map when returning to hero
        quiz.hideMap();
        
        // Reset quiz state
        quiz.resetQuiz();
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mystical background
    new MysticalBackground();
    
    const quiz = new NameGuessingQuiz();
    window.quizInstance = quiz; // Make quiz instance globally available
    
    // Handle browser back button
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash;
        
        if (hash.startsWith('#quiz-')) {
            // Extract question number from hash
            const questionNum = parseInt(hash.split('-')[1]);
            if (!isNaN(questionNum) && questionNum >= 0 && questionNum < quiz.questions.length) {
                // Show quiz section and navigate to specific question
                document.querySelector('.hero').style.display = 'none';
                document.getElementById('quizSection').style.display = 'block';
                document.getElementById('resultSection').style.display = 'none';
                document.getElementById('finalSection').style.display = 'none';
                
                // Set current question and show it
                quiz.currentQuestion = questionNum;
                quiz.showQuestion();
                
                // Don't reset answers - preserve them for proper navigation
            } else {
                // Invalid question number, go to hero
                document.querySelector('.hero').style.display = 'block';
                document.getElementById('quizSection').style.display = 'none';
                document.getElementById('resultSection').style.display = 'none';
                document.getElementById('finalSection').style.display = 'none';
                
                // Hide map when leaving quiz
                quiz.hideMap();
                
                // Reset quiz state
                quiz.currentQuestion = 0;
                quiz.answers = {};
                quiz.updateProgress();
            }
        } else if (hash === '#result') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'block';
            document.getElementById('finalSection').style.display = 'none';
            quiz.hideMap();
        } else if (hash === '#final') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'block';
            document.getElementById('howItWorksSection').style.display = 'none';
            quiz.hideMap();
        } else if (hash === '#how-it-works') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'block';
            quiz.hideMap();
        } else if (hash === '#about') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'block';
            quiz.hideMap();
        } else if (hash === '#contact') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'block';
            quiz.hideMap();
        } else {
            // Default to hero section
            document.querySelector('.hero').style.display = 'block';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            
            // Hide map when on hero
            quiz.hideMap();
            
            // Reset quiz state
            quiz.currentQuestion = 0;
            quiz.answers = {};
            quiz.updateProgress();
        }
    });
    
    // ============================================
    // FEEDBACK FORM FUNCTIONALITY
    // ============================================
    
    /**
     * EmailJS Configuration
     * NOTE: These are PUBLIC keys meant for client-side use.
     * EmailJS public keys are safe to expose in client-side code.
     * They are rate-limited and can only send emails through your configured service.
     * For production, consider using environment variables or a config file.
     */
    const EMAILJS_PUBLIC_KEY = 'qZJaIaRbwRvm5WYrB';
    const EMAILJS_SERVICE_ID = 'service_2adxbmy'; 
    const EMAILJS_TEMPLATE_ID = 'template_s6ss6lg';
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    
    // Add event listeners for "back to quiz" buttons (replacing inline onclick handlers)
    document.querySelectorAll('#backToQuizBtn1, #backToQuizBtn2, #backToQuizBtn3').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (typeof showQuiz === 'function') {
                    showQuiz();
                }
            });
        }
    });
    
    // Feedback modal elements
    const feedbackFloatBtn = document.getElementById('feedbackFloatBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackCloseBtn = document.getElementById('feedbackCloseBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackStatus = document.getElementById('feedbackStatus');
    const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
    
    // Open feedback modal
    feedbackFloatBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    });
    
    // Close feedback modal
    function closeFeedbackModal() {
        feedbackModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        feedbackForm.reset();
        feedbackStatus.textContent = '';
        feedbackStatus.className = 'feedback-status';
    }
    
    feedbackCloseBtn.addEventListener('click', closeFeedbackModal);
    
    // Close modal when clicking outside of it
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });
    
    // Handle form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Rate limiting: Allow max 5 submissions per hour per user
        const rateLimitKey = 'feedbackFormRateLimit';
        const rateLimit = SecurityUtils.checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000); // 5 per hour
        
        if (!rateLimit.allowed) {
            const timeRemaining = SecurityUtils.formatTimeRemaining(rateLimit.retryAfter);
            feedbackStatus.textContent = `⏱️ Rate limit exceeded. Please try again in ${timeRemaining}.`;
            feedbackStatus.className = 'feedback-status feedback-status-warning';
            return;
        }
        
        // Get and sanitize form values to prevent XSS and injection attacks
        const nameInput = document.getElementById('feedbackName');
        const emailInput = document.getElementById('feedbackEmail');
        const typeInput = document.getElementById('feedbackType');
        const messageInput = document.getElementById('feedbackMessage');
        
        // Sanitize all inputs
        const name = nameInput ? SecurityUtils.sanitizeInput(nameInput.value, 100) || 'Anonymous' : 'Anonymous';
        const email = emailInput ? SecurityUtils.sanitizeInput(emailInput.value, 200) || 'No email provided' : 'No email provided';
        const type = typeInput ? SecurityUtils.sanitizeInput(typeInput.value, 50) : '';
        const message = messageInput ? SecurityUtils.sanitizeInput(messageInput.value, 2000) : '';
        
        // Validate required fields
        if (!type || !message) {
            feedbackStatus.textContent = '⚠️ Please fill in all required fields.';
            feedbackStatus.className = 'feedback-status feedback-status-warning';
            return;
        }
        
        // Disable submit button
        feedbackSubmitBtn.disabled = true;
        feedbackSubmitBtn.textContent = '✨ Sending... ✨';
        
        // Show loading status
        feedbackStatus.textContent = '🔮 Sending your message through the mystical realm...';
        feedbackStatus.className = 'feedback-status feedback-status-loading';
        
        // Check if EmailJS is configured
        if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
            // If EmailJS is not configured, show instructions
            feedbackStatus.textContent = '⚠️ EmailJS is not configured yet. Please check the console for setup instructions.';
            feedbackStatus.className = 'feedback-status feedback-status-warning';
            // Log sanitized feedback (safe to log since it's already sanitized)
            console.log(`
================================================================================
FEEDBACK RECEIVED (EmailJS not configured):
================================================================================
Name: ${name}
Email: ${email}
Type: ${type}
Message: ${message.substring(0, 500)}${message.length > 500 ? '...' : ''}
--------------------------------------------------------------------------------
To enable email functionality:
1. Sign up at https://www.emailjs.com/ (free tier available)
2. Create an email service
3. Create an email template with these placeholders:
   - {{from_name}}
   - {{from_email}}
   - {{feedback_type}}
   - {{message}}
4. Replace these values in script.js:
   - EMAILJS_PUBLIC_KEY (your public key)
   - EMAILJS_SERVICE_ID (your service ID)
   - EMAILJS_TEMPLATE_ID (your template ID)
================================================================================
            `);
            
            feedbackSubmitBtn.disabled = false;
            feedbackSubmitBtn.textContent = '✨ Send Feedback ✨';
            
            return;
        }
        
        try {
            // Send email using EmailJS
            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    from_name: name,
                    from_email: email,
                    feedback_type: type,
                    message: message,
                    to_email: 'charlottelf@protonmail.com'
                }
            );
            
            console.log('Feedback sent successfully!', response);
            
            // Show success message
            feedbackStatus.textContent = '✨ Thank you! Your feedback has been sent successfully! ✨';
            feedbackStatus.className = 'feedback-status feedback-status-success';
            
            // Reset form after 2 seconds
            setTimeout(() => {
                closeFeedbackModal();
            }, 2000);
            
        } catch (error) {
            console.error('Failed to send feedback:', error);
            
            // Show error message
            feedbackStatus.textContent = '❌ Oops! Something went wrong. Please try again or email charlottelf@protonmail.com directly.';
            feedbackStatus.className = 'feedback-status feedback-status-error';
            
            // Re-enable submit button
            feedbackSubmitBtn.disabled = false;
            feedbackSubmitBtn.textContent = '✨ Send Feedback ✨';
        }
    });
});
