/**
 * Collect training data from various sources
 * This script aggregates training data for model training
 */

const fs = require('fs');
const path = require('path');

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
    
    const trainingDataFromIssues = [];
    
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
                try {
                    // Extract JSON from code block in issue body
                    const jsonMatch = issue.body.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch) {
                        const data = JSON.parse(jsonMatch[1]);
                        trainingDataFromIssues.push({
                            ...data,
                            issueNumber: issue.number, // Track for closing later
                            issueId: issue.id
                        });
                    }
                } catch (error) {
                    console.warn(`Could not parse issue #${issue.number}:`, error.message);
                }
            }
            
            // Check if there are more pages
            const linkHeader = response.headers.get('link');
            hasMore = linkHeader && linkHeader.includes('rel="next"');
            page++;
        }
        
        console.log(`📊 Collected ${trainingDataFromIssues.length} training examples from GitHub Issues`);
        
        // Close processed issues (if we have a token)
        if (GITHUB_TOKEN && trainingDataFromIssues.length > 0) {
            console.log('🔒 Closing processed issues...');
            const uniqueIssueIds = [...new Set(trainingDataFromIssues.map(d => d.issueNumber))];
            
            for (const issueNumber of uniqueIssueIds) {
                try {
                    await fetch(
                        `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/issues/${issueNumber}`,
                        {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `token ${GITHUB_TOKEN}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                state: 'closed',
                                state_reason: 'completed'
                            })
                        }
                    );
                } catch (error) {
                    console.warn(`Could not close issue #${issueNumber}:`, error.message);
                }
            }
            console.log(`✅ Closed ${uniqueIssueIds.length} processed issues`);
        }
        
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

    // Filter out invalid entries and remove issue tracking fields
    const validData = trainingData
        .filter(item => {
            return item.answers && 
                   (item.success === true || item.success === false) &&
                   item.timestamp &&
                   (item.correctGuess || item.guesses);
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
