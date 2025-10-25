// Name Guessing Quiz Logic
class NameGuessingQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = [
            {
                text: "🌈 What's your gender identity?",
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
                text: "🎭 If you had to pick a creative hobby, which sounds most appealing?",
                options: [
                    { text: "✍️ Writing stories or poetry", value: "writer" },
                    { text: "🎵 Playing music or singing", value: "musician" },
                    { text: "🎨 Painting or drawing", value: "artist" },
                    { text: "🎬 Acting or performing", value: "performer" }
                ],
                key: "creative_interest"
            },
            {
                text: "🏢 In a perfect world, what type of work environment appeals to you most?",
                options: [
                    { text: "⚖️ Courtroom or law office", value: "legal" },
                    { text: "🏥 Hospital or clinic", value: "medical" },
                    { text: "🌾 Farm or outdoor work", value: "agricultural" },
                    { text: "💻 Tech office or startup", value: "technology" }
                ],
                key: "work_environment"
            },
            {
                text: "📚 What type of book would you most likely pick up?",
                options: [
                    { text: "📖 Classic literature", value: "literature" },
                    { text: "🔬 Science or nature guide", value: "science" },
                    { text: "📊 Business or finance", value: "business" },
                    { text: "🎨 Art or design book", value: "art" }
                ],
                key: "reading_preference"
            },
            {
                text: "🏠 What type of neighborhood feels most like home to you?",
                options: [
                    { text: "🌳 Quiet suburban area", value: "suburban" },
                    { text: "🏙️ Bustling city center", value: "urban" },
                    { text: "🌾 Rural countryside", value: "rural" },
                    { text: "🏘️ Historic district", value: "historic" }
                ],
                key: "neighborhood_preference"
            },
            {
                text: "🎓 If you could choose any educational path, which appeals most?",
                options: [
                    { text: "⚖️ Law or political science", value: "legal" },
                    { text: "🔬 Medicine or research", value: "medical" },
                    { text: "💼 Business or economics", value: "business" },
                    { text: "🎨 Arts or humanities", value: "arts" }
                ],
                key: "educational_interest"
            },
            {
                text: "🌟 How do you prefer to stand out in a group?",
                options: [
                    { text: "💡 Through unique ideas", value: "creative" },
                    { text: "📊 Through expertise", value: "expert" },
                    { text: "🤝 Through leadership", value: "leader" },
                    { text: "🎭 Through personality", value: "charismatic" }
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
                text: "🎯 What's your ideal career path?",
                options: [
                    { text: "⚖️ Law and justice", value: "legal" },
                    { text: "🏥 Medicine and healing", value: "medical" },
                    { text: "🎨 Arts and creativity", value: "arts" },
                    { text: "💼 Business and finance", value: "business" },
                    { text: "🔬 Science and research", value: "science" },
                    { text: "👨‍🏫 Education and teaching", value: "education" },
                    { text: "🎵 Music and entertainment", value: "entertainment" },
                    { text: "🌱 Environment and nature", value: "environment" }
                ],
                key: "career_path"
            },
            {
                text: "🎵 What type of music do you prefer?",
                options: [
                    { text: "🎼 Classical or orchestral", value: "classical" },
                    { text: "🎸 Rock or alternative", value: "rock" },
                    { text: "🎤 Pop or mainstream", value: "pop" },
                    { text: "🎷 Jazz or blues", value: "jazz" },
                    { text: "🎵 Electronic or ambient", value: "electronic" },
                    { text: "🎶 Folk or acoustic", value: "folk" }
                ],
                key: "music_preference"
            },
            {
                text: "🌟 How do you handle stress?",
                options: [
                    { text: "🧘 Meditation or mindfulness", value: "mindful" },
                    { text: "🏃 Exercise or physical activity", value: "active" },
                    { text: "📚 Reading or learning", value: "intellectual" },
                    { text: "🎨 Creative expression", value: "creative" },
                    { text: "👥 Socializing with friends", value: "social" },
                    { text: "🎮 Gaming or entertainment", value: "distraction" }
                ],
                key: "stress_management"
            },
            {
                text: "🗺️ What state were you born in?",
                type: "map",
                key: "state"
            }
        ];
        
        this.nameData = {};
        this.loadNameData();
        this.initializeEventListeners();
    }

    async loadNameData() {
        try {
            // Load recent name data (2020-2024) for better accuracy
            const years = ['2020', '2021', '2022', '2023', '2024'];
            const allNames = {};
            
            for (const year of years) {
                const response = await fetch(`../names/yob${year}.txt`);
                const text = await response.text();
                const lines = text.split('\n');
                
                lines.forEach(line => {
                    if (line.trim()) {
                        const [name, gender, count] = line.split(',');
                        const key = `${name.toLowerCase()}_${gender}`;
                        if (!allNames[key]) {
                            allNames[key] = { name, gender, totalCount: 0, years: [] };
                        }
                        allNames[key].totalCount += parseInt(count);
                        allNames[key].years.push({ year, count: parseInt(count) });
                    }
                });
            }
            
            this.nameData = allNames;
        } catch (error) {
            console.error('Error loading name data:', error);
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
            this.createMap(question, optionsContainer);
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

    createMap() {
        console.log("createMap called");
      
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
          console.error("Map container not found!");
          return;
        }
      
         mapContainer.style.display = 'block';
         mapContainer.innerHTML = '<div id="continueContainer"></div>';
      
        console.log("Fetching map...");
        fetch('us.svg') // <-- change this if your file is in another folder
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
            console.log("Map successfully rendered!");
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
        if (candidates.length <= 3) return 85;
        if (candidates.length <= 10) return 70;
        return 60;
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

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
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
