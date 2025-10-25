// Enhanced Name Database with Religious and Cultural Associations
// This database expands the basic name data with religious, cultural, and origin information

class EnhancedNameDatabase {
    constructor() {
        this.nameData = {};
        this.religiousAssociations = {};
        this.culturalOrigins = {};
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

    // Load and enhance name data from files
    async loadEnhancedNameData() {
        try {
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
                            allNames[key] = this.createEnhancedNameEntry(name, gender, 0, year);
                        }
                        
                        allNames[key].totalCount += parseInt(count);
                        allNames[key].years.push({ year, count: parseInt(count) });
                    }
                });
            }
            
            this.nameData = allNames;
            return allNames;
        } catch (error) {
            console.error('Error loading enhanced name data:', error);
            return this.getFallbackEnhancedNames();
        }
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
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedNameDatabase;
}
