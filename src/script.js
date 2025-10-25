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
            // {
            //     text: "📏 How many letters are in your first name?",
            //     type: "slider",
            //     min: 1,
            //     max: 3,
            //     step: 0.01,
            //     default: 2,
            //     labels: ["⚡ Short", "💫 Medium", "🌟 Long"],
            //     key: "length"
            // },
            {
                text: "🔤 Does your name start with a vowel?",
                options: [
                    { text: "✅ Yes (A, E, I, O, U)", value: "vowel" },
                    { text: "❌ No", value: "consonant" }
                ],
                key: "starts_with"
            },
            // {
            //     text: "⭐ How popular is your name?",
            //     type: "slider",
            //     min: 1,
            //     max: 3,
            //     step: 0.11,
            //     default: 2,
            //     labels: ["✨ Uncommon/unique", "💫 Somewhat popular", "🔥 Very popular"],
            //     key: "popularity"
            // },
            {
                text: "🎭 What creative hobbies interest you?",
                type: "multi_select",
                options: [
                    { text: "✍️ Writing stories or poetry", value: "writer" },
                    { text: "🎵 Playing music or singing", value: "musician" },
                    { text: "🎨 Painting or drawing", value: "artist" },
                    { text: "🎬 Acting or performing", value: "performer" },
                    { text: "📸 Photography", value: "photography" },
                    { text: "💃 Dancing", value: "dancing" },
                    { text: "🎪 Crafts or DIY", value: "crafts" },
                    { text: "🎮 Game design", value: "game_design" },
                    { text: "🏗️ Architecture or design", value: "architecture" },
                    { text: "🍳 Cooking or baking", value: "cooking" }
                ],
                key: "creative_interest"
            },
            {
                text: "🏢 What work environments appeal to you?",
                type: "multi_select",
                options: [
                    { text: "⚖️ Courtroom or law office", value: "legal" },
                    { text: "🏥 Hospital or clinic", value: "medical" },
                    { text: "🌾 Farm or outdoor work", value: "agricultural" },
                    { text: "💻 Tech office or startup", value: "technology" },
                    { text: "🎨 Art studio or creative space", value: "creative" },
                    { text: "🏫 School or university", value: "education" },
                    { text: "🏭 Factory or industrial setting", value: "industrial" },
                    { text: "🏪 Retail store or shop", value: "retail" },
                    { text: "🍳 Restaurant or kitchen", value: "culinary" },
                    { text: "🏢 Corporate office building", value: "corporate" },
                    { text: "🏠 Home office or remote work", value: "remote" },
                    { text: "🎭 Theater or performance venue", value: "theater" },
                    { text: "🏃‍♀️ Gym or fitness center", value: "fitness" },
                    { text: "🌍 Travel or field work", value: "travel" },
                    { text: "🔬 Laboratory or research facility", value: "research" },
                    { text: "✈️ Airport or transportation hub", value: "transportation" }
                ],
                key: "work_environment"
            },
            {
                text: "📚 What types of books do you enjoy?",
                type: "multi_select",
                options: [
                    { text: "📖 Classic literature", value: "literature" },
                    { text: "🔬 Science or nature guide", value: "science" },
                    { text: "📊 Business or finance", value: "business" },
                    { text: "🎨 Art or design book", value: "art" },
                    { text: "🕵️ Mystery or thriller", value: "mystery" },
                    { text: "🚀 Science fiction or fantasy", value: "sci_fi" },
                    { text: "❤️ Romance or drama", value: "romance" },
                    { text: "📚 Biography or memoir", value: "biography" },
                    { text: "🌍 Travel or adventure", value: "travel" },
                    { text: "🍳 Cookbook or lifestyle", value: "lifestyle" },
                    { text: "🧠 Psychology or self-help", value: "psychology" },
                    { text: "🏛️ History or philosophy", value: "history" },
                    { text: "🎮 Gaming or technology", value: "gaming" },
                    { text: "📰 News or current events", value: "news" },
                    { text: "📚 Poetry or verse", value: "poetry" },
                    { text: "🎭 Theater or plays", value: "theater" },
                    { text: "🌱 Gardening or nature", value: "gardening" },
                    { text: "🏃‍♀️ Health or fitness", value: "health" },
                    { text: "🎵 Music or entertainment", value: "music" },
                    { text: "📚 Children's books", value: "children" }
                ],
                key: "reading_preference"
            },
            {
                text: "🏠 What types of neighborhoods appeal to you?",
                type: "multi_select",
                options: [
                    { text: "🌳 Quiet suburban area", value: "suburban" },
                    { text: "🏙️ Bustling city center", value: "urban" },
                    { text: "🌾 Rural countryside", value: "rural" },
                    { text: "🏘️ Historic district", value: "historic" },
                    { text: "🏖️ Beach or coastal town", value: "coastal" },
                    { text: "🏔️ Mountain or hill area", value: "mountain" },
                    { text: "🌲 Forest or woodland", value: "forest" },
                    { text: "🏜️ Desert or arid region", value: "desert" },
                    { text: "🏘️ College town or university area", value: "college" },
                    { text: "🏭 Industrial or working-class area", value: "industrial" },
                    { text: "🎨 Arts district or creative hub", value: "arts" },
                    { text: "🌍 International or diverse community", value: "international" },
                    { text: "🏡 Gated community or private area", value: "gated" },
                    { text: "🚶‍♀️ Walkable downtown area", value: "walkable" }
                ],
                key: "neighborhood_preference"
            },
            {
                text: "🎓 What educational paths interest you?",
                type: "multi_select",
                options: [
                    { text: "⚖️ Law or political science", value: "legal" },
                    { text: "🔬 Medicine or research", value: "medical" },
                    { text: "💼 Business or economics", value: "business" },
                    { text: "🎨 Arts or humanities", value: "arts" },
                    { text: "💻 Computer science or tech", value: "technology" },
                    { text: "🏗️ Engineering or architecture", value: "engineering" },
                    { text: "👨‍🏫 Education or teaching", value: "education" },
                    { text: "🌱 Environmental science", value: "environment" },
                    { text: "🎵 Music or performing arts", value: "performing" },
                    { text: "📚 Psychology or social work", value: "social" },
                    { text: "🌍 International studies", value: "international" },
                    { text: "🏛️ History or philosophy", value: "humanities" },
                    { text: "🌿 Agriculture or forestry", value: "agriculture" },
                    { text: "🏥 Nursing or healthcare", value: "nursing" },
                    { text: "🎬 Film or media studies", value: "film" },
                    { text: "🏃‍♀️ Sports or kinesiology", value: "sports" },
                    { text: "🍳 Culinary arts", value: "culinary" },
                    { text: "🎨 Design or fashion", value: "design" },
                    { text: "🌍 Languages or linguistics", value: "languages" },
                    { text: "🔬 Mathematics or statistics", value: "mathematics" }
                ],
                key: "educational_interest"
            },
            {
                text: "🌟 How do you prefer to stand out in a group?",
                type: "multi_select",
                options: [
                    { text: "💡 Through unique ideas", value: "creative" },
                    { text: "📊 Through expertise", value: "expert" },
                    { text: "🤝 Through leadership", value: "leader" },
                    { text: "🎭 Through personality", value: "charismatic" },
                    { text: "🎵 Through humor", value: "humorous" },
                    { text: "💪 Through strength", value: "strong" },
                    { text: "🧠 Through wisdom", value: "wise" },
                    { text: "❤️ Through kindness", value: "kind" },
                    { text: "🎨 Through creativity", value: "artistic" },
                    { text: "🏃‍♀️ Through energy", value: "energetic" }
                ],
                key: "social_style"
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
                text: "🎵 What types of music do you enjoy?",
                type: "multi_select",
                options: [
                    { text: "🎼 Classical or orchestral", value: "classical" },
                    { text: "🎸 Rock or alternative", value: "rock" },
                    { text: "🎤 Pop or mainstream", value: "pop" },
                    { text: "🎷 Jazz or blues", value: "jazz" },
                    { text: "🎵 Electronic or ambient", value: "electronic" },
                    { text: "🎶 Folk or acoustic", value: "folk" },
                    { text: "🎺 Hip-hop or rap", value: "hip_hop" },
                    { text: "🎻 Country or western", value: "country" },
                    { text: "🎹 R&B or soul", value: "rnb" },
                    { text: "🎸 Metal or heavy metal", value: "metal" },
                    { text: "🎵 Reggae or ska", value: "reggae" },
                    { text: "🎺 Funk or disco", value: "funk" },
                    { text: "🎻 Gospel or spiritual", value: "gospel" },
                    { text: "🎸 Punk or grunge", value: "punk" },
                    { text: "🎵 World music or ethnic", value: "world" },
                    { text: "🎹 Indie or alternative", value: "indie" },
                    { text: "🎺 Latin or salsa", value: "latin" },
                    { text: "🎻 Opera or musical theater", value: "opera" },
                    { text: "🎸 New age or meditation", value: "new_age" },
                    { text: "🎵 Experimental or avant-garde", value: "experimental" }
                ],
                key: "music_preference"
            },
            {
                text: "🌟 How do you handle stress?",
                type: "multi_select",
                options: [
                    { text: "🧘 Meditation or mindfulness", value: "mindful" },
                    { text: "🏃 Exercise or physical activity", value: "active" },
                    { text: "📚 Reading or learning", value: "intellectual" },
                    { text: "🎨 Creative expression", value: "creative" },
                    { text: "👥 Socializing with friends", value: "social" },
                    { text: "🎮 Gaming or entertainment", value: "distraction" },
                    { text: "🎵 Music or singing", value: "music" },
                    { text: "🍳 Cooking or baking", value: "cooking" },
                    { text: "🌿 Nature or gardening", value: "nature" },
                    { text: "✍️ Writing or journaling", value: "writing" },
                    { text: "🎬 Movies or TV", value: "media" },
                    { text: "🏃‍♀️ Sports or fitness", value: "sports" },
                    { text: "🎨 Art or crafts", value: "art" },
                    { text: "🐕 Pet care or animals", value: "pets" },
                    { text: "🧘 Yoga or stretching", value: "yoga" }
                ],
                key: "stress_management"
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
        const candidates = this.getCandidates();
        
        if (candidates.length === 0) {
            return { name: 'Alex', confidence: 50 };
        }
        
        // Sort by total count (popularity)
        candidates.sort((a, b) => b.totalCount - a.totalCount);
        
        return candidates[0];
    }

    getCandidates() {
        const candidates = [];
        
        Object.values(this.nameData).forEach(nameInfo => {
            if (this.matchesCriteria(nameInfo)) {
                candidates.push(nameInfo);
            }
        });
        
        return candidates;
    }

    matchesCriteria(nameInfo) {
        // Check gender (include non-binary and prefer not to say as matching any gender)
        if (this.answers.gender && 
            this.answers.gender !== "NB" && 
            this.answers.gender !== "PREFER_NOT_TO_SAY" && 
            nameInfo.gender !== this.answers.gender) {
            return false;
        }
        
        // Check name length
        if (this.answers.length) {
            const nameLength = nameInfo.name.length;
            if (this.answers.length === 'short' && nameLength > 4) return false;
            if (this.answers.length === 'medium' && (nameLength < 5 || nameLength > 6)) return false;
            if (this.answers.length === 'long' && nameLength < 7) return false;
        }
        
        // Check if starts with vowel
        if (this.answers.starts_with) {
            const firstLetter = nameInfo.name.charAt(0).toLowerCase();
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            if (this.answers.starts_with === 'vowel' && !isVowel) return false;
            if (this.answers.starts_with === 'consonant' && isVowel) return false;
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
        if (candidates.length === 0) return 30;
        if (candidates.length === 1) return 95;
        
        // Boost confidence for religious/cultural matches
        let confidence = 60;
        if (candidates.length <= 3) confidence = 85;
        else if (candidates.length <= 10) confidence = 70;
        
        // Check for religious significance
        const topCandidate = candidates[0];
        if (topCandidate.religiousSignificance === 'high') {
            confidence += 15;
        } else if (topCandidate.religiousSignificance === 'medium') {
            confidence += 10;
        } else if (topCandidate.religiousSignificance === 'low') {
            confidence += 5;
        }
        
        // Check for cross-religious compatibility
        if (topCandidate.crossReligious) {
            confidence += 10;
        }
        
        // Check for cultural match (handle both single values and arrays)
        if (this.answers.cultural_background) {
            const culturalSelections = Array.isArray(this.answers.cultural_background) 
                ? this.answers.cultural_background 
                : [this.answers.cultural_background];
            
            const validCultures = culturalSelections.filter(culture => 
                culture !== "prefer_not_to_say" && 
                culture !== "mixed"
            );
            
            if (validCultures.length > 0 && topCandidate.culturalOrigins) {
                const hasCulturalMatch = validCultures.some(culture => 
                    topCandidate.culturalOrigins.includes(culture)
                );
                if (hasCulturalMatch) {
                    confidence += 10;
                }
            }
        }
        
        // Check for religious match (handle both single values and arrays)
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
                    confidence += 15;
                }
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

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mystical background
    new MysticalBackground();
    
    const quiz = new NameGuessingQuiz();
    
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
        } else {
            // Default to hero section
            document.querySelector('.hero').style.display = 'block';
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

