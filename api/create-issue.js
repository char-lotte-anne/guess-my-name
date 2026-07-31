/**
 * Stores one training submission as a GitHub issue.
 *
 * Exists because the browser cannot hold a GitHub token. The payload is
 * encrypted here rather than in the browser so the key never ships to clients.
 *
 * Environment:
 *   GITHUB_TOKEN       - PAT with 'repo' scope
 *   TRAINING_DATA_KEY  - 64 hex chars; must match the Actions secret of the
 *                        same name, or the training workflow cannot decrypt
 *   GITHUB_USERNAME, REPO_NAME - optional overrides
 */

const { encryptPayload } = require('../scripts/lib/training-crypto.js');

/**
 * Older cached copies of script.js POST a pre-rendered markdown body instead of
 * a payload object. Recover the payload so those submissions still land.
 */
function extractLegacyPayload(body) {
  const match = typeof body === 'string' && body.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// CommonJS, matching the rest of the repo. The root package.json has no
// "type": "module", so ESM syntax here would fail to load.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'char-lotte-anne';
  const REPO_NAME = process.env.REPO_NAME || 'guess-my-name';
  const TRAINING_DATA_KEY = process.env.TRAINING_DATA_KEY;

  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Fail closed. Without a key the only alternative is publishing names in
  // plaintext to a public repository, which is worse than dropping the data.
  if (!TRAINING_DATA_KEY) {
    console.error('TRAINING_DATA_KEY is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const { body, labels, trainingData } = req.body || {};
  const payload = trainingData || extractLegacyPayload(body);

  if (!payload) {
    return res.status(400).json({ error: 'trainingData is required' });
  }

  try {
    // The title is deliberately uninformative. The old format put the outcome
    // ("Success" / "Failure" / "Name Only") in the title, which leaks something
    // about the person even when the body is encrypted.
    const title = `Training Data - ${new Date().toISOString()}`;
    const envelope = encryptPayload(JSON.stringify(payload), TRAINING_DATA_KEY);

    const issueBody = [
      '<!-- Encrypted training data. See PRIVACY_EXPLAINED.md. -->',
      '',
      '```json',
      JSON.stringify(envelope, null, 2),
      '```'
    ].join('\n');

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'guess-my-name-app/1.0'
        },
        body: JSON.stringify({
          title,
          body: issueBody,
          labels: labels || ['training-data', 'auto-generated']
        })
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(`GitHub API error ${response.status}: ${text}`);
      return res.status(response.status).json({ error: 'Could not store submission' });
    }

    const issue = JSON.parse(text);
    return res.status(200).json({ success: true, issue: { number: issue.number } });
  } catch (error) {
    console.error('Error creating issue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
