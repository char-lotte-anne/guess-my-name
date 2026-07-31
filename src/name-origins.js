/**
 * Which linguistic tradition a given first name comes from.
 *
 * WHY THIS IS A TABLE AND NOT A CHAIN OF ifs
 * This was 366 lines of `const xNames = [...]; if (xNames.includes(n)) return 'x';`
 * repeated 39 times, inside a method called once per candidate name. Every call
 * rebuilt all 39 arrays and scanned up to 2,189 strings. It is now built once at
 * load into a Map, so a lookup is O(1) and allocates nothing.
 *
 * ORDER IS SIGNIFICANT
 * 419 names appear in more than one group -- 'benjamin' is both Hebrew and
 * Chilean, 'diego' is Colombian, Chilean and Peruvian. The original returned
 * the first match in the order below, so the Map is built first-wins and the
 * group order here must not be rearranged. tests/name-origins.test.js pins the
 * resolution of every name against the original implementation.
 *
 * These lists are approximations of naming traditions, not statements about any
 * individual: plenty of people have a name from outside their own background.
 * The model treats this as one weak signal among several.
 */

const LANGUAGE_ORIGIN_GROUPS = [
    {
        origin: 'hebrew',
        names: [
        'aaron', 'abraham', 'adam', 'benjamin', 'daniel', 'david', 'elijah', 'ethan',
        'gabriel', 'isaac', 'jacob', 'jonah', 'joseph', 'joshua', 'levi', 'michael', 'noah',
        'samuel', 'abigail', 'deborah', 'esther', 'hannah', 'judith', 'leah', 'miriam',
        'naomi', 'rachel', 'rebecca', 'ruth', 'sarah', 'ari', 'ariel', 'asher', 'avi',
        'avraham', 'baruch', 'caleb', 'chaim', 'dov', 'efraim', 'eli', 'eliezer', 'emanuel',
        'ezra', 'gideon', 'haim', 'israel', 'jonathan', 'judah', 'kaleb', 'levi', 'malachi',
        'menachem', 'mordechai', 'moshe', 'nathan', 'nehemiah', 'reuben', 'saul', 'shlomo',
        'simeon', 'simon', 'solomon', 'uri', 'yakob', 'yosef', 'zachary', 'adina', 'aliza',
        'ayala', 'batya', 'bracha', 'chana', 'chava', 'devorah', 'dina', 'eliana', 'elisheva',
        'havah', 'ilana', 'leora', 'malka', 'michal', 'noa', 'rina', 'rivka', 'shira', 'tamar',
        'tova', 'yael', 'yaffa', 'zahava', 'ziva'
        ]
    },
    {
        origin: 'spanish',
        names: [
        'alejandro', 'antonio', 'carlos', 'diego', 'francisco', 'jose', 'juan', 'luis',
        'miguel', 'pablo', 'adrian', 'alberto', 'alfonso', 'alvaro', 'andres', 'angel',
        'arturo', 'benjamin', 'daniel', 'david', 'eduardo', 'emilio', 'enrique', 'ernesto',
        'esteban', 'federico', 'felipe', 'fernando', 'gabriel', 'gerardo', 'guillermo',
        'gustavo', 'hector', 'hugo', 'ignacio', 'javier', 'jesus', 'joaquin', 'jorge',
        'leonardo', 'lorenzo', 'manuel', 'marcos', 'mario', 'martin', 'mateo', 'nicolas',
        'oscar', 'patricio', 'pedro', 'rafael', 'ramon', 'raul', 'ricardo', 'roberto',
        'rodrigo', 'ruben', 'samuel', 'sancho', 'santiago', 'sergio', 'tomas', 'vicente',
        'ana', 'carmen', 'elena', 'isabella', 'lucia', 'maria', 'rosa', 'sofia', 'valentina',
        'adriana', 'alicia', 'amparo', 'andrea', 'angela', 'antonia', 'beatriz', 'blanca',
        'catalina', 'cecilia', 'clara', 'claudia', 'cristina', 'daniela', 'dolores', 'elisa',
        'emilia', 'emma', 'esperanza', 'esther', 'eva', 'fatima', 'francisca', 'gabriela',
        'gloria', 'ines', 'irene', 'isabel', 'josefa', 'juana', 'julia', 'laura', 'leonor',
        'lola', 'lourdes', 'luisa', 'luz', 'magdalena', 'mar', 'margarita', 'marina', 'marta',
        'mercedes', 'monica', 'natalia', 'nuria', 'patricia', 'paula', 'pilar', 'raquel',
        'rocio', 'rosario', 'sandra', 'sara', 'silvia', 'susana', 'teresa', 'veronica',
        'victoria'
        ]
    },
    {
        origin: 'italian',
        names: [
        'angelo', 'bruno', 'dante', 'giovanni', 'leonardo', 'lorenzo', 'marco', 'matteo',
        'alessandro', 'andrea', 'antonio', 'carlo', 'claudio', 'dario', 'davide', 'domenico',
        'emanuele', 'enrico', 'fabio', 'federico', 'filippo', 'francesco', 'gabriele',
        'giacomo', 'gianluca', 'giorgio', 'giuseppe', 'luca', 'luigi', 'manuel', 'marcello',
        'mario', 'massimo', 'michele', 'nicola', 'paolo', 'pietro', 'riccardo', 'roberto',
        'salvatore', 'sergio', 'simone', 'stefano', 'tommaso', 'valentino', 'vincenzo',
        'vittorio', 'alessandra', 'bianca', 'elena', 'francesca', 'gianna', 'giulia',
        'isabella', 'lucia', 'sophia', 'adriana', 'alessia', 'alice', 'angela', 'anna',
        'antonella', 'arianna', 'beatrice', 'camilla', 'carla', 'carlotta', 'caterina',
        'chiara', 'claudia', 'daniela', 'elena', 'eleonora', 'elisa', 'elisabetta', 'federica',
        'gabriella', 'giada', 'giovanna', 'greta', 'ilaria', 'irene', 'laura', 'liliana',
        'lisa', 'lorena', 'luciana', 'luisa', 'margherita', 'maria', 'marina', 'marta',
        'martina', 'michela', 'monica', 'nicole', 'paola', 'patrizia', 'raffaella', 'rebecca',
        'roberta', 'rosa', 'sara', 'serena', 'silvia', 'simona', 'sofia', 'stefania',
        'valentina', 'valeria', 'veronica', 'vittoria'
        ]
    },
    {
        origin: 'french',
        names: [
        'andre', 'antoine', 'pierre', 'louis', 'jean', 'henri', 'alexandre', 'alain', 'arnaud',
        'baptiste', 'benoit', 'bernard', 'bruno', 'charles', 'christophe', 'claude', 'daniel',
        'david', 'denis', 'didier', 'dominique', 'emile', 'eric', 'etienne', 'fabien',
        'florian', 'francois', 'gabriel', 'gaston', 'georges', 'gerard', 'guillaume', 'hugo',
        'jacques', 'jerome', 'joseph', 'julien', 'laurent', 'leon', 'luc', 'marc', 'marcel',
        'mathieu', 'maxime', 'michel', 'nicolas', 'olivier', 'pascal', 'patrice', 'paul',
        'philippe', 'quentin', 'raphael', 'remi', 'rene', 'robert', 'sebastien', 'simon',
        'stephane', 'thierry', 'thomas', 'victor', 'vincent', 'xavier', 'yves', 'amelie',
        'claire', 'juliette', 'marie', 'sophie', 'yvonne', 'adele', 'adrienne', 'agathe',
        'agnes', 'aimee', 'alice', 'aline', 'anais', 'andre', 'angelique', 'anne', 'annette',
        'ariane', 'aurelie', 'beatrice', 'brigitte', 'camille', 'caroline', 'catherine',
        'cecile', 'celine', 'chantal', 'charlotte', 'chloe', 'christine', 'claire', 'clemence',
        'colette', 'corinne', 'danielle', 'delphine', 'denise', 'diane', 'dominique',
        'eleonore', 'elise', 'eloise', 'emilie', 'emmanuelle', 'estelle', 'florence',
        'francoise', 'genevieve', 'helene', 'henriette', 'isabelle', 'jacqueline', 'jeanne',
        'josephine', 'julie', 'laetitia', 'laure', 'laurence', 'lea', 'leonie', 'louise',
        'lucille', 'lucie', 'madeleine', 'manon', 'marguerite', 'marianne', 'marine',
        'martine', 'mathilde', 'melanie', 'michele', 'monique', 'nadine', 'nathalie', 'nicole',
        'odette', 'pascale', 'paulette', 'pauline', 'sandrine', 'simone', 'solange',
        'stephanie', 'suzanne', 'sylvie', 'therese', 'valerie', 'veronique', 'virginie'
        ]
    },
    {
        origin: 'arabic',
        names: [
        'ahmed', 'ali', 'hassan', 'ibrahim', 'khalid', 'mohammed', 'omar', 'rashid', 'aisha',
        'fatima', 'leila', 'nadia', 'yasmin', 'zara', 'abdullah', 'abdulrahman', 'abdul',
        'adel', 'adnan', 'ahmad', 'akram', 'amin', 'anwar', 'asad', 'aziz', 'bilal', 'faisal',
        'farid', 'fawaz', 'hamid', 'hani', 'hakim', 'hussein', 'jamal', 'kamal', 'karim',
        'kareem', 'mahdi', 'majid', 'malik', 'mansour', 'marwan', 'mustafa', 'nabil', 'nadir',
        'nasir', 'omar', 'qasim', 'rami', 'rashad', 'saad', 'sabir', 'said', 'salah', 'saleh',
        'salim', 'sami', 'tariq', 'walid', 'wassim', 'yusuf', 'zaki', 'aaliyah', 'abeer',
        'adila', 'afaf', 'amal', 'amani', 'amina', 'amira', 'aya', 'ayat', 'aziza', 'basma',
        'bushra', 'dalia', 'dina', 'farah', 'farida', 'fatin', 'habiba', 'hala', 'hanan',
        'hiba', 'iman', 'inas', 'inaya', 'jameela', 'jamila', 'karima', 'khadija', 'laila',
        'lamia', 'latifa', 'layla', 'lina', 'lubna', 'maha', 'malak', 'mariam', 'maryam',
        'mona', 'nada', 'nadine', 'naima', 'najwa', 'noor', 'noura', 'raja', 'rana', 'rania',
        'rasha', 'reem', 'sabah', 'safa', 'sahar', 'salma', 'samira', 'sana', 'sanaa', 'sara',
        'sarah', 'shadha', 'suhair', 'sumaya', 'wafa', 'yasmin', 'zahra', 'zaynab'
        ]
    },
    {
        origin: 'irish',
        names: [
        'aiden', 'brendan', 'connor', 'declan', 'finn', 'liam', 'patrick', 'sean', 'aisling',
        'ciara', 'maeve', 'niamh', 'siobhan', 'aidan', 'art', 'brian', 'cian', 'cillian',
        'ciaran', 'colm', 'conall', 'conan', 'cormac', 'darragh', 'dermot', 'donal', 'eamon',
        'eoin', 'fergal', 'fergus', 'finbar', 'fionn', 'garrett', 'kevin', 'killian', 'lorcan',
        'malachy', 'micheal', 'niall', 'oisin', 'oscar', 'padraig', 'ronan', 'rory', 'ruairi',
        'ryan', 'seamus', 'tadhg', 'tiernan', 'aife', 'ailbhe', 'aine', 'aoife', 'brigid',
        'caoimhe', 'clodagh', 'deirdre', 'eabha', 'eilis', 'eimear', 'emma', 'erin', 'fiona',
        'grainne', 'kate', 'kathleen', 'keira', 'mairead', 'maureen', 'muireann', 'nessa',
        'niamh', 'nora', 'nuala', 'orla', 'roisin', 'sadhbh', 'saoirse', 'shannon', 'sinead',
        'sorcha', 'una'
        ]
    },
    {
        origin: 'slavic',
        names: [
        'boris', 'dmitri', 'igor', 'ivan', 'mikhail', 'nikolai', 'vladimir', 'aleksandr',
        'aleksei', 'andrei', 'anton', 'artem', 'bogdan', 'daniil', 'denis', 'evgeny', 'fyodor',
        'gennady', 'georgy', 'grigory', 'ilya', 'kirill', 'leonid', 'maxim', 'oleg', 'pavel',
        'petr', 'roman', 'sergei', 'stanislav', 'timur', 'vadim', 'valentin', 'valery',
        'vasily', 'viktor', 'vitaly', 'vladislav', 'yaroslav', 'yuri', 'anastasia', 'katerina',
        'natasha', 'olga', 'svetlana', 'alexandra', 'alina', 'alla', 'anna', 'daria', 'diana',
        'ekaterina', 'elena', 'elizaveta', 'galina', 'irina', 'julia', 'kira', 'larisa',
        'lyudmila', 'margarita', 'maria', 'marina', 'nadia', 'natalia', 'nina', 'oksana',
        'polina', 'raisa', 'sofia', 'tamara', 'tatiana', 'valentina', 'vera', 'victoria',
        'yana', 'yelena', 'yulia', 'zoya'
        ]
    },
    {
        origin: 'greek',
        names: [
        'alexander', 'andreas', 'constantine', 'dimitri', 'nicholas', 'peter', 'theodore',
        'alexandra', 'athena', 'chloe', 'elena', 'sophia', 'zoe', 'achilles', 'anastasios',
        'angelos', 'antonis', 'apostolos', 'aris', 'athanasios', 'christos', 'costas',
        'demetrios', 'elias', 'evangelos', 'georgios', 'giorgos', 'giannis', 'ioannis',
        'jason', 'konstantinos', 'leonidas', 'lucas', 'markos', 'marios', 'michalis', 'nikos',
        'odysseus', 'panagiotis', 'paris', 'pavlos', 'spyros', 'stavros', 'stefanos',
        'thanasis', 'thanos', 'vasilis', 'yannis', 'adriana', 'agapi', 'aikaterini',
        'anastasia', 'androniki', 'angeliki', 'anna', 'antigone', 'ariadne', 'artemis',
        'calliope', 'cassandra', 'daphne', 'despina', 'dimitra', 'eirini', 'eleftheria',
        'eleni', 'evangelia', 'georgia', 'helen', 'ioanna', 'irene', 'kalliope', 'katerina',
        'maria', 'marina', 'melina', 'niki', 'olympia', 'panagiota', 'penelope', 'persephone',
        'photini', 'rhea', 'sofia', 'stavroula', 'theodora', 'vasiliki', 'xenia'
        ]
    },
    {
        origin: 'chinese',
        names: [
        'wei', 'mei', 'ling', 'ming', 'jing', 'yang', 'xin', 'yun', 'fang', 'hong', 'qiang',
        'hui', 'jun', 'lei', 'xia', 'yan', 'ying', 'yu', 'tao', 'chen', 'li', 'jie', 'qing',
        'xiuying', 'fengying', 'xiuzhen', 'guiying', 'jinhua', 'yinhua', 'guilan', 'xiulan',
        'yuzhen', 'hao', 'haoran', 'yuxuan', 'zihan', 'yichen', 'zixuan', 'xinyi', 'yihan',
        'ruoxi', 'yutong', 'mengqi', 'kexin', 'wanting', 'yuxin', 'shihan', 'yiting', 'yiyi',
        'an', 'bao', 'bei', 'bin', 'bo', 'chao', 'cheng', 'chun', 'dan', 'dong', 'fei', 'feng',
        'gang', 'guo', 'guang', 'hai', 'han', 'he', 'hong', 'hua', 'jia', 'jian', 'jiang',
        'jie', 'jin', 'kai', 'kang', 'kun', 'lan', 'lei', 'li', 'liang', 'lin', 'liu', 'long',
        'lun', 'min', 'ming', 'nan', 'ning', 'peng', 'ping', 'qi', 'qian', 'qiang', 'qin',
        'qing', 'qiu', 'quan', 'ran', 'rong', 'ru', 'rui', 'ruo', 'shan', 'sheng', 'shi',
        'shu', 'shuai', 'song', 'tao', 'tian', 'wei', 'wen', 'wu', 'xi', 'xia', 'xiang',
        'xiao', 'xin', 'xiong', 'xu', 'xuan', 'xue', 'ya', 'yan', 'yang', 'yao', 'ye', 'yi',
        'yin', 'ying', 'yong', 'you', 'yuan', 'yue', 'yun', 'ze', 'zhen', 'zheng', 'zhi',
        'zhong', 'zhou', 'zhu', 'zi'
        ]
    },
    {
        origin: 'japanese',
        names: [
        'hiroshi', 'takashi', 'akira', 'kenji', 'yuki', 'haruto', 'ren', 'sota', 'sakura',
        'yui', 'aoi', 'hina', 'rina', 'nozomi', 'kokoro', 'himari', 'minato', 'riku', 'yuto',
        'hayato', 'shota', 'daiki', 'kenta', 'ryota', 'takumi', 'yuji', 'tatsuya', 'naoki',
        'koji', 'masato', 'ryo', 'kazuki', 'shinji', 'makoto', 'satoshi', 'yuta', 'daisuke',
        'ayaka', 'emi', 'kaori', 'mika', 'ai', 'misaki', 'aiko', 'yoko', 'keiko', 'tomoko',
        'naoko', 'akiko', 'yuka', 'maki', 'asuka', 'aya', 'nana', 'haruka', 'mai', 'rika',
        'hinata', 'mei', 'tsubasa', 'sora', 'kohaku', 'kaito', 'takeru', 'yuma', 'yuuki'
        ]
    },
    {
        origin: 'korean',
        names: [
        'jihoon', 'minjun', 'seojun', 'hayoon', 'seoyeon', 'jiwoo', 'sumin', 'yuna', 'minho',
        'seoah', 'doyoon', 'hajun', 'jaemin', 'jihyun', 'soojin', 'minji', 'jisu', 'hyejin',
        'minseo', 'soyeon', 'eunji', 'jiyeon', 'yejin', 'chaeyoung', 'dahyun', 'nayeon',
        'jieun', 'taehyung', 'jungkook', 'namjoon', 'yoongi', 'hoseok', 'jimin', 'seokjin',
        'hyunwoo', 'jaehyun', 'donghyun', 'youngjae', 'wooyoung', 'san', 'hongjoong',
        'seonghwa', 'yeosang', 'hyunjin', 'felix', 'changbin', 'jisung', 'seungmin', 'jeongin',
        'minho', 'chan', 'eunbi', 'chaewon', 'yuri', 'yena', 'chaeyeon', 'hyewon', 'hitomi',
        'nako', 'minju', 'yujin', 'wonyoung', 'gaeul', 'liz', 'rei', 'leeseo'
        ]
    },
    {
        origin: 'vietnamese',
        names: [
        'minh', 'hieu', 'quang', 'tuan', 'hung', 'nam', 'anh', 'linh', 'mai', 'thu', 'lan',
        'hoa', 'thao', 'van', 'ngoc', 'ha', 'huong', 'phuong', 'yen', 'thanh', 'dung', 'duc',
        'hoang', 'khanh', 'khoa', 'long', 'phat', 'phuc', 'tai', 'thang', 'tien', 'trinh',
        'truong', 'vinh', 'vu', 'han', 'hanh', 'hong', 'loan', 'my', 'nhi', 'nhu', 'quynh',
        'thi', 'trang', 'tu', 'uyen', 'xuan', 'bao', 'chi', 'dao', 'giang', 'kim', 'le', 'ly',
        'nguyet', 'tam', 'thuy'
        ]
    },
    {
        origin: 'filipino',
        names: [
        'jose', 'maria', 'bayani', 'makisig', 'luningning', 'ligaya', 'tala', 'nathaniel',
        'gabriel', 'althea', 'angel', 'jacob', 'juan', 'ramon', 'francisco', 'antonio',
        'miguel', 'manuel', 'pedro', 'carlos', 'roberto', 'ricardo', 'ferdinand', 'rodrigo',
        'rosario', 'carmen', 'luz', 'esperanza', 'concepcion', 'pilar', 'gloria', 'mercedes',
        'lourdes', 'josefina', 'trinidad', 'milagros', 'victoria', 'aurora', 'corazon',
        'dolores', 'kristine', 'joshua', 'john', 'mark', 'christian', 'angelo', 'james',
        'daniel', 'paul', 'andrea', 'sophia', 'isabella', 'nicole', 'samantha', 'angela',
        'princess', 'maxine'
        ]
    },
    {
        origin: 'thai',
        names: [
        'somchai', 'chai', 'korn', 'anurak', 'niran', 'ploy', 'aranya', 'chalita', 'somsak',
        'somboon', 'somkiat', 'somporn', 'suchart', 'surachai', 'surin', 'thawat', 'wichai',
        'anong', 'arunee', 'benjawan', 'boonsri', 'busaba', 'chantana', 'kultida', 'malee',
        'nittaya', 'pranee', 'rattana', 'saengdao', 'siriwan', 'sombat', 'somjit', 'suchada',
        'supaporn', 'chanathip', 'pawin', 'theerathon', 'supachai', 'krit', 'thanawat',
        'apinya', 'napasorn', 'pimchanok', 'baifern', 'aom', 'mai', 'bow', 'mint', 'namtarn',
        'yaya'
        ]
    },
    {
        origin: 'indonesian',
        names: [
        'budi', 'agus', 'joko', 'dewi', 'siti', 'putri', 'adi', 'rudi', 'ahmad', 'bambang',
        'hadi', 'irwan', 'slamet', 'sutrisno', 'wawan', 'yanto', 'andri', 'eko', 'hendra',
        'indra', 'rio', 'wahyu', 'yudi', 'dodi', 'andi', 'dimas', 'fajar', 'ani', 'endang',
        'fatimah', 'ika', 'lestari', 'maya', 'nur', 'ratih', 'rina', 'sarah', 'tari', 'wati',
        'yuni', 'ayu', 'dian', 'fitri', 'indah', 'mega', 'novita', 'puspita', 'angga', 'bayu',
        'cahya', 'dwi', 'galih', 'putra', 'rama', 'satria'
        ]
    },
    {
        origin: 'indian',
        names: [
        'ravi', 'raj', 'krishna', 'arjun', 'aarav', 'shivansh', 'dhruv', 'vihaan', 'priya',
        'ananya', 'aadhya', 'saanvi', 'aditi', 'diya', 'kavya', 'anika', 'amit', 'anil',
        'ashok', 'deepak', 'dinesh', 'kiran', 'manoj', 'prakash', 'rajesh', 'sandeep', 'sunil',
        'vijay', 'vivek', 'ankur', 'gaurav', 'mohit', 'nikhil', 'pankaj', 'rahul', 'rohan',
        'sumit', 'anjali', 'asha', 'geeta', 'jaya', 'kamala', 'lakshmi', 'meera', 'neha',
        'pooja', 'radha', 'rekha', 'sanjana', 'shreya', 'sonia', 'sunita', 'swati', 'tanvi',
        'usha', 'vandana', 'aaditya', 'advait', 'ayaan', 'dev', 'ishaan', 'kabir', 'reyansh',
        'vivaan', 'yash', 'aarohi', 'ahana', 'anaya', 'ishita', 'jhanvi', 'kiara', 'myra',
        'navya', 'pari', 'riya', 'sara', 'tara', 'zara', 'aanya', 'avni'
        ]
    },
    {
        origin: 'pakistani',
        names: [
        'ali', 'hassan', 'usman', 'zain', 'ahmed', 'abdullah', 'muhammad', 'hamza', 'omar',
        'bilal', 'faisal', 'imran', 'kamran', 'arslan', 'asad', 'fahad', 'haider', 'junaid',
        'saqib', 'shahid', 'tariq', 'wasim', 'zahid', 'adnan', 'affan', 'anas', 'haris',
        'hasan', 'ayesha', 'fatima', 'maryam', 'zainab', 'khadija', 'aisha', 'amina', 'bushra',
        'farah', 'hira', 'mahnoor', 'mehwish', 'nida', 'rabia', 'saba', 'sadia', 'saira',
        'sana', 'shaista', 'sidra', 'uzma', 'zara', 'aleena', 'amna', 'anum', 'hajra', 'iman',
        'laiba', 'malaika'
        ]
    },
    {
        origin: 'bangladeshi',
        names: [
        'rahim', 'karim', 'jamil', 'arif', 'taslima', 'nusrat', 'anika', 'abul', 'aziz',
        'habib', 'hanif', 'jahangir', 'mahbub', 'moin', 'najib', 'rafiq', 'rashid', 'salam',
        'shakil', 'sharif', 'shafiq', 'tanvir', 'yasin', 'zahir', 'farid', 'hafiz', 'jalil',
        'ayesha', 'farhana', 'fatema', 'hasina', 'jahanara', 'kulsum', 'mahmuda', 'nasrin',
        'parvin', 'rehana', 'rozina', 'sabina', 'salma', 'shamima', 'sultana', 'tahera',
        'yasmin', 'zakia', 'anjuman', 'firoza', 'hosneara', 'jannatul', 'monira', 'sharmin'
        ]
    },
    {
        origin: 'persian',
        names: [
        'omid', 'reza', 'amir', 'dariush', 'cyrus', 'parisa', 'leila', 'nazanin', 'shirin',
        'abbas', 'behnam', 'farhad', 'hamid', 'hossein', 'javad', 'karim', 'majid', 'mehdi',
        'morteza', 'nasser', 'parviz', 'ramin', 'saeed', 'vahid', 'arash', 'babak', 'ehsan',
        'farzad', 'kian', 'azadeh', 'farah', 'fatemeh', 'maryam', 'nasrin', 'zahra', 'laleh',
        'mahsa', 'niloufar', 'roxana', 'sepideh', 'setareh', 'sima', 'soraya', 'taraneh',
        'yasmin', 'yalda', 'anahita', 'darya', 'golnaz', 'mehrnoosh', 'neda', 'sadaf', 'sara',
        'tara'
        ]
    },
    {
        origin: 'turkish',
        names: [
        'emre', 'mehmet', 'mustafa', 'ahmet', 'yusuf', 'aylin', 'zeynep', 'elif', 'defne',
        'asli', 'ali', 'can', 'cem', 'deniz', 'hakan', 'kemal', 'murat', 'onur', 'serkan',
        'tamer', 'tolga', 'umut', 'volkan', 'baris', 'burak', 'caglar', 'engin', 'furkan',
        'gokhan', 'halil', 'ismail', 'ayse', 'ebru', 'emine', 'fadime', 'fatma', 'gul',
        'hatice', 'melek', 'nur', 'ozge', 'seda', 'selin', 'sevgi', 'tugba', 'yasemin', 'ada',
        'aysun', 'beste', 'burcu', 'damla', 'duygu', 'esra', 'gamze', 'irem', 'merve', 'nehir',
        'ozlem', 'pinar', 'sibel', 'simge'
        ]
    },
    {
        origin: 'nigerian',
        names: [
        'adebola', 'babatunde', 'olufemi', 'oluwaseun', 'temitope', 'ayodele', 'adebayo',
        'oluwatobi', 'adebisi', 'funmilayo', 'yetunde', 'folake', 'adeola', 'oluwakemi',
        'titilayo', 'omolara', 'chinedu', 'chinua', 'chukwuemeka', 'chioma', 'ngozi', 'chidi',
        'emeka', 'obinna', 'uchenna', 'chiamaka', 'ifeoma', 'amaka', 'nneka', 'adaeze',
        'chidinma', 'chinonso', 'abdullahi', 'abubakar', 'aminu', 'ibrahim', 'musa', 'usman',
        'danjuma', 'aisha', 'hadiza', 'hauwa', 'khadija', 'rahma', 'zainab', 'fatima'
        ]
    },
    {
        origin: 'ghanaian',
        names: [
        'kwame', 'kofi', 'kwabena', 'kwaku', 'yaw', 'kwesi', 'kodwo', 'kojo', 'ama', 'afua',
        'abena', 'akua', 'aba', 'esi', 'adwoa', 'koffi', 'yao', 'ama', 'akosua', 'adjoua',
        'akissi', 'akoua'
        ]
    },
    {
        origin: 'ethiopian',
        names: [
        'amanuel', 'dawit', 'tesfaye', 'solomon', 'yohannes', 'kebede', 'haile', 'bereket',
        'selam', 'genet', 'hana', 'aster', 'meron', 'rahel', 'ruth', 'haben', 'lelise',
        'abebe', 'alemayehu', 'desta', 'gebre', 'girma', 'mulugeta', 'tadesse', 'tekle',
        'almaz', 'eleni', 'helen', 'marta', 'seble', 'tizita', 'tsion', 'yeshimebet'
        ]
    },
    {
        origin: 'kenyan',
        names: [
        'juma', 'mwangi', 'omari', 'baraka', 'hamisi', 'kamau', 'kariuki', 'njoroge', 'aisha',
        'nia', 'zuri', 'amani', 'furaha', 'wambui', 'wanjiku', 'njeri', 'akinyi', 'atieno',
        'awuor', 'adhiambo', 'onyango', 'ochieng', 'omondi', 'ouma', 'makena', 'mumbi',
        'wangari', 'wanjiru', 'wairimu', 'muthoni'
        ]
    },
    {
        origin: 'southafrican',
        names: [
        'thabo', 'sipho', 'mandla', 'bongani', 'sifiso', 'sibusiso', 'thulani', 'nkosinathi',
        'nomsa', 'zanele', 'precious', 'thandiwe', 'ntombi', 'noluthando', 'nokuthula',
        'zandile', 'lungile', 'mpho', 'thato', 'tumelo', 'karabo', 'kgotso', 'lerato',
        'kagiso', 'andile', 'ayanda', 'lunga', 'siyabonga', 'themba', 'xolani', 'yandisa',
        'zolani'
        ]
    },
    {
        origin: 'egyptian',
        names: [
        'ahmed', 'mohamed', 'youssef', 'omar', 'ali', 'mahmoud', 'hassan', 'mustafa', 'fatima',
        'amina', 'layla', 'nour', 'yasmin', 'mariam', 'salma', 'heba', 'khaled', 'karim',
        'tarek', 'amir', 'said', 'sherif', 'adel', 'sameh', 'dina', 'aya', 'sara', 'mona',
        'rania', 'noha', 'hala', 'iman'
        ]
    },
    {
        origin: 'zimbabwean',
        names: [
        'tendai', 'tafadzwa', 'kudakwashe', 'tinashe', 'takudzwa', 'tatenda', 'farai', 'rudo',
        'tariro', 'vimbai', 'chipo', 'nyasha', 'rufaro', 'ruvarashe', 'chenai', 'blessing',
        'lovermore', 'patience', 'privilege', 'prosper', 'talent', 'trust', 'becktemba',
        'sibusiso', 'nkosinathi', 'thulani'
        ]
    },
    {
        origin: 'swahili',
        names: [
        'juma', 'salim', 'rashidi', 'hamisi', 'seif', 'bakari', 'said', 'asha', 'amani',
        'neema', 'rehema', 'zuhura', 'subira', 'zawadi', 'faraja', 'bupe', 'mwanaidi', 'saada',
        'safiya'
        ]
    },
    {
        origin: 'senegalese',
        names: [
        'mamadou', 'cheikh', 'moussa', 'abdoulaye', 'ibrahima', 'ousmane', 'amadou', 'fatou',
        'awa', 'ami', 'maimouna', 'khady', 'rokhaya', 'aissatou'
        ]
    },
    {
        origin: 'congolese',
        names: [
        'jean', 'joseph', 'pierre', 'paul', 'jacques', 'francois', 'patrice', 'marie', 'anne',
        'christine', 'grace', 'sylvie', 'celestine', 'clementine', 'blaise', 'pascal',
        'emmanuel', 'justin', 'martin'
        ]
    },
    {
        origin: 'moroccan',
        names: [
        'youssef', 'mehdi', 'amine', 'adam', 'hamza', 'ayoub', 'omar', 'khadija', 'samira',
        'nadia', 'fatima', 'amina', 'yasmine', 'sarah', 'mohammed', 'rachid', 'karim',
        'hassan', 'aziz'
        ]
    },
    {
        origin: 'maori',
        names: [
        'tane', 'wiremu', 'rangi', 'hemi', 'manaia', 'aroha', 'moana', 'anahera', 'kiri',
        'marama', 'kahu', 'matiu', 'rewi', 'tamati', 'whetu', 'awhina', 'hine', 'kora', 'mihi',
        'ngaio', 'pania', 'roimata', 'tui', 'wiki'
        ]
    },
    {
        origin: 'pacific',
        names: [
        'mika', 'tupu', 'fetu', 'sione', 'lafaele', 'tasi', 'lani', 'leilani', 'sina', 'talia',
        'moana', 'tui', 'latu', 'mele', 'ofa', 'sela', 'jone', 'peni', 'sakiusa', 'viliame',
        'ratu', 'adi', 'mere', 'litia', 'sera', 'asenaca', 'losalini', 'alofa'
        ]
    },
    {
        origin: 'mexican',
        names: [
        'jose', 'carlos', 'miguel', 'juan', 'luis', 'antonio', 'francisco', 'jesus', 'diego',
        'alejandro', 'maria', 'guadalupe', 'carmen', 'rosa', 'ana', 'isabel', 'margarita',
        'veronica', 'fernanda', 'paola', 'santiago', 'mateo', 'sebastian', 'leonardo',
        'emiliano', 'daniel', 'david', 'rafael', 'sofia', 'valentina', 'regina', 'victoria',
        'isabella', 'camila', 'ximena', 'natalia'
        ]
    },
    {
        origin: 'brazilian',
        names: [
        'joao', 'gabriel', 'lucas', 'miguel', 'pedro', 'arthur', 'bernardo', 'matheus',
        'rafael', 'heitor', 'ana', 'maria', 'beatriz', 'camila', 'julia', 'leticia', 'amanda',
        'vitoria', 'rafaela', 'fernanda', 'helena', 'alice', 'laura', 'manuela', 'valentina',
        'sophia', 'isabella', 'heloisa', 'luisa', 'davi', 'samuel', 'enzo', 'lorenzo', 'theo'
        ]
    },
    {
        origin: 'argentine',
        names: [
        'mateo', 'santiago', 'benjamin', 'thiago', 'lucas', 'bautista', 'tomas', 'francisco',
        'nicolas', 'joaquin', 'sofia', 'emma', 'martina', 'isabella', 'valentina', 'lucia',
        'emilia', 'catalina', 'mia', 'julieta', 'agustin', 'ignacio', 'facundo', 'juan',
        'martin', 'felipe'
        ]
    },
    {
        origin: 'colombian',
        names: [
        'santiago', 'sebastian', 'samuel', 'nicolas', 'daniel', 'mateo', 'alejandro',
        'gabriel', 'andres', 'david', 'valentina', 'mariana', 'isabella', 'gabriela',
        'daniela', 'sara', 'sofia', 'luciana', 'camila', 'maria', 'juan', 'carlos', 'miguel',
        'diego', 'laura', 'natalia', 'carolina', 'andrea'
        ]
    },
    {
        origin: 'chilean',
        names: [
        'mateo', 'agustin', 'santiago', 'tomas', 'lucas', 'benjamin', 'joaquin', 'martin',
        'nicolas', 'matias', 'sofia', 'emilia', 'isabella', 'florencia', 'valentina',
        'martina', 'antonia', 'maite', 'josefa', 'agustina', 'vicente', 'felipe', 'diego',
        'ignacio', 'francisca', 'isidora'
        ]
    },
    {
        origin: 'peruvian',
        names: [
        'mateo', 'santiago', 'sebastian', 'nicolas', 'alejandro', 'diego', 'daniel', 'gabriel',
        'adrian', 'joaquin', 'valentina', 'isabella', 'camila', 'luciana', 'mariana',
        'gabriela', 'daniela', 'sara', 'sofia', 'mia', 'jose', 'luis', 'carlos', 'lucia',
        'carmen', 'rosa'
        ]
    }
];

/** name -> origin, first group wins, built once. */
const LANGUAGE_ORIGIN_BY_NAME = (() => {
    const map = new Map();
    for (const group of LANGUAGE_ORIGIN_GROUPS) {
        for (const name of group.names) {
            if (!map.has(name)) map.set(name, group.origin);
        }
    }
    return map;
})();

const DEFAULT_LANGUAGE_ORIGIN = 'english';

function lookupLanguageOrigin(name) {
    if (typeof name !== 'string' || name === '') return DEFAULT_LANGUAGE_ORIGIN;
    return LANGUAGE_ORIGIN_BY_NAME.get(name.toLowerCase()) || DEFAULT_LANGUAGE_ORIGIN;
}

const nameOriginsApi = {
    LANGUAGE_ORIGIN_GROUPS, LANGUAGE_ORIGIN_BY_NAME,
    DEFAULT_LANGUAGE_ORIGIN, lookupLanguageOrigin
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = nameOriginsApi;
}
if (typeof window !== 'undefined') {
    window.NameOrigins = nameOriginsApi;
}
