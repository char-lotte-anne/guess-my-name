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
            'long': [], // 7-9 letters
            'extra_long': [] // 10+ letters
        };
        this.genderLengthIndex = {
            'M': { 'short': [], 'medium': [], 'long': [], 'extra_long': [] },
            'F': { 'short': [], 'medium': [], 'long': [], 'extra_long': [] },
            'NB': { 'short': [], 'medium': [], 'long': [], 'extra_long': [] }
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
            // Middle Eastern & North African
            'arabic': ['Aaliyah', 'Aisha', 'Amina', 'Fatima', 'Khadija', 'Maryam', 'Zainab', 'Ahmad', 'Ali', 'Amir', 'Omar', 'Hassan', 'Ibrahim'],
            'hebrew': ['Aaron', 'Abraham', 'Adam', 'Benjamin', 'Daniel', 'David', 'Elijah', 'Ethan', 'Gabriel', 'Isaac', 'Jacob', 'Noah', 'Sarah', 'Rachel', 'Leah'],
            'persian': ['Omid', 'Reza', 'Amir', 'Dariush', 'Cyrus', 'Parisa', 'Leila', 'Nazanin', 'Shirin', 'Abbas', 'Behnam', 'Farhad', 'Hamid', 'Hossein', 'Mehdi', 'Azadeh', 'Farah', 'Maryam', 'Mahsa', 'Niloufar', 'Sepideh', 'Sara'],
            
            // South Asian
            'sanskrit': ['Arjun', 'Krishna', 'Rama', 'Shiva', 'Vishnu', 'Ganesh', 'Hanuman', 'Aarav', 'Aryan', 'Dhruv', 'Ravi', 'Priya', 'Ananya', 'Saanvi', 'Aditi', 'Raj', 'Amit', 'Deepak', 'Vivek', 'Rahul', 'Rohan', 'Anjali', 'Neha', 'Pooja', 'Shreya', 'Kavya', 'Ishaan', 'Vihaan', 'Aanya', 'Navya', 'Diya'],
            'pakistani': ['Ali', 'Hassan', 'Usman', 'Zain', 'Ahmed', 'Abdullah', 'Muhammad', 'Hamza', 'Omar', 'Bilal', 'Ayesha', 'Fatima', 'Maryam', 'Zainab', 'Khadija', 'Aisha', 'Amina', 'Hira', 'Mahnoor', 'Sana'],
            'bangladeshi': ['Rahim', 'Karim', 'Jamil', 'Arif', 'Taslima', 'Nusrat', 'Anika', 'Habib', 'Rafiq', 'Rashid', 'Farhana', 'Fatema', 'Nasrin', 'Salma', 'Yasmin'],
            
            // East Asian
            'chinese': ['Wei', 'Mei', 'Ling', 'Ming', 'Jing', 'Yang', 'Xin', 'Yun', 'Hong', 'Jun', 'Lei', 'Yan', 'Yu', 'Tao', 'Chen', 'Li', 'Jie', 'Qing', 'Hao', 'Bo', 'Feng', 'Kai', 'Rui', 'Xinyi', 'Yuxuan', 'Zihan'],
            'japanese': ['Hiroshi', 'Takashi', 'Akira', 'Kenji', 'Yuki', 'Haruto', 'Ren', 'Sakura', 'Yui', 'Aoi', 'Hina', 'Nozomi', 'Himari', 'Yuto', 'Hayato', 'Ayaka', 'Emi', 'Kaori', 'Haruka', 'Mai', 'Hinata', 'Sora', 'Kaito'],
            'korean': ['Jihoon', 'Minjun', 'Seojun', 'Hayoon', 'Seoyeon', 'Jiwoo', 'Sumin', 'Yuna', 'Minho', 'Doyoon', 'Minji', 'Eunji', 'Jiyeon', 'Chaeyoung', 'Nayeon', 'Taehyung', 'Jungkook', 'Jimin'],
            
            // Southeast Asian
            'vietnamese': ['Minh', 'Hieu', 'Quang', 'Tuan', 'Hung', 'Nam', 'Anh', 'Linh', 'Mai', 'Thu', 'Lan', 'Thao', 'Ha', 'Huong', 'Phuong', 'Thanh', 'Duc', 'Hoang', 'Long', 'Vinh', 'My', 'Quynh', 'Trang'],
            'filipino': ['Jose', 'Maria', 'Bayani', 'Makisig', 'Luningning', 'Ligaya', 'Nathaniel', 'Gabriel', 'Althea', 'Juan', 'Francisco', 'Carmen', 'Luz', 'Esperanza', 'Gloria', 'Joshua', 'Christian', 'Angelo', 'Andrea', 'Sophia'],
            'thai': ['Somchai', 'Chai', 'Anurak', 'Ploy', 'Aranya', 'Chalita', 'Somboon', 'Suchart', 'Anong', 'Benjawan', 'Malee', 'Nittaya', 'Chanathip', 'Supachai'],
            'indonesian': ['Budi', 'Agus', 'Joko', 'Dewi', 'Siti', 'Putri', 'Ahmad', 'Bambang', 'Eko', 'Hendra', 'Indra', 'Ani', 'Ika', 'Maya', 'Rina', 'Ayu', 'Fitri', 'Angga', 'Bayu'],
            
            // European
            'greek': ['Alexander', 'Andreas', 'Dimitri', 'Elias', 'Gabriel', 'Jason', 'Nicholas', 'Theodore', 'Zachary', 'Athena', 'Chloe', 'Zoe'],
            'latin': ['Augustus', 'Caesar', 'Marcus', 'Maximus', 'Roman', 'Victor', 'Victoria', 'Felix', 'Lucius', 'Quintus'],
            'germanic': ['Bruno', 'Conrad', 'Frederick', 'Gunther', 'Hans', 'Klaus', 'Otto', 'Wolfgang'],
            'celtic': ['Aidan', 'Brendan', 'Connor', 'Declan', 'Finn', 'Liam', 'Owen', 'Patrick', 'Sean', 'Tristan'],
            'slavic': ['Boris', 'Dmitri', 'Igor', 'Mikhail', 'Nikolai', 'Pavel', 'Sergei', 'Vladimir', 'Yuri', 'Anastasia', 'Katerina', 'Natasha'],
            'norse': ['Erik', 'Bjorn', 'Gunnar', 'Leif', 'Magnus', 'Olaf', 'Ragnar', 'Sven', 'Thor', 'Ulf'],
            
            // Other
            'turkish': ['Emre', 'Mehmet', 'Mustafa', 'Yusuf', 'Aylin', 'Zeynep', 'Elif', 'Defne', 'Ali', 'Can', 'Cem', 'Deniz', 'Hakan', 'Murat', 'Ayse', 'Ebru', 'Fatma', 'Selin', 'Ada', 'Burcu', 'Merve'],
            
            // African (by country/culture)
            'nigerian': ['Adebola', 'Babatunde', 'Olufemi', 'Oluwaseun', 'Temitope', 'Ayodele', 'Adebayo', 'Funmilayo', 'Yetunde', 'Folake', 'Chinedu', 'Chinua', 'Chukwuemeka', 'Chioma', 'Ngozi', 'Emeka', 'Obinna', 'Uchenna', 'Chiamaka', 'Ifeoma', 'Amaka', 'Nneka', 'Abdullahi', 'Abubakar', 'Ibrahim', 'Aisha', 'Hauwa', 'Khadija'],
            'ghanaian': ['Kwame', 'Kofi', 'Kwabena', 'Kwaku', 'Yaw', 'Kwesi', 'Kodwo', 'Ama', 'Afua', 'Abena', 'Akua', 'Aba', 'Esi', 'Adwoa', 'Koffi', 'Yao', 'Akosua', 'Adjoua', 'Akissi'],
            'ethiopian': ['Amanuel', 'Dawit', 'Tesfaye', 'Solomon', 'Yohannes', 'Kebede', 'Haile', 'Selam', 'Genet', 'Hana', 'Aster', 'Meron', 'Rahel', 'Ruth', 'Haben', 'Abebe', 'Alemayehu', 'Desta', 'Almaz', 'Eleni', 'Marta', 'Tsion'],
            'kenyan': ['Juma', 'Mwangi', 'Omari', 'Baraka', 'Hamisi', 'Kamau', 'Kariuki', 'Njoroge', 'Aisha', 'Nia', 'Zuri', 'Amani', 'Furaha', 'Wambui', 'Wanjiku', 'Njeri', 'Akinyi', 'Atieno', 'Onyango', 'Ochieng', 'Makena', 'Mumbi', 'Wangari'],
            'southafrican': ['Thabo', 'Sipho', 'Mandla', 'Bongani', 'Sifiso', 'Sibusiso', 'Thulani', 'Nomsa', 'Zanele', 'Precious', 'Thandiwe', 'Ntombi', 'Noluthando', 'Lungile', 'Mpho', 'Thato', 'Tumelo', 'Karabo', 'Lerato', 'Andile', 'Ayanda', 'Siyabonga', 'Themba'],
            'egyptian': ['Ahmed', 'Mohamed', 'Youssef', 'Omar', 'Ali', 'Mahmoud', 'Hassan', 'Fatima', 'Amina', 'Layla', 'Nour', 'Yasmin', 'Mariam', 'Salma', 'Khaled', 'Karim', 'Dina', 'Sara', 'Rania'],
            'zimbabwean': ['Tendai', 'Tafadzwa', 'Kudakwashe', 'Tinashe', 'Takudzwa', 'Tatenda', 'Rudo', 'Tariro', 'Vimbai', 'Chipo', 'Nyasha', 'Rufaro', 'Blessing', 'Lovermore', 'Patience', 'Prosper', 'Trust'],
            'swahili': ['Juma', 'Salim', 'Rashidi', 'Hamisi', 'Seif', 'Bakari', 'Asha', 'Amani', 'Neema', 'Rehema', 'Zuhura', 'Subira', 'Zawadi', 'Faraja', 'Saada'],
            'senegalese': ['Mamadou', 'Cheikh', 'Moussa', 'Abdoulaye', 'Ibrahima', 'Ousmane', 'Amadou', 'Fatou', 'Awa', 'Ami', 'Maimouna', 'Khady', 'Aissatou'],
            'congolese': ['Jean', 'Joseph', 'Pierre', 'Paul', 'Jacques', 'Patrice', 'Marie', 'Anne', 'Christine', 'Grace', 'Sylvie', 'Celestine', 'Clementine'],
            'moroccan': ['Youssef', 'Mehdi', 'Amine', 'Adam', 'Hamza', 'Ayoub', 'Khadija', 'Samira', 'Nadia', 'Fatima', 'Amina', 'Yasmine', 'Sarah', 'Mohammed', 'Karim', 'Hassan'],
            
            // Oceania
            'maori': ['Tane', 'Wiremu', 'Rangi', 'Hemi', 'Manaia', 'Aroha', 'Moana', 'Anahera', 'Kiri', 'Marama', 'Kahu', 'Matiu', 'Rewi', 'Tamati', 'Whetu', 'Awhina', 'Hine', 'Mihi', 'Ngaio', 'Pania'],
            'pacific': ['Mika', 'Tupu', 'Fetu', 'Sione', 'Lafaele', 'Tasi', 'Lani', 'Leilani', 'Sina', 'Talia', 'Moana', 'Tui', 'Latu', 'Mele', 'Ofa', 'Sela', 'Jone', 'Peni', 'Sakiusa', 'Viliame', 'Adi', 'Mere', 'Litia', 'Sera'],
            
            // Latin America
            'mexican': ['Jose', 'Carlos', 'Miguel', 'Juan', 'Luis', 'Antonio', 'Francisco', 'Jesus', 'Diego', 'Alejandro', 'Maria', 'Guadalupe', 'Carmen', 'Rosa', 'Ana', 'Isabel', 'Fernanda', 'Sofia', 'Valentina', 'Regina', 'Victoria', 'Isabella', 'Camila', 'Ximena'],
            'brazilian': ['Joao', 'Gabriel', 'Lucas', 'Miguel', 'Pedro', 'Arthur', 'Bernardo', 'Matheus', 'Rafael', 'Heitor', 'Ana', 'Maria', 'Beatriz', 'Camila', 'Julia', 'Leticia', 'Helena', 'Alice', 'Laura', 'Manuela', 'Valentina', 'Sophia', 'Isabella'],
            'argentine': ['Mateo', 'Santiago', 'Benjamin', 'Thiago', 'Lucas', 'Bautista', 'Tomas', 'Francisco', 'Nicolas', 'Joaquin', 'Sofia', 'Emma', 'Martina', 'Isabella', 'Valentina', 'Lucia', 'Emilia', 'Catalina', 'Mia', 'Julieta', 'Agustin', 'Ignacio'],
            'colombian': ['Santiago', 'Sebastian', 'Samuel', 'Nicolas', 'Daniel', 'Mateo', 'Alejandro', 'Gabriel', 'Andres', 'David', 'Valentina', 'Mariana', 'Isabella', 'Gabriela', 'Daniela', 'Sara', 'Sofia', 'Luciana', 'Camila', 'Maria', 'Juan', 'Carlos', 'Laura'],
            'chilean': ['Mateo', 'Agustin', 'Santiago', 'Tomas', 'Lucas', 'Benjamin', 'Joaquin', 'Martin', 'Nicolas', 'Matias', 'Sofia', 'Emilia', 'Isabella', 'Florencia', 'Valentina', 'Martina', 'Antonia', 'Maite', 'Josefa', 'Agustina', 'Vicente', 'Felipe', 'Francisca'],
            'peruvian': ['Mateo', 'Santiago', 'Sebastian', 'Nicolas', 'Alejandro', 'Diego', 'Daniel', 'Gabriel', 'Adrian', 'Joaquin', 'Valentina', 'Isabella', 'Camila', 'Luciana', 'Mariana', 'Gabriela', 'Daniela', 'Sara', 'Sofia', 'Mia', 'Jose', 'Luis', 'Lucia', 'Carmen']
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
            crossReligious: this.getCrossReligiousNames(name, gender),
            
            // Language origin (english, spanish, hebrew, etc.)
            languageOrigin: this.getLanguageOrigin(name, gender),
            
            // Traditional vs modern significance
            traditionalSignificance: this.getTraditionalSignificance(name, count, year),
            
            // Socioeconomic associations
            socioeconomicLevel: this.getSocioeconomicLevel(name, count),
            
            // Perceived traits (how people perceive the name)
            perceivedTraits: this.getPerceivedTraits(name, gender, count),
            
            // Desired traits (what impression the name gives)
            desiredTraits: this.getDesiredTraits(name, gender),
            
            // Geographic preferences (where name is popular)
            geographicPreference: this.getGeographicPreference(name, count),
            
            // Name meaning associations
            nameMeaning: this.getNameMeaningAssociations(name),
            
            // Typical reactions people have to the name
            typicalReactions: this.getTypicalReactions(name, count)
        };
    }

    getReligiousAssociations(name, gender) {
        const religions = [];
        const nameLower = name.toLowerCase();
        
        if (!gender) return religions;
        
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

    getNameMeaningAssociations(name) {
        const meanings = [];
        const nameLower = name.toLowerCase();
        
        // Nature-themed names (expanded with international names)
        const natureNames = {
            water: ['marina', 'maya', 'morgan', 'river', 'brook', 'ocean', 'lake', 'cascade', 'rain', 'storm', 'misty',
                    'mariana', 'adriana', 'maris', 'moses', 'murray', 'nerida', 'nerissa', 'talise',
                    'kaiyo', 'mizu', 'agua', 'mare', 'moana', 'talia', 'nina'],
            fire: ['blaze', 'ember', 'phoenix', 'ignatius', 'seraphina', 'aiden', 'fiammetta',
                   'keegan', 'flint', 'brenna', 'aidan', 'edan', 'enya', 'nuri', 'azar', 'fintan',
                   'seraph', 'pyrrhus', 'agni', 'hinata', 'homura'],
            earth: ['terra', 'gaia', 'adam', 'clay', 'petra', 'stone', 'rocky',
                    'geo', 'tierra', 'arwyn', 'ayla', 'demeter', 'persephone', 'peregrine',
                    'terra', 'terryn', 'dustin', 'mason'],
            nature: ['ivy', 'rose', 'lily', 'daisy', 'violet', 'jasmine', 'sage', 'fern', 'willow', 'oak', 'ash', 'birch', 'hazel', 'laurel', 'olive', 'poppy', 'primrose',
                     'clover', 'iris', 'azalea', 'magnolia', 'dahlia', 'flora', 'heather', 'holly', 'lavender', 'marigold',
                     'amaryllis', 'camellia', 'gardenia', 'hyacinth', 'lilac', 'peony', 'zinnia',
                     'sakura', 'yuki', 'hana', 'mei', 'ren', 'lian', 'hua', 'bamboo', 'cedar', 'elm', 'juniper', 'pine'],
            moon: ['luna', 'selene', 'diana', 'artemis', 'cynthia', 'phoebe',
                   'chandra', 'qamar', 'tsuki', 'mitsuki', 'aylin', 'badru', 'kamari',
                   'neoma', 'mahina', 'callisto', 'rhea', 'portia'],
            sun: ['helios', 'sol', 'sunny', 'apollo', 'cyrus', 'samson', 'eliana', 'elena',
                  'soleil', 'sol', 'sunday', 'aurora', 'dawn', 'eos', 'oriana', 'roxana',
                  'surya', 'ravi', 'haru', 'hina', 'akira', 'hikari', 'noor', 'zohar'],
            light: ['lucia', 'lucian', 'lucy', 'claire', 'clara', 'elena', 'eleanor', 'helen', 'phoebe', 'zohar',
                    'luke', 'lucas', 'luz', 'lux', 'lucinda', 'lucius', 'elaine', 'lucille',
                    'chiara', 'kira', 'nora', 'noor', 'leora', 'liora', 'aurora', 'ayla', 'ziya',
                    'hikari', 'akari', 'mei', 'guang', 'nur', 'priya']
        };
        
        // Abstract concept names (expanded with international names)
        const conceptNames = {
            strength: ['andrew', 'ethan', 'gabriel', 'valentina', 'bridget', 'matilda', 'arnold', 'charles', 'brian', 'bernadette',
                       'alexander', 'maximus', 'magnus', 'victor', 'valerie', 'brianna', 'kendra', 'malin',
                       'arjun', 'aziz', 'imara', 'jabari', 'kendi', 'malik', 'ondine', 'takeo', 'yuki'],
            wisdom: ['sophia', 'sofia', 'prudence', 'sage', 'minerva', 'athena', 'solomon', 'cassandra',
                     'conroy', 'reginald', 'raymond', 'alfred', 'albert', 'alden', 'cato', 'conrad',
                     'sonia', 'sonya', 'faye', 'fabian', 'hakim', 'sapientia', 'akira', 'satoshi', 'tomo'],
            peace: ['frederick', 'frida', 'irene', 'salome', 'shalom', 'paz', 'axel', 'oliver',
                    'pax', 'olive', 'olivia', 'paloma', 'columba', 'dove', 'concord', 'harmony',
                    'salaam', 'mir', 'kazuo', 'yasuko', 'heiwa', 'aman', 'shanti', 'sulh'],
            music: ['melody', 'harmony', 'lyric', 'cadence', 'aria', 'calliope', 'cecilia', 'carmen',
                    'allegra', 'canto', 'carol', 'chant', 'lyra', 'orpheus', 'symphony', 'sonata',
                    'amadeus', 'beethoven', 'mozart', 'chopin', 'harper', 'piper', 'reed', 'viola'],
            creative: ['art', 'dante', 'vincent', 'leonardo', 'raphael', 'michelangelo',
                       'pablo', 'claude', 'henri', 'georgia', 'frida', 'jasper', 'saffron',
                       'poet', 'poetry', 'story', 'tale', 'muse', 'calliope', 'clio', 'thalia']
        };
        
        // Royal/noble names (expanded with international names)
        const royalNames = ['alexander', 'alexandra', 'regina', 'rex', 'roy', 'sarah', 'duke', 'earl', 'prince', 'princess', 'king', 'queen',
                            'baron', 'marquis', 'caesar', 'augustus', 'augusta', 'basil', 'cyrus', 'darius', 'dimitri',
                            'frederick', 'louis', 'ludwig', 'leopold', 'constantine', 'victoria', 'elizabeth', 'catherine',
                            'malik', 'malika', 'raina', 'reina', 'raja', 'rani', 'shah', 'sultana',
                            'pharaoh', 'cleopatra', 'ramses', 'nefertiti', 'empress', 'emperor', 'sovereign'];
        
        // Life/Living names
        const lifeNames = ['zoe', 'zoey', 'eve', 'eva', 'evelyn', 'vivian', 'vivienne', 'vita', 'vito',
                           'hayat', 'chaya', 'chaim', 'keegan', 'vidal', 'jiva', 'anima'];
        
        // Love/Beloved names
        const loveNames = ['david', 'carys', 'cara', 'carina', 'amy', 'amity', 'amanda', 'esme',
                           'habiba', 'aziza', 'yarah', 'priya', 'kama', 'philomena', 'erasmus',
                           'amias', 'valentine', 'venus', 'aphrodite', 'aiko', 'suki', 'nara'];
        
        // Check each category
        for (const [meaning, names] of Object.entries(natureNames)) {
            if (names.includes(nameLower)) {
                meanings.push(meaning);
            }
        }
        
        for (const [meaning, names] of Object.entries(conceptNames)) {
            if (names.includes(nameLower)) {
                meanings.push(meaning);
            }
        }
        
        if (royalNames.includes(nameLower)) {
            meanings.push('nobility');
        }
        
        if (lifeNames.includes(nameLower)) {
            meanings.push('life');
        }
        
        if (loveNames.includes(nameLower)) {
            meanings.push('love');
        }
        
        // Add "sound" as a catch-all for names that sound pleasant but don't have strong meaning associations
        if (meanings.length === 0) {
            meanings.push('sound');
        }
        
        return meanings;
    }

    getTypicalReactions(name, count) {
        const reactions = [];
        const nameLower = name.toLowerCase();
        
        // Very popular names (loved, memorable)
        if (count > 10000) {
            reactions.push('loved', 'memorable');
        }
        
        // Unique/uncommon names (unique_reaction, spelling_questions)
        if (count < 100) {
            reactions.push('unique_reaction', 'spelling_questions');
        }
        
        // Traditional/classic names
        const traditionalNames = [
            'mary', 'john', 'william', 'elizabeth', 'james', 'margaret', 'robert', 'patricia',
            'charles', 'barbara', 'thomas', 'dorothy', 'richard', 'helen', 'george', 'betty',
            'donald', 'ruth', 'joseph', 'virginia', 'edward', 'mildred', 'frank', 'frances',
            'henry', 'alice', 'walter', 'ethel', 'arthur', 'marie', 'harold', 'anna',
            'catherine', 'katherine', 'jane', 'anne', 'michael', 'david', 'daniel'
        ];
        
        if (traditionalNames.includes(nameLower)) {
            reactions.push('traditional_reaction');
            // Names from before 1940s often viewed as old-fashioned
            if (['ethel', 'mildred', 'bertha', 'gertrude', 'edna', 'mabel', 'agnes', 'gladys',
                 'clarence', 'herbert', 'ernest', 'elmer', 'chester', 'harold', 'norman', 'earl'].includes(nameLower)) {
                reactions.push('old_fashioned');
            }
        }
        
        // Modern/trendy names
        const modernNames = [
            'aiden', 'jayden', 'brayden', 'kayden', 'zayden', 'jaxon', 'mason', 'liam',
            'noah', 'harper', 'avery', 'riley', 'skylar', 'nevaeh', 'aria', 'kinsley',
            'madison', 'addison', 'brooklyn', 'aubrey', 'maverick', 'axel', 'jace'
        ];
        
        if (modernNames.includes(nameLower)) {
            reactions.push('modern_reaction');
        }
        
        // Names that commonly get jokes/puns
        const jokeNames = ['dick', 'fanny', 'gaylord', 'gay', 'willie', 'peter', 'woody', 'randy'];
        if (jokeNames.includes(nameLower)) {
            reactions.push('jokes');
        }
        
        // Strong/powerful names
        const strongNames = [
            'alexander', 'maximus', 'victor', 'dominic', 'valentina', 'victoria',
            'gabriel', 'raphael', 'samson', 'thor', 'magnus', 'rex'
        ];
        
        if (strongNames.includes(nameLower)) {
            reactions.push('strong_reaction');
        }
        
        // Trustworthy names
        const trustworthyNames = [
            'trust', 'faith', 'hope', 'grace', 'verity', 'constance', 'prudence'
        ];
        
        if (trustworthyNames.includes(nameLower)) {
            reactions.push('trustworthy_reaction');
        }
        
        // Names with diverse cultural origins (people often ask about origin)
        const diverseCulturalNames = [
            // Slavic
            'vladimir', 'nikolai', 'dmitri', 'anastasia', 'svetlana',
            // Italian
            'giovanni', 'leonardo', 'francesca',
            // Spanish/Hispanic
            'alejandro', 'francisco', 'valentina',
            // Japanese
            'hiroshi', 'yuki', 'sakura', 'akira',
            // Chinese
            'wei', 'mei', 'ling', 'ming',
            // Korean
            'jihoon', 'seoyeon',
            // Vietnamese
            'minh', 'linh',
            // Indian
            'ravi', 'priya', 'aarav',
            // Arabic/Persian
            'omar', 'leila', 'fatima',
            // Greek
            'dimitri', 'athena'
        ];
        
        if (diverseCulturalNames.includes(nameLower)) {
            reactions.push('origin_questions');
        }
        
        // Neutral reactions for common but not outstanding names
        if (count > 1000 && count < 5000 && reactions.length === 0) {
            reactions.push('neutral');
        }
        
        // Default to neutral if no specific reactions
        if (reactions.length === 0) {
            reactions.push('neutral');
        }
        
        return reactions;
    }

    getLanguageOrigin(name, gender) {
        const nameLower = name.toLowerCase();
        
        // Hebrew/Jewish names
        const hebrewNames = ['aaron', 'abraham', 'adam', 'benjamin', 'daniel', 'david', 'elijah', 'ethan', 
            'gabriel', 'isaac', 'jacob', 'jonah', 'joseph', 'joshua', 'levi', 'michael', 'noah', 'samuel',
            'abigail', 'deborah', 'esther', 'hannah', 'judith', 'leah', 'miriam', 'naomi', 'rachel', 'rebecca', 'ruth', 'sarah',
            'ari', 'ariel', 'asher', 'avi', 'avraham', 'baruch', 'caleb', 'chaim', 'dov', 'efraim', 'eli', 'eliezer',
            'emanuel', 'ezra', 'gideon', 'haim', 'israel', 'jonathan', 'judah', 'kaleb', 'levi', 'malachi', 'menachem',
            'mordechai', 'moshe', 'nathan', 'nehemiah', 'reuben', 'saul', 'shlomo', 'simeon', 'simon', 'solomon', 'uri',
            'yakob', 'yosef', 'zachary', 'adina', 'aliza', 'ayala', 'batya', 'bracha', 'chana', 'chava', 'devorah',
            'dina', 'eliana', 'elisheva', 'havah', 'ilana', 'leora', 'malka', 'michal', 'noa', 'rina', 'rivka',
            'shira', 'tamar', 'tova', 'yael', 'yaffa', 'zahava', 'ziva'];
        if (hebrewNames.includes(nameLower)) return 'hebrew';
        
        // Spanish/Hispanic names
        const spanishNames = ['alejandro', 'antonio', 'carlos', 'diego', 'francisco', 'jose', 'juan', 'luis', 'miguel', 'pablo',
            'adrian', 'alberto', 'alfonso', 'alvaro', 'andres', 'angel', 'arturo', 'benjamin', 'daniel', 'david',
            'eduardo', 'emilio', 'enrique', 'ernesto', 'esteban', 'federico', 'felipe', 'fernando', 'gabriel',
            'gerardo', 'guillermo', 'gustavo', 'hector', 'hugo', 'ignacio', 'javier', 'jesus', 'joaquin', 'jorge',
            'leonardo', 'lorenzo', 'manuel', 'marcos', 'mario', 'martin', 'mateo', 'nicolas', 'oscar', 'patricio',
            'pedro', 'rafael', 'ramon', 'raul', 'ricardo', 'roberto', 'rodrigo', 'ruben', 'samuel', 'sancho',
            'santiago', 'sergio', 'tomas', 'vicente', 'ana', 'carmen', 'elena', 'isabella', 'lucia', 'maria',
            'rosa', 'sofia', 'valentina', 'adriana', 'alicia', 'amparo', 'andrea', 'angela', 'antonia', 'beatriz',
            'blanca', 'catalina', 'cecilia', 'clara', 'claudia', 'cristina', 'daniela', 'dolores', 'elisa', 'emilia',
            'emma', 'esperanza', 'esther', 'eva', 'fatima', 'francisca', 'gabriela', 'gloria', 'ines', 'irene',
            'isabel', 'josefa', 'juana', 'julia', 'laura', 'leonor', 'lola', 'lourdes', 'luisa', 'luz', 'magdalena',
            'mar', 'margarita', 'marina', 'marta', 'mercedes', 'monica', 'natalia', 'nuria', 'patricia', 'paula',
            'pilar', 'raquel', 'rocio', 'rosario', 'sandra', 'sara', 'silvia', 'susana', 'teresa', 'veronica', 'victoria'];
        if (spanishNames.includes(nameLower)) return 'spanish';
        
        // Italian names
        const italianNames = ['angelo', 'bruno', 'dante', 'giovanni', 'leonardo', 'lorenzo', 'marco', 'matteo',
            'alessandro', 'andrea', 'antonio', 'carlo', 'claudio', 'dario', 'davide', 'domenico', 'emanuele',
            'enrico', 'fabio', 'federico', 'filippo', 'francesco', 'gabriele', 'giacomo', 'gianluca', 'giorgio',
            'giuseppe', 'luca', 'luigi', 'manuel', 'marcello', 'mario', 'massimo', 'michele', 'nicola', 'paolo',
            'pietro', 'riccardo', 'roberto', 'salvatore', 'sergio', 'simone', 'stefano', 'tommaso', 'valentino',
            'vincenzo', 'vittorio', 'alessandra', 'bianca', 'elena', 'francesca', 'gianna', 'giulia', 'isabella',
            'lucia', 'sophia', 'adriana', 'alessia', 'alice', 'angela', 'anna', 'antonella', 'arianna', 'beatrice',
            'camilla', 'carla', 'carlotta', 'caterina', 'chiara', 'claudia', 'daniela', 'elena', 'eleonora',
            'elisa', 'elisabetta', 'federica', 'gabriella', 'giada', 'giovanna', 'greta', 'ilaria', 'irene',
            'laura', 'liliana', 'lisa', 'lorena', 'luciana', 'luisa', 'margherita', 'maria', 'marina', 'marta',
            'martina', 'michela', 'monica', 'nicole', 'paola', 'patrizia', 'raffaella', 'rebecca', 'roberta',
            'rosa', 'sara', 'serena', 'silvia', 'simona', 'sofia', 'stefania', 'valentina', 'valeria', 'veronica', 'vittoria'];
        if (italianNames.includes(nameLower)) return 'italian';
        
        // French names
        const frenchNames = ['andre', 'antoine', 'pierre', 'louis', 'jean', 'henri', 'alexandre', 'alain', 'arnaud',
            'baptiste', 'benoit', 'bernard', 'bruno', 'charles', 'christophe', 'claude', 'daniel', 'david',
            'denis', 'didier', 'dominique', 'emile', 'eric', 'etienne', 'fabien', 'florian', 'francois',
            'gabriel', 'gaston', 'georges', 'gerard', 'guillaume', 'hugo', 'jacques', 'jerome', 'joseph',
            'julien', 'laurent', 'leon', 'luc', 'marc', 'marcel', 'mathieu', 'maxime', 'michel', 'nicolas',
            'olivier', 'pascal', 'patrice', 'paul', 'philippe', 'quentin', 'raphael', 'remi', 'rene',
            'robert', 'sebastien', 'simon', 'stephane', 'thierry', 'thomas', 'victor', 'vincent', 'xavier', 'yves',
            'amelie', 'claire', 'juliette', 'marie', 'sophie', 'yvonne', 'adele', 'adrienne', 'agathe',
            'agnes', 'aimee', 'alice', 'aline', 'anais', 'andre', 'angelique', 'anne', 'annette', 'ariane',
            'aurelie', 'beatrice', 'brigitte', 'camille', 'caroline', 'catherine', 'cecile', 'celine', 'chantal',
            'charlotte', 'chloe', 'christine', 'claire', 'clemence', 'colette', 'corinne', 'danielle', 'delphine',
            'denise', 'diane', 'dominique', 'eleonore', 'elise', 'eloise', 'emilie', 'emmanuelle', 'estelle',
            'florence', 'francoise', 'genevieve', 'helene', 'henriette', 'isabelle', 'jacqueline', 'jeanne',
            'josephine', 'julie', 'laetitia', 'laure', 'laurence', 'lea', 'leonie', 'louise', 'lucille',
            'lucie', 'madeleine', 'manon', 'marguerite', 'marianne', 'marine', 'martine', 'mathilde', 'melanie',
            'michele', 'monique', 'nadine', 'nathalie', 'nicole', 'odette', 'pascale', 'paulette', 'pauline',
            'sandrine', 'simone', 'solange', 'stephanie', 'suzanne', 'sylvie', 'therese', 'valerie', 'veronique', 'virginie'];
        if (frenchNames.includes(nameLower)) return 'french';
        
        // Arabic names
        const arabicNames = ['ahmed', 'ali', 'hassan', 'ibrahim', 'khalid', 'mohammed', 'omar', 'rashid',
            'aisha', 'fatima', 'leila', 'nadia', 'yasmin', 'zara', 'abdullah', 'abdulrahman', 'abdul', 'adel',
            'adnan', 'ahmad', 'akram', 'amin', 'anwar', 'asad', 'aziz', 'bilal', 'faisal', 'farid', 'fawaz',
            'hamid', 'hani', 'hakim', 'hussein', 'jamal', 'kamal', 'karim', 'kareem', 'mahdi', 'majid', 'malik',
            'mansour', 'marwan', 'mustafa', 'nabil', 'nadir', 'nasir', 'omar', 'qasim', 'rami', 'rashad',
            'saad', 'sabir', 'said', 'salah', 'saleh', 'salim', 'sami', 'tariq', 'walid', 'wassim', 'yusuf', 'zaki',
            'aaliyah', 'abeer', 'adila', 'afaf', 'amal', 'amani', 'amina', 'amira', 'aya', 'ayat', 'aziza',
            'basma', 'bushra', 'dalia', 'dina', 'farah', 'farida', 'fatin', 'habiba', 'hala', 'hanan', 'hiba',
            'iman', 'inas', 'inaya', 'jameela', 'jamila', 'karima', 'khadija', 'laila', 'lamia', 'latifa',
            'layla', 'lina', 'lubna', 'maha', 'malak', 'mariam', 'maryam', 'mona', 'nada', 'nadine', 'naima',
            'najwa', 'noor', 'noura', 'raja', 'rana', 'rania', 'rasha', 'reem', 'sabah', 'safa', 'sahar',
            'salma', 'samira', 'sana', 'sanaa', 'sara', 'sarah', 'shadha', 'suhair', 'sumaya', 'wafa', 'yasmin', 'zahra', 'zaynab'];
        if (arabicNames.includes(nameLower)) return 'arabic';
        
        // Irish names
        const irishNames = ['aiden', 'brendan', 'connor', 'declan', 'finn', 'liam', 'patrick', 'sean',
            'aisling', 'ciara', 'maeve', 'niamh', 'siobhan', 'aidan', 'art', 'brian', 'cian', 'cillian',
            'ciaran', 'colm', 'conall', 'conan', 'cormac', 'darragh', 'dermot', 'donal', 'eamon', 'eoin',
            'fergal', 'fergus', 'finbar', 'fionn', 'garrett', 'kevin', 'killian', 'lorcan', 'malachy',
            'micheal', 'niall', 'oisin', 'oscar', 'padraig', 'ronan', 'rory', 'ruairi', 'ryan', 'seamus',
            'tadhg', 'tiernan', 'aife', 'ailbhe', 'aine', 'aoife', 'brigid', 'caoimhe', 'clodagh', 'deirdre',
            'eabha', 'eilis', 'eimear', 'emma', 'erin', 'fiona', 'grainne', 'kate', 'kathleen', 'keira',
            'mairead', 'maureen', 'muireann', 'nessa', 'niamh', 'nora', 'nuala', 'orla', 'roisin', 'sadhbh',
            'saoirse', 'shannon', 'sinead', 'sorcha', 'una'];
        if (irishNames.includes(nameLower)) return 'irish';
        
        // Slavic names
        const slavicNames = ['boris', 'dmitri', 'igor', 'ivan', 'mikhail', 'nikolai', 'vladimir',
            'aleksandr', 'aleksei', 'andrei', 'anton', 'artem', 'bogdan', 'daniil', 'denis', 'evgeny',
            'fyodor', 'gennady', 'georgy', 'grigory', 'ilya', 'kirill', 'leonid', 'maxim', 'oleg', 'pavel',
            'petr', 'roman', 'sergei', 'stanislav', 'timur', 'vadim', 'valentin', 'valery', 'vasily', 'viktor',
            'vitaly', 'vladislav', 'yaroslav', 'yuri', 'anastasia', 'katerina', 'natasha', 'olga', 'svetlana',
            'alexandra', 'alina', 'alla', 'anna', 'daria', 'diana', 'ekaterina', 'elena', 'elizaveta', 'galina',
            'irina', 'julia', 'kira', 'larisa', 'lyudmila', 'margarita', 'maria', 'marina', 'nadia', 'natalia',
            'nina', 'oksana', 'polina', 'raisa', 'sofia', 'tamara', 'tatiana', 'valentina', 'vera', 'victoria',
            'yana', 'yelena', 'yulia', 'zoya'];
        if (slavicNames.includes(nameLower)) return 'slavic';
        
        // Greek names
        const greekNames = ['alexander', 'andreas', 'constantine', 'dimitri', 'nicholas', 'peter', 'theodore',
            'alexandra', 'athena', 'chloe', 'elena', 'sophia', 'zoe', 'achilles', 'anastasios', 'angelos', 'antonis',
            'apostolos', 'aris', 'athanasios', 'christos', 'costas', 'demetrios', 'elias', 'evangelos', 'georgios',
            'giorgos', 'giannis', 'ioannis', 'jason', 'konstantinos', 'leonidas', 'lucas', 'markos', 'marios',
            'michalis', 'nikos', 'odysseus', 'panagiotis', 'paris', 'pavlos', 'spyros', 'stavros', 'stefanos',
            'thanasis', 'thanos', 'vasilis', 'yannis', 'adriana', 'agapi', 'aikaterini', 'anastasia', 'androniki',
            'angeliki', 'anna', 'antigone', 'ariadne', 'artemis', 'calliope', 'cassandra', 'daphne', 'despina',
            'dimitra', 'eirini', 'eleftheria', 'eleni', 'evangelia', 'georgia', 'helen', 'ioanna', 'irene',
            'kalliope', 'katerina', 'maria', 'marina', 'melina', 'niki', 'olympia', 'panagiota', 'penelope',
            'persephone', 'photini', 'rhea', 'sofia', 'stavroula', 'theodora', 'vasiliki', 'xenia'];
        if (greekNames.includes(nameLower)) return 'greek';
        
        // Chinese names (first/given names)
        const chineseNames = ['wei', 'mei', 'ling', 'ming', 'jing', 'yang', 'xin', 'yun', 'fang', 'hong', 
            'qiang', 'hui', 'jun', 'lei', 'xia', 'yan', 'ying', 'yu', 'tao', 'chen', 'li', 'jie', 'qing',
            'xiuying', 'fengying', 'xiuzhen', 'guiying', 'jinhua', 'yinhua', 'guilan', 'xiulan', 'yuzhen',
            'hao', 'haoran', 'yuxuan', 'zihan', 'yichen', 'zixuan', 'xinyi', 'yihan', 'ruoxi', 'yutong',
            'mengqi', 'kexin', 'wanting', 'yuxin', 'shihan', 'yiting', 'yiyi',
            'an', 'bao', 'bei', 'bin', 'bo', 'chao', 'cheng', 'chun', 'dan', 'dong', 'fei', 'feng', 'gang',
            'guo', 'guang', 'hai', 'han', 'he', 'hong', 'hua', 'jia', 'jian', 'jiang', 'jie', 'jin', 'kai',
            'kang', 'kun', 'lan', 'lei', 'li', 'liang', 'lin', 'liu', 'long', 'lun', 'min', 'ming', 'nan',
            'ning', 'peng', 'ping', 'qi', 'qian', 'qiang', 'qin', 'qing', 'qiu', 'quan', 'ran', 'rong',
            'ru', 'rui', 'ruo', 'shan', 'sheng', 'shi', 'shu', 'shuai', 'song', 'tao', 'tian', 'wei', 'wen',
            'wu', 'xi', 'xia', 'xiang', 'xiao', 'xin', 'xiong', 'xu', 'xuan', 'xue', 'ya', 'yan', 'yang',
            'yao', 'ye', 'yi', 'yin', 'ying', 'yong', 'you', 'yuan', 'yue', 'yun', 'ze', 'zhen', 'zheng',
            'zhi', 'zhong', 'zhou', 'zhu', 'zi'];
        if (chineseNames.includes(nameLower)) return 'chinese';
        
        // Japanese names (first/given names)
        const japaneseNames = ['hiroshi', 'takashi', 'akira', 'kenji', 'yuki', 'haruto', 'ren', 'sota',
            'sakura', 'yui', 'aoi', 'hina', 'rina', 'nozomi', 'kokoro', 'himari', 'minato', 'riku',
            'yuto', 'hayato', 'shota', 'daiki', 'kenta', 'ryota', 'takumi', 'yuji', 'tatsuya', 'naoki',
            'koji', 'masato', 'ryo', 'kazuki', 'shinji', 'makoto', 'satoshi', 'yuta', 'daisuke',
            'ayaka', 'emi', 'kaori', 'mika', 'ai', 'misaki', 'aiko', 'yoko', 'keiko', 'tomoko',
            'naoko', 'akiko', 'yuka', 'maki', 'asuka', 'aya', 'nana', 'haruka', 'mai', 'rika',
            'hinata', 'mei', 'tsubasa', 'sora', 'kohaku', 'kaito', 'takeru', 'yuma', 'yuuki'];
        if (japaneseNames.includes(nameLower)) return 'japanese';
        
        // Korean names (first/given names)
        const koreanNames = ['jihoon', 'minjun', 'seojun', 'hayoon', 'seoyeon', 'jiwoo', 'sumin', 'yuna',
            'minho', 'seoah', 'doyoon', 'hajun', 'jaemin', 'jihyun', 'soojin', 'minji', 'jisu', 'hyejin',
            'minseo', 'soyeon', 'eunji', 'jiyeon', 'yejin', 'chaeyoung', 'dahyun', 'nayeon', 'jieun',
            'taehyung', 'jungkook', 'namjoon', 'yoongi', 'hoseok', 'jimin', 'seokjin', 'hyunwoo',
            'jaehyun', 'donghyun', 'youngjae', 'wooyoung', 'san', 'hongjoong', 'seonghwa', 'yeosang',
            'hyunjin', 'felix', 'changbin', 'jisung', 'seungmin', 'jeongin', 'minho', 'chan',
            'eunbi', 'chaewon', 'yuri', 'yena', 'chaeyeon', 'hyewon', 'hitomi', 'nako', 'minju',
            'yujin', 'wonyoung', 'gaeul', 'liz', 'rei', 'leeseo'];
        if (koreanNames.includes(nameLower)) return 'korean';
        
        // Vietnamese names (first/given names)
        const vietnameseNames = ['minh', 'hieu', 'quang', 'tuan', 'hung', 'nam', 'anh', 'linh', 'mai', 
            'thu', 'lan', 'hoa', 'thao', 'van', 'ngoc', 'ha', 'huong', 'phuong', 'yen', 'thanh',
            'dung', 'duc', 'hoang', 'khanh', 'khoa', 'long', 'phat', 'phuc', 'tai', 'thang', 'tien',
            'trinh', 'truong', 'vinh', 'vu', 'han', 'hanh', 'hong', 'loan', 'my', 'nhi', 'nhu',
            'quynh', 'thi', 'trang', 'tu', 'uyen', 'xuan', 'bao', 'chi', 'dao', 'giang', 'kim',
            'le', 'ly', 'nguyet', 'tam', 'thuy'];
        if (vietnameseNames.includes(nameLower)) return 'vietnamese';
        
        // Filipino names (first/given names)
        const filipinoNames = ['jose', 'maria', 'bayani', 'makisig', 'luningning', 'ligaya', 'tala',
            'nathaniel', 'gabriel', 'althea', 'angel', 'jacob', 'juan', 'ramon', 'francisco', 'antonio',
            'miguel', 'manuel', 'pedro', 'carlos', 'roberto', 'ricardo', 'ferdinand', 'rodrigo',
            'rosario', 'carmen', 'luz', 'esperanza', 'concepcion', 'pilar', 'gloria', 'mercedes',
            'lourdes', 'josefina', 'trinidad', 'milagros', 'victoria', 'aurora', 'corazon', 'dolores',
            'kristine', 'joshua', 'john', 'mark', 'christian', 'angelo', 'james', 'daniel', 'paul',
            'andrea', 'sophia', 'isabella', 'nicole', 'samantha', 'angela', 'princess', 'maxine'];
        if (filipinoNames.includes(nameLower)) return 'filipino';
        
        // Thai names (first/given names)
        const thaiNames = ['somchai', 'chai', 'korn', 'anurak', 'niran', 'ploy', 'aranya', 'chalita',
            'somsak', 'somboon', 'somkiat', 'somporn', 'suchart', 'surachai', 'surin', 'thawat', 'wichai',
            'anong', 'arunee', 'benjawan', 'boonsri', 'busaba', 'chantana', 'kultida', 'malee', 'nittaya',
            'pranee', 'rattana', 'saengdao', 'siriwan', 'sombat', 'somjit', 'suchada', 'supaporn',
            'chanathip', 'pawin', 'theerathon', 'supachai', 'krit', 'thanawat', 'apinya', 'napasorn',
            'pimchanok', 'baifern', 'aom', 'mai', 'bow', 'mint', 'namtarn', 'yaya'];
        if (thaiNames.includes(nameLower)) return 'thai';
        
        // Indonesian names (first/given names)
        const indonesianNames = ['budi', 'agus', 'joko', 'dewi', 'siti', 'putri', 'adi', 'rudi',
            'ahmad', 'bambang', 'hadi', 'irwan', 'slamet', 'sutrisno', 'wawan', 'yanto', 'andri',
            'eko', 'hendra', 'indra', 'rio', 'wahyu', 'yudi', 'dodi', 'andi', 'dimas', 'fajar',
            'ani', 'endang', 'fatimah', 'ika', 'lestari', 'maya', 'nur', 'ratih', 'rina', 'sarah',
            'tari', 'wati', 'yuni', 'ayu', 'dian', 'fitri', 'indah', 'mega', 'novita', 'puspita',
            'angga', 'bayu', 'cahya', 'dwi', 'galih', 'putra', 'rama', 'satria'];
        if (indonesianNames.includes(nameLower)) return 'indonesian';
        
        // Indian names (first/given names) - India has regional diversity
        const indianNames = ['ravi', 'raj', 'krishna', 'arjun', 'aarav', 'shivansh', 'dhruv', 'vihaan',
            'priya', 'ananya', 'aadhya', 'saanvi', 'aditi', 'diya', 'kavya', 'anika', 'amit', 'anil',
            'ashok', 'deepak', 'dinesh', 'kiran', 'manoj', 'prakash', 'rajesh', 'sandeep', 'sunil',
            'vijay', 'vivek', 'ankur', 'gaurav', 'mohit', 'nikhil', 'pankaj', 'rahul', 'rohan', 'sumit',
            'anjali', 'asha', 'geeta', 'jaya', 'kamala', 'lakshmi', 'meera', 'neha', 'pooja', 'radha',
            'rekha', 'sanjana', 'shreya', 'sonia', 'sunita', 'swati', 'tanvi', 'usha', 'vandana',
            'aaditya', 'advait', 'ayaan', 'dev', 'ishaan', 'kabir', 'reyansh', 'vivaan', 'yash',
            'aarohi', 'ahana', 'anaya', 'ishita', 'jhanvi', 'kiara', 'myra', 'navya', 'pari', 'riya',
            'sara', 'tara', 'zara', 'aanya', 'avni'];
        if (indianNames.includes(nameLower)) return 'indian';
        
        // Pakistani names (first/given names)
        const pakistaniNames = ['ali', 'hassan', 'usman', 'zain', 'ahmed', 'abdullah', 'muhammad', 'hamza',
            'omar', 'bilal', 'faisal', 'imran', 'kamran', 'arslan', 'asad', 'fahad', 'haider', 'junaid',
            'saqib', 'shahid', 'tariq', 'wasim', 'zahid', 'adnan', 'affan', 'anas', 'haris', 'hasan',
            'ayesha', 'fatima', 'maryam', 'zainab', 'khadija', 'aisha', 'amina', 'bushra', 'farah',
            'hira', 'mahnoor', 'mehwish', 'nida', 'rabia', 'saba', 'sadia', 'saira', 'sana', 'shaista',
            'sidra', 'uzma', 'zara', 'aleena', 'amna', 'anum', 'hajra', 'iman', 'laiba', 'malaika'];
        if (pakistaniNames.includes(nameLower)) return 'pakistani';
        
        // Bangladeshi names (first/given names)
        const bangladeshiNames = ['rahim', 'karim', 'jamil', 'arif', 'taslima', 'nusrat', 'anika',
            'abul', 'aziz', 'habib', 'hanif', 'jahangir', 'mahbub', 'moin', 'najib', 'rafiq', 'rashid',
            'salam', 'shakil', 'sharif', 'shafiq', 'tanvir', 'yasin', 'zahir', 'farid', 'hafiz', 'jalil',
            'ayesha', 'farhana', 'fatema', 'hasina', 'jahanara', 'kulsum', 'mahmuda', 'nasrin', 'parvin',
            'rehana', 'rozina', 'sabina', 'salma', 'shamima', 'sultana', 'tahera', 'yasmin', 'zakia',
            'anjuman', 'firoza', 'hosneara', 'jannatul', 'monira', 'sharmin'];
        if (bangladeshiNames.includes(nameLower)) return 'bangladeshi';
        
        // Persian/Iranian names (first/given names)
        const persianNames = ['omid', 'reza', 'amir', 'dariush', 'cyrus', 'parisa', 'leila', 'nazanin', 'shirin',
            'abbas', 'behnam', 'farhad', 'hamid', 'hossein', 'javad', 'karim', 'majid', 'mehdi', 'morteza',
            'nasser', 'parviz', 'ramin', 'saeed', 'vahid', 'arash', 'babak', 'ehsan', 'farzad', 'kian',
            'azadeh', 'farah', 'fatemeh', 'maryam', 'nasrin', 'zahra', 'laleh', 'mahsa', 'niloufar', 'roxana',
            'sepideh', 'setareh', 'sima', 'soraya', 'taraneh', 'yasmin', 'yalda', 'anahita', 'darya', 'golnaz',
            'mehrnoosh', 'neda', 'sadaf', 'sara', 'tara'];
        if (persianNames.includes(nameLower)) return 'persian';
        
        // Turkish names (first/given names)
        const turkishNames = ['emre', 'mehmet', 'mustafa', 'ahmet', 'yusuf', 'aylin', 'zeynep', 'elif', 'defne', 'asli',
            'ali', 'can', 'cem', 'deniz', 'hakan', 'kemal', 'murat', 'onur', 'serkan', 'tamer', 'tolga',
            'umut', 'volkan', 'baris', 'burak', 'caglar', 'engin', 'furkan', 'gokhan', 'halil', 'ismail',
            'ayse', 'ebru', 'emine', 'fadime', 'fatma', 'gul', 'hatice', 'melek', 'nur', 'ozge', 'seda',
            'selin', 'sevgi', 'tugba', 'yasemin', 'ada', 'aysun', 'beste', 'burcu', 'damla', 'duygu',
            'esra', 'gamze', 'irem', 'merve', 'nehir', 'ozlem', 'pinar', 'sibel', 'simge'];
        if (turkishNames.includes(nameLower)) return 'turkish';
        
        // Nigerian names (first/given names) - Yoruba, Igbo, Hausa
        const nigerianNames = ['adebola', 'babatunde', 'olufemi', 'oluwaseun', 'temitope', 'ayodele', 'adebayo', 'oluwatobi',
            'adebisi', 'funmilayo', 'yetunde', 'folake', 'adeola', 'oluwakemi', 'titilayo', 'omolara',
            'chinedu', 'chinua', 'chukwuemeka', 'chioma', 'ngozi', 'chidi', 'emeka', 'obinna', 'uchenna',
            'chiamaka', 'ifeoma', 'amaka', 'nneka', 'adaeze', 'chidinma', 'chinonso',
            'abdullahi', 'abubakar', 'aminu', 'ibrahim', 'musa', 'usman', 'danjuma',
            'aisha', 'hadiza', 'hauwa', 'khadija', 'rahma', 'zainab', 'fatima'];
        if (nigerianNames.includes(nameLower)) return 'nigerian';
        
        // Ghanaian names (first/given names) - Akan day names
        const ghanaianNames = ['kwame', 'kofi', 'kwabena', 'kwaku', 'yaw', 'kwesi', 'kodwo', 'kojo',
            'ama', 'afua', 'abena', 'akua', 'aba', 'esi', 'adwoa',
            'koffi', 'yao', 'ama', 'akosua', 'adjoua', 'akissi', 'akoua'];
        if (ghanaianNames.includes(nameLower)) return 'ghanaian';
        
        // Ethiopian names (first/given names) - Amharic
        const ethiopianNames = ['amanuel', 'dawit', 'tesfaye', 'solomon', 'yohannes', 'kebede', 'haile', 'bereket',
            'selam', 'genet', 'hana', 'aster', 'meron', 'rahel', 'ruth', 'haben', 'lelise',
            'abebe', 'alemayehu', 'desta', 'gebre', 'girma', 'mulugeta', 'tadesse', 'tekle',
            'almaz', 'eleni', 'helen', 'marta', 'seble', 'tizita', 'tsion', 'yeshimebet'];
        if (ethiopianNames.includes(nameLower)) return 'ethiopian';
        
        // Kenyan names (first/given names) - Swahili, Kikuyu, Luo
        const kenyanNames = ['juma', 'mwangi', 'omari', 'baraka', 'hamisi', 'kamau', 'kariuki', 'njoroge',
            'aisha', 'nia', 'zuri', 'amani', 'furaha', 'wambui', 'wanjiku', 'njeri',
            'akinyi', 'atieno', 'awuor', 'adhiambo', 'onyango', 'ochieng', 'omondi', 'ouma',
            'makena', 'mumbi', 'wangari', 'wanjiru', 'wairimu', 'muthoni'];
        if (kenyanNames.includes(nameLower)) return 'kenyan';
        
        // South African names (first/given names) - Zulu, Xhosa, Sotho
        const southAfricanNames = ['thabo', 'sipho', 'mandla', 'bongani', 'sifiso', 'sibusiso', 'thulani', 'nkosinathi',
            'nomsa', 'zanele', 'precious', 'thandiwe', 'ntombi', 'noluthando', 'nokuthula', 'zandile',
            'lungile', 'mpho', 'thato', 'tumelo', 'karabo', 'kgotso', 'lerato', 'kagiso',
            'andile', 'ayanda', 'lunga', 'siyabonga', 'themba', 'xolani', 'yandisa', 'zolani'];
        if (southAfricanNames.includes(nameLower)) return 'southafrican';
        
        // Egyptian names (first/given names)
        const egyptianNames = ['ahmed', 'mohamed', 'youssef', 'omar', 'ali', 'mahmoud', 'hassan', 'mustafa',
            'fatima', 'amina', 'layla', 'nour', 'yasmin', 'mariam', 'salma', 'heba',
            'khaled', 'karim', 'tarek', 'amir', 'said', 'sherif', 'adel', 'sameh',
            'dina', 'aya', 'sara', 'mona', 'rania', 'noha', 'hala', 'iman'];
        if (egyptianNames.includes(nameLower)) return 'egyptian';
        
        // Zimbabwean names (first/given names) - Shona, Ndebele
        const zimbabweanNames = ['tendai', 'tafadzwa', 'kudakwashe', 'tinashe', 'takudzwa', 'tatenda', 'farai',
            'rudo', 'tariro', 'vimbai', 'chipo', 'nyasha', 'rufaro', 'ruvarashe', 'chenai',
            'blessing', 'lovermore', 'patience', 'privilege', 'prosper', 'talent', 'trust',
            'becktemba', 'sibusiso', 'nkosinathi', 'thulani'];
        if (zimbabweanNames.includes(nameLower)) return 'zimbabwean';
        
        // Tanzanian/Swahili names (first/given names)
        const swahiliNames = ['juma', 'salim', 'rashidi', 'hamisi', 'seif', 'bakari', 'said',
            'asha', 'amani', 'neema', 'rehema', 'zuhura', 'subira', 'zawadi', 'faraja',
            'bupe', 'mwanaidi', 'saada', 'safiya'];
        if (swahiliNames.includes(nameLower)) return 'swahili';
        
        // Senegalese names (first/given names) - Wolof
        const senegaleseNames = ['mamadou', 'cheikh', 'moussa', 'abdoulaye', 'ibrahima', 'ousmane', 'amadou',
            'fatou', 'awa', 'ami', 'maimouna', 'khady', 'rokhaya', 'aissatou'];
        if (senegaleseNames.includes(nameLower)) return 'senegalese';
        
        // Congolese names (first/given names)
        const congoleseNames = ['jean', 'joseph', 'pierre', 'paul', 'jacques', 'francois', 'patrice',
            'marie', 'anne', 'christine', 'grace', 'sylvie', 'celestine', 'clementine',
            'blaise', 'pascal', 'emmanuel', 'justin', 'martin'];
        if (congoleseNames.includes(nameLower)) return 'congolese';
        
        // Moroccan names (first/given names)
        const moroccanNames = ['youssef', 'mehdi', 'amine', 'adam', 'hamza', 'ayoub', 'omar',
            'khadija', 'samira', 'nadia', 'fatima', 'amina', 'yasmine', 'sarah',
            'mohammed', 'rachid', 'karim', 'hassan', 'aziz'];
        if (moroccanNames.includes(nameLower)) return 'moroccan';
        
        // Maori names (first/given names) - New Zealand
        const maoriNames = ['tane', 'wiremu', 'rangi', 'hemi', 'manaia', 'aroha', 'moana', 'anahera', 'kiri', 'marama',
            'kahu', 'matiu', 'rewi', 'tamati', 'whetu', 'awhina', 'hine', 'kora', 'mihi', 'ngaio',
            'pania', 'roimata', 'tui', 'wiki'];
        if (maoriNames.includes(nameLower)) return 'maori';
        
        // Pacific Islander names (first/given names) - Samoa, Tonga, Fiji
        const pacificNames = ['mika', 'tupu', 'fetu', 'sione', 'lafaele', 'tasi', 'lani', 'leilani', 'sina', 'talia', 'moana',
            'tui', 'latu', 'mele', 'ofa', 'sela', 'jone', 'peni', 'sakiusa', 'viliame', 'ratu',
            'adi', 'mere', 'litia', 'sera', 'asenaca', 'losalini', 'alofa'];
        if (pacificNames.includes(nameLower)) return 'pacific';
        
        // Mexican names (first/given names)
        const mexicanNames = ['jose', 'carlos', 'miguel', 'juan', 'luis', 'antonio', 'francisco', 'jesus', 'diego', 'alejandro',
            'maria', 'guadalupe', 'carmen', 'rosa', 'ana', 'isabel', 'margarita', 'veronica', 'fernanda', 'paola',
            'santiago', 'mateo', 'sebastian', 'leonardo', 'emiliano', 'daniel', 'david', 'rafael',
            'sofia', 'valentina', 'regina', 'victoria', 'isabella', 'camila', 'ximena', 'natalia'];
        if (mexicanNames.includes(nameLower)) return 'mexican';
        
        // Brazilian names (first/given names)
        const brazilianNames = ['joao', 'gabriel', 'lucas', 'miguel', 'pedro', 'arthur', 'bernardo', 'matheus', 'rafael', 'heitor',
            'ana', 'maria', 'beatriz', 'camila', 'julia', 'leticia', 'amanda', 'vitoria', 'rafaela', 'fernanda',
            'helena', 'alice', 'laura', 'manuela', 'valentina', 'sophia', 'isabella', 'heloisa', 'luisa',
            'davi', 'samuel', 'enzo', 'lorenzo', 'theo'];
        if (brazilianNames.includes(nameLower)) return 'brazilian';
        
        // Argentine names (first/given names)
        const argentineNames = ['mateo', 'santiago', 'benjamin', 'thiago', 'lucas', 'bautista', 'tomas', 'francisco', 'nicolas', 'joaquin',
            'sofia', 'emma', 'martina', 'isabella', 'valentina', 'lucia', 'emilia', 'catalina', 'mia', 'julieta',
            'agustin', 'ignacio', 'facundo', 'juan', 'martin', 'felipe'];
        if (argentineNames.includes(nameLower)) return 'argentine';
        
        // Colombian names (first/given names)
        const colombianNames = ['santiago', 'sebastian', 'samuel', 'nicolas', 'daniel', 'mateo', 'alejandro', 'gabriel', 'andres', 'david',
            'valentina', 'mariana', 'isabella', 'gabriela', 'daniela', 'sara', 'sofia', 'luciana', 'camila', 'maria',
            'juan', 'carlos', 'miguel', 'diego', 'laura', 'natalia', 'carolina', 'andrea'];
        if (colombianNames.includes(nameLower)) return 'colombian';
        
        // Chilean names (first/given names)
        const chileanNames = ['mateo', 'agustin', 'santiago', 'tomas', 'lucas', 'benjamin', 'joaquin', 'martin', 'nicolas', 'matias',
            'sofia', 'emilia', 'isabella', 'florencia', 'valentina', 'martina', 'antonia', 'maite', 'josefa', 'agustina',
            'vicente', 'felipe', 'diego', 'ignacio', 'francisca', 'isidora'];
        if (chileanNames.includes(nameLower)) return 'chilean';
        
        // Peruvian names (first/given names)
        const peruvianNames = ['mateo', 'santiago', 'sebastian', 'nicolas', 'alejandro', 'diego', 'daniel', 'gabriel', 'adrian', 'joaquin',
            'valentina', 'isabella', 'camila', 'luciana', 'mariana', 'gabriela', 'daniela', 'sara', 'sofia', 'mia',
            'jose', 'luis', 'carlos', 'lucia', 'carmen', 'rosa'];
        if (peruvianNames.includes(nameLower)) return 'peruvian';
        
        // Default to English for traditional Anglo-Saxon names
        return 'english';
    }

    getTraditionalSignificance(name, count, year) {
        const nameLower = name.toLowerCase();
        
        // Very traditional names - ancient, biblical, classical, historical names across cultures
        const highlyTraditional = [
            // English/Anglo-Saxon traditional (pre-1950s)
            'mary', 'john', 'william', 'james', 'robert', 'charles', 'george', 'joseph', 'thomas', 'richard',
            'elizabeth', 'margaret', 'dorothy', 'helen', 'barbara', 'ruth', 'virginia', 'catherine', 'alice', 'anne',
            'betty', 'ethel', 'mildred', 'frances', 'edward', 'frank', 'henry', 'walter', 'arthur', 'harold',
            'alfred', 'albert', 'ernest', 'herbert', 'clarence', 'ralph', 'howard', 'agnes', 'edna', 'bertha',
            'gertrude', 'mabel', 'florence', 'clara', 'hazel', 'edith', 'lillian', 'gladys', 'martha', 'pauline',
            
            // Biblical/Hebrew traditional names
            'abraham', 'isaac', 'jacob', 'moses', 'aaron', 'david', 'solomon', 'samuel', 'daniel', 'ezra',
            'sarah', 'rebecca', 'rachel', 'leah', 'esther', 'judith', 'miriam', 'hannah', 'deborah', 'ruth',
            
            // Classical Greek/Roman traditional
            'alexander', 'constantine', 'nicholas', 'theodore', 'peter', 'paul', 'anthony', 'marcus', 'augustus',
            'helena', 'sophia', 'theodora', 'anastasia', 'catherine', 'margaret', 'agnes', 'cecilia',
            
            // European traditional (pre-20th century)
            'francois', 'louis', 'pierre', 'jean', 'henri', 'marie', 'anne', 'jeanne', 'marguerite',
            'giovanni', 'giuseppe', 'francesco', 'antonio', 'maria', 'anna', 'rosa', 'angela',
            'francisco', 'antonio', 'jose', 'juan', 'manuel', 'carmen', 'dolores', 'pilar', 'teresa',
            'friedrich', 'wilhelm', 'heinrich', 'karl', 'anna', 'maria', 'elisabeth', 'margarethe',
            
            // Irish traditional
            'patrick', 'sean', 'michael', 'brendan', 'bridget', 'kathleen', 'maureen', 'margaret',
            
            // Slavic traditional
            'ivan', 'vladimir', 'boris', 'dmitri', 'nikolai', 'maria', 'olga', 'tatiana', 'natasha', 'katerina',
            
            // Arabic/Islamic traditional (classical)
            'mohammed', 'muhammad', 'ahmad', 'ali', 'hassan', 'hussein', 'fatima', 'aisha', 'khadija', 'maryam',
            
            // African traditional (historical/ancient)
            'kwame', 'kofi', 'abena', 'ama', 'ramses', 'nefertiti', 'cleopatra',
            
            // Asian traditional (historical/classical)
            'confucius', 'mencius', 'hirohito', 'akihito', 'wu', 'wei', 'ming'
        ];
        if (highlyTraditional.includes(nameLower)) return 'high';
        
        // Modern trendy names (post-2000) - contemporary/invented/modern spellings
        const modernNames = [
            // English modern trendy (2000s-2020s)
            'aiden', 'jayden', 'brayden', 'kayden', 'jaxon', 'jaxson', 'jaxton', 'mason', 'liam', 'noah', 
            'ethan', 'lucas', 'grayson', 'bentley', 'maverick', 'axel', 'jace', 'ryder', 'ryker', 'braxton',
            'colton', 'kaden', 'rylan', 'brycen', 'kyler', 'caden', 'easton', 'paxton', 'weston', 'carson',
            'harper', 'avery', 'riley', 'skylar', 'nevaeh', 'aria', 'kinsley', 'madison', 'addison', 'brooklyn',
            'aubrey', 'paisley', 'piper', 'willow', 'nova', 'luna', 'hazel', 'ember', 'adalynn', 'adalyn',
            'mckenzie', 'mackenzie', 'khloe', 'khaleesi', 'oakley', 'raelynn', 'brynn', 'peyton', 'kennedy',
            
            // Modern invented/celebrity-inspired
            'kylie', 'kardashian', 'stormi', 'kulture', 'north', 'saint', 'reign', 'dream', 'true',
            
            // Modern spelling variations
            'jaiden', 'jaydon', 'braelyn', 'braelynn', 'kaelyn', 'kaylynn', 'jaycee', 'kaylee', 'kaleigh',
            'ashlyn', 'ashlynn', 'madisyn', 'addyson', 'emersyn', 'gracelyn', 'gracelynn', 'raelyn',
            
            // Modern international trendy
            'enzo', 'milo', 'leo', 'kai', 'zara', 'mila', 'aria', 'sienna', 'aurora', 'ivy'
        ];
        if (modernNames.includes(nameLower)) return 'low';
        
        // If name has very high count and is from older data, likely traditional
        if (count > 5000) return 'high';
        
        // Medium traditional for everything else (timeless classics, mid-century names)
        return 'medium';
    }

    getSocioeconomicLevel(name, count) {
        const nameLower = name.toLowerCase();
        
        // Elite/upper-class names (often from aristocracy, classical origins, or professional class)
        const eliteNames = [
            // British/Anglo aristocracy
            'alexander', 'charlotte', 'victoria', 'william', 'elizabeth', 'catherine', 'katherine',
            'alexandra', 'caroline', 'theodore', 'benjamin', 'samuel', 'nathaniel', 'eleanor',
            'penelope', 'beatrice', 'arabella', 'sebastian', 'frederick', 'augustus', 'maximilian',
            'percival', 'reginald', 'nigel', 'rupert', 'giles', 'piers', 'alistair', 'montague',
            'genevieve', 'georgiana', 'cordelia', 'prudence', 'constance', 'henrietta', 'millicent',
            
            // Classical/educated elite
            'augustine', 'benedict', 'clement', 'dominic', 'ignatius', 'julian', 'octavius', 'remington',
            'montgomery', 'wellington', 'adelaide', 'beatrix', 'cecilia', 'dorothea', 'evangeline',
            'felicity', 'imogen', 'josephine', 'lucinda', 'marguerite', 'miranda', 'ophelia', 'rosalind',
            
            // European elite
            'maximilien', 'leopold', 'philippe', 'alexandre', 'francois-xavier', 'christophe',
            'alessandro', 'leonardo', 'massimiliano', 'raffaele', 'donatella', 'elisabetta', 'margherita'
        ];
        if (eliteNames.includes(nameLower)) return 'high';
        
        // Working-class trending names (modern invented, aspirational brands, virtue names)
        const workingClassNames = [
            // Modern invented/trendy
            'jayden', 'brayden', 'kayden', 'jaxon', 'jaxson', 'braxton', 'paxton', 'ryker', 'ryder',
            'kaden', 'kyler', 'caden', 'bryson', 'greyson', 'grayson', 'easton', 'weston', 'colton',
            
            // Aspirational/luxury brand names
            'bentley', 'bentlee', 'bentleigh', 'armani', 'chanel', 'gucci', 'dior', 'lexus', 'mercedes',
            'porsche', 'versace', 'tiffany', 'crystal', 'diamond', 'jewel', 'treasure',
            
            // Virtue/aspirational
            'nevaeh', 'heaven', 'destiny', 'miracle', 'blessing', 'precious', 'princess', 'angel',
            'serenity', 'harmony', 'trinity', 'star', 'legacy', 'majesty', 'royalty', 'queen', 'king',
            'prince', 'duke', 'cash', 'money',
            
            // Action/tough names
            'maverick', 'gunner', 'hunter', 'ranger', 'cannon', 'shooter', 'tank', 'diesel', 'blade',
            'steel', 'stone', 'boulder', 'rock', 'hawk', 'falcon', 'tiger', 'bear',
            
            // Modern occupation names
            'mason', 'cooper', 'carter', 'parker', 'hunter', 'fisher', 'sawyer', 'tanner', 'porter'
        ];
        if (workingClassNames.includes(nameLower)) return 'low';
        
        // Default to medium (middle-class, timeless, professional names)
        return 'medium';
    }

    getPerceivedTraits(name, gender, count) {
        const traits = [];
        const nameLower = name.toLowerCase();
        
        // Elegant names (refined, sophisticated, graceful)
        const elegantNames = ['alexandra', 'arabella', 'beatrice', 'catherine', 'charlotte', 'eleanor', 
            'elizabeth', 'genevieve', 'isabella', 'juliet', 'penelope', 'victoria',
            'alexander', 'benjamin', 'nathaniel', 'sebastian', 'theodore', 'william',
            'anastasia', 'gabrielle', 'josephine', 'marguerite', 'vivienne', 'evangeline',
            'montgomery', 'fitzgerald', 'augustine', 'remington', 'maximilian',
            // International elegant names
            'francesca', 'valentina', 'arabella', 'seraphina', 'cordelia', 'genevra',
            'sebastian', 'leonardo', 'alessandro', 'philippe', 'christophe', 'lorenzo'];
        if (elegantNames.includes(nameLower)) traits.push('elegant');
        
        // Strong/powerful names (warrior-like, commanding presence)
        const strongNames = ['alexander', 'dominic', 'gabriel', 'maximus', 'rex', 'samson', 'thor', 'victor',
            'valentina', 'victoria', 'matilda', 'brianna', 'marcus', 'leo', 'augustus', 'caesar',
            'malcolm', 'angus', 'duncan', 'magnus', 'garrett', 'griffin', 'conrad', 'frederick',
            'bridget', 'brenda', 'bertha', 'gertrude', 'maeve', 'rhiannon', 'brunhilde',
            // International strong names
            'muhammad', 'ali', 'hassan', 'khan', 'raj', 'arjun', 'diego', 'santiago',
            'tatiana', 'olga', 'boris', 'vladimir', 'dmitri', 'igor'];
        if (strongNames.includes(nameLower)) traits.push('strong');
        
        // Friendly/approachable names (warm, casual, inviting)
        const friendlyNames = ['amy', 'andy', 'ben', 'charlie', 'emma', 'jenny', 'katie', 'lucy', 
            'mike', 'molly', 'sam', 'sarah', 'sophie', 'tommy', 'annie', 'betty', 'billy', 'bobby',
            'daisy', 'danny', 'ellie', 'harry', 'jack', 'jamie', 'joey', 'julie', 'kelly', 'kenny',
            'lily', 'maggie', 'nancy', 'olivia', 'penny', 'rosie', 'sally', 'sandy', 'susie',
            'abby', 'alex', 'chris', 'drew', 'frankie', 'jessie', 'jordan', 'pat', 'riley', 'taylor'];
        if (friendlyNames.includes(nameLower)) traits.push('friendly');
        
        // Intelligent/scholarly names (academic, wise, bookish)
        const intelligentNames = ['albert', 'alfred', 'athena', 'beatrice', 'eleanor', 'minerva', 
            'prudence', 'sage', 'solomon', 'sophia', 'winston', 'albert', 'ernest', 'leonard',
            'theodore', 'constance', 'dorothea', 'edith', 'harriet', 'margaret', 'mildred',
            // Scientists/scholars
            'darwin', 'edison', 'franklin', 'galileo', 'isaac', 'marie', 'rosalind', 'ada',
            // International intellectual names
            'confucius', 'rumi', 'omar', 'aristotle', 'plato', 'hypatia'];
        if (intelligentNames.includes(nameLower)) traits.push('intelligent');
        
        // Creative/artistic names (artistic, musical, imaginative)
        const creativeNames = ['aria', 'art', 'carmen', 'dante', 'harmony', 'leonardo', 'lyric', 
            'melody', 'michelangelo', 'raphael', 'vincent', 'claude', 'pablo', 'salvador',
            'frida', 'georgia', 'henri', 'jasper', 'matisse', 'monet', 'picasso', 'rembrandt',
            'mozart', 'beethoven', 'chopin', 'vivaldi', 'bach', 'wolfgang',
            'poetry', 'sonnet', 'cadence', 'rhythm', 'symphony', 'allegra', 'octavia'];
        if (creativeNames.includes(nameLower)) traits.push('creative_perceived');
        
        // Unique names (low count or unusual)
        if (count < 200) traits.push('unique');
        
        // Traditional names (classic, timeless, established)
        const traditionalNames = ['anne', 'barbara', 'charles', 'dorothy', 'elizabeth', 'george', 
            'helen', 'james', 'john', 'margaret', 'mary', 'robert', 'william', 'richard', 'thomas',
            'joseph', 'david', 'edward', 'francis', 'ruth', 'alice', 'catherine', 'virginia',
            'patricia', 'daniel', 'michael', 'christopher', 'paul', 'anthony', 'mark'];
        if (traditionalNames.includes(nameLower)) traits.push('traditional_perceived');
        
        // Modern names (contemporary, trendy, current)
        const modernNames = ['aria', 'aiden', 'harper', 'jayden', 'liam', 'mason', 'noah', 'skylar',
            'ava', 'mia', 'luna', 'ezra', 'kai', 'zoe', 'riley', 'brooklyn', 'maverick',
            'nova', 'ember', 'phoenix', 'river', 'sage', 'storm', 'winter', 'archer', 'hunter'];
        if (modernNames.includes(nameLower)) traits.push('modern');
        
        // Natural/earthy names (nature-inspired, botanical, elemental)
        const naturalNames = ['ash', 'birch', 'daisy', 'fern', 'hazel', 'holly', 'ivy', 'jasmine', 
            'laurel', 'lily', 'oak', 'olive', 'rose', 'sage', 'violet', 'willow', 'clover', 'iris',
            'primrose', 'azalea', 'magnolia', 'poppy', 'dahlia', 'flora', 'pearl', 'ruby', 'jade',
            'amber', 'coral', 'river', 'lake', 'brook', 'forest', 'rain', 'summer', 'autumn',
            'winter', 'sky', 'star', 'luna', 'dawn', 'eve', 'storm', 'mountain'];
        if (naturalNames.includes(nameLower)) traits.push('natural');
        
        // Trustworthy names (virtue names, reliable associations)
        const trustworthyNames = ['constance', 'faith', 'grace', 'hope', 'prudence', 'trust', 'verity',
            'felicity', 'charity', 'mercy', 'patience', 'honesty', 'justice', 'honor',
            'earnest', 'clement', 'loyal', 'true', 'sincere'];
        if (trustworthyNames.includes(nameLower)) traits.push('trustworthy');
        
        // Default to friendly if no specific traits
        if (traits.length === 0) traits.push('friendly');
        
        return traits;
    }

    getDesiredTraits(name, gender) {
        const traits = [];
        const nameLower = name.toLowerCase();
        
        // Authority/leadership names (commanding, powerful, leader-like)
        const authorityNames = ['alexander', 'augustus', 'caesar', 'constantine', 'dominic', 'duke', 
            'king', 'rex', 'regina', 'victoria', 'maximus', 'magnus', 'prince', 'queen',
            'charles', 'william', 'elizabeth', 'catherine', 'frederick', 'leopold', 'ludwig',
            'napoleon', 'winston', 'franklin', 'theodore', 'eleanor', 'diana',
            // International leadership names
            'muhammad', 'saladin', 'akbar', 'shaka', 'montezuma', 'cyrus', 'xerxes'];
        if (authorityNames.includes(nameLower)) traits.push('authority');
        
        // Strength/confidence names (bold, fearless, powerful)
        const strengthNames = ['alexander', 'andrew', 'bridget', 'ethan', 'gabriel', 'matilda', 
            'samson', 'valentina', 'victor', 'victoria', 'thor', 'hercules', 'achilles',
            'hector', 'leonidas', 'spartacus', 'maximus', 'marcus', 'griffin', 'garrett',
            'bridget', 'brenda', 'matilda', 'brunhilde', 'sigrid', 'freya', 'athena',
            // International strength names
            'arjun', 'hassan', 'malik', 'aziz', 'diego', 'santiago', 'rodrigo',
            'vladimir', 'dmitri', 'boris', 'igor', 'sergei', 'mulan', 'tomoe'];
        if (strengthNames.includes(nameLower)) traits.push('strength_desired');
        
        // Warmth/kindness names (compassionate, caring, gentle)
        const warmthNames = ['amy', 'charity', 'clara', 'emma', 'grace', 'hope', 'joy', 'lily', 
            'mercy', 'ruby', 'rose', 'sunny', 'daisy', 'poppy', 'flora', 'harmony',
            'felicity', 'amelia', 'sophia', 'olivia', 'charlotte', 'emily', 'lucy',
            'annie', 'molly', 'sarah', 'hannah', 'rachel', 'rebecca', 'ruth',
            'clement', 'francis', 'vincent', 'joseph', 'gabriel', 'michael',
            // International warmth names
            'maria', 'ana', 'carmen', 'rosa', 'fatima', 'aisha', 'layla', 'noor',
            'sakura', 'mei', 'yuki', 'hana', 'aroha', 'alofa', 'leilani'];
        if (warmthNames.includes(nameLower)) traits.push('warmth');
        
        // Intelligence/wisdom names (scholarly, wise, learned)
        const intelligenceNames = ['albert', 'athena', 'minerva', 'prudence', 'sage', 'solomon', 'sophia',
            'alfred', 'ernest', 'isaac', 'darwin', 'edison', 'franklin', 'winston',
            'beatrice', 'eleanor', 'margaret', 'marie', 'ada', 'rosalind', 'hypatia',
            'aristotle', 'plato', 'galileo', 'leonardo', 'cicero', 'seneca',
            // Modern wisdom names
            'wisdom', 'story', 'quest', 'truth', 'oracle', 'lore'];
        if (intelligenceNames.includes(nameLower)) traits.push('intelligence_desired');
        
        // Creativity/expressiveness names (artistic, imaginative, innovative)
        const creativityNames = ['aria', 'art', 'cadence', 'carmen', 'dante', 'harmony', 'leonardo', 
            'lyric', 'melody', 'raphael', 'vincent', 'claude', 'pablo', 'frida',
            'wolfgang', 'amadeus', 'ludwig', 'johann', 'claude', 'henri', 'georgia',
            'poetry', 'sonnet', 'rhythm', 'symphony', 'allegra', 'octavia',
            'michelangelo', 'rembrandt', 'monet', 'picasso', 'matisse', 'chopin'];
        if (creativityNames.includes(nameLower)) traits.push('creativity_desired');
        
        // Uniqueness/distinction names (uncommon, distinctive, memorable)
        const uniqueNames = ['arabella', 'artemis', 'atlas', 'aurora', 'cassandra', 'orion', 'persephone', 'phoenix',
            'calliope', 'cressida', 'cygnus', 'demetrius', 'evangeline', 'galatea', 'hermione',
            'isolde', 'lysander', 'oberon', 'ophelia', 'perdita', 'prospero', 'titania',
            'zephyr', 'zenith', 'zora', 'xander', 'ulysses', 'thaddeus', 'seraphina'];
        if (uniqueNames.includes(nameLower)) traits.push('uniqueness_desired');
        
        // Tradition/heritage names (classic, timeless, ancestral)
        const traditionNames = ['anne', 'catherine', 'charles', 'elizabeth', 'george', 'james', 
            'john', 'margaret', 'mary', 'william', 'robert', 'richard', 'thomas', 'joseph',
            'dorothy', 'helen', 'barbara', 'edward', 'arthur', 'henry', 'francis',
            // International traditional
            'giovanni', 'giuseppe', 'maria', 'anna', 'jose', 'juan', 'francisco',
            'mohammed', 'fatima', 'aisha', 'wei', 'ming', 'yuki', 'taro'];
        if (traditionNames.includes(nameLower)) traits.push('tradition_desired');
        
        // Nature connection names (earthy, natural, environmental)
        const natureNames = ['ash', 'birch', 'brook', 'daisy', 'fern', 'hazel', 'holly', 'ivy', 
            'jasmine', 'laurel', 'lily', 'oak', 'olive', 'river', 'rose', 'sage', 'violet', 'willow',
            'clover', 'iris', 'primrose', 'azalea', 'magnolia', 'poppy', 'dahlia', 'flora',
            'pearl', 'ruby', 'jade', 'amber', 'coral', 'lake', 'forest', 'rain',
            'summer', 'autumn', 'winter', 'sky', 'star', 'luna', 'dawn', 'eve', 'storm'];
        if (natureNames.includes(nameLower)) traits.push('nature_connection');
        
        // Trust/reliability names (dependable, honest, virtuous)
        const trustNames = ['constance', 'faith', 'grace', 'hope', 'prudence', 'trust', 'verity',
            'felicity', 'charity', 'mercy', 'patience', 'honesty', 'justice', 'honor',
            'earnest', 'clement', 'loyal', 'true', 'sincere', 'noble'];
        if (trustNames.includes(nameLower)) traits.push('trust_desired');
        
        // Default
        if (traits.length === 0) traits.push('warmth');
        
        return traits;
    }

    getGeographicPreference(name, count) {
        const preferences = [];
        const nameLower = name.toLowerCase();
        
        // Coastal/urban names (trendy, modern, metropolitan)
        const coastalNames = ['avery', 'brooklyn', 'madison', 'skylar', 'harper', 'parker', 
            'kennedy', 'reagan', 'carter', 'phoenix', 'river', 'ocean', 'bay', 'marina',
            'austin', 'dallas', 'boston', 'london', 'paris', 'milan', 'sydney', 'tokyo',
            'archer', 'jasper', 'finn', 'silas', 'atticus', 'milo', 'ivy', 'nova',
            'zara', 'aria', 'luna', 'mia', 'kai', 'ezra', 'asher', 'sage'];
        if (coastalNames.includes(nameLower)) {
            preferences.push('coastal_community', 'urban_community');
        }
        
        // Rural/traditional names (country, agricultural, small town)
        const ruralNames = ['earl', 'floyd', 'homer', 'merle', 'wayne', 'loretta', 'patsy',
            'cletus', 'clem', 'dale', 'duane', 'dwight', 'elmer', 'floyd', 'gomer', 'harley',
            'hank', 'horace', 'jethro', 'leroy', 'lester', 'marvin', 'otis', 'roy', 'wilbur',
            'bertha', 'bessie', 'bonnie', 'darlene', 'dolly', 'faye', 'hazel', 'jolene',
            'loretta', 'luella', 'mabel', 'mavis', 'opal', 'pearl', 'ruby', 'velma'];
        if (ruralNames.includes(nameLower)) {
            preferences.push('rural_community', 'small_town');
        }
        
        // Suburban names (moderate, mainstream, middle-class)
        const suburbanNames = ['ashley', 'brittany', 'jessica', 'jennifer', 'michael', 'matthew', 
            'christopher', 'joshua', 'ryan', 'andrew', 'daniel', 'david', 'james', 'joseph',
            'amanda', 'emily', 'hannah', 'lauren', 'megan', 'nicole', 'rachel', 'sarah',
            'brandon', 'brian', 'eric', 'justin', 'kevin', 'kyle', 'nathan', 'tyler',
            'allison', 'courtney', 'heather', 'kelly', 'kimberly', 'lindsay', 'melissa', 'stephanie'];
        if (suburbanNames.includes(nameLower)) {
            preferences.push('suburban_community');
        }
        
        // Small town names (traditional American, family-oriented)
        const smallTownNames = ['betty', 'bobby', 'jimmy', 'johnny', 'mary', 'sally', 'tommy',
            'annie', 'billy', 'danny', 'jenny', 'katie', 'molly', 'nancy', 'patty', 'susie',
            'andy', 'charlie', 'eddie', 'frankie', 'harry', 'jack', 'joey', 'sammy',
            'barb', 'bev', 'cathy', 'deb', 'diane', 'donna', 'judy', 'linda', 'pam'];
        if (smallTownNames.includes(nameLower)) {
            preferences.push('small_town');
        }
        
        // Mountain/outdoor names (nature-loving, adventurous)
        const mountainNames = ['aspen', 'cedar', 'ridge', 'summit', 'forest', 'pine', 'stone',
            'boulder', 'cliff', 'dale', 'glen', 'heath', 'sierra', 'montana', 'dakota'];
        if (mountainNames.includes(nameLower)) {
            preferences.push('mountain_community', 'rural_community');
        }
        
        // Popular names work everywhere
        if (count > 5000) {
            preferences.push('suburban_community', 'urban_community');
        }
        
        // Default to suburban if no specific preference
        if (preferences.length === 0) preferences.push('suburban_community');
        
        return preferences;
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
                        // Skip if name or gender is missing
                        if (!name || !gender) return;
                        const key = `${name.toLowerCase()}_${gender}`;
                        
                        if (!allNames[key]) {
                            allNames[key] = this.createEnhancedNameEntry(name, gender, 0, year);
                        }
                        
                        allNames[key].totalCount += parseInt(count || 0);
                        allNames[key].years.push({ year, count: parseInt(count || 0) });
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
        this.lengthIndex = { 'short': [], 'medium': [], 'long': [], 'extra_long': [] };
        this.genderLengthIndex = {
            'M': { 'short': [], 'medium': [], 'long': [], 'extra_long': [] },
            'F': { 'short': [], 'medium': [], 'long': [], 'extra_long': [] },
            'NB': { 'short': [], 'medium': [], 'long': [], 'extra_long': [] }
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
            } else if (nameLength <= 9) {
                lengthCategory = 'long';
            } else {
                lengthCategory = 'extra_long';
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
        console.log(`📏 Length index: short=${this.lengthIndex.short.length}, medium=${this.lengthIndex.medium.length}, long=${this.lengthIndex.long.length}, extra_long=${this.lengthIndex.extra_long.length}`);
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

    // Curated list of well-documented gender-neutral names from baby name websites
    // Sources: Nameberry, BabyCenter, The Bump, What to Expect, and other reputable parenting sites
    getCuratedGenderNeutralNames() {
        // These are names commonly listed on baby name websites as unisex/gender-neutral
        const genderNeutralNames = [
            // Classic gender-neutral names (most popular on baby name sites)
            'Alex', 'Avery', 'Bailey', 'Blake', 'Cameron', 'Casey', 'Charlie', 'Dakota', 'Dylan',
            'Elliot', 'Emerson', 'Finley', 'Harley', 'Harper', 'Hayden', 'Jamie', 'Jordan', 'Justice',
            'Kai', 'Kennedy', 'Logan', 'Morgan', 'Parker', 'Peyton', 'Quinn', 'Reese', 'Riley',
            'River', 'Rowan', 'Ryan', 'Sage', 'Sam', 'Sawyer', 'Skylar', 'Taylor', 'Winter',
            
            // Nature-inspired gender-neutral names
            'Aspen', 'Autumn', 'Bay', 'Brook', 'Cedar', 'Cloud', 'Cypress', 'Ever', 'Fern', 'Forest',
            'Gray', 'Grove', 'Juniper', 'Lake', 'Lark', 'Leaf', 'Maple', 'Ocean', 'Oakley', 'Phoenix',
            'Rain', 'Reed', 'Robin', 'Sequoia', 'Sky', 'Sparrow', 'Storm', 'Wren',
            
            // Modern trending gender-neutral names (2010s-2020s)
            'Arden', 'Ari', 'Arrow', 'Ashton', 'August', 'Atlas', 'Blair', 'Bodhi', 'Campbell', 'Carter',
            'Chandler', 'Charlie', 'Corey', 'Cruz', 'Dallas', 'Devin', 'Drew', 'Ellis', 'Emery', 'Ezra',
            'Frankie', 'Gray', 'Greer', 'Harlow', 'Haven', 'Hollis', 'Indiana', 'Indigo', 'Jaden', 'Joss',
            'Jules', 'Kendall', 'Lane', 'Lennon', 'London', 'Luca', 'Marley', 'Micah', 'Milan', 'Monroe',
            'Navy', 'Nico', 'Noa', 'Noel', 'Oakley', 'Onyx', 'Parker', 'Paxton', 'Presley', 'Remi',
            'Rory', 'Scout', 'Shiloh', 'Spencer', 'Stevie', 'Sydney', 'Tatum', 'Tennessee', 'Toby',
            
            // Short/nickname-style gender-neutral names
            'Andy', 'Billie', 'Bobby', 'Chris', 'Dani', 'Frankie', 'Gene', 'Jackie', 'Jesse', 'Jo',
            'Joey', 'Lee', 'Lou', 'Max', 'Nicky', 'Pat', 'Ronnie', 'Shay', 'Stevie', 'Terry', 'Val',
            
            // Virtue/word names that are gender-neutral
            'Angel', 'Arden', 'Blessing', 'Chance', 'Destiny', 'Eden', 'Faith', 'Fortune', 'Freedom',
            'Genesis', 'Grace', 'Harbor', 'Harmony', 'Haven', 'Honor', 'Hope', 'Journey', 'Joy',
            'Justice', 'Legacy', 'Liberty', 'Love', 'Loyal', 'Mercy', 'Miracle', 'Noble', 'Pace',
            'Peace', 'Promise', 'Reason', 'Royal', 'True', 'Truth', 'Unique', 'Unity', 'Valentine',
            'Valor', 'Wisdom',
            
            // International gender-neutral names
            'Amal', 'Ariel', 'Azariah', 'Darcy', 'Eden', 'Erin', 'Gale', 'Glenn', 'Isa', 'Jody',
            'Kiran', 'Leslie', 'Lynn', 'Marley', 'Mischa', 'Noor', 'Pearse', 'Rene', 'Sacha', 'Sasha',
            'Shannon', 'Shea', 'Sidney', 'Simone', 'Sloan', 'Sutton', 'Tai', 'Tommie', 'Tracy', 'Vivian',
            
            // Professional/surname-style gender-neutral names
            'Addison', 'Anderson', 'Archer', 'Ashby', 'Barclay', 'Barrett', 'Beckett', 'Bennett', 'Bentley',
            'Billings', 'Blaine', 'Brooks', 'Bryant', 'Camden', 'Carson', 'Cassidy', 'Clayton', 'Collins',
            'Cooper', 'Cory', 'Dakota', 'Dallas', 'Dalton', 'Davis', 'Dawson', 'Devon', 'Donovan', 'Edison',
            'Ellery', 'Emory', 'Finley', 'Flynn', 'Garrison', 'Gray', 'Hadley', 'Harper', 'Harrison',
            'Hayden', 'Hudson', 'Hunter', 'Jackson', 'Jameson', 'Jensen', 'Jordan', 'Keegan', 'Kelly',
            'Kelsey', 'Kennedy', 'Kingsley', 'Landry', 'Lennox', 'Lincoln', 'Logan', 'Mackenzie', 'Madison',
            'Maddox', 'Mason', 'McKenzie', 'Morgan', 'Murphy', 'Oakley', 'Palmer', 'Parker', 'Payton',
            'Perry', 'Presley', 'Preston', 'Quinn', 'Raleigh', 'Reagan', 'Reese', 'Remy', 'Riley',
            'Ripley', 'Rowan', 'Rowen', 'Rylan', 'Sailor', 'Salem', 'Sawyer', 'Shelby', 'Sheridan',
            'Sidney', 'Skyler', 'Spencer', 'Sterling', 'Sullivan', 'Sutton', 'Tanner', 'Taylor', 'Teagan',
            'Tyler', 'Weston', 'Whitney', 'Wiley', 'Wyatt',
            
            // Literary/cultural gender-neutral names
            'Artemis', 'Bellamy', 'Blake', 'Bronte', 'Carson', 'Cassidy', 'Cody', 'Dakota', 'Devon',
            'Dylan', 'Ellery', 'Ellis', 'Emerson', 'Fitzgerald', 'Harper', 'Holden', 'Hunter', 'Ira',
            'Jules', 'Kerry', 'Kit', 'Lane', 'Lennon', 'Leslie', 'Lindsay', 'Marlow', 'Merritt',
            'Milan', 'Monroe', 'Murphy', 'Orion', 'Parker', 'Perry', 'Phoenix', 'Poet', 'Porter',
            'Quinn', 'Reilly', 'Remy', 'Rhodes', 'River', 'Robin', 'Rory', 'Rowan', 'Sage', 'Salem',
            'Scout', 'Shay', 'Shelby', 'Sidney', 'Sloan', 'Spencer', 'Story', 'Sutton', 'Sydney',
            'Taylor', 'Teagan', 'Tennessee', 'Winter', 'Wren', 'Wylie'
        ];
        
        return [...new Set(genderNeutralNames.map(n => n.toLowerCase()))]; // Remove duplicates
    }
    
    // Get names suitable for non-binary users (appear with similar frequencies in both genders)
    getNonBinaryNames() {
        const nameFrequencyMap = {};
        const nonBinaryNames = [];
        const curatedNeutralNames = this.getCuratedGenderNeutralNames();
        
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
            const nameLower = nameData.name.toLowerCase();
            const isCurated = curatedNeutralNames.includes(nameLower);
            
            if (nameData.male > 0 && nameData.female > 0) {
                // Calculate the ratio between male and female usage
                const ratio = Math.min(nameData.male, nameData.female) / Math.max(nameData.male, nameData.female);
                
                // Include names from curated list with more lenient criteria, or statistical matches
                // Curated names: minimum 50 total uses
                // Statistical names: ratio >= 0.1 and >= 100 total uses
                const shouldInclude = isCurated 
                    ? nameData.total >= 50 
                    : (ratio >= 0.1 && nameData.total >= 100);
                
                if (shouldInclude) {
                    // Create a combined entry for non-binary use
                    const combinedEntry = {
                        name: nameData.name,
                        gender: 'NB',
                        totalCount: nameData.total,
                        maleCount: nameData.male,
                        femaleCount: nameData.female,
                        genderBalance: ratio, // Higher is more balanced
                        isCurated: isCurated, // Mark curated names for prioritization
                        
                        // Copy other properties from the more popular version
                        ...this.getMostPopularVersion(nameData.name)
                    };
                    
                    nonBinaryNames.push(combinedEntry);
                }
            }
        });
        
        // Sort: prioritize curated names, then by popularity and gender balance
        return nonBinaryNames.sort((a, b) => {
            // First, prioritize curated names from baby name sites
            if (a.isCurated !== b.isCurated) {
                return a.isCurated ? -1 : 1;
            }
            // Then by total popularity
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
