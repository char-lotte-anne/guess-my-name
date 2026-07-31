/**
 * Vercel Serverless Function to create GitHub Issues
 * This function authenticates with GitHub and creates issues on behalf of the client
 *
 * Environment variables required:
 * - GITHUB_TOKEN: GitHub Personal Access Token with 'repo' scope
 * - GITHUB_USERNAME: GitHub username (defaults to 'char-lotte-anne')
 * - REPO_NAME: Repository name (defaults to 'guess-my-name')
 * - TRAINING_DATA_KEY: 64-character hex string (32 bytes) used to encrypt
 *   training payloads before they are posted to public issues.
 *   Generate with: openssl rand -hex 32
 *   The SAME value must be stored as a GitHub Actions secret named
 *   TRAINING_DATA_KEY so the training workflow can decrypt.
 *
 * IMPORTANT: if this key is lost, every previously submitted issue becomes
 * permanently unreadable. Back it up somewhere durable.
 */

import crypto from 'crypto';

/**
 * Encrypt a UTF-8 string with AES-256-GCM.
 * Returns a self-describing envelope safe to publish in a public issue.
 *
 * NOTE: this helper is intentionally duplicated in
 * scripts/collect-training-data.js. The API runs as an ESM Vercel function and
 * the scripts run as CommonJS, so sharing one module across both would mean
 * fighting the bundler for 20 lines of code. If you change the envelope
 * format here, change it there too.
 */
function encryptPayload(plaintext, keyHex) {
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('TRAINING_DATA_KEY must be 64 hex characters (32 bytes)');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  return {
    v: 1,
    alg: 'AES-256-GCM',
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: ciphertext.toString('base64')
  };
}

/**
 * Pull the training JSON out of a legacy body built by an older client.
 * Older cached copies of script.js POST a fully-formed markdown body with a
 * ```json fence; newer ones POST { trainingData } directly.
 */
function extractLegacyPayload(body) {
  const match = typeof body === 'string' && body.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  // Get environment variables
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'char-lotte-anne';
  const REPO_NAME = process.env.REPO_NAME || 'guess-my-name';

  // Check if GitHub token is configured
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN environment variable is not set');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.'
    });
  }

  // Encryption key. Fail closed: if it is missing we refuse to post rather
  // than silently publishing user names in plaintext to a public repo.
  const TRAINING_DATA_KEY = process.env.TRAINING_DATA_KEY;
  if (!TRAINING_DATA_KEY) {
    console.error('TRAINING_DATA_KEY environment variable is not set');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Encryption key not configured. Refusing to publish training data unencrypted.'
    });
  }

  // Get request body. Newer clients send { trainingData }; older cached
  // clients send a pre-rendered { body } containing a ```json fence.
  const { title, body, labels, trainingData } = req.body || {};

  const payload = trainingData || extractLegacyPayload(body);

  if (!payload) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'A trainingData object (or a legacy body containing a json block) is required'
    });
  }

  try {
    // Titles stay deliberately generic. The old format leaked the outcome
    // ("Success" / "Failure" / "Name Only") in the clear, which is signal
    // about the person even when the body is encrypted.
    const issueTitle = `Training Data - ${new Date().toISOString()}`;

    const envelope = encryptPayload(JSON.stringify(payload), TRAINING_DATA_KEY);
    const issueBody = [
      '<!-- Encrypted training data for global model -->',
      '',
      'This payload is encrypted with AES-256-GCM. It can only be read by the',
      'training workflow, which holds the key. See PRIVACY_EXPLAINED.md.',
      '',
      '```json',
      JSON.stringify(envelope, null, 2),
      '```'
    ].join('\n');

    console.log(`Creating GitHub issue in ${GITHUB_USERNAME}/${REPO_NAME}: ${issueTitle}`);

    // Create GitHub issue
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'guess-my-name-app/1.0'
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: labels || ['training-data', 'auto-generated']
        })
      }
    );

    // Parse response
    const responseText = await response.text();
    
    if (!response.ok) {
      // Try to parse error message
      let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        errorMessage += ` - ${responseText}`;
      }
      
      console.error('GitHub API error:', errorMessage);
      return res.status(response.status).json({ 
        error: 'GitHub API error',
        message: errorMessage,
        status: response.status
      });
    }

    // Parse successful response
    const issue = JSON.parse(responseText);
    console.log(`✅ Successfully created issue #${issue.number}: ${issue.html_url}`);

    return res.status(200).json({ 
      success: true, 
      issue: {
        number: issue.number,
        url: issue.html_url,
        title: issue.title
      }
    });

  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

