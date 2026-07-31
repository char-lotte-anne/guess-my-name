/**
 * Turning answers into ranked name guesses.
 *
 * Two sources are blended in combinePredictions: rule-based filtering and
 * scoring (70%) and the neural model (30%). The rules are the load-bearing
 * half -- the model only ever proposes names it has seen during training, and
 * is skipped entirely when no usable global model is available.
 *
 * The scoring itself lives in name-scoring.js as pure functions; the methods
 * here that share those names are thin delegates.
 */

Object.assign(NameGuessingQuiz.prototype, {

    async makeGuess() {
        log.debug('🎯 makeGuess: Starting guess calculation...');
        log.debug('📋 Current answers:', JSON.stringify(this.answers));
        
        // Train ML model with existing data before making prediction
        await this.trainMLModel();
        
        const topGuesses = await this.calculateTopGuesses(5);
        log.debug(`🎯 makeGuess: Got ${topGuesses ? topGuesses.length : 0} top guesses`);
        
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
    },


    async trainMLModel() {
        try {
            // First, try to load global model from GitHub Releases
            const globalModelLoaded = await this.mlModel.loadGlobalModel();
            
            if (!globalModelLoaded) {
                // Fallback to local training if global model not available
                log.debug('🏠 Training local model on user data...');
                const trainingData = this.getTrainingData();
                log.debug(`📊 Found ${trainingData.length} training examples in localStorage`);
                
                // Count successful examples
                const successfulExamples = trainingData.filter(d => d.success === true && d.correctGuess).length;
                log.debug(`📊 ${successfulExamples} examples have correct guesses (needed for training)`);
                
                if (trainingData.length > 0) {
                    await this.mlModel.train(trainingData);
                } else {
                    log.debug('ℹ️  No local training data available yet');
                }
            } else {
                log.debug('🌍 Using global model trained on aggregated data from GitHub Releases');
            }
        } catch (error) {
            console.error('Error training ML model:', error);
        }
    },


    getTrainingData() {
        try {
            const data = localStorage.getItem('nameGuessingTrainingData');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading training data:', error);
            return [];
        }
    },


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
    },


    async calculateTopGuesses(count = 5) {
        try {
            // Handle both array and string values for gender
            const genderValue = Array.isArray(this.answers.gender) ? this.answers.gender[0] : this.answers.gender;
            log.debug('🎯 calculateTopGuesses: Starting...');
            log.debug('📋 Answers object:', JSON.stringify(this.answers));
            log.debug('📋 Gender value:', genderValue, '(raw:', this.answers.gender, ')');
            
            // Get rule-based predictions
            let ruleBasedGuesses = [];
            try {
                log.debug('🎯 calculateTopGuesses: About to call calculateRuleBasedGuesses...');
                const result = await this.calculateRuleBasedGuesses(count);
                log.debug(`🎯 calculateTopGuesses: calculateRuleBasedGuesses returned:`, result);
                ruleBasedGuesses = result || [];
                log.debug(`🎯 calculateTopGuesses: Got ${ruleBasedGuesses ? ruleBasedGuesses.length : 0} rule-based guesses`);
            } catch (error) {
                console.error('❌ calculateTopGuesses: Error in calculateRuleBasedGuesses:', error);
                console.error('Error message:', error.message);
                console.error('Stack:', error.stack);
                // If it's a non-binary gender, return fallback
                const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
                const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
                if (hasNonBinary) {
                    log.debug('⚠️ Returning fallback for non-binary due to error');
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
                    log.debug(`🤖 calculateTopGuesses: Got ${mlPredictions ? mlPredictions.length : 0} ML predictions`);
                    if (mlPredictions && mlPredictions.length > 0) {
                        const topMLIndices = Array.from({length: mlPredictions.length}, (_, i) => i)
                            .sort((a, b) => mlPredictions[b] - mlPredictions[a])
                            .slice(0, 5);
                        log.debug(`🤖 Top 5 ML predictions:`, topMLIndices.map(i => ({
                            index: i,
                            name: this.mlModel.getNameFromIndex(i),
                            score: (mlPredictions[i] * 100).toFixed(2) + '%'
                        })));
                    }
                } catch (error) {
                    log.debug('⚠️ ML predictions failed (expected with CSP), using rule-based only:', error.message);
                    // ML failed, just return rule-based guesses
                    return ruleBasedGuesses;
                }
                
                // Combine both approaches if ML worked
                if (mlPredictions && mlPredictions.length > 0) {
                    const hybridGuesses = this.combinePredictions(ruleBasedGuesses, mlPredictions, count);
                    log.debug(`✅ calculateTopGuesses: Returning ${hybridGuesses ? hybridGuesses.length : 0} hybrid guesses`);
                    if (hybridGuesses && hybridGuesses.length > 0) {
                        // Log which guesses came from ML
                        hybridGuesses.forEach((g, i) => {
                            if (g.source === 'hybrid' || g.source === 'ml-only') {
                                log.debug(`🤖 Hybrid guess ${i + 1}: ${g.name} (rule: ${g.ruleScore?.toFixed(1) || 0}, ML: ${g.mlScore?.toFixed(1) || 0}, combined: ${g.combinedScore?.toFixed(1) || 0})`);
                            }
                        });
                        return hybridGuesses;
                    }
                }
                
                // Return rule-based guesses if hybrid didn't work
                log.debug(`✅ calculateTopGuesses: Returning ${ruleBasedGuesses.length} rule-based guesses`);
                return ruleBasedGuesses;
            } else {
                console.error('❌ calculateTopGuesses: No rule-based guesses returned!');
                console.error('❌ Rule-based guesses value:', ruleBasedGuesses);
                console.error('❌ Gender value:', this.answers.gender);
                // Return fallback if any gender is non-binary - this should ALWAYS work
                const genderArray = Array.isArray(this.answers.gender) ? this.answers.gender : [this.answers.gender];
                const hasNonBinary = genderArray.some(g => g === 'NB' || g === 'PREFER_NOT_TO_SAY');
                if (hasNonBinary) {
                    log.debug('⚠️ Returning fallback for non-binary - this should always work');
                    const fallback = [
                        { name: 'Alex', gender: 'NB', totalCount: 2000, score: 50, confidence: 50 },
                        { name: 'Jordan', gender: 'NB', totalCount: 1800, score: 48, confidence: 48 },
                        { name: 'Taylor', gender: 'NB', totalCount: 1600, score: 46, confidence: 46 },
                        { name: 'Casey', gender: 'NB', totalCount: 1400, score: 44, confidence: 44 },
                        { name: 'Morgan', gender: 'NB', totalCount: 1200, score: 42, confidence: 42 }
                    ];
                    log.debug('✅ Returning fallback with', fallback.length, 'names');
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
    },


    /**
     * Rank names for the current answers.
     *
     * Candidates are gathered per selected gender (the database is queried one
     * gender at a time), deduplicated, scored and cut to `count`. If that pool
     * comes back empty the search is retried with relaxed criteria before
     * giving up.
     */
    async calculateRuleBasedGuesses(count = 5) {
        const { dedupeByName, rankCandidates, fallbackFor } = window.CandidateRanking;
        const score = candidate => this.calculateNameScore(candidate);

        try {
            const candidates = dedupeByName(await this.getCandidatesForAllGenders());
            log.debug(`calculateRuleBasedGuesses: ${candidates.length} unique candidates`);

            const pool = candidates.length > 0
                ? candidates
                : await this.getRelaxedCandidates();

            const ranked = rankCandidates(pool, score, count);

            if (ranked.length === 0) {
                log.debug('No guesses after scoring; using fallback where applicable');
                return fallbackFor(this.answers.gender);
            }
            return ranked;
        } catch (error) {
            console.error('calculateRuleBasedGuesses failed:', error);
            return fallbackFor(this.answers.gender);
        }
    },

    /**
     * getCandidates() reads this.answers.gender directly and handles one value,
     * but the question is a multi-select. Query once per selected gender and
     * concatenate, restoring the answer afterwards so the temporary narrowing
     * is not visible to anything else.
     */
    async getCandidatesForAllGenders() {
        const { toGenderArray } = window.CandidateRanking;
        const genders = toGenderArray(this.answers.gender);
        if (genders.length === 0) return (await this.getCandidates()) || [];

        const original = this.answers.gender;
        const collected = [];

        try {
            for (const gender of genders) {
                this.answers.gender = gender;
                try {
                    const candidates = await this.getCandidates();
                    if (Array.isArray(candidates)) collected.push(...candidates);
                } catch (error) {
                    console.error(`Error getting candidates for gender ${gender}:`, error);
                }
            }
        } finally {
            this.answers.gender = original;
        }
        return collected;
    },

    /**
     * Second pass when the strict search finds nothing: same intent, looser
     * length matching, and for non-binary answers the dedicated name list.
     */
    async getRelaxedCandidates() {
        log.debug('No candidates found, trying relaxed criteria...');
        let relaxedCandidates = [];
            
            const genderValue = Array.isArray(this.answers.gender) ? this.answers.gender[0] : this.answers.gender;
            if (genderValue === 'NB' || genderValue === 'PREFER_NOT_TO_SAY') {
                // Ensure database is loaded before getting non-binary names
                if (this.enhancedNameDatabase.ensureLoaded) {
                    await this.enhancedNameDatabase.ensureLoaded();
                }
                // For non-binary or prefer not to say, use the existing method but with relaxed length
                const nonBinaryNames = await this.enhancedNameDatabase.getNonBinaryNames();
                log.debug(`📊 Found ${nonBinaryNames ? nonBinaryNames.length : 0} non-binary names`);
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
                    log.debug(`✅ After relaxed filtering: ${relaxedCandidates.length} candidates`);
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
                
                // Scoring now happens in the caller, so this only has to
                // produce candidates.
                relaxedCandidates = fallbackNames;
            }

        return relaxedCandidates;
    },


    combinePredictions(ruleBasedGuesses, mlPredictions, count) {
        // If no rule-based guesses, return empty array
        if (!ruleBasedGuesses || ruleBasedGuesses.length === 0) {
            log.debug('⚠️ combinePredictions: No rule-based guesses to combine');
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
            log.debug(`🔀 combinePredictions: Combining ${ruleBasedGuesses.length} rule-based with ${mlPredictions.length} ML predictions`);
            
            // Get top ML predictions
            const mlTopIndices = Array.from({length: mlPredictions.length}, (_, i) => i)
                .sort((a, b) => mlPredictions[b] - mlPredictions[a])
                .slice(0, count);
            
            let hybridCount = 0;
            let mlOnlyCount = 0;
            
            mlTopIndices.forEach((index, rank) => {
                const name = this.mlModel.getNameFromIndex(index);
                // An index the model cannot name carries no information.
                if (!name) return;

                const mlScore = mlPredictions[index] * 100; // Convert to 0-100 scale
                const weight = 0.3; // ML gets 30% weight

                if (combinedScores.has(name)) {
                    // Combine with existing rule-based score
                    const existing = combinedScores.get(name);
                    existing.mlScore = mlScore;
                    existing.combinedScore = existing.ruleScore * 0.7 + mlScore * 0.3;
                    existing.source = 'hybrid';
                    hybridCount++;
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
                    mlOnlyCount++;
                }
            });
            
            log.debug(`🔀 combinePredictions: Created ${hybridCount} hybrid predictions, ${mlOnlyCount} ML-only predictions`);
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
    },


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
    },


    calculateNameScore(nameInfo) {
        return window.NameScoring.calculateNameScore(nameInfo, this.answers);
    },


    getDecadePopularity(nameInfo, decade) {
        return window.NameScoring.getDecadePopularity(nameInfo, decade);
    },


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
            log.debug(`🔍 getCandidates: Getting non-binary names for gender=${this.answers.gender}`);
            
            // Ensure database is loaded
            if (this.enhancedNameDatabase && this.enhancedNameDatabase.ensureLoaded) {
                await this.enhancedNameDatabase.ensureLoaded();
            }
            
            if (!this.enhancedNameDatabase || !this.enhancedNameDatabase.getNonBinaryNames) {
                console.error('❌ getCandidates: enhancedNameDatabase or getNonBinaryNames not available');
                return [];
            }
            
            const nonBinaryNames = await this.enhancedNameDatabase.getNonBinaryNames();
            log.debug(`📊 getCandidates: Found ${nonBinaryNames ? nonBinaryNames.length : 0} non-binary names`);
            
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
                log.debug(`📏 getCandidates: Filtered from ${beforeFilter} to ${candidates.length} by length=${this.answers.length}`);
            } else {
                log.debug(`✅ getCandidates: No length filter, returning all ${candidates.length} non-binary names`);
            }
            
            log.debug(`✅ getCandidates: Returning ${candidates.length} candidates for non-binary`);
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
    },


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
    },


    matchesCriteria(nameInfo) {
        return window.NameScoring.matchesCriteria(nameInfo, this.answers);
    },


    async calculateConfidence(nameInfo) {
        const candidates = await this.getCandidates();
        return window.NameScoring.calculateConfidence(nameInfo, this.answers, candidates);
    }
});
