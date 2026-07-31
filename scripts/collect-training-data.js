/**
 * Collect training data from various sources
 * This script aggregates training data for model training
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Decrypt an AES-256-GCM envelope produced by api/create-issue.js.
 *
 * NOTE: the matching encrypt() lives in api/create-issue.js. That file is an
 * ESM Vercel function and this one is CommonJS, so the pair is duplicated
 * rather than shared. Change both together.
 */
function decryptPayload(envelope, keyHex) {
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
        throw new Error('TRAINING_DATA_KEY must be 64 hex characters (32 bytes)');
    }

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        key,
        Buffer.from(envelope.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));

    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(envelope.data, 'base64')),
        decipher.final()
    ]).toString('utf8');

    return JSON.parse(plaintext);
}

/**
 * Turn one issue body into a training record.
 *
 * Handles both formats:
 *   - encrypted envelopes ({ v, alg: 'AES-256-GCM', iv, tag, data })
 *   - legacy plaintext payloads posted before encryption was added
 *
 * Returns null if the body holds nothing usable.
 */
function parseIssueBody(body, keyHex) {
    const match = typeof body === 'string' && body.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match) return null;

    const parsed = JSON.parse(match[1]);

    if (parsed && parsed.alg === 'AES-256-GCM') {
        if (!keyHex) {
            throw new Error('issue is encrypted but TRAINING_DATA_KEY is not set');
        }
        return decryptPayload(parsed, keyHex);
    }

    // Legacy plaintext issue (everything submitted before encryption landed).
    return parsed;
}

// Make fetch available in Node.js (Node 18+ has it built-in, but for compatibility)
if (typeof fetch === 'undefined') {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        // Node 18+ has fetch built-in, so this is fine
        console.log('Using built-in fetch');
    }
}

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const trainingDataFile = path.join(dataDir, 'training-data.json');

// Initialize empty array if file doesn't exist
if (!fs.existsSync(trainingDataFile)) {
    fs.writeFileSync(trainingDataFile, JSON.stringify([], null, 2));
    console.log('Created empty training data file');
}

/**
 * Collect data from GitHub Issues (created by frontend)
 * Uses GitHub Issues API to fetch training data submitted by users
 */
async function collectFromGitHubIssues() {
    const GITHUB_USERNAME = process.env.GITHUB_REPOSITORY_OWNER || 'char-lotte-anne';
    const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'guess-my-name';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Automatically provided by GitHub Actions
    const TRAINING_DATA_KEY = process.env.TRAINING_DATA_KEY;

    const trainingDataFromIssues = [];
    let encryptedCount = 0;
    let legacyCount = 0;
    let failedCount = 0;

    if (!TRAINING_DATA_KEY) {
        console.warn('⚠️  TRAINING_DATA_KEY is not set. Encrypted issues will be skipped.');
    }
    
    try {
        console.log('📥 Collecting training data from GitHub Issues...');
        
        // Fetch all open issues with 'training-data' label
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/issues?labels=training-data&state=open&per_page=100&page=${page}`,
                {
                    headers: GITHUB_TOKEN ? {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    } : {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (!response.ok) {
                console.warn('Could not fetch GitHub Issues:', response.status);
                break;
            }
            
            const issues = await response.json();
            
            if (issues.length === 0) {
                hasMore = false;
                break;
            }
            
            // Parse training data from issue bodies
            for (const issue of issues) {
                // Pull requests also come back from the issues endpoint. Skip them.
                if (issue.pull_request) continue;

                try {
                    const wasEncrypted = typeof issue.body === 'string'
                        && issue.body.includes('AES-256-GCM');

                    const data = parseIssueBody(issue.body, TRAINING_DATA_KEY);
                    if (!data) continue;

                    if (wasEncrypted) encryptedCount++;
                    else legacyCount++;

                    trainingDataFromIssues.push({
                        ...data,
                        issueNumber: issue.number,
                        issueId: issue.id
                    });
                } catch (error) {
                    failedCount++;
                    console.warn(`Could not parse issue #${issue.number}:`, error.message);
                }
            }
            
            // Check if there are more pages
            const linkHeader = response.headers.get('link');
            hasMore = linkHeader && linkHeader.includes('rel="next"');
            page++;
        }
        
        console.log(`📊 Collected ${trainingDataFromIssues.length} training examples from GitHub Issues`);
        console.log(`   ${encryptedCount} encrypted, ${legacyCount} legacy plaintext, ${failedCount} unreadable`);

        // Issues are intentionally NOT closed.
        //
        // They are the durable source of truth for the dataset: data/training-data.json
        // is gitignored and never committed, so anything we drop here is gone
        // forever. Leaving issues open means every run rebuilds the full dataset
        // from scratch and a failed run can never destroy data.
        //
        // If the open-issue count becomes unwieldy, add a 'processed' label
        // rather than closing them.

    } catch (error) {
        console.warn('Error collecting from GitHub Issues:', error.message);
    }

    return trainingDataFromIssues;
}

/**
 * Hash answers for duplicate detection
 */
function hashAnswers(answers) {
    return JSON.stringify(answers);
}

/**
 * Main collection function
 */
async function main() {
    // Load existing training data from file
    let trainingData = [];
    try {
        if (fs.existsSync(trainingDataFile)) {
            const fileContent = fs.readFileSync(trainingDataFile, 'utf8');
            trainingData = JSON.parse(fileContent);
            console.log(`📁 Loaded ${trainingData.length} existing training examples from file`);
        } else {
            console.log('📁 No existing training data file found, starting fresh');
        }
    } catch (error) {
        console.error('Error loading training data:', error);
        trainingData = [];
    }
    
    // Collect data from GitHub Issues
    const githubData = await collectFromGitHubIssues();
    trainingData.push(...githubData);
    
    // Remove duplicates based on timestamp and answers hash
    const seen = new Set();
    const uniqueData = trainingData.filter(item => {
        const key = `${item.timestamp}_${hashAnswers(item.answers)}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    if (uniqueData.length !== trainingData.length) {
        console.log(`🧹 Removed ${trainingData.length - uniqueData.length} duplicate entries`);
        trainingData = uniqueData;
    }

    // Filter out entries we cannot learn anything from.
    //
    // An example is usable when we know the quiz answers AND the name they
    // should map to. That label comes from either:
    //   - realName, which the user typed in themselves, or
    //   - correctGuess.name, on a confirmed-correct guess.
    //
    // The previous version required `success` to be strictly true or false,
    // which silently discarded every "Name Only" submission -- half the
    // dataset, and the half with the cleanest labels.
    //
    // Failures without a realName are kept out of training here (they carry
    // only negative information, which a softmax classifier cannot consume
    // directly) but the success flag and rejected guesses ride along on every
    // record that does qualify, so nothing is thrown away.
    const validData = trainingData
        .filter(item => {
            const hasLabel = item.realName || (item.correctGuess && item.correctGuess.name);
            return item.answers && item.timestamp && hasLabel;
        })
        .map(item => {
            // Remove issue tracking fields before saving
            const { issueNumber, issueId, ...cleanData } = item;
            return cleanData;
        });

    if (validData.length !== trainingData.length) {
        console.log(`🧹 Removed ${trainingData.length - validData.length} invalid entries`);
        trainingData = validData;
    }

    // Save cleaned data
    fs.writeFileSync(trainingDataFile, JSON.stringify(trainingData, null, 2));
    console.log(`✅ Final training data: ${trainingData.length} examples`);

    // Output for GitHub Actions (using GITHUB_OUTPUT file)
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
        fs.appendFileSync(githubOutput, `count=${trainingData.length}\n`);
        fs.appendFileSync(githubOutput, `file=${trainingDataFile}\n`);
    }

    // Exit with warning if no training data
    if (trainingData.length < 10) {
        console.warn('⚠️  Warning: Less than 10 training examples. Model training may not be effective.');
        console.warn('Consider collecting more feedback data before training.');
    }
}

// Run main function
main().catch(error => {
    console.error('❌ Error in data collection:', error);
    process.exit(1);
});
