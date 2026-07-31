/**
 * Builds data/training-data.json from the submissions stored as GitHub issues.
 *
 * Run by .github/workflows/train-model.yml immediately before train-model.js.
 *
 * Issues are never closed. data/training-data.json is gitignored and never
 * committed, so the issues are the only durable copy of the dataset -- every
 * run rebuilds it from scratch, which means a failed run cannot destroy data.
 * If the open-issue count ever becomes unwieldy, add a 'processed' label rather
 * than closing them.
 */

const fs = require('fs');
const path = require('path');
const { parseIssueBody, isUsableExample, dedupe } = require('./lib/training-data');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'training-data.json');
const ISSUES_PER_PAGE = 100;

async function fetchTrainingIssues({ owner, repo, token }) {
    const issues = [];

    for (let page = 1; ; page++) {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues` +
            `?labels=training-data&state=open&per_page=${ISSUES_PER_PAGE}&page=${page}`,
            {
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    ...(token ? { Authorization: `token ${token}` } : {})
                }
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub returned ${response.status} listing issues`);
        }

        const batch = await response.json();
        if (batch.length === 0) return issues;

        // The issues endpoint returns pull requests too.
        issues.push(...batch.filter(issue => !issue.pull_request));

        const link = response.headers.get('link');
        if (!link || !link.includes('rel="next"')) return issues;
    }
}

function toSubmissions(issues, key) {
    const submissions = [];
    let encrypted = 0;
    let plaintext = 0;
    let unreadable = 0;

    for (const issue of issues) {
        const looksEncrypted = typeof issue.body === 'string' && issue.body.includes('AES-256-GCM');
        try {
            const submission = parseIssueBody(issue.body, key);
            if (!submission) continue;

            submissions.push(submission);
            if (looksEncrypted) encrypted++;
            else plaintext++;
        } catch (error) {
            unreadable++;
            console.warn(`Issue #${issue.number} unreadable: ${error.message}`);
        }
    }

    return { submissions, encrypted, plaintext, unreadable };
}

async function main() {
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'char-lotte-anne/guess-my-name').split('/');
    const token = process.env.GITHUB_TOKEN;
    const key = process.env.TRAINING_DATA_KEY;

    if (!key) {
        console.warn('TRAINING_DATA_KEY is not set: encrypted submissions will be counted as unreadable.');
    }

    const issues = await fetchTrainingIssues({ owner, repo, token });
    const { submissions, encrypted, plaintext, unreadable } = toSubmissions(issues, key);

    console.log(`${issues.length} issues -> ${submissions.length} submissions ` +
        `(${encrypted} encrypted, ${plaintext} plaintext, ${unreadable} unreadable)`);

    const usable = dedupe(submissions).filter(isUsableExample);
    console.log(`${usable.length} usable for training`);

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(usable, null, 2));

    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `count=${usable.length}\n`);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('Collection failed:', error);
        process.exit(1);
    });
}

module.exports = { fetchTrainingIssues, toSubmissions };
