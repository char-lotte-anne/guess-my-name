/**
 * Quiz questions and the country-to-continent grouping, kept out of the quiz
 * class so the constructor reads as setup rather than 350 lines of literals.
 *
 * Country codes are lowercase ISO-3166 alpha-2 to match the `id` attributes in
 * assets/world-map.svg, so a code can be used directly as a selector. Russia
 * appears under Asia only, though the map draws it across both.
 *
 * Question `key` values are the field names in stored submissions, and
 * `option.value` strings are what src/feature-encoding.js maps to feature
 * slots. Changing either breaks previously collected data.
 */

const CONTINENT_TO_COUNTRIES = // Comprehensive country-to-continent mapping based on world-map.svg
// Using lowercase to match SVG IDs directly
{
    'north-america': ['us', 'ca', 'mx', 'gl'],
    'central-america': ['gt', 'bz', 'sv', 'hn', 'ni', 'cr', 'pa', 'cu', 'jm', 'ht', 'do', 'pr', 'bs', 'tt', 'bb', 'gd', 'lc', 'vc', 'ag', 'kn', 'dm', 'ms', 'tc', 'ky', 'aw', 'bq', 'cw', 'bl', 'mq', 'gp', 'vi', 'vg', 'ai', 'mf'],
    'south-america': ['ar', 'bo', 'br', 'cl', 'co', 'ec', 'fk', 'gf', 'gy', 'py', 'pe', 'sr', 'uy', 've'],
    'europe': ['ad', 'al', 'am', 'at', 'by', 'be', 'ba', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'ge', 'gr', 'hu', 'is', 'ie', 'it', 'xk', 'lv', 'li', 'lt', 'lu', 'mk', 'mt', 'md', 'mc', 'me', 'nl', 'no', 'pl', 'pt', 'ro', 'sm', 'rs', 'sk', 'si', 'es', 'se', 'ch', 'ua', 'gb', 'va'],
    'africa': ['dz', 'ao', 'bw', 'bi', 'cm', 'cv', 'cf', 'td', 'km', 'cg', 'cd', 'dj', 'eg', 'gq', 'er', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ci', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'rw', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'ss', 'sd', 'sz', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw', 'bf', 'bj', 'eh'],
    'asia': ['af', 'az', 'bh', 'bd', 'bt', 'bn', 'kh', 'cn', 'in', 'id', 'ir', 'iq', 'il', 'jp', 'jo', 'kz', 'kw', 'kg', 'la', 'lb', 'my', 'mv', 'mn', 'mm', 'np', 'kp', 'om', 'pk', 'ps', 'ph', 'qa', 'sa', 'sg', 'kr', 'lk', 'sy', 'tw', 'tj', 'th', 'tl', 'tr', 'tm', 'ae', 'uz', 'vn', 'ye', 'ru'],
    'oceania': ['au', 'fj', 'ki', 'mh', 'fm', 'nr', 'nz', 'pw', 'pg', 'ws', 'sb', 'to', 'tv', 'vu', 'nc']
};

const QUIZ_QUESTIONS = [
    {
        text: "What's your gender identity?",
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
        text: "What decade were you born in?",
        type: "slider",
        min: 1900,
        max: 2020,
        step: 10,
        default: 1960,
        labels: ["📜 1900s", "🎵 1950s", "🌈 2000s", "✨ 2020s"],
        key: "decade"
    },
    {
        text: "What state were you born in?",
        type: "map",
        key: "state"
    },
    {
        text: "How many letters are in your first name?",
        type: "slider",
        min: 1,
        max: 4,
        step: 1,
        default: 2,
        labels: ["⚡ Short (2-4)", "💫 Medium (5-6)", "🌟 Long (7-9)", "✨ Extra Long (10+)"],
        key: "length"
    },
    {
        text: "Does your name start with a vowel?",
        options: [
            { text: "✅ Yes (A, E, I, O, U)", value: "vowel" },
            { text: "❌ No", value: "consonant" }
        ],
        key: "starts_with"
    },
    {
        text: "How popular is your name?",
        type: "slider",
        min: 1,
        max: 3,
        step: 1,
        default: 2,
        labels: ["✨ Uncommon/unique", "💫 Somewhat popular", "🔥 Very popular"],
        key: "popularity"
    },
    {
        text: "What political values matter most to you?",
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
        text: "What languages do you speak or value?",
        type: "multi_select",
        options: [
            { text: "🇺🇸 English only", value: "english_only" },
            { text: "🇪🇸 Spanish", value: "spanish" },
            { text: "🇨🇳 Chinese (Mandarin/Cantonese)", value: "chinese" },
            { text: "🇵🇭 Filipino/Tagalog", value: "filipino" },
            { text: "🇻🇳 Vietnamese", value: "vietnamese" },
            { text: "🇰🇷 Korean", value: "korean" },
            { text: "🇯🇵 Japanese", value: "japanese" },
            { text: "🇮🇳 Hindi/Urdu", value: "hindi" },
            { text: "🇦🇪 Arabic", value: "arabic" },
            { text: "🇮🇱 Hebrew", value: "hebrew" },
            { text: "🇫🇷 French", value: "french" },
            { text: "🇩🇪 German", value: "german" },
            { text: "🇮🇹 Italian", value: "italian" },
            { text: "🇷🇺 Russian/Slavic", value: "russian" },
            { text: "🇵🇱 Polish", value: "polish" },
            { text: "🇬🇷 Greek", value: "greek" },
            { text: "🇮🇪 Irish/Gaelic", value: "irish" },
            { text: "🇳🇴 Scandinavian/Norse", value: "scandinavian" },
            { text: "🇳🇬 Nigerian/Yoruba", value: "yoruba" },
            { text: "🇪🇹 Amharic", value: "amharic" },
            { text: "🇭🇹 Haitian Creole", value: "haitian_creole" },
            { text: "🇵🇷 Portuguese", value: "portuguese" },
            { text: "🏳️ Other ", value: "other" },
        ],
        key: "language_preference"
    },
    {
        text: "What type of community do you prefer?",
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
        text: "Where did you grow up?",
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
        text: "How important is family tradition to you?",
        type: "slider",
        min: 1,
        max: 3,
        step: 0.1,
        default: 2,
        labels: ["🆕 Create new traditions", "⚖️ Mix old and new", "🏛️ Honor family heritage"],
        key: "family_tradition"
    },
    {
        text: "How do you view cultural diversity?",
        type: "slider",
        min: 1,
        max: 3,
        step: 0.1,
        default: 2,
        labels: ["🏛️ Preserve traditions", "⚖️ Balance both", "🌍 Embrace diversity"],
        key: "diversity_attitude"
    },
    {
        text: "What type of name meaning appeals to you most?",
        type: "multi_select",
        options: [
            { text: "👑 Royal or noble meaning", value: "royal" },
            { text: "🌿 Nature-inspired", value: "nature" },
            { text: "⚔️ Warrior or strength", value: "warrior" },
            { text: "🌟 Light or brightness", value: "light" },
            { text: "❤️ Love or compassion", value: "love" },
            { text: "🧠 Wisdom or knowledge", value: "wisdom" },
            { text: "🎵 Music or harmony", value: "music" },
            { text: "🌊 Water or flow", value: "water" },
            { text: "🔥 Fire or energy", value: "fire" },
            { text: "🌙 Moon or night", value: "moon" },
            { text: "☀️ Sun or day", value: "sun" },
            { text: "🕊️ Peace or freedom", value: "peace" },
            { text: "🎭 Creative or artistic", value: "creative" },
            { text: "🤷 Sounds good", value: "sound" },
        ],
        key: "name_meaning_preference"
    },
    {
        text: "How do people typically perceive your name?",
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
            { text: "🤝 Trustworthy and reliable", value: "trustworthy" }
        ],
        key: "name_perception"
    },
    {
        text: "What impression do you want your name to give?",
        type: "multi_select",
        options: [
            { text: "👑 Authority and leadership", value: "authority" },
            { text: "💪 Strength and confidence", value: "strength_desired" },
            { text: "😊 Warmth and kindness", value: "warmth" },
            { text: "🧠 Intelligence and wisdom", value: "intelligence_desired" },
            { text: "🎨 Creativity and expressiveness", value: "creativity_desired" },
            { text: "🌟 Uniqueness and distinction", value: "uniqueness_desired" },
            { text: "🏛️ Tradition and heritage", value: "tradition_desired" },
            { text: "🌿 Connection to nature", value: "nature_connection" },
        ],
        key: "desired_impression"
    },
    {
        text: "How do people typically react when they hear your name?",
        type: "multi_select",
        options: [
            { text: "😍 They love it and compliment it", value: "loved" },
            { text: "🤔 They ask how to spell it", value: "spelling_questions" },
            { text: "😊 They smile and remember it easily", value: "memorable" },
            { text: "🤷 They're neutral about it", value: "neutral" },
            { text: "😅 They make jokes or puns about it", value: "jokes" },
            { text: "🤝 They find it trustworthy", value: "trustworthy_reaction" },
            { text: "👵 They view it as old-fashioned", value: "old_fashioned" },
            { text: "🎨 They comment on its uniqueness", value: "unique_reaction" },
            { text: "🏛️ They recognize it as traditional", value: "traditional_reaction" },
            { text: "🚀 They see it as modern/trendy", value: "modern_reaction" },
            { text: "🌍 They ask about its origin", value: "origin_questions" },
            { text: "💪 They find it strong/powerful", value: "strong_reaction" }
        ],
        key: "name_reactions"
    },
    {
        text: "What's your favorite letter of the alphabet?",
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
        text: "What career paths interest you?",
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
        text: "What religious ceremonies were you part of as a child?",
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
        text: "What religious or spiritual traditions does your family follow?",
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
        text: "What continents does your family come from? (Select all that apply)",
        type: "continent_selection",
        key: "cultural_background"
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONTINENT_TO_COUNTRIES, QUIZ_QUESTIONS };
}
