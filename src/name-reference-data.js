/**
 * Static reference tables about names: religious tradition and etymological
 * meaning.
 *
 * These were object literals inside two `initialize*` methods, re-created on
 * every EnhancedNameDatabase instance. They are constant, so they live here and
 * are shared. Keys are lowercase names.
 *
 * Definitions are drawn from etymological sources and are deliberately neutral:
 * they describe the origin of a name, not the person carrying it.
 */

    const RELIGIOUS_ASSOCIATIONS = {
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

    const NAME_DEFINITIONS = {
        // Common names A-C
        'alexander': 'Defender of people',
        'alexandra': 'Defender of people',
        'alex': 'Defender of people',
        'alice': 'Noble, exalted',
        'amelia': 'Industrious, striving',
        'andrew': 'Strong, courageous',
        'anna': 'Grace, favor',
        'anthony': 'Priceless, highly praiseworthy',
        'aria': 'Melody, song',
        'arthur': 'Bear, noble, courageous',
        'ava': 'Life, living one',
        'benjamin': 'Son of the right hand, fortunate',
        'brian': 'Strong, virtuous, honorable',
        'cameron': 'Crooked nose, bent river',
        'carlos': 'Free person',
        'catherine': 'Pure, clear',
        'charlotte': 'Free person',
        'chloe': 'Young green shoot, blooming',
        'christopher': 'Bearer of Christ',
        'claire': 'Clear, bright',
        'daniel': 'God is my judge',
        'david': 'Beloved, friend',
        'diana': 'Divine, heavenly',
        'dylan': 'Son of the sea',
        'elizabeth': 'God is my oath',
        'emily': 'Industrious, striving',
        'emma': 'Whole, universal',
        'ethan': 'Strong, firm, enduring',
        'evelyn': 'Desired, wished for',
        'frank': 'Free person',
        'gabriel': 'God is my strength',
        'grace': 'Grace, favor, blessing',
        'hannah': 'Grace, favor',
        'harper': 'Harp player',
        'henry': 'Ruler of the household',
        'isabella': 'God is my oath',
        'isabel': 'God is my oath',
        'james': 'Supplanter, one who follows',
        'jane': 'God is gracious',
        'jason': 'Healer, to heal',
        'jennifer': 'Fair, smooth, gentle',
        'jessica': 'God beholds, wealth',
        'john': 'God is gracious',
        'joseph': 'God will increase',
        'joshua': 'God is salvation',
        'julia': 'Youthful, downy',
        'justin': 'Just, righteous',
        'katherine': 'Pure, clear',
        'kayla': 'Laurel, crown',
        'kevin': 'Handsome, kind, gentle',
        'kimberly': 'Royal fortress meadow',
        'laura': 'Laurel, honor, victory',
        'lauren': 'Laurel, honor, victory',
        'lily': 'Lily flower, purity',
        'linda': 'Beautiful, pretty',
        'lisa': 'God is my oath',
        'lucas': 'Light, illumination',
        'lucy': 'Light, illumination',
        'madison': 'Son of Matthew',
        'margaret': 'Pearl, precious',
        'maria': 'Star of the sea, beloved',
        'marie': 'Star of the sea, beloved',
        'mark': 'Warlike, dedicated to Mars',
        'mary': 'Star of the sea, beloved',
        'matthew': 'Gift of God',
        'megan': 'Pearl, strong, capable',
        'michael': 'Who is like God',
        'michelle': 'Who is like God',
        'natalie': 'Birthday, Christmas',
        'nicholas': 'Victory of the people',
        'nicole': 'Victory of the people',
        'noah': 'Rest, comfort',
        'olivia': 'Olive tree, peace',
        'patricia': 'Noble, patrician',
        'paul': 'Small, humble',
        'rachel': 'Ewe, gentle',
        'rebecca': 'To bind, to tie',
        'richard': 'Strong ruler, brave power',
        'robert': 'Bright fame, shining',
        'ryan': 'Little king',
        'samuel': 'God has heard',
        'sarah': 'Princess, noblewoman',
        'sophia': 'Wisdom, knowledge',
        'stephanie': 'Crown, garland',
        'stephen': 'Crown, garland',
        'susan': 'Lily, rose',
        'taylor': 'Tailor, cutter of cloth',
        'thomas': 'Twin',
        'tyler': 'Tile maker, tiler',
        'victoria': 'Victory, conqueror',
        'william': 'Resolute protector',
        'zoe': 'Life, living',
        
        // Additional popular names
        'aiden': 'Little fire, fiery',
        'alexis': 'Defender, helper',
        'allison': 'Noble, exalted',
        'amanda': 'Worthy of love, lovable',
        'amy': 'Beloved, friend',
        'andrea': 'Strong, courageous',
        'angel': 'Messenger, angel',
        'angelina': 'Messenger, angel',
        'ashley': 'Ash tree meadow',
        'austin': 'Great, magnificent',
        'brandon': 'Broom-covered hill',
        'brittany': 'From Britain',
        'brooke': 'Small stream',
        'caitlin': 'Pure, clear',
        'caleb': 'Faithful, devoted',
        'carol': 'Song, melody',
        'caroline': 'Free person',
        'casey': 'Vigilant, watchful',
        'cassandra': 'Helper of humanity',
        'christina': 'Follower of Christ',
        'christine': 'Follower of Christ',
        'cody': 'Helpful, pillow',
        'connor': 'Lover of hounds',
        'crystal': 'Clear, brilliant',
        'cynthia': 'Moon goddess',
        'danielle': 'God is my judge',
        'deborah': 'Bee, industrious',
        'denise': 'Follower of Dionysus',
        'dennis': 'Follower of Dionysus',
        'derek': 'Ruler of the people',
        'donald': 'World ruler, proud chief',
        'donna': 'Lady, woman',
        'dorothy': 'Gift of God',
        'douglas': 'Dark water, dark stream',
        'edward': 'Wealthy guardian',
        'elaine': 'Light, bright',
        'eleanor': 'Light, bright',
        'eric': 'Eternal ruler',
        'erica': 'Eternal ruler',
        'erin': 'Ireland, peace',
        'frances': 'Free person',
        'franklin': 'Free landholder',
        'gary': 'Spear, warrior',
        'george': 'Farmer, earthworker',
        'gerald': 'Rule of the spear',
        'gloria': 'Glory, fame',
        'gregory': 'Watchful, alert',
        'harold': 'Army ruler',
        'helen': 'Light, bright',
        'irene': 'Peace',
        'jack': 'God is gracious',
        'jackson': 'Son of Jack',
        'jacob': 'Supplanter, one who follows',
        'jade': 'Precious green stone',
        'jamie': 'Supplanter, one who follows',
        'janet': 'God is gracious',
        'jean': 'God is gracious',
        'jeffrey': 'Peace, pledge',
        'jeremy': 'God will uplift',
        'jerry': 'Spear ruler',
        'jesse': 'Gift, wealth',
        'jill': 'Youthful, downy',
        'joan': 'God is gracious',
        'joanna': 'God is gracious',
        'jordan': 'To flow down, descend',
        'jose': 'God will increase',
        'joy': 'Joy, happiness',
        'juan': 'God is gracious',
        'judith': 'Woman of Judea, praised',
        'julie': 'Youthful, downy',
        'karen': 'Pure, clear',
        'kathleen': 'Pure, clear',
        'kelly': 'Warrior, bright-headed',
        'kenneth': 'Handsome, born of fire',
        'kim': 'Royal fortress',
        'kyle': 'Narrow, straight',
        'larry': 'Laurel, honor',
        'lawrence': 'Laurel, honor',
        'leah': 'Gentle, delicate',
        'leonard': 'Brave lion',
        'lillian': 'Lily flower',
        'lori': 'Laurel, honor',
        'louis': 'Famous warrior',
        'marcus': 'Warlike, dedicated to Mars',
        'marilyn': 'Star of the sea, beloved',
        'martha': 'Lady, mistress',
        'martin': 'Warlike, dedicated to Mars',
        'melissa': 'Honey bee',
        'melvin': 'Smooth brow, friend',
        'morgan': 'Sea circle, great brightness',
        'nancy': 'Grace, favor',
        'nathan': 'Gift, given',
        'nathaniel': 'Gift of God',
        'norma': 'Pattern, rule',
        'pamela': 'All honey, sweetness',
        'peter': 'Rock, stone',
        'philip': 'Lover of horses',
        'phyllis': 'Green bough, foliage',
        'randy': 'Shield wolf',
        'raymond': 'Wise protector',
        'regina': 'Queen',
        'roger': 'Famous spear',
        'ronald': 'Ruler\'s counselor',
        'rose': 'Rose flower',
        'ruth': 'Friend, companion',
        'samantha': 'Listener, name of God',
        'sandra': 'Defender of people',
        'scott': 'From Scotland',
        'sean': 'God is gracious',
        'sharon': 'Plain, flat area',
        'shirley': 'Bright meadow',
        'steven': 'Crown, garland',
        'tammy': 'Palm tree',
        'teresa': 'Harvester, reaper',
        'terry': 'Ruler of the people',
        'theresa': 'Harvester, reaper',
        'timothy': 'Honoring God',
        'tracy': 'Warrior, fighter',
        'valerie': 'Strong, valiant',
        'vanessa': 'Butterfly',
        'vernon': 'Alder tree',
        'vincent': 'Conquering',
        'virginia': 'Maiden, pure',
        'walter': 'Ruler of the army',
        'wayne': 'Wagon maker, driver',
        'wendy': 'Friend, blessed ring',
        'zachary': 'God remembers'
    };

const nameReferenceDataApi = { RELIGIOUS_ASSOCIATIONS, NAME_DEFINITIONS };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = nameReferenceDataApi;
}
if (typeof window !== 'undefined') {
    window.NameReferenceData = nameReferenceDataApi;
}
