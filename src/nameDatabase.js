// Enhanced Name Database with Religious and Cultural Associations
// This database expands the basic name data with religious, cultural, and origin information

class EnhancedNameDatabase {
    constructor() {
        this.nameData = {};
        this.religiousAssociations = {};
        this.culturalOrigins = {};
        this.isLoaded = false;
        this.loadingPromise = null;
        
        // Efficient indexes for fast lookups
        this.genderIndex = {
            'M': [],
            'F': [],
            'NB': []
        };
        this.lengthIndex = {
            'short': [], // 2-4 letters
            'medium': [], // 5-6 letters  
            'long': [] // 7+ letters
        };
        this.genderLengthIndex = {
            'M': { 'short': [], 'medium': [], 'long': [] },
            'F': { 'short': [], 'medium': [], 'long': [] },
            'NB': { 'short': [], 'medium': [], 'long': [] }
        };
        
        // State-specific indexes
        this.stateIndex = {};
        this.stateGenderIndex = {};
        this.stateGenderLengthIndex = {};
        
        // Vowel/consonant indexes
        this.vowelIndex = {
            'vowel': [],
            'consonant': []
        };
        this.genderVowelIndex = {
            'M': { 'vowel': [], 'consonant': [] },
            'F': { 'vowel': [], 'consonant': [] },
            'NB': { 'vowel': [], 'consonant': [] }
        };
        
        // Popularity indexes
        this.popularityIndex = {
            'very_popular': [],
            'popular': [],
            'uncommon': []
        };
        this.genderPopularityIndex = {
            'M': { 'very_popular': [], 'popular': [], 'uncommon': [] },
            'F': { 'very_popular': [], 'popular': [], 'uncommon': [] },
            'NB': { 'very_popular': [], 'popular': [], 'uncommon': [] }
        };
        
        this.initializeReligiousData();
        this.initializeCulturalData();
    }

    initializeReligiousData() {
        // Religious associations for names
        this.religiousAssociations = {
            // Christianity (Biblical and traditional Christian names)
            'christianity': {
                'male': [
                    'Aaron', 'Abel', 'Abraham', 'Adam', 'Andrew', 'Anthony', 'Benjamin', 'Caleb', 'Daniel', 'David',
                    'Elijah', 'Ethan', 'Gabriel', 'Isaac', 'Jacob', 'James', 'John', 'Jonathan', 'Joseph', 'Joshua',
                    'Luke', 'Mark', 'Matthew', 'Michael', 'Nathan', 'Noah', 'Paul', 'Peter', 'Samuel', 'Simon',
                    'Stephen', 'Thomas', 'Timothy', 'William', 'Zachary', 'Alexander', 'Christopher', 'Nicholas',
                    'Christian', 'Dominic', 'Francis', 'Gregory', 'Jeremy', 'Jeremiah', 'Nathaniel', 'Sebastian'
                ],
                'female': [
                    'Abigail', 'Anna', 'Bethany', 'Catherine', 'Elizabeth', 'Esther', 'Grace', 'Hannah', 'Hope',
                    'Joy', 'Judith', 'Leah', 'Mary', 'Miriam', 'Naomi', 'Rachel', 'Rebecca', 'Ruth', 'Sarah',
                    'Tabitha', 'Faith', 'Charity', 'Patience', 'Prudence', 'Temperance', 'Verity', 'Constance',
                    'Felicity', 'Mercy', 'Serenity', 'Trinity', 'Victoria', 'Amanda', 'Christina', 'Christine',
                    'Claire', 'Faith', 'Grace', 'Hope', 'Joy', 'Patience', 'Prudence', 'Serenity', 'Trinity'
                ]
            },
            
            // Judaism (Hebrew names and Jewish traditions)
            'judaism': {
                'male': [
                    'Aaron', 'Abraham', 'Adam', 'Benjamin', 'Daniel', 'David', 'Elijah', 'Ethan', 'Gabriel',
                    'Isaac', 'Jacob', 'Jonathan', 'Joshua', 'Levi', 'Michael', 'Nathan', 'Noah', 'Samuel',
                    'Simon', 'Solomon', 'Zachary', 'Ariel', 'Asher', 'Caleb', 'Eli', 'Ezra', 'Gideon', 'Isaac',
                    'Jeremiah', 'Jonah', 'Joseph', 'Judah', 'Mordecai', 'Moses', 'Reuben', 'Simeon', 'Tobias'
                ],
                'female': [
                    'Abigail', 'Esther', 'Hannah', 'Leah', 'Miriam', 'Naomi', 'Rachel', 'Rebecca', 'Ruth',
                    'Sarah', 'Deborah', 'Dinah', 'Eve', 'Judith', 'Lydia', 'Martha', 'Mary', 'Phoebe', 'Priscilla',
                    'Susanna', 'Tamar', 'Zipporah', 'Adina', 'Ariel', 'Aviva', 'Chaya', 'Eliana', 'Hadassah',
                    'Ilana', 'Leora', 'Malka', 'Nava', 'Rivka', 'Shoshana', 'Talia', 'Yael', 'Zara'
                ]
            },
            
            // Islam (Arabic and Islamic names)
            'islam': {
                'male': [
                    'Ahmad', 'Ali', 'Amir', 'Anwar', 'Ayman', 'Bilal', 'Farid', 'Hakim', 'Hassan', 'Ibrahim',
                    'Idris', 'Imran', 'Ismail', 'Jabir', 'Khalid', 'Mahmud', 'Malik', 'Mansur', 'Muhammad', 'Nabil',
                    'Omar', 'Rashid', 'Salman', 'Tariq', 'Umar', 'Usman', 'Yusuf', 'Zaid', 'Abdullah', 'Abdul',
                    'Ahmed', 'Ali', 'Amir', 'Anwar', 'Ayman', 'Bilal', 'Farid', 'Hakim', 'Hassan', 'Ibrahim',
                    'Idris', 'Imran', 'Ismail', 'Jabir', 'Khalid', 'Mahmud', 'Malik', 'Mansur', 'Muhammad', 'Nabil'
                ],
                'female': [
                    'Aisha', 'Amina', 'Fatima', 'Khadija', 'Maryam', 'Zainab', 'Aaliyah', 'Aisha', 'Amina',
                    'Fatima', 'Khadija', 'Maryam', 'Zainab', 'Aaliyah', 'Aisha', 'Amina', 'Fatima', 'Khadija',
                    'Maryam', 'Zainab', 'Aaliyah', 'Aisha', 'Amina', 'Fatima', 'Khadija', 'Maryam', 'Zainab',
                    'Aaliyah', 'Aisha', 'Amina', 'Fatima', 'Khadija', 'Maryam', 'Zainab', 'Aaliyah', 'Aisha',
                    'Amina', 'Fatima', 'Khadija', 'Maryam', 'Zainab', 'Aaliyah', 'Aisha', 'Amina', 'Fatima'
                ]
            },
            
            // Hinduism (Sanskrit and Hindu names)
            'hinduism': {
                'male': [
                    'Arjun', 'Krishna', 'Rama', 'Shiva', 'Vishnu', 'Ganesh', 'Hanuman', 'Lakshman', 'Bharat',
                    'Shatrughna', 'Aarav', 'Aryan', 'Dhruv', 'Ishaan', 'Kabir', 'Karan', 'Krish', 'Manav', 'Neel',
                    'Pranav', 'Rohan', 'Rudra', 'Siddharth', 'Ved', 'Vikram', 'Yash', 'Zain', 'Aditya', 'Akash',
                    'Aman', 'Ankit', 'Arnav', 'Chirag', 'Deepak', 'Gaurav', 'Harsh', 'Jatin', 'Kunal', 'Manoj'
                ],
                'female': [
                    'Priya', 'Kavya', 'Ananya', 'Ishita', 'Saanvi', 'Aadhya', 'Aanya', 'Aaradhya', 'Anika',
                    'Anvi', 'Diya', 'Ira', 'Kiara', 'Maya', 'Meera', 'Navya', 'Pari', 'Riya', 'Sara', 'Shreya',
                    'Sia', 'Tara', 'Vanya', 'Zara', 'Aditi', 'Amara', 'Anaya', 'Aria', 'Asha', 'Bhavya', 'Chaya',
                    'Disha', 'Esha', 'Gauri', 'Hema', 'Indira', 'Jaya', 'Kavya', 'Lakshmi', 'Meera', 'Nisha'
                ]
            },
            
            // Buddhism (Names with Buddhist significance)
            'buddhism': {
                'male': [
                    'Bodhi', 'Dharma', 'Karma', 'Nirvana', 'Siddhartha', 'Buddha', 'Ananda', 'Arjuna', 'Ashoka',
                    'Bodhi', 'Dharma', 'Karma', 'Nirvana', 'Siddhartha', 'Buddha', 'Ananda', 'Arjuna', 'Ashoka',
                    'Bodhi', 'Dharma', 'Karma', 'Nirvana', 'Siddhartha', 'Buddha', 'Ananda', 'Arjuna', 'Ashoka'
                ],
                'female': [
                    'Bodhi', 'Dharma', 'Karma', 'Nirvana', 'Siddhartha', 'Buddha', 'Ananda', 'Arjuna', 'Ashoka',
                    'Bodhi', 'Dharma', 'Karma', 'Nirvana', 'Siddhartha', 'Buddha', 'Ananda', 'Arjuna', 'Ashoka'
                ]
            },
            
            // Sikhism (Sikh names and traditions)
            'sikhism': {
                'male': [
                    'Gurpreet', 'Harpreet', 'Jaspreet', 'Manpreet', 'Rajpreet', 'Simran', 'Aman', 'Arjun', 'Bhavin',
                    'Charan', 'Dilpreet', 'Gurdeep', 'Harman', 'Jasbir', 'Karan', 'Lakhbir', 'Manjit', 'Navdeep',
                    'Prabhdeep', 'Rajdeep', 'Sukhdeep', 'Taran', 'Ujjal', 'Vikram', 'Yuvraj', 'Zorawar', 'Akal',
                    'Bhai', 'Charan', 'Darshan', 'Ekam', 'Fateh', 'Gur', 'Hari', 'Ishwar', 'Jap', 'Kirat'
                ],
                'female': [
                    'Gurpreet', 'Harpreet', 'Jaspreet', 'Manpreet', 'Rajpreet', 'Simran', 'Aman', 'Arjun', 'Bhavin',
                    'Charan', 'Dilpreet', 'Gurdeep', 'Harman', 'Jasbir', 'Karan', 'Lakhbir', 'Manjit', 'Navdeep',
                    'Prabhdeep', 'Rajdeep', 'Sukhdeep', 'Taran', 'Ujjal', 'Vikram', 'Yuvraj', 'Zorawar', 'Akal',
                    'Bhai', 'Charan', 'Darshan', 'Ekam', 'Fateh', 'Gur', 'Hari', 'Ishwar', 'Jap', 'Kirat'
                ]
            },
            
            // Greek Mythology and Culture
            'greek': {
                'male': [
                    'Alexander', 'Andreas', 'Dimitri', 'Elias', 'Gabriel', 'Jason', 'Nicholas', 'Theodore', 'Zachary',
                    'Adonis', 'Apollo', 'Atlas', 'Dionysus', 'Hector', 'Hercules', 'Jason', 'Odysseus', 'Perseus',
                    'Theseus', 'Zeus', 'Achilles', 'Agamemnon', 'Ajax', 'Anton', 'Aristotle', 'Demetrius', 'Evander',
                    'Gregory', 'Hector', 'Icarus', 'Leonidas', 'Marcus', 'Nestor', 'Orion', 'Phoenix', 'Socrates'
                ],
                'female': [
                    'Alexandra', 'Athena', 'Diana', 'Elena', 'Grace', 'Helen', 'Iris', 'Luna', 'Phoebe', 'Sophia',
                    'Aphrodite', 'Artemis', 'Athena', 'Calliope', 'Cassandra', 'Diana', 'Elena', 'Helen', 'Iris',
                    'Juno', 'Luna', 'Minerva', 'Phoebe', 'Selene', 'Sophia', 'Thea', 'Venus', 'Zoe', 'Ariadne',
                    'Calypso', 'Circe', 'Demeter', 'Echo', 'Gaia', 'Hera', 'Iris', 'Juno', 'Kore', 'Leto'
                ]
            },
            
            // Norse/Scandinavian
            'norse': {
                'male': [
                    'Erik', 'Bjorn', 'Gunnar', 'Leif', 'Magnus', 'Olaf', 'Ragnar', 'Sven', 'Thor', 'Ulf',
                    'Ake', 'Anders', 'Axel', 'Erik', 'Gustav', 'Hans', 'Ingvar', 'Johan', 'Karl', 'Lars',
                    'Magnus', 'Nils', 'Olav', 'Per', 'Rolf', 'Sten', 'Tore', 'Ulf', 'Vidar', 'Yngve'
                ],
                'female': [
                    'Astrid', 'Freya', 'Ingrid', 'Sigrid', 'Solveig', 'Thora', 'Ursula', 'Valkyrie', 'Ylva', 'Zara',
                    'Agneta', 'Birgitta', 'Cecilia', 'Dagny', 'Elin', 'Freya', 'Gunhild', 'Helga', 'Ingrid', 'Jorunn',
                    'Karin', 'Liv', 'Maren', 'Nora', 'Oda', 'Petra', 'Ragnhild', 'Solveig', 'Tora', 'Ursula'
                ]
            },
            
            // Celtic/Irish
            'celtic': {
                'male': [
                    'Aidan', 'Brendan', 'Connor', 'Declan', 'Finn', 'Liam', 'Owen', 'Patrick', 'Sean', 'Tristan',
                    'Aengus', 'Bran', 'Cian', 'Darragh', 'Eamon', 'Fergus', 'Gareth', 'Hugh', 'Ian', 'Jarlath',
                    'Keegan', 'Lorcan', 'Maeve', 'Niall', 'Oisin', 'Padraig', 'Quinn', 'Ronan', 'Shane', 'Tadhg'
                ],
                'female': [
                    'Aisling', 'Bridget', 'Caitlin', 'Deirdre', 'Eileen', 'Fiona', 'Grainne', 'Hannah', 'Iona', 'Kiera',
                    'Aine', 'Brigid', 'Ciara', 'Deirdre', 'Eilis', 'Fionnuala', 'Grainne', 'Hannah', 'Iona', 'Kiera',
                    'Laoise', 'Maeve', 'Niamh', 'Orla', 'Padraig', 'Quinn', 'Roisin', 'Saoirse', 'Tara', 'Una'
                ]
            }
        };
    }

    initializeCulturalData() {
        // Cultural and linguistic origins
        this.culturalOrigins = {
            'arabic': ['Aaliyah', 'Aisha', 'Amina', 'Fatima', 'Khadija', 'Maryam', 'Zainab', 'Ahmad', 'Ali', 'Amir'],
            'hebrew': ['Aaron', 'Abraham', 'Adam', 'Benjamin', 'Daniel', 'David', 'Elijah', 'Ethan', 'Gabriel', 'Isaac'],
            'sanskrit': ['Arjun', 'Krishna', 'Rama', 'Shiva', 'Vishnu', 'Ganesh', 'Hanuman', 'Aarav', 'Aryan', 'Dhruv'],
            'greek': ['Alexander', 'Andreas', 'Dimitri', 'Elias', 'Gabriel', 'Jason', 'Nicholas', 'Theodore', 'Zachary'],
            'latin': ['Augustus', 'Caesar', 'Marcus', 'Maximus', 'Roman', 'Victor', 'Victoria', 'Felix', 'Lucius', 'Quintus'],
            'germanic': ['Adolf', 'Bruno', 'Conrad', 'Frederick', 'Gunther', 'Hans', 'Klaus', 'Otto', 'Rudolf', 'Wolfgang'],
            'celtic': ['Aidan', 'Brendan', 'Connor', 'Declan', 'Finn', 'Liam', 'Owen', 'Patrick', 'Sean', 'Tristan'],
            'slavic': ['Boris', 'Dmitri', 'Igor', 'Mikhail', 'Nikolai', 'Pavel', 'Sergei', 'Vladimir', 'Yuri', 'Zachary'],
            'norse': ['Erik', 'Bjorn', 'Gunnar', 'Leif', 'Magnus', 'Olaf', 'Ragnar', 'Sven', 'Thor', 'Ulf']
        };
    }

    // Enhanced name data structure with religious and cultural metadata
    createEnhancedNameEntry(name, gender, count, year) {
        const nameLower = name.toLowerCase();
        
        return {
            name: name,
            gender: gender,
            totalCount: count,
            years: [{ year, count }],
            
            // Religious associations
            religions: this.getReligiousAssociations(name, gender),
            
            // Cultural origins
            culturalOrigins: this.getCulturalOrigins(name),
            
            // Additional metadata
            popularity: this.calculatePopularity(count),
            nameLength: name.length,
            startsWithVowel: this.startsWithVowel(name),
            nameEnding: this.getNameEnding(name),
            
            // Religious significance level
            religiousSignificance: this.calculateReligiousSignificance(name, gender),
            
            // Cross-religious compatibility
            crossReligious: this.getCrossReligiousNames(name, gender)
        };
    }

    getReligiousAssociations(name, gender) {
        const religions = [];
        const nameLower = name.toLowerCase();
        
        for (const [religion, data] of Object.entries(this.religiousAssociations)) {
            const genderNames = data[gender.toLowerCase()] || [];
            if (genderNames.some(relName => relName.toLowerCase() === nameLower)) {
                religions.push(religion);
            }
        }
        
        return religions;
    }

    getCulturalOrigins(name) {
        const origins = [];
        const nameLower = name.toLowerCase();
        
        for (const [origin, names] of Object.entries(this.culturalOrigins)) {
            if (names.some(originName => originName.toLowerCase() === nameLower)) {
                origins.push(origin);
            }
        }
        
        return origins;
    }

    calculateReligiousSignificance(name, gender) {
        const religions = this.getReligiousAssociations(name, gender);
        const origins = this.getCulturalOrigins(name);
        
        let significance = 'none';
        
        if (religions.length >= 3) {
            significance = 'high';
        } else if (religions.length >= 2) {
            significance = 'medium';
        } else if (religions.length >= 1) {
            significance = 'low';
        }
        
        return significance;
    }

    getCrossReligiousNames(name, gender) {
        // Names that appear in multiple religious traditions
        const crossReligiousNames = [
            'David', 'Gabriel', 'Michael', 'Noah', 'Isaac', 'Abraham', 'Adam', 'Aaron', 'Benjamin', 'Daniel',
            'Elijah', 'Ethan', 'Jacob', 'Joshua', 'Samuel', 'Simon', 'Thomas', 'William', 'Zachary', 'Alexander',
            'Christopher', 'Nicholas', 'Christian', 'Dominic', 'Francis', 'Gregory', 'Jeremy', 'Jeremiah',
            'Nathaniel', 'Sebastian', 'Abigail', 'Anna', 'Elizabeth', 'Esther', 'Grace', 'Hannah', 'Hope',
            'Joy', 'Judith', 'Leah', 'Mary', 'Miriam', 'Naomi', 'Rachel', 'Rebecca', 'Ruth', 'Sarah',
            'Tabitha', 'Faith', 'Charity', 'Patience', 'Prudence', 'Temperance', 'Verity', 'Constance',
            'Felicity', 'Mercy', 'Serenity', 'Trinity', 'Victoria', 'Amanda', 'Christina', 'Christine'
        ];
        
        return crossReligiousNames.includes(name);
    }

    calculatePopularity(count) {
        if (count > 10000) return 'very_popular';
        if (count > 5000) return 'popular';
        if (count > 1000) return 'moderate';
        if (count > 100) return 'uncommon';
        return 'rare';
    }

    startsWithVowel(name) {
        const firstLetter = name.charAt(0).toLowerCase();
        return ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
    }

    getNameEnding(name) {
        const lastLetter = name.charAt(name.length - 1).toLowerCase();
        if (['a', 'e', 'i', 'o', 'u'].includes(lastLetter)) {
            return 'vowel';
        }
        return 'consonant';
    }

    // Ensure database is loaded
    async ensureLoaded() {
        if (this.isLoaded) {
            return true;
        }
        
        if (this.loadingPromise) {
            return await this.loadingPromise;
        }
        
        this.loadingPromise = this.loadEnhancedNameData();
        return await this.loadingPromise;
    }

    // Load and enhance name data from files
    async loadEnhancedNameData() {
        try {
            const years = ['2020', '2021', '2022', '2023', '2024'];
            const allNames = {};
            
            // Load national data
            for (const year of years) {
                const response = await fetch(`../names/yob${year}.txt`);
                const text = await response.text();
                const lines = text.split('\n');
                
                lines.forEach(line => {
                    if (line.trim()) {
                        const [name, gender, count] = line.split(',');
                        const key = `${name.toLowerCase()}_${gender}`;
                        
                        if (!allNames[key]) {
                            allNames[key] = this.createEnhancedNameEntry(name, gender, 0, year);
                        }
                        
                        allNames[key].totalCount += parseInt(count);
                        allNames[key].years.push({ year, count: parseInt(count) });
                    }
                });
            }
            
            // Load state-specific data
            await this.loadStateData(allNames);
            
            this.nameData = allNames;
            this.buildIndexes();
            this.isLoaded = true;
            console.log('✅ Enhanced name database fully loaded and indexed');
            return allNames;
        } catch (error) {
            console.error('Error loading enhanced name data:', error);
            return this.getFallbackEnhancedNames();
        }
    }

    // Load state-specific name data
    async loadStateData(allNames) {
        try {
            const stateFiles = [
                'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL',
                'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA',
                'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
                'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI',
                'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'
            ];
            
            console.log('🗺️ Loading state-specific name data...');
            
            for (const state of stateFiles) {
                try {
                    const response = await fetch(`../namesbystate/${state}.TXT`);
                    const text = await response.text();
                    const lines = text.split('\n');
                    
                    this.stateIndex[state] = [];
                    
                    lines.forEach(line => {
                        if (line.trim()) {
                            const [name, gender, count] = line.split(',');
                            const key = `${name.toLowerCase()}_${gender}`;
                            
                            // Add state data to existing name entry
                            if (allNames[key]) {
                                if (!allNames[key].states) {
                                    allNames[key].states = {};
                                }
                                allNames[key].states[state] = parseInt(count);
                                
                                // Add to state index
                                this.stateIndex[state].push(allNames[key]);
                            }
                        }
                    });
                    
                    console.log(`✅ Loaded ${this.stateIndex[state].length} names for ${state}`);
                } catch (error) {
                    console.warn(`⚠️ Could not load data for state ${state}:`, error);
                }
            }
            
            console.log('🗺️ State data loading complete');
        } catch (error) {
            console.error('Error loading state data:', error);
        }
    }

    buildIndexes() {
        console.log('🔨 Building comprehensive indexes for fast lookups...');
        
        // Clear existing indexes
        this.genderIndex = { 'M': [], 'F': [], 'NB': [] };
        this.lengthIndex = { 'short': [], 'medium': [], 'long': [] };
        this.genderLengthIndex = {
            'M': { 'short': [], 'medium': [], 'long': [] },
            'F': { 'short': [], 'medium': [], 'long': [] },
            'NB': { 'short': [], 'medium': [], 'long': [] }
        };
        
        // Clear new indexes
        this.vowelIndex = { 'vowel': [], 'consonant': [] };
        this.genderVowelIndex = {
            'M': { 'vowel': [], 'consonant': [] },
            'F': { 'vowel': [], 'consonant': [] },
            'NB': { 'vowel': [], 'consonant': [] }
        };
        
        this.popularityIndex = { 'very_popular': [], 'popular': [], 'uncommon': [] };
        this.genderPopularityIndex = {
            'M': { 'very_popular': [], 'popular': [], 'uncommon': [] },
            'F': { 'very_popular': [], 'popular': [], 'uncommon': [] },
            'NB': { 'very_popular': [], 'popular': [], 'uncommon': [] }
        };
        
        // Initialize state indexes
        this.stateGenderIndex = {};
        this.stateGenderLengthIndex = {};
        
        Object.values(this.nameData).forEach(nameInfo => {
            const nameLength = nameInfo.name.length;
            let lengthCategory;
            
            // Categorize by length
            if (nameLength <= 4) {
                lengthCategory = 'short';
            } else if (nameLength <= 6) {
                lengthCategory = 'medium';
            } else {
                lengthCategory = 'long';
            }
            
            // Categorize by vowel/consonant
            const firstLetter = nameInfo.name.charAt(0).toLowerCase();
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            const vowelCategory = isVowel ? 'vowel' : 'consonant';
            
            // Categorize by popularity
            let popularityCategory;
            if (nameInfo.totalCount > 800) {
                popularityCategory = 'very_popular';
            } else if (nameInfo.totalCount > 500) {
                popularityCategory = 'popular';
            } else {
                popularityCategory = 'uncommon';
            }
            
            // Add to basic indexes
            if (this.genderIndex[nameInfo.gender]) {
                this.genderIndex[nameInfo.gender].push(nameInfo);
            }
            this.lengthIndex[lengthCategory].push(nameInfo);
            this.vowelIndex[vowelCategory].push(nameInfo);
            this.popularityIndex[popularityCategory].push(nameInfo);
            
            // Add to combined indexes
            if (this.genderLengthIndex[nameInfo.gender] && this.genderLengthIndex[nameInfo.gender][lengthCategory]) {
                this.genderLengthIndex[nameInfo.gender][lengthCategory].push(nameInfo);
            }
            
            if (this.genderVowelIndex[nameInfo.gender] && this.genderVowelIndex[nameInfo.gender][vowelCategory]) {
                this.genderVowelIndex[nameInfo.gender][vowelCategory].push(nameInfo);
            }
            
            if (this.genderPopularityIndex[nameInfo.gender] && this.genderPopularityIndex[nameInfo.gender][popularityCategory]) {
                this.genderPopularityIndex[nameInfo.gender][popularityCategory].push(nameInfo);
            }
            
            // Add to state-specific indexes
            if (nameInfo.states) {
                Object.keys(nameInfo.states).forEach(state => {
                    if (!this.stateGenderIndex[state]) {
                        this.stateGenderIndex[state] = { 'M': [], 'F': [], 'NB': [] };
                    }
                    if (!this.stateGenderLengthIndex[state]) {
                        this.stateGenderLengthIndex[state] = {
                            'M': { 'short': [], 'medium': [], 'long': [] },
                            'F': { 'short': [], 'medium': [], 'long': [] },
                            'NB': { 'short': [], 'medium': [], 'long': [] }
                        };
                    }
                    
                    if (this.stateGenderIndex[state][nameInfo.gender]) {
                        this.stateGenderIndex[state][nameInfo.gender].push(nameInfo);
                    }
                    
                    if (this.stateGenderLengthIndex[state][nameInfo.gender] && 
                        this.stateGenderLengthIndex[state][nameInfo.gender][lengthCategory]) {
                        this.stateGenderLengthIndex[state][nameInfo.gender][lengthCategory].push(nameInfo);
                    }
                });
            }
        });
        
        // Sort all indexes by popularity
        this.sortIndexes();
        
        console.log('✅ Comprehensive indexes built successfully!');
        console.log(`📊 Gender index: M=${this.genderIndex.M.length}, F=${this.genderIndex.F.length}, NB=${this.genderIndex.NB.length}`);
        console.log(`📏 Length index: short=${this.lengthIndex.short.length}, medium=${this.lengthIndex.medium.length}, long=${this.lengthIndex.long.length}`);
        console.log(`🔤 Vowel index: vowel=${this.vowelIndex.vowel.length}, consonant=${this.vowelIndex.consonant.length}`);
        console.log(`⭐ Popularity index: very_popular=${this.popularityIndex.very_popular.length}, popular=${this.popularityIndex.popular.length}, uncommon=${this.popularityIndex.uncommon.length}`);
        console.log(`🗺️ State indexes: ${Object.keys(this.stateGenderIndex).length} states loaded`);
    }

    sortIndexes() {
        // Sort all indexes by popularity (totalCount) for better results
        Object.keys(this.genderIndex).forEach(gender => {
            this.genderIndex[gender].sort((a, b) => b.totalCount - a.totalCount);
        });
        
        Object.keys(this.lengthIndex).forEach(length => {
            this.lengthIndex[length].sort((a, b) => b.totalCount - a.totalCount);
        });
        
        Object.keys(this.vowelIndex).forEach(vowel => {
            this.vowelIndex[vowel].sort((a, b) => b.totalCount - a.totalCount);
        });
        
        Object.keys(this.popularityIndex).forEach(popularity => {
            this.popularityIndex[popularity].sort((a, b) => b.totalCount - a.totalCount);
        });
        
        // Sort combined indexes
        Object.keys(this.genderLengthIndex).forEach(gender => {
            Object.keys(this.genderLengthIndex[gender]).forEach(length => {
                this.genderLengthIndex[gender][length].sort((a, b) => b.totalCount - a.totalCount);
            });
        });
        
        Object.keys(this.genderVowelIndex).forEach(gender => {
            Object.keys(this.genderVowelIndex[gender]).forEach(vowel => {
                this.genderVowelIndex[gender][vowel].sort((a, b) => b.totalCount - a.totalCount);
            });
        });
        
        Object.keys(this.genderPopularityIndex).forEach(gender => {
            Object.keys(this.genderPopularityIndex[gender]).forEach(popularity => {
                this.genderPopularityIndex[gender][popularity].sort((a, b) => b.totalCount - a.totalCount);
            });
        });
        
        // Sort state indexes
        Object.keys(this.stateGenderIndex).forEach(state => {
            Object.keys(this.stateGenderIndex[state]).forEach(gender => {
                this.stateGenderIndex[state][gender].sort((a, b) => (b.states[state] || 0) - (a.states[state] || 0));
            });
        });
        
        Object.keys(this.stateGenderLengthIndex).forEach(state => {
            Object.keys(this.stateGenderLengthIndex[state]).forEach(gender => {
                Object.keys(this.stateGenderLengthIndex[state][gender]).forEach(length => {
                    this.stateGenderLengthIndex[state][gender][length].sort((a, b) => (b.states[state] || 0) - (a.states[state] || 0));
                });
            });
        });
    }

    // Efficient lookup methods using indexes
    getNamesByGenderAndLength(gender, length, limit = null) {
        console.log(`🔍 Fast lookup: gender=${gender}, length=${length}`);
        
        if (this.genderLengthIndex[gender] && this.genderLengthIndex[gender][length]) {
            const names = this.genderLengthIndex[gender][length];
            console.log(`✅ Found ${names.length} names matching gender=${gender}, length=${length}`);
            return limit ? names.slice(0, limit) : names;
        }
        
        console.log(`❌ No names found for gender=${gender}, length=${length}`);
        return [];
    }

    getNamesByGender(gender, limit = null) {
        console.log(`🔍 Fast lookup: gender=${gender}`);
        
        if (this.genderIndex[gender]) {
            const names = this.genderIndex[gender];
            console.log(`✅ Found ${names.length} names for gender=${gender}`);
            return limit ? names.slice(0, limit) : names;
        }
        
        console.log(`❌ No names found for gender=${gender}`);
        return [];
    }

    getNamesByLength(length, limit = null) {
        console.log(`🔍 Fast lookup: length=${length}`);
        
        if (this.lengthIndex[length]) {
            const names = this.lengthIndex[length];
            console.log(`✅ Found ${names.length} names for length=${length}`);
            return limit ? names.slice(0, limit) : names;
        }
        
        console.log(`❌ No names found for length=${length}`);
        return [];
    }

    // Comprehensive lookup with all criteria
    getNamesByAllCriteria(state, gender, length, vowel, popularity, limit = null) {
        console.log(`🎯 Comprehensive lookup: state=${state}, gender=${gender}, length=${length}, vowel=${vowel}, popularity=${popularity}`);
        
        let candidates = [];
        
        // Start with state-specific data if available
        if (state && this.stateGenderLengthIndex[state] && this.stateGenderLengthIndex[state][gender] && this.stateGenderLengthIndex[state][gender][length]) {
            candidates = this.stateGenderLengthIndex[state][gender][length];
            console.log(`🗺️ Found ${candidates.length} state-specific candidates for ${state}`);
        } else if (gender && length) {
            // Fallback to national data
            candidates = this.genderLengthIndex[gender][length] || [];
            console.log(`🌍 Found ${candidates.length} national candidates`);
        } else if (gender) {
            candidates = this.genderIndex[gender] || [];
            console.log(`👤 Found ${candidates.length} gender candidates`);
        } else {
            console.log(`❌ No valid criteria provided`);
            return [];
        }
        
        // Apply additional filters
        if (vowel) {
            const vowelCandidates = this.genderVowelIndex[gender] && this.genderVowelIndex[gender][vowel] ? this.genderVowelIndex[gender][vowel] : [];
            candidates = candidates.filter(name => vowelCandidates.includes(name));
            console.log(`🔤 After vowel filter: ${candidates.length} candidates`);
        }
        
        if (popularity) {
            const popularityCandidates = this.genderPopularityIndex[gender] && this.genderPopularityIndex[gender][popularity] ? this.genderPopularityIndex[gender][popularity] : [];
            candidates = candidates.filter(name => popularityCandidates.includes(name));
            console.log(`⭐ After popularity filter: ${candidates.length} candidates`);
        }
        
        console.log(`✅ Final result: ${candidates.length} candidates`);
        return limit ? candidates.slice(0, limit) : candidates;
    }

    // State-specific lookups
    getNamesByStateAndGender(state, gender, limit = null) {
        console.log(`🗺️ State lookup: state=${state}, gender=${gender}`);
        
        if (this.stateGenderIndex[state] && this.stateGenderIndex[state][gender]) {
            const names = this.stateGenderIndex[state][gender];
            console.log(`✅ Found ${names.length} names for ${state} ${gender}`);
            return limit ? names.slice(0, limit) : names;
        }
        
        console.log(`❌ No names found for ${state} ${gender}`);
        return [];
    }

    getNamesByStateGenderAndLength(state, gender, length, limit = null) {
        console.log(`🗺️ State+Gender+Length lookup: state=${state}, gender=${gender}, length=${length}`);
        
        if (this.stateGenderLengthIndex[state] && 
            this.stateGenderLengthIndex[state][gender] && 
            this.stateGenderLengthIndex[state][gender][length]) {
            const names = this.stateGenderLengthIndex[state][gender][length];
            console.log(`✅ Found ${names.length} names for ${state} ${gender} ${length}`);
            return limit ? names.slice(0, limit) : names;
        }
        
        console.log(`❌ No names found for ${state} ${gender} ${length}`);
        return [];
    }

    getFallbackEnhancedNames() {
        const fallbackNames = [
            { name: 'Olivia', gender: 'F', totalCount: 1000 },
            { name: 'Emma', gender: 'F', totalCount: 950 },
            { name: 'Charlotte', gender: 'F', totalCount: 900 },
            { name: 'Amelia', gender: 'F', totalCount: 850 },
            { name: 'Sophia', gender: 'F', totalCount: 800 },
            { name: 'Liam', gender: 'M', totalCount: 1000 },
            { name: 'Noah', gender: 'M', totalCount: 950 },
            { name: 'Oliver', gender: 'M', totalCount: 900 },
            { name: 'James', gender: 'M', totalCount: 850 },
            { name: 'Elijah', gender: 'M', totalCount: 800 }
        ];
        
        const enhancedFallback = {};
        fallbackNames.forEach(nameInfo => {
            const key = `${nameInfo.name.toLowerCase()}_${nameInfo.gender}`;
            enhancedFallback[key] = this.createEnhancedNameEntry(
                nameInfo.name, 
                nameInfo.gender, 
                nameInfo.totalCount, 
                '2024'
            );
        });
        
        return enhancedFallback;
    }

    // Get names by religious association
    getNamesByReligion(religion, gender = null) {
        const names = [];
        
        Object.values(this.nameData).forEach(nameInfo => {
            if (nameInfo.religions.includes(religion)) {
                if (!gender || nameInfo.gender === gender) {
                    names.push(nameInfo);
                }
            }
        });
        
        return names.sort((a, b) => b.totalCount - a.totalCount);
    }

    // Get names by cultural origin
    getNamesByCulturalOrigin(origin, gender = null) {
        const names = [];
        
        Object.values(this.nameData).forEach(nameInfo => {
            if (nameInfo.culturalOrigins.includes(origin)) {
                if (!gender || nameInfo.gender === gender) {
                    names.push(nameInfo);
                }
            }
        });
        
        return names.sort((a, b) => b.totalCount - a.totalCount);
    }

    // Get cross-religious names
    getCrossReligiousNames(gender = null) {
        const names = [];
        
        Object.values(this.nameData).forEach(nameInfo => {
            if (nameInfo.crossReligious) {
                if (!gender || nameInfo.gender === gender) {
                    names.push(nameInfo);
                }
            }
        });
        
        return names.sort((a, b) => b.totalCount - a.totalCount);
    }

    // Get names suitable for non-binary users (appear with similar frequencies in both genders)
    getNonBinaryNames() {
        const nameFrequencyMap = {};
        const nonBinaryNames = [];
        
        // First, collect all names and their gender-specific counts
        Object.values(this.nameData).forEach(nameInfo => {
            const name = nameInfo.name.toLowerCase();
            if (!nameFrequencyMap[name]) {
                nameFrequencyMap[name] = { name: nameInfo.name, male: 0, female: 0, total: 0 };
            }
            
            if (nameInfo.gender === 'M') {
                nameFrequencyMap[name].male = nameInfo.totalCount;
            } else if (nameInfo.gender === 'F') {
                nameFrequencyMap[name].female = nameInfo.totalCount;
            }
            
            nameFrequencyMap[name].total += nameInfo.totalCount;
        });
        
        // Find names that appear in both genders with similar frequencies
        Object.values(nameFrequencyMap).forEach(nameData => {
            if (nameData.male > 0 && nameData.female > 0) {
                // Calculate the ratio between male and female usage
                const ratio = Math.min(nameData.male, nameData.female) / Math.max(nameData.male, nameData.female);
                
                // Only include names where the ratio is at least 0.1 (10% similarity)
                // and the name has been used at least 100 times total
                if (ratio >= 0.1 && nameData.total >= 100) {
                    // Create a combined entry for non-binary use
                    const combinedEntry = {
                        name: nameData.name,
                        gender: 'NB',
                        totalCount: nameData.total,
                        maleCount: nameData.male,
                        femaleCount: nameData.female,
                        genderBalance: ratio, // Higher is more balanced
                        
                        // Copy other properties from the more popular version
                        ...this.getMostPopularVersion(nameData.name)
                    };
                    
                    nonBinaryNames.push(combinedEntry);
                }
            }
        });
        
        // Sort by total count and gender balance
        return nonBinaryNames.sort((a, b) => {
            // First by total popularity
            if (b.totalCount !== a.totalCount) {
                return b.totalCount - a.totalCount;
            }
            // Then by gender balance (more balanced names first)
            return b.genderBalance - a.genderBalance;
        });
    }
    
    // Helper method to get the most popular version of a name for copying properties
    getMostPopularVersion(name) {
        const maleVersion = this.nameData[`${name.toLowerCase()}_M`];
        const femaleVersion = this.nameData[`${name.toLowerCase()}_F`];
        
        if (maleVersion && femaleVersion) {
            return maleVersion.totalCount >= femaleVersion.totalCount ? maleVersion : femaleVersion;
        } else if (maleVersion) {
            return maleVersion;
        } else if (femaleVersion) {
            return femaleVersion;
        }
        
        return null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedNameDatabase;
}
