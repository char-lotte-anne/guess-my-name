/**
 * The quiz object itself: state, question flow, and page navigation.
 *
 * The rest of its behaviour is mixed onto the prototype by the quiz-*.js files
 * that load after this one. Splitting a class this way keeps `this` semantics
 * identical to a single class body, which a module rewrite would not have.
 * If a method seems to be missing, it is in one of the mixins.
 */


class NameGuessingQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.realName = null; // Store user's real name for training
        this.selectedCountries = []; // Store selected countries for world map
        this.selectedContinents = []; // Store selected continents
        this.selectedState = null; // Store selected state
        this.continentToCountries = CONTINENT_TO_COUNTRIES;
        this.enhancedNameDatabase = new EnhancedNameDatabase();
        this.mlModel = new NamePredictionML();
        this.questions = QUIZ_QUESTIONS;
        
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
        document.getElementById('shareBtn').addEventListener('click', () => this.handleShare());
        
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
                log.debug('✅ Normalized PREFER_NOT_TO_SAY to NB in array for gender processing');
            } else if (value === 'PREFER_NOT_TO_SAY') {
                value = 'NB';
                log.debug('✅ Normalized PREFER_NOT_TO_SAY to NB for gender processing');
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
                <p class="name-input-disclosure">Your name and quiz answers are sent to this project's GitHub repository to train the model. They are encrypted before being stored, and only the maintainer can read them. <a href="https://github.com/char-lotte-anne/guess-my-name/blob/main/PRIVACY_EXPLAINED.md" target="_blank" rel="noopener noreferrer">How this works</a></p>
            `;
        }
        
        // Re-add event listeners for the reset name input
        document.getElementById('nameSubmitBtn').addEventListener('click', () => this.handleNameSubmit());
        document.getElementById('realNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameSubmit();
            }
        });

        document.getElementById('shareBtn').addEventListener('click', () => this.handleShare());
        
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
