/**
 * Vercel Serverless Function to create GitHub Issues
 * This function authenticates with GitHub and creates issues on behalf of the client
 * 
 * Environment variables required:
 * - GITHUB_TOKEN: GitHub Personal Access Token with 'repo' scope
 * - GITHUB_USERNAME: GitHub username (defaults to 'char-lotte-anne')
 * - REPO_NAME: Repository name (defaults to 'guess-my-name')
 */

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

  // Get request body
  const { title, body, labels } = req.body;

  // Validate required fields
  if (!title || !body) {
    return res.status(400).json({ 
      error: 'Bad request',
      message: 'Title and body are required'
    });
  }

  try {
    console.log(`Creating GitHub issue in ${GITHUB_USERNAME}/${REPO_NAME}: ${title}`);

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
          title,
          body,
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

