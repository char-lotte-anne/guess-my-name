const fs = require('fs');
const path = require('path');

/**
 * Script to identify and mark non-binary names from all name data sources
 * Identifies names that appear in both M and F categories with a 30-70 to 50-50 split
 */

const NAMES_DIR = path.join(__dirname, '..', 'names');
const STATE_NAMES_DIR = path.join(__dirname, '..', 'namesbystate');
const TERRITORY_NAMES_DIR = path.join(__dirname, '..', 'namesbyterritory');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'nonbinary-names.json');

// Minimum ratio for non-binary names (0.43 = 30/70 split, 1.0 = 50/50 split)
const MIN_RATIO = 0.43;
const MIN_TOTAL_COUNT = 100; // Minimum total occurrences across both genders

// Curated list of known gender-neutral names (from nameDatabase.js)
const CURATED_NEUTRAL_NAMES = [
    'alex', 'avery', 'bailey', 'blake', 'cameron', 'casey', 'charlie', 'dakota', 'dylan',
    'elliot', 'emerson', 'finley', 'harley', 'harper', 'hayden', 'jamie', 'jordan', 'justice',
    'kai', 'kennedy', 'logan', 'morgan', 'parker', 'peyton', 'quinn', 'reese', 'riley',
    'river', 'rowan', 'ryan', 'sage', 'sam', 'sawyer', 'skylar', 'taylor', 'winter',
    'aspen', 'autumn', 'bay', 'brook', 'cedar', 'cloud', 'cypress', 'ever', 'fern', 'forest',
    'gray', 'grove', 'juniper', 'lake', 'lark', 'leaf', 'maple', 'ocean', 'oakley', 'phoenix',
    'rain', 'reed', 'robin', 'sequoia', 'sky', 'sparrow', 'storm', 'wren',
    'arden', 'ari', 'arrow', 'ashton', 'august', 'atlas', 'blair', 'bodhi', 'campbell', 'carter',
    'chandler', 'corey', 'cruz', 'dallas', 'devin', 'drew', 'ellis', 'emery', 'ezra',
    'frankie', 'greer', 'harlow', 'haven', 'hollis', 'indiana', 'indigo', 'jaden', 'joss',
    'jules', 'kendall', 'lane', 'lennon', 'london', 'luca', 'marley', 'micah', 'milan', 'monroe',
    'navy', 'nico', 'noa', 'noel', 'onyx', 'paxton', 'presley', 'remi',
    'rory', 'scout', 'shiloh', 'spencer', 'stevie', 'sydney', 'tatum', 'tennessee', 'toby',
    'andy', 'billie', 'bobby', 'chris', 'dani', 'gene', 'jackie', 'jesse', 'jo',
    'joey', 'lee', 'lou', 'max', 'nicky', 'pat', 'ronnie', 'shay', 'terry', 'val',
    'angel', 'blessing', 'chance', 'destiny', 'eden', 'faith', 'fortune', 'freedom',
    'genesis', 'grace', 'harbor', 'harmony', 'honor', 'hope', 'journey', 'joy',
    'legacy', 'liberty', 'love', 'loyal', 'mercy', 'miracle', 'noble', 'pace',
    'peace', 'promise', 'reason', 'royal', 'true', 'truth', 'unique', 'unity', 'valentine',
    'valor', 'wisdom', 'amal', 'ariel', 'azariah', 'darcy', 'erin', 'gale', 'glenn', 'isa', 'jody',
    'kiran', 'leslie', 'lynn', 'mischa', 'noor', 'pearse', 'rene', 'sacha', 'sasha',
    'shannon', 'shea', 'sidney', 'simone', 'sloan', 'sutton', 'tai', 'tommie', 'tracy', 'vivian',
    'addison', 'anderson', 'archer', 'ashby', 'barclay', 'barrett', 'beckett', 'bennett', 'bentley',
    'billings', 'blaine', 'brooks', 'bryant', 'camden', 'carson', 'cassidy', 'clayton', 'collins',
    'cooper', 'cory', 'dalton', 'davis', 'dawson', 'devon', 'donovan', 'edison',
    'ellery', 'emory', 'flynn', 'garrison', 'hadley', 'harrison',
    'hudson', 'hunter', 'jackson', 'jameson', 'jensen', 'keegan', 'kelly',
    'kelsey', 'kingsley', 'landry', 'lennox', 'lincoln', 'mackenzie', 'madison',
    'maddox', 'mason', 'mckenzie', 'murphy', 'palmer', 'payton',
    'perry', 'preston', 'raleigh', 'reagan', 'remy', 'ripley', 'rowen', 'rylan', 'sailor', 'salem',
    'shelby', 'sheridan', 'skyler', 'sterling', 'sullivan', 'tanner', 'teagan',
    'tyler', 'weston', 'whitney', 'wiley', 'wyatt',
    'artemis', 'bellamy', 'bronte', 'cody', 'fitzgerald', 'holden', 'ira',
    'kerry', 'kit', 'lindsay', 'marlow', 'merritt',
    'orion', 'poet', 'porter', 'reilly', 'rhodes', 'story', 'wylie'
].map(n => n.toLowerCase());

/**
 * Parse a name file line (format: Name,Gender,Count)
 */
function parseNameLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    
    const parts = trimmed.split(',');
    if (parts.length < 3) return null;
    
    const name = parts[0].trim();
    const gender = parts[1].trim().toUpperCase();
    const count = parseInt(parts[2].trim(), 10);
    
    if (!name || !gender || isNaN(count)) return null;
    if (gender !== 'M' && gender !== 'F') return null;
    
    return { name, gender, count };
}

/**
 * Parse a state/territory file line (format: State,Gender,Year,Name,Count)
 */
function parseStateLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    
    const parts = trimmed.split(',');
    if (parts.length < 5) return null;
    
    const state = parts[0].trim();
    const gender = parts[1].trim().toUpperCase();
    const year = parts[2].trim();
    const name = parts[3].trim();
    const count = parseInt(parts[4].trim(), 10);
    
    if (!name || !gender || isNaN(count)) return null;
    if (gender !== 'M' && gender !== 'F') return null;
    
    return { name, gender, count };
}

/**
 * Load all names from yob files
 */
function loadNationalNames() {
    console.log('📚 Loading national name data...');
    const nameMap = {};
    
    if (!fs.existsSync(NAMES_DIR)) {
        console.warn(`⚠️  Names directory not found: ${NAMES_DIR}`);
        return nameMap;
    }
    
    const files = fs.readdirSync(NAMES_DIR).filter(f => f.startsWith('yob') && f.endsWith('.txt'));
    console.log(`   Found ${files.length} year files`);
    
    for (const file of files) {
        // Extract year from filename (e.g., yob2024.txt -> 2024)
        const yearMatch = file.match(/yob(\d{4})\.txt/);
        const year = yearMatch ? yearMatch[1] : null;
        if (!year) continue;
        
        const filePath = path.join(NAMES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
            const parsed = parseNameLine(line);
            if (!parsed) continue;
            
            const nameLower = parsed.name.toLowerCase();
            if (!nameMap[nameLower]) {
                nameMap[nameLower] = { 
                    name: parsed.name, 
                    male: 0, 
                    female: 0, 
                    total: 0,
                    years: { male: {}, female: {} } // Track year-by-year data
                };
            }
            
            if (parsed.gender === 'M') {
                nameMap[nameLower].male += parsed.count;
                nameMap[nameLower].years.male[year] = (nameMap[nameLower].years.male[year] || 0) + parsed.count;
            } else if (parsed.gender === 'F') {
                nameMap[nameLower].female += parsed.count;
                nameMap[nameLower].years.female[year] = (nameMap[nameLower].years.female[year] || 0) + parsed.count;
            }
            
            nameMap[nameLower].total += parsed.count;
        }
    }
    
    console.log(`   Processed ${Object.keys(nameMap).length} unique names`);
    return nameMap;
}

/**
 * Load all names from state files
 */
function loadStateNames() {
    console.log('🗺️  Loading state name data...');
    const nameMap = {};
    
    if (!fs.existsSync(STATE_NAMES_DIR)) {
        console.warn(`⚠️  State names directory not found: ${STATE_NAMES_DIR}`);
        return nameMap;
    }
    
    const files = fs.readdirSync(STATE_NAMES_DIR).filter(f => f.endsWith('.TXT'));
    console.log(`   Found ${files.length} state files`);
    
    for (const file of files) {
        const filePath = path.join(STATE_NAMES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
            const parsed = parseStateLine(line);
            if (!parsed) continue;
            
            const nameLower = parsed.name.toLowerCase();
            if (!nameMap[nameLower]) {
                nameMap[nameLower] = { 
                    name: parsed.name, 
                    male: 0, 
                    female: 0, 
                    total: 0,
                    years: { male: {}, female: {} }
                };
            }
            
            const year = parsed.year || 'unknown';
            if (parsed.gender === 'M') {
                nameMap[nameLower].male += parsed.count;
                nameMap[nameLower].years.male[year] = (nameMap[nameLower].years.male[year] || 0) + parsed.count;
            } else if (parsed.gender === 'F') {
                nameMap[nameLower].female += parsed.count;
                nameMap[nameLower].years.female[year] = (nameMap[nameLower].years.female[year] || 0) + parsed.count;
            }
            
            nameMap[nameLower].total += parsed.count;
        }
    }
    
    console.log(`   Processed ${Object.keys(nameMap).length} unique names`);
    return nameMap;
}

/**
 * Load all names from territory files
 */
function loadTerritoryNames() {
    console.log('🌎 Loading territory name data...');
    const nameMap = {};
    
    if (!fs.existsSync(TERRITORY_NAMES_DIR)) {
        console.warn(`⚠️  Territory names directory not found: ${TERRITORY_NAMES_DIR}`);
        return nameMap;
    }
    
    const files = fs.readdirSync(TERRITORY_NAMES_DIR).filter(f => f.endsWith('.TXT'));
    console.log(`   Found ${files.length} territory files`);
    
    for (const file of files) {
        const filePath = path.join(TERRITORY_NAMES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
            const parsed = parseStateLine(line);
            if (!parsed) continue;
            
            const nameLower = parsed.name.toLowerCase();
            if (!nameMap[nameLower]) {
                nameMap[nameLower] = { 
                    name: parsed.name, 
                    male: 0, 
                    female: 0, 
                    total: 0,
                    years: { male: {}, female: {} }
                };
            }
            
            const year = parsed.year || 'unknown';
            if (parsed.gender === 'M') {
                nameMap[nameLower].male += parsed.count;
                nameMap[nameLower].years.male[year] = (nameMap[nameLower].years.male[year] || 0) + parsed.count;
            } else if (parsed.gender === 'F') {
                nameMap[nameLower].female += parsed.count;
                nameMap[nameLower].years.female[year] = (nameMap[nameLower].years.female[year] || 0) + parsed.count;
            }
            
            nameMap[nameLower].total += parsed.count;
        }
    }
    
    console.log(`   Processed ${Object.keys(nameMap).length} unique names`);
    return nameMap;
}

/**
 * Merge name maps, combining counts and year data
 */
function mergeNameMaps(...maps) {
    const merged = {};
    
    for (const nameMap of maps) {
        for (const [nameLower, data] of Object.entries(nameMap)) {
            if (!merged[nameLower]) {
                merged[nameLower] = { 
                    name: data.name, 
                    male: 0, 
                    female: 0, 
                    total: 0,
                    years: { male: {}, female: {} }
                };
            }
            merged[nameLower].male += data.male;
            merged[nameLower].female += data.female;
            merged[nameLower].total += data.total;
            
            // Merge year data
            if (data.years) {
                if (data.years.male) {
                    for (const [year, count] of Object.entries(data.years.male)) {
                        merged[nameLower].years.male[year] = (merged[nameLower].years.male[year] || 0) + count;
                    }
                }
                if (data.years.female) {
                    for (const [year, count] of Object.entries(data.years.female)) {
                        merged[nameLower].years.female[year] = (merged[nameLower].years.female[year] || 0) + count;
                    }
                }
            }
        }
    }
    
    return merged;
}

/**
 * Identify non-binary names based on gender split ratio
 */
function identifyNonBinaryNames(nameMap) {
    console.log('🔍 Identifying non-binary names...');
    const nonBinaryNames = [];
    
    for (const [nameLower, data] of Object.entries(nameMap)) {
        // Must appear in both genders
        if (data.male === 0 || data.female === 0) continue;
        
        // Calculate ratio (min/max)
        const ratio = Math.min(data.male, data.female) / Math.max(data.male, data.female);
        
        // Check if it's a curated name
        const isCurated = CURATED_NEUTRAL_NAMES.includes(nameLower);
        
        // Determine if it should be included
        const shouldInclude = isCurated
            ? data.total >= 50  // Curated names: minimum 50 total uses
            : (ratio >= MIN_RATIO && data.total >= MIN_TOTAL_COUNT);  // Statistical: 30-70 split or better, min 100 uses
        
        if (shouldInclude) {
            const malePercent = ((data.male / data.total) * 100).toFixed(1);
            const femalePercent = ((data.female / data.total) * 100).toFixed(1);
            
            // Combine year data for both genders (for decade popularity calculations)
            const combinedYears = {};
            if (data.years) {
                // Combine male and female year data
                const allYears = new Set([
                    ...Object.keys(data.years.male || {}),
                    ...Object.keys(data.years.female || {})
                ]);
                
                for (const year of allYears) {
                    const maleCount = data.years.male[year] || 0;
                    const femaleCount = data.years.female[year] || 0;
                    combinedYears[year] = maleCount + femaleCount;
                }
            }
            
            nonBinaryNames.push({
                name: data.name,
                nameLower: nameLower,
                male: data.male,
                female: data.female,
                total: data.total,
                ratio: parseFloat(ratio.toFixed(4)),
                malePercent: parseFloat(malePercent),
                femalePercent: parseFloat(femalePercent),
                isCurated: isCurated,
                years: combinedYears // Year-by-year data for decade popularity
            });
        }
    }
    
    // Sort by: curated first, then by total popularity, then by gender balance
    nonBinaryNames.sort((a, b) => {
        if (a.isCurated !== b.isCurated) {
            return a.isCurated ? -1 : 1;
        }
        if (b.total !== a.total) {
            return b.total - a.total;
        }
        return b.ratio - a.ratio;
    });
    
    console.log(`   Found ${nonBinaryNames.length} non-binary names`);
    console.log(`   - ${nonBinaryNames.filter(n => n.isCurated).length} curated names`);
    console.log(`   - ${nonBinaryNames.filter(n => !n.isCurated).length} statistical matches`);
    
    return nonBinaryNames;
}

/**
 * Main function
 */
function main() {
    console.log('🚀 Starting non-binary name identification...\n');
    
    // Load all name data
    const nationalNames = loadNationalNames();
    const stateNames = loadStateNames();
    const territoryNames = loadTerritoryNames();
    
    // Merge all name data
    console.log('\n🔄 Merging name data from all sources...');
    const allNames = mergeNameMaps(nationalNames, stateNames, territoryNames);
    console.log(`   Total unique names: ${Object.keys(allNames).length}`);
    
    // Identify non-binary names
    console.log('\n');
    const nonBinaryNames = identifyNonBinaryNames(allNames);
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save results
    const output = {
        metadata: {
            generatedAt: new Date().toISOString(),
            minRatio: MIN_RATIO,
            minTotalCount: MIN_TOTAL_COUNT,
            totalNamesAnalyzed: Object.keys(allNames).length,
            totalNonBinaryNames: nonBinaryNames.length
        },
        names: nonBinaryNames
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`\n✅ Results saved to: ${OUTPUT_FILE}`);
    
    // Print some examples
    console.log('\n📋 Top 20 non-binary names:');
    nonBinaryNames.slice(0, 20).forEach((nb, index) => {
        console.log(`   ${index + 1}. ${nb.name.padEnd(15)} (M: ${nb.malePercent}%, F: ${nb.femalePercent}%, Total: ${nb.total.toLocaleString()}) ${nb.isCurated ? '[Curated]' : ''}`);
    });
    
    console.log('\n✨ Done!');
}

// Run the script
main();

