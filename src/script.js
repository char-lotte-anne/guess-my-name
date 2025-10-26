// Name Guessing Quiz Logic
class NameGuessingQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.enhancedNameDatabase = new EnhancedNameDatabase();
        this.questions = [
            {
                text: "🗺️ What state were you born in?",
                type: "map",
                key: "state"
            },
            {
                text: "🌈 What's your gender identity?",
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
                text: "🎂 What decade were you born in?",
                type: "slider",
                min: 1900,
                max: 2020,
                step: 10,
                default: 1990,
                labels: ["📜 1900s", "🎵 1950s", "🌈 2000s", "✨ 2020s"],
                key: "decade"
            },
            {
                text: "📏 How many letters are in your first name?",
                type: "slider",
                min: 1,
                max: 3,
                step: 0.01,
                default: 2,
                labels: ["⚡ Short", "💫 Medium", "🌟 Long"],
                key: "length"
            },
            {
                text: "🔤 Does your name start with a vowel?",
                options: [
                    { text: "✅ Yes (A, E, I, O, U)", value: "vowel" },
                    { text: "❌ No", value: "consonant" }
                ],
                key: "starts_with"
            },
            {
                text: "⭐ How popular is your name?",
                type: "slider",
                min: 1,
                max: 3,
                step: 0.11,
                default: 2,
                labels: ["✨ Uncommon/unique", "💫 Somewhat popular", "🔥 Very popular"],
                key: "popularity"
            },
            {
                text: "🗳️ What political values matter most to you?",
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
                text: "🗣️ What languages do you speak or value?",
                type: "multi_select",
                options: [
                    { text: "🇺🇸 English only", value: "english_only" },
                    { text: "🇪🇸 Spanish", value: "spanish" },
                    { text: "🇫🇷 French", value: "french" },
                    { text: "🇩🇪 German", value: "german" },
                    { text: "🇮🇹 Italian", value: "italian" },
                    { text: "🇷🇺 Russian", value: "russian" },
                    { text: "🇨🇳 Chinese", value: "chinese" },
                    { text: "🇯🇵 Japanese", value: "japanese" },
                    { text: "🇰🇷 Korean", value: "korean" },
                    { text: "🇮🇳 Hindi/Sanskrit", value: "hindi" },
                    { text: "🇦🇪 Arabic", value: "arabic" },
                    { text: "🇮🇱 Hebrew", value: "hebrew" },
                    { text: "🇮🇪 Irish/Gaelic", value: "irish" },
                    { text: "🇳🇴 Scandinavian", value: "scandinavian" },
                    { text: "🌍 Multiple languages", value: "multilingual" }
                ],
                key: "language_preference"
            },
            {
                text: "🏠 What type of community do you prefer?",
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
                text: "🌍 Where did you grow up?",
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
                text: "👨‍👩‍👧‍👦 How important is family tradition to you?",
                type: "slider",
                min: 1,
                max: 3,
                step: 0.1,
                default: 2,
                labels: ["🆕 Create new traditions", "⚖️ Mix old and new", "🏛️ Honor family heritage"],
                key: "family_tradition"
            },
            {
                text: "🌍 How do you view cultural diversity?",
                type: "slider",
                min: 1,
                max: 3,
                step: 0.1,
                default: 2,
                labels: ["🏛️ Preserve traditions", "⚖️ Balance both", "🌍 Embrace diversity"],
                key: "diversity_attitude"
            },
            {
                text: "🏛️ What type of name meaning appeals to you most?",
                type: "multi_select",
                options: [
                    { text: "👑 Royal or noble meaning", value: "royal" },
                    { text: "🌿 Nature-inspired", value: "nature" },
                    { text: "⚔️ Warrior or strength", value: "warrior" },
                    { text: "💎 Precious or valuable", value: "precious" },
                    { text: "🌟 Light or brightness", value: "light" },
                    { text: "❤️ Love or compassion", value: "love" },
                    { text: "🧠 Wisdom or knowledge", value: "wisdom" },
                    { text: "🎵 Music or harmony", value: "music" },
                    { text: "🌊 Water or flow", value: "water" },
                    { text: "🔥 Fire or energy", value: "fire" },
                    { text: "🌙 Moon or night", value: "moon" },
                    { text: "☀️ Sun or day", value: "sun" },
                    { text: "🕊️ Peace or freedom", value: "peace" },
                    { text: "🎭 Creative or artistic", value: "creative" }
                ],
                key: "name_meaning_preference"
            },
            {
                text: "👥 How do people typically perceive your name?",
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
                    { text: "💎 Precious and special", value: "precious_perceived" },
                    { text: "🎭 Dramatic and expressive", value: "dramatic" },
                    { text: "🤝 Trustworthy and reliable", value: "trustworthy" }
                ],
                key: "name_perception"
            },
            {
                text: "🎯 What impression do you want your name to give?",
                type: "multi_select",
                options: [
                    { text: "👑 Authority and leadership", value: "authority" },
                    { text: "💪 Strength and confidence", value: "strength_desired" },
                    { text: "😊 Warmth and kindness", value: "warmth" },
                    { text: "🧠 Intelligence and wisdom", value: "intelligence_desired" },
                    { text: "🎨 Creativity and originality", value: "creativity_desired" },
                    { text: "🌟 Uniqueness and distinction", value: "uniqueness_desired" },
                    { text: "🏛️ Tradition and heritage", value: "tradition_desired" },
                    { text: "🚀 Innovation and progress", value: "innovation" },
                    { text: "🌿 Connection to nature", value: "nature_connection" },
                    { text: "💎 Value and worth", value: "value" },
                    { text: "🎭 Expressiveness and personality", value: "expressiveness" },
                    { text: "🤝 Trust and reliability", value: "trust_desired" }
                ],
                key: "desired_impression"
            },
            {
                text: "😮 How do people typically react when they hear your name?",
                type: "multi_select",
                options: [
                    { text: "😍 They love it and compliment it", value: "loved" },
                    { text: "🤔 They ask how to spell it", value: "spelling_questions" },
                    { text: "😮 They're surprised or impressed", value: "surprised" },
                    { text: "😊 They smile and remember it easily", value: "memorable" },
                    { text: "🤷 They're neutral about it", value: "neutral" },
                    { text: "😅 They make jokes or puns about it", value: "jokes" },
                    { text: "🤝 They find it trustworthy", value: "trustworthy_reaction" },
                    { text: "🎨 They comment on its uniqueness", value: "unique_reaction" },
                    { text: "🏛️ They recognize it as traditional", value: "traditional_reaction" },
                    { text: "🚀 They see it as modern/trendy", value: "modern_reaction" },
                    { text: "🌍 They ask about its origin", value: "origin_questions" },
                    { text: "💪 They find it strong/powerful", value: "strong_reaction" }
                ],
                key: "name_reactions"
            },
            {
                text: "🔤 What's your favorite letter of the alphabet?",
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
                text: "🎯 What career paths interest you?",
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
                text: "⛪ What religious ceremonies were you part of as a child?",
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
                text: "🕊️ What religious or spiritual traditions does your family follow?",
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
                text: "🌍 What cultural backgrounds does your family come from?",
                type: "multi_select",
                options: [
                    { text: "🇺🇸 American/English", value: "american" },
                    { text: "🇪🇸 Spanish/Latin American", value: "spanish" },
                    { text: "🇫🇷 French", value: "french" },
                    { text: "🇩🇪 German", value: "german" },
                    { text: "🇮🇹 Italian", value: "italian" },
                    { text: "🇷🇺 Russian/Slavic", value: "slavic" },
                    { text: "🇬🇷 Greek", value: "greek" },
                    { text: "🇮🇳 Indian/Sanskrit", value: "sanskrit" },
                    { text: "🇦🇪 Arabic/Middle Eastern", value: "arabic" },
                    { text: "🇮🇱 Hebrew/Jewish", value: "hebrew" },
                    { text: "🇮🇪 Irish/Celtic", value: "celtic" },
                    { text: "🇳🇴 Scandinavian/Norse", value: "norse" },
                    { text: "🌍 Mixed/Multiple", value: "mixed" },
                    { text: "🤐 Prefer not to say", value: "prefer_not_to_say" }
                ],
                key: "cultural_background"
            },
            {
                text: "📚 What type of name meaning appeals to you most?",
                options: [
                    { text: "👑 Royal or noble meaning", value: "royal" },
                    { text: "🌿 Nature-inspired", value: "nature" },
                    { text: "⚔️ Warrior or strength", value: "warrior" },
                    { text: "💎 Precious or valuable", value: "precious" },
                    { text: "🌟 Light or brightness", value: "light" },
                    { text: "❤️ Love or compassion", value: "love" },
                    { text: "🧠 Wisdom or knowledge", value: "wisdom" },
                    { text: "🎵 Music or harmony", value: "music" },
                    { text: "🌊 Water or flow", value: "water" },
                    { text: "🔥 Fire or energy", value: "fire" },
                    { text: "🌙 Moon or night", value: "moon" },
                    { text: "☀️ Sun or day", value: "sun" },
                    { text: "🕊️ Peace or freedom", value: "peace" },
                    { text: "🎭 Creative or artistic", value: "creative" }
                ],
                key: "name_meaning_preference"
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
        this.showQuestion();
        
        // Update browser history for first question
        history.pushState({page: 'quiz', question: 0}, '', '#quiz-0');
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        document.getElementById('questionText').textContent = question.text;
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        if (question.type === 'slider') {
            this.createSlider(question, optionsContainer);
        } else if (question.type === 'map') {
            this.createMap();
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
        
        // For decade question, show key decades with proper spacing
        if (question.key === 'decade') {
            // Show key decades that align with slider positions
            const keyDecades = [1900, 1920, 1940, 1960, 1980, 2000, 2020];
            
            keyDecades.forEach((year, index) => {
                const labelElement = document.createElement('div');
                labelElement.className = 'slider-label decade-label';
                labelElement.textContent = year;
                
                // Calculate the position percentage for proper alignment
                const position = ((year - question.min) / (question.max - question.min)) * 100;
                labelElement.style.left = `${position}%`;
                labelElement.style.position = 'absolute';
                labelElement.style.transform = 'translateX(-50%)';
                
                labelsContainer.appendChild(labelElement);
            });
        } else if (question.key === 'length') {
            // For name length question, position labels at fractional positions
            const labels = ['⚡ Short', '💫 Medium', '🌟 Long'];
            const numLabels = labels.length;
            
            labels.forEach((label, index) => {
                const labelElement = document.createElement('div');
                labelElement.className = 'slider-label length-label';
                labelElement.textContent = label;
                
                // Calculate position: first at 0%, middle at 50%, last at 100%
                let position;
                if (index === 0) {
                    position = 0; // Start of slider
                } else if (index === numLabels - 1) {
                    position = 100; // End of slider
                } else {
                    position = (index / (numLabels - 1)) * 100; // Evenly distributed
                }
                
                labelElement.style.left = `${position}%`;
                labelElement.style.position = 'absolute';
                labelElement.style.transform = 'translateX(-50%)';
                
                labelsContainer.appendChild(labelElement);
            });
        } else {
            // For other questions, use the provided labels
            labelsContainer.classList.add('regular-labels');
            question.labels.forEach((label, index) => {
                const labelElement = document.createElement('div');
                labelElement.className = 'slider-label regular-label';
                labelElement.textContent = label;
                if (index === 0) labelElement.classList.add('left');
                if (index === question.labels.length - 1) labelElement.classList.add('right');
                labelsContainer.appendChild(labelElement);
            });
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
            return '🌟 Long (7+ letters)';
        } else if (question.key === 'popularity') {
            return question.labels[value - 1];
        }
        return value;
    }

    getSliderValue(question, value) {
        if (question.key === 'length') {
            if (value <= 1.5) return 'short';
            if (value <= 2.5) return 'medium';
            return 'long';
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
                 path.style.transform = 'scale(1.02)';
               });
               
               path.addEventListener('mouseleave', () => {
                 if (!path.classList.contains('selected')) {
                   path.style.fill = 'rgba(255, 215, 0, 0.1)';
                   path.style.stroke = '#FFD700';
                   path.style.strokeWidth = '1.5';
                   path.style.filter = 'none';
                   path.style.transform = 'scale(1)';
                 }
               });
               
               path.addEventListener('click', () => {
                 svgElement.querySelectorAll('.state-path').forEach(p => {
                   p.classList.remove('selected');
                   p.style.fill = 'rgba(255, 215, 0, 0.1)';
                   p.style.stroke = '#FFD700';
                   p.style.strokeWidth = '1.5';
                   p.style.filter = 'none';
                   p.style.transform = 'scale(1)';
                 });
                 
                 path.classList.add('selected');
                 path.style.fill = 'rgba(255, 215, 0, 0.7)';
                 path.style.stroke = '#FFA500';
                 path.style.strokeWidth = '3';
                 path.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                 
                 console.log("State selected:", path.id || path.getAttribute('name'));
                 
                 // Show continue button using existing system
                 this.showMapContinueButton();
               });
             });
      
            mapContainer.appendChild(svgElement);
          })
          .catch(err => console.error("Error loading map:", err));
       }
       
    showMapContinueButton() {
        console.log('showMapContinueButton called');
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer && !continueContainer.querySelector('.slider-continue-btn')) {
            // Use the same continue button system as sliders
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = 'Continue';
            continueBtn.addEventListener('click', () => {
                // Get the selected state
                const selectedState = document.querySelector('.state-path.selected');
                if (selectedState) {
                    const stateId = selectedState.id || selectedState.getAttribute('name');
                    console.log('Continuing with state:', stateId);
                    this.selectAnswer(stateId);
                }
            });
            continueContainer.appendChild(continueBtn);
            console.log('Map continue button added');
        }
    }
    
    hideMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.style.display = 'none';
            console.log('Map hidden');
        }
    }
    
    createBasicMap(container) {
        console.log('Creating basic map...');
        
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
        console.log('Basic map created and added');
        console.log('State list children count:', stateList.children.length);
        console.log('Container children count:', container.children.length);
        
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
        
        console.log('Forced visibility update');
        console.log('State list computed style:', window.getComputedStyle(stateList).display);
        console.log('Container computed style:', window.getComputedStyle(container).display);
        
        // Add a test element to make sure something is visible
        const testDiv = document.createElement('div');
        testDiv.innerHTML = 'TEST: Map should be visible here!';
        testDiv.style.cssText = 'background: red; color: white; padding: 20px; margin: 10px; font-size: 20px; border: 3px solid yellow;';
        container.appendChild(testDiv);
        console.log('Test element added');
    }
    
    createSimpleMap(container) {
        console.log('Creating simple map...');
        
        const mapGrid = document.createElement('div');
        mapGrid.className = 'map-grid';
        console.log('Map grid created');
        
        // All 50 US states in a simple grid format
        const states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ];
        
        console.log(`Creating ${states.length} state buttons`);
        
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
        
        console.log('State buttons created, adding to container');
        container.appendChild(mapGrid);
        console.log('Map grid added to container');
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

    makeGuess() {
        const guess = this.calculateGuess();
        const confidence = this.calculateConfidence();
        
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
        
        document.getElementById('guessName').textContent = guess.name;
        document.getElementById('confidenceText').textContent = `${confidence}% confident`;
        document.getElementById('confidenceFill').style.width = `${confidence}%`;
        
        // Update browser history
        history.pushState({page: 'result'}, '', '#result');
        
        this.currentGuess = guess;
    }

    calculateGuess() {
        console.log('=== STARTING NAME SEARCH ===');
        console.log('Current answers:', this.answers);
        console.log('Total names in database:', Object.keys(this.enhancedNameDatabase.nameData).length);
        console.log('Sample names from database:', Object.values(this.enhancedNameDatabase.nameData).slice(0, 10).map(n => n.name));
        
        const candidates = this.getCandidates();
        
        console.log('Candidates after filtering:', candidates.length);
        console.log('Filtered candidates:', candidates.map(c => c.name).slice(0, 10));
        
        if (candidates.length === 0) {
            console.log('🔍 NO CANDIDATES FOUND - trying with relaxed criteria');
            
            // Try with relaxed length criteria first
            const relaxedCandidates = Object.values(this.enhancedNameDatabase.nameData).filter(nameInfo => {
                // Keep all other filters but relax length
                if (this.answers.gender && 
                    this.answers.gender !== "NB" && 
                    this.answers.gender !== "PREFER_NOT_TO_SAY" && 
                    nameInfo.gender !== this.answers.gender) {
                    return false;
                }
                
                // Relax length: if they want long, accept 6+ letters
                if (this.answers.length === 'long') {
                    const nameLength = nameInfo.name.length;
                    if (nameLength < 6) return false; // Still reject very short names
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
            
            console.log('✅ Relaxed candidates found:', relaxedCandidates.length);
            console.log('📝 Relaxed candidate names:', relaxedCandidates.map(c => c.name).slice(0, 10));
            
            if (relaxedCandidates.length === 0) {
                console.log('🚨 STILL NO CANDIDATES - checking what long consonant names exist');
                
                // Debug: Show what long consonant names are in the database
                const longConsonantNames = Object.values(this.enhancedNameDatabase.nameData).filter(nameInfo => {
                    const nameLength = nameInfo.name.length;
                    const firstLetter = nameInfo.name.charAt(0).toLowerCase();
                    const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
                    return nameLength >= 6 && !isVowel;
                });
                
                console.log('🔍 Long consonant names in database:', longConsonantNames.map(n => n.name).slice(0, 20));
                
                if (longConsonantNames.length > 0) {
                    console.log('✅ Using first available long consonant name:', longConsonantNames[0].name);
                    return longConsonantNames[0];
                }
                
                console.log('❌ NO LONG CONSONANT NAMES FOUND - returning default Alex');
                return { name: 'Alex', confidence: 25 };
            }
            
            // Use relaxed candidates
            console.log('🎯 Using relaxed candidates for scoring');
            const scoredCandidates = relaxedCandidates.map(candidate => ({
                ...candidate,
                score: this.calculateNameScore(candidate)
            }));
            
            scoredCandidates.sort((a, b) => b.score - a.score);
            console.log('🏆 Best relaxed candidate:', scoredCandidates[0].name, 'Score:', scoredCandidates[0].score);
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

    calculateNameScore(nameInfo) {
        let score = 0;
        
        // DEBUG: Log current answers
        console.log('Current answers:', this.answers);
        
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
            this.answers.gender !== "PREFER_NOT_TO_SAY" && 
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
        // This would ideally use historical data, but for now we'll use a simplified approach
        // In a real implementation, you'd have decade-specific popularity data
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
        
        // For now, return a base popularity score
        // In a real implementation, this would check historical data
        if (nameInfo.totalCount > 1000) return 0.8; // Very popular
        if (nameInfo.totalCount > 500) return 0.6;  // Popular
        if (nameInfo.totalCount > 100) return 0.4;  // Somewhat popular
        return 0.2; // Uncommon
    }

    getCandidates() {
        const candidates = [];
        
        Object.values(this.enhancedNameDatabase.nameData).forEach(nameInfo => {
            // Only filter out names that absolutely don't match (like wrong gender)
            // Let the scoring system handle the rest
            if (this.matchesCriteria(nameInfo)) {
                candidates.push(nameInfo);
            }
        });
        
        return candidates;
    }

    basicCriteriaMatch(nameInfo) {
        // Only filter out names that absolutely don't match (like wrong gender)
        // Let the scoring system handle the rest
        
        // Check gender (include non-binary and prefer not to say as matching any gender)
        if (this.answers.gender && 
            this.answers.gender !== "NB" && 
            this.answers.gender !== "PREFER_NOT_TO_SAY" && 
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
        // Check gender (include non-binary and prefer not to say as matching any gender)
        if (this.answers.gender && 
            this.answers.gender !== "NB" && 
            this.answers.gender !== "PREFER_NOT_TO_SAY" && 
            nameInfo.gender !== this.answers.gender) {
            return false;
        }
        
        // Check name length - CRITICAL FILTER
        if (this.answers.length) {
            const nameLength = nameInfo.name.length;
            console.log(`Checking ${nameInfo.name} (${nameLength} letters) against length preference: ${this.answers.length}`);
            if (this.answers.length === 'short' && nameLength > 4) {
                console.log(`REJECTED: ${nameInfo.name} too long for short preference`);
                return false;
            }
            if (this.answers.length === 'medium' && (nameLength < 5 || nameLength > 6)) {
                console.log(`REJECTED: ${nameInfo.name} wrong length for medium preference`);
                return false;
            }
            if (this.answers.length === 'long' && nameLength < 7) {
                console.log(`REJECTED: ${nameInfo.name} too short for long preference (need 7+ letters)`);
                return false;
            }
            console.log(`ACCEPTED: ${nameInfo.name} matches length preference`);
        }
        
        // Check if starts with vowel
        if (this.answers.starts_with) {
            const firstLetter = nameInfo.name.charAt(0).toLowerCase();
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            console.log(`Checking ${nameInfo.name} (starts with ${firstLetter}, isVowel: ${isVowel}) against preference: ${this.answers.starts_with}`);
            if (this.answers.starts_with === 'vowel' && !isVowel) {
                console.log(`REJECTED: ${nameInfo.name} doesn't start with vowel but user wants vowel`);
                return false;
            }
            if (this.answers.starts_with === 'consonant' && isVowel) {
                console.log(`REJECTED: ${nameInfo.name} starts with vowel but user wants consonant`);
                return false;
            }
            console.log(`ACCEPTED: ${nameInfo.name} matches vowel/consonant preference`);
        }
        
        // Check popularity
        if (this.answers.popularity) {
            const isPopular = nameInfo.totalCount > 500;
            const isVeryPopular = nameInfo.totalCount > 800;
            
            if (this.answers.popularity === 'very_popular' && !isVeryPopular) return false;
            if (this.answers.popularity === 'popular' && !isPopular) return false;
            if (this.answers.popularity === 'uncommon' && isPopular) return false;
        }
        
        // Check religious tradition (handle both single values and arrays)
        if (this.answers.religious_tradition) {
            const religiousSelections = Array.isArray(this.answers.religious_tradition) 
                ? this.answers.religious_tradition 
                : [this.answers.religious_tradition];
            
            // Filter out "prefer_not_to_say", "none", and "other_spiritual"
            const validReligions = religiousSelections.filter(religion => 
                religion !== "prefer_not_to_say" && 
                religion !== "none" && 
                religion !== "other_spiritual"
            );
            
            if (validReligions.length > 0) {
                const hasMatch = validReligions.some(religion => 
                    nameInfo.religions && nameInfo.religions.includes(religion)
                );
                if (!hasMatch) {
                    return false;
                }
            }
        }
        
        // Check cultural background (handle both single values and arrays)
        if (this.answers.cultural_background) {
            const culturalSelections = Array.isArray(this.answers.cultural_background) 
                ? this.answers.cultural_background 
                : [this.answers.cultural_background];
            
            // Filter out "prefer_not_to_say" and "mixed"
            const validCultures = culturalSelections.filter(culture => 
                culture !== "prefer_not_to_say" && 
                culture !== "mixed"
            );
            
            if (validCultures.length > 0) {
                const hasMatch = validCultures.some(culture => 
                    nameInfo.culturalOrigins && nameInfo.culturalOrigins.includes(culture)
                );
                if (!hasMatch) {
                    return false;
                }
            }
        }
        
        // Check baptism status (for religious names)
        if (this.answers.baptism_status) {
            const baptismSelections = Array.isArray(this.answers.baptism_status) 
                ? this.answers.baptism_status 
                : [this.answers.baptism_status];
            
            // Filter out "prefer_not_to_say", "unsure", and "none"
            const validCeremonies = baptismSelections.filter(ceremony => 
                ceremony !== "prefer_not_to_say" && 
                ceremony !== "unsure" && 
                ceremony !== "none"
            );
            
            if (validCeremonies.length > 0) {
                // Check for religious ceremony matches
                const hasReligiousMatch = validCeremonies.some(ceremony => {
                    if (ceremony === "christian_baptized" && nameInfo.religions && nameInfo.religions.includes("christianity")) {
                        return true;
                    }
                    if (ceremony === "jewish_naming" && nameInfo.religions && nameInfo.religions.includes("judaism")) {
                        return true;
                    }
                    if (ceremony === "hindu_naming" && nameInfo.religions && nameInfo.religions.includes("hinduism")) {
                        return true;
                    }
                    if (ceremony === "islamic_naming" && nameInfo.religions && nameInfo.religions.includes("islam")) {
                        return true;
                    }
                    if (ceremony === "buddhist_naming" && nameInfo.religions && nameInfo.religions.includes("buddhism")) {
                        return true;
                    }
                    if (ceremony === "sikh_naming" && nameInfo.religions && nameInfo.religions.includes("sikhism")) {
                        return true;
                    }
                    return false;
                });
                
                if (hasReligiousMatch) {
                    // Boost names that match religious ceremonies
                    return true;
                }
            }
        }
        
        // Check state (for now, just return true as we don't have state-specific data)
        if (this.answers.state) {
            // State filtering could be added here if we had state-specific name data
            // For now, we'll just use it as a general preference
        }
        
        return true;
    }

    calculateConfidence() {
        const candidates = this.getCandidates();
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

    handleCorrect() {
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'block';
        
        document.getElementById('finalTitle').textContent = '🔮 The spirits have spoken! 🔮';
        document.getElementById('finalMessage').textContent = '✨ My crystal ball never lies! ✨';
        document.getElementById('finalMouth').className = 'mouth happy';
        
        // Update browser history
        history.pushState({page: 'final'}, '', '#final');
    }

    handleWrong() {
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'block';
        
        document.getElementById('finalTitle').textContent = '🌫️ The vision was unclear... 🌫️';
        document.getElementById('finalMessage').textContent = '🔮 The spirits are being mysterious today... 🔮';
        document.getElementById('finalMouth').className = 'mouth';
        
        // Update browser history
        history.pushState({page: 'final'}, '', '#final');
    }

    resetQuiz() {
        this.currentQuestion = 0;
        this.answers = {};
        
        document.getElementById('finalSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'none';
        document.querySelector('.hero').style.display = 'block';
        
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('characterThinking').style.display = 'none';
        
        // Reset browser history
        history.pushState({page: 'home'}, '', '#');
    }

    showHome() {
        // Hide all sections
        document.getElementById('aboutSection').style.display = 'none';
        document.getElementById('howItWorksSection').style.display = 'none';
        document.getElementById('contactSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        
        // Show hero section
        document.querySelector('.hero').style.display = 'block';
        
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
        
        // Update browser history
        history.pushState({page: 'contact'}, '', '#contact');
    }
}

// Mystical Background Graphics Manager
class MysticalBackground {
    constructor() {
        this.graphics = [
            'crystal_ball.png',
            'devil.png',
            'homer\'s_riddle.png',
            'illuminati.png',
            'mask.png',
            'medusa.png',
            'smoke.png',
            'vecteezy_cobra_36629722.svg',
            'vecteezy_egypt-sphinx_36659095.svg',
            'vecteezy_snake_36654696.svg'
        ];
        this.container = document.getElementById('mysticalBackground');
        this.quadrants = [];
        this.activeGraphics = [];
        this.maxActive = 8;
        this.minActive = 5;
        this.initializeQuadrants();
        this.createGraphics();
        this.startAnimationCycle();
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
        
        // Since we only show one graphic per quadrant, we can center it
        const centerX = quadrant.x + (quadrant.width / 2);
        const centerY = quadrant.y + (quadrant.height / 2);
        const x = centerX - size / 2;
        const y = centerY - size / 2;
        
        graphic.style.left = `${x}px`;
        graphic.style.top = `${y}px`;
        
        // Random orientation: 0 degrees, horizontal flip, vertical flip, or both
        const orientations = [
            'rotate(0deg)',           // Normal
            'scaleX(-1)',             // Horizontal flip
            'scaleY(-1)',             // Vertical flip
            'scaleX(-1) scaleY(-1)'   // Both flips
        ];
        const orientation = orientations[Math.floor(Math.random() * orientations.length)];
        graphic.style.transform = orientation;
        
        // Random graphic from the collection (using all 10 graphics)
        const graphicSrc = this.graphics[Math.floor(Math.random() * this.graphics.length)];
        const img = document.createElement('img');
        img.src = `../assets/background-graphics/${graphicSrc}`;
        img.alt = 'Mystical Symbol';
        
        graphic.appendChild(img);
        
        // Show the graphic
        graphic.style.opacity = '0.7';
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
        } else if (hash === '#final') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'block';
            document.getElementById('howItWorksSection').style.display = 'none';
        } else if (hash === '#how-it-works') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'block';
        } else if (hash === '#about') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'block';
        } else if (hash === '#contact') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'block';
        } else {
            // Default to hero section
            document.querySelector('.hero').style.display = 'block';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            
            // Reset quiz state
            quiz.currentQuestion = 0;
            quiz.answers = {};
            quiz.updateProgress();
        }
    });
});

